// 美术：全部由代码绘制
'use strict';
const FONT_SERIF = '"Songti SC","STSong","Noto Serif CJK SC","Source Han Serif SC","SimSun",serif';
const FONT_KAI = '"Kaiti SC","STKaiti","KaiTi","Noto Serif CJK SC","Songti SC",serif';

// ---------- 人物造型 ----------
const CHARS = {
  liu:   { name: '刘姥姥', robe: '#6d5a42', trim: '#3d3226', skirt: '#4b5868', hair: 'old', hairColor: '#cfcac0', hunch: 3, scarf: '#3f4a5a' },
  ban:   { name: '板儿', robe: '#a0743a', trim: '#5a3d1a', skirt: '#5b4a35', hair: 'boy', small: 0.72 },
  jiamu: { name: '贾母', robe: '#5a2c4e', trim: '#d4a94a', skirt: '#3a2638', hair: 'old', hairColor: '#e8e4dc', band: '#2a1c22', hunch: 1 },
  wangfr:{ name: '王夫人', robe: '#3f4f69', trim: '#b8a26a', skirt: '#2b3244', hair: 'bun', hairColor: '#1d1a1a' },
  xueyima:{ name: '薛姨妈', robe: '#7b5b36', trim: '#d1b27a', skirt: '#4a3a28', hair: 'bun', hairColor: '#2a2420' },
  fengjie:{ name: '凤姐', robe: '#c23a2e', trim: '#f0c050', skirt: '#7a1f2a', hair: 'bun', hairColor: '#141010', gold: true },
  yuanyang:{ name: '鸳鸯', robe: '#3e7d6c', trim: '#e8dcc0', skirt: '#2c4c48', hair: 'maid', hairColor: '#161212' },
  hupo:  { name: '琥珀', robe: '#c88a3c', trim: '#f2e2c0', skirt: '#7c5a32', hair: 'maid', hairColor: '#1a1515' },
  liwan: { name: '李纨', robe: '#a9aca6', trim: '#6a6e6a', skirt: '#6d716e', hair: 'bun', hairColor: '#1d1a1a', plain: true },
  suyun: { name: '素云', robe: '#9bb0c4', trim: '#eee', skirt: '#5f7186', hair: 'maid', hairColor: '#1a1515' },
  fenger:{ name: '丰儿', robe: '#d991a0', trim: '#fff0f0', skirt: '#8c5560', hair: 'maid', hairColor: '#1a1515' },
  xichun:{ name: '惜春', robe: '#e2b3c0', trim: '#fff', skirt: '#a77080', hair: 'bun', hairColor: '#181414', small: 0.86 },
  daiyu: { name: '林黛玉', robe: '#9cc1ad', trim: '#f4f4ee', skirt: '#5f8a78', hair: 'bun', hairColor: '#141212', slim: true },
  zijuan:{ name: '紫鹃', robe: '#8e74a8', trim: '#f0e8f4', skirt: '#5c4a70', hair: 'maid', hairColor: '#1a1515' },
  baochai:{ name: '薛宝钗', robe: '#dcc27a', trim: '#fff6dc', skirt: '#a48a4c', hair: 'bun', hairColor: '#191515' },
  tanchun:{ name: '探春', robe: '#d27648', trim: '#ffe8d0', skirt: '#8a4a30', hair: 'bun', hairColor: '#181414' },
  baoyu: { name: '贾宝玉', robe: '#b23a4a', trim: '#f3c95a', skirt: '#5e2a3a', hair: 'bao', hairColor: '#141010' },
  xiangyun:{ name: '史湘云', robe: '#6b8fc2', trim: '#f0f4ff', skirt: '#3e5a86', hair: 'bun', hairColor: '#161212' },
  yingchun:{ name: '迎春', robe: '#c4a2c4', trim: '#fff', skirt: '#7c607c', hair: 'bun', hairColor: '#161212' },
  jianiang:{ name: '驾娘', robe: '#56708a', trim: '#cfd8e0', skirt: '#34485a', hair: 'maid', hairColor: '#1a1515', scarf: '#7a8a9a' },
  pozi:  { name: '婆子', robe: '#7a6a5a', trim: '#4a4038', skirt: '#4e4a44', hair: 'old', hairColor: '#8c8680', hunch: 2 },
  wenguan:{ name: '文官', robe: '#c95f7a', trim: '#ffe0ea', skirt: '#7a3046', hair: 'maid', hairColor: '#161212' },
};

function shade(hex, amt) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  let r = parseInt(c.substr(0, 2), 16), g = parseInt(c.substr(2, 2), 16), b = parseInt(c.substr(4, 2), 16);
  r = Math.max(0, Math.min(255, Math.round(r + amt)));
  g = Math.max(0, Math.min(255, Math.round(g + amt)));
  b = Math.max(0, Math.min(255, Math.round(b + amt)));
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill();
}

// p: {x,y,dir,walk,scale,flowers,redFlower,sit,noShadow}
function drawPerson(ctx, key, p) {
  const c = CHARS[key];
  const s = (p.scale || 1) * (c.small || 1);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(s, s);
  const dir = p.dir || 'down';
  const w = p.walk || 0;
  const bob = Math.abs(Math.sin(w)) * 1.5;
  const sw = Math.sin(w) * 4;
  const slim = c.slim ? 0.88 : 1;
  if (!p.noShadow) ellipse(ctx, 0, 0, 17, 5, 'rgba(0,0,0,0.22)');
  ctx.translate(0, -bob);
  const sit = p.sit;
  // 鞋
  if (!sit) {
    ellipse(ctx, -5 + (dir === 'left' || dir === 'right' ? sw : 0), -2 + (dir === 'down' || dir === 'up' ? -Math.max(0, sw) * 0.4 : 0), 4.5, 2.6, '#2a2220');
    ellipse(ctx, 5 - (dir === 'left' || dir === 'right' ? sw : 0), -2 + (dir === 'down' || dir === 'up' ? -Math.max(0, -sw) * 0.4 : 0), 4.5, 2.6, '#2a2220');
  }
  const top = sit ? -38 : -46;
  // 裙
  ctx.fillStyle = c.skirt;
  ctx.beginPath();
  ctx.moveTo(-11 * slim, top + 20); ctx.lineTo(11 * slim, top + 20);
  ctx.lineTo(15 * slim, -3); ctx.quadraticCurveTo(0, 1, -15 * slim, -3); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = shade(c.skirt, -25); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-4, top + 22); ctx.lineTo(-6, -2); ctx.moveTo(4, top + 22); ctx.lineTo(6, -2); ctx.stroke();
  // 袄
  const hx = (c.hunch || 0) * (dir === 'left' ? -1 : dir === 'right' ? 1 : 0);
  ctx.fillStyle = c.robe;
  ctx.beginPath();
  ctx.moveTo(-10 * slim + hx, top); ctx.lineTo(10 * slim + hx, top);
  ctx.lineTo(14 * slim, top + 26); ctx.lineTo(-14 * slim, top + 26); ctx.closePath(); ctx.fill();
  // 襟边
  ctx.fillStyle = c.trim;
  ctx.fillRect(-14 * slim, top + 24, 28 * slim, 3);
  if (dir === 'down') {
    ctx.strokeStyle = c.trim; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-6 + hx, top + 1); ctx.quadraticCurveTo(2 + hx, top + 8, 4, top + 25); ctx.stroke();
  }
  // 袖
  const armSw = sit ? 0 : sw * 0.8;
  ctx.fillStyle = shade(c.robe, -12);
  if (dir !== 'right') { ctx.save(); ctx.translate(-11 * slim + hx, top + 3); ctx.rotate(0.18 + armSw * 0.04); ctx.fillRect(-4, 0, 8, 19); ctx.fillStyle = c.trim; ctx.fillRect(-4.5, 17, 9, 3); ctx.restore(); }
  ctx.fillStyle = shade(c.robe, -12);
  if (dir !== 'left') { ctx.save(); ctx.translate(11 * slim + hx, top + 3); ctx.rotate(-0.18 - armSw * 0.04); ctx.fillRect(-4, 0, 8, 19); ctx.fillStyle = c.trim; ctx.fillRect(-4.5, 17, 9, 3); ctx.restore(); }
  if (c.scarf && c.hair !== 'old') { ctx.fillStyle = c.scarf; ctx.fillRect(-8, top - 1, 16, 4); }
  // 头
  const hy = top - 10;
  const hxx = hx * 1.6;
  ellipse(ctx, hxx, hy, 10.5, 11, c.hair === 'old' ? '#e9cfb0' : '#f2d7bd');
  const hc = c.hairColor || '#151111';
  ctx.fillStyle = hc;
  if (dir === 'up') {
    ellipse(ctx, hxx, hy - 1, 11, 11.5, hc);
  } else {
    ctx.beginPath(); ctx.ellipse(hxx, hy - 3, 11, 9, 0, Math.PI, 0); ctx.fill();
    if (dir === 'left') { ctx.beginPath(); ctx.ellipse(hxx + 4, hy - 1, 8, 10, 0, -Math.PI / 2, Math.PI / 2); ctx.fill(); }
    if (dir === 'right') { ctx.beginPath(); ctx.ellipse(hxx - 4, hy - 1, 8, 10, 0, Math.PI / 2, Math.PI * 1.5); ctx.fill(); }
  }
  // 发式
  if (c.hair === 'bun') {
    ellipse(ctx, hxx, hy - 13, 7.5, 5.5, hc);
    ellipse(ctx, hxx - 8, hy - 8, 4, 3.5, hc); ellipse(ctx, hxx + 8, hy - 8, 4, 3.5, hc);
    ctx.fillStyle = c.gold ? '#f2c33a' : '#d9c48a';
    ctx.fillRect(hxx + 3, hy - 17, 9, 1.6);
    ellipse(ctx, hxx + 12, hy - 16, 2, 2, c.gold ? '#e03a3a' : '#9ac2c8');
    if (c.gold) { ellipse(ctx, hxx - 6, hy - 16, 2.2, 2.2, '#f2c33a'); ellipse(ctx, hxx - 2, hy - 18, 1.8, 1.8, '#f2c33a'); }
  } else if (c.hair === 'maid') {
    ellipse(ctx, hxx - 8, hy - 9, 5, 4.5, hc); ellipse(ctx, hxx + 8, hy - 9, 5, 4.5, hc);
    if (dir === 'up') { ctx.fillStyle = hc; ctx.fillRect(hxx - 2, hy, 4, 22); }
    ellipse(ctx, hxx + 8, hy - 9, 1.6, 1.6, '#e05a5a');
  } else if (c.hair === 'old') {
    ellipse(ctx, hxx, hy - 10, 6.5, 4.5, hc);
    if (c.band) { ctx.fillStyle = c.band; ctx.fillRect(hxx - 10.5, hy - 6, 21, 3.4); ellipse(ctx, hxx, hy - 4.5, 2, 2, '#4ab09a'); }
    if (c.scarf) { ctx.fillStyle = c.scarf; ctx.beginPath(); ctx.ellipse(hxx, hy - 7, 11.5, 5, 0, Math.PI, 0); ctx.fill(); }
  } else if (c.hair === 'boy') {
    ellipse(ctx, hxx, hy - 10, 4, 3.5, hc);
  } else if (c.hair === 'bao') {
    ctx.fillStyle = '#e8b730'; ctx.beginPath();
    ctx.moveTo(hxx - 6, hy - 9); ctx.lineTo(hxx - 4, hy - 17); ctx.lineTo(hxx, hy - 14); ctx.lineTo(hxx + 4, hy - 17); ctx.lineTo(hxx + 6, hy - 9); ctx.closePath(); ctx.fill();
    ellipse(ctx, hxx, hy - 12, 1.8, 1.8, '#d23b4a');
    ctx.strokeStyle = '#d23b4a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(hxx - 10, hy - 4); ctx.lineTo(hxx + 10, hy - 4); ctx.stroke();
  }
  // 脸
  if (dir !== 'up') {
    ctx.fillStyle = '#2a1d18';
    if (dir === 'down') {
      ctx.fillRect(hxx - 5, hy + 1, 2.2, 2.2); ctx.fillRect(hxx + 3, hy + 1, 2.2, 2.2);
      ellipse(ctx, hxx - 6, hy + 5, 2, 1.2, 'rgba(230,120,120,0.35)'); ellipse(ctx, hxx + 6, hy + 5, 2, 1.2, 'rgba(230,120,120,0.35)');
      ctx.fillStyle = c.hair === 'old' ? '#8a5040' : '#b8505a'; ctx.fillRect(hxx - 1.5, hy + 6, 3, 1.2);
    } else {
      const ex = dir === 'left' ? -5 : 3;
      ctx.fillRect(hxx + ex, hy + 1, 2.2, 2.2);
    }
  }
  // 簪花
  if (p.redFlower) { flower(ctx, hxx + 9, hy - 9, 3.6, '#e0303a'); }
  if (p.flowers) {
    const cols = ['#e0303a', '#f2c33a', '#f5f0e8', '#d86ab0', '#f08a30', '#c9a0e8', '#e0303a', '#f2c33a'];
    const pos = [[-10, -10], [-4, -15], [4, -16], [10, -11], [-12, -3], [12, -4], [0, -19], [-7, -18], [7, -19], [13, -15], [-13, -14]];
    pos.forEach((q, i) => flower(ctx, hxx + q[0], hy + q[1], 3.2, cols[i % cols.length]));
  }
  ctx.restore();
}

function flower(ctx, x, y, r, col) {
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * Math.PI * 2;
    ellipse(ctx, x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.7, r * 0.6, r * 0.6, col);
  }
  ellipse(ctx, x, y, r * 0.45, r * 0.45, '#f5d24a');
}

// ---------- 场景构件 ----------
function rect(ctx, x, y, w, h, fill) { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); }

function bricks(ctx, x, y, w, h, base, line, size = 40) {
  rect(ctx, x, y, w, h, base);
  ctx.strokeStyle = line; ctx.lineWidth = 1;
  ctx.beginPath();
  for (let yy = y; yy <= y + h; yy += size / 2) { ctx.moveTo(x, yy); ctx.lineTo(x + w, yy); }
  let row = 0;
  for (let yy = y; yy < y + h; yy += size / 2, row++) {
    for (let xx = x + (row % 2 ? size / 2 : 0); xx < x + w; xx += size) { ctx.moveTo(xx, yy); ctx.lineTo(xx, Math.min(yy + size / 2, y + h)); }
  }
  ctx.stroke();
}

function noiseDots(ctx, x, y, w, h, n, cols, seed = 1, rmax = 2) {
  let sd = seed;
  const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = cols[Math.floor(rnd() * cols.length)];
    ctx.beginPath(); ctx.arc(x + rnd() * w, y + rnd() * h, 0.5 + rnd() * rmax, 0, 7); ctx.fill();
  }
}

function makeRnd(seed) { let sd = (seed * 7919 + 13) % 2147483647; for (let i = 0; i < 5; i++) sd = (sd * 16807) % 2147483647; return () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; }; }

function water(ctx, x, y, w, h, t, seed = 3) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#5f8f92'); g.addColorStop(1, '#3f6f78');
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
}
function waterRipples(ctx, x, y, w, h, t, seed = 3) {
  const r = makeRnd(seed);
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.strokeStyle = 'rgba(220,240,240,0.28)'; ctx.lineWidth = 1.5;
  for (let i = 0; i < Math.floor(w * h / 9000); i++) {
    const px = x + ((r() * w + t * 12 * (0.5 + r())) % w), py = y + r() * h;
    const len = 10 + r() * 22;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.quadraticCurveTo(px + len / 2, py - 3, px + len, py); ctx.stroke();
  }
  ctx.restore();
}

function roof(ctx, x, y, w, h, col = '#3b4652') {
  // 带起翘的歇山顶
  const ov = 26;
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(x - ov - 10, y + h - 10);
  ctx.quadraticCurveTo(x - ov, y + h, x - ov + 14, y + h);
  ctx.lineTo(x + w + ov - 14, y + h);
  ctx.quadraticCurveTo(x + w + ov, y + h, x + w + ov + 10, y + h - 10);
  ctx.lineTo(x + w - 20, y + 6);
  ctx.lineTo(x + 20, y + 6);
  ctx.closePath(); ctx.fill();
  // 瓦垄
  ctx.strokeStyle = shade(col, 18); ctx.lineWidth = 2;
  for (let i = 0; i <= 24; i++) {
    const tx = x + 20 + (w - 40) * i / 24, bx = x - ov + 14 + (w + 2 * ov - 28) * i / 24;
    ctx.beginPath(); ctx.moveTo(tx, y + 8); ctx.lineTo(bx, y + h - 2); ctx.stroke();
  }
  // 正脊
  rect(ctx, x + 12, y, w - 24, 8, shade(col, -18));
  ctx.fillStyle = shade(col, -18);
  ctx.beginPath(); ctx.moveTo(x + 12, y + 8); ctx.quadraticCurveTo(x + 2, y + 2, x + 6, y - 8); ctx.lineTo(x + 18, y); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + w - 12, y + 8); ctx.quadraticCurveTo(x + w - 2, y + 2, x + w - 6, y - 8); ctx.lineTo(x + w - 18, y); ctx.fill();
  rect(ctx, x - ov + 10, y + h - 3, w + 2 * ov - 20, 5, shade(col, -28));
}

function lattice(ctx, x, y, w, h, frame = '#6a3a28', paper = '#e9dcc0') {
  rect(ctx, x, y, w, h, paper);
  ctx.strokeStyle = frame; ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let xx = x + 8; xx < x + w; xx += 9) { ctx.moveTo(xx, y); ctx.lineTo(xx, y + h); }
  for (let yy = y + 8; yy < y + h; yy += 9) { ctx.moveTo(x, yy); ctx.lineTo(x + w, yy); }
  ctx.stroke();
}

function plaque(ctx, x, y, text, w) {
  const ww = w || text.length * 24 + 24;
  rect(ctx, x - ww / 2 - 3, y - 3, ww + 6, 34, '#c9a24a');
  rect(ctx, x - ww / 2, y, ww, 28, '#2b2a3a');
  ctx.fillStyle = '#e9c66a'; ctx.font = `bold 20px ${FONT_KAI}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y + 15);
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
}

// 殿堂正立面
function hall(ctx, x, y, w, h, opt = {}) {
  const roofH = opt.roofH || 60;
  const bodyY = y + roofH - 8;
  const bodyH = h - roofH - 10;
  // 台基
  rect(ctx, x - 14, y + h - 18, w + 28, 18, '#9a978e');
  rect(ctx, x - 14, y + h - 18, w + 28, 4, '#b8b4aa');
  // 墙身
  rect(ctx, x, bodyY, w, bodyH, opt.wall || '#8a3a2c');
  const cols = opt.cols || 5;
  const bay = w / (cols - 1);
  for (let i = 0; i < cols - 1; i++) {
    const bx = x + i * bay + 8, bw = bay - 16;
    if (opt.door === i) {
      if (opt.blind) {
        rect(ctx, bx, bodyY + 10, bw, bodyH - 10, '#3a2a20');
        ctx.fillStyle = '#c9b27a'; for (let yy = bodyY + 10; yy < bodyY + bodyH - 20; yy += 4) ctx.fillRect(bx, yy, bw, 2);
      } else rect(ctx, bx, bodyY + 10, bw, bodyH - 10, '#2a1c16');
    } else lattice(ctx, bx, bodyY + 10, bw, bodyH - 22, '#5a2e20', opt.paper || '#e5d6b6');
  }
  for (let i = 0; i < cols; i++) {
    rect(ctx, x + i * bay - 5, bodyY, 10, bodyH, opt.pillar || '#a3392c');
    rect(ctx, x + i * bay - 7, bodyY + bodyH - 6, 14, 6, '#777');
  }
  // 额枋彩画
  rect(ctx, x - 6, bodyY - 2, w + 12, 12, '#2f5a6a');
  ctx.fillStyle = '#d4a94a'; for (let xx = x; xx < x + w; xx += 30) ctx.fillRect(xx, bodyY + 2, 14, 3);
  roof(ctx, x, y, w, roofH, opt.roof || '#3b4652');
  if (opt.name) plaque(ctx, x + w / 2, bodyY + 10, opt.name);
}

function bambooClump(ctx, x, y, h, seed, n = 7) {
  const r = makeRnd(seed);
  for (let i = 0; i < n; i++) {
    const bx = x + (r() - 0.5) * 60, hh = h * (0.6 + r() * 0.5), lean = (r() - 0.5) * 18;
    ctx.strokeStyle = r() > 0.5 ? '#4f7f3a' : '#3c6a30'; ctx.lineWidth = 4 + r() * 2;
    ctx.beginPath(); ctx.moveTo(bx, y); ctx.quadraticCurveTo(bx + lean * 0.3, y - hh / 2, bx + lean, y - hh); ctx.stroke();
    ctx.strokeStyle = '#2c4a22'; ctx.lineWidth = 1;
    for (let k = 1; k < 6; k++) { const yy = y - hh * k / 6; const xx = bx + lean * (k / 6) * (k / 6); ctx.beginPath(); ctx.moveTo(xx - 3, yy); ctx.lineTo(xx + 3, yy); ctx.stroke(); }
    for (let k = 0; k < 9; k++) {
      const yy = y - hh * (0.35 + r() * 0.65), xx = bx + lean * ((y - yy) / hh) ** 2;
      const a = (r() - 0.5) * 2.4 + (r() > 0.5 ? 0 : Math.PI);
      ctx.fillStyle = ['#5c9a48', '#4a8a3c', '#73ad55', '#3f7a35'][Math.floor(r() * 4)];
      ctx.save(); ctx.translate(xx, yy); ctx.rotate(a);
      ctx.beginPath(); ctx.ellipse(10, 0, 11, 3, 0, 0, 7); ctx.fill(); ctx.restore();
    }
  }
}

function rock(ctx, x, y, s, seed) {
  const r = makeRnd(seed);
  ctx.fillStyle = '#8f9696';
  ctx.beginPath();
  const n = 9;
  for (let i = 0; i <= n; i++) {
    const a = Math.PI + i / n * Math.PI;
    const rr = s * (0.7 + r() * 0.5);
    const px = x + Math.cos(a) * rr * 0.8, py = y + Math.sin(a) * rr * 1.3;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#6e7676';
  for (let i = 0; i < 3; i++) ellipse(ctx, x + (r() - 0.5) * s, y - s * (0.3 + r() * 0.6), s * 0.12, s * 0.18, '#5d6464');
  ctx.strokeStyle = '#b6bcbc'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - s * 0.5, y - s * 0.8); ctx.lineTo(x - s * 0.1, y - s * 1.0); ctx.stroke();
}

function tree(ctx, x, y, s, seed, autumn = true) {
  const r = makeRnd(seed);
  ctx.strokeStyle = '#4a3528'; ctx.lineWidth = s * 0.16;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + s * 0.1, y - s * 0.6, x - s * 0.05, y - s * 1.1); ctx.stroke();
  const cols = autumn ? ['#8a9a4a', '#b0903a', '#c87a32', '#7a8a3e', '#a6a04a'] : ['#4f7f3a', '#5f9a48', '#3f6a30'];
  for (let i = 0; i < 26; i++) {
    const a = r() * Math.PI * 2, d = r() * s * 0.6;
    ellipse(ctx, x + Math.cos(a) * d, y - s * 1.2 + Math.sin(a) * d * 0.7, s * 0.22, s * 0.18, cols[Math.floor(r() * cols.length)]);
  }
}

function willow(ctx, x, y, s, seed) {
  const r = makeRnd(seed);
  ctx.strokeStyle = '#4a3a2c'; ctx.lineWidth = s * 0.14;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x - s * 0.15, y - s * 0.6, x + s * 0.1, y - s * 1.2); ctx.stroke();
  for (let i = 0; i < 22; i++) {
    const sx = x + s * 0.1 + (r() - 0.5) * s * 1.2, sy = y - s * 1.2 + (r() - 0.5) * s * 0.3;
    ctx.strokeStyle = ['#8aa04a', '#a0aa52', '#b8a850'][Math.floor(r() * 3)]; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(sx + (r() - 0.5) * 10, sy + s * 0.4, sx + (r() - 0.5) * 16, sy + s * (0.5 + r() * 0.5)); ctx.stroke();
  }
}

function chrys(ctx, x, y, col, seed) {
  const r = makeRnd(seed);
  // 花盆
  ctx.fillStyle = '#6a7a8a'; ctx.beginPath(); ctx.moveTo(x - 13, y - 16); ctx.lineTo(x + 13, y - 16); ctx.lineTo(x + 9, y); ctx.lineTo(x - 9, y); ctx.closePath(); ctx.fill();
  rect(ctx, x - 14, y - 18, 28, 3, '#8a9aaa');
  for (let i = 0; i < 9; i++) ellipse(ctx, x + (r() - 0.5) * 24, y - 22 - r() * 14, 5, 3, '#4a6a34');
  for (let i = 0; i < 5; i++) {
    const fx = x + (r() - 0.5) * 22, fy = y - 26 - r() * 14;
    ctx.strokeStyle = col; ctx.lineWidth = 1.5;
    for (let k = 0; k < 12; k++) { const a = k / 12 * 6.28; ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx + Math.cos(a) * 5, fy + Math.sin(a) * 4); ctx.stroke(); }
    ellipse(ctx, fx, fy, 1.6, 1.6, '#d8a030');
  }
}

function lowTable(ctx, x, y, w, h, col = '#5a2e22', top = '#7a4030') {
  rect(ctx, x + 3, y + h, 4, 12, col); rect(ctx, x + w - 7, y + h, 4, 12, col);
  rect(ctx, x, y, w, h, top);
  rect(ctx, x, y + h - 3, w, 3, shade(top, -25));
}

function railing(ctx, x1, y1, x2, y2, col = '#a3392c') {
  ctx.strokeStyle = col; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x1, y1 - 14); ctx.lineTo(x2, y2 - 14); ctx.moveTo(x1, y1 - 4); ctx.lineTo(x2, y2 - 4); ctx.stroke();
  const len = Math.hypot(x2 - x1, y2 - y1), n = Math.floor(len / 22);
  ctx.lineWidth = 2.5;
  for (let i = 0; i <= n; i++) { const t = i / n; const px = x1 + (x2 - x1) * t, py = y1 + (y2 - y1) * t; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py - 18); ctx.stroke(); }
}

function lotusLeaf(ctx, x, y, s, withered, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = withered ? '#7a6a3a' : '#4a7a3a';
  ctx.beginPath(); ctx.ellipse(0, 0, s, s * 0.6, 0, 0.25, Math.PI * 2 - 0.1); ctx.lineTo(0, 0); ctx.fill();
  ctx.strokeStyle = withered ? '#5a4a2a' : '#3a6a2a'; ctx.lineWidth = 1;
  for (let i = 0; i < 7; i++) { const a = 0.4 + i * 0.85; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * s * 0.9, Math.sin(a) * s * 0.55); ctx.stroke(); }
  if (withered) { ctx.fillStyle = '#5c4a28'; ellipse(ctx, s * 0.3, -s * 0.15, s * 0.25, s * 0.12, '#5c4a28'); }
  ctx.restore();
}

function lantern(ctx, x, y) {
  ctx.strokeStyle = '#333'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y - 14); ctx.lineTo(x, y - 6); ctx.stroke();
  ellipse(ctx, x, y + 6, 9, 12, '#d0302a'); rect(ctx, x - 5, y - 7, 10, 3, '#d4a94a'); rect(ctx, x - 5, y + 17, 10, 3, '#d4a94a');
  ctx.strokeStyle = '#d4a94a'; ctx.beginPath(); ctx.moveTo(x, y + 20); ctx.lineTo(x, y + 28); ctx.stroke();
}

function boat(ctx, x, y, w, col = '#8a5a3a') {
  ctx.fillStyle = shade(col, -20);
  ctx.beginPath(); ctx.moveTo(x - w / 2 - 20, y - 18); ctx.quadraticCurveTo(x, y + 22, x + w / 2 + 20, y - 18); ctx.lineTo(x + w / 2, y + 6); ctx.quadraticCurveTo(x, y + 18, x - w / 2, y + 6); ctx.closePath(); ctx.fill();
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(x - w / 2 - 20, y - 18); ctx.lineTo(x + w / 2 + 20, y - 18); ctx.quadraticCurveTo(x, y + 8, x - w / 2 - 20, y - 18); ctx.fill();
  // 舱
  rect(ctx, x - w * 0.25, y - 60, w * 0.5, 46, '#c9a77a');
  lattice(ctx, x - w * 0.22, y - 52, w * 0.44, 30, '#6a3a28', '#efe2c4');
  ctx.fillStyle = '#5a3a2a'; ctx.beginPath(); ctx.moveTo(x - w * 0.32, y - 58); ctx.lineTo(x + w * 0.32, y - 58); ctx.lineTo(x + w * 0.25, y - 72); ctx.lineTo(x - w * 0.25, y - 72); ctx.closePath(); ctx.fill();
}
