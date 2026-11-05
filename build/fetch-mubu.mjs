// 抓幕布（mubu.com）大綱全文：開 headless Edge，邊滾邊收節點。
//   node build/fetch-mubu.mjs <url> [out.json]
// 幕布正文是虛擬列表（DOM 一次只渲染可見節點），所以要滾到 scrollHeight 為止。
// 產出 out.json（含 depth/text/note）與同名 .md（縮排大綱，方便人看）。
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const url = process.argv[2];
if (!url) { console.error('用法：node build/fetch-mubu.mjs <url> [out.json]'); process.exit(1); }
const out = process.argv[3] || path.join(os.tmpdir(), 'mubu-out.json');

const port = 13000 + Math.floor(Math.random() * 400);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'edge-mubu-'));
const child = spawn(EDGE, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars',
  `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
  '--window-size=1280,1000', '--no-first-run', '--no-default-browser-check', 'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe'] });
child.stderr.on('data', () => {});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function target() {
  for (let i = 0; i < 100; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      const p = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
      if (p) return p;
    } catch (e) {}
    await sleep(250);
  }
  throw new Error('no devtools target');
}

const page = await target();
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
});
await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
const send = (method, params = {}) => new Promise((res) => {
  const mid = ++id; pending.set(mid, res);
  ws.send(JSON.stringify({ id: mid, method, params }));
});
const ev = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.result && r.result.exceptionDetails) {
    throw new Error('eval: ' + (r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text));
  }
  return r.result?.result?.value;
};

// 找真正的滾動容器：outliner-tree 的祖先裡第一個 overflow-y auto/scroll 且可滾的
const FIND_SCROLLER = `(() => {
  let el = document.querySelector('.outliner-tree');
  while (el && el !== document.documentElement) {
    const oy = getComputedStyle(el).overflowY;
    if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 50) {
      window.__mubuScroller = el;
      return 'ok:' + el.className;
    }
    el = el.parentElement;
  }
  window.__mubuScroller = document.scrollingElement;
  return 'fallback:' + (window.__mubuScroller && window.__mubuScroller.tagName);
})()`;

const STATE = `(() => {
  const sc = window.__mubuScroller || document.scrollingElement;
  const nodes = [];
  for (const el of document.querySelectorAll('.outliner-node')) {
    const nid = el.dataset.id;
    if (!nid) continue;
    // 幕布節點是平的；層級由縮排容器裡 .indent-item 的個數決定
    const ind = el.querySelector(':scope > .outliner-indent-container');
    const depth = ind ? ind.querySelectorAll('.indent-item').length : 0;
    const c = el.querySelector(':scope > .outliner-node-content-container .content');
    const n = el.querySelector(':scope > .outliner-node-content-container .outliner-node-note .note');
    const imgs = el.querySelectorAll(':scope > .outliner-node-content-container .outliner-node-images img');
    nodes.push({ id: nid, depth, text: c ? c.innerText : '', note: n ? n.innerText : '', imgs: imgs.length });
  }
  return { nodes, top: sc.scrollTop, height: sc.scrollHeight, view: sc.clientHeight };
})()`;

try {
  await send('Page.enable');
  await send('Page.navigate', { url });
  for (let i = 0; i < 150; i++) {
    await sleep(500);
    if (await ev(`!!document.querySelector('.outliner-node')`)) break;
  }
  await sleep(1500);

  const title = await ev(`(document.querySelector('.outliner-title') || {}).innerText || document.title`);
  const scroller = await ev(FIND_SCROLLER);
  console.error('title:', title, '| scroller:', scroller);

  const seen = new Map();
  const order = [];
  let guard = 0;
  let stableRounds = 0;
  let lastTop = -1;

  while (guard++ < 4000) {
    const s = await ev(STATE);
    let added = 0;
    for (const n of s.nodes) {
      const prev = seen.get(n.id);
      if (!prev) { seen.set(n.id, n); order.push(n.id); added++; }
      else if (n.text.length > prev.text.length || n.note.length > prev.note.length) { seen.set(n.id, n); }
      if (!order.includes(n.id)) order.push(n.id);
    }
    if (added === 0) stableRounds++; else stableRounds = 0;
    const atEnd = s.top + s.view >= s.height - 4;
    if (atEnd && stableRounds >= 1) break;
    if (stableRounds > 60) break;
    if (atEnd) {
      // 到底了但節點還沒收齊：等虛擬列表把尾部渲染出來
      await sleep(400);
      if (s.top === lastTop && stableRounds > 3) break;
    }
    lastTop = s.top;
    const step = Math.max(200, Math.floor(s.view * 0.7));
    await ev(`(() => { const sc = window.__mubuScroller || document.scrollingElement; sc.scrollTop = sc.scrollTop + ${step}; return sc.scrollTop; })()`);
    await sleep(160);
  }

  const list = order.map((nid) => seen.get(nid)).filter(Boolean);
  const result = { url, title, count: list.length, nodes: list };
  fs.writeFileSync(out, JSON.stringify(result, null, 1), 'utf8');
  const md = [`# ${title}`, ''];
  for (const n of list) {
    md.push('  '.repeat(n.depth) + '- ' + n.text.replace(/\n/g, ' ').trim());
    if (n.note) md.push('  '.repeat(n.depth + 1) + '  > ' + n.note.replace(/\n/g, ' / ').trim().slice(0, 500));
  }
  const mdPath = out.replace(/\.json$/, '.md');
  fs.writeFileSync(mdPath, md.join('\n'), 'utf8');
  console.log(`title=${title} nodes=${list.length}`);
  console.log(`json=${out}`);
  console.log(`md=${mdPath}`);
} finally {
  try { ws.close(); } catch (e) {}
  child.kill();
  await sleep(300);
  try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) {}
}
