// engine.js —— 主循环、输入、行走、对话与选择、转场、标题/结局画面、评测跳转
'use strict';
const cv = document.getElementById('game'), ctx = cv.getContext('2d');
let G = null;
const keys = {}; const mouse = { x: 0, y: 0 };
let buttons = [];

function reset() {
  G = { mode: 'title', scene: 'lou', stage: 'L0', px: 200, bx: 140, dir: 1, walk: 0, moving: false, f: {}, laugh: 0, bense: 0, t: 0, obj: '', queue: [], dlg: null, choice: null, fade: null, laughUntil: 0, fallUntil: 0, target: null, pending: null, intro: 0, hidePlayer: false, endId: null, endT: 0, toast: null };
  window.G = G;
}
reset();

// ---------- 文本 ----------
const NOHEAD = '，。！？；：、”’）》…—';
function wrap(text, maxW, font) {
  ctx.font = font; const out = [];
  text.split('\n').forEach(par => {
    let line = '';
    for (const ch of par) {
      if (ctx.measureText(line + ch).width > maxW && !NOHEAD.includes(ch)) { out.push(line); line = ch; } else line += ch;
    }
    out.push(line);
  });
  return out;
}
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function panel(x, y, w, h, alpha) {
  ctx.save(); ctx.globalAlpha = alpha === undefined ? 0.96 : alpha; rr(x, y, w, h, 10); const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#f6eeda'); g.addColorStop(1, '#e9dcbc'); ctx.fillStyle = g; ctx.fill(); ctx.restore();
  ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 3; rr(x, y, w, h, 10); ctx.stroke(); ctx.strokeStyle = '#b08a4a'; ctx.lineWidth = 1; rr(x + 5, y + 5, w - 10, h - 10, 7); ctx.stroke();
}
function button(x, y, w, h, label, fn, o) {
  o = o || {}; const hot = mouse.x >= x && mouse.x <= x + w && mouse.y >= y && mouse.y <= y + h || o.sel;
  rr(x, y, w, h, 8); ctx.fillStyle = hot ? '#9c2b22' : (o.bg || '#f3e9d0'); ctx.fill(); ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 2.5; ctx.stroke();
  let size = o.size || 22; ctx.font = size + 'px ' + (o.font || F_SONG); const maxW = w - 36;
  while (ctx.measureText(label).width > maxW && size > 14) { size--; ctx.font = size + 'px ' + (o.font || F_SONG); }
  ctx.fillStyle = hot ? '#fbf3dc' : '#3a2416'; ctx.textAlign = o.left ? 'left' : 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, o.left ? x + 18 : x + w / 2, y + h / 2 + 1);
  buttons.push({ x, y, w, h, fn });
}

// ---------- 剧本解释器 ----------
function runSeq(name) { if (!SEQ[name]) { console.error('missing seq', name); return; } G.queue = SEQ[name]().concat(G.queue); G.target = null; G.pending = null; G.moving = false; next(); }
function runSteps(steps) { G.queue = steps.concat(G.queue); G.target = null; G.pending = null; G.moving = false; next(); }
function next() {
  G.dlg = null; G.choice = null;
  while (G.queue.length) {
    const s = G.queue.shift();
    if (Array.isArray(s)) { showLine(s[0], s[1]); return; }
    if (s.f) { s.f(G); continue; }
    if (s.obj) { G.obj = s.obj; continue; }
    if (s.laugh !== undefined) { if (s.laugh > 0) G.laugh += 1; G.laughUntil = G.t + (s.laugh === 2 ? 4.5 : 2.8); continue; }
    if (s.go) { G.queue = SEQ[s.go]().concat(G.queue); continue; }
    if (s.c) { G.choice = { id: s.c, q: s.q, o: s.o, sel: -1, at: G.t }; G.mode = 'dialog'; return; }
    if (s.scene) { G.fade = { t: 0, step: s, applied: false }; G.mode = 'dialog'; return; }
    if (s.end) { showEnding(s.end); return; }
  }
  if (G.mode === 'dialog') G.mode = 'play';
}
function showLine(who, text) {
  const narr = who === null;
  const font = (narr ? 23 : 24) + 'px ' + (narr ? F_KAI : F_SONG);
  const lines = wrap(text, narr ? 940 : (CH[who] ? 820 : 960), font);
  const pages = []; for (let i = 0; i < lines.length; i += 3) pages.push(lines.slice(i, i + 3));
  G.dlg = { who, pages, page: 0, chars: 0, font, narr }; G.mode = 'dialog';
}
function advance() {
  if (G.fade) { if (G.fade.applied && G.fade.t > 0.9) G.fade.skip = true; return; }
  const d = G.dlg; if (!d) return;
  const total = d.pages[d.page].join('').length;
  if (d.chars < total) { d.chars = total; return; }
  if (d.page < d.pages.length - 1) { d.page++; d.chars = 0; return; }
  next();
}
function choose(i) {
  const c = G.choice; if (!c || i < 0 || i >= c.o.length) return;
  const seq = c.o[i][1]; G.choice = null; runSeq(seq);
}
function applyScene(s) {
  G.scene = s.scene; G.stage = s.stage; G.hidePlayer = !!s.hide; G.px = s.x; G.bx = s.x - 60; G.dir = 1; G.target = null; G.pending = null; G.fallUntil = 0; G.laughUntil = 0;
}
function showEnding(id) { G.mode = 'ending'; G.endId = id; G.endT = 0; G.dlg = null; G.choice = null; G.queue = []; G.fade = null; }
function startGame() { reset(); G.mode = 'intro'; G.intro = 0; }
function beginPlay() { G.mode = 'play'; G.scene = 'lou'; G.stage = 'L0'; G.px = 220; G.bx = 150; runSeq('start'); }
function toTitle() { if (location.hash) history.replaceState(null, '', location.pathname + location.search); reset(); }

function applyJump() {
  const m = /jump=([\w]+)/.exec(location.hash || ''); if (!m) return false;
  const j = JUMPS[m[1]]; if (!j) return false;
  reset(); G.mode = 'play'; G.scene = j.scene; G.stage = j.stage; G.px = j.x; G.bx = j.x - 60; G.f = Object.assign({}, j.f); G.laugh = j.laugh || 0; G.bense = j.bense || 0; G.jumped = m[1];
  G.obj = '（评测跳转：' + m[1] + '）';
  if (j.end) { showEnding(j.end); G.endT = 9; } else { runSeq(j.seq); if (G.choice) G.choice.at = -9; }
  return true;
}
window.addEventListener('hashchange', () => { if (!applyJump()) reset(); });

// ---------- 输入 ----------
function interactables() { return SCENES[G.scene].things(G).filter(th => th.k !== 'npc' || th.seq || (th.seq === undefined && IDLE(th.id, G))); }
function nearest() {
  let best = null, bd = 95;
  interactables().forEach(th => { const d = Math.abs(th.x - G.px) - (th.mark ? 60 : 0); if (d < bd && Math.abs(th.x - G.px) < 100) { bd = d; best = th; } });
  return best;
}
function interact(th) {
  if (!th) return;
  if (th.k === 'npc') G.dir = th.x >= G.px ? 1 : -1;
  if (th.seq) runSeq(th.seq); else { const st = IDLE(th.id, G); if (st) runSteps(st.slice()); }
}
window.addEventListener('keydown', e => {
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Enter'].includes(e.key)) e.preventDefault();
  if (e.repeat) { keys[e.key.toLowerCase()] = true; return; }
  keys[e.key.toLowerCase()] = true;
  const act = e.key === ' ' || e.key === 'Enter' || e.key.toLowerCase() === 'e';
  if (G.mode === 'title') { if (act) startGame(); }
  else if (G.mode === 'intro') { if (act) { G.intro++; if (G.intro >= INTRO.length) beginPlay(); } }
  else if (G.mode === 'ending') { if (act && G.endT > 1.5) toTitle(); }
  else if (G.mode === 'dialog') {
    if (G.choice && !G.fade) {
      const c = G.choice, n = c.o.length;
      if (e.key >= '1' && e.key <= String(n)) choose(+e.key - 1);
      else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') c.sel = (c.sel + 1) % n;
      else if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') c.sel = (c.sel + n - 1 + (c.sel < 0 ? 1 : 0)) % n;
      else if (act && c.sel >= 0) choose(c.sel);
    } else if (act) advance();
  } else if (G.mode === 'play') { if (act) interact(nearest()); }
});
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
function mpos(e) { const r = cv.getBoundingClientRect(); mouse.x = (e.clientX - r.left) * W / r.width; mouse.y = (e.clientY - r.top) * H / r.height; }
cv.addEventListener('mousemove', mpos);
cv.addEventListener('mousedown', e => {
  mpos(e);
  for (let i = buttons.length - 1; i >= 0; i--) { const b = buttons[i]; if (mouse.x >= b.x && mouse.x <= b.x + b.w && mouse.y >= b.y && mouse.y <= b.y + b.h) { b.fn(); return; } }
  if (G.mode === 'intro') { G.intro++; if (G.intro >= INTRO.length) beginPlay(); return; }
  if (G.mode === 'dialog') { if (!G.choice || G.fade) advance(); return; }
  if (G.mode === 'play' && !G.f.seated && !SCENES[G.scene].cut) {
    const cam = camX(), wx = mouse.x + cam; let hit = null;
    if (mouse.y > 250 && mouse.y < GY + 40) interactables().forEach(th => { if (Math.abs(th.x - wx) < 48) hit = th; });
    if (hit) { G.pending = hit; G.target = hit.x + (G.px < hit.x ? -62 : 62); if (Math.abs(G.px - hit.x) < 95) { G.target = null; G.pending = null; interact(hit); } }
    else { G.pending = null; G.target = Math.max(60, Math.min(SCENES[G.scene].width - 60, wx)); }
  }
});

// ---------- 更新 ----------
function camX() { const w = SCENES[G.scene].width; return Math.max(0, Math.min(w - W, G.px - W / 2)); }
function update(dt) {
  G.t += dt;
  if (G.mode === 'ending') { G.endT += dt; return; }
  if (G.fade) {
    const fd = G.fade, hold = fd.step.card ? 2.4 : 0.15; fd.t += dt;
    if (!fd.applied && fd.t >= 0.45) { applyScene(fd.step); fd.applied = true; }
    if (fd.skip && fd.t < 0.45 + hold) fd.t = 0.45 + hold;
    if (fd.t >= 0.9 + hold) { G.fade = null; next(); }
    return;
  }
  if (G.dlg) { const d = G.dlg; d.chars = Math.min(d.pages[d.page].join('').length, d.chars + dt * 48); }
  G.moving = false;
  if (G.mode === 'play' && !G.f.seated && !SCENES[G.scene].cut) {
    let vx = 0;
    if (keys['arrowleft'] || keys['a']) vx = -1; if (keys['arrowright'] || keys['d']) vx = 1;
    if (vx) { G.target = null; G.pending = null; }
    else if (G.target !== null) { const d = G.target - G.px; if (Math.abs(d) < 6) { G.target = null; if (G.pending) { const p = G.pending; G.pending = null; interact(p); } } else vx = Math.sign(d); }
    if (vx) { G.px += vx * 270 * dt; G.dir = vx; G.moving = true; G.walk += dt * 9; const w = SCENES[G.scene].width; G.px = Math.max(60, Math.min(w - 60, G.px)); }
  }
  const tx = G.px - 66 * G.dir; const d = tx - G.bx; G.bMoving = Math.abs(d) > 8; if (G.bMoving) G.bx += Math.sign(d) * Math.min(Math.abs(d), 250 * dt);
}

// ---------- 绘制 ----------
function drawScene() {
  const sc = SCENES[G.scene], cam = camX(), t = G.t;
  sc.draw(ctx, cam, t, G);
  const laughing = G.laughUntil > t;
  const things = sc.things(G);
  const near = G.mode === 'play' ? nearest() : null;
  const drawNpc = th => {
    const sx = th.x - cam; if (sx < -120 || sx > W + 120) return;
    if (th.k === 'npc') {
      const fl = th.id === 'jiamu' && G.f.jiamuFlower ? 'red' : null;
      drawChar(ctx, th.id, sx, GY + (th.yoff || 0), { face: th.face, sit: th.sit, laugh: laughing && !th.cry ? t + th.x : 0, flowers: fl, cry: th.cry });
      if (laughing && !th.cry) { for (let i = 0; i < 2; i++) { const a = ((t * 0.9 + th.x * 0.013 + i * 0.5) % 1); ctx.globalAlpha = (1 - a) * 0.9; ctx.fillStyle = '#9c2b22'; ctx.font = (18 + i * 4) + 'px ' + F_KAI; ctx.textAlign = 'center'; ctx.fillText('哈', sx + (i ? 26 : -24) + Math.sin(a * 6 + th.x) * 6, GY - (th.sit ? 150 : 185) - a * 46); } ctx.globalAlpha = 1; }
    } else if (th.k === 'exit' && !/^进/.test(th.label)) {
      ctx.fillStyle = '#6b4a2a'; ctx.fillRect(sx - 4, GY - 120, 8, 120); ctx.fillStyle = '#f3e9d0'; ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(sx - 62, GY - 150); ctx.lineTo(sx + 50, GY - 150); ctx.lineTo(sx + 70, GY - 132); ctx.lineTo(sx + 50, GY - 114); ctx.lineTo(sx - 62, GY - 114); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#3a2416'; ctx.font = '20px ' + F_KAI; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(th.label, sx, GY - 131);
    }
  };
  things.filter(th => !th.front).forEach(drawNpc);
  const showP = !sc.cut && !G.hidePlayer;
  if (showP && G.f.seated) {
    if (!G.f.banerAway) drawChar(ctx, 'baner', G.f.seated + (G.scene === 'qiu' ? 64 : -62) - cam, GY + 4, { face: G.scene === 'qiu' ? -1 : 1 });
    drawChar(ctx, 'liu', G.f.seated - cam, GY, { sit: 1, face: (G.scene === 'qiu' ? -1 : G.f.seated < 1020 ? 1 : -1), flowers: G.f.flowers, smileEyes: laughing });
  }
  if (sc.drawFront) sc.drawFront(ctx, cam, t, G);
  if (showP && !G.f.seated) {
    if (!G.f.banerAway) drawChar(ctx, 'baner', G.bx - cam, GY + 4, { face: G.px >= G.bx ? 1 : -1, walk: G.bMoving ? G.walk * 1.3 : 0, laugh: laughing ? t : 0 });
    drawChar(ctx, 'liu', G.px - cam, GY + 2, { face: G.dir, walk: G.moving ? G.walk : 0, flowers: G.f.flowers, fallen: G.fallUntil > t, smileEyes: laughing });
  }
  things.filter(th => th.front).forEach(drawNpc);
  // 目标标记与交互提示
  if (G.mode === 'play') {
    things.forEach(th => {
      if (!th.mark) return; const sx = th.x - cam, by = GY - (th.k === 'npc' ? (th.sit ? 172 : 205) : 175) + Math.sin(t * 4) * 5;
      if (sx > 30 && sx < W - 30) { ctx.fillStyle = '#e2a82e'; ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx, by + 14); ctx.lineTo(sx - 11, by - 4); ctx.lineTo(sx, by - 20); ctx.lineTo(sx + 11, by - 4); ctx.closePath(); ctx.fill(); ctx.stroke(); }
      else { const right = sx >= W - 30, ax = right ? W - 150 : 20; panel(ax, 300, 130, 40, 0.9); ctx.fillStyle = '#9c2b22'; ctx.font = '19px ' + F_KAI; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(right ? '目标在东 →' : '← 目标在西', ax + 65, 321); }
    });
    if (near && !G.moving) {
      const sx = Math.max(130, Math.min(W - 130, near.x - cam)); const label = near.k === 'npc' ? '交谈 · ' + CH[near.id].name : near.k === 'exit' ? '前往 · ' + near.label.replace(/^[往进]/, '') : near.label;
      ctx.font = '19px ' + F_SONG; const tw = ctx.measureText(label).width + 62; const by = GY - (near.k === 'npc' ? (near.sit ? 222 : 252) : 226);
      panel(sx - tw / 2, by, tw, 36, 0.95); ctx.fillStyle = '#9c2b22'; rr(sx - tw / 2 + 8, by + 7, 26, 22, 4); ctx.fill(); ctx.fillStyle = '#fbf3dc'; ctx.font = 'bold 16px ' + F_SONG; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('E', sx - tw / 2 + 21, by + 19);
      ctx.fillStyle = '#3a2416'; ctx.font = '19px ' + F_SONG; ctx.textAlign = 'left'; ctx.fillText(label, sx - tw / 2 + 42, by + 19);
    }
  }
}
const ACTS = ['大观楼下', '沁芳亭', '潇湘馆', '秋爽斋', '舟中', '缀锦阁下'];
function actIndex() { return G.scene === 'lou' ? (G.stage[0] === 'F' ? 5 : 0) : G.scene === 'ting' ? 1 : G.scene === 'qiu' ? 3 : G.scene === 'boat' ? 4 : 2; }
function drawHUD() {
  const title = SCENES[G.scene].title(G);
  panel(16, 14, 520, 74, 0.9);
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#9c2b22'; ctx.font = 'bold 22px ' + F_KAI; ctx.fillText(title, 32, 38);
  ctx.fillStyle = '#3a2416'; let size = 18; ctx.font = size + 'px ' + F_SONG; const o = '目标：' + (G.obj || '——'); while (ctx.measureText(o).width > 490 && size > 13) { size--; ctx.font = size + 'px ' + F_SONG; } ctx.fillText(o, 32, 67);
  // 进度
  panel(W - 436, 14, 420, 74, 0.9); const ai = actIndex();
  ACTS.forEach((a, i) => { const x = W - 404 + i * 54; ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 2; if (i < 5) { ctx.beginPath(); ctx.moveTo(x + 9, 36); ctx.lineTo(x + 45, 36); ctx.stroke(); } ctx.fillStyle = i < ai ? '#6b4a2a' : i === ai ? '#c9232e' : '#f3e9d0'; ctx.beginPath(); ctx.arc(x, 36, i === ai ? 9 : 7, 0, 7); ctx.fill(); ctx.stroke(); });
  ctx.fillStyle = '#3a2416'; ctx.font = '16px ' + F_SONG; ctx.textAlign = 'left'; ctx.fillText('第' + '一二三四五六'[ai] + '折 / 共六折', W - 414, 69);
  ctx.textAlign = 'right'; ctx.fillText('满座笑声', W - 96, 69); flower(ctx, W - 78, 68, 8, '#c9232e'); ctx.textAlign = 'left'; ctx.font = 'bold 18px ' + F_SONG; ctx.fillStyle = '#9c2b22'; ctx.fillText('× ' + G.laugh, W - 64, 69);
  if (G.mode === 'play' && !SCENES[G.scene].cut) {
    ctx.fillStyle = 'rgba(40,26,14,0.62)'; rr(W / 2 - 330, H - 44, 660, 32, 16); ctx.fill(); ctx.fillStyle = '#f3e9d0'; ctx.font = '17px ' + F_SONG; ctx.textAlign = 'center';
    ctx.fillText(G.f.seated ? '按 E / 空格 继续' : '←  →  或  A  D  行走　·　鼠标点击亦可　·　靠近后按  E / 空格  交谈、查看', W / 2, H - 27);
  }
}
function drawDialog() {
  const d = G.dlg, c = G.choice;
  if (c) {
    ctx.fillStyle = 'rgba(30,20,10,0.26)'; ctx.fillRect(0, 0, W, H);
    const n = c.o.length, bh = 56, gap = 12, y0 = 506 - n * (bh + gap);
    ctx.fillStyle = '#fbf3dc'; ctx.font = 'bold 22px ' + F_KAI; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(40,26,14,0.82)'; rr(W / 2 - 170, y0 - 46, 340, 38, 19); ctx.fill(); ctx.fillStyle = '#fbf3dc'; ctx.fillText('— 姥姥，你怎么办？ —', W / 2, y0 - 26);
    c.o.forEach((op, i) => button(130, y0 + i * (bh + gap), 1020, bh, '一二三四'[i] + '、' + op[0], () => choose(i), { left: 1, size: 21, sel: c.sel === i }));
  }
  if (!d && !c) return;
  panel(110, 532, 1060, 176);
  const who = c ? 'liu' : d.who, isCh = who && CH[who], narr = c ? false : d.narr;
  let tx = 150;
  if (isCh) {
    drawPortrait(ctx, who, 128, 546, 130, 148, { flowers: who === 'liu' ? G.f.flowers : (who === 'jiamu' && G.f.jiamuFlower ? 'red' : null), laugh: G.laughUntil > G.t && who !== 'liu' ? 0.01 : 0, cry: who === 'baner' && G.f.banerCry });
    tx = 284;
  }
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  if (who) { const nm = isCh ? CH[who].name : who; ctx.font = 'bold 22px ' + F_KAI; const nw = ctx.measureText(nm).width + 28; ctx.fillStyle = '#9c2b22'; rr(tx, 546, nw, 32, 6); ctx.fill(); ctx.fillStyle = '#fbf3dc'; ctx.fillText(nm, tx + 14, 563); }
  if (c) {
    ctx.fillStyle = '#3a2416'; ctx.font = '22px ' + F_KAI; wrap(c.q, 840, '22px ' + F_KAI).slice(0, 3).forEach((l, i) => ctx.fillText(l, tx, 606 + i * 32));
    ctx.fillStyle = '#8a6a4a'; ctx.font = '16px ' + F_SONG; ctx.textAlign = 'right'; ctx.fillText('按 ' + (c.o.length === 2 ? '1 / 2' : '1 / 2 / 3') + ' 或点击选择', 1150, 690);
    return;
  }
  ctx.font = d.font; ctx.fillStyle = narr ? '#4a3a2a' : '#2a1a10';
  let left = Math.floor(d.chars); const y0 = narr ? 578 : 606;
  d.pages[d.page].forEach((l, i) => { const s = l.slice(0, Math.max(0, left)); left -= l.length; ctx.fillText(s, tx, y0 + i * 36); });
  const done = d.chars >= d.pages[d.page].join('').length;
  if (done) { ctx.fillStyle = '#9c2b22'; const by = 688 + Math.sin(G.t * 5) * 3; ctx.beginPath(); ctx.moveTo(1136, by - 6); ctx.lineTo(1152, by - 6); ctx.lineTo(1144, by + 5); ctx.fill(); }
  ctx.fillStyle = '#8a6a4a'; ctx.font = '15px ' + F_SONG; ctx.textAlign = 'right'; ctx.fillText('空格 / 点击 继续', 1124, 690);
}
function drawFade() {
  const fd = G.fade; if (!fd) return; const hold = fd.step.card ? 2.4 : 0.15;
  let a = fd.t < 0.45 ? fd.t / 0.45 : fd.t < 0.45 + hold ? 1 : 1 - (fd.t - 0.45 - hold) / 0.45;
  ctx.fillStyle = 'rgba(28,20,14,' + Math.max(0, Math.min(1, a)) + ')'; ctx.fillRect(0, 0, W, H);
  if (fd.step.card && fd.applied && fd.t < 0.45 + hold) {
    const lines = fd.step.card.split('\n'); const big = lines.length === 2 && lines[0].length <= 3;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#f3e9d0';
    lines.forEach((l, i) => { ctx.font = (big ? (i === 0 ? 30 : 54) : 30) + 'px ' + F_KAI; ctx.fillText(l, W / 2, H / 2 + (i - (lines.length - 1) / 2) * (big ? 70 : 50)); });
    ctx.fillStyle = '#c9a24a'; ctx.fillRect(W / 2 - 60, H / 2 + lines.length * 30 + 20, 120, 2);
  }
}
function drawTitle() {
  const g = { stage: 'L0', f: {} };
  SCENES.lou.draw(ctx, 520, G.t, g);
  const gr = ctx.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, 'rgba(246,238,218,0.97)'); gr.addColorStop(0.5, 'rgba(246,238,218,0.86)'); gr.addColorStop(1, 'rgba(246,238,218,0.25)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  drawChar(ctx, 'liu', 1010, 640, { scale: 1.5, face: -1, flowers: 'many' }); drawChar(ctx, 'baner', 1130, 644, { scale: 1.5, face: -1 });
  for (let i = 0; i < 7; i++) { const a = ((G.t * 0.05 + i * 0.143) % 1); ctx.save(); ctx.translate(700 + i * 90 + Math.sin(a * 9 + i) * 30, a * 760 - 20); ctx.rotate(a * 8 + i); ctx.fillStyle = AUTUMN[i % 4]; ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.ellipse(0, 0, 9, 4, 0, 0, 7); ctx.fill(); ctx.restore(); }
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#8f1f1c'; ctx.font = 'bold 132px ' + F_KAI; ctx.fillText('红楼梦', 96, 190);
  ctx.fillStyle = '#b3262e'; rr(560, 132, 54, 112, 6); ctx.fill(); vtext(ctx, '第四十回', 587, 150, 22, '#fbf3dc');
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#6b4a2a'; ctx.fillRect(100, 280, 520, 3);
  ctx.fillStyle = '#3a2416'; ctx.font = '36px ' + F_KAI; ctx.fillText('史太君两宴大观园', 100, 330); ctx.fillText('金鸳鸯三宣牙牌令', 100, 384);
  ctx.fillStyle = '#6b4a2a'; ctx.font = '21px ' + F_SONG; ctx.fillText('叙事探索 · 化身刘姥姥，逛一日大观园', 100, 444);
  button(100, 500, 250, 68, '入　园', startGame, { size: 32, font: F_KAI, bg: '#f9f1dc' });
  ctx.fillStyle = '#7a6248'; ctx.font = '17px ' + F_SONG; ctx.textAlign = 'left'; ctx.fillText('按 空格 / 回车 亦可开始　·　行走 ← → / A D　·　交谈 E / 空格　·　选择 1 2 3 或鼠标', 100, 606);
  ctx.fillText('据曹雪芹《红楼梦》第四十回改编', 100, 660);
}
function drawIntro() {
  ctx.fillStyle = '#f1e7cd'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = 0.22; SCENES.ting.draw(ctx, 300, G.t, { stage: 'T0', f: {} }); ctx.restore();
  ctx.fillStyle = 'rgba(241,231,205,0.6)'; ctx.fillRect(0, 0, W, H);
  const p = INTRO[Math.min(G.intro, INTRO.length - 1)];
  panel(170, 150, 940, 400, 0.93);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#9c2b22'; ctx.font = 'bold 44px ' + F_KAI; ctx.fillText(p[0], W / 2, 220);
  ctx.fillStyle = '#c9a24a'; ctx.fillRect(W / 2 - 70, 258, 140, 2);
  ctx.fillStyle = '#2a1a10'; ctx.font = '25px ' + F_SONG; p[1].split('\n').forEach((l, i) => ctx.fillText(l, W / 2, 316 + i * 48));
  if (G.intro === 1) { drawChar(ctx, 'liu', 250, 540, { scale: 1.0, face: 1 }); drawChar(ctx, 'baner', 1030, 542, { scale: 1.0, face: -1 }); }
  INTRO.forEach((_, i) => { ctx.fillStyle = i === G.intro ? '#9c2b22' : '#c9b48a'; ctx.beginPath(); ctx.arc(W / 2 - 24 + i * 24, 506, 6, 0, 7); ctx.fill(); });
  button(W / 2 - 110, 590, 220, 54, G.intro < INTRO.length - 1 ? '继　续' : '进园去', () => { G.intro++; if (G.intro >= INTRO.length) beginPlay(); }, { size: 26, font: F_KAI });
}
function drawEnding() {
  const e = ENDINGS[G.endId]; const fake = { stage: 'F1', f: Object.assign({}, G.f, { lingOn: 1 }) };
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 176); ctx.clip(); ctx.translate(0, -330); SCENES.lou.draw(ctx, 400, G.t, fake); ctx.restore();
  ctx.fillStyle = '#f1e7cd'; ctx.fillRect(0, 176, W, H - 176); ctx.fillStyle = '#6b4a2a'; ctx.fillRect(0, 174, W, 4);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 174); ctx.clip();
  drawChar(ctx, 'liu', 1010, 172, { scale: 0.86, flowers: G.f.flowers, face: -1, sit: G.endId === 'e3', smileEyes: G.endId === 'e1', laugh: 0 });
  if (G.endId === 'e1') { ['jiamu', 'feng', 'yuanyang'].forEach((id, i) => drawChar(ctx, id, 640 + i * 110, 172, { scale: 0.84, face: 1, laugh: G.t + i, flowers: id === 'jiamu' ? 'red' : null })); }
  else if (G.endId === 'e2') { ['jiamu', 'xueyima'].forEach((id, i) => drawChar(ctx, id, 700 + i * 120, 172, { scale: 0.84, face: 1, flowers: id === 'jiamu' ? 'red' : null })); }
  else drawChar(ctx, 'baner', 1100, 172, { scale: 1.0, face: -1 });
  ctx.restore();
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#9c2b22'; rr(80, 196, ctx.measureText(e.tag).width + 60, 34, 6); ctx.font = '19px ' + F_SONG; const tw = ctx.measureText(e.tag).width; rr(80, 196, tw + 28, 34, 6); ctx.fill(); ctx.fillStyle = '#fbf3dc'; ctx.fillText(e.tag, 94, 214);
  ctx.fillStyle = '#8f1f1c'; ctx.font = 'bold 54px ' + F_KAI; ctx.fillText(e.title, 80, 276);
  ctx.fillStyle = '#2a1a10'; let y = 334; const font = '20px ' + F_SONG;
  e.text(G).forEach(par => { wrap(par, 640, font).forEach(l => { ctx.font = font; ctx.fillStyle = '#2a1a10'; ctx.textAlign = 'left'; ctx.fillText(l, 80, y); y += 29; }); y += 9; });
  panel(780, 200, 430, 420, 0.9);
  ctx.fillStyle = '#9c2b22'; ctx.font = 'bold 24px ' + F_KAI; ctx.textAlign = 'left'; ctx.fillText('这一日 · 姥姥的账', 806, 236);
  ctx.fillStyle = '#c9a24a'; ctx.fillRect(806, 256, 378, 2);
  let sy = 284; summary(G).forEach(s => { flower(ctx, 814, sy, 6, '#c9762e'); wrap(s, 350, '18px ' + F_SONG).forEach(l => { ctx.font = '18px ' + F_SONG; ctx.fillStyle = '#3a2416'; ctx.textAlign = 'left'; ctx.fillText(l, 832, sy); sy += 26; }); sy += 8; });
  button(780, 640, 205, 52, '回到标题', toTitle, { size: 23, font: F_KAI });
  button(1005, 640, 205, 52, '再入园一回', startGame, { size: 23, font: F_KAI });
  ctx.fillStyle = '#7a6248'; ctx.font = '16px ' + F_SONG; ctx.textAlign = 'left'; ctx.fillText('共三种结局。换一种应对，再逛一回大观园。', 80, 668);
  if (G.endT < 1) { ctx.fillStyle = 'rgba(28,20,14,' + (1 - G.endT) + ')'; ctx.fillRect(0, 0, W, H); }
}
function render() {
  buttons = [];
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
  if (G.mode === 'title') drawTitle();
  else if (G.mode === 'intro') drawIntro();
  else if (G.mode === 'ending') drawEnding();
  else { drawScene(); drawHUD(); drawDialog(); drawFade(); }
  paperOverlay(ctx);
}
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  try { update(dt); render(); } catch (err) { console.error(err); window.__err = String(err && err.stack || err); }
  requestAnimationFrame(frame);
}
function fit() { const s = Math.min(window.innerWidth / W, window.innerHeight / H); cv.style.width = Math.floor(W * s) + 'px'; cv.style.height = Math.floor(H * s) + 'px'; }
window.addEventListener('resize', fit); fit();
applyJump();
requestAnimationFrame(frame);
