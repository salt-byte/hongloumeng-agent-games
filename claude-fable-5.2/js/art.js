// art.js —— 全部画面元素用 Canvas 代码绘制（人物、建筑、陈设、山水）
'use strict';
const W = 1280, H = 720, GY = 520; // 画布尺寸与人物立足的地面线
const F_SONG = '"Songti SC","STSong","Noto Serif CJK SC","Source Han Serif SC","SimSun","Noto Sans CJK SC","PingFang SC",serif';
const F_KAI = '"Kaiti SC","STKaiti","KaiTi","Noto Serif CJK SC","Songti SC","Noto Sans CJK SC",serif';

function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ---------- 人物 ----------
const CH = {
  liu: { name: '刘姥姥', hair: 'granny', robe: '#3f5f86', skirt: '#5d4b3c', trim: '#26384f', age: 2, h: 0.96 },
  baner: { name: '板儿', hair: 'kid', robe: '#7d8f4c', skirt: '#4b5a6b', trim: '#55632f', h: 0.6 },
  jiamu: { name: '贾母', hair: 'matron', robe: '#4b3763', skirt: '#6e2a2e', trim: '#c9a24a', age: 2, h: 0.98, pattern: 1 },
  feng: { name: '凤姐', hair: 'lady', gold: 2, robe: '#c9232e', skirt: '#2f6e58', trim: '#e7c35a', pattern: 1 },
  yuanyang: { name: '鸳鸯', hair: 'maid', robe: '#dcc9da', vest: '#34465a', skirt: '#8fb09c', trim: '#f3ecf1' },
  hupo: { name: '琥珀', hair: 'maid', robe: '#e6d6ab', vest: '#7c3d3d', skirt: '#6e80a5', trim: '#f4eed8' },
  zijuan: { name: '紫鹃', hair: 'maid', robe: '#d2dbe8', vest: '#5c4b7c', skirt: '#6c8c7c', trim: '#eef2f7' },
  fenger: { name: '丰儿', hair: 'maid', robe: '#ead2d2', vest: '#3f6050', skirt: '#a78a6a', trim: '#f6eaea' },
  liwan: { name: '李纨', hair: 'lady', gold: 0, robe: '#9db0b8', skirt: '#e6e2d8', trim: '#6f8490' },
  wangfuren: { name: '王夫人', hair: 'lady', gold: 1, robe: '#56705c', skirt: '#3b3b4d', trim: '#c9b26a', age: 1 },
  xueyima: { name: '薛姨妈', hair: 'lady', gold: 1, robe: '#84603c', skirt: '#43324d', trim: '#d6bd7c', age: 1 },
  daiyu: { name: '林黛玉', hair: 'miss', robe: '#e3ecf0', skirt: '#9cc1b5', trim: '#7fa79a', slim: 1 },
  baochai: { name: '薛宝钗', hair: 'miss', robe: '#e4cb92', skirt: '#c7b68a', trim: '#a8884a' },
  xiangyun: { name: '史湘云', hair: 'miss', robe: '#e9a2aa', skirt: '#7088b7', trim: '#b9505e' },
  tanchun: { name: '探春', hair: 'miss', robe: '#b9d2ea', skirt: '#d6b44e', trim: '#5f86ad' },
  yingchun: { name: '迎春', hair: 'miss', robe: '#dac4e2', skirt: '#a6ba9c', trim: '#8d6f9c' },
  xichun: { name: '惜春', hair: 'miss', robe: '#f1dbc2', skirt: '#80a2c2', trim: '#c08a5a', h: 0.84 },
  baoyu: { name: '贾宝玉', hair: 'boy', robe: '#b5272f', skirt: '#2d4b7d', trim: '#e5c45c', pattern: 1 },
  pozi: { name: '婆子', hair: 'granny', robe: '#6b6f66', skirt: '#4a4d52', trim: '#3f423d', age: 1, h: 0.94 },
  yatou: { name: '小丫头', hair: 'maid', robe: '#cfe0d0', vest: '#8a5a4a', skirt: '#7a8fa8', trim: '#eef4ee', h: 0.88 },
};
const SKIN = '#f3dcc4', SKIN_OLD = '#e6c9a8';

function flower(ctx, x, y, r, col) {
  ctx.fillStyle = col;
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.55, r * 0.3, a, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#f6d55c'; ctx.beginPath(); ctx.arc(x, y, r * 0.3, 0, 7); ctx.fill();
}

// 以脚底 (x,y) 为原点画人物。opt: scale, face(1右/-1左), walk(相位), sit, laugh, flowers, fallen, cry
function drawChar(ctx, id, x, y, opt) {
  opt = opt || {};
  const c = CH[id] || CH.pozi;
  const s = (opt.scale || 1) * (c.h || 1);
  const face = opt.face || 1;
  const wp = opt.walk || 0, walking = !!opt.walk;
  const bob = walking ? Math.abs(Math.sin(wp)) * 3 : 0;
  const lb = opt.laugh ? Math.sin(opt.laugh * 18) * 2.5 : 0;
  ctx.save();
  ctx.translate(x, y);
  if (!opt.noShadow) { ctx.fillStyle = 'rgba(40,30,20,0.18)'; ctx.beginPath(); ctx.ellipse(0, 2, 30 * s, 6 * s, 0, 0, 7); ctx.fill(); }
  if (opt.fallen) { ctx.translate(20 * face, -14 * s); ctx.rotate(face * 1.35); }
  ctx.scale(s * face, s);
  ctx.translate(0, -bob + lb);
  const old = c.age === 2, skin = old ? SKIN_OLD : SKIN;
  const kid = c.hair === 'kid';
  const skH = opt.sit ? 58 : (kid ? 80 : 94);
  const hip = -skH;
  const sway = walking ? Math.sin(wp) * 3 : 0;
  const slim = c.slim ? 0.88 : 1;
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // 鞋
  ctx.fillStyle = id === 'liu' || id === 'pozi' ? '#2b2620' : (kid ? '#2b2620' : '#8a2c36');
  const fx = walking ? Math.sin(wp) * 9 : 0;
  ctx.beginPath(); ctx.ellipse(-8 + fx, -2, 9, 4.5, 0, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(10 - fx, -2, 9, 4.5, 0, 0, 7); ctx.fill();
  if (kid) { // 裤
    ctx.fillStyle = c.skirt;
    ctx.fillRect(-15 + fx * 0.5, hip - 2, 13, skH - 2); ctx.fillRect(3 - fx * 0.5, hip - 2, 13, skH - 2);
  } else { // 裙
    const bw = (opt.sit ? 36 : 28) * slim;
    ctx.fillStyle = c.skirt;
    ctx.beginPath(); ctx.moveTo(-18 * slim, hip - 2); ctx.lineTo(18 * slim, hip - 2);
    ctx.quadraticCurveTo(bw + 2, -30, bw + sway, -5); ctx.quadraticCurveTo(sway, 1, -bw + sway, -5);
    ctx.quadraticCurveTo(-bw - 2, -30, -18 * slim, hip - 2); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.13)'; ctx.lineWidth = 1.2;
    for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * 6 * slim, hip + 4); ctx.lineTo(i * 10 * slim + sway, -7); ctx.stroke(); }
    if (id === 'liu') { // 围裙
      ctx.fillStyle = '#7b8a94'; ctx.beginPath(); ctx.moveTo(-11, hip); ctx.lineTo(14, hip); ctx.lineTo(18, -34); ctx.lineTo(-13, -34); ctx.fill();
    }
  }
  // 上袄
  const tw = (kid ? 19 : 22) * slim;
  ctx.fillStyle = c.robe;
  ctx.beginPath(); ctx.moveTo(-tw + 3, hip - 46); ctx.quadraticCurveTo(0, hip - 54, tw - 3, hip - 46);
  ctx.lineTo(tw + 3, hip + 10); ctx.quadraticCurveTo(0, hip + 15, -tw - 3, hip + 10); ctx.closePath(); ctx.fill();
  if (c.vest) { ctx.fillStyle = c.vest; ctx.beginPath(); ctx.moveTo(-tw + 6, hip - 46); ctx.lineTo(tw - 6, hip - 46); ctx.lineTo(tw - 2, hip + 4); ctx.lineTo(-tw + 2, hip + 4); ctx.closePath(); ctx.fill(); }
  if (c.pattern) { ctx.fillStyle = c.trim; ctx.globalAlpha = 0.55; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(-12 + (i * 7) % 26, hip - 4 - (i * 11) % 22, 2, 0, 7); ctx.fill(); } ctx.globalAlpha = 1; }
  // 交领
  ctx.strokeStyle = c.trim; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-8, hip - 49); ctx.lineTo(5, hip - 22); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(9, hip - 49); ctx.lineTo(0, hip - 33); ctx.stroke();
  // 袖
  const armSw = walking ? Math.sin(wp) * 5 : 0;
  ctx.fillStyle = c.robe;
  ctx.beginPath(); ctx.moveTo(-tw + 4, hip - 45); ctx.quadraticCurveTo(-tw - 12, hip - 26, -tw - 8 - armSw, hip - 2); ctx.lineTo(-4 - armSw, hip + 4); ctx.lineTo(-6, hip - 22); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(tw - 4, hip - 45); ctx.quadraticCurveTo(tw + 12, hip - 26, tw + 8 + armSw, hip - 2); ctx.lineTo(10 + armSw, hip + 6); ctx.lineTo(8, hip - 22); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(-tw - 8 - armSw, hip - 2); ctx.lineTo(-4 - armSw, hip + 4); ctx.moveTo(tw + 8 + armSw, hip - 2); ctx.lineTo(10 + armSw, hip + 6); ctx.stroke();
  ctx.strokeStyle = c.trim; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-tw - 7 - armSw, hip - 1); ctx.lineTo(-5 - armSw, hip + 5); ctx.moveTo(tw + 7 + armSw, hip - 1); ctx.lineTo(9 + armSw, hip + 7); ctx.stroke();
  ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(2, hip + 5, 6, 4, 0, 0, 7); ctx.fill();
  // 颈、头
  const hy = hip - 66;
  ctx.fillStyle = skin; ctx.fillRect(-4, hip - 54, 9, 8);
  const hairCol = old ? '#b9b6b0' : (c.age === 1 ? '#2a2422' : '#191514');
  // 后发
  ctx.fillStyle = hairCol;
  if (c.hair === 'miss' || c.hair === 'maid') { ctx.beginPath(); ctx.ellipse(-6, hy + 6, 15, 20, 0.15, 0, 7); ctx.fill(); if (c.hair === 'miss') { ctx.fillRect(-19, hy + 4, 6, 34); } else { ctx.beginPath(); ctx.moveTo(-14, hy + 10); ctx.quadraticCurveTo(-22, hy + 40, -15, hy + 58); ctx.lineTo(-11, hy + 58); ctx.quadraticCurveTo(-15, hy + 36, -8, hy + 14); ctx.fill(); ctx.fillStyle = '#b3262e'; ctx.fillRect(-17, hy + 50, 7, 3); ctx.fillStyle = hairCol; } }
  else if (c.hair !== 'kid') { ctx.beginPath(); ctx.ellipse(-5, hy + 2, 15, 17, 0, 0, 7); ctx.fill(); }
  ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(1, hy, 14.5, 16.5, 0, 0, 7); ctx.fill();
  // 耳
  ctx.beginPath(); ctx.ellipse(-12, hy + 2, 3, 4.5, 0, 0, 7); ctx.fill();
  // 顶发与发式
  ctx.fillStyle = hairCol;
  if (c.hair === 'kid') {
    ctx.beginPath(); ctx.ellipse(1, hy - 15, 6, 5, 0, 0, 7); ctx.fill(); ctx.fillRect(-1, hy - 24, 4, 8);
    ctx.fillStyle = '#b3262e'; ctx.fillRect(-2, hy - 19, 6, 2.5);
  } else {
    ctx.beginPath(); ctx.moveTo(-14.5, hy + 3); ctx.quadraticCurveTo(-17, hy - 19, 2, hy - 18.5); ctx.quadraticCurveTo(17, hy - 18, 15.5, hy - 3);
    ctx.quadraticCurveTo(9, hy - 11, 0, hy - 10.5); ctx.quadraticCurveTo(-9, hy - 10, -11, hy + 3); ctx.closePath(); ctx.fill();
    if (c.hair === 'granny') { ctx.beginPath(); ctx.ellipse(-9, hy - 15, 8, 7, 0, 0, 7); ctx.fill(); ctx.fillStyle = id === 'liu' ? '#27405e' : '#3a3a36'; ctx.fillRect(-14, hy - 12.5, 29, 4.5); ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-18, hy - 17); ctx.lineTo(-2, hy - 13); ctx.stroke(); }
    if (c.hair === 'matron') { ctx.beginPath(); ctx.ellipse(-6, hy - 19, 10, 8, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#2a2230'; ctx.fillRect(-14, hy - 13, 29.5, 6); ctx.fillStyle = '#3fae8c'; ctx.beginPath(); ctx.ellipse(4, hy - 10, 3.2, 2.6, 0, 0, 7); ctx.fill(); ctx.strokeStyle = '#d7b24f'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-18, hy - 22); ctx.lineTo(0, hy - 18); ctx.stroke(); }
    if (c.hair === 'lady') {
      ctx.beginPath(); ctx.ellipse(-3, hy - 23, 12, 9, -0.2, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(-12, hy - 12, 6, 8, 0, 0, 7); ctx.fill();
      if (c.gold) { ctx.fillStyle = '#e2bb4c'; ctx.beginPath(); ctx.moveTo(2, hy - 22); ctx.lineTo(14, hy - 28); ctx.lineTo(10, hy - 19); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.arc(1, hy - 21, 3.2, 0, 7); ctx.fill(); if (c.gold > 1) { ctx.fillRect(-12, hy - 30, 3, 6); ctx.fillStyle = '#c9232e'; ctx.beginPath(); ctx.arc(13, hy - 25, 2.2, 0, 7); ctx.fill(); ctx.strokeStyle = '#e2bb4c'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(13, hy - 23); ctx.lineTo(14, hy - 13); ctx.stroke(); } }
      else { ctx.strokeStyle = '#cfd3d6'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-14, hy - 26); ctx.lineTo(6, hy - 22); ctx.stroke(); }
    }
    if (c.hair === 'miss') { ctx.beginPath(); ctx.ellipse(-8, hy - 20, 8, 7, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(6, hy - 21, 7, 6, 0, 0, 7); ctx.fill(); ctx.fillStyle = c.trim; ctx.beginPath(); ctx.arc(9, hy - 17, 2.6, 0, 7); ctx.fill(); ctx.fillStyle = '#f2f2ea'; ctx.beginPath(); ctx.arc(-1, hy - 19, 2, 0, 7); ctx.fill(); }
    if (c.hair === 'maid') { ctx.beginPath(); ctx.ellipse(-10, hy - 19, 6.5, 6.5, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(9, hy - 19, 6.5, 6.5, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#b3262e'; ctx.fillRect(-13, hy - 14.5, 6, 2.5); ctx.fillRect(6, hy - 14.5, 6, 2.5); }
    if (c.hair === 'boy') { ctx.fillStyle = '#b08a2e'; ctx.beginPath(); ctx.moveTo(-6, hy - 17); ctx.lineTo(-4, hy - 28); ctx.lineTo(6, hy - 28); ctx.lineTo(8, hy - 17); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#c9232e'; ctx.beginPath(); ctx.arc(1, hy - 31, 4, 0, 7); ctx.fill(); ctx.fillStyle = '#d7b24f'; ctx.fillRect(-13.5, hy - 12, 29, 3.5); ctx.fillStyle = '#e8e2d0'; ctx.beginPath(); ctx.arc(2, hy - 10.3, 2.3, 0, 7); ctx.fill(); }
  }
  // 头上的花
  const fl = opt.flowers;
  if (fl === 'one' || fl === 'red') flower(ctx, -9, hy - 17, 6, '#c9232e');
  if (fl === 'many') { const cols = ['#c9232e', '#e8b33c', '#f1ede2', '#b85aa0', '#e8b33c', '#c9232e', '#f1ede2']; const ps = [[-13, -14], [-5, -24], [6, -23], [14, -13], [-15, -3], [1, -29], [12, -24]]; ps.forEach((p, i) => flower(ctx, p[0], hy + p[1], 5.5, cols[i])); }
  // 五官
  const ex1 = -3, ex2 = 8.5, ey = hy + 0.5;
  ctx.strokeStyle = '#2a1d18'; ctx.lineWidth = 1.5;
  if (opt.laugh || opt.smileEyes) { ctx.beginPath(); ctx.arc(ex1, ey + 1.5, 2.6, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); ctx.beginPath(); ctx.arc(ex2, ey + 1.5, 2.6, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
  else if (opt.cry) { ctx.beginPath(); ctx.moveTo(ex1 - 2.5, ey - 1); ctx.lineTo(ex1 + 2.5, ey + 1); ctx.moveTo(ex2 + 2.5, ey - 1); ctx.lineTo(ex2 - 2.5, ey + 1); ctx.stroke(); ctx.fillStyle = '#7fb6e0'; ctx.beginPath(); ctx.ellipse(ex1, ey + 6, 1.5, 3, 0, 0, 7); ctx.fill(); }
  else { ctx.beginPath(); ctx.moveTo(ex1 - 2.8, ey); ctx.quadraticCurveTo(ex1, ey - 1.8, ex1 + 2.8, ey + 0.2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(ex2 - 2.8, ey + 0.2); ctx.quadraticCurveTo(ex2, ey - 1.8, ex2 + 2.8, ey); ctx.stroke(); ctx.fillStyle = '#1a1210'; ctx.beginPath(); ctx.arc(ex1 + 0.3, ey + 0.6, 1.3, 0, 7); ctx.arc(ex2 + 0.3, ey + 0.6, 1.3, 0, 7); ctx.fill(); }
  ctx.strokeStyle = old ? '#8d8a84' : '#2a1d18'; ctx.lineWidth = 1.1;
  ctx.beginPath(); ctx.moveTo(ex1 - 3.5, ey - 5); ctx.quadraticCurveTo(ex1, ey - 6.8, ex1 + 3.5, ey - 5); ctx.moveTo(ex2 - 3.5, ey - 5); ctx.quadraticCurveTo(ex2, ey - 6.8, ex2 + 3.5, ey - 5); ctx.stroke();
  ctx.strokeStyle = 'rgba(150,100,80,0.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(3.5, ey + 2); ctx.lineTo(4.5, ey + 5.5); ctx.lineTo(2.8, ey + 5.8); ctx.stroke();
  if (old || c.age === 1) { ctx.strokeStyle = 'rgba(120,85,60,0.55)'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(-3, ey + 8); ctx.quadraticCurveTo(-5, ey + 10, -4.5, ey + 12); ctx.moveTo(9.5, ey + 8); ctx.quadraticCurveTo(11, ey + 10, 10.5, ey + 12); if (old) { ctx.moveTo(-5, hy - 7.5); ctx.lineTo(9, hy - 7.5); ctx.moveTo(ex2 + 3.5, ey + 1.5); ctx.lineTo(ex2 + 5.5, ey + 3); } ctx.stroke(); }
  if (!old) { ctx.fillStyle = 'rgba(230,120,120,0.22)'; ctx.beginPath(); ctx.arc(-5, ey + 6, 3.4, 0, 7); ctx.arc(10, ey + 6, 3.4, 0, 7); ctx.fill(); }
  // 嘴
  if (opt.laugh) { ctx.fillStyle = '#8a2630'; ctx.beginPath(); ctx.arc(3.2, ey + 9, 3.6, 0, Math.PI); ctx.fill(); }
  else if (opt.cry) { ctx.fillStyle = '#8a2630'; ctx.beginPath(); ctx.ellipse(3.2, ey + 10.5, 3, 3.5, 0, 0, 7); ctx.fill(); }
  else { ctx.strokeStyle = old ? '#9a5a50' : '#b4343e'; ctx.lineWidth = 1.7; ctx.beginPath(); ctx.moveTo(0.4, ey + 9.6); ctx.quadraticCurveTo(3.2, ey + 11.6, 6, ey + 9.6); ctx.stroke(); }
  ctx.restore();
}

// 头像：把人物放大后裁成半身
function drawPortrait(ctx, id, x, y, w, h, opt) {
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#efe3c8'); g.addColorStop(1, '#d9c7a0'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  const c = CH[id] || CH.pozi; const sc = 3.0 / (c.h || 1) * (c.hair === 'kid' ? 0.92 : 1);
  const hy = (c.hair === 'kid' ? 80 : 94) + 66;
  drawChar(ctx, id, x + w / 2 - 4, y + h * 0.5 + hy * 3.0 * (c.hair === 'kid' ? 0.92 : 1) + 12, Object.assign({ scale: sc, noShadow: 1 }, opt || {}));
  ctx.restore();
  ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 3; ctx.strokeRect(x, y, w, h);
  ctx.strokeStyle = '#c9a24a'; ctx.lineWidth = 1; ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);
}

// ---------- 景物部件 ----------
function sky(ctx, a, b, c) { const g = ctx.createLinearGradient(0, 0, 0, GY); g.addColorStop(0, a); g.addColorStop(0.7, b); g.addColorStop(1, c || b); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
function hills(ctx, off, col, base, amp, seed) {
  const r = mulberry(seed); const ph = [r() * 6, r() * 6, r() * 6];
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, GY);
  for (let x = 0; x <= W; x += 16) { const u = (x + off) / 200; ctx.lineTo(x, base - amp * (Math.sin(u + ph[0]) * 0.5 + Math.sin(u * 2.3 + ph[1]) * 0.3 + Math.sin(u * 0.6 + ph[2]) * 0.4)); }
  ctx.lineTo(W, GY); ctx.fill();
}
function roof(ctx, x, y, w, h, col, ridge) {
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(x - 44, y + h - 20); ctx.quadraticCurveTo(x + w * 0.1, y + h * 0.5, x + w * 0.22, y); ctx.lineTo(x + w * 0.78, y);
  ctx.quadraticCurveTo(x + w * 0.9, y + h * 0.5, x + w + 44, y + h - 20); ctx.lineTo(x + w + 22, y + h); ctx.lineTo(x - 22, y + h); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.22)'; ctx.lineWidth = 2;
  const n = Math.floor(w / 16);
  for (let i = 0; i <= n; i++) { const u = i / n; const tx = x + w * (0.22 + 0.56 * u), bx = x - 22 + (w + 44) * u; ctx.beginPath(); ctx.moveTo(tx, y + 3); ctx.quadraticCurveTo((tx + bx) / 2 + (0.5 - u) * 14, y + h * 0.6, bx, y + h); ctx.stroke(); }
  ctx.fillStyle = ridge || '#3a3f44'; ctx.fillRect(x + w * 0.2, y - 7, w * 0.6, 9);
  ctx.beginPath(); ctx.moveTo(x + w * 0.2, y - 7); ctx.lineTo(x + w * 0.2 - 12, y - 18); ctx.lineTo(x + w * 0.2 + 10, y - 7); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + w * 0.8, y - 7); ctx.lineTo(x + w * 0.8 + 12, y - 18); ctx.lineTo(x + w * 0.8 - 10, y - 7); ctx.fill();
  ctx.fillStyle = '#c8b68c'; ctx.fillRect(x - 22, y + h, w + 44, 5);
}
function lattice(ctx, x, y, w, h, bg, fg) {
  ctx.fillStyle = bg || '#e9dfc4'; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = fg || '#7a2e25'; ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  ctx.lineWidth = 1.3; ctx.beginPath();
  for (let i = 1; i < 4; i++) { ctx.moveTo(x + w * i / 4, y); ctx.lineTo(x + w * i / 4, y + h); }
  for (let j = 1; j < Math.round(h / (w / 4)); j++) { const yy = y + j * (w / 4); if (yy < y + h) { ctx.moveTo(x, yy); ctx.lineTo(x + w, yy); } }
  ctx.stroke();
}
function column(ctx, x, y0, y1, col) { ctx.fillStyle = col || '#9c2b22'; ctx.fillRect(x - 9, y0, 18, y1 - y0); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(x - 6, y0, 4, y1 - y0); ctx.fillStyle = '#8f8b80'; ctx.fillRect(x - 13, y1 - 10, 26, 10); }
function beam(ctx, x, y, w, h) { // 彩画额枋
  ctx.fillStyle = '#2f5d73'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#3d8a6a'; for (let i = 0; i < w / 60; i++) { ctx.fillRect(x + i * 60 + 8, y + 4, 34, h - 8); }
  ctx.fillStyle = '#d8b24f'; for (let i = 0; i < w / 60; i++) { ctx.beginPath(); ctx.arc(x + i * 60 + 25, y + h / 2, 4, 0, 7); ctx.fill(); ctx.fillRect(x + i * 60 + 48, y + 3, 3, h - 6); }
  ctx.fillStyle = '#7a2e25'; ctx.fillRect(x, y + h, w, 4);
}
function plaque(ctx, x, y, text, w) { w = w || 120; ctx.fillStyle = '#1f2a33'; ctx.fillRect(x - w / 2, y, w, 40); ctx.strokeStyle = '#d8b24f'; ctx.lineWidth = 3; ctx.strokeRect(x - w / 2, y, w, 40); ctx.fillStyle = '#e8c96a'; ctx.font = 'bold 24px ' + F_KAI; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x, y + 21); }
function tree(ctx, x, y, sz, cols, seed) {
  const r = mulberry(seed);
  ctx.strokeStyle = '#4a382c'; ctx.lineWidth = sz * 0.09; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + sz * 0.1, y - sz * 0.5, x - sz * 0.05, y - sz); ctx.stroke();
  ctx.lineWidth = sz * 0.04; ctx.beginPath(); ctx.moveTo(x + sz * 0.03, y - sz * 0.55); ctx.lineTo(x + sz * 0.35, y - sz * 0.95); ctx.moveTo(x, y - sz * 0.7); ctx.lineTo(x - sz * 0.35, y - sz * 1.0); ctx.stroke();
  for (let i = 0; i < 26; i++) { const a = r() * 6.28, d = r() * sz * 0.5; ctx.fillStyle = cols[Math.floor(r() * cols.length)]; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * d * 1.15, y - sz * 1.05 + Math.sin(a) * d * 0.7, sz * (0.13 + r() * 0.1), sz * (0.09 + r() * 0.07), r() * 3, 0, 7); ctx.fill(); }
  ctx.globalAlpha = 1;
}
function willow(ctx, x, y, sz, seed, t) {
  const r = mulberry(seed);
  ctx.strokeStyle = '#4d3d30'; ctx.lineWidth = sz * 0.07; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x - sz * 0.15, y - sz * 0.6, x + sz * 0.1, y - sz); ctx.stroke();
  for (let i = 0; i < 22; i++) { const bx = x + sz * 0.1 + (r() - 0.5) * sz * 0.9, by = y - sz * (0.85 + r() * 0.25), len = sz * (0.45 + r() * 0.4), sw = Math.sin(t * 0.8 + i) * 5; ctx.strokeStyle = r() > 0.5 ? '#9aa45a' : '#b7a94e'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x + sz * 0.1, y - sz); ctx.quadraticCurveTo(bx, by - 10, bx + sw * 0.3, by + len * 0.3); ctx.quadraticCurveTo(bx + sw * 0.6, by + len * 0.7, bx + sw, by + len); ctx.stroke(); }
}
function bamboo(ctx, x, y, h, seed, t, col) {
  const r = mulberry(seed); const lean = (r() - 0.5) * 30 + Math.sin(t * 0.7 + seed) * 3;
  ctx.strokeStyle = col || '#5f8f4e'; ctx.lineWidth = 5 + r() * 3; ctx.lineCap = 'butt';
  const segs = Math.floor(h / 42);
  for (let i = 0; i < segs; i++) { const u0 = i / segs, u1 = (i + 1) / segs; ctx.beginPath(); ctx.moveTo(x + lean * u0 * u0, y - h * u0); ctx.lineTo(x + lean * u1 * u1, y - h * u1 + 3); ctx.stroke(); }
  ctx.fillStyle = col || '#5f8f4e';
  for (let i = 0; i < 14; i++) { const u = 0.35 + r() * 0.65; const lx = x + lean * u * u, ly = y - h * u; const a = (r() - 0.5) * 2.2 + (r() > 0.5 ? 0.3 : 2.8); const L = 26 + r() * 22; ctx.save(); ctx.translate(lx, ly); ctx.rotate(a + Math.sin(t + i) * 0.04); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(L * 0.5, -6, L, 2); ctx.quadraticCurveTo(L * 0.5, 5, 0, 0); ctx.fill(); ctx.restore(); }
}
function rock(ctx, x, y, sz, seed) {
  const r = mulberry(seed); ctx.fillStyle = '#9aa0a0';
  ctx.beginPath(); ctx.moveTo(x - sz * 0.5, y); for (let i = 0; i <= 8; i++) { const u = i / 8; ctx.lineTo(x - sz * 0.5 + sz * u + (r() - 0.5) * sz * 0.15, y - Math.sin(u * Math.PI) * sz * (0.7 + r() * 0.5)); } ctx.lineTo(x + sz * 0.5, y); ctx.fill();
  ctx.fillStyle = 'rgba(40,50,55,0.35)'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(x + (r() - 0.5) * sz * 0.5, y - sz * (0.2 + r() * 0.5), sz * 0.07, sz * 0.11, r(), 0, 7); ctx.fill(); }
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - sz * 0.2, y - sz * 0.6); ctx.lineTo(x - sz * 0.05, y - sz * 0.85); ctx.stroke();
}
function water(ctx, y0, y1, t, a, b) {
  const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a || '#a9c4c0'); g.addColorStop(1, b || '#6f9aa0'); ctx.fillStyle = g; ctx.fillRect(0, y0, W, y1 - y0);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.5;
  for (let i = 0; i < 26; i++) { const yy = y0 + 8 + ((i * 37) % Math.max(10, (y1 - y0 - 12))); const xx = ((i * 197 + t * (10 + i % 5 * 4)) % (W + 200)) - 100; ctx.beginPath(); ctx.moveTo(xx, yy); ctx.quadraticCurveTo(xx + 20, yy - 3, xx + 44, yy); ctx.stroke(); }
}
function lotus(ctx, x, y, sz, seed, t) { // 残荷
  const r = mulberry(seed); const sw = Math.sin(t * 0.9 + seed) * 2;
  ctx.strokeStyle = '#6b6a3e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + sw, y - sz * 0.6, x + sw * 2 + (r() - 0.5) * 12, y - sz); ctx.stroke();
  ctx.fillStyle = ['#8a8a4a', '#9a7b3e', '#7a8a52'][Math.floor(r() * 3)];
  ctx.save(); ctx.translate(x + sw * 2, y - sz); ctx.rotate((r() - 0.5) * 1.2); ctx.beginPath(); ctx.ellipse(0, 0, sz * 0.5, sz * 0.2, 0, 0, 5.4); ctx.lineTo(0, 0); ctx.fill(); ctx.restore();
}
function mumPot(ctx, x, y, col, seed) { // 盆菊
  const r = mulberry(seed);
  ctx.fillStyle = '#5b7a8a'; ctx.beginPath(); ctx.moveTo(x - 16, y - 22); ctx.lineTo(x + 16, y - 22); ctx.lineTo(x + 11, y); ctx.lineTo(x - 11, y); ctx.fill(); ctx.fillStyle = '#e8e2d0'; ctx.fillRect(x - 17, y - 25, 34, 5);
  ctx.strokeStyle = '#4f6e3a'; ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) { const fx = x + (r() - 0.5) * 36, fy = y - 40 - r() * 26; ctx.beginPath(); ctx.moveTo(x, y - 24); ctx.quadraticCurveTo(x, fy + 10, fx, fy); ctx.stroke(); flower(ctx, fx, fy, 7, col[i % col.length]); }
}
function gaoji(ctx, x, y, top, style) { // 高几/雕漆几，上置攒盒与自斟壶
  ctx.fillStyle = '#6e2420'; ctx.fillRect(x - 24, y - 52, 48, 7); ctx.fillRect(x - 20, y - 46, 4, 46); ctx.fillRect(x + 16, y - 46, 4, 46);
  ctx.strokeStyle = '#6e2420'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 18, y - 16); ctx.lineTo(x + 18, y - 16); ctx.stroke();
  ctx.fillStyle = '#b98a3a'; ctx.fillRect(x - 24, y - 53, 48, 2);
  if (top) { ctx.fillStyle = '#a3282a'; if (style % 2) { ctx.beginPath(); ctx.ellipse(x - 7, y - 57, 13, 5, 0, 0, 7); ctx.fill(); } else ctx.fillRect(x - 19, y - 62, 24, 9); ctx.fillStyle = '#d8b24f'; ctx.fillRect(x - 12, y - 60, 10, 2); ctx.fillStyle = '#9fa6ad'; ctx.beginPath(); ctx.ellipse(x + 13, y - 60, 5, 7, 0, 0, 7); ctx.fill(); ctx.fillRect(x + 11, y - 71, 4, 6); ctx.strokeStyle = '#9fa6ad'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x + 17, y - 62); ctx.lineTo(x + 22, y - 68); ctx.stroke(); }
}
function railing(ctx, x0, x1, y, h, col) {
  ctx.fillStyle = col || '#e6e1d4';
  for (let x = x0; x <= x1; x += 70) { ctx.fillRect(x - 5, y - h - 8, 10, h + 8); ctx.beginPath(); ctx.arc(x, y - h - 10, 6, 0, 7); ctx.fill(); }
  ctx.fillRect(x0, y - h, x1 - x0, 7); ctx.fillRect(x0, y - h * 0.45, x1 - x0, 5);
}
function paving(ctx, cam, col1, col2, y0) {
  y0 = y0 || GY - 28;
  const g = ctx.createLinearGradient(0, y0, 0, H); g.addColorStop(0, col1); g.addColorStop(1, col2); ctx.fillStyle = g; ctx.fillRect(0, y0, W, H - y0);
  ctx.strokeStyle = 'rgba(0,0,0,0.09)'; ctx.lineWidth = 1.5;
  for (let j = 0; j < 6; j++) { const yy = y0 + 6 + j * j * 6 + j * 8; ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(W, yy); ctx.stroke(); const step = 90 + j * 22; const off = ((cam * (1 + j * 0.06)) + (j % 2) * step / 2) % step; for (let x = -off; x < W; x += step) { ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x - 6, yy + 14 + j * 12); ctx.stroke(); } }
}
function scroll(ctx, x, y, w, h, drawFn) { ctx.fillStyle = '#efe6cf'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#7a6a4a'; ctx.fillRect(x - 3, y - 6, w + 6, 6); ctx.fillRect(x - 5, y + h, w + 10, 7); ctx.save(); ctx.beginPath(); ctx.rect(x + 4, y + 4, w - 8, h - 8); ctx.clip(); drawFn && drawFn(); ctx.restore(); }
function vtext(ctx, s, x, y, size, col, font) { ctx.fillStyle = col; ctx.font = size + 'px ' + (font || F_KAI); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; for (let i = 0; i < s.length; i++) ctx.fillText(s[i], x, y + i * size * 1.12); }

// 纸纹与暗角（一次生成）
let _paper = null;
function paperOverlay(ctx) {
  if (!_paper) {
    _paper = document.createElement('canvas'); _paper.width = W; _paper.height = H; const p = _paper.getContext('2d'); const r = mulberry(7);
    for (let i = 0; i < 5200; i++) { p.fillStyle = r() > 0.5 ? 'rgba(90,60,20,0.05)' : 'rgba(255,250,230,0.06)'; p.fillRect(r() * W, r() * H, 1 + r() * 3, 1 + r() * 2); }
    const g = p.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 0.95); g.addColorStop(0, 'rgba(60,40,10,0)'); g.addColorStop(1, 'rgba(50,30,10,0.34)'); p.fillStyle = g; p.fillRect(0, 0, W, H);
  }
  ctx.drawImage(_paper, 0, 0);
}
