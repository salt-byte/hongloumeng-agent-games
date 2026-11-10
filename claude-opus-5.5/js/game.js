// 引擎：输入、对话、场景、界面
'use strict';
const W = 1280, H = 720;
const cv = document.getElementById('game');
const ctx = cv.getContext('2d');

function fit() {
  const s = Math.min(window.innerWidth / W, window.innerHeight / H);
  cv.style.width = Math.floor(W * s) + 'px';
  cv.style.height = Math.floor(H * s) + 'px';
}
window.addEventListener('resize', fit); fit();

const G = {
  mode: 'title', // title | play | ending
  t: 0,
  scene: null, sceneId: null,
  player: { x: 0, y: 0, dir: 'down', walk: 0, moving: false },
  npcs: [],
  st: null,
  q: [], cur: null,
  dlg: null, choice: null, choiceSel: 0,
  banner: null, fade: 0, fadeTarget: 0, shake: 0,
  moveTarget: null, hover: null, toast: null,
  bgCache: {},
  ending: null, titleMenu: 'main', titleSel: 0,
  keys: {},
  mouse: { x: 0, y: 0 },
};

function newState() {
  return { step: '', flags: {}, favor: 2, dignity: 2, bond: 2, choices: {} };
}

// ---------- 输入 ----------
const KEYMAP = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' };
window.addEventListener('keydown', e => {
  if (KEYMAP[e.code]) { G.keys[KEYMAP[e.code]] = true; e.preventDefault(); }
  if (e.repeat) return;
  onKey(e.code);
  if (['Space', 'Enter'].includes(e.code)) e.preventDefault();
});
window.addEventListener('keyup', e => { if (KEYMAP[e.code]) G.keys[KEYMAP[e.code]] = false; });
window.addEventListener('blur', () => { G.keys = {}; });

function toCanvas(e) {
  const r = cv.getBoundingClientRect();
  return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height };
}
cv.addEventListener('mousemove', e => { const p = toCanvas(e); G.mouse = p; });
cv.addEventListener('mousedown', e => { const p = toCanvas(e); G.mouse = p; onClick(p.x, p.y); });

function onKey(code) {
  if (G.mode === 'title') return titleKey(code);
  if (G.mode === 'ending') { if (code === 'Enter' || code === 'Space') toTitle(); return; }
  if (G.choice) {
    const n = G.choice.opts.length;
    if (code === 'ArrowUp' || code === 'KeyW') G.choiceSel = (G.choiceSel + n - 1) % n;
    if (code === 'ArrowDown' || code === 'KeyS') G.choiceSel = (G.choiceSel + 1) % n;
    const d = parseInt(code.replace('Digit', ''), 10);
    if (d >= 1 && d <= n) return pickChoice(d - 1);
    if (code === 'Enter' || code === 'Space') pickChoice(G.choiceSel);
    return;
  }
  if (G.dlg) { if (['Enter', 'Space', 'KeyE', 'KeyZ'].includes(code)) advanceDlg(); return; }
  if (G.cur) return;
  if (['Enter', 'Space', 'KeyE', 'KeyZ'].includes(code)) { const t = nearestInteract(); if (t) doInteract(t); }
}

function onClick(x, y) {
  if (G.mode === 'title') return titleClick(x, y);
  if (G.mode === 'ending') { const b = G.ending && G.ending.btn; if (b && x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h) toTitle(); return; }
  if (G.choice) {
    G.choice.rects.forEach((r, i) => { if (x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h) pickChoice(i); });
    return;
  }
  if (G.dlg) { advanceDlg(); return; }
  if (G.cur) return;
  // 点人物/物件
  const all = interactables();
  for (const it of all) {
    if (Math.hypot(it.x - x, (it.y - 30) - y) < 34) {
      if (Math.hypot(it.x - G.player.x, it.y - G.player.y) < 80) doInteract(it);
      else G.moveTarget = { x: it.x, y: it.y + 24, then: it };
      return;
    }
  }
  G.moveTarget = { x, y };
}

// ---------- 脚本执行 ----------
function run(script) { G.q = script.slice().concat(G.q); if (!G.cur) nextStep(); }
function nextStep() {
  G.cur = null;
  while (G.q.length) {
    const s = G.q.shift();
    if (Array.isArray(s)) { G.cur = s; startDlg(s[0], s[1]); return; }
    if (s.do) { const r = s.do(G); if (Array.isArray(r)) G.q = r.concat(G.q); continue; }
    if (s.choice !== undefined) { G.cur = s; startChoice(s); return; }
    if (s.move) { G.cur = s; s.time = 0; s.move.forEach(m => { const n = npc(m[0]); if (n) { n.tx = m[1]; n.ty = m[2]; } }); return; }
    if (s.wait) { G.cur = s; s.time = 0; return; }
    if (s.fade) { G.cur = s; s.phase = 0; G.fadeTarget = 1; return; }
    if (s.banner) { G.banner = { text: s.banner, sub: s.sub || '', t: 0 }; continue; }
    if (s.shake) { G.shake = s.shake; continue; }
    if (s.toast) { G.toast = { text: s.toast, t: 0 }; continue; }
  }
  saveCheckpoint();
}
function updateScript(dt) {
  const s = G.cur; if (!s || Array.isArray(s) || s.choice !== undefined) return;
  if (s.move) {
    s.time += dt;
    const done = s.move.every(m => { const n = npc(m[0]); return !n || n.tx === undefined; });
    if (done || s.time > 6) { s.move.forEach(m => { const n = npc(m[0]); if (n && n.tx !== undefined) { n.x = n.tx; n.y = n.ty; n.tx = undefined; } }); nextStep(); }
  } else if (s.wait) { s.time += dt; if (s.time >= s.wait) nextStep(); }
  else if (s.fade) {
    if (s.phase === 0 && G.fade >= 0.99) { s.phase = 1; if (s.mid) { const r = s.mid(G); if (Array.isArray(r)) G.q = r.concat(G.q); } G.fadeTarget = 0; }
    else if (s.phase === 1 && G.fade <= 0.01) nextStep();
  }
}

function startDlg(key, text) {
  G.dlg = { key, text, n: 0 };
}
function advanceDlg() {
  if (!G.dlg) return;
  if (G.dlg.n < G.dlg.text.length) { G.dlg.n = G.dlg.text.length; return; }
  G.dlg = null; nextStep();
}
function startChoice(s) { G.choice = { prompt: s.choice, opts: s.opts.filter(o => !o.cond || o.cond(G)), rects: [], key: s.key || 'liu', t0: G.t }; G.choiceSel = 0; }
function pickChoice(i) {
  if (G.t - G.choice.t0 < 0.4) return;
  const s = G.cur; const o = G.choice.opts[i];
  G.choice = null;
  if (s.id) G.st.choices[s.id] = o.label || o.t;
  if (o.fx) o.fx(G);
  if (o.then) G.q = o.then.concat(G.q);
  nextStep();
}

// ---------- 状态便捷函数 ----------
function npc(id) { return G.npcs.find(n => n.id === id); }
function addNpc(id, key, x, y, dir = 'down', extra = {}) {
  G.npcs = G.npcs.filter(n => n.id !== id);
  const n = Object.assign({ id, key, x, y, dir, walk: 0 }, extra); G.npcs.push(n); return n;
}
function removeNpc(id) { G.npcs = G.npcs.filter(n => n.id !== id); }
function setStep(s) { G.st.step = s; }
function adj(k, v) { G.st[k] = Math.max(0, Math.min(5, G.st[k] + v)); }

// ---------- 场景 ----------
function enterScene(id, spawn) {
  const sc = SCENES[id];
  G.scene = sc; G.sceneId = id;
  G.npcs = [];
  const sp = spawn || sc.spawn;
  G.player.x = sp[0]; G.player.y = sp[1]; G.player.dir = sp[2] || 'down';
  G.moveTarget = null;
  (sc.triggers || []).forEach(t => { t.done = false; });
  if (sc.setup) sc.setup(G);
  if (G.st.flags.banFollow !== false && sc.ban !== false) addNpc('ban', 'ban', G.player.x - 30, G.player.y + 10, 'down', { follow: true });
  if (!G.bgCache[id]) {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    sc.bg(c.getContext('2d')); G.bgCache[id] = c;
  }
  if (sc.onEnter) { const r = sc.onEnter(G); if (Array.isArray(r)) run(r); }
  saveCheckpoint();
}

function walkable(x, y) {
  const sc = G.scene;
  const inR = r => x >= r[0] && x <= r[0] + r[2] && y >= r[1] && y <= r[1] + r[3];
  if (!sc.walk.some(inR)) return false;
  if (sc.walls && sc.walls.some(inR)) return false;
  return true;
}

function interactables() {
  const list = [];
  G.npcs.forEach(n => {
    if (n.hidden || n.follow) return;
    const f = G.scene.talk && G.scene.talk[n.id];
    if (f) list.push({ x: n.x, y: n.y, label: CHARS[n.key].name, kind: 'npc', npc: n, run: f });
  });
  (G.scene.items || []).forEach(it => { if (!it.cond || it.cond(G)) list.push({ x: it.x, y: it.y, label: it.label, kind: 'item', run: it.run }); });
  return list;
}
function nearestInteract() {
  let best = null, bd = 78;
  interactables().forEach(it => { const d = Math.hypot(it.x - G.player.x, it.y - G.player.y); if (d < bd) { bd = d; best = it; } });
  return best;
}
function doInteract(it) {
  G.moveTarget = null;
  if (it.npc) {
    const dx = G.player.x - it.npc.x, dy = G.player.y - it.npc.y;
    if (!it.npc.sit && !it.npc.fixedDir) it.npc.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    G.player.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'left' : 'right') : (dy > 0 ? 'up' : 'down');
  }
  const r = it.run(G);
  if (Array.isArray(r) && r.length) run(r);
}

// ---------- 更新 ----------
function update(dt) {
  G.t += dt;
  if (G.fade < G.fadeTarget) G.fade = Math.min(G.fadeTarget, G.fade + dt * 2.6);
  if (G.fade > G.fadeTarget) G.fade = Math.max(G.fadeTarget, G.fade - dt * 2.6);
  if (G.shake > 0) G.shake = Math.max(0, G.shake - dt);
  if (G.banner) { G.banner.t += dt; if (G.banner.t > 3.2) G.banner = null; }
  if (G.toast) { G.toast.t += dt; if (G.toast.t > 2.6) G.toast = null; }
  if (G.mode !== 'play') return;
  if (G.dlg && G.dlg.n < G.dlg.text.length) G.dlg.n = Math.min(G.dlg.text.length, G.dlg.n + dt * 42);
  updateScript(dt);
  const p = G.player;
  let vx = 0, vy = 0;
  const free = !G.cur && !G.dlg && !G.choice && G.fade < 0.05;
  if (free) {
    if (G.keys.up) vy -= 1; if (G.keys.down) vy += 1; if (G.keys.left) vx -= 1; if (G.keys.right) vx += 1;
    if (vx || vy) G.moveTarget = null;
    else if (G.moveTarget) {
      const dx = G.moveTarget.x - p.x, dy = G.moveTarget.y - p.y, d = Math.hypot(dx, dy);
      if (d < 6) { const t = G.moveTarget.then; G.moveTarget = null; if (t) doInteract(t); }
      else { vx = dx / d; vy = dy / d; if (G.moveTarget.then && Math.hypot(G.moveTarget.then.x - p.x, G.moveTarget.then.y - p.y) < 70) { const t = G.moveTarget.then; G.moveTarget = null; doInteract(t); vx = vy = 0; } }
    }
  }
  const sp = 190;
  if (vx || vy) {
    const l = Math.hypot(vx, vy); vx /= l; vy /= l;
    const nx = p.x + vx * sp * dt, ny = p.y + vy * sp * dt;
    let moved = false;
    if (walkable(nx, ny)) { p.x = nx; p.y = ny; moved = true; }
    else if (walkable(nx, p.y)) { p.x = nx; moved = true; }
    else if (walkable(p.x, ny)) { p.y = ny; moved = true; }
    if (!moved && G.moveTarget) G.moveTarget = null;
    p.dir = Math.abs(vx) > Math.abs(vy) ? (vx > 0 ? 'right' : 'left') : (vy > 0 ? 'down' : 'up');
    p.walk += dt * 11; p.moving = true;
  } else { p.moving = false; p.walk = 0; }
  // NPC
  G.npcs.forEach(n => {
    if (n.follow) {
      const dx = p.x - 34 - n.x, dy = p.y + 8 - n.y, d = Math.hypot(dx, dy);
      if (d > 40) { const s2 = Math.min(d - 40, sp * 1.05 * dt); n.x += dx / d * s2; n.y += dy / d * s2; n.walk += dt * 12; n.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); }
      else n.walk = 0;
      return;
    }
    if (n.tx !== undefined) {
      const dx = n.tx - n.x, dy = n.ty - n.y, d = Math.hypot(dx, dy);
      if (d < 3) { n.x = n.tx; n.y = n.ty; n.tx = undefined; n.walk = 0; if (n.endDir) n.dir = n.endDir; }
      else { const s2 = Math.min(d, 150 * dt); n.x += dx / d * s2; n.y += dy / d * s2; n.walk += dt * 10; n.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); }
    }
  });
  if (free) {
    // 触发区
    for (const tr of (G.scene.triggers || [])) {
      if (tr.done && tr.once !== false) continue;
      if (p.x > tr.x && p.x < tr.x + tr.w && p.y > tr.y && p.y < tr.y + tr.h && (!tr.cond || tr.cond(G))) {
        tr.done = true; const r = tr.run(G); if (Array.isArray(r)) run(r); return;
      }
    }
    for (const ex of (G.scene.exits || [])) {
      if (p.x > ex.x && p.x < ex.x + ex.w && p.y > ex.y && p.y < ex.y + ex.h) {
        if (!ex.cond || ex.cond(G)) { const e2 = ex; run([{ fade: true, mid: () => { enterScene(e2.to, e2.spawn); } }]); return; }
        else if (!G.toast) { G.toast = { text: ex.locked, t: 0 }; p.x -= vx * 14; p.y -= vy * 14; G.moveTarget = null; }
      }
    }
  }
}

// ---------- 绘制 ----------
function wrapText(c, text, maxW) {
  const lines = []; let line = '';
  for (const ch of text) {
    if (ch === '\n') { lines.push(line); line = ''; continue; }
    if (c.measureText(line + ch).width > maxW && line) {
      if ('，。！？、；：”’）」』…—'.includes(ch)) { line += ch; lines.push(line); line = ''; continue; }
      lines.push(line); line = ch;
    } else line += ch;
  }
  if (line) lines.push(line);
  return lines;
}

function panel(x, y, w, h, alpha = 0.94) {
  ctx.save();
  ctx.fillStyle = `rgba(246,236,214,${alpha})`; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#7a2a22'; ctx.lineWidth = 3; ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
  ctx.strokeStyle = 'rgba(122,42,34,0.5)'; ctx.lineWidth = 1; ctx.strokeRect(x + 8, y + 8, w - 16, h - 16);
  // 回纹角
  ctx.fillStyle = '#7a2a22';
  [[x + 4, y + 4], [x + w - 18, y + 4], [x + 4, y + h - 18], [x + w - 18, y + h - 18]].forEach(([a, b]) => { ctx.fillRect(a, b, 14, 3); ctx.fillRect(a, b, 3, 14); ctx.fillRect(a + 11, b, 3, 14); ctx.fillRect(a, b + 11, 14, 3); });
  ctx.restore();
}

function drawPortrait(key, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = '#e8dcc0'; ctx.fillRect(x, y, w, h);
  const g = ctx.createRadialGradient(x + w / 2, y + h / 2, 10, x + w / 2, y + h / 2, w);
  g.addColorStop(0, 'rgba(255,250,235,0.9)'); g.addColorStop(1, 'rgba(190,160,120,0.6)');
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  const st = G.st || {};
  drawPerson(ctx, key, { x: x + w / 2, y: y + h + 64, scale: 3.1, noShadow: true, flowers: key === 'liu' && st.flags && st.flags.flowers, redFlower: st.flags && ((key === 'jiamu' && st.flags.jmFlower) || (key === 'liu' && st.flags.oneFlower)) });
  ctx.restore();
  ctx.strokeStyle = '#7a2a22'; ctx.lineWidth = 3; ctx.strokeRect(x, y, w, h);
}

function drawDialogue() {
  const d = G.dlg; const x = 30, y = H - 200, w = W - 60, h = 180;
  panel(x, y, w, h);
  const narr = d.key === 'n';
  let tx = x + 36;
  if (!narr) {
    drawPortrait(d.key, x + 22, y + 18, 144, 144);
    tx = x + 190;
    const name = CHARS[d.key].name;
    ctx.font = `bold 24px ${FONT_KAI}`;
    const nw = ctx.measureText(name).width + 36;
    ctx.fillStyle = '#7a2a22'; ctx.fillRect(tx - 6, y - 18, nw, 36);
    ctx.fillStyle = '#f6ecd6'; ctx.textBaseline = 'middle'; ctx.fillText(name, tx + 12, y);
    ctx.textBaseline = 'alphabetic';
  }
  ctx.font = narr ? `italic 24px ${FONT_SERIF}` : `25px ${FONT_SERIF}`;
  ctx.fillStyle = narr ? '#4a3a2a' : '#2a1a14';
  const shown = d.text.slice(0, Math.floor(d.n));
  const lines = wrapText(ctx, shown, x + w - tx - 40);
  lines.slice(0, 4).forEach((l, i) => ctx.fillText(l, tx, y + 50 + i * 36));
  if (d.n >= d.text.length) {
    const a = 0.5 + 0.5 * Math.sin(G.t * 6);
    ctx.fillStyle = `rgba(122,42,34,${a})`; ctx.beginPath();
    ctx.moveTo(x + w - 40, y + h - 32); ctx.lineTo(x + w - 26, y + h - 32); ctx.lineTo(x + w - 33, y + h - 22); ctx.fill();
  }
}

function drawChoice() {
  const c = G.choice;
  // 提示
  const px = 30, py = H - 200, pw = W - 60, ph = 180;
  panel(px, py, pw, ph);
  drawPortrait(c.key, px + 22, py + 18, 144, 144);
  ctx.font = `bold 24px ${FONT_KAI}`; ctx.fillStyle = '#7a2a22';
  ctx.fillText('【抉择】', px + 190, py + 50);
  ctx.font = `24px ${FONT_SERIF}`; ctx.fillStyle = '#2a1a14';
  wrapText(ctx, c.prompt, pw - 240).slice(0, 3).forEach((l, i) => ctx.fillText(l, px + 190, py + 90 + i * 34));
  // 选项
  const bw = 820, bh = 62, gap = 14;
  const total = c.opts.length * bh + (c.opts.length - 1) * gap;
  let y0 = (H - 210 - total) / 2 + 20;
  c.rects = [];
  c.opts.forEach((o, i) => {
    const x = (W - bw) / 2, y = y0 + i * (bh + gap);
    const hov = G.mouse.x > x && G.mouse.x < x + bw && G.mouse.y > y && G.mouse.y < y + bh;
    if (hov) G.choiceSel = i;
    const sel = G.choiceSel === i;
    ctx.fillStyle = sel ? 'rgba(122,42,34,0.95)' : 'rgba(40,28,22,0.85)';
    ctx.fillRect(x, y, bw, bh);
    ctx.strokeStyle = sel ? '#f2c33a' : '#b89a6a'; ctx.lineWidth = 2; ctx.strokeRect(x + 3, y + 3, bw - 6, bh - 6);
    ctx.fillStyle = sel ? '#fff4d8' : '#e8dcc0'; ctx.font = `23px ${FONT_SERIF}`; ctx.textBaseline = 'middle';
    const lines = wrapText(ctx, `${i + 1}．${o.t}`, bw - 40);
    if (lines.length === 1) ctx.fillText(lines[0], x + 20, y + bh / 2 + 1);
    else { ctx.font = `20px ${FONT_SERIF}`; const l2 = wrapText(ctx, `${i + 1}．${o.t}`, bw - 40); l2.slice(0, 2).forEach((l, k) => ctx.fillText(l, x + 20, y + 19 + k * 25)); }
    ctx.textBaseline = 'alphabetic';
    c.rects.push({ x, y, w: bw, h: bh });
  });
}

function drawHUD() {
  const sc = G.scene;
  // 顶栏
  const g = ctx.createLinearGradient(0, 0, 0, 52);
  g.addColorStop(0, 'rgba(30,18,14,0.82)'); g.addColorStop(1, 'rgba(30,18,14,0.55)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 50);
  ctx.fillStyle = '#7a2a22'; ctx.fillRect(0, 50, W, 2);
  ctx.font = `bold 22px ${FONT_KAI}`; ctx.fillStyle = '#f2d590'; ctx.textBaseline = 'middle';
  ctx.fillText(`${sc.section}`, 20, 26);
  const sw = ctx.measureText(sc.section).width;
  ctx.font = `18px ${FONT_SERIF}`; ctx.fillStyle = '#d8c8a8';
  ctx.fillText(`· ${sc.name}`, 30 + sw, 27);
  const obj = OBJECTIVE(G);
  if (obj) {
    ctx.font = `20px ${FONT_SERIF}`;
    const t = '目标：' + obj; const tw = ctx.measureText(t).width;
    ctx.fillStyle = 'rgba(122,42,34,0.9)'; ctx.fillRect(W - tw - 44, 8, tw + 30, 34);
    ctx.fillStyle = '#fff0cc'; ctx.fillText(t, W - tw - 29, 26);
  }
  ctx.textBaseline = 'alphabetic';
  if (!G.dlg && !G.choice) {
    // 人情簿
    const x = 14, y = H - 104;
    ctx.fillStyle = 'rgba(30,18,14,0.62)'; ctx.fillRect(x, y, 228, 90);
    ctx.strokeStyle = 'rgba(242,213,144,0.5)'; ctx.strokeRect(x + 3, y + 3, 222, 84);
    ctx.font = `16px ${FONT_SERIF}`;
    [['老太太欢心', G.st.favor, '#e05a4a'], ['凤姐鸳鸯情分', G.st.bond, '#e0a040'], ['庄家人本色', G.st.dignity, '#7ab08a']].forEach(([n, v, col], i) => {
      ctx.fillStyle = '#e8dcc0'; ctx.fillText(n, x + 12, y + 26 + i * 25);
      for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.arc(x + 136 + k * 18, y + 20 + i * 25, 6, 0, 7); ctx.fillStyle = k < v ? col : 'rgba(255,255,255,0.15)'; ctx.fill(); }
    });
    ctx.font = `15px ${FONT_SERIF}`; ctx.fillStyle = 'rgba(240,230,210,0.85)';
    const hint = '方向键/WASD 行走 · 鼠标点击移动 · 空格/回车 交谈';
    const hw = ctx.measureText(hint).width;
    ctx.fillStyle = 'rgba(30,18,14,0.55)'; ctx.fillRect(W - hw - 30, H - 36, hw + 20, 26);
    ctx.fillStyle = 'rgba(240,230,210,0.9)'; ctx.fillText(hint, W - hw - 20, H - 18);
  }
}

function drawWorld() {
  const sc = G.scene;
  ctx.drawImage(G.bgCache[G.sceneId], 0, 0);
  if (sc.anim) sc.anim(ctx, G.t);
  // 出口标记
  (sc.exits || []).forEach(ex => {
    if (ex.cond && !ex.cond(G)) return;
    const a = 0.55 + 0.45 * Math.sin(G.t * 4);
    const cx = ex.x + ex.w / 2, cy = ex.y + ex.h / 2;
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#f2d590'; ctx.strokeStyle = '#7a2a22'; ctx.lineWidth = 2;
    ctx.font = `bold 18px ${FONT_KAI}`; ctx.textAlign = 'center';
    const tw = ctx.measureText(ex.label).width + 20;
    let lx = Math.max(tw / 2 + 6, Math.min(W - tw / 2 - 6, cx)), ly = Math.max(70, Math.min(H - 60, cy));
    ctx.fillStyle = 'rgba(122,42,34,0.9)'; ctx.fillRect(lx - tw / 2, ly - 14, tw, 28);
    ctx.fillStyle = '#fff0cc'; ctx.textBaseline = 'middle'; ctx.fillText(ex.label, lx, ly + 1);
    ctx.restore();
  });
  // 物件提示圈
  (sc.items || []).forEach(it => {
    if (it.cond && !it.cond(G)) return;
    const a = 0.35 + 0.3 * Math.sin(G.t * 3 + it.x);
    ctx.strokeStyle = `rgba(242,195,58,${a})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(it.x, it.y, 22, 8, 0, 0, 7); ctx.stroke();
    ctx.fillStyle = `rgba(242,195,58,${a + 0.2})`; ctx.beginPath(); ctx.arc(it.x, it.y - 40 - Math.sin(G.t * 3) * 3, 4, 0, 7); ctx.fill();
  });
  // 人物（按y排序）
  const ents = G.npcs.filter(n => !n.hidden).map(n => ({ y: n.y, draw: () => drawPerson(ctx, n.key, { x: n.x, y: n.y, dir: n.dir, walk: n.walk, sit: n.sit, redFlower: n.key === 'jiamu' && G.st.flags.jmFlower }) }));
  const p = G.player;
  ents.push({ y: p.y, draw: () => drawPerson(ctx, 'liu', { x: p.x, y: p.y + (p.fallen ? 0 : 0), dir: p.dir, walk: p.walk, flowers: G.st.flags.flowers, redFlower: G.st.flags.oneFlower, sit: p.sit }) });
  if (sc.fg) ents.push(...sc.fg(G));
  ents.sort((a, b) => a.y - b.y).forEach(e => e.draw());
  if (sc.over) sc.over(ctx, G.t);
  // 交互提示
  if (!G.cur && !G.dlg) {
    const it = nearestInteract();
    if (it) {
      ctx.font = `18px ${FONT_SERIF}`; const t = (it.kind === 'npc' ? '交谈：' : '查看：') + it.label;
      const tw = ctx.measureText(t).width + 40;
      const bx = Math.max(10, Math.min(W - tw - 10, it.x - tw / 2)), by = it.y - 112;
      ctx.fillStyle = 'rgba(246,236,214,0.95)'; ctx.fillRect(bx, by, tw, 30);
      ctx.strokeStyle = '#7a2a22'; ctx.lineWidth = 2; ctx.strokeRect(bx, by, tw, 30);
      ctx.fillStyle = '#7a2a22'; ctx.fillRect(bx + 6, by + 6, 18, 18);
      ctx.fillStyle = '#fff'; ctx.font = `12px ${FONT_SERIF}`; ctx.fillText('空', bx + 9, by + 20);
      ctx.fillStyle = '#2a1a14'; ctx.font = `18px ${FONT_SERIF}`; ctx.fillText(t, bx + 30, by + 21);
    }
  }
  // 点击目标
  if (G.moveTarget) { ctx.strokeStyle = 'rgba(242,213,144,0.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(G.moveTarget.x, G.moveTarget.y, 10, 4, 0, 0, 7); ctx.stroke(); }
}

function drawBanner() {
  const b = G.banner; const a = Math.min(1, b.t / 0.5, (3.2 - b.t) / 0.6);
  ctx.save(); ctx.globalAlpha = Math.max(0, a);
  const y = 210;
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, 'rgba(30,18,14,0)'); g.addColorStop(0.25, 'rgba(30,18,14,0.82)'); g.addColorStop(0.75, 'rgba(30,18,14,0.82)'); g.addColorStop(1, 'rgba(30,18,14,0)');
  ctx.fillStyle = g; ctx.fillRect(0, y - 60, W, 120);
  ctx.textAlign = 'center'; ctx.fillStyle = '#f2d590'; ctx.font = `bold 44px ${FONT_KAI}`;
  ctx.fillText(b.text, W / 2, y + 2);
  ctx.font = `20px ${FONT_SERIF}`; ctx.fillStyle = '#e8dcc0'; ctx.fillText(b.sub, W / 2, y + 38);
  ctx.restore();
}

function drawToast() {
  const t = G.toast; const a = Math.min(1, (2.6 - t.t) / 0.5);
  ctx.save(); ctx.globalAlpha = a;
  ctx.font = `20px ${FONT_SERIF}`; const tw = ctx.measureText(t.text).width + 40;
  ctx.fillStyle = 'rgba(30,18,14,0.85)'; ctx.fillRect((W - tw) / 2, 70, tw, 40);
  ctx.fillStyle = '#f2d590'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t.text, W / 2, 91);
  ctx.restore();
}

function render() {
  ctx.save();
  if (G.shake > 0) ctx.translate((Math.random() - 0.5) * 10 * G.shake, (Math.random() - 0.5) * 10 * G.shake);
  if (G.mode === 'title') drawTitle(ctx, G.t);
  else if (G.mode === 'ending') drawEnding(ctx, G.t);
  else {
    drawWorld();
    drawHUD();
    if (G.dlg) drawDialogue();
    if (G.choice) drawChoice();
  }
  ctx.restore();
  if (G.banner) drawBanner();
  if (G.toast && G.mode === 'play') drawToast();
  if (G.fade > 0) { ctx.fillStyle = `rgba(14,8,6,${G.fade})`; ctx.fillRect(0, 0, W, H); }
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  try { update(dt); render(); } catch (e) { console.error(e); }
  requestAnimationFrame(loop);
}

// ---------- 存档（仅用于“继续”） ----------
function saveCheckpoint() { /* 本片段短小，不做存档，保留接口 */ }

// ---------- 标题 / 结局 ----------
function toTitle() {
  G.mode = 'title'; G.titleMenu = 'main'; G.titleSel = 0; G.q = []; G.cur = null; G.dlg = null; G.choice = null; G.fade = 0; G.fadeTarget = 0; G.banner = null;
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
}
function startGame() {
  G.st = newState(); G.q = []; G.cur = null; G.dlg = null; G.choice = null;
  G.mode = 'play'; G.fade = 1; G.fadeTarget = 0;
  G.bgCache = {};
  enterScene('dagl');
}
function showEnding(id) {
  G.q = []; G.cur = null; G.dlg = null; G.choice = null;
  G.banner = null; G.toast = null;
  G.ending = ENDINGS[id](G); G.ending.t0 = G.t; G.ending.id = id;
  G.mode = 'ending'; G.fade = 1; G.fadeTarget = 0;
}

window.addEventListener('load', () => {
  requestAnimationFrame(loop);
  const m = location.hash.match(/jump=(\d+)/);
  if (m) doJump(parseInt(m[1], 10));
});
window.addEventListener('hashchange', () => { const m = location.hash.match(/jump=(\d+)/); if (m) doJump(parseInt(m[1], 10)); });
window.__G = G;
