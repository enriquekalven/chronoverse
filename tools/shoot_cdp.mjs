#!/usr/bin/env node
/**
 * Deterministic headless screenshot via Chrome DevTools Protocol.
 * Waits until the app sets window.__chronoReady (world loaded + frames rendered), then captures.
 * Usage: node tools/shoot_cdp.mjs <stop> <outPng> [width] [height] [extraQuery]
 */
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const [stop = '0', out = 'shot.png', W = '1280', H = '800', extra = 'cleanview=1&fx=low'] = process.argv.slice(2);
const PORT = 9333 + Math.floor(Math.random() * 500);
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const profile = `${process.cwd()}/shots/.chrome-profile-${process.pid}`;
const chrome = spawn(CHROME, [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
  '--ignore-gpu-blocklist', '--hide-scrollbars', `--window-size=${W},${H}`, `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`, '--no-first-run', '--disable-background-timer-throttling', 'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function getBrowserWs() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      const j = await r.json();
      return j.webSocketDebuggerUrl;
    } catch { await sleep(250); }
  }
  throw new Error('Chrome did not start');
}

const logs = [];
let id = 0;
const pending = new Map();
let ws;
function send(method, params = {}, sessionId) {
  return new Promise((resolve, reject) => {
    const msg = { id: ++id, method, params };
    if (sessionId) msg.sessionId = sessionId;
    pending.set(msg.id, { resolve, reject });
    ws.send(JSON.stringify(msg));
  });
}

try {
  const wsUrl = await getBrowserWs();
  ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      const p = pending.get(m.id); pending.delete(m.id);
      if (m.error) p.reject(new Error(JSON.stringify(m.error))); else p.resolve(m.result);
    } else if (m.method === 'Runtime.consoleAPICalled') {
      logs.push(`[${m.params.type}] ${m.params.args.map((a) => a.value ?? a.description ?? '').join(' ')}`);
    } else if (m.method === 'Runtime.exceptionThrown') {
      logs.push(`[EXCEPTION] ${m.params.exceptionDetails.text} ${m.params.exceptionDetails.exception?.description || ''}`);
    } else if (m.method === 'Log.entryAdded') {
      logs.push(`[${m.params.entry.level}] ${m.params.entry.text} ${m.params.entry.url || ''}`);
    }
  };
  const url = process.env.SHOT_URL || `http://127.0.0.1:8090/?stop=${encodeURIComponent(stop)}&${extra}`;
  const { targetId } = await send('Target.createTarget', { url: 'about:blank', newWindow: true, width: +W, height: +H });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  await send('Runtime.enable', {}, sessionId);
  await send('Log.enable', {}, sessionId);
  await send('Page.enable', {}, sessionId);
  await send('Emulation.setDeviceMetricsOverride', { width: +W, height: +H, deviceScaleFactor: 1, mobile: false }, sessionId);
  await send('Page.navigate', { url }, sessionId);
  const start = Date.now();
  let ready = false;
  while (Date.now() - start < 240000) {
    await sleep(700);
    try {
      const r = await send('Runtime.evaluate', { expression: 'window.__chronoReady === true', returnByValue: true }, sessionId);
      if (r.result && r.result.value === true) { ready = true; break; }
    } catch { /* page may be navigating */ }
  }
  logs.push(`[shoot] ready=${ready} after ${((Date.now() - start) / 1000).toFixed(1)}s`);
  // allow a couple more frames to render after ready
  await sleep(2500);
  const shot = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, Buffer.from(shot.data, 'base64'));
  writeFileSync(out.replace(/\.png$/, '.console.log'), logs.join('\n'));
  console.log(`saved ${out} (${ready ? 'READY' : 'TIMEOUT'})`);
  const errs = logs.filter((l) => /EXCEPTION|\[error\]|\[warning\]/.test(l)).slice(0, 25);
  if (errs.length) console.log(errs.join('\n'));
} catch (e) {
  console.error('shoot failed:', e.message);
} finally {
  try { ws && ws.close(); } catch {}
  chrome.kill('SIGKILL');
  spawn('rm', ['-rf', profile]);
}
