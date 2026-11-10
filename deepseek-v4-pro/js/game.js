/* ============================================================
   红楼梦 · 第四十回 · 大观园行
   叙事探索游戏片段 —— 纯 Canvas + DOM，无外部依赖
   ============================================================ */

(function () {
  "use strict";

  /* ---------- 基础工具 ---------- */
  const W = 1280, H = 720, GROUND = 596;

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // 固定随机种子（本章回数），保证任何随机之处每次进入都一致
  const rng = mulberry32(40);
  const rand = (a, b) => a + (b - a) * rng();

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function rr(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function poly(ctx, pts) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
  }

  /* ---------- 人物设定 ---------- */
  const CHARS = {
    liu:      { name: "刘姥姥", robe: "#7a5c3e", robeD: "#5c4430", sash: "#4a3a2c", skin: "#e3bf95", hair: "#c9c2b4", hat: null,     kind: "elder" },
    jiamu:    { name: "贾母",   robe: "#8a2f2c", robeD: "#6b2220", sash: "#5a1c1a", skin: "#eac8a0", hair: "#dcd5c8", hat: "抹额",    kind: "elder" },
    feng:     { name: "凤姐",   robe: "#c0392b", robeD: "#97271d", sash: "#d8a24a", skin: "#efd0a8", hair: "#2c2018", hat: "凤钗",    kind: "lady" },
    yuanyang: { name: "鸳鸯",   robe: "#3f8e6e", robeD: "#2f6f54", sash: "#2a5f49", skin: "#ecc89f", hair: "#2c2018", hat: "双髻",    kind: "maid" },
    daiyu:    { name: "黛玉",   robe: "#9b86bd", robeD: "#7a6796", sash: "#c9b6dd", skin: "#f2d8b4", hair: "#2c2018", hat: "垂髻",    kind: "lady" },
    baochai:  { name: "宝钗",   robe: "#d8a44a", robeD: "#b38534", sash: "#8a5a24", skin: "#f0d4aa", hair: "#2c2018", hat: "珠花",    kind: "lady" },
    tanchun:  { name: "探春",   robe: "#5b8fb9", robeD: "#436f92", sash: "#7fb0d8", skin: "#f0d2aa", hair: "#2c2018", hat: "点翠",    kind: "lady" },
    xichun:   { name: "惜春",   robe: "#d98a9a", robeD: "#b36a7a", sash: "#e8a8b6", skin: "#f2d8b4", hair: "#2c2018", hat: "双丫髻",  kind: "girl" },
    liwan:    { name: "李纨",   robe: "#7d8f6a", robeD: "#5f6f50", sash: "#6a7a58", skin: "#ecc9a2", hair: "#4a3a2c", hat: "素髻",    kind: "lady" },
    wang:     { name: "王夫人", robe: "#3a5a6a", robeD: "#2a4552", sash: "#2a4552", skin: "#e9cba6", hair: "#5a4a3a", hat: "抹额",    kind: "elder" },
    xue:      { name: "薛姨妈", robe: "#8a6a4a", robeD: "#6a5140", sash: "#6a5140", skin: "#e9c9a0", hair: "#6a5a48", hat: "抹额",    kind: "elder" },
    baoyu:    { name: "宝玉",   robe: "#b03a2e", robeD: "#8a2b22", sash: "#d8b75a", skin: "#f0d2aa", hair: "#2c2018", hat: "束发",    kind: "boy" },
    xiangyun: { name: "湘云",   robe: "#e0a83a", robeD: "#b9852a", sash: "#c98f28", skin: "#f0d2aa", hair: "#2c2018", hat: "双环髻",  kind: "lady" },
    yingchun: { name: "迎春",   robe: "#c9b56a", robeD: "#a89450", sash: "#a89450", skin: "#efd0a8", hair: "#2c2018", hat: "垂髻",    kind: "lady" },
    baner:    { name: "板儿",   robe: "#6a7a5a", robeD: "#52604a", sash: "#52604a", skin: "#e6c29a", hair: "#2c2018", hat: "总角",    kind: "child" },
    narrator: { name: "旁白",   robe: "#000000", robeD: "#000000", sash: "#000000", skin: "#e6c29a", hair: "#000000", hat: null,     kind: "none" }
  };

  /* ---------- 对话构建器 ---------- */
  function build() {
    const steps = [];
    const labels = {};
    const api = {
      label(n) { labels[n] = steps.length; return api; },
      say(who, text) { steps.push({ t: "say", who, text }); return api; },
      choice(text, options) { steps.push({ t: "choice", text, options }); return api; },
      set(flag, v) { steps.push({ t: "set", flag, v: (v === undefined ? 1 : v) }); return api; },
      ifc(flag, yes, no) { steps.push({ t: "if", flag, yes, no }); return api; },
      goto(n) { steps.push({ t: "goto", n }); return api; },
      ending() { steps.push({ t: "ending" }); return api; },
      done() { steps.push({ t: "done" }); return api; },
      end() { return { steps, labels }; }
    };
    return api;
  }

  /* ---------- 对话内容 ---------- */
  const CONVS = {};

  // 场景一 · 大观楼前 —— 戴花（选择一）
  CONVS.daihua = build()
    .label("start")
    .say("narrator", "贾母已带了一群人进来。李纨忙迎上去，碧月捧过一个翡翠盘子，里面盛着各色折枝菊花。贾母拣了一朵大红的簪在鬓上，回头看见了你。")
    .say("jiamu", "过来带花儿。")
    .say("feng", "让我打扮你。")
    .say("narrator", "一语未完，凤姐便拉过你，将一盘子花横三竖四插了你一头。贾母和众人笑的了不得。众人笑道：“你还不拔下来摔到他脸上呢，把你打扮的成了个老妖精了。”")
    .choice("凤姐把一盘子花插了你满头，满园都在笑。你要——", [
      { label: "自嘲解围：“我虽老了，年轻时也风流……今儿老风流才好。”", set: { 戴花Done: 1 }, goto: "A" },
      { label: "当真拔下一朵，作势摔向凤姐：“那我可听姑娘们的，摔到你脸上。”", set: { 得罪凤姐: 1, 戴花Done: 1 }, goto: "B" }
    ])
    .label("A")
    .say("liu", "我这头也不知修了什么福，今儿这样体面起来。")
    .say("liu", "我虽老了，年轻时也风流，爱个花儿粉儿的，今儿老风流才好。")
    .say("jiamu", "好，这才是会说话的老亲家。走，我领你见识见识这园子。")
    .goto("END")
    .label("B")
    .say("liu", "那我可听姑娘们的，摔到你脸上。")
    .say("feng", "哟，我好意打扮你，倒招你摔花，敢情是我不识趣了。")
    .say("jiamu", "好了好了，凤丫头闹着顽，姥姥也莫当真。咱们往园里逛去罢。")
    .goto("END")
    .label("END")
    .done()
    .end();

  // 李纨（大观楼前）
  CONVS.liwan_lou = build()
    .say("liwan", "老太太高兴，我越性把船上的划子、篙桨、遮阳幔子都搬下来预备着。姥姥也上去瞧瞧，那缀锦阁里堆着些围屏、桌椅、大小花灯。")
    .say("liu", "我上去瞧了，念了几声佛。那些东西我虽不大认得，只见五彩炫耀，各有奇妙。")
    .done()
    .end();

  CONVS.jiamu_lou = build()
    .say("jiamu", "今儿天气清朗，咱们好生逛一天。")
    .done()
    .end();

  CONVS.baner_lou = build()
    .say("baner", "姥姥，这园子真大。")
    .say("liu", "板儿，跟着姥姥，莫乱跑。")
    .done()
    .end();

  // 场景二 · 沁芳亭
  CONVS.qinfang = build()
    .say("narrator", "说笑之间，已来至沁芳亭上。丫鬟们抱了一个大锦褥子，铺在栏杆榻板上。贾母倚柱坐下，命你也坐在旁边。")
    .say("jiamu", "这园子好不好？")
    .say("liu", "我们乡下人，到了年下都上城来买画儿贴。那画儿也不过是假的，哪里有个真地方？谁知我今儿进这园一瞧，竟比那画儿还强十倍。")
    .say("liu", "怎么得有人也照着这个园子画一张，我带了家去，给他们见见，死了也得好处。")
    .say("jiamu", "你瞧我这个小孙女儿，他就会画。等明儿叫他画一张如何？")
    .say("liu", "我的姑娘。你这么大年纪儿，又这么个好模样，还有这个能干，别是神仙托生的罢。")
    .say("narrator", "惜春被夸得红了脸，低头笑了。")
    .set("沁芳Done", 1)
    .done()
    .end();

  CONVS.xichun_ting = build()
    .say("xichun", "姥姥过奖了，我不过是学着画，哪里就画得出这园子的好处。")
    .done()
    .end();

  // 场景三 · 潇湘馆
  CONVS.xiaoxiang = build()
    .say("narrator", "先到了潇湘馆。一进门，两边翠竹夹路，土地下苍苔布满，中间羊肠一条石子漫的路。你让出路来与众人走，自己却走土地。")
    .say("liu", "不相干的，我们走熟了的，姑娘们只管走罢。可惜你们的那绣鞋，别沾脏了。")
    .say("narrator", "你只顾上头和人说话，不防脚下一滑，咕咚一跤跌倒。众人拍手都哈哈笑起来。")
    .say("jiamu", "小蹄子们，还不搀起来，只站着笑。可扭了腰了不曾？")
    .say("liu", "才说嘴就打了嘴。哪里说得我这么娇嫩了，那一天不跌两下子。")
    .say("narrator", "进了屋内。黛玉亲自用小茶盘捧了一盖碗茶来。你见窗下案上设着笔砚，书架上磊着满满的书。")
    .say("liu", "这必定是那位哥儿的书房了。")
    .say("jiamu", "这是我这外孙女儿的屋子。")
    .say("liu", "这哪里像个小姐的绣房，竟比那上等的书房还好。")
    .say("jiamu", "这个纱新糊上好看，过了后来就不翠了。这院子里又没有桃杏树，竹子已是绿的，再拿这绿纱糊上反不配。我记得咱们先有四五样颜色糊窗的纱呢。")
    .say("feng", "昨儿我开库房，看见好些银红蝉翼纱，颜色又鲜，纱又轻软，我竟没见过这样的。")
    .say("jiamu", "呸，人人都说你没有不经过不见过，连这个纱还不认得呢。正经名字叫作“软烟罗”。")
    .say("jiamu", "那软烟罗只有四样颜色：一样雨过天晴，一样秋香色，一样松绿的，一样就是银红的，又叫作“霞影纱”。远远的看着，就似烟雾一样。")
    .say("liu", "我们想他作衣裳也不能，拿着糊窗子，岂不可惜？")
    .say("jiamu", "再找一找，只怕还有青的。若有时都拿出来，送这刘亲家两匹，做一个帐子我挂。")
    .say("liu", "阿弥陀佛，这是天大的福分。")
    .set("潇湘Done", 1)
    .done()
    .end();

  CONVS.daiyu_guan = build()
    .say("daiyu", "老太太、姥姥请坐，我倒茶来。")
    .done()
    .end();

  CONVS.wang_guan = build()
    .say("wang", "我们不吃茶，姑娘不用倒了。")
    .done()
    .end();

  // 场景四 · 秋爽斋 —— 早饭（选择二）
  CONVS.zaofan = build()
    .say("narrator", "凤姐同了探春、李纨、鸳鸯、琥珀，抄着近路到了秋爽斋，就在晓翠堂上调开桌案。")
    .say("yuanyang", "天天咱们说外头老爷们吃酒吃饭，都有一个篾片相公，拿他取笑儿。咱们今儿也得了一个女篾片了。")
    .say("feng", "咱们今儿就拿他取个笑儿。")
    .say("liwan", "你们一点好事也不做，又不是个小孩儿，还这么淘气，仔细老太太说。")
    .say("yuanyang", "很不与你相干，有我呢。")
    .say("narrator", "凤姐一面递眼色与鸳鸯，鸳鸯便拉你出去，悄悄嘱咐了你一席话，又说：“这是我们家的规矩，若错了我们就笑话呢。”")
    .say("liu", "姑娘放心。")
    .say("narrator", "你入了坐，拿起箸来，沉甸甸的不伏手——原是凤姐和鸳鸯商议定了，单拿一双老年四楞象牙镶金的筷子与你。")
    .say("liu", "这叉爬子比俺那里铁掀还沉，哪里强的过他。")
    .say("narrator", "一个媳妇端上两碗菜，凤姐偏拣了一碗鸽子蛋放在你桌上。贾母这边说声“请”。")
    .choice("贾母说“请”，满桌都等着你。你要——", [
      { label: "站起身来，高声说：“老刘，老刘，食量大似牛，吃一个老母猪不抬头。”", set: { 配合取笑: 1, 早饭Done: 1 }, goto: "A" },
      { label: "端坐不动，只当没听见，规规矩矩吃菜。", set: { 早饭Done: 1 }, goto: "B" }
    ])
    .label("A")
    .say("narrator", "众人先是一怔，随后上上下下都哈哈大笑起来。湘云撑不住，一口饭喷了出来；黛玉笑岔了气；宝玉早滚到贾母怀里，贾母笑得搂着叫“心肝”。")
    .say("liu", "这里的鸡儿也俊，下的这蛋也小巧，怪俊的。我且拣一个尝尝。")
    .say("feng", "一两银子一个呢，你快尝尝罢，那冷了就不好吃了。")
    .say("narrator", "你伸箸子要夹，哪里夹得起来，好容易撮起一个，偏又滑下来滚在地下。")
    .say("liu", "一两银子，也没听见响声儿就没了。")
    .say("jiamu", "这会子又把那个筷子拿了出来，还不换了呢。")
    .say("liu", "去了金的，又是银的，到底不及俺们那个伏手。")
    .goto("END")
    .label("B")
    .say("narrator", "满桌一时安静下来。凤姐与鸳鸯面面相觑，贾母脸上的笑也淡了下去。")
    .say("jiamu", "……吃饭罢。")
    .say("narrator", "那碗鸽子蛋到底还是端了上来，凤姐淡淡道：“一两银子一个呢。”你伸箸去夹，象牙筷子滑，一个也夹不起来。")
    .say("liu", "这叉爬子比铁掀还沉，夹不起来。")
    .say("feng", "那是你不惯，换双乌木的罢。")
    .goto("END")
    .label("END")
    .done()
    .end();

  CONVS.tanchun_zhai = build()
    .say("narrator", "一时吃毕，贾母等都往探春卧室中去说闲话。探春素喜阔朗，三间屋子并不曾隔断，案上磊着各种名人法帖，并数十方宝砚。")
    .say("tanchun", "姥姥随便坐。板儿要顽，你只看住了他，莫叫他碰坏了东西。")
    .say("narrator", "板儿要摘那白玉比目磬的小锤，又要佛手吃。你忙打了他一巴掌。")
    .say("liu", "下作黄子，没干没净的乱闹。倒叫你进来瞧瞧，就上脸了。")
    .say("tanchun", "罢了，他小孩子家，一个佛手顽不得，给他罢。")
    .done()
    .end();

  CONVS.liwan_zhai = build()
    .say("liwan", "老太太高兴，今儿饭菜都拣各人爱吃的做了。")
    .done()
    .end();

  // 饭后 —— 赔不是（选择三）
  CONVS.fanhou = build()
    .ifc("配合取笑", "PEI", "COLD")
    .label("PEI")
    .say("narrator", "一时吃毕，这里收拾过残桌。你看着李纨与凤姐对坐着吃饭，叹道：")
    .say("liu", "别的罢了，我只爱你们家这行事。怪道说“礼出大家”。")
    .say("feng", "你别多心，才刚不过大家取笑儿。")
    .say("yuanyang", "姥姥别恼，我给你老人家赔个不是。")
    .choice("凤姐与鸳鸯来赔不是，你——", [
      { label: "笑着说：“咱们哄着老太太开个心儿，可有什么恼的！我要心里恼，也就不说了。”", set: { 深明大义: 1, 赔不是Done: 1 }, goto: "A" },
      { label: "淡淡地说：“罢了，我一个乡下来的，也只配给太太小姐们取乐子。”", set: { 赔不是Done: 1 }, goto: "B" }
    ])
    .label("A")
    .say("yuanyang", "好姥姥，你果然是个明白人。")
    .say("feng", "到底是见过世面的，不和我们一般见识。")
    .goto("END")
    .label("B")
    .say("feng", "姥姥这是记恨我呢。罢了，算我多事。")
    .say("yuanyang", "姥姥消消气，倒茶来吃。")
    .goto("END")
    .label("COLD")
    .say("narrator", "一时吃毕，凤姐与鸳鸯对坐吃饭，谁也没提方才的冷场。")
    .say("feng", "姥姥倒是个实在人，吃也吃了，也不说笑。")
    .say("liu", "乡下人笨嘴拙舌的，不敢在老太太跟前现眼。")
    .set("赔不是Done", 1)
    .goto("END")
    .label("END")
    .done()
    .end();

  // 场景五 · 荇叶渚·船上
  CONVS.chuan = build()
    .say("narrator", "众人来至荇叶渚。驾娘早把两只棠木舫撑来。凤姐立在船头也要撑船，贾母道：“这不是顽的，你快给我进来。”凤姐一篙点开，到了池当中，船小人多，乱晃起来，忙把篙子递与驾娘。")
    .say("baoyu", "这些破荷叶可恨，怎么还不叫人来拔去。")
    .say("baochai", "今年这几日，何曾饶了这园子闲了，天天逛，哪里还有叫人来收拾的工夫。")
    .say("daiyu", "我最不喜欢李义山的诗，只喜他这一句：“留得残荷听雨声”。偏你们又不留着残荷了。")
    .say("baoyu", "果然好句，以后咱们就别叫人拔去了。")
    .say("narrator", "船已到了花溆的萝港之下，觉得阴森透骨，两滩上衰草残菱，更助秋情。")
    .set("船上Done", 1)
    .done()
    .end();

  CONVS.feng_chuan = build()
    .say("feng", "怕什么！老祖宗只管放心。")
    .say("jiamu", "这不是顽的，虽不是河里，也有好深的。你快给我进来。")
    .done()
    .end();

  CONVS.xiangyun_chuan = build()
    .say("xiangyun", "这船晃得有趣，我偏要站起来看这残荷。")
    .done()
    .end();

  // 场景六 · 蘅芜苑
  CONVS.hengwu = build()
    .say("narrator", "贾母因见岸上的清厦旷朗，便问：“这是你薛姑娘的屋子不是？”众人道：“是。”贾母忙命拢岸，一同进了蘅芜苑，只觉异香扑鼻。")
    .say("narrator", "那些奇草仙藤愈冷逾苍翠，都结了实，似珊瑚豆子一般。及进了房屋，雪洞一般，一色玩器全无。")
    .say("jiamu", "这孩子太老实了。你没有陈设，何妨和你姨娘要些。")
    .say("feng", "他自己不要的。我们原送了来，他都退回去了。")
    .say("xue", "他在家里也不大弄这些东西的。")
    .say("jiamu", "使不得。虽然他省事，倘或来一个亲戚，看着不像；二则年轻的姑娘们，房里这样素净，也忌讳。")
    .say("jiamu", "你把那石头盆景儿和那架纱桌屏，还有个墨烟冻石鼎，这三样摆在这案上就够了。再把那水墨字画白绫帐子拿来，把这帐子也换了。")
    .say("yuanyang", "这些东西都搁在东楼上的不知哪个箱子里，还得慢慢找去，明儿再拿去也罢了。")
    .say("jiamu", "明日后日都使得，只别忘了。")
    .set("蘅芜Done", 1)
    .done()
    .end();

  CONVS.baochai_yuan = build()
    .say("baochai", "老太太、姨妈费心了。我原是想省事些，倒叫大家记挂。")
    .done()
    .end();

  CONVS.xue_yuan = build()
    .say("xue", "他在家里也不大弄这些东西的。")
    .done()
    .end();

  CONVS.yuanyang_yuan = build()
    .say("yuanyang", "这些东西都搁在东楼上，还得慢慢找去。")
    .done()
    .end();

  // 场景七 · 缀锦阁酒席 —— 牙牌令（选择四）
  CONVS.yapai = build()
    .say("narrator", "凤姐已带着人摆设整齐。上面二榻四几，是贾母薛姨妈；下面一椅两几，是王夫人。每人一把乌银洋錾自斟壶，一个十锦珐琅杯。")
    .say("jiamu", "咱们先吃两杯，今日也行一令才有意思。")
    .say("feng", "既行令，还叫鸳鸯姐姐来行更好。")
    .say("yuanyang", "酒令大如军令，不论尊卑，惟我是主。违了我的话，是要受罚的。")
    .say("narrator", "鸳鸯未开口，你便下了席，摆手道：“别这样捉弄人家，我家去了。”众人都笑道：“这却使不得。”小丫头子们笑着把你拉入席中。")
    .say("liu", "饶了我罢！")
    .say("yuanyang", "再多言的罚一壶。如今我说骨牌副儿，从老太太起，顺领说下去，至刘姥姥止。")
    .say("narrator", "贾母道“头上有青天”，薛姨妈道“梅花朵朵风前舞”，湘云道“双悬日月照乾坤”，宝钗道“双双燕子语梁间”，黛玉道“良辰美景奈何天”……一路行下来，独到迎春错了韵，被罚了一杯。")
    .choice("轮到你了。满座都笑着看你。你——", [
      { label: "说本色话：“是个庄家人罢。”“大火烧了毛毛虫。”“一个萝卜一头蒜。”“花儿落了结个大倭瓜。”", set: { 牙牌本色: 1, 牙牌Done: 1 }, goto: "A" },
      { label: "摆手：“老婆子不会这个，甘愿罚一杯酒。”", set: { 牙牌Done: 1 }, goto: "B" }
    ])
    .label("A")
    .say("yuanyang", "左边“四四”是个人。")
    .say("liu", "是个庄家人罢。")
    .say("yuanyang", "中间“三四”绿配红。")
    .say("liu", "大火烧了毛毛虫。")
    .say("yuanyang", "右边“幺四”真好看。")
    .say("liu", "一个萝卜一头蒜。")
    .say("yuanyang", "凑成便是一枝花。")
    .say("liu", "花儿落了结个大倭瓜。")
    .say("narrator", "众人大笑起来。贾母笑出了眼泪，道：“说的好，就是这样说。”")
    .goto("END")
    .label("B")
    .say("jiamu", "罢了罢了，罚一杯罢。")
    .say("narrator", "你饮了一杯。众人一笑而过，接着行令，到底不如方才热闹。")
    .goto("END")
    .label("END")
    .say("narrator", "只听外面一阵笑嚷——这一日，也就尽兴了。")
    .ending()
    .done()
    .end();

  CONVS.jiamu_ge = build()
    .say("jiamu", "咱们先吃两杯，今日也行一令才有意思。")
    .done()
    .end();

  CONVS.xiangyun_ge = build()
    .say("xiangyun", "老太太的酒令，我们必得提防着些。")
    .done()
    .end();

  CONVS.feng_ge = build()
    .say("feng", "既行令，还叫鸳鸯姐姐来行更好。")
    .done()
    .end();

  /* ---------- 场景定义 ---------- */
  const SCENES = {
    lou: {
      id: "lou", name: "大观楼前", sub: "缀锦阁外 · 搬抬桌椅", num: 1,
      prev: null, next: "ting", gate: "戴花Done", nextName: "沁芳亭",
      obj: "去与凤姐说话——她正招呼你戴花", keyHint: "凤姐",
      npcs: [
        { char: "feng", x: 820, conv: "daihua", key: true },
        { char: "liwan", x: 320, conv: "liwan_lou" },
        { char: "jiamu", x: 1060, conv: "jiamu_lou" },
        { char: "baner", x: 150, conv: "baner_lou" }
      ]
    },
    ting: {
      id: "ting", name: "沁芳亭", sub: "水上亭 · 比画还强十倍", num: 2,
      prev: "lou", next: "guan", gate: "沁芳Done", nextName: "潇湘馆",
      obj: "陪贾母看园子，说说这园子好不好", keyHint: "贾母",
      npcs: [
        { char: "jiamu", x: 640, conv: "qinfang", key: true },
        { char: "xichun", x: 920, conv: "xichun_ting" }
      ]
    },
    guan: {
      id: "guan", name: "潇湘馆", sub: "翠竹苍苔 · 软烟罗", num: 3,
      prev: "ting", next: "zhai", gate: "潇湘Done", nextName: "秋爽斋",
      obj: "随贾母进潇湘馆，瞧瞧黛玉的屋子", keyHint: "贾母",
      npcs: [
        { char: "jiamu", x: 700, conv: "xiaoxiang", key: true },
        { char: "daiyu", x: 950, conv: "daiyu_guan" },
        { char: "wang", x: 300, conv: "wang_guan" }
      ]
    },
    zhai: {
      id: "zhai", name: "秋爽斋", sub: "晓翠堂 · 早饭", num: 4,
      prev: "guan", next: "chuan", gate: "赔不是Done", nextName: "荇叶渚",
      obj: "与鸳鸯搭话，开席了", keyHint: "鸳鸯",
      npcs: [
        { char: "yuanyang", x: 520, conv: "zaofan", key: true, hide: ["早饭Done"] },
        { char: "feng", x: 760, conv: "fanhou", key: true, req: ["早饭Done"], hide: ["赔不是Done"] },
        { char: "tanchun", x: 1010, conv: "tanchun_zhai", req: ["早饭Done"] },
        { char: "liwan", x: 210, conv: "liwan_zhai" }
      ]
    },
    chuan: {
      id: "chuan", name: "荇叶渚", sub: "池上船中 · 留得残荷听雨声", num: 5,
      prev: "zhai", next: "yuan", gate: "船上Done", nextName: "蘅芜苑",
      obj: "随众人坐船，听宝玉他们论残荷", keyHint: "宝玉",
      npcs: [
        { char: "baoyu", x: 620, conv: "chuan", key: true },
        { char: "feng", x: 300, conv: "feng_chuan" },
        { char: "xiangyun", x: 940, conv: "xiangyun_chuan" }
      ]
    },
    yuan: {
      id: "yuan", name: "蘅芜苑", sub: "异香仙藤 · 雪洞之室", num: 6,
      prev: "chuan", next: "ge", gate: "蘅芜Done", nextName: "缀锦阁酒席",
      obj: "随贾母进蘅芜苑，看宝钗的屋子", keyHint: "贾母",
      npcs: [
        { char: "jiamu", x: 600, conv: "hengwu", key: true },
        { char: "baochai", x: 900, conv: "baochai_yuan" },
        { char: "xue", x: 250, conv: "xue_yuan" },
        { char: "yuanyang", x: 1080, conv: "yuanyang_yuan" }
      ]
    },
    ge: {
      id: "ge", name: "缀锦阁", sub: "牙牌令 · 酒令大如军令", num: 7,
      prev: "yuan", next: null, gate: "牙牌Done", nextName: "（结局）",
      obj: "入席，行牙牌令", keyHint: "鸳鸯",
      npcs: [
        { char: "yuanyang", x: 600, conv: "yapai", key: true },
        { char: "jiamu", x: 900, conv: "jiamu_ge" },
        { char: "xiangyun", x: 260, conv: "xiangyun_ge" },
        { char: "feng", x: 1080, conv: "feng_ge" }
      ]
    }
  };

  const SCENE_ORDER = ["lou", "ting", "guan", "zhai", "chuan", "yuan", "ge"];

  /* ---------- 结局 ---------- */
  const ENDINGS = {
    E1: {
      tag: "结局一", title: "满堂欢",
      body: [
        "满堂的笑声里，贾母笑得眼泪都出来了，直叫“心肝儿”。行完了令，贾母命人把软烟罗找出来，送刘姥姥两匹做帐子，又拣了好些衣物点心相赠。",
        "凤姐与鸳鸯私下里来赔不是，刘姥姥笑道：“咱们哄着老太太开个心儿，可有什么恼的！”这一日，她既开了眼界，又哄得老太太欢喜，宾主尽欢。临出园时，贾母还拉着她的手，说往后常来走动。",
        "—— 正是原著里“热闹一天”的光景。"
      ],
      cite: "对应原著情节走向"
    },
    E2: {
      tag: "结局二", title: "守拙归去",
      body: [
        "刘姥姥处处守着本分，不曾失了体面，却到底没走进这园子的热闹里去。席上众人客客气气，敬她一杯，便各自说笑。",
        "散席时，天色尚早。刘姥姥牵着板儿，望了望满园灯火，心里明白：这一趟，自己到底是外人。她念佛告辞，回乡下家去。",
        "—— 贾家的大门依旧开着，只不知还认不认得她这个“老亲家”。"
      ],
      cite: "玩家选择所致之分支"
    },
    E3: {
      tag: "结局三", title: "不欢而散",
      body: [
        "那一摔，把凤姐脸上的笑僵住了。贾母虽还打圆场，可满座都觉出冷意。此后一路，凤姐再没拿正眼瞧刘姥姥，鸳鸯也不来照应。",
        "到了席上，众人自去行令吃酒，把个刘姥姥晾在一边。她自知无趣，早早告退。出得园来，秋风一吹，才觉出这一日的冷。",
        "—— 原是来求照应的，如今倒把当家奶奶得罪了。"
      ],
      cite: "玩家选择所致之分支"
    }
  };

  /* ---------- 全局状态 ---------- */
  const state = {
    scene: "lou",
    px: 420,
    facing: 1,
    vx: 0,
    flags: {},
    mode: "title", // title | intro | walk | talk | choice | ending
    conv: null,
    convIndex: 0,
    choices: [],
    doneConvs: {},
    bannerTimer: 0,
    walkPhase: 0,
    petals: [],
    endingWhich: null
  };

  // 花瓣（固定种子）
  for (let i = 0; i < 22; i++) {
    state.petals.push({
      x: rand(0, W), y: rand(0, H), r: rand(2, 4.2),
      sp: rand(0.3, 0.9), ph: rand(0, Math.PI * 2), sw: rand(0.6, 1.6)
    });
  }

  /* ---------- DOM ---------- */
  const $ = (id) => document.getElementById(id);
  const canvas = $("game");
  const ctx = canvas.getContext("2d");
  const portrait = $("portrait");
  const pctx = portrait.getContext("2d");

  /* ---------- HUD 刷新 ---------- */
  function currentObjective() {
    const s = SCENES[state.scene];
    if (s.gate && state.flags[s.gate]) {
      return s.next ? "前往「" + s.nextName + "」" : "行完了令，且看这一日如何收场";
    }
    return s.obj;
  }

  function refreshHUD() {
    const s = SCENES[state.scene];
    $("chapter").textContent = "第四十回 · 史太君两宴大观园　金鸳鸯三宣牙牌令";
    $("location").textContent = s.name;
    $("progress").textContent = "第 " + s.num + " / 7 景";
    $("objective").textContent = currentObjective();
    const hint = state.mode === "walk" ? hintForWalk() : "";
    $("hint").textContent = hint;
  }

  function hintForWalk() {
    const s = SCENES[state.scene];
    const npc = nearestNPC();
    if (npc) return "按 E / 空格 与「" + CHARS[npc.char].name + "」交谈";
    if (state.px > 1150) {
      return s.gate && state.flags[s.gate]
        ? "→ 前往「" + s.nextName + "」"
        : "前方尚未就绪：先与「" + s.keyHint + "」说话";
    }
    if (state.px < 130 && s.prev) return "← 返回「" + SCENES[s.prev].name + "」";
    return "← → / A D 行走　·　E / 空格 交谈";
  }

  function showBanner(sceneId) {
    const s = SCENES[sceneId];
    const zh = ["", "壹", "贰", "叁", "肆", "伍", "陆", "柒"];
    $("banner").innerHTML =
      '<div class="bTitle">第' + zh[s.num] + "节 · " + s.name + '</div>' +
      '<div class="bSub">' + s.sub + "</div>";
    $("banner").classList.add("show");
    state.bannerTimer = 2000;
  }

  /* ---------- 场景切换 ---------- */
  function enterScene(id, px) {
    state.scene = id;
    state.px = px || 420;
    state.facing = 1;
    showBanner(id);
    refreshHUD();
  }

  function forwardGateOpen() {
    const s = SCENES[state.scene];
    if (!s.next) return false;
    return s.gate ? !!state.flags[s.gate] : true;
  }

  /* ---------- NPC ---------- */
  function visibleNPCs() {
    const s = SCENES[state.scene];
    return s.npcs.filter(function (n) {
      if (n.req) for (let i = 0; i < n.req.length; i++) if (!state.flags[n.req[i]]) return false;
      if (n.hide) for (let i = 0; i < n.hide.length; i++) if (state.flags[n.hide[i]]) return false;
      return true;
    });
  }

  function nearestNPC() {
    const list = visibleNPCs();
    let best = null, bd = 130;
    for (let i = 0; i < list.length; i++) {
      const d = Math.abs(list[i].x - state.px);
      if (d < bd) { bd = d; best = list[i]; }
    }
    return best;
  }

  /* ---------- 对话引擎 ---------- */
  function startConv(id) {
    const c = CONVS[id];
    if (!c) { return; }
    if (state.doneConvs[id]) {
      showSingleLine("narrator", "（此处已叙过话，可往别处去。）");
      return;
    }
    state.conv = c;
    state.convIndex = 0;
    state.mode = "talk";
    hideChoices();
    runStep(c.steps[0]);
  }

  function runStep(step) {
    if (!step) { endConv(); return; }
    switch (step.t) {
      case "say": showSay(step.who, step.text); break;
      case "choice": showChoice(step); break;
      case "set": state.flags[step.flag] = step.v; refreshHUD(); nextStep(); break;
      case "if": jumpToLabel(state.flags[step.flag] ? step.yes : step.no); break;
      case "goto": jumpToLabel(step.n); break;
      case "ending": endConv(); computeEnding(); break;
      case "done": endConv(); break;
      default: nextStep();
    }
  }

  function nextStep() {
    state.convIndex++;
    runStep(state.conv.steps[state.convIndex]);
  }

  function jumpToLabel(n) {
    const idx = state.conv.labels[n];
    if (idx === undefined) { endConv(); return; }
    state.convIndex = idx;
    runStep(state.conv.steps[idx]);
  }

  function endConv() {
    const c = state.conv;
    if (c) {
      // 找出当前对话的 key，标记完成
      for (const k in CONVS) if (CONVS[k] === c) { state.doneConvs[k] = true; break; }
    }
    state.conv = null;
    if (state.mode !== "ending") {
      state.mode = "walk";
      hideDialogue();
      hideChoices();
    }
    refreshHUD();
  }

  function showSay(who, text) {
    state.mode = "talk";
    hideChoices();
    const box = $("dialogueBox");
    box.classList.remove("hidden");
    const nameEl = $("speakerName");
    nameEl.textContent = CHARS[who] ? CHARS[who].name : "？";
    nameEl.className = who === "narrator" ? "narrator" : "";
    $("dialogueText").textContent = text;
    drawPortrait(who);
    $("hint").textContent = "";
  }

  function showSingleLine(who, text) {
    state.conv = null;
    state.mode = "talk";
    showSay(who, text);
    // 单句模式：advance 直接回到行走
    state._singleLine = true;
  }

  function showChoice(step) {
    state.mode = "choice";
    state.choices = step.options;
    hideDialogue();
    $("choiceBox").classList.remove("hidden");
    $("choicePrompt").textContent = step.text;
    const optEl = $("choiceOptions");
    optEl.innerHTML = "";
    const keys = ["甲", "乙", "丙", "丁"];
    step.options.forEach(function (opt, i) {
      const b = document.createElement("button");
      b.className = "choiceOpt";
      b.innerHTML = '<span class="key">' + (keys[i] || (i + 1)) + "</span>" + opt.label;
      b.addEventListener("click", function () { chooseOption(i); });
      optEl.appendChild(b);
    });
    $("hint").textContent = "";
  }

  function chooseOption(i) {
    if (state.mode !== "choice") return;
    const opt = state.choices[i];
    if (!opt) return;
    if (opt.set) for (const k in opt.set) state.flags[k] = opt.set[k];
    state.mode = "talk";
    hideChoices();
    refreshHUD();
    if (opt.goto !== undefined) jumpToLabel(opt.goto);
    else nextStep();
  }

  function hideDialogue() { $("dialogueBox").classList.add("hidden"); }
  function hideChoices() { $("choiceBox").classList.add("hidden"); }

  /* ---------- 立绘 ---------- */
  function drawPortrait(who) {
    const ch = CHARS[who] || CHARS.narrator;
    pctx.clearRect(0, 0, 132, 148);
    if (who === "narrator") {
      // 旁白：一支卷轴
      pctx.fillStyle = "#d9c49a";
      rr(pctx, 30, 28, 72, 96, 4); pctx.fill();
      pctx.strokeStyle = "#8a6a40"; pctx.lineWidth = 2; pctx.stroke();
      pctx.fillStyle = "#8a6a40";
      rr(pctx, 20, 18, 92, 12, 6); pctx.fill();
      rr(pctx, 20, 122, 92, 12, 6); pctx.fill();
      pctx.fillStyle = "#5a4a35";
      pctx.font = "22px 'Songti SC','Noto Serif CJK SC',serif";
      pctx.textAlign = "center";
      pctx.fillText("书", 66, 88);
      return;
    }
    drawBust(pctx, ch, 66, 116, 1);
  }

  function drawBust(c, ch, cx, cy, facing) {
    const robe = ch.robe, robeD = ch.robeD, skin = ch.skin, hair = ch.hair;
    c.save();
    c.translate(cx, cy);
    c.scale(facing, 1);
    // 肩与衣领
    c.fillStyle = robe;
    rr(c, -46, -34, 92, 60, 18); c.fill();
    c.fillStyle = robeD;
    poly(c, [[-46, -6], [46, -6], [34, 22], [-34, 22]]); c.fill();
    // 交领
    c.fillStyle = robeD;
    poly(c, [[-8, -34], [0, 8], [8, -34]]); c.fill();
    c.fillStyle = ch.sash || robeD;
    rr(c, -34, -2, 68, 8, 3); c.fill();
    // 头
    c.fillStyle = skin;
    c.beginPath(); c.arc(0, -54, 26, 0, Math.PI * 2); c.fill();
    // 头发
    c.fillStyle = hair;
    c.beginPath(); c.arc(0, -62, 26, Math.PI, Math.PI * 2); c.fill();
    if (ch.hat === "抹额") {
      c.fillStyle = "#b03a2e";
      rr(c, -26, -66, 52, 8, 3); c.fill();
      c.fillStyle = "#d8b75a";
      c.beginPath(); c.arc(0, -62, 3.4, 0, Math.PI * 2); c.fill();
    } else if (ch.hat === "凤钗") {
      c.fillStyle = "#d8b75a";
      c.beginPath(); c.arc(-12, -82, 4, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(10, -82, 4, 0, Math.PI * 2); c.fill();
    } else if (ch.hat === "束发") {
      c.fillStyle = "#2c2018";
      rr(c, -8, -86, 16, 22, 6); c.fill();
      c.fillStyle = "#d8b75a";
      c.beginPath(); c.arc(0, -88, 5, 0, Math.PI * 2); c.fill();
    } else {
      // 髻
      c.fillStyle = hair;
      c.beginPath(); c.arc(-8, -82, 9, 0, Math.PI * 2); c.fill();
      if (ch.kind === "girl") { c.beginPath(); c.arc(9, -82, 7, 0, Math.PI * 2); c.fill(); }
      if (ch.kind === "maid") { c.beginPath(); c.arc(10, -80, 7, 0, Math.PI * 2); c.fill(); }
    }
    // 五官
    c.fillStyle = "#3a2a20";
    c.beginPath(); c.arc(-9, -54, 2.1, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(9, -54, 2.1, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "#8a6a50"; c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(-15, -44); c.quadraticCurveTo(0, -40, 15, -44); c.stroke();
    c.restore();
  }

  /* ---------- 人物（场景内） ---------- */
  function drawPerson(ch, x, y, facing, scale, isPlayer) {
    const robe = ch.robe, robeD = ch.robeD, skin = ch.skin, hair = ch.hair;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(facing * scale, scale);
    // 脚
    ctx.fillStyle = robeD;
    rr(ctx, -18, -10, 16, 10, 3); ctx.fill();
    rr(ctx, 2, -10, 16, 10, 3); ctx.fill();
    // 袍身（梯形）
    ctx.fillStyle = robe;
    poly(ctx, [[-22, -128], [22, -128], [30, -8], [-30, -8]]); ctx.fill();
    ctx.fillStyle = robeD;
    poly(ctx, [[-22, -128], [0, -128], [0, -8], [-30, -8]]); ctx.fill();
    // 衣领
    ctx.fillStyle = robeD;
    poly(ctx, [[-6, -128], [0, -96], [6, -128]]); ctx.fill();
    // 腰带
    ctx.fillStyle = ch.sash || robeD;
    rr(ctx, -24, -58, 48, 9, 4); ctx.fill();
    // 袖（一只手垂）
    ctx.fillStyle = robe;
    poly(ctx, [[18, -110], [40, -104], [38, -60], [20, -66]]); ctx.fill();
    // 头
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.arc(0, -146, 20, 0, Math.PI * 2); ctx.fill();
    // 头发
    ctx.fillStyle = hair;
    ctx.beginPath(); ctx.arc(0, -152, 20, Math.PI, Math.PI * 2); ctx.fill();
    if (ch.hat === "抹额") {
      ctx.fillStyle = "#b03a2e";
      rr(ctx, -20, -156, 40, 6, 2); ctx.fill();
      ctx.fillStyle = "#d8b75a";
      ctx.beginPath(); ctx.arc(0, -153, 2.8, 0, Math.PI * 2); ctx.fill();
    } else if (ch.hat === "凤钗") {
      ctx.fillStyle = "#d8b75a";
      ctx.beginPath(); ctx.arc(-9, -168, 3.4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(8, -168, 3.4, 0, Math.PI * 2); ctx.fill();
    } else if (ch.hat === "束发") {
      ctx.fillStyle = "#2c2018";
      rr(ctx, -7, -172, 14, 18, 5); ctx.fill();
      ctx.fillStyle = "#d8b75a";
      ctx.beginPath(); ctx.arc(0, -174, 4, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = hair;
      ctx.beginPath(); ctx.arc(-7, -168, 7, 0, Math.PI * 2); ctx.fill();
      if (ch.kind === "girl" || ch.kind === "maid") { ctx.beginPath(); ctx.arc(8, -168, 6, 0, Math.PI * 2); ctx.fill(); }
    }
    // 五官
    ctx.fillStyle = "#3a2a20";
    ctx.beginPath(); ctx.arc(-7, -146, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(7, -146, 1.8, 0, Math.PI * 2); ctx.fill();
    // 微笑
    ctx.strokeStyle = "#8a6a50"; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(-11, -138); ctx.quadraticCurveTo(0, -134, 11, -138); ctx.stroke();
    if (ch.kind === "elder") {
      // 皱纹
      ctx.strokeStyle = "rgba(120,90,60,0.5)";
      ctx.beginPath(); ctx.moveTo(-4, -138); ctx.lineTo(-8, -136); ctx.stroke();
    }
    // 拐杖（刘姥姥）
    if (ch.kind === "elder" && ch.hat === null) {
      ctx.strokeStyle = "#6a5438"; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(30, -70); ctx.lineTo(44, 4); ctx.stroke();
    }
    if (isPlayer) {
      ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(0, -160, 34, 16, 0, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
    // 名牌
    ctx.save();
    ctx.font = "13px 'Songti SC','Noto Serif CJK SC',serif";
    ctx.textAlign = "center";
    const tw = ctx.measureText(ch.name).width + 14;
    ctx.fillStyle = "rgba(28,22,18,0.62)";
    rr(ctx, x - tw / 2, y - 205 * scale, tw, 22, 10); ctx.fill();
    ctx.fillStyle = "#f3e4c4";
    ctx.fillText(ch.name, x, y - 205 * scale + 15);
    ctx.restore();
  }

  /* ---------- 场景绘制 ---------- */
  function sky(c1, c2) {
    const g = ctx.createLinearGradient(0, 0, 0, GROUND);
    g.addColorStop(0, c1); g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, GROUND);
  }

  function ground(color, topLine) {
    const g = ctx.createLinearGradient(0, GROUND, 0, H);
    g.addColorStop(0, color); g.addColorStop(1, shade(color, -18));
    ctx.fillStyle = g;
    ctx.fillRect(0, GROUND, W, H - GROUND);
    ctx.strokeStyle = topLine || "rgba(0,0,0,0.12)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, GROUND); ctx.lineTo(W, GROUND); ctx.stroke();
  }

  function shade(hex, amt) {
    let r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    r = clamp(r + amt, 0, 255); g = clamp(g + amt, 0, 255); b = clamp(b + amt, 0, 255);
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  function distantHills(col) {
    ctx.fillStyle = col;
    poly(ctx, [[0, GROUND], [0, 470], [160, 430], [320, 470], [500, 430], [660, 468], [840, 436], [1020, 470], [1180, 440], [1280, 470], [1280, GROUND]]);
    ctx.fill();
  }

  function moon(x, y, r) {
    ctx.save();
    ctx.fillStyle = "rgba(245,238,214,0.95)";
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(220,210,180,0.5)";
    ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.25, r * 0.22, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + r * 0.28, y + r * 0.3, r * 0.16, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function pavilion(cx, cy, w, roofCol, bodyCol, pillarCol) {
    ctx.save();
    // 台基
    ctx.fillStyle = shade(bodyCol, -30);
    rr(ctx, cx - w / 2 - 8, cy, w + 16, 16, 3); ctx.fill();
    // 柱
    ctx.fillStyle = pillarCol;
    const cols = 4;
    for (let i = 0; i < cols; i++) {
      const x = cx - w / 2 + 14 + i * ((w - 28) / (cols - 1));
      ctx.fillRect(x, cy - 74, 9, 74);
    }
    // 栏杆
    ctx.strokeStyle = shade(pillarCol, 20); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx - w / 2, cy - 40); ctx.lineTo(cx + w / 2, cy - 40); ctx.stroke();
    // 屋顶
    ctx.fillStyle = roofCol;
    poly(ctx, [[cx - w / 2 - 26, cy - 70], [cx, cy - 150], [cx + w / 2 + 26, cy - 70]]);
    ctx.fill();
    ctx.fillStyle = shade(roofCol, -26);
    poly(ctx, [[cx - w / 2 - 26, cy - 70], [cx, cy - 150], [cx, cy - 70]]);
    ctx.fill();
    // 飞檐
    ctx.fillStyle = shade(roofCol, -30);
    poly(ctx, [[cx - w / 2 - 26, cy - 70], [cx - w / 2 - 52, cy - 66], [cx - w / 2 - 14, cy - 62]]);
    poly(ctx, [[cx + w / 2 + 26, cy - 70], [cx + w / 2 + 52, cy - 66], [cx + w / 2 + 14, cy - 62]]);
    // 宝顶
    ctx.fillStyle = "#b08a2e";
    ctx.beginPath(); ctx.arc(cx, cy - 150, 6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function bamboo(x, y, h, col) {
    ctx.save();
    ctx.strokeStyle = col; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - h); ctx.stroke();
    ctx.strokeStyle = shade(col, -24); ctx.lineWidth = 2;
    for (let i = 1; i < 5; i++) {
      const yy = y - h * i / 5;
      ctx.beginPath(); ctx.moveTo(x - 3, yy); ctx.lineTo(x + 3, yy); ctx.stroke();
    }
    // 叶
    ctx.fillStyle = shade(col, 10);
    for (let i = 0; i < 4; i++) {
      const yy = y - h * (0.3 + i * 0.2);
      ctx.save();
      ctx.translate(x, yy);
      ctx.rotate((i % 2 ? 1 : -1) * 0.7);
      poly(ctx, [[0, 0], [30, -4], [34, 6]]);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  function rock(x, y, w, h, col) {
    ctx.fillStyle = col;
    poly(ctx, [[x, y], [x + w * 0.2, y - h * 0.7], [x + w * 0.45, y - h], [x + w * 0.75, y - h * 0.6], [x + w, y - h * 0.8], [x + w * 1.15, y]]);
    ctx.fill();
    ctx.fillStyle = shade(col, -24);
    poly(ctx, [[x + w * 0.2, y - h * 0.7], [x + w * 0.45, y - h], [x + w * 0.5, y - h * 0.55], [x + w * 0.3, y - h * 0.2]]);
    ctx.fill();
  }

  function water(col) {
    ctx.fillStyle = col;
    ctx.fillRect(0, GROUND, W, H - GROUND);
    // 波光
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 10; i++) {
      const yy = GROUND + 30 + i * 9 + Math.sin(i * 2.4) * 4;
      const x0 = 30 + ((i * 130) % 1200);
      ctx.beginPath(); ctx.moveTo(x0, yy); ctx.quadraticCurveTo(x0 + 22, yy - 5, x0 + 44, yy); ctx.stroke();
    }
  }

  function lotusLeaf(x, y, r, col) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.55, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = shade(col, -28); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x - r * 0.8, y); ctx.lineTo(x + r * 0.8, y); ctx.stroke();
  }

  function moonGate(x, y, w, h) {
    ctx.fillStyle = "#e9e2d0";
    rr(ctx, x, y, w, h, 4); ctx.fill();
    ctx.strokeStyle = "#b8a77f"; ctx.lineWidth = 4;
    rr(ctx, x, y, w, h, 4); ctx.stroke();
    ctx.fillStyle = "#2b2320";
    ctx.beginPath(); ctx.arc(x + w / 2, y + h * 0.6, h * 0.34, 0, Math.PI * 2); ctx.fill();
  }

  function wallScroll(x, y, w, h, imgCol) {
    ctx.fillStyle = "#e9e2d0";
    rr(ctx, x, y, w, h, 3); ctx.fill();
    ctx.strokeStyle = "#8a6a40"; ctx.lineWidth = 2;
    rr(ctx, x, y, w, h, 3); ctx.stroke();
    // 画芯
    ctx.fillStyle = imgCol;
    rr(ctx, x + w * 0.14, y + h * 0.14, w * 0.72, h * 0.62, 2); ctx.fill();
    ctx.strokeStyle = "#c9ad7c"; ctx.lineWidth = 1;
    rr(ctx, x + w * 0.14, y + h * 0.14, w * 0.72, h * 0.62, 2); ctx.stroke();
    // 山
    ctx.fillStyle = "rgba(60,60,50,0.5)";
    poly(ctx, [[x + w * 0.22, y + h * 0.68], [x + w * 0.4, y + h * 0.3], [x + w * 0.52, y + h * 0.68]]);
    ctx.fill();
    poly(ctx, [[x + w * 0.5, y + h * 0.68], [x + w * 0.66, y + h * 0.36], [x + w * 0.82, y + h * 0.68]]);
    ctx.fill();
  }

  function table(x, y, w, h, col) {
    ctx.fillStyle = col;
    rr(ctx, x, y, w, h, 3); ctx.fill();
    ctx.strokeStyle = shade(col, -30); ctx.lineWidth = 2;
    rr(ctx, x, y, w, h, 3); ctx.stroke();
    // 腿
    ctx.fillStyle = shade(col, -26);
    ctx.fillRect(x + 6, y + h, 10, 40);
    ctx.fillRect(x + w - 16, y + h, 10, 40);
  }

  /* ---------- 各场景背景 ---------- */
  function drawLou() {
    sky("#f7ead0", "#e8cf9c");
    distantHills("rgba(160,130,90,0.35)");
    // 缀锦阁楼
    ctx.fillStyle = "#c8c0b0";
    rr(ctx, 820, 130, 360, 466, 4); ctx.fill();
    ctx.strokeStyle = "#8a7f6a"; ctx.lineWidth = 3;
    rr(ctx, 820, 130, 360, 466, 4); ctx.stroke();
    // 二层窗
    ctx.fillStyle = "#6a5a40";
    for (let i = 0; i < 4; i++) { rr(ctx, 848 + i * 82, 168, 56, 60, 3); ctx.fill(); }
    // 屋顶
    ctx.fillStyle = "#3f5a3a";
    poly(ctx, [[780, 132], [1000, 40], [1220, 132]]); ctx.fill();
    ctx.fillStyle = "#2f4630";
    poly(ctx, [[780, 132], [1000, 40], [1000, 132]]); ctx.fill();
    // 大红柱与门
    ctx.fillStyle = "#a3322b";
    ctx.fillRect(880, 420, 26, 176);
    ctx.fillRect(1094, 420, 26, 176);
    ctx.fillStyle = "#7d241e";
    rr(ctx, 906, 460, 188, 136, 4); ctx.fill();
    // 台基
    ground("#cbb992", "rgba(0,0,0,0.15)");
    ctx.fillStyle = "#b8a67f";
    for (let i = 0; i < 12; i++) { rr(ctx, 40 + i * 104, 606, 88, 12, 2); ctx.fill(); }
    // 菊花与箱子
    ctx.fillStyle = "#9a7a4a";
    rr(ctx, 180, 560, 90, 36, 4); ctx.fill();
    ctx.fillStyle = "#d8a44a";
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(200 + i * 16, 556, 6, 0, Math.PI * 2); ctx.fill(); }
    moonGate(90, 320, 150, 276);
  }

  function drawTing() {
    sky("#f7ead0", "#e8cf9c");
    distantHills("rgba(150,130,100,0.3)");
    water("#8fb8b0");
    // 残荷
    lotusLeaf(140, 620, 34, "#6a8a62");
    lotusLeaf(220, 640, 26, "#5f7f58");
    lotusLeaf(1030, 622, 36, "#6a8a62");
    lotusLeaf(1140, 646, 24, "#5f7f58");
    ctx.strokeStyle = "#6a6a50"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(150, 618); ctx.lineTo(150, 570); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(1040, 620); ctx.lineTo(1040, 566); ctx.stroke();
    // 亭
    pavilion(640, 520, 380, "#3f5a3a", "#c8c0b0", "#a3322b");
    // 廊桥
    ctx.fillStyle = "#b8a67f";
    rr(ctx, 320, 588, 640, 20, 4); ctx.fill();
    ctx.strokeStyle = "#8a7a58"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(340, 588); ctx.lineTo(340, 548); ctx.moveTo(940, 588); ctx.lineTo(940, 548); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(340, 548); ctx.lineTo(940, 548); ctx.stroke();
    // 柳
    ctx.strokeStyle = "#7a5c3e"; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.moveTo(80, 600); ctx.lineTo(80, 470); ctx.stroke();
    ctx.fillStyle = "#6a8a62";
    for (let i = 0; i < 8; i++) {
      ctx.save(); ctx.translate(80, 470);
      ctx.rotate(-0.9 + i * 0.25);
      poly(ctx, [[0, 0], [50, 4], [30, 40]]); ctx.fill();
      ctx.restore();
    }
  }

  function drawGuan() {
    sky("#eef0dc", "#d8e0c0");
    // 竹
    bamboo(60, 600, 240, "#5f8a52");
    bamboo(120, 600, 200, "#6f9a5e");
    bamboo(1180, 600, 250, "#5f8a52");
    bamboo(1120, 600, 210, "#6f9a5e");
    bamboo(30, 600, 180, "#7aa868");
    // 房舍
    ctx.fillStyle = "#e6ded0";
    rr(ctx, 360, 260, 560, 336, 4); ctx.fill();
    ctx.strokeStyle = "#8a7a58"; ctx.lineWidth = 3;
    rr(ctx, 360, 260, 560, 336, 4); ctx.stroke();
    // 屋顶
    ctx.fillStyle = "#3f5a3a";
    poly(ctx, [[330, 262], [640, 150], [950, 262]]); ctx.fill();
    ctx.fillStyle = "#2f4630";
    poly(ctx, [[330, 262], [640, 150], [640, 262]]); ctx.fill();
    // 月洞窗
    ctx.fillStyle = "#c9d6a8";
    ctx.beginPath(); ctx.arc(640, 380, 70, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#8a7a58"; ctx.lineWidth = 4; ctx.stroke();
    // 书架
    ctx.fillStyle = "#8a6a40";
    rr(ctx, 420, 440, 180, 140, 3); ctx.fill();
    ctx.fillStyle = "#c9ad7c";
    for (let i = 0; i < 3; i++) { rr(ctx, 430, 452 + i * 42, 160, 8, 2); ctx.fill(); }
    ctx.fillStyle = "#b8a67f";
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) { rr(ctx, 436 + c * 30, 464 + r * 42, 20, 26, 2); ctx.fill(); }
    // 书案
    table(830, 500, 150, 22, "#8a6a40");
    ctx.fillStyle = "#2b2320";
    rr(ctx, 850, 488, 40, 10, 2); ctx.fill();
    ctx.strokeStyle = "#6a5438"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(920, 492); ctx.lineTo(956, 492); ctx.stroke();
    ground("#c9c2a8", "rgba(0,0,0,0.14)");
    // 石子路
    ctx.fillStyle = "#c9c2a8";
    rr(ctx, 560, 596, 180, 100, 40); ctx.fill();
    ctx.fillStyle = "#a8a080";
    for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(580 + rand(0, 140), 610 + rand(0, 60), rand(6, 12), 0, Math.PI * 2); ctx.fill(); }
  }

  function drawZhai() {
    sky("#f2e6c8", "#e2cf9e");
    // 大厅
    ctx.fillStyle = "#eadfca";
    rr(ctx, 120, 150, 1040, 446, 4); ctx.fill();
    ctx.strokeStyle = "#8a7a58"; ctx.lineWidth = 3;
    rr(ctx, 120, 150, 1040, 446, 4); ctx.stroke();
    // 中堂画
    wallScroll(500, 180, 280, 200, "#c9d6a8");
    // 对联
    ctx.fillStyle = "#c9ad7c";
    rr(ctx, 430, 186, 40, 180, 3); ctx.fill();
    rr(ctx, 810, 186, 40, 180, 3); ctx.fill();
    ctx.fillStyle = "#3a2c22";
    ctx.font = "16px 'Songti SC','Noto Serif CJK SC',serif";
    ctx.textAlign = "center";
    ctx.fillText("烟霞", 450, 250); ctx.fillText("闲骨", 450, 280); ctx.fillText("格", 450, 310);
    ctx.fillText("泉石", 830, 250); ctx.fillText("野生", 830, 280); ctx.fillText("涯", 830, 310);
    // 大案
    table(200, 420, 420, 26, "#8a6a40");
    ctx.fillStyle = "#2b2320";
    rr(ctx, 240, 402, 60, 16, 3); ctx.fill(); // 砚
    ctx.fillStyle = "#5a4a35";
    for (let i = 0; i < 5; i++) { ctx.fillRect(330 + i * 26, 380, 8, 38); } // 笔
    // 花囊（白菊）
    ctx.fillStyle = "#b8c9d8";
    rr(ctx, 700, 330, 110, 130, 18); ctx.fill();
    ctx.fillStyle = "#f2ead8";
    for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(712 + (i % 5) * 24, 320 + (i % 3) * 26, 8, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = "#d8a44a";
    for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(712 + (i % 5) * 24, 320 + (i % 3) * 26, 3, 0, Math.PI * 2); ctx.fill(); }
    // 佛手盘
    ctx.fillStyle = "#c9ad7c";
    ctx.beginPath(); ctx.ellipse(930, 470, 70, 20, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#d8b75a";
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(900 + i * 16, 462, 9, 0, Math.PI * 2); ctx.fill(); }
    // 早饭桌
    table(420, 540, 400, 26, "#b89a68");
    ctx.fillStyle = "#e8e0d0";
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(450 + i * 70, 534, 18, 0, Math.PI * 2); ctx.fill(); }
    ground("#cbb992", "rgba(0,0,0,0.14)");
  }

  function drawChuan() {
    sky("#e8ddc2", "#d4c49a");
    distantHills("rgba(140,120,90,0.3)");
    water("#7fa8a2");
    // 残荷与芦苇
    lotusLeaf(150, 630, 30, "#5f7f58");
    lotusLeaf(1050, 636, 32, "#6a8a62");
    ctx.strokeStyle = "#6a6a50"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(160, 628); ctx.lineTo(160, 560); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(1060, 634); ctx.lineTo(1060, 566); ctx.stroke();
    // 萝港山石
    rock(700, 600, 260, 130, "#7a8a7a");
    rock(860, 600, 200, 100, "#8a9a8a");
    // 船
    ctx.fillStyle = "#8a6a40";
    poly(ctx, [[330, 560], [330, 596], [420, 622], [820, 622], [930, 596], [930, 560]]);
    ctx.fill();
    ctx.fillStyle = "#a8824e";
    rr(ctx, 380, 548, 470, 14, 6); ctx.fill();
    // 篷
    ctx.fillStyle = "#5f7f58";
    poly(ctx, [[440, 548], [560, 430], [700, 548]]); ctx.fill();
    ctx.fillStyle = "#4f6a48";
    poly(ctx, [[440, 548], [560, 430], [560, 548]]); ctx.fill();
    // 篙
    ctx.strokeStyle = "#6a5438"; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(930, 540); ctx.lineTo(1010, 420); ctx.stroke();
  }

  function drawYuan() {
    sky("#e4ecdc", "#c8d8bc");
    // 仙藤
    ctx.strokeStyle = "#4f7a48"; ctx.lineWidth = 6;
    for (let i = 0; i < 6; i++) {
      const x = 60 + i * 200;
      ctx.beginPath(); ctx.moveTo(x, 600);
      ctx.quadraticCurveTo(x + 30, 480, x + 10, 380);
      ctx.stroke();
    }
    ctx.fillStyle = "#3f6a3a";
    for (let i = 0; i < 18; i++) {
      const x = 50 + i * 70, y = 420 + Math.sin(i * 1.7) * 90;
      ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = "#c0392b";
    for (let i = 0; i < 12; i++) {
      const x = 70 + i * 105, y = 460 + Math.cos(i * 2.1) * 70;
      ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
    }
    // 屋
    ctx.fillStyle = "#e6ded0";
    rr(ctx, 380, 240, 520, 356, 4); ctx.fill();
    ctx.strokeStyle = "#8a7a58"; ctx.lineWidth = 3;
    rr(ctx, 380, 240, 520, 356, 4); ctx.stroke();
    ctx.fillStyle = "#3f5a3a";
    poly(ctx, [[350, 242], [640, 128], [930, 242]]); ctx.fill();
    ctx.fillStyle = "#2f4630";
    poly(ctx, [[350, 242], [640, 128], [640, 242]]); ctx.fill();
    // 青纱帐
    ctx.fillStyle = "#a8c0b0";
    rr(ctx, 420, 300, 200, 280, 6); ctx.fill();
    ctx.strokeStyle = "#7a9a88"; ctx.lineWidth = 2;
    rr(ctx, 420, 300, 200, 280, 6); ctx.stroke();
    // 土定瓶与菊花
    ctx.fillStyle = "#c9b89a";
    rr(ctx, 760, 440, 60, 90, 14); ctx.fill();
    ctx.fillStyle = "#e8c88a";
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(768 + i * 12, 434, 8, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = "#4a6a40"; ctx.lineWidth = 3;
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(768 + i * 12, 442); ctx.lineTo(768 + i * 12, 470); ctx.stroke(); }
    ground("#c2c8ae", "rgba(0,0,0,0.14)");
  }

  function drawGe() {
    sky("#f2e0c0", "#dcc494");
    // 缀锦阁檐
    ctx.fillStyle = "#3f5a3a";
    poly(ctx, [[0, 130], [640, 30], [1280, 130]]); ctx.fill();
    ctx.fillStyle = "#a3322b";
    ctx.fillRect(40, 130, 22, 200);
    ctx.fillRect(1218, 130, 22, 200);
    // 榻与几
    table(160, 470, 360, 28, "#b89a68");
    table(760, 470, 360, 28, "#b89a68");
    ctx.fillStyle = "#a3322b";
    rr(ctx, 170, 440, 340, 30, 6); ctx.fill();
    rr(ctx, 770, 440, 340, 30, 6); ctx.fill();
    // 攒盒
    ctx.fillStyle = "#c9ad7c";
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(240 + i * 60, 466, 18, 0, Math.PI * 2); ctx.fill(); }
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(850 + i * 60, 466, 18, 0, Math.PI * 2); ctx.fill(); }
    // 自斟壶
    ctx.fillStyle = "#8a8a9a";
    ctx.beginPath(); ctx.arc(420, 452, 14, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(1040, 452, 14, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#5a5a6a"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(420, 452); ctx.quadraticCurveTo(440, 436, 452, 444); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(1040, 452); ctx.quadraticCurveTo(1060, 436, 1072, 444); ctx.stroke();
    ground("#cbb992", "rgba(0,0,0,0.14)");
    ctx.fillStyle = "#b8a67f";
    for (let i = 0; i < 12; i++) { rr(ctx, 40 + i * 104, 606, 88, 12, 2); ctx.fill(); }
  }

  function drawTitleBackdrop() {
    sky("#2a2f4a", "#4a3a50");
    // 月
    moon(1020, 150, 76);
    // 远山
    ctx.fillStyle = "rgba(20,24,40,0.7)";
    poly(ctx, [[0, GROUND], [0, 480], [200, 430], [420, 480], [640, 440], [880, 482], [1100, 450], [1280, 480], [1280, GROUND]]);
    ctx.fill();
    // 亭
    pavilion(260, 520, 300, "#20283c", "#141a2c", "#7d241e");
    // 竹
    bamboo(980, 600, 240, "#2f4a38");
    bamboo(1060, 600, 200, "#2f4a38");
    // 水面
    water("#1c2434");
  }

  const DRAWERS = {
    lou: drawLou, ting: drawTing, guan: drawGuan, zhai: drawZhai,
    chuan: drawChuan, yuan: drawYuan, ge: drawGe
  };

  /* ---------- 主渲染 ---------- */
  function render() {
    ctx.clearRect(0, 0, W, H);
    if (state.mode === "title" || state.mode === "intro") {
      drawTitleBackdrop();
      drawPetals();
      return;
    }
    DRAWERS[state.scene]();
    drawPetals();
    drawSceneNPCs();
    drawPlayer();
  }

  function drawPetals() {
    const t = performance.now() / 1000;
    ctx.fillStyle = "rgba(240,220,190,0.75)";
    for (let i = 0; i < state.petals.length; i++) {
      const p = state.petals[i];
      const y = (p.y + t * 20 * p.sp) % (H + 20) - 10;
      const x = p.x + Math.sin(t * 0.7 + p.ph) * 26 * p.sw;
      ctx.beginPath();
      ctx.ellipse(x, y, p.r, p.r * 0.6, Math.sin(t + p.ph) * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawSceneNPCs() {
    const list = visibleNPCs();
    for (let i = 0; i < list.length; i++) {
      const n = list[i];
      const face = n.x > state.px ? 1 : -1;
      const bob = Math.sin(performance.now() / 600 + n.x) * 1.5;
      drawPerson(CHARS[n.char], n.x, GROUND - 10 + bob * 0.2, face, 1, false);
    }
  }

  function drawPlayer() {
    if (state.mode === "talk" || state.mode === "choice") {
      // 对话中仍显示，但微微下移避免遮挡
    }
    const bob = Math.sin(state.walkPhase) * 2.2;
    drawPerson(CHARS.liu, state.px, GROUND - 10 + bob * 0.4, state.facing, 1, true);
  }

  /* ---------- 结局 ---------- */
  function computeEnding() {
    const f = state.flags;
    let which;
    if (f.得罪凤姐) which = "E3";
    else if (f.配合取笑 && f.牙牌本色) which = "E1";
    else which = "E2";
    showEnding(which);
  }

  function showEnding(which) {
    state.endingWhich = which;
    state.mode = "ending";
    const e = ENDINGS[which];
    $("endingTag").textContent = "《红楼梦》第四十回 · 改编片段";
    $("endingTitle").textContent = e.title;
    const body = $("endingBody");
    body.innerHTML = "";
    e.body.forEach(function (p) { const el = document.createElement("p"); el.textContent = p; body.appendChild(el); });
    const cite = document.createElement("p");
    cite.className = "cite";
    cite.textContent = "—— " + e.cite;
    body.appendChild(cite);
    hideDialogue();
    hideChoices();
    $("hud").classList.add("hidden");
    $("endingScreen").classList.remove("hidden");
  }

  /* ---------- 标题 / 引子 ---------- */
  function showTitle() {
    state.mode = "title";
    $("titleScreen").classList.remove("hidden");
    $("introScreen").classList.add("hidden");
    $("endingScreen").classList.add("hidden");
    $("hud").classList.add("hidden");
    hideDialogue();
    hideChoices();
  }

  function startIntro() {
    state.mode = "intro";
    $("titleScreen").classList.add("hidden");
    $("introScreen").classList.remove("hidden");
  }

  function startGame() {
    state.mode = "walk";
    $("introScreen").classList.add("hidden");
    $("titleScreen").classList.add("hidden");
    $("endingScreen").classList.add("hidden");
    $("hud").classList.remove("hidden");
    state.flags = {};
    state.doneConvs = {};
    state.scene = "lou";
    state.px = 420;
    state.facing = 1;
    showBanner("lou");
    refreshHUD();
  }

  /* ---------- 输入 ---------- */
  function advance() {
    if (state.mode === "talk") {
      if (state._singleLine) {
        state._singleLine = false;
        state.mode = "walk";
        hideDialogue();
        refreshHUD();
        return;
      }
      nextStep();
    } else if (state.mode === "walk") {
      tryInteract();
    }
  }

  function tryInteract() {
    const npc = nearestNPC();
    if (npc) startConv(npc.conv);
  }

  const keys = {};
  document.addEventListener("keydown", function (e) {
    const k = e.key;
    if (k === " " || k === "ArrowLeft" || k === "ArrowRight" || k === "ArrowUp" || k === "ArrowDown") e.preventDefault();
    keys[k] = true;
    if (k === "Enter" || k === " " || k === "e" || k === "E") {
      if (state.mode === "talk" || state.mode === "walk") advance();
      else if (state.mode === "choice") {
        if (k === "e" || k === "E") chooseOption(0);
      }
    }
    if (state.mode === "choice") {
      if (k === "1") chooseOption(0);
      if (k === "2") chooseOption(1);
      if (k === "3") chooseOption(2);
      if (k === "4") chooseOption(3);
    }
  });
  document.addEventListener("keyup", function (e) { keys[e.key] = false; });

  canvas.addEventListener("click", function () {
    if (state.mode === "walk") {
      const npc = nearestNPC();
      if (npc) startConv(npc.conv);
    }
  });
  $("dialogueBox").addEventListener("click", advance);
  $("dialogueText").addEventListener("click", advance);

  $("startBtn").addEventListener("click", startIntro);
  $("enterBtn").addEventListener("click", startGame);
  $("restartBtn").addEventListener("click", function () {
    if (location.hash && location.hash.indexOf("#jump") === 0) {
      history.replaceState(null, "", location.pathname);
    }
    location.reload();
  });

  /* ---------- 跳转（评测用） ---------- */
  function resetRuntime() {
    state.flags = {};
    state.doneConvs = {};
    state.conv = null;
    state.convIndex = 0;
    state.choices = [];
    state._singleLine = false;
    state.bannerTimer = 0;
    hideDialogue();
    hideChoices();
    $("banner").classList.remove("show");
  }

  function applyJump(id) {
    resetRuntime();
    const F = state.flags;
    F.戴花Done = 1; F.沁芳Done = 1; F.潇湘Done = 1;
    F.早饭Done = 1; F.赔不是Done = 1; F.船上Done = 1; F.蘅芜Done = 1;
    F.牙牌Done = 1;
    // 仅标记跳转点之前已发生的对话，避免把当前要触发的那一段也标记为“已谈过”
    const doneMap = {
      "1": {},
      "2": { daihua: 1, qinfang: 1, xiaoxiang: 1 },
      "3": { daihua: 1, qinfang: 1, xiaoxiang: 1, zaofan: 1 },
      "4": { daihua: 1, qinfang: 1, xiaoxiang: 1, zaofan: 1, fanhou: 1, chuan: 1, hengwu: 1 },
      "e1": {}, "e2": {}, "e3": {}
    };
    state.doneConvs = Object.assign({}, doneMap[id] || {});

    function toScene(id, px) {
      state.mode = "walk";
      $("titleScreen").classList.add("hidden");
      $("introScreen").classList.add("hidden");
      $("endingScreen").classList.add("hidden");
      $("hud").classList.remove("hidden");
      enterScene(id, px);
    }

    switch (id) {
      case "1": // 选择一 · 戴花
        F.戴花Done = 0;
        toScene("lou", 780);
        break;
      case "2": // 选择二 · 早饭取笑
        F.早饭Done = 0;
        toScene("zhai", 480);
        break;
      case "3": // 选择三 · 赔不是
        F.赔不是Done = 0; F.配合取笑 = 1;
        toScene("zhai", 720);
        break;
      case "4": // 选择四 · 牙牌令
        F.牙牌Done = 0; F.配合取笑 = 1; F.深明大义 = 1;
        toScene("ge", 560);
        break;
      case "e1":
        F.得罪凤姐 = 0; F.配合取笑 = 1; F.牙牌本色 = 1;
        showEnding("E1"); break;
      case "e2":
        F.得罪凤姐 = 0; F.配合取笑 = 0; F.牙牌本色 = 0;
        showEnding("E2"); break;
      case "e3":
        F.得罪凤姐 = 1;
        showEnding("E3"); break;
      default:
        showTitle();
    }
  }

  function readJump() {
    const h = location.hash || "";
    if (h.indexOf("#jump=") === 0) {
      return h.slice(6).trim();
    }
    return null;
  }

  /* ---------- 主循环 ---------- */
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(50, now - last);
    last = now;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  function update(dt) {
    if (state.bannerTimer > 0) {
      state.bannerTimer -= dt;
      if (state.bannerTimer <= 0) $("banner").classList.remove("show");
    }
    if (state.mode !== "walk") return;
    let mv = 0;
    if (keys["ArrowLeft"] || keys["a"] || keys["A"]) mv -= 1;
    if (keys["ArrowRight"] || keys["d"] || keys["D"]) mv += 1;
    if (mv !== 0) {
      state.px = clamp(state.px + mv * 3.6, 36, 1244);
      state.facing = mv > 0 ? 1 : -1;
      state.walkPhase += 0.14;
    }
    // 边界切换
    if (state.px >= 1240) {
      const s = SCENES[state.scene];
      if (s.next && forwardGateOpen()) {
        enterScene(s.next, 100);
      } else {
        state.px = 1236;
      }
    } else if (state.px <= 40) {
      const s = SCENES[state.scene];
      if (s.prev) enterScene(s.prev, 1210);
      else state.px = 42;
    }
    // 实时刷新交互提示
    $("hint").textContent = hintForWalk();
  }

  /* ---------- 启动 ---------- */
  function boot() {
    const j = readJump();
    if (j) {
      applyJump(j);
    } else {
      resetRuntime();
      showTitle();
    }
    refreshHUD();
    requestAnimationFrame(loop);
  }

  window.addEventListener("hashchange", function () {
    const j = readJump();
    if (j) {
      applyJump(j);
    } else {
      resetRuntime();
      showTitle();
    }
    refreshHUD();
  });

  boot();
})();
