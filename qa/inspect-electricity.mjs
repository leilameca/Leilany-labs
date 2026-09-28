import { spawn } from "node:child_process";
import { writeFile, mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";

const profile = await mkdtemp(path.join(tmpdir(), "leilany-electricity-qa-"));
const chrome = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe", [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
  "--remote-debugging-port=9338", "--disable-component-update", "--disable-background-networking",
  `--user-data-dir=${profile}`, "about:blank",
], { windowsHide: true, stdio: "ignore" });
let socket;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
try {
  let tabs;
  for (let attempt = 0; attempt < 40; attempt++) {
    try { tabs = await (await fetch("http://127.0.0.1:9338/json")).json(); break; }
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
      const callback = pending.get(message.id);
      pending.delete(message.id);
      message.error ? callback.reject(message.error) : callback.resolve(message.result);
    }
    if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails.text);
    if (message.method === "Log.entryAdded" && message.params.entry.level === "error") errors.push(message.params.entry.text);
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    pending.set(++id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  async function evaluate(expression) {
    const output = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (output.exceptionDetails) throw new Error(output.exceptionDetails.text);
    return output.result.value;
  }
  async function assert(name, expression, checks) {
    const passed = await evaluate(expression);
    checks.push({ name, passed });
    if (!passed) throw new Error(`Failed: ${name}`);
  }
  async function screenshot(name) {
    const metrics = await send("Page.getLayoutMetrics");
    const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width: metrics.cssLayoutViewport.clientWidth, height: metrics.cssContentSize.height, scale: 1 } });
    await writeFile(`qa/${name}.png`, Buffer.from(shot.data, "base64"));
  }
  async function clearInput(expression) {
    await evaluate(`${expression}.focus()`);
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: "a", code: "KeyA", windowsVirtualKeyCode: 65, modifiers: 2 });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key: "a", code: "KeyA", windowsVirtualKeyCode: 65, modifiers: 2 });
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Backspace", code: "Backspace", windowsVirtualKeyCode: 8 });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Backspace", code: "Backspace", windowsVirtualKeyCode: 8 });
    await delay(100);
  }

  await send("Page.enable"); await send("Runtime.enable"); await send("Log.enable");
  const checks = [];
  for (const [width, height] of [[1440, 900], [1024, 900], [390, 844]]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
    await send("Page.navigate", { url: "http://localhost:3000/lab/electricity-consumption" });
    await delay(800); await evaluate("document.fonts.ready");
    await assert(`no overflow ${width}`, "document.documentElement.scrollWidth <= innerWidth", checks);
    await assert(`three example loads ${width}`, "document.querySelectorAll('fieldset').length === 3", checks);
    await assert(`monthly total 228 ${width}`, "document.body.textContent.includes('228 kWh')", checks);
    await screenshot(`electricity-${width}-full`);
    if (width === 1440) {
      await evaluate("[...document.querySelectorAll('button')].find(button => button.textContent.includes('Add another')).click()");
      await assert("add appliance", "document.querySelectorAll('fieldset').length === 4", checks);
      await clearInput("document.querySelector('fieldset input[type=number]')");
      await assert("invalid load pauses flow", "document.body.textContent.includes('Flow paused')", checks);
      await evaluate("[...document.querySelectorAll('button')].find(button => button.textContent === 'Reset example').click()");
      await assert("reset appliance example", "document.querySelectorAll('fieldset').length === 3 && document.body.textContent.includes('228 kWh')", checks);
    }
  }
  const result = { checks, errors };
  await writeFile("qa/electricity-review.json", JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  await send("Browser.close");
  if (errors.length) process.exitCode = 1;
} finally {
  socket?.close(); chrome.kill();
  await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
}
