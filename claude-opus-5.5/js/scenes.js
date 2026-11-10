// 场景与剧情
'use strict';
const ALL_STEPS = ['', 'a_li', 'a_loft', 'a_done', 'b_talk', 'b_done', 'c_enter', 'c_room', 'c_done', 'd_aside', 'd_sit', 'd_after', 'd_tan', 'd_done', 'e_board', 'f_room', 'f_done', 'g_sit', 'g_feast'];
function past(s) { return ALL_STEPS.indexOf(G.st.step) >= ALL_STEPS.indexOf(s); }
function stepIs(...a) { return a.includes(G.st.step); }

function OBJECTIVE(g) {
  return ({
    '': '', a_li: '去大观楼下见大奶奶李纨', a_loft: '登梯上缀锦阁瞧瞧', a_done: '随老太太往沁芳亭去',
    b_talk: '到亭上陪老太太说话', b_done: '随众人往潇湘馆去',
    c_enter: '沿石子路进潇湘馆', c_room: '进屋陪老太太坐坐', c_done: '随众人往秋爽斋用早饭',
    d_aside: '晓翠堂上……', d_sit: '入座：老太太身边的小楠木桌', d_after: '饭后', d_tan: '在探春房中逛逛，再陪老太太说话', d_done: '往荇叶渚上船',
    e_board: '到渡头上船（可先与岸上众人说话）', f_room: '在蘅芜苑里陪老太太坐坐', f_done: '往缀锦阁下吃酒',
    g_sit: '入席：东边头一张几', g_feast: '牙牌令',
  })[g.st.step] || '';
}

// ================= 第一折 大观楼前 =================
const SCENES = {};
SCENES.dagl = {
  name: '大观楼前', section: '第一折　晨开缀锦阁', spawn: [110, 600, 'right'],
  walk: [[20, 340, 1260, 370]],
  walls: [[930, 350, 200, 70]],
  bg(c) {
    const g = c.createLinearGradient(0, 0, 0, 340); g.addColorStop(0, '#c9d6d2'); g.addColorStop(1, '#e8e2cc');
    c.fillStyle = g; c.fillRect(0, 0, W, 340);
    // 远山
    c.fillStyle = '#a9b8b2'; c.beginPath(); c.moveTo(0, 200); for (let x = 0; x <= W; x += 40) c.lineTo(x, 170 + Math.sin(x / 90) * 30 + Math.sin(x / 33) * 8); c.lineTo(W, 340); c.lineTo(0, 340); c.fill();
    tree(c, 170, 330, 120, 11); tree(c, 1120, 320, 130, 12);
    hall(c, 440, 50, 400, 140, { name: '缀锦阁', roofH: 54, cols: 5, door: -1 });
    hall(c, 380, 150, 520, 200, { name: '大观楼', cols: 6, door: 2, roofH: 66 });
    // 楼梯
    c.fillStyle = '#7a4a30'; c.save(); c.translate(330, 345);
    for (let i = 0; i < 9; i++) { c.fillRect(-26 + i * 3, -i * 18, 46, 6); }
    c.fillStyle = '#5a3020'; c.fillRect(-30, -170, 5, 172); c.fillRect(22, -170, 5, 172); c.restore();
    bricks(c, 0, 340, W, 380, '#bdb8aa', '#a39e90', 48);
    // 菊花盆
    [470, 540, 610, 680, 750, 820].forEach((x, i) => chrys(c, x, 362, ['#f2c33a', '#f5efe0', '#e0503a', '#c98ae0'][i % 4], 20 + i));
    // 高几
    for (let i = 0; i < 6; i++) lowTable(c, 940 + (i % 3) * 62, 352 + Math.floor(i / 3) * 34, 52, 18, '#4a2a1e', '#6e3c2a');
    // 园门（左）
    rect(c, 0, 420, 18, 300, '#e8e2d6'); rect(c, 0, 410, 22, 12, '#3b4652');
    rock(c, 1180, 700, 40, 5); rock(c, 60, 400, 30, 7);
    noiseDots(c, 0, 340, W, 380, 300, ['rgba(160,110,50,0.5)', 'rgba(190,140,40,0.5)'], 9, 3);
    // 路标
    rect(c, 1220, 470, 6, 60, '#5a3a2a');
  },
  setup(g) {
    if (!past('a_loft') || stepIs('a_loft')) {
      addNpc('liwan', 'liwan', 640, 430); addNpc('suyun', 'suyun', 720, 420); addNpc('pozi', 'pozi', 1000, 460, 'up');
      if (!past('a_loft')) addNpc('fenger', 'fenger', 180, 590, 'right');
      else addNpc('fenger', 'fenger', 580, 440, 'right');
    } else if (stepIs('a_done')) {
      addNpc('liwan', 'liwan', 640, 430); addNpc('suyun', 'suyun', 720, 420); addNpc('pozi', 'pozi', 1000, 460, 'up');
    }
  },
  onEnter(g) {
    if (g.st.step === '') return [
      { banner: '第一折　晨开缀锦阁', sub: '次日清早，天气清朗' },
      ['n', '这一日天气清朗。荣国府的大观园里，落叶才扫过一遍，丫头婆子们擦抹桌椅、预备茶酒器皿，忙作一团。'],
      ['n', '你是刘姥姥——城外庄子上的一个老寡妇，带著外孙板儿进府走动。昨儿蒙贾母留下住了一宿。'],
      ['n', '今日贾母要在园中给史湘云还席，特叫你也跟著热闹一天。你心里只盘算一件事：讨老太太一个欢喜，也不枉进城这一遭。'],
      ['fenger', '姥姥，这边走。我们奶奶打发我送钥匙给大奶奶，大奶奶这会子在大观楼底下呢。'],
      ['liu', '好姑娘，你只管前头走，我老婆子跟得上。'],
      { do: () => { setStep('a_li'); const f = npc('fenger'); f.tx = 580; f.ty = 440; f.endDir = 'right'; } },
    ];
  },
  talk: {
    liwan(g) {
      if (stepIs('a_li')) return [
        ['fenger', '大奶奶倒忙的紧。'],
        ['liwan', '（笑道）我说你昨儿去不成，只忙著要去。'],
        ['liu', '老太太留下我，叫我也热闹一天去。'],
        ['fenger', '我们奶奶说了，外头的高几儿恐不够使，不如开了楼，把那收著的拿下来使一天罢。奶奶原该亲自来的，因和太太说话呢，请大奶奶开了，带著人搬罢。'],
        ['liwan', '素云，接了钥匙。再叫婆子出去，把二门上的小厮叫几个来。'],
        ['n', '缀锦阁开了，小厮老婆子丫头一齐动手，一张一张往下抬几子。'],
        ['liwan', '好生著，别慌慌张张鬼赶来似的，仔细碰了牙子。'],
        ['liwan', '（回头向你笑道）姥姥，你也上去瞧瞧。'],
        { do: () => setStep('a_loft') },
      ];
      if (stepIs('a_loft')) return [['liwan', '楼梯就在西头。姥姥上去仔细脚下，板儿也拉著些。']];
      return [['liwan', '老太太今儿兴致好，只怕还要坐船。我叫人把舡上的篙桨、遮阳幔子都搬下来预备著。']];
    },
    fenger(g) { return [['fenger', stepIs('a_li') ? '大奶奶就在楼底下，姥姥过去罢。' : '姥姥只管逛去，有事只叫人。']]; },
    suyun(g) { return [['suyun', '姥姥早。这些几子我们抬了二十多张下来，还怕不够呢。']]; },
    pozi(g) { return [['pozi', '姥姥让一让，仔细碰著您老人家。这几子沉著呢！']]; },
    jiamu(g) { return [['jiamu', '刘亲家，咱们往沁芳亭上歇歇脚去。']]; },
    fengjie(g) { return [['fengjie', g.st.flags.flowers ? '姥姥这一头花，比画儿上的还热闹呢。' : '姥姥倒会惜福。罢了，横竖今儿有的是乐子。']]; },
  },
  items: [
    { x: 340, y: 360, label: '楼梯（上缀锦阁）', cond: () => stepIs('a_loft'), run: () => loftScene() },
  ],
  exits: [{ x: 1240, y: 430, w: 40, h: 240, to: 'qfting', spawn: [90, 640, 'right'], label: '往沁芳亭 →', cond: () => past('a_done'), locked: '' }],
};
SCENES.dagl.exits[0].locked = '今儿是陪老太太来的，先办完眼前的事再走。';

function loftScene() {
  return [
    ['n', '刘姥姥听说，巴不得一声儿，便拉了板儿登梯上去。'],
    { fade: true, mid: () => { G.player.x = 360; G.player.y = 380; G.st.flags.loftSeen = true; } },
    ['n', '进里面，只见乌压压的堆著些围屏、桌椅、大小花灯之类，虽不大认得，只见五彩炫耀，各有奇妙。'],
    ['ban', '姥姥，那个亮晃晃的灯是什么？'],
    ['liu', '别乱摸！碰坏了，把咱娘儿俩卖了也赔不起。阿弥陀佛，阿弥陀佛……'],
    ['n', '念了几声佛，便下来了。然后锁上门，一齐才下来。'],
    ['liwan', '恐怕老太太高兴，越性把舡上划子、篙桨、遮阳幔子都搬了下来预备著。传驾娘们到舡坞里撑出两只船来。'],
    ['n', '正乱著安排，只见贾母已带了一群人进来了。'],
    { do: () => { removeNpc('fenger');
      addNpc('jiamu', 'jiamu', -40, 560); addNpc('fengjie', 'fengjie', -80, 600); addNpc('yuanyang', 'yuanyang', -90, 520); addNpc('hupo', 'hupo', -130, 560); addNpc('wangfr', 'wangfr', -150, 610);
    } },
    { move: [['jiamu', 470, 470], ['fengjie', 430, 520], ['yuanyang', 400, 450], ['hupo', 360, 480], ['wangfr', 330, 540], ['liwan', 560, 460]] },
    { do: () => { npc('jiamu').dir = 'right'; npc('liwan').dir = 'left'; G.player.x = 560; G.player.y = 540; G.player.dir = 'left'; } },
    ['liwan', '老太太高兴，倒进来了。我只当还没梳头呢，才撷了菊花要送去。'],
    ['n', '一面说，碧月早捧过一个大荷叶式的翡翠盘子来，里面盛著各色的折枝菊花。贾母便拣了一朵大红的簪于鬓上。'],
    { do: () => { G.st.flags.jmFlower = true; } },
    ['jiamu', '（回头看见了你，忙笑道）过来带花儿。'],
    ['fengjie', '（一语未完，便拉过你来）让我打扮你。'],
    ['n', '说著，将一盘子花横三竖四的插了一头。贾母和众人笑的了不得。'],
    { do: () => { G.st.flags.flowers = true; } },
    ['liu', '我这头也不知修了什么福，今儿这样体面起来。'],
    ['hupo', '你还不拔下来摔到他脸上呢，把你打扮的成了个老妖精了。'],
    ...choice1(),
  ];
}

function choice1() {
  return [{
    choice: '满头横三竖四的菊花，满院子的人都笑弯了腰。凤姐正等著看你怎么接这个茬——', id: 'c1',
    opts: [
      { t: '「我虽老了，年轻时也风流，爱个花儿粉儿的，今儿老风流才好。」', label: '自嘲“老风流”', fx: () => { adj('favor', 1); adj('bond', 1); G.st.flags.flowers = true; G.st.flags.oneFlower = false; },
        then: [
          ['liu', '我虽老了，年轻时也风流，爱个花儿粉儿的，今儿老风流才好。'],
          ['n', '众人越发笑得前仰后合。'],
          ['jiamu', '（笑得揉著胸口）好个老风流！凤丫头，你今儿可遇著对手了。'],
          ['fengjie', '姥姥这样爽快，我越发爱你了。回来还有好玩的呢。'],
          { toast: '老太太欢心 +1　凤姐鸳鸯情分 +1' },
        ] },
      { t: '谢过奶奶，悄悄拔下满头的花，只留老太太赏的那一朵大红的。', label: '只留一朵', fx: () => { adj('dignity', 1); G.st.flags.flowers = false; G.st.flags.oneFlower = true; },
        then: [
          ['n', '刘姥姥陪著笑，把头上的花一枝一枝拔下来放回盘里，只将一朵大红的端端正正簪在鬓边。'],
          ['liu', '奶奶疼我，我知道。只是老婆子这把年纪，插一朵是福气，插一头倒折了福了。'],
          ['jiamu', '（点头笑道）倒是个知礼的。这一朵配你正好。'],
          ['fengjie', '（撇撇嘴笑道）姥姥倒会惜福。罢了，横竖今儿有的是乐子。'],
          { toast: '庄家人本色 +1' },
        ] },
    ],
  },
  ['jiamu', '咱们往沁芳亭上歇歇脚去。刘亲家，你跟著我。'],
  { move: [['jiamu', 1300, 520], ['fengjie', 1300, 560], ['yuanyang', 1320, 480], ['hupo', 1340, 540], ['wangfr', 1360, 600]] },
  { do: () => { ['jiamu', 'fengjie', 'yuanyang', 'hupo', 'wangfr'].forEach(removeNpc); setStep('a_done'); } },
  ];
}

// ================= 第二折 沁芳亭 =================
SCENES.qfting = {
  name: '沁芳亭', section: '第二折　画儿上的园子', spawn: [90, 640, 'right'],
  walk: [[0, 570, 1280, 150], [295, 400, 70, 180], [295, 395, 240, 65], [520, 262, 240, 180], [755, 330, 525, 65]],
  bg(c) {
    water(c, 0, 52, W, 520);
    // 北岸
    c.fillStyle = '#8fa070'; c.beginPath(); c.moveTo(0, 52); c.lineTo(W, 52); c.lineTo(W, 150); for (let x = W; x >= 0; x -= 40) c.lineTo(x, 150 + Math.sin(x / 70) * 18); c.fill();
    willow(c, 140, 160, 110, 3); willow(c, 980, 150, 100, 4); tree(c, 420, 140, 90, 6); rock(c, 700, 150, 40, 8); rock(c, 1180, 160, 30, 9);
    // 南岸
    c.fillStyle = '#a8a27a'; c.beginPath(); c.moveTo(0, 720); c.lineTo(0, 575); for (let x = 0; x <= W; x += 40) c.lineTo(x, 570 + Math.sin(x / 60) * 6); c.lineTo(W, 720); c.fill();
    bricks(c, 0, 600, W, 120, '#b9b2a0', '#a39c88', 44);
    willow(c, 1100, 640, 120, 13); rock(c, 40, 610, 26, 14);
    // 荷叶
    const r = makeRnd(77); for (let i = 0; i < 40; i++) { const x = r() * W, y = 180 + r() * 380; if ((x > 280 && x < 380 && y > 390) || (x > 500 && x < 780 && y > 230 && y < 460) || (y > 320 && y < 410 && x > 740)) continue; lotusLeaf(c, x, y, 12 + r() * 10, r() > 0.4, r() * 6); }
    // 桥
    const plank = (x, y, w, h) => { rect(c, x, y, w, h, '#c4bca8'); c.strokeStyle = '#a49c88'; c.lineWidth = 1; for (let k = x; k < x + w; k += 16) { c.beginPath(); c.moveTo(k, y); c.lineTo(k, y + h); c.stroke(); } rect(c, x, y + h, w, 6, '#7a7464'); };
    plank(295, 395, 240, 65); plank(295, 455, 70, 125); plank(755, 330, 525, 65);
    railing(c, 295, 395, 520, 395); railing(c, 755, 330, W, 330); railing(c, 755, 395, W, 395);
    // 亭台
    rect(c, 515, 255, 250, 195, '#9a978e'); rect(c, 525, 262, 230, 180, '#cfc8b4');
    c.strokeStyle = '#b8b09a'; for (let k = 525; k < 755; k += 23) { c.beginPath(); c.moveTo(k, 262); c.lineTo(k, 442); c.stroke(); }
    railing(c, 525, 442, 600, 442); railing(c, 680, 442, 755, 442);
    [[530, 270], [750, 270], [530, 440], [750, 440]].forEach(([x, y]) => rect(c, x - 6, y - 70, 12, 70, '#a3392c'));
    roof(c, 520, 120, 240, 90, '#3b4652');
    plaque(c, 640, 210, '沁芳');
    // 锦褥
    rect(c, 590, 300, 100, 26, '#b03a3a'); rect(c, 594, 304, 92, 18, '#d4a94a'); rect(c, 598, 307, 84, 12, '#b03a3a');
  },
  anim(c, t) { waterRipples(c, 0, 150, W, 420, t, 5); },
  setup(g) {
    if (!past('b_done')) {
      addNpc('jiamu', 'jiamu', 640, 330, 'down', { sit: true, fixedDir: true });
      addNpc('xichun', 'xichun', 720, 350); addNpc('wangfr', 'wangfr', 565, 350); addNpc('fengjie', 'fengjie', 580, 420); addNpc('yuanyang', 'yuanyang', 700, 425); addNpc('hupo', 'hupo', 470, 425);
    }
  },
  onEnter(g) { if (stepIs('a_done')) { setStep('b_talk'); return [{ banner: '第二折　画儿上的园子', sub: '说笑之间，已来至沁芳亭子上' }]; } },
  talk: {
    jiamu(g) {
      if (stepIs('b_talk')) return [
        ['n', '丫鬟们抱了一个大锦褥子来，铺在栏杆榻板上。贾母倚柱坐下，命刘姥姥也坐在旁边。'],
        ['jiamu', '这园子好不好？'],
        ['liu', '（念佛说道）我们乡下人到了年下，都上城来买画儿贴。时常闲了，大家都说，怎么得也到画儿上去逛逛。想著那个画儿也不过是假的，那里有这个真地方呢。'],
        ['liu', '谁知我今儿进这园一瞧，竟比那画儿还强十倍。怎么得有人也照著这个园子画一张，我带了家去，给他们见见，死了也得好处。'],
        ['jiamu', '（指著惜春笑道）你瞧我这个小孙女儿，他就会画。等明儿叫他画一张如何？'],
        { do: () => { G.player.x = 690; G.player.y = 380; G.player.dir = 'right'; } },
        ['n', '刘姥姥听了，喜的忙跑过来，拉著惜春的手。'],
        ['liu', '我的姑娘！你这么大年纪儿，又这么个好模样，还有这个能干，别是神仙托生的罢。'],
        ['n', '惜春抿著嘴儿，只是笑，并不答言。'],
        ['jiamu', '少歇一回，我自然领著你都见识见识。先到潇湘馆，看看我那外孙女儿的屋子去。'],
        { move: [['jiamu', 1300, 360], ['wangfr', 1320, 350], ['fengjie', 1340, 370], ['yuanyang', 1360, 360], ['hupo', 1380, 350]] },
        { do: () => { ['jiamu', 'wangfr', 'fengjie', 'yuanyang', 'hupo'].forEach(removeNpc); npc('xichun').tx = 1300; npc('xichun').ty = 360; setStep('b_done'); } },
      ];
      return [];
    },
    xichun(g) { return [['xichun', past('b_done') ? '（轻声）姥姥要的画儿……我慢慢儿画就是了。' : '姥姥，老太太请您过去坐呢。']]; },
    wangfr(g) { return [['wangfr', '姥姥只管陪老太太说话，不必拘礼。']]; },
    fengjie(g) { return [['fengjie', '姥姥，老太太问你话呢，还不快过去？']]; },
    yuanyang(g) { return [['yuanyang', '姥姥这一向身子可硬朗？今儿要走的路多呢。']]; },
    hupo(g) { return [['hupo', '姥姥坐那锦褥子上罢，老太太叫你坐呢。']]; },
  },
  exits: [{ x: 1235, y: 330, w: 45, h: 65, to: 'xxg', spawn: [60, 470, 'right'], label: '往潇湘馆 →', cond: () => past('b_done'), locked: '老太太正等你说话呢。' }],
};

// ================= 第三折 潇湘馆 =================
SCENES.xxg = {
  name: '潇湘馆', section: '第三折　苍苔与软烟罗', spawn: [60, 470, 'right'],
  walk: [[20, 330, 790, 260], [790, 350, 50, 110], [830, 250, 430, 440]],
  walls: [[900, 250, 260, 60], [1150, 520, 110, 120]],
  bg(c) {
    rect(c, 0, 52, W, H - 52, '#5a7a48');
    noiseDots(c, 0, 52, 820, 668, 1600, ['#4a6a3a', '#6a8a50', '#3f5f32', '#7a9a5a'], 21, 3);
    // 竹
    for (let i = 0; i < 9; i++) bambooClump(c, 40 + i * 92, 330, 260, 30 + i, 6);
    // 石子小路
    c.strokeStyle = '#a8a294'; c.lineWidth = 46; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, 470); c.bezierCurveTo(200, 520, 300, 380, 480, 440); c.bezierCurveTo(620, 490, 700, 400, 830, 405); c.stroke();
    c.lineCap = 'butt';
    const r = makeRnd(5); for (let i = 0; i < 500; i++) { const tt = r(); const p = bez(tt); ellipse(c, p[0] + (r() - 0.5) * 36, p[1] + (r() - 0.5) * 36, 3, 2, ['#c8c2b4', '#8a8478', '#b4ae9e'][Math.floor(r() * 3)]); }
    for (let i = 0; i < 9; i++) bambooClump(c, 20 + i * 92, 720, 150, 50 + i, 5);
    // 墙
    rect(c, 810, 52, 30, 300, '#e8e4da'); rect(c, 810, 460, 30, 260, '#e8e4da');
    rect(c, 806, 52, 38, 10, '#3b4652');
    // 湘帘门
    c.fillStyle = '#c9b27a'; for (let y = 352; y < 392; y += 4) c.fillRect(812, y, 26, 2);
    // 室内
    rect(c, 840, 52, 440, 668, '#b8a07a');
    c.strokeStyle = '#a08a66'; c.lineWidth = 1; for (let y = 52; y < H; y += 22) { c.beginPath(); c.moveTo(840, y); c.lineTo(W, y); c.stroke(); }
    rect(c, 840, 52, 440, 150, '#e6dcc8');
    // 窗（旧绿纱）
    lattice(c, 880, 70, 150, 110, '#5a3a28', '#9fb59a');
    lattice(c, 1060, 70, 80, 110, '#5a3a28', '#9fb59a');
    // 书架
    rect(c, 1160, 60, 110, 190, '#5a3424');
    for (let k = 0; k < 4; k++) { rect(c, 1166, 70 + k * 45, 98, 38, '#3a2018'); const rr = makeRnd(k + 3); for (let x = 1168; x < 1260; x += 8) rect(c, x, 74 + k * 45 + rr() * 6, 6, 32, ['#c9b27a', '#7a8aa0', '#e8dcc0', '#a05a3a'][Math.floor(rr() * 4)]); }
    // 书案
    lowTable(c, 900, 220, 250, 40, '#4a2a1e', '#6e3c2a');
    rect(c, 940, 228, 30, 20, '#222'); rect(c, 990, 226, 60, 18, '#f0e8d8'); c.strokeStyle = '#333'; c.lineWidth = 2; c.beginPath(); c.moveTo(1080, 222); c.lineTo(1080, 200); c.moveTo(1090, 222); c.lineTo(1094, 202); c.stroke();
    rect(c, 1100, 222, 30, 20, '#3a5a7a');
    // 椅
    [[1080, 330], [1000, 420], [1180, 420]].forEach(([x, y]) => { rect(c, x - 18, y - 46, 36, 8, '#5a2e22'); rect(c, x - 18, y - 30, 36, 20, '#7a4030'); });
    // 床（帐）
    rect(c, 1150, 520, 120, 130, '#e8e0d0'); rect(c, 1150, 520, 120, 18, '#5a7a68');
  },
  setup(g) {
    if (!past('c_room')) {
      addNpc('jiamu', 'jiamu', 230, 450, 'right'); addNpc('wangfr', 'wangfr', 170, 470, 'right'); addNpc('fengjie', 'fengjie', 200, 400, 'right'); addNpc('hupo', 'hupo', 300, 420, 'left'); addNpc('yuanyang', 'yuanyang', 140, 420, 'right');
      addNpc('daiyu', 'daiyu', 980, 330); addNpc('zijuan', 'zijuan', 870, 420, 'left');
    } else {
      addNpc('daiyu', 'daiyu', 980, 330); addNpc('zijuan', 'zijuan', 870, 470, 'left');
      if (!past('c_done')) { addNpc('jiamu', 'jiamu', 1080, 336, 'down', { sit: true, fixedDir: true }); addNpc('wangfr', 'wangfr', 1000, 426, 'down', { sit: true, fixedDir: true }); addNpc('fengjie', 'fengjie', 1110, 470, 'left'); addNpc('yuanyang', 'yuanyang', 1150, 340, 'left'); addNpc('hupo', 'hupo', 940, 470, 'up'); }
    }
  },
  onEnter(g) { if (stepIs('b_done')) { setStep('c_enter'); return [{ banner: '第三折　苍苔与软烟罗', sub: '先到了潇湘馆' }, ['n', '一进门，只见两边翠竹夹路，土地下苍苔布满，中间羊肠一条石子漫的路。'], ['n', '刘姥姥让出路来与贾母众人走，自己却走那苍苔土地。']]; } },
  triggers: [{ x: 330, y: 300, w: 80, h: 320, cond: () => stepIs('c_enter'), run: () => fallScene() }],
  talk: {
    jiamu(g) {
      if (stepIs('c_enter')) return [['jiamu', '刘亲家，你前头走，看仔细脚底下。']];
      if (stepIs('c_room')) return ruanyanluo();
      return [];
    },
    daiyu(g) {
      if (stepIs('c_enter')) return [];
      return [['daiyu', g.st.flags.book ? '姥姥谬赞了。不过几本闲书，胡乱堆在这里罢了。' : '姥姥请坐。紫鹃，给姥姥倒碗茶来。'], ['n', '黛玉说话轻声细气，眉尖若蹙，倒叫刘姥姥不敢大声。']];
    },
    zijuan(g) { return [['zijuan', '姥姥小心门槛。湘帘子我打起来了，您老进来罢。']]; },
    fengjie(g) { return [['fengjie', '姥姥别光看，老太太那里还有好东西给你瞧呢。']]; },
    wangfr(g) { return [['wangfr', '姥姥跌那一下，可疼不疼？']]; },
    hupo(g) { return [['hupo', stepIs('c_enter') ? '姥姥，你上来走，仔细苍苔滑了。' : '姥姥方才那一跤，可唬了我一跳。']]; },
    yuanyang(g) { return [['yuanyang', '姥姥，林姑娘这屋子，可比那书房还雅致罢？']]; },
  },
  items: [{ x: 1020, y: 290, label: '窗下书案', cond: () => past('c_room'), run: () => { G.st.flags.book = true; return [
    ['n', '窗下案上设著笔砚，书架上磊著满满的书。'],
    ['liu', '这必定是那位哥儿的书房了。'],
    ...(npc('jiamu') ? [['jiamu', '（笑指黛玉）这是我这外孙女儿的屋子。']] : [['zijuan', '姥姥，这是我们姑娘的屋子。']]),
    ['n', '刘姥姥留神打量了黛玉一番。'],
    ['liu', '这那象个小姐的绣房，竟比那上等的书房还好。'],
  ]; } }],
  exits: [{ x: 20, y: 330, w: 30, h: 260, to: 'qsz', spawn: [70, 600, 'right'], label: '← 往秋爽斋', cond: () => past('c_done'), locked: '老太太还在潇湘馆里呢。' }],
};
function bez(t) {
  const seg = t < 0.5 ? [[0, 470], [200, 520], [300, 380], [480, 440]] : [[480, 440], [620, 490], [700, 400], [830, 405]];
  const u = t < 0.5 ? t * 2 : (t - 0.5) * 2;
  const f = (a, b, c2, d) => (1 - u) ** 3 * a + 3 * (1 - u) ** 2 * u * b + 3 * (1 - u) * u * u * c2 + u ** 3 * d;
  return [f(seg[0][0], seg[1][0], seg[2][0], seg[3][0]), f(seg[0][1], seg[1][1], seg[2][1], seg[3][1])];
}

function fallScene() {
  return [
    ['hupo', '（拉著你说道）姥姥，你上来走，仔细苍苔滑了。'],
    ['liu', '不相干的，我们走熟了的，姑娘们只管走罢。可惜你们的那绣鞋，别沾脏了。'],
    ['n', '他只顾上头和人说话，不防底下果踩滑了——'],
    { do: () => { G.player.sit = true; G.player.dir = 'down'; }, }, { shake: 0.6 },
    ['n', '咕咚一跤跌倒。众人拍手都哈哈的笑起来。'],
    ['jiamu', '（笑骂道）小蹄子们，还不搀起来，只站著笑。'],
    ['liu', '（自己爬起来，也笑了）才说嘴就打了嘴。'],
    { do: () => { G.player.sit = false; } },
    ['jiamu', '可扭了腰了不曾？叫丫头们捶一捶。'],
    ['liu', '那里说的我这么娇嫩了。那一天不跌两下子，都要捶起来，还了得呢。'],
    ['n', '紫鹃早打起湘帘，贾母等进来坐下。'],
    { fade: true, mid: () => { setStep('c_room'); G.npcs = []; SCENES.xxg.setup(G); addNpc('ban', 'ban', 900, 480, 'down', { follow: true }); G.player.x = 900; G.player.y = 420; G.player.dir = 'right'; } },
    ['n', '林黛玉亲自用小茶盘捧了一盖碗茶来奉与贾母。王夫人道不吃茶，黛玉便命丫头把自己窗下常坐的一张椅子挪到下首，请王夫人坐了。'],
  ];
}

function ruanyanluo() {
  return [
    ['jiamu', '宝玉怎么不见？'],
    ['hupo', '在池子里舡上呢。'],
    ['n', '贾母方欲说话时，有人回说：“姨太太来了。”'],
    { do: () => { addNpc('xueyima', 'xueyima', 850, 410, 'right'); } },
    ['xueyima', '今儿老太太高兴，这早晚就来了。'],
    ['jiamu', '我才说来迟了的要罚他，不想姨太太就来迟了。'],
    ['n', '说笑一会，贾母因见窗上纱的颜色旧了。'],
    ['jiamu', '这个院子里头又没有个桃杏树，这竹子已是绿的，再拿这绿纱糊上反不配。明儿给他把这窗上的换了。'],
    ['fengjie', '昨儿我开库房，看见大板箱里还有好些匹银红蝉翼纱，颜色又鲜，纱又轻软，我竟没见过这样的。'],
    ['jiamu', '呸，人人都说你没有不经过不见过，连这个纱还不认得呢，明儿还说嘴。'],
    ['jiamu', '那个纱，比你们的年纪还大呢。正经名字叫作“软烟罗”。只有四样颜色：雨过天晴、秋香色、松绿的、银红的。做了帐子，糊了窗屉，远远的看著，就似烟雾一样。'],
    ['xueyima', '别说凤丫头没见，连我也没听见过。'],
    ['n', '凤姐早命人取了一匹来。众人都看了，称赞不已。刘姥姥也觑著眼看个不了。'],
    ['liu', '（念佛说道）我们想他作衣裳也不能，拿著糊窗子，岂不可惜？'],
    ['jiamu', '倒是做衣裳不好看。再找一找，只怕还有青的。若有时都拿出来，送这刘亲家两匹，做一个帐子我挂。'],
    { do: () => { G.st.flags.gauze = true; } },
    { toast: '贾母许下：送刘亲家两匹软烟罗' },
    ['liu', '人人都说大家子住大房。昨儿见了老太太正房，那柜子比我们那一间房子还大还高。如今又见了这小屋子，更比大的越发齐整了。满屋里的东西都只好看，都不知叫什么，我越看越舍不得离了这里。'],
    ['fengjie', '还有好的呢，我都带你去瞧瞧。'],
    ['jiamu', '（起身笑道）这屋里窄，再往别处逛去。早饭就摆到你三妹妹那里。'],
    { fade: true, mid: () => { ['jiamu', 'wangfr', 'fengjie', 'yuanyang', 'hupo', 'xueyima'].forEach(removeNpc); setStep('c_done'); } },
    ['n', '一行人离了潇湘馆。凤姐带了探春、李纨、鸳鸯、琥珀和端饭的人，抄近路往秋爽斋先去摆饭。'],
  ];
}

// ================= 第四折 秋爽斋 =================
const SEAT = [430, 330];
SCENES.qsz = {
  name: '秋爽斋·晓翠堂', section: '第四折　女篾片', spawn: [70, 600, 'right'],
  walk: [[20, 260, 1240, 440]],
  walls: [[150, 250, 240, 60], [130, 395, 170, 45], [620, 250, 40, 150], [620, 530, 40, 190], [720, 240, 300, 70], [1080, 470, 190, 200], [1180, 250, 90, 60]],
  bg(c) {
    rect(c, 0, 52, W, H, '#a88a64');
    c.strokeStyle = '#94785a'; for (let y = 52; y < H; y += 26) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    rect(c, 0, 52, W, 170, '#e9e0cc');
    // 左：晓翠堂
    lattice(c, 40, 72, 160, 110, '#5a3a28'); lattice(c, 380, 72, 160, 110, '#5a3a28');
    plaque(c, 290, 80, '晓翠堂');
    // 右：探春卧室  —— 烟雨图与对联
    rect(c, 820, 64, 190, 150, '#f0ead8'); c.strokeStyle = '#7a6a50'; c.lineWidth = 3; c.strokeRect(820, 64, 190, 150);
    c.fillStyle = 'rgba(80,90,90,0.35)'; c.beginPath(); c.moveTo(830, 190); for (let x = 830; x <= 1000; x += 10) c.lineTo(x, 150 - Math.sin(x / 20) * 20 - Math.sin(x / 7) * 6); c.lineTo(1000, 204); c.lineTo(830, 204); c.fill();
    c.fillStyle = 'rgba(60,70,70,0.5)'; c.beginPath(); c.moveTo(830, 204); for (let x = 830; x <= 1000; x += 10) c.lineTo(x, 175 - Math.sin(x / 15 + 2) * 12); c.lineTo(1000, 204); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(830, 120, 170, 18);
    const scroll = (x, txt) => { rect(c, x, 64, 34, 170, '#e8dcc0'); rect(c, x - 3, 62, 40, 5, '#5a3a28'); c.fillStyle = '#222'; c.font = `20px ${FONT_KAI}`; [...txt].forEach((ch, i) => c.fillText(ch, x + 7, 92 + i * 27)); };
    scroll(770, '烟霞闲骨格'); scroll(1026, '泉石野生涯');
    // 大案
    rect(c, 715, 235, 310, 75, '#6a3020'); rect(c, 720, 238, 300, 54, '#d8d0c0');
    c.fillStyle = 'rgba(120,120,120,0.25)'; for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(760 + i * 45, 262, 18, 6, i, 0, 7); c.fill(); }
    for (let i = 0; i < 4; i++) rect(c, 735 + i * 22, 244 - i * 3, 18, 10, ['#8a4a2a', '#c9b27a', '#3a4a5a', '#7a2a22'][i]);
    rect(c, 830, 246, 26, 18, '#222'); rect(c, 862, 248, 26, 16, '#333');
    rect(c, 905, 226, 34, 34, '#5a4a3a'); c.strokeStyle = '#222'; c.lineWidth = 1.5; for (let i = 0; i < 18; i++) { c.beginPath(); c.moveTo(910 + i * 1.5, 228); c.lineTo(906 + i * 2, 196 + (i % 3) * 4); c.stroke(); }
    ellipse(c, 975, 256, 20, 12, '#7a5a3a'); rect(c, 960, 238, 30, 16, '#8a6a42'); // 大鼎
    // 汝窑花囊 白菊
    ellipse(c, 1060, 285, 24, 30, '#a8c0c0'); for (let i = 0; i < 14; i++) { const a = i * 0.9; ellipse(c, 1060 + Math.cos(a) * 18, 250 + Math.sin(a) * 12, 7, 6, '#f8f6ee'); }
    // 佛手架
    rect(c, 670, 312, 40, 70, '#3a1a14'); ellipse(c, 690, 312, 28, 9, '#d8d0b8'); for (let i = 0; i < 6; i++) ellipse(c, 676 + i * 6, 307 - (i % 2) * 3, 6, 5, '#f0c838');
    // 磬架
    rect(c, 1190, 240, 6, 70, '#2a1a10'); rect(c, 1250, 240, 6, 70, '#2a1a10'); rect(c, 1186, 236, 74, 6, '#7a2a22');
    c.fillStyle = '#f2f0e6'; c.beginPath(); c.moveTo(1200, 262); c.quadraticCurveTo(1223, 248, 1246, 262); c.quadraticCurveTo(1223, 282, 1200, 262); c.fill();
    rect(c, 1240, 270, 3, 18, '#7a5a3a');
    // 拔步床 葱绿纱帐
    rect(c, 1080, 460, 190, 210, '#6a3020'); rect(c, 1090, 480, 170, 180, '#e8e0d0');
    c.fillStyle = 'rgba(120,180,110,0.65)'; c.fillRect(1090, 480, 170, 180);
    const r = makeRnd(3); for (let i = 0; i < 16; i++) { ellipse(c, 1100 + r() * 150, 495 + r() * 150, 5, 3, '#3a6a2a'); ellipse(c, 1100 + r() * 150, 495 + r() * 150, 3, 3, '#d86a8a'); }
    // 落地罩
    rect(c, 620, 52, 40, 348, '#7a3a2a'); rect(c, 620, 530, 40, 190, '#7a3a2a');
    c.strokeStyle = '#d4a94a'; c.lineWidth = 2; c.beginPath(); c.arc(640, 465, 70, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
    // 饭桌
    rect(c, 150, 255, 240, 50, '#6e3c2a'); rect(c, 150, 300, 240, 6, '#4a2a1e');
    rect(c, 130, 398, 170, 40, '#6e3c2a');
    rect(c, 405, 300, 60, 34, '#8a5a3a'); // 小楠木桌
    for (let i = 0; i < 5; i++) { ellipse(c, 175 + i * 48, 272, 12, 7, '#f0ece2'); ellipse(c, 175 + i * 48, 271, 7, 4, ['#c87a3a', '#7a9a4a', '#e0c070', '#a04a3a', '#f0f0e0'][i]); }
  },
  setup(g) {
    if (stepIs('c_done', 'd_aside', 'd_sit')) {
      addNpc('fengjie', 'fengjie', 510, 560, 'right'); addNpc('yuanyang', 'yuanyang', 555, 560, 'left'); addNpc('liwan', 'liwan', 460, 620, 'right'); addNpc('tanchun', 'tanchun', 300, 520);
      if (stepIs('d_sit')) diningLayout();
    } else if (stepIs('d_after')) {
      addNpc('fengjie', 'fengjie', 260, 326, 'up', { sit: true }); addNpc('liwan', 'liwan', 200, 326, 'up', { sit: true }); addNpc('yuanyang', 'yuanyang', 330, 350, 'left');
    } else if (stepIs('d_tan', 'd_done')) {
      addNpc('jiamu', 'jiamu', 880, 420, 'down', { sit: true, fixedDir: true }); addNpc('xueyima', 'xueyima', 960, 430, 'down', { sit: true, fixedDir: true });
      addNpc('wangfr', 'wangfr', 800, 440, 'right'); addNpc('tanchun', 'tanchun', 760, 370, 'right'); addNpc('daiyu', 'daiyu', 1020, 380, 'left'); addNpc('baochai', 'baochai', 1040, 440, 'left');
      addNpc('baoyu', 'baoyu', 900, 520, 'up'); addNpc('xiangyun', 'xiangyun', 960, 530, 'up'); addNpc('fengjie', 'fengjie', 720, 480, 'right'); addNpc('yuanyang', 'yuanyang', 820, 540, 'up');
    }
  },
  onEnter(g) {
    if (stepIs('c_done')) { setStep('d_aside'); return [{ banner: '第四折　女篾片', sub: '秋爽斋晓翠堂上调开桌案' }, ['n', '远远望见凤姐和鸳鸯咬著耳朵说笑，李纨在一旁直摇头。']]; }
  },
  triggers: [{ x: 300, y: 260, w: 400, h: 440, cond: () => stepIs('d_aside'), run: () => asideScene() }],
  talk: {
    fengjie(g) {
      if (stepIs('d_tan', 'd_done')) return [['fengjie', '姥姥瞧瞧我们三姑娘这屋子，满屋的字画笔墨，比那状元的书房还阔朗。']];
      return [['fengjie', '姥姥来了？快歇歇脚，饭就得了。']];
    },
    yuanyang(g) { return [['yuanyang', G.st.flags.agreed ? '姥姥，回来可别忘了。' : '姥姥只管自在吃饭，不必拘束。']]; },
    liwan(g) { return [['liwan', '（叹口气笑道）你们一点好事也不做……姥姥，回来他们说什么，你只别当真。']]; },
    tanchun(g) {
      if (stepIs('d_tan', 'd_done')) return [['tanchun', '姥姥只管随便坐，我这屋子不隔断，敞亮些，不怕人多。']];
      return [['tanchun', '姥姥这边坐，老太太一会子就到。']];
    },
    jiamu(g) {
      if (stepIs('d_tan')) return musicScene();
      if (stepIs('d_done')) return [['jiamu', '咱们坐船去，顺路到你薛姑娘那里瞧瞧。']];
      return [];
    },
    xueyima(g) { return [['xueyima', '姥姥今儿可乏了不曾？']]; },
    wangfr(g) { return [['wangfr', '板儿可吃饱了？叫嬷嬷再给他夹些菜。']]; },
    daiyu(g) { return [['daiyu', '（掩口笑道）姥姥方才席上那几句话，到这会子我肚子还疼呢。']]; },
    baochai(g) { return [['baochai', '姥姥别站著，这里有椅子。']]; },
    baoyu(g) { return [['baoyu', '姥姥，回来我们坐船去，那荷叶一大片一大片的，你看了必定喜欢。']]; },
    xiangyun(g) { return [['xiangyun', '哈哈，姥姥那‘老母猪不抬头’，我一口饭都喷了！']]; },
  },
  items: [
    { x: SEAT[0], y: SEAT[1] + 20, label: '小楠木桌（入座）', cond: () => stepIs('d_sit'), run: () => lunchScene() },
    { x: 690, y: 400, label: '紫檀架上的佛手', cond: () => stepIs('d_tan', 'd_done') && !G.st.flags.foshou, run: () => { G.st.flags.foshou = true; return [
      ['n', '大观窑的大盘里盛著数十个娇黄玲珑大佛手。板儿看见了，便要佛手吃。'],
      ['tanchun', '（拣了一个与他）顽罢，吃不得的。'],
      ['liu', '还不谢谢姑娘！'], ['ban', '谢谢姑娘。'],
    ]; } },
    { x: 1222, y: 330, label: '白玉比目磬', cond: () => stepIs('d_tan', 'd_done') && !G.st.flags.qing, run: () => { G.st.flags.qing = true; return [
      ['n', '洋漆架上悬著一个白玉比目磬，旁边挂著小锤。板儿略熟了些，便要摘那锤子要击，丫鬟们忙拦住他。'],
      ['liu', '我的小祖宗，这是能乱敲的？'],
    ]; } },
    { x: 1060, y: 360, label: '汝窑花囊·白菊', cond: () => stepIs('d_tan', 'd_done'), run: () => [['n', '斗大的一个汝窑花囊，插著满满的一囊水晶球儿的白菊。'], ['liu', '这一瓶花，倒比我们庄上一整片菊花地还齐整。']] },
    { x: 900, y: 330, label: '烟雨图与对联', cond: () => stepIs('d_tan', 'd_done'), run: () => [['n', '西墙上当中挂著一大幅米襄阳《烟雨图》，左右挂著一副颜鲁公墨迹的对联：“烟霞闲骨格，泉石野生涯。”'], ['liu', '这画儿上烟雾腾腾的，倒像咱们庄上下雨的早起。字我是一个不认得，只看著有精神。']] },
    { x: 1140, y: 460, label: '拔步床·纱帐', cond: () => stepIs('d_tan', 'd_done') && !G.st.flags.zhang, run: () => { G.st.flags.zhang = true; return [
      ['n', '拔步床上悬著葱绿双绣花卉草虫的纱帐。板儿又跑过来看。'],
      ['ban', '这是蝈蝈，这是蚂蚱！'],
      { choice: '板儿拿手指头直往姑娘的纱帐上戳。满屋的太太小姐都看著——', id: 'ban',
        opts: [
          { t: '照庄上的规矩，打他一巴掌：「下作黄子，没干没净的乱闹！」', label: '打一巴掌', fx: () => adj('favor', 0), then: [['liu', '下作黄子，没干没净的乱闹。倒叫你进来瞧瞧，就上脸了。'], ['n', '打的板儿哭起来，众人忙劝解方罢。'], ['tanchun', '姥姥别打他，小孩子家，看看怕什么。']] },
          { t: '一把拉回来，低声喝住，再给姑娘赔个不是。', label: '低声喝住', fx: () => adj('dignity', 0), then: [['liu', '（一把拽回板儿）还不住手！姑娘别怪，乡下孩子没见过世面。'], ['tanchun', '这有什么，他喜欢，就叫他看罢。']] },
        ] },
    ]; } },
  ],
  exits: [{ x: 660, y: 680, w: 400, h: 40, to: 'xyz', spawn: [640, 650, 'up'], label: '↓ 往荇叶渚上船', cond: () => past('d_done'), locked: '老太太还在这里说话呢。' }],
};

function diningLayout() {
  ['fengjie', 'yuanyang', 'liwan', 'tanchun'].forEach(removeNpc);
  addNpc('jiamu', 'jiamu', 270, 245, 'down', { sit: true, fixedDir: true }); addNpc('baoyu', 'baoyu', 200, 245, 'down', { sit: true }); addNpc('xiangyun', 'xiangyun', 340, 245, 'down', { sit: true });
  addNpc('daiyu', 'daiyu', 165, 325, 'up', { sit: true }); addNpc('baochai', 'baochai', 360, 325, 'up', { sit: true });
  addNpc('wangfr', 'wangfr', 215, 390, 'down', { sit: true }); addNpc('yingchun', 'yingchun', 150, 460, 'up', { sit: true }); addNpc('tanchun', 'tanchun', 215, 460, 'up', { sit: true }); addNpc('xichun', 'xichun', 280, 460, 'up', { sit: true });
  addNpc('xueyima', 'xueyima', 90, 330, 'right', { sit: true });
  addNpc('fengjie', 'fengjie', 500, 300, 'left'); addNpc('yuanyang', 'yuanyang', 480, 370, 'left'); addNpc('liwan', 'liwan', 560, 360, 'left');
}

function asideScene() {
  return [
    { fade: true, mid: () => { G.player.x = 520; G.player.y = 600; G.player.dir = 'right'; const y = npc('yuanyang'); y.x = 570; y.y = 600; y.dir = 'left'; npc('fengjie').x = 480; npc('fengjie').y = 520; } },
    ['n', '正说著，只见贾母等来了，各自随便坐下。凤姐一面敁敪人位，一面递眼色与鸳鸯。鸳鸯便拉了刘姥姥出去。'],
    ['yuanyang', '姥姥，借一步说话。'],
    ['yuanyang', '（悄悄的）……待会儿老太太说声“请”，姥姥便站起来，高声说这么几句……再有，席上的筷子沉些，姥姥只管使。'],
    ['yuanyang', '这是我们家的规矩，若错了我们就笑话呢。'],
    ['n', '刘姥姥活了七十多岁，什么不明白？这是要拿她取个笑儿，哄老太太开心。'],
    ...choice2(),
  ];
}
function choice2() {
  return [{
    choice: '鸳鸯笑盈盈地看著你，等你一句话。是陪著她们演这出戏，还是推辞了？', id: 'c2',
    opts: [
      { t: '「姑娘放心。」——应承下来，陪著哄老太太开心。', label: '应承', fx: () => { G.st.flags.agreed = true; adj('bond', 1); },
        then: [['liu', '姑娘放心。'], ['yuanyang', '（抿嘴一笑）好姥姥，回来别忘了。'], { toast: '凤姐鸳鸯情分 +1' }] },
      { t: '「姑娘，我老婆子嘴笨，怕学不像，倒坏了府上的规矩。」——婉言推辞。', label: '婉拒', fx: () => { G.st.flags.agreed = false; adj('dignity', 1); adj('bond', -1); },
        then: [['liu', '姑娘，我老婆子嘴笨，怕学不像，倒坏了府上的规矩。我只规规矩矩地吃饭罢。'], ['yuanyang', '（怔了一怔，旋即笑道）也罢，姥姥只管照常吃饭就是了。'], ['n', '鸳鸯回身朝凤姐摇了摇头，凤姐挑了挑眉，也不言语。'], { toast: '庄家人本色 +1　凤姐鸳鸯情分 -1' }] },
    ],
  },
  { fade: true, mid: () => { setStep('d_sit'); diningLayout(); G.player.x = 520; G.player.y = 470; G.player.dir = 'up'; } },
  ['n', '调停已毕，众人归坐。贾母因说：“把那一张小楠木桌子抬过来，让刘亲家近我这边坐著。”'],
  ];
}

function lunchScene() {
  const a = G.st.flags.agreed;
  const pre = [
    { do: () => { G.player.x = SEAT[0]; G.player.y = SEAT[1]; G.player.sit = true; G.player.dir = 'left'; } },
    ['n', '贾母素日吃饭，皆有小丫鬟在旁边拿著漱盂麈尾巾帕。今日鸳鸯偏接过麈尾来拂著，侍立在刘姥姥身后。'],
  ];
  if (a) pre.push(['yuanyang', '（悄声）别忘了。'], ['liu', '姑娘放心。']);
  pre.push(
    ['n', '刘姥姥入了坐，拿起箸来，沉甸甸的不伏手——原是凤姐和鸳鸯商议定了，单拿一双老年四楞象牙镶金的筷子与她。'],
    ['liu', '这叉爬子比俺那里铁掀还沉，那里强的过他。'],
    ['n', '说的众人都笑起来。一个丫鬟揭去盒盖，凤姐儿偏拣了一碗鸽子蛋放在刘姥姥桌上。'],
    ['jiamu', '请。'],
  );
  const body = a ? [
    ['n', '刘姥姥便站起身来，高声说道——'],
    ['liu', '老刘，老刘，食量大似牛，吃一个老母猪不抬头！'],
    ['n', '自己却鼓著腮不语。众人先是发怔，后来一听，上上下下都哈哈的大笑起来。'],
    { shake: 0.8 },
    ['n', '史湘云撑不住，一口饭都喷了出来；林黛玉笑岔了气，伏著桌子嗳哟；宝玉早滚到贾母怀里，贾母笑的搂著宝玉叫“心肝”；王夫人笑的用手指著凤姐儿，只说不出话来。'],
    ['n', '薛姨妈口里茶喷了探春一裙子，探春的饭碗合在迎春身上，惜春离了坐位，拉著奶母叫揉一揉肠子。独有凤姐鸳鸯二人撑著，还只管让刘姥姥。'],
    ['liu', '这里的鸡儿也俊，下的这蛋也小巧，怪俊的。我且攮一个。'],
    ['n', '众人方住了笑，听见这话又笑起来。贾母笑的眼泪出来，琥珀在后捶著。'],
    ['jiamu', '这定是凤丫头促狭鬼儿闹的，快别信他的话了。'],
    { do: () => adj('favor', 2), toast: '老太太欢心 +2' },
  ] : [
    ['n', '刘姥姥只低了头，规规矩矩地端起碗来。凤姐和鸳鸯对看一眼，都有些扫兴。'],
    ['jiamu', '刘亲家，别拘著，只当在自己家里。'],
    ['liu', '是，是。老太太疼我，我知道。'],
  ];
  const egg = [
    ['fengjie', '一两银子一个呢，你快尝尝罢，那冷了就不好吃了。'],
    ['n', '刘姥姥便伸箸子要夹，那里夹的起来，满碗里闹了一阵，好容易撮起一个来，才伸著脖子要吃，偏又滑下来滚在地下。早有地下的人捡了出去了。'],
    ['liu', '（叹道）一两银子，也没听见响声儿就没了。'],
    ['n', a ? '众人已没心吃饭，都看著他笑。' : '这一句话是她心里真舍不得，说得又实在，满桌的人倒都笑了。'],
    ['jiamu', '这会子又把那个筷子拿了出来，又不请客摆大筵席。都是凤丫头支使的，还不换了呢。'],
    ['n', '地下的人忙收了过去，照样换上一双乌木镶银的。'],
    ['liu', '去了金的，又是银的，到底不及俺们那个伏手。'],
    ['fengjie', '菜里若有毒，这银子下去了就试的出来。'],
    ['liu', '这个菜里若有毒，俺们那菜都成了砒霜了。那怕毒死了也要吃尽了。'],
    ['n', '贾母见他如此有趣，吃的又香甜，把自己的菜也端过来与他吃，又命一个老嬷嬷将各样的菜给板儿夹在碗上。'],
    { do: () => adj('favor', 1) },
    { fade: true, mid: () => afterLunchSetup() },
    ...choice3(),
  ];
  return pre.concat(body, egg);
}

function afterLunchSetup() {
  setStep('d_after'); G.npcs = []; SCENES.qsz.setup(G); addNpc('ban', 'ban', 470, 360, 'down', { follow: true });
  G.player.sit = false; G.player.x = 330; G.player.y = 420; G.player.dir = 'up';
}

function choice3() {
  const a = G.st.flags.agreed;
  const head = [
    ['n', '一时吃毕，贾母等都往探春卧室中去说闲话。这里收拾过残桌，又放了一桌。刘姥姥看著李纨与凤姐儿对坐著吃饭。'],
    ['liu', '（叹道）别的罢了，我只爱你们家这行事。怪道说“礼出大家”。'],
  ];
  const mid = a ? [
    ['fengjie', '（忙笑道）你别多心，才刚不过大家取笑儿。'],
    ['yuanyang', '（也进来笑道）姥姥别恼，我给你老人家赔个不是。'],
  ] : [
    ['fengjie', '（笑道）姥姥倒是个稳重人。方才那双筷子，原是我们淘气，你别多心。'],
  ];
  const opts = a ? [
    { t: '「姑娘说那里话，咱们哄著老太太开个心儿，可有什么恼的！」', label: '一笑了之', fx: () => { adj('bond', 2); },
      then: [['liu', '姑娘说那里话，咱们哄著老太太开个心儿，可有什么恼的！你先嘱咐我，我就明白了，不过大家取个笑儿。我要心里恼，也就不说了。'],
        ['yuanyang', '（便骂人）为什么不倒茶给姥姥吃！'], ['liu', '刚才那个嫂子倒了茶来，我吃过了。姑娘也该用饭了。'],
        ['fengjie', '（拉鸳鸯）你坐下和我们吃了罢，省的回来又闹。'], { toast: '凤姐鸳鸯情分 +2' }] },
    { t: '「恼是不恼。只是我这把年纪，也是人家的老娘，往后姑娘们手下留些情。」', label: '点破一句', fx: () => { adj('dignity', 1); G.st.flags.spoke = true; },
      then: [['liu', '恼是不恼。只是我这把年纪，在庄上也是人家的老娘。哄老太太一乐是该的，往后姑娘们手下留些情就是了。'],
        ['yuanyang', '（敛了笑，正色道）姥姥说的是，是我们轻狂了。'], ['fengjie', '（怔了一怔，又笑道）好个明白姥姥！我今儿算服了你。'], { toast: '庄家人本色 +1' }] },
  ] : [
    { t: '「奶奶说那里话。不过大家取个笑儿，有什么要紧。」', label: '宽厚揭过', fx: () => { adj('bond', 1); },
      then: [['liu', '奶奶说那里话。不过大家取个笑儿，有什么要紧，我老婆子还经不起这个？'], ['fengjie', '（笑著拉她坐）这才是了。鸳鸯，你也坐下和我们吃罢。'], { toast: '凤姐鸳鸯情分 +1' }] },
    { t: '「我是庄家人，不懂大家规矩，只怕给老太太丢了脸，才不敢混说。」', label: '直说顾虑', fx: () => { adj('dignity', 1); },
      then: [['liu', '我是庄家人，不懂大家规矩。说错一句，丢的是老太太的脸，所以不敢混说。'], ['fengjie', '姥姥这话就外道了。老太太爱的，正是你这庄家人的话。'], ['n', '刘姥姥听了，心里倒一动。'], { toast: '庄家人本色 +1' }] },
  ];
  return head.concat(mid, [{ choice: '凤姐与鸳鸯都看著你，等你回话。', id: 'c3', opts }], [
    ['liu', '我看你们这些人都只吃这一点儿就完了，亏你们也不饿。怪只道风儿都吹的倒。'],
    { fade: true, mid: () => { setStep('d_tan'); G.npcs = []; SCENES.qsz.setup(G); addNpc('ban', 'ban', 700, 470, 'down', { follow: true }); G.player.x = 720; G.player.y = 440; G.player.dir = 'right'; } },
    ['n', '凤姐儿等来至探春房中，只见他娘儿们正说笑。探春素喜阔朗，这三间屋子并不曾隔断。'],
  ]);
}

function musicScene() {
  return [
    ['jiamu', '（隔著纱窗往后院内看了一回）后廊檐下的梧桐也好了，就只细些。'],
    ['n', '正说话，忽一阵风过，隐隐听得鼓乐之声。'],
    ['jiamu', '是谁家娶亲呢？这里临街倒近。'],
    ['wangfr', '街上的那里听的见，这是咱们的那十几个女孩子们演习吹打呢。'],
    ['jiamu', '既是他们演，何不叫他们进来演习。就铺排在藕香榭的水亭子上，借著水音更好听。回来咱们就在缀锦阁底下吃酒，又宽阔，又听的近。'],
    ['jiamu', '（向薛姨妈笑道）咱们走罢。他们姊妹们都不大喜欢人来坐著，怕脏了屋子。'],
    ['tanchun', '这是那里的话，求著老太太姨太太来坐坐还不能呢。'],
    ['jiamu', '我的这三丫头却好，只有两个玉儿可恶。回来吃醉了，咱们偏往他们屋里闹去。'],
    { do: () => setStep('d_done') },
  ];
}

// ================= 第五折 荇叶渚 =================
SCENES.xyz = {
  name: '荇叶渚', section: '第五折　留得残荷听雨声', spawn: [640, 650, 'up'],
  walk: [[20, 480, 1240, 230], [585, 300, 110, 190]],
  bg(c) {
    water(c, 0, 52, W, 440);
    const r = makeRnd(15); for (let i = 0; i < 60; i++) { const x = r() * W, y = 70 + r() * 400; if (x > 380 && x < 900 && y > 230) continue; lotusLeaf(c, x, y, 12 + r() * 12, r() > 0.25, r() * 6); }
    for (let i = 0; i < 30; i++) { const x = r() * W, y = 70 + r() * 400; if (x > 380 && x < 900 && y > 230) continue; c.strokeStyle = '#6a5a32'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 3, y - 20); c.stroke(); }
    c.fillStyle = '#a49e7a'; c.beginPath(); c.moveTo(0, 720); c.lineTo(0, 490); for (let x = 0; x <= W; x += 40) c.lineTo(x, 486 + Math.sin(x / 50) * 6); c.lineTo(W, 720); c.fill();
    noiseDots(c, 0, 495, W, 225, 400, ['#8a8a5a', '#b0a878', '#7a7a4a'], 17, 2);
    // 渡头
    rect(c, 585, 295, 110, 200, '#8a6a4a'); c.strokeStyle = '#6a4a32'; for (let y = 300; y < 495; y += 14) { c.beginPath(); c.moveTo(585, y); c.lineTo(695, y); c.stroke(); }
    rect(c, 580, 480, 8, 30, '#4a3020'); rect(c, 692, 480, 8, 30, '#4a3020');
    willow(c, 140, 560, 130, 21); willow(c, 1140, 560, 120, 22); rock(c, 400, 520, 22, 4);
  },
  anim(c, t) {
    waterRipples(c, 0, 60, W, 420, t, 9);
    boat(c, 480, 380 + Math.sin(t * 1.4) * 2, 130); boat(c, 800, 380 + Math.sin(t * 1.4 + 1) * 2, 130);
    drawPerson(c, 'jianiang', { x: 410, y: 372 + Math.sin(t * 1.4) * 2, dir: 'right' }); drawPerson(c, 'jianiang', { x: 870, y: 372 + Math.sin(t * 1.4 + 1) * 2, dir: 'left' });
    c.strokeStyle = '#5a4030'; c.lineWidth = 3; c.beginPath(); c.moveTo(400, 300); c.lineTo(420, 400); c.moveTo(880, 300); c.lineTo(860, 400); c.stroke();
  },
  setup(g) {
    addNpc('jiamu', 'jiamu', 520, 560, 'up'); addNpc('wangfr', 'wangfr', 460, 590, 'up'); addNpc('xueyima', 'xueyima', 400, 570, 'up'); addNpc('fengjie', 'fengjie', 760, 560, 'up'); addNpc('yuanyang', 'yuanyang', 560, 620, 'up');
    addNpc('baoyu', 'baoyu', 940, 600, 'left'); addNpc('baochai', 'baochai', 1010, 580, 'left'); addNpc('daiyu', 'daiyu', 1000, 650, 'left'); addNpc('liwan', 'liwan', 300, 620, 'right');
  },
  onEnter(g) { if (stepIs('d_done')) { setStep('e_board'); return [{ banner: '第五折　留得残荷听雨声', sub: '走不多远，已到了荇叶渚' }, ['n', '那姑苏选来的几个驾娘，早把两只棠木舫撑来。']]; } },
  talk: {
    baoyu(g) { G.st.flags.lotus = true; return [
      ['baoyu', '这些破荷叶可恨，怎么还不叫人来拔去。'],
      ['baochai', '今年这几日，何曾饶了这园子闲了，天天逛，那里还有叫人来收拾的工夫。'],
      ['daiyu', '我最不喜欢李义山的诗，只喜他这一句：“留得残荷听雨声”。偏你们又不留著残荷了。'],
      ['baoyu', '果然好句，以后咱们就别叫人拔去了。'],
      ['liu', '（心里暗想）我们庄上的荷叶，枯了也舍不得拔，晒干了好包东西。原来姑娘们留著，是为听雨的。'],
    ]; },
    baochai(g) { return [['baochai', '姥姥上船仔细，扶著丫头们。']]; },
    daiyu(g) { return [['daiyu', '这一池子衰草残菱，倒有些秋意了。']]; },
    jiamu(g) { return [['jiamu', '他们既预备下船，咱们就坐。刘亲家，你同我坐一只。']]; },
    fengjie(g) { return [['fengjie', '姥姥，回来我亲自撑船给你坐，你可敢不敢？']]; },
    wangfr(g) { return [['wangfr', '水边风凉，姥姥仔细些。']]; },
    xueyima(g) { return [['xueyima', '姥姥只管扶著我。']]; },
    yuanyang(g) { return [['yuanyang', G.st.flags.spoke ? '（客客气气地）姥姥小心脚下，我扶您老上船。' : '姥姥上船罢，老太太等你呢。']]; },
    liwan(g) { return [['liwan', '划子、篙桨、遮阳幔子，早上都预备下了，姥姥放心坐。']]; },
  },
  items: [{ x: 640, y: 330, label: '上船', run: () => [{ fade: true, mid: () => enterScene('boat') }] }],
  exits: [],
};

SCENES.boat = {
  name: '池上', section: '第五折　留得残荷听雨声', spawn: [600, 440, 'right'], ban: false,
  walk: [[598, 438, 4, 4]],
  bg(c) { water(c, 0, 52, W, H); },
  anim(c, t) {
    const off = (t * 60) % 400;
    const r = makeRnd(31);
    for (let i = 0; i < 70; i++) { const x = ((r() * 1700 - off * (1 + (i % 3) * 0.1)) % 1700 + 1700) % 1700 - 200; const y = 60 + r() * 660; if (y > 300 && y < 560 && x > 380 && x < 900) continue; lotusLeaf(c, x, y, 12 + r() * 14, r() > 0.2, r() * 6); }
    waterRipples(c, 0, 52, W, H, t * 3, 4);
    const by = 470 + Math.sin(t * 1.6) * 3;
    boat(c, 640, by, 360, '#9a6a44');
    boat(c, 200, 230 + Math.sin(t * 1.6 + 1) * 3, 200, '#8a5a3a');
    ['yingchun', 'tanchun', 'baoyu', 'daiyu', 'baochai'].forEach((k, i) => drawPerson(c, k, { x: 120 + i * 40, y: 208, sit: true }));
  },
  setup(g) {
    addNpc('jiamu', 'jiamu', 560, 440, 'down', { sit: true }); addNpc('wangfr', 'wangfr', 680, 440, 'down', { sit: true }); addNpc('xueyima', 'xueyima', 520, 450, 'down', { sit: true });
    addNpc('yuanyang', 'yuanyang', 720, 450, 'down', { sit: true }); addNpc('liwan', 'liwan', 760, 448, 'down', { sit: true }); addNpc('fengjie', 'fengjie', 860, 452, 'left');
    G.player.sit = true;
  },
  onEnter(g) {
    const lotus = g.st.flags.lotus ? [] : [['n', '后头那只船上，宝玉嫌荷叶破了要拔去，黛玉却道：“我只喜他这一句：留得残荷听雨声。”']];
    return [
      ['n', '众人扶了贾母、王夫人、薛姨妈、刘姥姥、鸳鸯上了这一只，落后李纨也跟上去。凤姐儿也上去，立在舡头上，也要撑舡。'],
      ['jiamu', '这不是顽的，虽不是河里，也有好深的。你快不给我进来。'],
      ['fengjie', '怕什么！老祖宗只管放心。'],
      ['n', '说著便一篙点开。'], { shake: 0.4 },
      ['n', '到了池当中，舡小人多，凤姐只觉乱晃，忙把篙子递与驾娘，方蹲下了。'],
      { do: () => { const f = npc('fengjie'); f.sit = true; } },
      ['liu', '阿弥陀佛！我们庄上只有个饮牲口的水坑子，那里见过这样大的池子、这样画儿似的船。'],
      ...lotus,
      ['n', '说著已到了花溆的萝港之下，觉得阴森透骨，两滩上衰草残菱，更助秋情。'],
      ['jiamu', '（因见岸上的清厦旷朗）这是你薛姑娘的屋子不是？'],
      ['yuanyang', '是。'],
      ['jiamu', '拢岸，咱们上去瞧瞧。'],
      { fade: true, mid: () => { G.player.sit = false; setStep('f_room'); enterScene('hwy'); } },
    ];
  },
  talk: {},
};

// ================= 第六折 蘅芜苑 =================
SCENES.hwy = {
  name: '蘅芜苑', section: '第五折　留得残荷听雨声', spawn: [120, 620, 'up'],
  walk: [[20, 300, 670, 400], [680, 400, 50, 110], [730, 260, 530, 440]],
  walls: [[780, 260, 200, 60], [1110, 260, 150, 150]],
  bg(c) {
    rect(c, 0, 52, 700, H, '#9a9a80');
    noiseDots(c, 0, 52, 700, 668, 600, ['#8a8a70', '#aaa890', '#7a7a62'], 8, 3);
    water(c, 0, 640, 200, 80);
    // 云步石梯
    for (let i = 0; i < 5; i++) rect(c, 60 + i * 26, 650 - i * 24, 90, 18, '#b0aca0');
    // 墙与藤
    rect(c, 0, 52, 700, 210, '#d8d4c8'); rect(c, 0, 52, 700, 12, '#3b4652');
    const r = makeRnd(41);
    for (let i = 0; i < 26; i++) { const x = 20 + i * 26 + r() * 10; c.strokeStyle = '#3a5a32'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, 290); c.bezierCurveTo(x + 20, 220, x - 20, 150, x + 10, 80); c.stroke(); }
    for (let i = 0; i < 180; i++) ellipse(c, 10 + r() * 680, 80 + r() * 210, 6, 3.5, ['#3f6a3a', '#2f5a2e', '#4a7a42'][Math.floor(r() * 3)]);
    for (let i = 0; i < 90; i++) ellipse(c, 10 + r() * 680, 100 + r() * 190, 3, 3, '#d8303a');
    rock(c, 420, 420, 46, 3); rock(c, 260, 360, 30, 6);
    // 屋子：雪洞一般
    rect(c, 700, 52, 580, H, '#f4f2ec');
    rect(c, 700, 52, 30, 348, '#e0ddd4'); rect(c, 700, 510, 30, 210, '#e0ddd4');
    rect(c, 730, 240, 550, 480, '#d8d2c4');
    c.strokeStyle = '#c8c2b4'; for (let y = 240; y < H; y += 30) { c.beginPath(); c.moveTo(730, y); c.lineTo(W, y); c.stroke(); }
    plaque(c, 990, 70, '蘅芜苑');
    lowTable(c, 780, 255, 200, 40, '#4a3a2e', '#6a5444');
    ellipse(c, 820, 245, 12, 18, '#d8d0b8'); for (let i = 0; i < 6; i++) flower(c, 812 + (i % 3) * 8, 220 - Math.floor(i / 3) * 8, 3.4, '#f2c33a');
    rect(c, 860, 250, 40, 10, '#3a4a6a'); rect(c, 862, 242, 36, 9, '#5a3a2a');
    ellipse(c, 940, 256, 10, 6, '#e0dcd0'); ellipse(c, 958, 258, 6, 4, '#e0dcd0');
    // 青纱帐床
    rect(c, 1110, 160, 150, 250, '#8a7a6a'); rect(c, 1118, 170, 134, 230, '#eae6dc');
    c.fillStyle = 'rgba(70,110,110,0.55)'; c.fillRect(1118, 170, 134, 230);
  },
  setup(g) {
    if (!past('f_done')) { addNpc('jiamu', 'jiamu', 940, 420, 'left'); addNpc('xueyima', 'xueyima', 1020, 470, 'left'); addNpc('wangfr', 'wangfr', 880, 500, 'up'); addNpc('fengjie', 'fengjie', 820, 440, 'right'); addNpc('yuanyang', 'yuanyang', 1000, 380, 'left'); }
    addNpc('baochai', 'baochai', 1060, 540, 'left');
  },
  onEnter(g) { if (stepIs('f_room')) return [['n', '贾母顺著云步石梯上去，一同进了蘅芜苑，只觉异香扑鼻。'], { toast: '老太太在屋里，进去陪著坐坐' }]; },
  talk: {
    jiamu(g) {
      if (!stepIs('f_room')) return [];
      return [
        ['n', '进了房屋，雪洞一般，一色玩器全无，案上只有一个土定瓶中供著数枝菊花，并两部书，茶奁茶杯而已。床上只吊著青纱帐幔，衾褥也十分朴素。'],
        ['jiamu', '（叹道）这孩子太老实了。你没有陈设，何妨和你姨娘要些。'],
        ['jiamu', '（嗔著凤姐儿）不送些玩器来与你妹妹，这样小器。'],
        ['fengjie', '他自己不要的。我们原送了来，他都退回去了。'],
        ['xueyima', '他在家里也不大弄这些东西的。'],
        ['jiamu', '使不得。虽然他省事，倘或来一个亲戚，看著不象；二则年轻的姑娘们，房里这样素净，也忌讳。我们这老婆子，越发该住马圈去了。'],
        ['jiamu', '鸳鸯，你把那石头盆景儿和那架纱桌屏，还有个墨烟冻石鼎，这三样摆在这案上就够了。再把那水墨字画白绫帐子拿来，把这帐子也换了。'],
        ['yuanyang', '这些东西都搁在东楼上的不知那个箱子里，还得慢慢找去，明儿再拿去也罢了。'],
        ['jiamu', '明日后日都使得，只别忘了。'],
        ['liu', '（心里暗道）这屋子我看著倒干净体面，比我们庄户人家强过百倍。大家子的姑娘，原来素净也是不成的。'],
        ['n', '坐了一回方出来，一径往缀锦阁下去。文官等上来请过安，往藕香榭演习去了。'],
        { do: () => { ['jiamu', 'xueyima', 'wangfr', 'fengjie', 'yuanyang'].forEach(removeNpc); setStep('f_done'); } },
      ];
    },
    baochai(g) { return [['baochai', '我素来不爱弄这些东西，倒叫老太太操心了。'], ...(g.st.flags.flowers ? [['baochai', '（含笑）姥姥这一头花，倒比我这屋里热闹多了。']] : [['baochai', '姥姥鬓边那一朵，倒雅致。']])]; },
    fengjie(g) { return [['fengjie', '老太太说我小器，姥姥你评评理，我冤不冤？']]; },
    xueyima(g) { return [['xueyima', '我这丫头，打小儿就是这个脾气。']]; },
    wangfr(g) { return [['wangfr', '这院子里的香草，越冷倒越苍翠了。']]; },
    yuanyang(g) { return [['yuanyang', '姥姥闻闻，这满院子都是香的。']]; },
  },
  items: [{ x: 300, y: 320, label: '奇草仙藤', run: () => [['n', '那些奇草仙藤愈冷逾苍翠，都结了实，似珊瑚豆子一般，累垂可爱。'], ['liu', '这藤上结的红豆子，倒像我们山里的野果子，只是没见过这般香的。'], ['ban', '姥姥，这个吃得么？'], ['liu', '吃不得！这园子里好看的，十样里倒有九样吃不得。']] }],
  exits: [{ x: 20, y: 300, w: 30, h: 200, to: 'zjg', spawn: [640, 670, 'up'], label: '← 往缀锦阁下吃酒', cond: () => past('f_done'), locked: '老太太还在宝姑娘屋里坐著呢。' }],
};

// ================= 第七折 缀锦阁下 =================
const MYSEAT = [920, 330];
SCENES.zjg = {
  name: '缀锦阁下', section: '第六折　金鸳鸯三宣牙牌令', spawn: [640, 670, 'up'],
  walk: [[40, 250, 1200, 450]],
  walls: [[420, 230, 440, 80], [300, 300, 60, 380], [940, 300, 60, 200]],
  bg(c) {
    water(c, 0, 52, W, 130);
    rect(c, 1000, 90, 160, 60, '#cfc8b4'); roof(c, 1000, 52, 160, 44, '#3b4652'); for (let i = 0; i < 4; i++) rect(c, 1005 + i * 50, 90, 6, 50, '#a3392c');
    c.fillStyle = '#333'; c.font = `14px ${FONT_SERIF}`; c.fillText('藕香榭', 1056, 168);
    rect(c, 0, 180, W, 40, '#7a3a2a'); for (let i = 0; i < 9; i++) rect(c, 20 + i * 155, 52, 14, 170, '#a3392c');
    rect(c, 0, 220, W, H, '#b89a70'); c.strokeStyle = '#a08260'; for (let y = 220; y < H; y += 24) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    rect(c, 380, 320, 520, 400, '#9a2a24'); c.strokeStyle = '#d4a94a'; c.lineWidth = 3; c.strokeRect(392, 332, 496, 390);
    // 二榻
    [[470, 240], [690, 240]].forEach(([x, y]) => { rect(c, x, y, 120, 60, '#5a2e22'); rect(c, x + 6, y + 6, 108, 40, '#c9a24a'); rect(c, x + 10, y + 10, 100, 32, '#b03a3a'); });
    // 几子
    const ji = (x, y, shape) => { c.fillStyle = '#4a1e1a'; if (shape === 0) { c.beginPath(); c.arc(x, y, 20, 0, 7); c.fill(); } else if (shape === 1) { for (let k = 0; k < 5; k++) { const a = k / 5 * 6.28; ellipse(c, x + Math.cos(a) * 10, y + Math.sin(a) * 10, 11, 11, '#4a1e1a'); } } else c.fillRect(x - 20, y - 16, 40, 32); ellipse(c, x, y - 4, 8, 5, '#d4a94a'); ellipse(c, x + 10, y + 4, 4, 3, '#f0ece2'); };
    for (let i = 0; i < 7; i++) ji(330, 320 + i * 55, i % 3);
    ji(970, 320, 1); ji(970, 400, 0); ji(970, 450, 2);
    ji(560, 640, 0); ji(720, 640, 1);
    for (let i = 0; i < 6; i++) lantern(c, 120 + i * 210, 196);
  },
  anim(c, t) { waterRipples(c, 0, 52, W, 125, t, 2); },
  setup(g) {
    addNpc('jiamu', 'jiamu', 530, 280, 'down', { sit: true, fixedDir: true }); addNpc('xueyima', 'xueyima', 750, 280, 'down', { sit: true, fixedDir: true });
    ['xiangyun', 'baochai', 'daiyu', 'yingchun', 'tanchun', 'xichun', 'baoyu'].forEach((k, i) => addNpc(k, k, 280, 330 + i * 55, 'right', { sit: true, fixedDir: true }));
    addNpc('wangfr', 'wangfr', 1020, 420, 'left', { sit: true, fixedDir: true });
    addNpc('liwan', 'liwan', 560, 690, 'up', { sit: true, fixedDir: true }); addNpc('fengjie', 'fengjie', 720, 690, 'up', { sit: true, fixedDir: true }); addNpc('yuanyang', 'yuanyang', 640, 600, 'up');
  },
  onEnter(g) { if (stepIs('f_done')) { setStep('g_sit'); return [{ banner: '第六折　金鸳鸯三宣牙牌令', sub: '缀锦阁下，一人一几，各自斟壶' }, ['n', '凤姐儿已带著人摆设整齐。上面二榻四几，是贾母、薛姨妈；东边是刘姥姥，刘姥姥之下便是王夫人。']]; } },
  talk: {
    yuanyang(g) { return [['yuanyang', '姥姥的几子在东边头一个，挨著老太太呢。']]; },
    jiamu(g) { return [['jiamu', '刘亲家，坐到你位上去，今儿咱们乐一乐。']]; },
    fengjie(g) { return [['fengjie', '姥姥快入席，今儿行令，可少不了你。']]; },
    daiyu(g) { return [['daiyu', '姥姥请。']]; }, baoyu(g) { return [['baoyu', '姥姥坐，回来行令，你可别跑。']]; },
    xiangyun(g) { return [['xiangyun', '今儿还我的席，姥姥多吃两杯！']]; },
  },
  items: [{ x: MYSEAT[0], y: MYSEAT[1] + 18, label: '入席（东边头一张几）', cond: () => stepIs('g_sit'), run: () => feastScene() }],
  exits: [],
};

function sitAtFeast() { setStep('g_feast'); G.player.x = MYSEAT[0]; G.player.y = MYSEAT[1]; G.player.sit = true; G.player.dir = 'left'; removeNpc('ban'); }

function feastScene() {
  return [
    { do: sitAtFeast },
    ['jiamu', '咱们先吃两杯，今日也行一令才有意思。'],
    ['xueyima', '老太太自然有好酒令，我们如何会呢，安心要我们醉了。'],
    ['wangfr', '便说不上来，就便多吃一杯酒，醉了睡觉去，还有谁笑话咱们不成。'],
    ['fengjie', '（走至当地，笑道）既行令，还叫鸳鸯姐姐来行更好。'],
    ['n', '众人都知贾母所行之令必得鸳鸯提著，都说“很是”。王夫人命人端一张椅子，放在二位奶奶的席上。鸳鸯半推半就，谢了坐，也吃了一钟酒。'],
    ['yuanyang', '酒令大如军令，不论尊卑，惟我是主。违了我的话，是要受罚的。'],
    ...choice4(),
  ];
}

function choice4() {
  return [{
    choice: '满座都是识字的太太小姐，又是诗又是令。鸳鸯这一声“惟我是主”，刘姥姥心里先慌了——', id: 'c4',
    opts: [
      { t: '下了席，摆手笑道：「别这样捉弄人家，我家去了。」（半真半假地讨饶）', label: '讨饶', then: [
        ['liu', '（下了席，摆手道）别这样捉弄人家，我家去了。'],
        ['n', '众人都笑道：“这却使不得。”'],
        ['yuanyang', '（喝令小丫头子们）拉上席去！'],
        ['liu', '饶了我罢！'],
        ['yuanyang', '再多言的罚一壶。'],
        ['n', '刘姥姥方住了声。'],
        ...rounds(),
      ] },
      { t: '正正经经起身告辞：「天也不早了，家里还惦记著。我老婆子这就告退。」', label: '正色告辞', then: [
        ['liu', '（起身福了一福）老太太，天也不早了，家里还惦记著。我老婆子不会这些，就不在这里扫大家的兴了，这就告退。'],
        ['n', '满座一时都静了。'],
        ['jiamu', '好亲家，何苦这会子走？不过是个顽意儿，说不上来吃杯酒就是了。'],
        { choice: '贾母亲自留你。', id: 'c4b', opts: [
          { t: '听老太太的，坐回席上。', label: '坐回席上', fx: () => adj('favor', 0), then: [['liu', '老太太这样抬举我，我再走就是不识好歹了。'], ['jiamu', '这才是。鸳鸯，你说罢。'], ...rounds()] },
          { t: '执意告辞，带著板儿回庄上去。', label: '执意告辞', then: [
            ['liu', '老太太疼我，我心里都知道。只是我们庄家人，原不是坐这席面的人，留下来也是叫大家笑话。改日再来给老太太磕头。'],
            ['jiamu', '（叹了一口气）既这样，也不强你。鸳鸯，你送送姥姥，把那软烟罗找出来，一并带去。'],
            { do: () => showEnding('e2') },
          ] },
        ] },
      ] },
    ],
  }];
}

function rounds() {
  return [
    ['yuanyang', '如今我说骨牌副儿，从老太太起，顺领说下去，至刘姥姥止。三张牌拆开，一张一张说，说完了合成这一副儿的名字。无论诗词歌赋，成语俗话，比上一句，都要叶韵。错了的罚一杯。'],
    ['yuanyang', '有了一副了。左边是张“天”。'], ['jiamu', '头上有青天。'],
    ['yuanyang', '当中是个“五与六”。'], ['jiamu', '六桥梅花香彻骨。'],
    ['yuanyang', '剩得一张“六与幺”。'], ['jiamu', '一轮红日出云霄。'],
    ['yuanyang', '凑成便是个“蓬头鬼”。'], ['jiamu', '这鬼抱住锺馗腿。'],
    ['n', '大家笑说：“极妙。”贾母饮了一杯。薛姨妈、湘云、宝钗也都一一说了，大家称赏。'],
    ['yuanyang', '左边一个“天”。'], ['daiyu', '良辰美景奈何天。'],
    ['n', '宝钗听了，回头看著他。黛玉只顾怕罚，也不理论。'],
    ['yuanyang', '左边“四五”成花九。'], ['yingchun', '桃花带雨浓。'],
    ['n', '众人道：“该罚！错了韵，而且又不象。”迎春笑著饮了一口。原是凤姐儿和鸳鸯都要听刘姥姥的笑话，故意都令说错，都罚了。'],
    ['n', '至王夫人，鸳鸯代说了个。下便该刘姥姥。'],
    ...choice5(),
  ];
}

function choice5() {
  return [
    ['liu', '我们庄家人闲了，也常会几个人弄这个，但不如说的这么好听。少不得我也试一试。'],
    ['n', '众人都笑道：“容易说的。你只管说，不相干。”'],
    ['yuanyang', '左边“四四”是个人。'],
    { choice: '“四四”是个人。满座的眼睛都落在你身上——', id: 'c5', opts: [
      { t: '想了半日，照庄家人的本色说：「是个庄家人罢。」', label: '庄家本色', then: [
        ['liu', '（想了半日）是个庄家人罢。'],
        ['n', '众人哄堂笑了。'],
        ['jiamu', '说的好，就是这样说。'],
        ['liu', '我们庄家人，不过是现成的本色，众位别笑。'],
        ['yuanyang', '中间“三四”绿配红。'], ['liu', '大火烧了毛毛虫。'],
        ['n', '众人笑道：“这是有的，还说你的本色。”'],
        ['yuanyang', '右边“幺四”真好看。'], ['liu', '一个萝卜一头蒜。'],
        ['n', '众人又笑了。'],
        ['yuanyang', '（笑道）凑成便是一枝花。'],
        ['liu', '（两只手比著）花儿落了结个大倭瓜。'],
        ['n', '众人大笑起来。'], { shake: 0.8 },
        { do: () => { adj('favor', 1); showEnding('e1'); } },
      ] },
      { t: '学著姑娘们的样子，搜肠刮肚凑一句文绉绉的诗。', label: '硬凑雅句', then: [
        ['liu', '（憋红了脸）四……四……桃、桃花带雨浓！'],
        ['n', '满座先是一怔。这一句，正是方才二姑娘说错了被罚的。'],
        ['yuanyang', '（忍著笑）姥姥这是拾了二姑娘的牙慧了，又错了韵，该罚。'],
        ['n', '众人陪著笑了两声，倒不似方才那般热闹。刘姥姥红著脸吃了一杯，此后便只低头吃菜，再不敢多说一句。'],
        ['jiamu', '（笑道）倒难为他了。罢了，接著说下去罢。'],
        { do: () => { adj('dignity', -1); showEnding('e3'); } },
      ] },
    ] },
  ];
}

// ================= 结局 =================
const ENDINGS = {
  e1(g) {
    const f = g.st.flags; const p = [];
    p.push('“花儿落了结个大倭瓜”——满座太太小姐笑得东倒西歪，连贾母也拭著眼泪。正热闹间，只听外面乱嚷……');
    if (f.agreed) p.push('这一日，刘姥姥头上插过满头的花，席上说过“老母猪不抬头”，箸子上滑走过一两银子的鸽子蛋。她心里明白众人笑的是她，也明白这笑换来的是什么。');
    else p.push('她没有照著鸳鸯的话装傻。可到了牙牌令上，一句庄家人的本色话出口，满座反倒笑得比什么都真——原来老太太爱的，正是这份不加修饰的“本色”。');
    if (f.spoke) p.push('饭后那一句“手下留些情”，鸳鸯记在了心里。此后行令，她的口气里倒多了几分敬重。');
    else if (g.st.bond >= 4) p.push('凤姐和鸳鸯都把她当成了自己人，“咱们哄著老太太开个心儿”——这是她们三个人心照不宣的默契。');
    if (f.gauze) p.push('潇湘馆里贾母许下的那两匹软烟罗，明儿就要找出来送她。');
    p.push('这一回，与原著一般：村妪的笑声穿过缀锦阁，绕著藕香榭的水音，成了大观园最热闹的一天。');
    return { title: '花儿落了结个大倭瓜', tag: '结局一 · 原著走向', paras: p, col: '#c0392b' };
  },
  e2(g) {
    const p = [];
    p.push('刘姥姥牵著板儿，跟在鸳鸯后头，一步步走出了大观园。身后，藕香榭的鼓乐借著水音隐隐传来，缀锦阁下的笑声却已与她无关了。');
    p.push('她到底没有让人拿她取乐到底。贾母叹道：“这亲家倒有些骨气。”凤姐笑了笑，没有说话。');
    p.push(g.st.dignity >= 4 ? '庄家人的体面，她一点也没丢。只是那满座的热闹，她也一点没有带走。' : '回去的路上，她把那两匹软烟罗抱得紧紧的，一路上念了好些声佛。');
    p.push('（此结局偏离原著：原著中刘姥姥只是笑著讨饶，被拉回席上，并未离去。）');
    return { title: '辞席归家', tag: '结局二 · 偏离原著', paras: p, col: '#4a6a5a' };
  },
  e3(g) {
    const p = [];
    p.push('那一句“桃花带雨浓”说出口，满座笑声稀稀落落，像秋天池子里的残荷。');
    p.push('刘姥姥想学著画儿里的人说话，可那原不是她的话。此后整个酒令，她只低著头，酒也不敢多吃一口。');
    p.push('贾母待她仍旧客气，只是看她的眼神里，少了早上在沁芳亭边那份真心的欢喜。');
    p.push('她到底进了画儿里的园子，却没能做回画儿外头那个说“大倭瓜”的自己。');
    p.push('（此结局偏离原著：原著中刘姥姥以“庄家人”的本色作答，满座大笑。）');
    return { title: '画虎不成', tag: '结局三 · 偏离原著', paras: p, col: '#6a5a7a' };
  },
};

// ================= 标题与结局画面 =================
const PETALS = Array.from({ length: 40 }, (_, i) => { const r = makeRnd(i + 7); return { x: r() * W, y: r() * H, s: 2 + r() * 3, v: 20 + r() * 30, c: ['#f2c33a', '#f5efe0', '#e0503a'][i % 3] }; });
let titleBg = null;
function makeTitleBg() {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#efe6d0'); g.addColorStop(1, '#d8c8a4'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  const layers = [['rgba(110,120,115,0.25)', 300, 60], ['rgba(80,95,90,0.35)', 380, 45], ['rgba(50,60,58,0.5)', 470, 30]];
  layers.forEach(([col, base, amp], k) => { x.fillStyle = col; x.beginPath(); x.moveTo(0, H); for (let i = 0; i <= W; i += 20) x.lineTo(i, base - Math.abs(Math.sin(i / (140 - k * 20) + k)) * amp * 2 - Math.sin(i / 37) * 8); x.lineTo(W, H); x.fill(); });
  water(x, 0, 520, W, 200); x.fillStyle = 'rgba(239,230,208,0.55)'; x.fillRect(0, 520, W, 200);
  hall(x, 820, 300, 300, 230, { name: '大观楼', cols: 5, door: 2, roofH: 60 });
  willow(x, 760, 560, 170, 3); willow(x, 1200, 560, 130, 5);
  for (let i = 0; i < 14; i++) lotusLeaf(x, 60 + i * 90, 600 + (i % 3) * 30, 18, true, i);
  // 印章
  x.fillStyle = '#b02a22'; x.fillRect(560, 120, 60, 60); x.fillStyle = '#f6ecd6'; x.font = `bold 22px ${FONT_KAI}`; x.fillText('四十', 568, 145); x.fillText('回目', 568, 172);
  return c;
}
const TITLE_BTNS = [{ id: 'start', t: '开始游戏', x: 120, y: 470, w: 240, h: 58 }, { id: 'jump', t: '选段跳转', x: 120, y: 545, w: 240, h: 50 }];
function drawTitle(c, t) {
  if (!titleBg) titleBg = makeTitleBg();
  c.drawImage(titleBg, 0, 0);
  PETALS.forEach(p => { const y = (p.y + t * p.v) % H, x = (p.x + Math.sin(t + p.y) * 30) % W; flower(c, x, y, p.s, p.c); });
  c.fillStyle = '#2a1a14'; c.font = `bold 120px ${FONT_KAI}`; c.fillText('红楼梦', 110, 220);
  c.fillStyle = '#7a2a22'; c.font = `30px ${FONT_KAI}`; c.fillText('第四十回', 120, 280);
  c.fillStyle = '#3a2a20'; c.font = `26px ${FONT_SERIF}`; c.fillText('史太君两宴大观园　金鸳鸯三宣牙牌令', 120, 324);
  c.fillStyle = '#5a4a3a'; c.font = `20px ${FONT_SERIF}`; c.fillText('——刘姥姥的大观园一日', 120, 366);
  c.fillStyle = '#6a5a4a'; c.font = `16px ${FONT_SERIF}`; c.fillText('据曹雪芹《红楼梦》第四十回改编', 120, 400);
  if (G.titleMenu === 'main') {
    TITLE_BTNS.forEach((b, i) => {
      const hov = G.mouse.x > b.x && G.mouse.x < b.x + b.w && G.mouse.y > b.y && G.mouse.y < b.y + b.h; if (hov) G.titleSel = i;
      const sel = G.titleSel === i;
      c.fillStyle = sel ? '#7a2a22' : 'rgba(42,26,20,0.82)'; c.fillRect(b.x, b.y, b.w, b.h);
      c.strokeStyle = sel ? '#f2c33a' : '#b89a6a'; c.lineWidth = 2; c.strokeRect(b.x + 4, b.y + 4, b.w - 8, b.h - 8);
      c.fillStyle = '#fff0cc'; c.font = `${i === 0 ? 28 : 22}px ${FONT_KAI}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(b.t, b.x + b.w / 2, b.y + b.h / 2 + 1); c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    });
    c.fillStyle = '#5a4a3a'; c.font = `15px ${FONT_SERIF}`; c.fillText('回车/空格 开始 · 鼠标点击亦可', 120, 630);
  } else {
    panel(80, 420, 1120, 280, 0.96);
    c.fillStyle = '#7a2a22'; c.font = `bold 22px ${FONT_KAI}`; c.fillText('选段跳转（评测用）', 110, 456);
    c.font = `15px ${FONT_SERIF}`; c.fillStyle = '#5a4a3a'; c.fillText('Esc 返回', 1100, 456);
    JUMPS_LIST.forEach((j, i) => {
      const col = i % 3, row = Math.floor(i / 3); const x = 110 + col * 360, y = 472 + row * 36, w = 340, h = 30;
      j.r = { x, y, w, h };
      const hov = G.mouse.x > x && G.mouse.x < x + w && G.mouse.y > y && G.mouse.y < y + h;
      c.fillStyle = hov ? '#7a2a22' : 'rgba(42,26,20,0.08)'; c.fillRect(x, y, w, h);
      c.fillStyle = hov ? '#fff0cc' : '#2a1a14'; c.font = `17px ${FONT_SERIF}`; c.fillText(`${j.n}．${j.t}`, x + 10, y + 21);
    });
  }
}
function titleKey(code) {
  if (G.titleMenu === 'jump') { if (code === 'Escape') G.titleMenu = 'main'; return; }
  if (code === 'ArrowUp' || code === 'ArrowDown' || code === 'KeyW' || code === 'KeyS') G.titleSel = 1 - G.titleSel;
  if (code === 'Enter' || code === 'Space') { if (G.titleSel === 0) startGame(); else G.titleMenu = 'jump'; }
}
function titleClick(x, y) {
  if (G.titleMenu === 'jump') {
    for (const j of JUMPS_LIST) if (j.r && x > j.r.x && x < j.r.x + j.r.w && y > j.r.y && y < j.r.y + j.r.h) { doJump(j.n); return; }
    if (y < 420) G.titleMenu = 'main';
    return;
  }
  TITLE_BTNS.forEach(b => { if (x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h) { if (b.id === 'start') startGame(); else G.titleMenu = 'jump'; } });
}

function drawEnding(c, t) {
  if (!titleBg) titleBg = makeTitleBg();
  c.drawImage(titleBg, 0, 0);
  c.fillStyle = 'rgba(20,12,10,0.55)'; c.fillRect(0, 0, W, H);
  const e = G.ending;
  panel(140, 40, 1000, 640, 0.97);
  c.textAlign = 'center';
  c.fillStyle = e.col; c.font = `20px ${FONT_SERIF}`; c.fillText(e.tag, W / 2, 96);
  c.fillStyle = '#2a1a14'; c.font = `bold 46px ${FONT_KAI}`; c.fillText(e.title, W / 2, 152);
  c.textAlign = 'left';
  c.font = `20px ${FONT_SERIF}`; c.fillStyle = '#2a1a14';
  let y = 200;
  e.paras.forEach(pp => { wrapText(c, '　　' + pp, 880).forEach(l => { c.fillText(l, 200, y); y += 30; }); y += 6; });
  // 选择回顾
  const ch = G.st.choices; const names = { c1: '戴花', c2: '鸳鸯嘱咐', c3: '饭后赔礼', c4: '酒令开场', c4b: '贾母挽留', c5: '“四四是个人”', ban: '板儿乱闹' };
  const items = Object.keys(names).filter(k => ch[k]).map(k => `${names[k]}：${ch[k]}`);
  c.font = `16px ${FONT_SERIF}`; c.fillStyle = '#6a4a3a';
  const sumY = Math.max(y + 4, 540);
  wrapText(c, '你的抉择 —— ' + (items.join('　') || '（选段跳转进入）'), 880).slice(0, 2).forEach((l, i) => c.fillText(l, 200, sumY + i * 24));
  c.fillText(`老太太欢心 ${G.st.favor}/5　凤姐鸳鸯情分 ${G.st.bond}/5　庄家人本色 ${G.st.dignity}/5`, 200, sumY + 52);
  const b = { x: W / 2 - 120, y: 616, w: 240, h: 46 }; e.btn = b;
  const hov = G.mouse.x > b.x && G.mouse.x < b.x + b.w && G.mouse.y > b.y && G.mouse.y < b.y + b.h;
  c.fillStyle = hov ? '#7a2a22' : 'rgba(42,26,20,0.88)'; c.fillRect(b.x, b.y, b.w, b.h);
  c.fillStyle = '#fff0cc'; c.font = `22px ${FONT_KAI}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('回到标题（回车）', W / 2, b.y + b.h / 2 + 1); c.textAlign = 'left'; c.textBaseline = 'alphabetic';
}
window.addEventListener('keydown', e => { if (e.code === 'Escape' && G.mode === 'title') G.titleMenu = 'main'; });

// ================= 评测跳转 =================
const JUMPS_LIST = [
  { n: 1, t: '选择一：凤姐插花（大观楼前）' }, { n: 2, t: '选择二：鸳鸯嘱咐（秋爽斋）' }, { n: 3, t: '选择三：饭后赔礼（应承路线）' },
  { n: 4, t: '选择三：饭后赔礼（婉拒路线）' }, { n: 5, t: '选择四：酒令开场·讨饶或告辞' }, { n: 6, t: '选择五：“四四是个人”' },
  { n: 7, t: '结局一：花儿落了结个大倭瓜' }, { n: 8, t: '结局二：辞席归家' }, { n: 9, t: '结局三：画虎不成' },
  { n: 10, t: '小选择：板儿戳纱帐' }, { n: 11, t: '场景：大观楼前（开场）' }, { n: 12, t: '场景：沁芳亭' },
  { n: 13, t: '场景：潇湘馆（苍苔跌跤）' }, { n: 14, t: '场景：荇叶渚（上船）' }, { n: 15, t: '场景：蘅芜苑' },
];
function prepJump(step, flags = {}) {
  G.st = newState(); Object.assign(G.st.flags, { jmFlower: true, flowers: true, gauze: true }, flags);
  G.st.step = step; G.q = []; G.cur = null; G.dlg = null; G.choice = null; G.banner = null; G.toast = null;
  G.mode = 'play'; G.fade = 0; G.fadeTarget = 0; G.player.sit = false;
}
function doJump(n) {
  const S = (sc, step, flags, spawn) => { prepJump(step, flags); enterScene(sc, spawn); };
  switch (n) {
    case 1: S('dagl', 'a_loft', { flowers: true }, [560, 540, 'left']);
      G.npcs = G.npcs.filter(x => x.id === 'ban' || x.id === 'liwan' || x.id === 'suyun' || x.id === 'pozi');
      addNpc('jiamu', 'jiamu', 470, 470, 'right'); addNpc('fengjie', 'fengjie', 430, 520, 'right'); addNpc('yuanyang', 'yuanyang', 400, 450, 'right'); addNpc('hupo', 'hupo', 360, 480, 'right'); addNpc('wangfr', 'wangfr', 330, 540, 'right');
      npc('liwan').x = 560; npc('liwan').y = 460; npc('liwan').dir = 'left';
      run([['hupo', '你还不拔下来摔到他脸上呢，把你打扮的成了个老妖精了。'], ...choice1()]); break;
    case 2: S('qsz', 'd_aside', {}, [520, 600, 'right']); { const y = npc('yuanyang'); y.x = 570; y.y = 600; }
      run([['yuanyang', '这是我们家的规矩，若错了我们就笑话呢。'], ...choice2()]); break;
    case 3: S('qsz', 'd_after', { agreed: true }, [330, 420, 'up']); G.st.bond = 3; G.st.favor = 5; run(choice3()); break;
    case 4: S('qsz', 'd_after', { agreed: false }, [330, 420, 'up']); G.st.dignity = 3; G.st.bond = 1; run(choice3()); break;
    case 5: S('zjg', 'g_sit', { agreed: true }); sitAtFeast(); G.st.favor = 5; run([['yuanyang', '酒令大如军令，不论尊卑，惟我是主。违了我的话，是要受罚的。'], ...choice4()]); break;
    case 6: S('zjg', 'g_sit', { agreed: true }); sitAtFeast(); G.st.favor = 5; run([['n', '至王夫人，鸳鸯代说了个。下便该刘姥姥。'], ...choice5()]); break;
    case 7: prepJump('g_feast', { agreed: true }); G.st.favor = 5; G.st.bond = 5; showEnding('e1'); break;
    case 8: prepJump('g_feast', { agreed: false }); G.st.dignity = 4; showEnding('e2'); break;
    case 9: prepJump('g_feast', { agreed: true }); showEnding('e3'); break;
    case 10: S('qsz', 'd_tan', { agreed: true }, [1120, 420, 'right']); run(SCENES.qsz.items[5].run()); break;
    case 11: startGame(); break;
    case 12: S('qfting', 'a_done', {}); break;
    case 13: S('xxg', 'b_done', {}); break;
    case 14: S('xyz', 'd_done', { agreed: true }); break;
    case 15: S('hwy', 'f_room', { agreed: true }); break;
    default: toTitle();
  }
}
