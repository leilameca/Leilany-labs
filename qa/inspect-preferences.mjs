import { spawn } from "node:child_process";
import { writeFile, mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";

const profile = await mkdtemp(path.join(tmpdir(), "leilany-solar-qa-"));
const chrome = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe", [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
  "--remote-debugging-port=9340",
  "--disable-component-update", "--disable-background-networking",
  `--user-data-dir=${profile}`,
  "about:blank",
], { windowsHide: true, stdio: "ignore" });
let socket;
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
try {
  let tabs;
  for (let attempt = 0; attempt < 40; attempt++) {
    try { tabs = await (await fetch("http://127.0.0.1:9340/json")).json(); break; }
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

  const pages = ["/", "/lab", "/lab/solarcalc", "/lab/electricity-consumption"];
  for (const width of [1440,390]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height:900, deviceScaleFactor:1, mobile:false });
    for (const url of pages) {
      await send("Page.navigate", { url:"http://localhost:3000"+url });
      await delay(900);
      if (await evaluate("document.documentElement.lang !== 'es'")) await evaluate("document.querySelector('.preference-controls button').click()");
      if (await evaluate("document.documentElement.dataset.theme !== 'dark'")) await evaluate("document.querySelectorAll('.preference-controls button')[1].click()");
      await delay(150);
      await assert("Spanish dark "+url+" "+width, "document.documentElement.lang === 'es' && document.documentElement.dataset.theme === 'dark'");
      await assert("no overflow "+url+" "+width, "document.documentElement.scrollWidth <= innerWidth");
      await screenshot("preferences-"+(url.split("/").pop() || "home")+"-"+width, true);
      if(url.includes("solarcalc")) {
        await evaluate("document.querySelector('button[type=submit]').click()");
        await delay(100);
        await assert("translated result", "document.getElementById('results-title').textContent.includes('números')");
        for(let i=0;i<60;i++){ if(await evaluate("document.querySelector('#locationCountry option[value=DO]') !== null"))break; await delay(250); }
        await setValue("countrySearch","rep");
        await assert("country prefix filtering","[...document.querySelectorAll('#locationCountry option')].filter(o=>o.value).length > 0 && [...document.querySelectorAll('#locationCountry option')].filter(o=>o.value).every(o=>o.textContent.normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase().startsWith('rep'))");
        await evaluate("document.getElementById('locationCountry').value='DO';document.getElementById('locationCountry').dispatchEvent(new Event('change',{bubbles:true}))");
        await assert("country selection clears search","document.getElementById('countrySearch').value === ''");
        await setValue("consumption","1200");
        await evaluate("document.querySelector('.preference-controls button').click()");
        await assert("language keeps form data","document.getElementById('consumption').value === '1200' && document.documentElement.lang === 'en'");
        await evaluate("document.querySelector('.preference-controls button').click()");
      }
    }
  }
  await send("Page.reload");
  await delay(800);
  await assert("preferences persist","document.documentElement.lang === 'es' && document.documentElement.dataset.theme === 'dark'");
  const result = { checks, errors };
  await writeFile("qa/preferences-review.json", JSON.stringify(result,null,2));
  console.log(JSON.stringify(result,null,2));
  await send("Browser.close");
  if(errors.length) process.exitCode=1;
} finally {
 socket?.close(); chrome.kill();
 await rm(profile,{recursive:true,force:true,maxRetries:5,retryDelay:300});
}

