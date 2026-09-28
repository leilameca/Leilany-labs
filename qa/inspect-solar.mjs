import { spawn } from "node:child_process";
import { writeFile, mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";

const profile = await mkdtemp(path.join(tmpdir(), "leilany-solar-qa-"));
const chrome = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe", [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
  "--remote-debugging-port=9337",
  "--disable-component-update", "--disable-background-networking",
  `--user-data-dir=${profile}`,
  "about:blank",
], { windowsHide: true, stdio: "ignore" });
let socket;
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
try {
  let tabs;
  for (let attempt = 0; attempt < 40; attempt++) {
    try { tabs = await (await fetch("http://127.0.0.1:9337/json")).json(); break; }
    catch { await delay(150); }
  }
  if (!tabs) throw new Error("Chrome did not start");
  socket = new WebSocket(tabs.find(tab => tab.type === "page").webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener("open", resolve, { once: true }));
  let id = 0;
  const pending = new Map();
  const errors = [];
  socket.addEventListener("message", event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const callbacks = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) callbacks.reject(message.error);
      else callbacks.resolve(message.result);
    }
    if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails.text);
    if (message.method === "Log.entryAdded" && message.params.entry.level === "error") errors.push(message.params.entry.text + " " + message.params.entry.url);
  });
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      pending.set(++id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }
  async function evaluate(expression) {
    const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  }
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Log.enable");
  const checks = [];
  async function screenshot(name, full = false) {
    const metrics = await send("Page.getLayoutMetrics");
    const options = full ? { captureBeyondViewport: true, clip: { x: 0, y: 0, width: metrics.cssLayoutViewport.clientWidth, height: metrics.cssContentSize.height, scale: 1 } } : {};
    const shot = await send("Page.captureScreenshot", { format: "png", ...options });
    await writeFile("qa/" + name + ".png", Buffer.from(shot.data, "base64"));
  }
  async function assert(name, expression) {
    const passed = await evaluate(expression);
    checks.push({ name, passed });
    if (!passed) throw new Error("Failed: " + name);
  }
  async function setValue(id, value) {
    await evaluate("document.getElementById(" + JSON.stringify(id) + ").focus()");
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: "a", code: "KeyA", windowsVirtualKeyCode: 65, modifiers: 2 });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key: "a", code: "KeyA", windowsVirtualKeyCode: 65, modifiers: 2 });
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Backspace", code: "Backspace", windowsVirtualKeyCode: 8 });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Backspace", code: "Backspace", windowsVirtualKeyCode: 8 });
    if (value) await send("Input.insertText", { text: value });
    await delay(100);
  }
  for (const [width,height] of [[1440,900],[1024,900],[390,844]]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
    await send("Page.navigate", { url: "http://localhost:3000/lab/solarcalc" });
    await delay(1000);
    await evaluate("document.fonts.ready");
    await assert("no overflow " + width, "document.documentElement.scrollWidth <= innerWidth");
    await assert("11 initial panels " + width, "document.querySelector('div[aria-label=\"Your estimated solar system\"] svg').querySelectorAll('[data-panel]').length === 11");
    await screenshot("solar-" + width + "-viewport");
    await screenshot("solar-" + width + "-initial", true);
    await evaluate("document.querySelector('button[type=submit]').click()");
    await delay(600);
    await assert("results revealed " + width, "document.getElementById('results-title') !== null");
    await assert("production 858 " + width, "document.querySelector('section[aria-labelledby=results-title]').textContent.includes('858')");
    await screenshot("solar-" + width + "-results", true);
    await setValue("consumption", "1500");
    await assert("panel quantity changes " + width, "document.querySelector('div[aria-label=\"Your estimated solar system\"] svg').querySelectorAll('[data-panel]').length === 18");
    await setValue("roofArea", "20");
    await assert("roof warning " + width, "document.body.textContent.includes('Your requested system has not been reduced')");
    await setValue("sunHours", "");
    await assert("invalid input pauses results " + width, "document.getElementById('sunHours').getAttribute('aria-invalid') === 'true' && document.body.textContent.includes('Estimate paused')");
    await setValue("sunHours", "5.2");
    await assert("valid input restores results " + width, "document.getElementById('sunHours').getAttribute('aria-invalid') === 'false' && document.body.textContent.includes('1,404')");
    await evaluate("[...document.querySelectorAll('summary')].find(el=>el.textContent.includes('How this estimate')).click()");
    await assert("formula opens " + width, "[...document.querySelectorAll('details')].some(el=>el.open && el.textContent.includes('Capacity target'))");
    await screenshot("solar-" + width + "-formula", true);
    await evaluate("[...document.querySelectorAll('button')].find(el=>el.textContent === 'Reset example').click()");
    await assert("reset " + width, "document.getElementById('consumption').value === '900' && !document.getElementById('results-title')");
    if (width === 1440) {
      await evaluate("[...document.querySelectorAll('button')].find(el=>el.textContent === '450 W').click()");
      await assert("panel power preset", "document.getElementById('panelWatts').value === '450'");
      for (let attempt = 0; attempt < 40; attempt++) {
        if (await evaluate("document.querySelector('#locationCountry option[value=DO]') !== null")) break;
        await delay(250);
      }
      await evaluate("document.getElementById('locationCountry').value = 'DO'; document.getElementById('locationCountry').dispatchEvent(new Event('change', { bubbles: true }))");
      for (let attempt = 0; attempt < 60; attempt++) {
        if (await evaluate("[...document.querySelectorAll('#locationCity option')].some(option => option.textContent === 'Santo Domingo')")) break;
        await delay(250);
      }
      await evaluate("const city = [...document.querySelectorAll('#locationCity option')].find(option => option.textContent === 'Santo Domingo'); document.getElementById('locationCity').value = city.value; document.getElementById('locationCity').dispatchEvent(new Event('change', { bubbles: true }))");
      await evaluate("[...document.querySelectorAll('button')].find(el=>el.textContent === 'Use location estimate').click()");
      for (let attempt = 0; attempt < 60; attempt++) {
        if (await evaluate("document.getElementById('sunHours').value === '5.5'")) break;
        await delay(250);
      }
      await assert("location solar estimate", "document.getElementById('sunHours').value === '5.5' && document.body.textContent.includes('applied for Santo Domingo')");
      await evaluate("[...document.querySelectorAll('button')].find(el=>el.textContent === 'Reset example').click()");
      await assert("location status clears on reset", "!document.body.textContent.includes('applied for Santo Domingo') && document.getElementById('sunHours').value === '5.2'");
    }
  }
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await assert("reduced motion", "getComputedStyle(document.querySelector('[data-panel] > g')).animationName === 'none'");
  const result = { checks, errors };
  await writeFile("qa/solar-review.json", JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  await send("Browser.close");
  if (errors.length) process.exitCode = 1;
} finally {
  socket?.close();
  chrome.kill();
  await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
}
