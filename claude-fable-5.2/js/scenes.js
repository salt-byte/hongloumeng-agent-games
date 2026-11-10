// scenes.js —— 六处场景的背景绘制与人物、机关布置
'use strict';
const AUTUMN = ['#c9762e', '#d9a23a', '#b5482c', '#8f8f3e'];
const MUMS = ['#e8b33c', '#f1ede2', '#c9232e', '#b85aa0'];

function drawLouBuilding(ctx, feast) {
  // 大观楼：上层为缀锦阁
  const x0 = 480, x1 = 1720, fy = GY - 28;
  // 台基
  ctx.fillStyle = '#cfc8b6'; ctx.fillRect(x0 - 40, fy - 16, x1 - x0 + 80, 18); ctx.fillStyle = '#b5ad98'; ctx.fillRect(x0 - 40, fy - 2, x1 - x0 + 80, 4);
  // 下层
  ctx.fillStyle = feast ? '#3a2a24' : '#5a3a2e'; ctx.fillRect(x0, 300, x1 - x0, fy - 316);
  if (feast) { // 敞开的厅堂，内悬纱厨与灯
    const g = ctx.createLinearGradient(0, 300, 0, fy); g.addColorStop(0, '#4a2f26'); g.addColorStop(1, '#7a5540'); ctx.fillStyle = g; ctx.fillRect(x0, 300, x1 - x0, fy - 316);
    for (let x = x0 + 110; x < x1; x += 207) { ctx.fillStyle = '#c9232e'; ctx.beginPath(); ctx.ellipse(x, 352, 15, 20, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#e8c96a'; ctx.fillRect(x - 8, 330, 16, 4); ctx.fillRect(x - 8, 370, 16, 4); ctx.strokeStyle = '#e8c96a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, 374); ctx.lineTo(x, 392); ctx.stroke(); }
    ctx.fillStyle = 'rgba(190,215,200,0.25)'; ctx.fillRect(x0, 300, 120, fy - 316); // 纱厨
    ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 3; ctx.strokeRect(x0 + 2, 302, 118, fy - 320);
  } else {
    for (let x = x0 + 30; x < x1 - 100; x += 207) lattice(ctx, x + 20, 335, 130, 120);
  }
  for (let x = x0; x <= x1 + 1; x += 207) column(ctx, Math.min(x, x1), 300, fy - 14);
  beam(ctx, x0 - 10, 300, x1 - x0 + 20, 26);
  // 腰檐
  roof(ctx, x0 - 30, 222, x1 - x0 + 60, 62, '#55606a');
  plaque(ctx, (x0 + x1) / 2, 254, '大观楼', 130);
  // 上层
  ctx.fillStyle = '#6a3a2c'; ctx.fillRect(x0 + 110, 120, x1 - x0 - 220, 110);
  for (let x = x0 + 130; x < x1 - 200; x += 152) lattice(ctx, x, 140, 110, 70);
  for (let x = x0 + 110; x <= x1 - 108; x += 204) column(ctx, x, 118, 232);
  beam(ctx, x0 + 100, 112, x1 - x0 - 200, 18);
  plaque(ctx, (x0 + x1) / 2, 150, '缀锦阁', 124);
  roof(ctx, x0 + 60, 30, x1 - x0 - 120, 84, '#4d5861');
  railing(ctx, x0 + 100, x1 - 100, 236, 22, '#8c2f26');
}

const SCENES = {
  // ───────── 大观楼下（晨）/ 缀锦阁下（宴） ─────────
  lou: {
    width: 2400,
    title: g => g.stage[0] === 'F' ? '第六折 · 缀锦阁下' : '第一折 · 大观楼下',
    draw(ctx, cam, t, g) {
      const feast = g.stage[0] === 'F';
      if (feast) sky(ctx, '#e9c79a', '#f3dfb8', '#f6ead0'); else sky(ctx, '#bcd7e2', '#e6efe6', '#f4f0de');
      hills(ctx, cam * 0.15, feast ? '#c9b89a' : '#b9cfc8', 330, 46, 11);
      hills(ctx, cam * 0.3 + 300, feast ? '#b3a37f' : '#9fbcae', 380, 40, 23);
      ctx.save(); ctx.translate(-cam * 0.6, 0); // 远处池水与藕香榭
      ctx.fillStyle = '#a9c4c0'; ctx.fillRect(1500, 420, 1400, 80);
      ctx.save(); ctx.translate(1750, 300); ctx.scale(0.5, 0.5); ctx.fillStyle = '#e9dfc4'; ctx.fillRect(40, 150, 260, 90); for (let i = 0; i < 4; i++) column(ctx, 50 + i * 80, 140, 250); roof(ctx, 20, 70, 300, 72, '#55606a'); ctx.fillStyle = '#cfc8b6'; ctx.fillRect(0, 244, 340, 12); ctx.restore();
      if (feast) { ctx.fillStyle = '#7a3a2a'; ctx.font = '15px ' + F_KAI; ctx.textAlign = 'center'; ctx.fillText('藕香榭', 1835, 322); for (let i = 0; i < 5; i++) { const a = (t * 0.6 + i * 0.37) % 1; ctx.globalAlpha = 1 - a; ctx.fillStyle = '#6b4a2a'; ctx.font = '18px ' + F_KAI; ctx.fillText('♪', 1790 + i * 22 + Math.sin(t + i) * 6, 330 - a * 50); } ctx.globalAlpha = 1; }
      ctx.restore();
      ctx.save(); ctx.translate(-cam, 0);
      tree(ctx, 130, GY - 26, 250, AUTUMN, 3); tree(ctx, 2010, GY - 26, 280, AUTUMN, 5); tree(ctx, 2290, GY - 26, 220, ['#c9762e', '#b5482c'], 9);
      drawLouBuilding(ctx, feast);
      tree(ctx, 380, GY - 26, 170, ['#d9a23a', '#c9762e'], 4);
      rock(ctx, 1850, GY - 26, 110, 8);
      ctx.restore();
      paving(ctx, cam, '#d9d2bf', '#b9b09a');
      ctx.save(); ctx.translate(-cam, 0);
      if (!feast) {
        if (g.stage === 'L0' || g.stage === 'L0b') { // 梯子与搬下来的高几
          ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(1530, GY - 8); ctx.lineTo(1610, 236); ctx.moveTo(1580, GY - 8); ctx.lineTo(1660, 236); ctx.stroke(); ctx.lineWidth = 5; for (let i = 1; i < 9; i++) { const u = i / 9; ctx.beginPath(); ctx.moveTo(1530 + 80 * u, GY - 8 - (GY - 244) * u); ctx.lineTo(1580 + 80 * u, GY - 8 - (GY - 244) * u); ctx.stroke(); }
        }
        for (let i = 0; i < 6; i++) gaoji(ctx, 1080 + i * 58, GY - 12 - (i % 2) * 5, false, i);
        gaoji(ctx, 1110, GY - 66, false, 1); gaoji(ctx, 1226, GY - 66, false, 2);
        // 篙桨、遮阳幔子
        if (g.stage !== 'L0') { ctx.strokeStyle = '#7a5a34'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(1760, GY - 6); ctx.lineTo(1830, GY - 190); ctx.moveTo(1775, GY - 6); ctx.lineTo(1815, GY - 170); ctx.stroke(); ctx.fillStyle = '#b85a4a'; ctx.fillRect(1700, GY - 34, 64, 24); ctx.fillStyle = '#e8c96a'; ctx.fillRect(1700, GY - 26, 64, 4); }
        [620, 700, 1900, 1960].forEach((x, i) => mumPot(ctx, x, GY - 6, [MUMS[i % 4], MUMS[(i + 1) % 4]], 40 + i));
      } else {
        ctx.fillStyle = '#a3282a'; ctx.fillRect(560, GY - 30, 1540, 46); ctx.fillStyle = '#d8b24f'; ctx.fillRect(560, GY - 30, 1540, 3); ctx.fillRect(560, GY + 13, 1540, 3);
        // 上面二榻
        [1020, 1180].forEach(x => { ctx.fillStyle = '#5a2a20'; ctx.fillRect(x - 58, GY - 60, 116, 52); ctx.fillRect(x - 62, GY - 118, 8, 110); ctx.fillRect(x + 54, GY - 118, 8, 110); ctx.fillRect(x - 62, GY - 122, 124, 10); ctx.fillStyle = '#c98a3a'; ctx.fillRect(x - 54, GY - 66, 108, 10); });
        [700, 850, 1330, 1450, 1570, 1690, 1800, 1900, 2010, 330].forEach(x => { ctx.fillStyle = '#5a2a20'; ctx.fillRect(x - 24, GY - 58, 48, 8); ctx.fillRect(x - 24, GY - 110, 6, 100); ctx.fillRect(x + 18, GY - 110, 6, 100); ctx.fillRect(x - 24, GY - 112, 48, 8); });
        [[1090, 1], [1250, 2], [758, 3], [908, 4], [1388, 5], [1508, 6], [1628, 7], [1746, 8], [1852, 9], [1954, 10], [2066, 11], [396, 12]].forEach(p => gaoji(ctx, p[0], GY - 4, true, p[1]));
        [600, 2140].forEach((x, i) => mumPot(ctx, x, GY - 2, MUMS, 60 + i));
      }
      ctx.restore();
    },
    things(g) {
      const s = g.stage, a = [];
      if (s === 'L0' || s === 'L0b') {
        a.push({ k: 'npc', id: 'liwan', x: 800, face: -1, seq: 'lou_liwan', mark: s === 'L0' });
        a.push({ k: 'npc', id: 'fenger', x: 900, face: -1 });
        a.push({ k: 'npc', id: 'pozi', x: 1180, face: 1, key: 'p1' }, { k: 'npc', id: 'yatou', x: 1330, face: -1, key: 'y1' });
        a.push({ k: 'spot', x: 1555, label: '登梯上缀锦阁', seq: s === 'L0b' ? 'lou_up' : 'lou_ladder_early', mark: s === 'L0b' });
      } else if (s === 'L1' || s === 'L2') {
        a.push({ k: 'npc', id: 'liwan', x: 800, face: 1 }, { k: 'npc', id: 'wangfuren', x: 900, face: 1 }, { k: 'npc', id: 'yuanyang', x: 985, face: 1 },
          { k: 'npc', id: 'jiamu', x: 1070, face: -1, seq: s === 'L1' ? 'lou_jiamu' : null, mark: s === 'L1' }, { k: 'npc', id: 'feng', x: 1170, face: -1 }, { k: 'npc', id: 'hupo', x: 1260, face: -1 }, { k: 'npc', id: 'xichun', x: 1340, face: -1 });
        a.push({ k: 'exit', x: 2340, label: '往沁芳亭', seq: s === 'L2' ? 'go_ting' : 'exit_wait', mark: s === 'L2' });
      } else { // 宴
        const seat = (id, x) => a.push({ k: 'npc', id, x, sit: 1, face: x < 1100 ? 1 : -1 });
        seat('wangfuren', 700); seat('jiamu', 1020); seat('xueyima', 1180); seat('xiangyun', 1330); seat('baochai', 1450); seat('daiyu', 1570); seat('yingchun', 1690); seat('tanchun', 1800); seat('xichun', 1900); seat('baoyu', 2010); seat('liwan', 330);
        a.push({ k: 'npc', id: 'feng', x: 450, face: 1 }, { k: 'npc', id: 'yuanyang', x: g.f.lingOn ? 1100 : 540, face: g.f.lingOn ? -1 : 1, front: g.f.lingOn });
        if (s === 'F0') a.push({ k: 'spot', x: 850, label: '入席（东边的椅几）', seq: 'feast_start', mark: 1 });
      }
      return a;
    }
  },
  // ───────── 沁芳亭 ─────────
  ting: {
    width: 1800, title: () => '第二折 · 沁芳亭',
    draw(ctx, cam, t, g) {
      sky(ctx, '#bfd9e4', '#e3eee6', '#eef0dc');
      hills(ctx, cam * 0.12, '#b5ccc6', 300, 50, 31); hills(ctx, cam * 0.25 + 200, '#9dbaa9', 350, 36, 37);
      water(ctx, 370, H, t, '#b9d0cc', '#6f9aa0');
      ctx.save(); ctx.translate(-cam * 0.5, 0);
      for (let i = 0; i < 8; i++) { ctx.fillStyle = '#8fae93'; ctx.beginPath(); ctx.ellipse(120 + i * 290, 372, 150, 16, 0, 0, 7); ctx.fill(); }
      willow(ctx, 260, 372, 190, 2, t); willow(ctx, 880, 372, 220, 6, t); willow(ctx, 1500, 372, 180, 8, t);
      ctx.save(); ctx.translate(1120, 250); ctx.scale(0.45, 0.45); ctx.fillStyle = '#efe7d2'; ctx.fillRect(0, 120, 300, 130); roof(ctx, -20, 50, 340, 74, '#5b666f'); ctx.restore();
      ctx.restore();
      ctx.save(); ctx.translate(-cam, 0);
      for (let i = 0; i < 30; i++) lotus(ctx, 40 + i * 61 + (i % 3) * 14, 452 + (i % 4) * 9, 40 + (i % 5) * 8, 100 + i, t);
      // 桥
      const by = GY - 28;
      ctx.fillStyle = '#d7d2c4'; ctx.fillRect(0, by - 6, 1800, 60);
      ctx.fillStyle = '#6f9aa0'; [250, 520, 1280, 1550].forEach(x => { ctx.beginPath(); ctx.ellipse(x, by + 60, 96, 52, 0, Math.PI, 0); ctx.fill(); });
      ctx.fillStyle = '#c2bcab'; ctx.fillRect(0, by + 54, 1800, 4);
      railing(ctx, 0, 1800, by - 4, 46, '#ece8dc');
      // 亭
      const px = 680, pw = 460;
      ctx.fillStyle = '#cfc8b6'; ctx.fillRect(px - 30, by - 14, pw + 60, 14);
      ctx.fillStyle = 'rgba(120,60,40,0.12)'; ctx.fillRect(px, 250, pw, by - 264);
      [0, 0.33, 0.67, 1].forEach(u => column(ctx, px + 12 + (pw - 24) * u, 244, by - 12));
      beam(ctx, px - 6, 238, pw + 12, 22);
      ctx.fillStyle = '#8c2f26'; for (let x = px + 20; x < px + pw - 20; x += 22) ctx.fillRect(x, 264, 3, 16); ctx.fillRect(px + 12, 278, pw - 24, 3);
      roof(ctx, px - 40, 150, pw + 80, 90, '#4f5b64'); roof(ctx, px + 110, 84, pw - 220, 64, '#55626b');
      ctx.fillStyle = '#b08a2e'; ctx.beginPath(); ctx.arc(px + pw / 2, 70, 9, 0, 7); ctx.fill(); ctx.fillRect(px + pw / 2 - 3, 74, 6, 12);
      plaque(ctx, px + pw / 2, 196, '沁芳', 96);
      // 栏杆榻板与锦褥
      ctx.fillStyle = '#7a2e25'; ctx.fillRect(px + 150, by - 48, 190, 9); ctx.fillRect(px + 156, by - 40, 6, 28); ctx.fillRect(px + 328, by - 40, 6, 28);
      if (g.stage !== 'T-') { ctx.fillStyle = '#c9762e'; ctx.fillRect(px + 154, by - 56, 182, 9); ctx.fillStyle = '#e8c96a'; for (let x = px + 162; x < px + 330; x += 18) ctx.fillRect(x, by - 54, 8, 5); }
      ctx.restore();
    },
    things(g) {
      const a = [{ k: 'npc', id: 'jiamu', x: 920, sit: 1, face: -1, seq: g.stage === 'T0' ? 'ting_jiamu' : null, mark: g.stage === 'T0' },
      { k: 'npc', id: 'xichun', x: 1040, face: -1 }, { k: 'npc', id: 'wangfuren', x: 1130, face: -1 }, { k: 'npc', id: 'feng', x: 760, face: 1 }, { k: 'npc', id: 'yuanyang', x: 1220, face: -1 }, { k: 'npc', id: 'hupo', x: 1300, face: -1 }, { k: 'npc', id: 'tanchun', x: 660, face: 1 }];
      a.push({ k: 'exit', x: 1740, label: '往潇湘馆', seq: g.stage === 'T1' ? 'go_xx' : 'exit_wait', mark: g.stage === 'T1' });
      return a;
    }
  },
  // ───────── 潇湘馆 · 竹径 ─────────
  xxpath: {
    width: 1900, title: () => '第三折 · 潇湘馆',
    draw(ctx, cam, t, g) {
      sky(ctx, '#cfe0d8', '#e6efe0', '#eef2e2');
      ctx.save(); ctx.translate(-cam * 0.55, 0);
      for (let i = 0; i < 46; i++) bamboo(ctx, 20 + i * 52, GY - 20, 430 + (i % 5) * 28, 200 + i, t, i % 2 ? '#8fb38a' : '#a4c29c');
      ctx.restore();
      ctx.save(); ctx.translate(-cam, 0);
      // 粉垣
      ctx.fillStyle = '#eeeadd'; ctx.fillRect(0, 300, 1480, GY - 320); ctx.fillStyle = '#55606a'; ctx.fillRect(0, 286, 1480, 16); for (let x = 0; x < 1480; x += 18) { ctx.beginPath(); ctx.arc(x + 9, 286, 9, Math.PI, 0); ctx.fill(); }
      // 月洞门
      ctx.fillStyle = '#b9cdb4'; ctx.beginPath(); ctx.arc(110, 400, 92, 0, 7); ctx.fill(); ctx.strokeStyle = '#8f8b80'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(110, 400, 92, 0, 7); ctx.stroke();
      ctx.fillStyle = '#eeeadd'; ctx.fillRect(0, GY - 30, 220, 12);
      // 漏窗
      [520, 900, 1250].forEach(x => { ctx.fillStyle = '#a9c2a4'; ctx.fillRect(x, 340, 90, 70); ctx.strokeStyle = '#8f8b80'; ctx.lineWidth = 4; ctx.strokeRect(x, 340, 90, 70); ctx.lineWidth = 2; ctx.beginPath(); for (let i = 1; i < 4; i++) { ctx.moveTo(x + i * 22.5, 340); ctx.lineTo(x + i * 22.5, 410); } ctx.moveTo(x, 375); ctx.lineTo(x + 90, 375); ctx.stroke(); });
      // 精舍
      ctx.fillStyle = '#efe9d8'; ctx.fillRect(1480, 250, 420, GY - 270);
      lattice(ctx, 1510, 330, 100, 110, '#bfd3bb', '#55705a'); lattice(ctx, 1790, 330, 100, 110, '#bfd3bb', '#55705a');
      ctx.fillStyle = '#3a2f28'; ctx.fillRect(1650, 310, 110, GY - 336);
      ctx.fillStyle = '#c9b074'; ctx.fillRect(1646, 306, 118, 44); ctx.strokeStyle = '#8a7340'; ctx.lineWidth = 1; for (let y = 310; y < 350; y += 5) { ctx.beginPath(); ctx.moveTo(1646, y); ctx.lineTo(1764, y); ctx.stroke(); } // 湘帘已卷
      column(ctx, 1490, 250, GY - 22, '#3f5f4a'); column(ctx, 1630, 250, GY - 22, '#3f5f4a'); column(ctx, 1780, 250, GY - 22, '#3f5f4a');
      roof(ctx, 1450, 170, 480, 82, '#4f5b64');
      plaque(ctx, 1705, 262, '潇湘馆', 120);
      for (let i = 0; i < 16; i++) bamboo(ctx, 250 + i * 78 + (i % 3) * 20, GY - 26, 380 + (i % 4) * 40, 300 + i, t, i % 2 ? '#5f8f4e' : '#4f7f48');
      ctx.restore();
      // 苍苔土地与石子路
      const g1 = ctx.createLinearGradient(0, GY - 28, 0, H); g1.addColorStop(0, '#7f9a5c'); g1.addColorStop(1, '#5d7a48'); ctx.fillStyle = g1; ctx.fillRect(0, GY - 28, W, H - GY + 28);
      ctx.fillStyle = '#cfc9b6'; ctx.fillRect(0, GY - 12, W, 26);
      const r = mulberry(77);
      for (let i = 0; i < 260; i++) { const wx = r() * 1900, yy = GY - 10 + r() * 22, sx = wx - cam; const c = ['#b5ae9a', '#e2ddcc', '#a39c88'][i % 3]; if (sx > -10 && sx < W + 10) { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(sx, yy, 5 + r() * 4, 3, 0, 0, 7); ctx.fill(); } else { r(); } }
      for (let i = 0; i < 120; i++) { const wx = r() * 1900, yy = (i % 2 ? GY - 26 + r() * 12 : GY + 18 + r() * 30), sx = wx - cam; ctx.fillStyle = 'rgba(60,90,40,0.5)'; if (sx > -10 && sx < W + 10) { ctx.beginPath(); ctx.ellipse(sx, yy, 14 + r() * 14, 4, 0, 0, 7); ctx.fill(); } else r(); }
    },
    things(g) {
      const a = [{ k: 'npc', id: 'hupo', x: 520, face: -1 }, { k: 'npc', id: 'jiamu', x: 700, face: -1 }, { k: 'npc', id: 'yuanyang', x: 780, face: -1 }, { k: 'npc', id: 'feng', x: 870, face: -1 }, { k: 'npc', id: 'wangfuren', x: 960, face: -1 }, { k: 'npc', id: 'zijuan', x: 1610, face: -1 }];
      a.push({ k: 'exit', x: 1705, label: '进潇湘馆', seq: 'go_xxin', mark: 1 });
      return a;
    }
  },
  // ───────── 潇湘馆 · 屋内 ─────────
  xxin: {
    width: 1280, title: () => '第三折 · 潇湘馆',
    draw(ctx, cam, t, g) {
      ctx.fillStyle = '#eae3cf'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#d9cfb4'; ctx.fillRect(0, 0, W, 70); ctx.fillStyle = '#6b4a2a'; ctx.fillRect(0, 66, W, 8);
      // 月洞窗与窗纱
      const red = g.f.newGauze;
      ctx.save(); ctx.beginPath(); ctx.arc(640, 270, 150, 0, 7); ctx.clip();
      ctx.fillStyle = '#dfe8d8'; ctx.fillRect(480, 110, 320, 320);
      for (let i = 0; i < 9; i++) bamboo(ctx, 500 + i * 36, 440, 330, 500 + i, t, '#6f9a5c');
      ctx.fillStyle = red ? 'rgba(232,120,130,0.42)' : 'rgba(150,170,120,0.5)'; ctx.fillRect(480, 110, 320, 320);
      ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 2; for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(480 + i * 53, 110); ctx.lineTo(480 + i * 53, 430); ctx.moveTo(480, 110 + i * 53); ctx.lineTo(800, 110 + i * 53); ctx.stroke(); }
      ctx.restore(); ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(640, 270, 150, 0, 7); ctx.stroke();
      // 书架
      ctx.fillStyle = '#5a3a26'; ctx.fillRect(900, 120, 300, 380); ctx.fillStyle = '#3d2718';
      const r = mulberry(5);
      for (let j = 0; j < 4; j++) { ctx.fillStyle = '#3d2718'; ctx.fillRect(912, 132 + j * 92, 276, 80); let x = 916; while (x < 1170) { const w = 12 + r() * 14, h = 50 + r() * 24; ctx.fillStyle = ['#2f4a6a', '#3d5f8a', '#e2dccb', '#6a7f9a', '#27405e'][Math.floor(r() * 5)]; if (r() > 0.25) { ctx.fillRect(x, 212 + j * 92 - h, w, h); ctx.fillStyle = '#f1ede2'; ctx.fillRect(x + w / 2 - 2, 212 + j * 92 - h + 6, 4, h * 0.4); } else { ctx.fillRect(x, 212 + j * 92 - 20, 46, 6); ctx.fillRect(x, 212 + j * 92 - 13, 46, 6); ctx.fillRect(x, 212 + j * 92 - 6, 46, 6); x += 34; } x += w + 2; } }
      // 窗下书案、笔砚
      ctx.fillStyle = '#4a2c1c'; ctx.fillRect(520, 430, 260, 12); ctx.fillRect(532, 442, 10, 60); ctx.fillRect(758, 442, 10, 60);
      ctx.fillStyle = '#2a2a2e'; ctx.fillRect(560, 420, 44, 10); ctx.fillStyle = '#e8e2d0'; ctx.fillRect(620, 424, 80, 6); ctx.fillStyle = '#7a8f9a'; ctx.fillRect(722, 398, 20, 32); ctx.strokeStyle = '#3a2a20'; ctx.lineWidth = 2; [[726, 376], [732, 370], [738, 378]].forEach(p => { ctx.beginPath(); ctx.moveTo(p[0], 400); ctx.lineTo(p[0], p[1]); ctx.stroke(); });
      // 椅、茶几、门帘
      [[300, 1], [430, 1], [190, 1]].forEach(p => { ctx.fillStyle = '#5a3324'; ctx.fillRect(p[0] - 30, GY - 62, 60, 8); ctx.fillRect(p[0] - 30, GY - 130, 6, 124); ctx.fillRect(p[0] + 24, GY - 130, 6, 124); ctx.fillRect(p[0] - 30, GY - 134, 60, 8); });
      ctx.fillStyle = '#5a3324'; ctx.fillRect(345, GY - 70, 40, 6); ctx.fillRect(362, GY - 64, 6, 58); ctx.fillStyle = '#e9f0ee'; ctx.fillRect(356, GY - 82, 16, 12); ctx.fillStyle = '#7fa79a'; ctx.fillRect(354, GY - 84, 20, 3);
      ctx.fillStyle = '#c9b074'; ctx.fillRect(20, 110, 100, 60); ctx.strokeStyle = '#8a7340'; ctx.lineWidth = 1; for (let y = 114; y < 170; y += 5) { ctx.beginPath(); ctx.moveTo(20, y); ctx.lineTo(120, y); ctx.stroke(); }
      ctx.fillStyle = '#bcd0b8'; ctx.fillRect(24, 170, 92, GY - 196);
      scroll(ctx, 826, 130, 52, 250, () => { ctx.strokeStyle = '#3a4a3a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(846, 380); ctx.lineTo(856, 150); ctx.stroke(); ctx.fillStyle = '#3a4a3a'; [[856, 190, 0.5], [852, 240, 2.6], [854, 290, 0.3], [850, 330, 2.9], [856, 170, 2.4]].forEach(q => { ctx.save(); ctx.translate(q[0], q[1]); ctx.rotate(q[2]); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(12, -5, 24, 2); ctx.quadraticCurveTo(12, 4, 0, 0); ctx.fill(); ctx.restore(); }); }); // 墨竹小轴
      if (g.f.gauzeShown) { ctx.fillStyle = '#e8788a'; ctx.globalAlpha = 0.85; ctx.fillRect(455, GY - 96, 52, 30); ctx.globalAlpha = 1; ctx.fillStyle = '#c9506a'; ctx.fillRect(455, GY - 96, 52, 5); }
      // 地
      const gg = ctx.createLinearGradient(0, GY - 6, 0, H); gg.addColorStop(0, '#9a7a56'); gg.addColorStop(1, '#6f5438'); ctx.fillStyle = gg; ctx.fillRect(0, GY - 6, W, H);
      ctx.strokeStyle = 'rgba(0,0,0,0.12)'; for (let x = -200; x < W + 200; x += 110) { ctx.beginPath(); ctx.moveTo(x + 100, GY - 6); ctx.lineTo(x, H); ctx.stroke(); }
    },
    things(g) {
      const s = g.stage, a = [{ k: 'npc', id: 'zijuan', x: 110, face: 1 }, { k: 'npc', id: 'wangfuren', x: 300, sit: 1, face: 1 }, { k: 'npc', id: 'jiamu', x: 430, sit: 1, face: 1, seq: s === 'I1' ? 'xx_sha' : null, mark: s === 'I1' }, { k: 'npc', id: 'daiyu', x: 560, face: -1 }, { k: 'npc', id: 'feng', x: 790, face: -1 }, { k: 'npc', id: 'hupo', x: 1180, face: -1 }];
      if (g.f.xueHere) a.push({ k: 'npc', id: 'xueyima', x: 190, sit: 1, face: 1 });
      a.push({ k: 'spot', x: 930, label: '看窗下书案与书架', seq: s === 'I0' ? 'xx_books' : 'xx_books_again', mark: s === 'I0' });
      return a;
    }
  },
  // ───────── 秋爽斋 · 晓翠堂 与 探春房 ─────────
  qiu: {
    width: 2400, title: () => '第四折 · 秋爽斋',
    draw(ctx, cam, t, g) {
      ctx.fillStyle = '#e6dcc4'; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.translate(-cam, 0);
      // 晓翠堂：敞厅，后见芭蕉梧桐
      const g0 = ctx.createLinearGradient(0, 90, 0, GY); g0.addColorStop(0, '#cfe2e0'); g0.addColorStop(1, '#e8eedc'); ctx.fillStyle = g0; ctx.fillRect(0, 90, 1240, GY - 110);
      tree(ctx, 250, GY - 30, 300, ['#8fae5c', '#b7b94e', '#9fb86a'], 61); tree(ctx, 980, GY - 30, 320, ['#9fb86a', '#c9b24e', '#8fae5c'], 62);
      for (let i = 0; i < 5; i++) { ctx.fillStyle = i % 2 ? '#6f9a5c' : '#5f8f4e'; ctx.save(); ctx.translate(560 + i * 34, GY - 30); ctx.rotate(-0.7 + i * 0.35); ctx.beginPath(); ctx.ellipse(0, -110, 30, 120, 0, 0, 7); ctx.fill(); ctx.restore(); }
      ctx.fillStyle = '#eeeadd'; ctx.fillRect(0, GY - 130, 1240, 100); ctx.fillStyle = '#55606a'; ctx.fillRect(0, GY - 140, 1240, 12);
      railing(ctx, 0, 1240, GY - 30, 40, '#8c2f26');
      [40, 330, 620, 910, 1200].forEach(x => column(ctx, x, 90, GY - 22));
      beam(ctx, 0, 70, 1240, 26); ctx.fillStyle = '#5a3a2e'; ctx.fillRect(0, 0, 2400, 70);
      plaque(ctx, 620, 106, '晓翠堂', 124);
      // 隔断与探春房
      ctx.fillStyle = '#e9e1cb'; ctx.fillRect(1240, 70, 1160, GY - 76);
      ctx.fillStyle = '#6b4a2a'; ctx.fillRect(1236, 70, 14, GY - 76); ctx.fillRect(1236, 70, 110, 14); ctx.fillStyle = '#7a2e25'; for (let y = 90; y < 180; y += 14) { ctx.fillRect(1250, y, 90 - (y - 90) * 0.9, 3); }
      // 米襄阳《烟雨图》与颜鲁公对联
      scroll(ctx, 1560, 110, 200, 250, () => { const gr = ctx.createLinearGradient(0, 110, 0, 360); gr.addColorStop(0, '#d9d6c8'); gr.addColorStop(1, '#b9b8a8'); ctx.fillStyle = gr; ctx.fillRect(1560, 110, 200, 250); ctx.fillStyle = 'rgba(60,70,70,0.45)'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(1560, 300 - i * 34); for (let x = 1560; x <= 1760; x += 20) ctx.lineTo(x, 280 - i * 38 - Math.sin((x + i * 60) / 38) * 22 - (i === 2 ? 30 : 0)); ctx.lineTo(1760, 360); ctx.lineTo(1560, 360); ctx.fill(); } ctx.fillStyle = 'rgba(240,240,230,0.5)'; ctx.fillRect(1560, 250, 200, 26); });
      scroll(ctx, 1500, 120, 40, 230, () => vtext(ctx, '烟霞闲骨格', 1520, 150, 24, '#1f1f1f')); scroll(ctx, 1780, 120, 40, 230, () => vtext(ctx, '泉石野生涯', 1800, 150, 24, '#1f1f1f'));
      // 花梨大理石大案：法帖、宝砚、笔如树林
      ctx.fillStyle = '#6e3b22'; ctx.fillRect(1470, GY - 92, 380, 16); ctx.fillRect(1486, GY - 78, 14, 74); ctx.fillRect(1820, GY - 78, 14, 74); ctx.fillStyle = '#d9d9d2'; ctx.fillRect(1480, GY - 96, 360, 6);
      ctx.fillStyle = '#e8e2d0'; ctx.fillRect(1500, GY - 108, 60, 12); ctx.fillRect(1506, GY - 116, 56, 8); ctx.fillStyle = '#2a2a2e'; ctx.fillRect(1580, GY - 104, 34, 8); ctx.fillRect(1622, GY - 104, 26, 8);
      [[1680, 30], [1720, 38], [1765, 28]].forEach((p, k) => { ctx.fillStyle = ['#7a8f9a', '#8a5a3a', '#5f7f6a'][k]; ctx.fillRect(p[0], GY - 96 - p[1], 26, p[1]); ctx.strokeStyle = '#3a2a20'; ctx.lineWidth = 2; for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(p[0] + 3 + i * 3.3, GY - 96 - p[1]); ctx.lineTo(p[0] - 6 + i * 6.2, GY - 150 - p[1] - (i % 3) * 8); ctx.stroke(); ctx.fillStyle = '#e8e2d0'; ctx.fillRect(p[0] - 8 + i * 6.2, GY - 156 - p[1] - (i % 3) * 8, 3, 7); } });
      // 汝窑花囊白菊
      ctx.fillStyle = '#a9c4c8'; ctx.beginPath(); ctx.ellipse(1400, GY - 50, 36, 40, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#6e3b22'; ctx.fillRect(1370, GY - 14, 60, 10);
      for (let i = 0; i < 12; i++) { const a = -Math.PI * (0.1 + 0.8 * i / 11); ctx.strokeStyle = '#4f6e3a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(1400, GY - 86); ctx.lineTo(1400 + Math.cos(a) * 60, GY - 96 + Math.sin(a) * (46 + (i % 3) * 14)); ctx.stroke(); flower(ctx, 1400 + Math.cos(a) * 60, GY - 96 + Math.sin(a) * (46 + (i % 3) * 14), 10, '#f6f4ea'); }
      // 紫檀架佛手
      ctx.fillStyle = '#4a2030'; ctx.fillRect(1900, GY - 100, 80, 8); ctx.fillRect(1908, GY - 92, 6, 88); ctx.fillRect(1966, GY - 92, 6, 88); ctx.fillStyle = '#d9e2e6'; ctx.beginPath(); ctx.ellipse(1940, GY - 104, 36, 8, 0, 0, 7); ctx.fill();
      for (let i = 0; i < 6; i++) { if (i === 5 && g.f.fosho) continue; ctx.fillStyle = '#e8cf4a'; ctx.beginPath(); ctx.ellipse(1916 + i * 10, GY - 114 - (i % 2) * 8, 8, 10, i, 0, 7); ctx.fill(); }
      // 洋漆架白玉比目磬
      ctx.strokeStyle = '#3a2a20'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(2030, GY - 6); ctx.lineTo(2030, GY - 170); ctx.lineTo(2110, GY - 170); ctx.lineTo(2110, GY - 6); ctx.stroke();
      ctx.strokeStyle = '#b3262e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(2070, GY - 168); ctx.lineTo(2070, GY - 146); ctx.stroke();
      ctx.fillStyle = '#eef2ea'; ctx.beginPath(); ctx.moveTo(2044, GY - 132); ctx.quadraticCurveTo(2070, GY - 158, 2096, GY - 132); ctx.quadraticCurveTo(2070, GY - 120, 2044, GY - 132); ctx.fill(); ctx.fillStyle = '#8a6a3a'; ctx.fillRect(2100, GY - 150, 4, 30);
      // 拔步床葱绿纱帐
      ctx.fillStyle = '#5a3324'; ctx.fillRect(2160, 120, 240, GY - 126); ctx.fillStyle = 'rgba(150,200,120,0.85)'; ctx.fillRect(2176, 140, 224, GY - 200);
      ctx.fillStyle = '#5a3324'; ctx.fillRect(2176, GY - 64, 224, 12);
      [[2210, 220, '#3f7a3a'], [2290, 300, '#7a5a2a'], [2340, 200, '#3f7a3a'], [2250, 380, '#c9506a']].forEach(p => { ctx.fillStyle = p[2]; ctx.beginPath(); ctx.ellipse(p[0], p[1], 10, 4, 0.4, 0, 7); ctx.fill(); ctx.strokeStyle = p[2]; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(p[0] + 6, p[1]); ctx.lineTo(p[0] + 16, p[1] - 10); ctx.moveTo(p[0] - 4, p[1] + 2); ctx.lineTo(p[0] - 12, p[1] + 10); ctx.stroke(); });
      ctx.restore();
      const gg = ctx.createLinearGradient(0, GY - 8, 0, H); gg.addColorStop(0, '#a88a62'); gg.addColorStop(1, '#75593c'); ctx.fillStyle = gg; ctx.fillRect(0, GY - 8, W, H);
      ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 1.5; for (let x = -((cam * 1.1) % 120) - 200; x < W + 200; x += 120) { ctx.beginPath(); ctx.moveTo(x + 90, GY - 8); ctx.lineTo(x, H); ctx.stroke(); }
    },
    drawFront(ctx, cam, t, g) { // 饭桌画在人物之前
      ctx.save(); ctx.translate(-cam, 0);
      const meal = g.stage === 'Q0' || g.stage === 'Q1' || g.stage === 'Qm';
      const tbl = (x, w, col) => { ctx.fillStyle = col || '#6e2420'; ctx.fillRect(x - w / 2, GY - 62, w, 10); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x - w / 2, GY - 52, w, 3); ctx.fillStyle = col || '#6e2420'; ctx.fillRect(x - w / 2 + 6, GY - 52, 8, 62); ctx.fillRect(x + w / 2 - 14, GY - 52, 8, 62); const n = Math.max(1, Math.floor(w / 44)); for (let i = 0; i < n; i++) { const dx = x - w / 2 + (w / n) * (i + 0.5); ctx.fillStyle = '#eef2ee'; ctx.beginPath(); ctx.ellipse(dx, GY - 66, 13, 5, 0, 0, 7); ctx.fill(); ctx.fillStyle = ['#c9762e', '#7a9a4a', '#b5482c', '#e8d9a0'][i % 4]; ctx.beginPath(); ctx.ellipse(dx, GY - 68.5, 8.5, 3.5, 0, 0, 7); ctx.fill(); } };
      if (meal) { tbl(330, 330); tbl(770, 420); tbl(1050, 96, '#9a6a3a'); if (g.stage === 'Qm' && !g.f.egg) { for (let i = 0; i < 4; i++) { ctx.fillStyle = '#f6f1e2'; ctx.beginPath(); ctx.ellipse(1040 + i * 7, GY - 71 - (i % 2) * 3, 4, 3.2, 0, 0, 7); ctx.fill(); } } }
      else tbl(425, 150);
      ctx.restore();
    },
    things(g) {
      const s = g.stage, a = [];
      if (s === 'Qi') { a.push({ k: 'npc', id: 'feng', x: 520, face: 1 }, { k: 'npc', id: 'yuanyang', x: 620, face: -1 }, { k: 'npc', id: 'liwan', x: 760, face: -1 }, { k: 'npc', id: 'tanchun', x: 880, face: -1 }, { k: 'npc', id: 'hupo', x: 400, face: 1 }); }
      else if (s === 'Q0' || s === 'Q1' || s === 'Qm') {
        const st = (id, x, f) => a.push({ k: 'npc', id, x, sit: 1, face: f || 1 });
        st('wangfuren', 200); st('yingchun', 290); st('tanchun', 380, -1); st('xichun', 460, -1);
        st('baochai', 610); st('daiyu', 690); st('jiamu', 775); st('baoyu', 855, -1); st('xiangyun', 935, -1);
        a.push({ k: 'npc', id: 'xueyima', x: 1195, sit: 1, face: -1 }, { k: 'npc', id: 'feng', x: 1125, face: -1, back: 1 }, { k: 'npc', id: 'liwan', x: 535, face: 1, back: 1 });
        a.push({ k: 'npc', id: 'yuanyang', x: s === 'Q0' ? 110 : 985, face: s === 'Q0' ? 1 : -1, back: 1, seq: s === 'Q0' ? 'qiu_yy' : null, mark: s === 'Q0' });
        if (s === 'Q1') a.push({ k: 'spot', x: 1050, label: '入座（小楠木桌）', seq: 'qiu_meal', mark: 1 });
      } else { // Q2 / Q3：饭后
        a.push({ k: 'npc', id: 'liwan', x: 370, sit: 1, face: 1 }, { k: 'npc', id: 'feng', x: 480, sit: 1, face: -1, seq: s === 'Q2' ? 'qiu_apology' : null, mark: s === 'Q2' });
        a.push({ k: 'npc', id: 'yuanyang', x: 570, face: -1, sit: g.f.yySat });
        a.push({ k: 'npc', id: 'jiamu', x: 1640, sit: 1, face: 1 }, { k: 'npc', id: 'xueyima', x: 1560, sit: 1, face: 1 }, { k: 'npc', id: 'wangfuren', x: 1740, sit: 1, face: -1 }, { k: 'npc', id: 'tanchun', x: 1860, face: -1, seq: s === 'Q3' ? 'qiu_baner' : null }, { k: 'npc', id: 'baoyu', x: 1450, face: 1 }, { k: 'npc', id: 'daiyu', x: 1380, face: 1 });
        a.push({ k: 'npc', id: 'baner', x: s === 'Q2' ? 2060 : 2180, face: s === 'Q2' ? -1 : 1, seq: s === 'Q3' ? 'qiu_baner' : null, mark: s === 'Q3', cry: g.f.banerCry, key: 'banerNpc' });
      }
      return a;
    }
  },
  // ───────── 荇叶渚 · 舟中（过场） ─────────
  boat: {
    width: 1280, title: () => '第五折 · 荇叶渚舟中', cut: true,
    draw(ctx, cam, t, g) {
      sky(ctx, '#c3d6dc', '#dfe8e0', '#e9eada');
      hills(ctx, 0, '#b5c8c6', 250, 50, 71); hills(ctx, 400, '#9fb5aa', 290, 30, 73);
      // 岸上蘅芜苑：清厦旷朗，奇草仙藤
      ctx.fillStyle = '#8fa58a'; ctx.beginPath(); ctx.ellipse(900, 330, 520, 40, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#f0ece0'; ctx.fillRect(780, 210, 330, 110); for (let i = 0; i < 5; i++) column(ctx, 790 + i * 78, 206, 322, '#5a6a5a');
      roof(ctx, 760, 140, 370, 70, '#55626b'); plaque(ctx, 945, 216, '蘅芜苑', 110);
      rock(ctx, 700, 330, 110, 81); rock(ctx, 1160, 334, 90, 83);
      const r = mulberry(88); for (let i = 0; i < 40; i++) { const x = 640 + r() * 560, y = 250 + r() * 76; ctx.strokeStyle = '#4f7a52'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 8, y + 10, x + (r() - 0.5) * 20, y + 22); ctx.stroke(); ctx.fillStyle = '#c9402e'; ctx.beginPath(); ctx.arc(x, y, 2.5, 0, 7); ctx.fill(); }
      ctx.fillStyle = '#b5ad98'; for (let i = 0; i < 6; i++) ctx.fillRect(640 + i * 16, 328 + i * 6, 70, 6); // 云步石梯
      water(ctx, 340, H, t, '#b5cdc8', '#648e96');
      for (let i = 0; i < 22; i++) lotus(ctx, 30 + i * 58, 400 + (i % 3) * 14, 44 + (i % 4) * 8, 300 + i, t);
      const boat = (bx, by, ids, pole) => {
        const bob = Math.sin(t * 1.4 + bx) * 3 + (pole && g.f.boatRock ? Math.sin(t * 9) * 4 : 0); ctx.save(); ctx.translate(bx, by + bob); if (pole && g.f.boatRock) ctx.rotate(Math.sin(t * 9) * 0.03);
        ctx.fillStyle = '#b85a4a'; ctx.fillRect(-120, -150, 230, 12); ctx.fillStyle = '#e8c96a'; for (let x = -120; x < 110; x += 16) ctx.fillRect(x, -138, 8, 6); ctx.fillStyle = '#6e3b22'; ctx.fillRect(-116, -140, 5, 110); ctx.fillRect(100, -140, 5, 110);
        ids.forEach((id, i) => drawChar(ctx, id, -90 + i * 46, -22, { scale: 0.62, sit: 1, face: 1, noShadow: 1, flowers: id === 'liu' ? g.f.flowers : id === 'jiamu' ? 'red' : null }));
        if (pole) { drawChar(ctx, 'feng', 150, -24, { scale: 0.62, sit: g.f.fengDown, noShadow: 1, face: 1 }); if (!g.f.fengDown) { ctx.strokeStyle = '#7a5a34'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(166, -110); ctx.lineTo(196, 30); ctx.stroke(); } }
        ctx.fillStyle = '#7a4a2a'; ctx.beginPath(); ctx.moveTo(-170, -30); ctx.quadraticCurveTo(0, 10, 200, -34); ctx.lineTo(170, 4); ctx.quadraticCurveTo(0, 22, -140, 4); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#5a3520'; ctx.fillRect(-140, 0, 310, 5);
        ctx.restore();
      };
      boat(820 + Math.sin(t * 0.2) * 10, 440, ['baoyu', 'baochai', 'daiyu', 'tanchun'], false);
      boat(360 + Math.sin(t * 0.25) * 8, 500, ['liu', 'jiamu', 'xueyima', 'wangfuren', 'yuanyang'], true);
    },
    things() { return []; }
  },
};
