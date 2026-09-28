import { spawn } from "node:child_process";
import { writeFile, mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";

const profile = await mkdtemp(path.join(tmpdir(), "leilany-home-qa-"));
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
  for (const [width, height] of [[1440, 900], [1024, 900], [390, 844]]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
    await send("Page.navigate", { url: "http://localhost:3000" });
    await delay(1000);
    await evaluate("document.fonts.ready");
    const state = await evaluate(`(() => {
      const links = [...document.querySelectorAll('a[href^="#"]')];
      const overflow = [...document.querySelectorAll('main *')].filter(el => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && (r.right > innerWidth + 1 || r.left < -1);
      }).map(el => el.className);
      return {
        width: innerWidth,
        horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
        overflowingElements: overflow,
        brokenAnchors: links.filter(a => !document.getElementById(a.hash.slice(1))).map(a => a.hash),
        experiments: document.querySelectorAll('.project').length,
      };
    })()`);
    const viewport = await send("Page.captureScreenshot", { format: "png" });
    await writeFile(`qa/home-${width}-viewport.png`, Buffer.from(viewport.data, "base64"));
    const metrics = await send("Page.getLayoutMetrics");
    const full = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true,
      clip: { x: 0, y: 0, width, height: metrics.cssContentSize.height, scale: 1 } });
    await writeFile(`qa/home-${width}-full.png`, Buffer.from(full.data, "base64"));
    await evaluate("document.querySelector('summary').focus()");
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
    await send("Input.dispatchKeyEvent", { type: "char", text: "\r", unmodifiedText: "\r", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
    state.keyboardDisclosure = await evaluate("document.querySelector('details').open");
    report.push(state);
  }
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  const reducedMotion = await evaluate("getComputedStyle(document.documentElement).scrollBehavior === 'auto'");
  const result = { report, reducedMotion, errors };
  await writeFile("qa/home-review.json", JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  await send("Browser.close");
  if (errors.length || report.some(r => r.horizontalOverflow || r.brokenAnchors.length || !r.keyboardDisclosure)) process.exitCode = 1;
} finally {
  socket?.close();
  chrome.kill();
  await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
}
