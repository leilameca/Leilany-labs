import { spawn } from "node:child_process";
import { writeFile, mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";

const profile = await mkdtemp(path.join(tmpdir(), "leilany-lab-qa-"));
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
  const report = [];
  const checks = [];
  async function screenshot(name, full = false) {
    const metrics = await send("Page.getLayoutMetrics");
    const options = full ? { captureBeyondViewport: true, clip: { x: 0, y: 0, width: metrics.cssLayoutViewport.clientWidth, height: metrics.cssContentSize.height, scale: 1 } } : {};
    const shot = await send("Page.captureScreenshot", { format: "png", ...options });
    await writeFile("qa/" + name + ".png", Buffer.from(shot.data, "base64"));
  }
  async function key(key, code, value, char) {
    await send("Input.dispatchKeyEvent", { type: "keyDown", key, code, windowsVirtualKeyCode: value });
    if (char) await send("Input.dispatchKeyEvent", { type: "char", text: char, unmodifiedText: char, key, code, windowsVirtualKeyCode: value });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: value });
    await delay(70);
  }
  async function click(expression) { await evaluate(expression + ".click()"); await delay(80); }
  async function assert(name, expression) {
    const passed = await evaluate(expression);
    checks.push({ name, passed });
    if (!passed) throw new Error("Failed: " + name);
  }
  for (const [width, height] of [[1440, 900], [1024, 900], [390, 844]]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
    await send("Page.navigate", { url: "http://localhost:3000/lab" });
    await delay(900);
    await evaluate("document.fonts.ready");
    const state = await evaluate(`(() => ({
      width: innerWidth,
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
      overflowingText: [...document.querySelectorAll('h1,h2,h3,p,input')].filter(el => {
        const r=el.getBoundingClientRect(); return r.width > 0 && (r.left < -1 || r.right > innerWidth+1);
      }).map(el => el.textContent),
      tools: document.querySelectorAll('[data-tool]').length,
      brokenAnchors: [...document.querySelectorAll('a[href^="#"]')].filter(a => !document.getElementById(a.hash.slice(1))).map(a => a.hash),
    }))()`);
    report.push(state);
    await screenshot("lab-" + width + "-viewport");
    await screenshot("lab-" + width + "-full", true);
    await evaluate("document.querySelector('[data-tool] button').focus()");
    await key("Enter", "Enter", 13, "\r");
    await assert("keyboard opens preview at " + width, "document.querySelector('dialog').open");
    await assert("modal contains focus at " + width, "document.querySelector('dialog').contains(document.activeElement)");
    await screenshot("lab-" + width + "-preview");
    if (width === 390) {
      for (let i = 1; i < 10; i++) {
        await click("document.querySelector('dialog button[type=button]')");
        await assert("mobile preview " + i + " fits", "document.querySelector('dialog').scrollWidth <= document.querySelector('dialog').clientWidth");
        await screenshot("lab-390-preview-" + i);
      }
    }
    await key("Escape", "Escape", 27);
    await assert("Escape closes preview at " + width, "!document.querySelector('dialog').open");
    await assert("focus restored at " + width, "document.activeElement === document.querySelector('[data-tool] button')");
    await click("document.querySelectorAll('[aria-pressed]')[1]");
    await assert("energy filter at " + width, "document.querySelectorAll('[data-tool]').length === 3");
    await click("document.querySelectorAll('[aria-pressed]')[2]");
    await assert("spaces filter at " + width, "document.querySelectorAll('[data-tool]').length === 4");
    await click("document.querySelectorAll('[aria-pressed]')[3]");
    await assert("work filter at " + width, "document.querySelectorAll('[data-tool]').length === 3");
    await click("document.querySelectorAll('[aria-pressed]')[0]");
    await evaluate("document.querySelector('#tool-search').focus()");
    await send("Input.insertText", { text: "sunlight" });
    await delay(80);
    await assert("search matches problem at " + width, "document.querySelectorAll('[data-tool]').length === 1 && document.querySelector('[data-tool]').dataset.tool === 'solarcalc'");
    await screenshot("lab-" + width + "-search");
    await click("document.querySelector('#tool-search').parentElement.querySelector('button')");
    await send("Input.insertText", { text: "no-such-tool" });
    await delay(80);
    await assert("no results at " + width, "document.querySelectorAll('[data-tool]').length === 0 && document.querySelector('[role=status]').textContent.includes('0 experiments')");
    await screenshot("lab-" + width + "-empty");
    await click("[...document.querySelectorAll('button')].find(b => b.textContent === 'Show all experiments')");
    await assert("reset restores collection at " + width, "document.querySelectorAll('[data-tool]').length === 10 && document.activeElement.id === 'tool-search'");
  }
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await assert("reduced motion", "getComputedStyle(document.querySelector('.sun-disc')).transitionDuration === '0s'");
  for (const [width,height] of [[1440,900],[390,844]]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
    await send("Page.navigate", { url: "http://localhost:3000" });
    await delay(700);
    await screenshot("home-after-lab-" + width, true);
    await assert("Home CTA reaches Lab at " + width, "document.querySelector('.primary-link').getAttribute('href') === '/lab'");
  }
  const result = { report, checks, errors };
  await writeFile("qa/lab-review.json", JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  await send("Browser.close");
  if (errors.length || report.some(r => r.horizontalOverflow || r.overflowingText.length || r.brokenAnchors.length || r.tools !== 10)) process.exitCode = 1;
} finally {
  socket?.close();
  chrome.kill();
  await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
}
