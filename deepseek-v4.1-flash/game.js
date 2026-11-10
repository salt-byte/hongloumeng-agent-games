/* ============================================================
   秋园行 · 红楼梦第四十回
   A code-drawn narrative exploration game.
   ============================================================ */
'use strict';

const W = 1280, H = 720;
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const $ = (id) => document.getElementById(id);

const SERIF = '"Songti SC","STSong","Noto Serif CJK SC","Noto Serif SC","SimSun",serif';
const SANS = '"PingFang SC","Hiragino Sans GB","Noto Sans CJK SC","Microsoft YaHei",sans-serif';

/* ---------------- deterministic random & small helpers ---------------- */
function mulberry32(a){
  return function(){
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(403940);
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const lerp = (a,b,t)=>a+(b-a)*t;
const easeOut = t=>1-Math.pow(1-t,3);
const TAU = Math.PI*2;

function rr(c,x,y,w,h,r=4){
  r = Math.min(r,w/2,h/2);
  c.beginPath();
  c.moveTo(x+r,y);
  c.lineTo(x+w-r,y); c.quadraticCurveTo(x+w,y,x+w,y+r);
  c.lineTo(x+w,y+h-r); c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  c.lineTo(x+r,y+h); c.quadraticCurveTo(x,y+h,x,y+h-r);
  c.lineTo(x,y+r); c.quadraticCurveTo(x,y,x+r,y);
  c.closePath();
}
function ellipse(c,x,y,rx,ry,rot=0){
  c.beginPath(); c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot,0,TAU);
}
function poly(c,pts){
  c.beginPath(); c.moveTo(pts[0][0],pts[0][1]);
  for(let i=1;i<pts.length;i++) c.lineTo(pts[i][0],pts[i][1]);
  c.closePath();
}
function line(c,x1,y1,x2,y2){c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();}
function radial(c,x,y,r,stops){
  const gr=c.createRadialGradient(x,y,0,x,y,r);
  for(const [o,col] of stops) gr.addColorStop(o,col);
  return gr;
}
function linear(c,x1,y1,x2,y2,stops){
  const gr=c.createLinearGradient(x1,y1,x2,y2);
  for(const [o,col] of stops) gr.addColorStop(o,col);
  return gr;
}
function ellipseGrad(c,x,y,rx,ry,stops){
  const gr=c.createRadialGradient(x-rx*.25,y-ry*.35,2,x,y,Math.max(rx,ry));
  for(const [o,col] of stops) gr.addColorStop(o,col);
  return gr;
}

/* ---------------- characters ---------------- */
const CHARS = {
  liu:     {name:'刘姥姥', role:'乡下亲家', seal:'刘', skin:'#dbb694', hair:'#38302b', robe:'#526a78', robe2:'#425866', skirt:'#6f5a4a', trim:'#b99a70', accent:'#dbcfb6', age:'old', build:1.04},
  jia:     {name:'贾母',   role:'史太君',   seal:'贾', skin:'#e5c6a6', hair:'#d8d2c3', robe:'#70313a', robe2:'#59252d', skirt:'#4c2027', trim:'#c9a45e', accent:'#e7d3a8', age:'elder', build:1.0},
  feng:    {name:'凤姐',   role:'王熙凤',   seal:'凤', skin:'#eccdae', hair:'#211e1c', robe:'#ae4a45', robe2:'#8f3534', skirt:'#7b2d30', trim:'#e0bb76', accent:'#f2dfb9', build:1.01},
  daiyu:   {name:'林黛玉', role:'潇湘馆主人', seal:'林', skin:'#f0d7bf', hair:'#262220', robe:'#d9e0cf', robe2:'#bfcdbb', skirt:'#aebfac', trim:'#789381', accent:'#f3eddc', build:.91},
  tanchun: {name:'探春',   role:'三姑娘',   seal:'探', skin:'#efd1b1', hair:'#241f1c', robe:'#c47b57', robe2:'#a76043', skirt:'#8b4a39', trim:'#e2c180', accent:'#f2e2bf', build:.98},
  baochai: {name:'薛宝钗', role:'蘅芜苑主人', seal:'薛', skin:'#f0d5ba', hair:'#25211e', robe:'#e5dcc6', robe2:'#cec4aa', skirt:'#b4aa91', trim:'#829796', accent:'#f6efdf', build:1.0},
  yuanyang:{name:'鸳鸯',   role:'贾母的大丫头', seal:'鸳', skin:'#efd0af', hair:'#211d1b', robe:'#b96772', robe2:'#9b4d5a', skirt:'#81404c', trim:'#dfbd82', accent:'#f0ddbd', build:.96},
  wang:    {name:'王夫人', role:'荣府太太', seal:'王', skin:'#e3c3a4', hair:'#302a25', robe:'#4d586a', robe2:'#3b4658', skirt:'#333c4c', trim:'#9e8974', accent:'#d9cbb5', build:1.0},
  xue:     {name:'薛姨妈', role:'宝钗之母', seal:'薛', skin:'#e5c5a6', hair:'#3a3029', robe:'#75545c', robe2:'#5e424b', skirt:'#4b343c', trim:'#c7a67c', accent:'#e5d1b7', build:1.0},
  xichun:  {name:'惜春',   role:'四姑娘',   seal:'惜', skin:'#f1d5b9', hair:'#282321', robe:'#d8c78e', robe2:'#c0ad76', skirt:'#a18f5d', trim:'#899a76', accent:'#f2e7c8', build:.92},
  xiangyun:{name:'史湘云', role:'史大姑娘', seal:'史', skin:'#efd1b1', hair:'#241f1c', robe:'#b1403d', robe2:'#93302f', skirt:'#77292b', trim:'#d9b56b', accent:'#f1ddbb', build:.98},
  baoyu:   {name:'贾宝玉', role:'怡红公子', seal:'宝', skin:'#edceb0', hair:'#241f1d', robe:'#a94440', robe2:'#8d3131', skirt:'#75292c', trim:'#d8b46e', accent:'#f2dfb9', build:.97},
  baner:   {name:'板儿',   role:'刘姥姥的孙子', seal:'板', skin:'#d7ad87', hair:'#2a211b', robe:'#7d6a50', robe2:'#66543e', skirt:'#5a4936', trim:'#b49a72', accent:'#e5d4b5', age:'child', build:.64},
  narrator:{name:'旁白',   role:'', seal:'记', skin:'#e6c9a8', hair:'#2a2621', robe:'#7b6d58', robe2:'#615340', skirt:'#534634', trim:'#b9a078', accent:'#eee0c4', build:1}
};

const ROLE_ORDER = ['jia','liu','feng','xichun','daiyu','wang','tanchun','yuanyang','baochai','xue','xiangyun','baoyu','baner'];

/* Draw a stylized 工笔 figure at foot position. */
function drawFigure(c,id,x,y,scale=1,facing=1,time=0,pose='stand',mood='calm',alpha=1){
  const ch = CHARS[id] || CHARS.liu;
  const s = scale * (ch.build || 1);
  const bob = pose==='walk' ? Math.sin(time*10 + x*.02)*1.3 : Math.sin(time*1.8 + x*.013)*.55;
  c.save();
  c.globalAlpha = alpha;
  // soft ink shadow
  c.fillStyle = 'rgba(37,31,22,.18)';
  ellipse(c,x,y+3,37*s,8.5*s); c.fill();
  c.translate(x,y+bob);
  c.scale(facing*s,s);
  const female = id!=='baner' && id!=='baoyu' && id!=='narrator';
  const old = ch.age==='old' || ch.age==='elder';
  const child = ch.age==='child';

  // back hair / headdress silhouette
  c.fillStyle = ch.hair;
  if(female || id==='baoyu'){
    c.beginPath();
    c.ellipse(0,-145,20,24,0,0,TAU);
    c.fill();
    if(id==='daiyu'){
      c.beginPath(); c.moveTo(-13,-140); c.quadraticCurveTo(-29,-94,-18,-58); c.quadraticCurveTo(-7,-87,-6,-126); c.fill();
      c.beginPath(); c.moveTo(13,-140); c.quadraticCurveTo(28,-101,18,-66); c.quadraticCurveTo(8,-92,6,-126); c.fill();
    }
  }

  // back sleeve
  c.strokeStyle = ch.robe2; c.lineWidth = 14; c.lineCap='round';
  c.beginPath(); c.moveTo(-24,-104); c.quadraticCurveTo(-42,-84,-35,-61); c.stroke();
  c.beginPath(); c.moveTo(24,-104); c.quadraticCurveTo(41,-84,34,-63); c.stroke();

  // skirt
  const hem = child ? 20 : 43;
  c.fillStyle = ch.skirt;
  c.beginPath();
  c.moveTo(-16,-73);
  c.quadraticCurveTo(-25,-42,-hem,-1);
  c.quadraticCurveTo(-8,4,0,2);
  c.quadraticCurveTo(8,4,hem,-1);
  c.quadraticCurveTo(25,-42,16,-73);
  c.closePath(); c.fill();
  c.strokeStyle='rgba(43,36,27,.4)'; c.lineWidth=1; c.stroke();
  // skirt folds
  c.strokeStyle='rgba(245,231,202,.2)'; c.lineWidth=1.1;
  for(const fx of [-23,-10,11,23]){
    c.beginPath(); c.moveTo(fx*.45,-68); c.quadraticCurveTo(fx*.8,-36,fx,0); c.stroke();
  }
  // hem band
  c.strokeStyle=ch.trim; c.lineWidth=2.2; c.beginPath(); c.moveTo(-hem+4,-6); c.quadraticCurveTo(0,-1,hem-4,-6); c.stroke();

  // torso
  c.fillStyle = ch.robe;
  c.beginPath();
  if(old){
    c.moveTo(-16,-125); c.quadraticCurveTo(-29,-113,-26,-94);
    c.quadraticCurveTo(-23,-75,-18,-62); c.lineTo(18,-62);
    c.quadraticCurveTo(24,-76,26,-94); c.quadraticCurveTo(29,-113,16,-125);
  } else {
    c.moveTo(-15,-126); c.quadraticCurveTo(-28,-115,-25,-95);
    c.quadraticCurveTo(-23,-77,-17,-62); c.lineTo(17,-62);
    c.quadraticCurveTo(23,-77,25,-95); c.quadraticCurveTo(28,-115,15,-126);
  }
  c.quadraticCurveTo(0,-131,-15,-126); c.closePath(); c.fill();
  c.strokeStyle='rgba(47,38,28,.38)'; c.lineWidth=1; c.stroke();

  // overlapping collar
  c.fillStyle = ch.accent;
  c.beginPath(); c.moveTo(-12,-126); c.lineTo(0,-113); c.lineTo(12,-126); c.lineTo(6,-132); c.lineTo(0,-124); c.lineTo(-6,-132); c.closePath(); c.fill();
  c.fillStyle = ch.trim; c.beginPath(); c.moveTo(-13,-123); c.lineTo(0,-107); c.lineTo(3,-110); c.lineTo(-9,-128); c.closePath(); c.fill();
  // belt
  c.fillStyle = ch.trim; c.fillRect(-19,-84,38,5);
  c.fillStyle = 'rgba(54,38,24,.32)'; c.fillRect(-3,-84,6,5);

  // embroidery at lower robe
  c.strokeStyle = ch.trim; c.globalAlpha = alpha*.7; c.lineWidth=1.2;
  c.beginPath(); c.arc(-15,-48,5,0,TAU); c.stroke();
  c.beginPath(); c.arc(15,-48,5,0,TAU); c.stroke();
  c.globalAlpha = alpha;

  // sleeves
  c.fillStyle = ch.robe2;
  c.beginPath(); c.moveTo(-22,-111); c.quadraticCurveTo(-41,-92,-38,-69); c.quadraticCurveTo(-31,-62,-25,-71); c.quadraticCurveTo(-20,-86,-15,-97); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(22,-111); c.quadraticCurveTo(40,-92,37,-70); c.quadraticCurveTo(31,-63,25,-72); c.quadraticCurveTo(20,-86,15,-97); c.closePath(); c.fill();
  c.strokeStyle = ch.trim; c.lineWidth=1.1;
  c.beginPath(); c.moveTo(-38,-75); c.quadraticCurveTo(-33,-67,-26,-72); c.stroke();
  c.beginPath(); c.moveTo(37,-76); c.quadraticCurveTo(32,-67,26,-73); c.stroke();

  // hands
  c.fillStyle = ch.skin;
  ellipse(c,-37,-63,5,6,.25); c.fill();
  ellipse(c,36,-64,5,6,-.25); c.fill();

  // neck and face
  c.fillStyle = ch.skin;
  c.fillRect(-6,-135,12,14);
  c.beginPath(); c.ellipse(0,-148,15.5,18,0,0,TAU); c.fill();
  c.strokeStyle='rgba(93,65,45,.4)'; c.lineWidth=.9; c.stroke();

  // ears
  c.fillStyle = ch.skin; ellipse(c,-15,-148,3.2,4.5); c.fill(); ellipse(c,15,-148,3.2,4.5); c.fill();

  // hairline
  c.fillStyle = ch.hair;
  c.beginPath();
  c.moveTo(-15,-155); c.quadraticCurveTo(-9,-170,0,-170); c.quadraticCurveTo(10,-170,15,-155);
  c.quadraticCurveTo(9,-162,0,-162); c.quadraticCurveTo(-9,-162,-15,-155); c.closePath(); c.fill();
  // side locks
  c.beginPath(); c.moveTo(-15,-158); c.quadraticCurveTo(-19,-143,-14,-132); c.quadraticCurveTo(-10,-144,-11,-155); c.fill();
  c.beginPath(); c.moveTo(15,-158); c.quadraticCurveTo(19,-143,14,-132); c.quadraticCurveTo(10,-144,11,-155); c.fill();

  if(old){
    // white hair, forehead band, wrinkles
    c.fillStyle = ch.hair;
    c.beginPath(); c.ellipse(0,-162,18,12,0,Math.PI,TAU); c.fill();
    c.fillStyle = ch.trim; c.fillRect(-16,-158,32,3.4);
    c.strokeStyle='rgba(120,78,55,.45)'; c.lineWidth=.9;
    c.beginPath(); c.moveTo(-9,-142); c.quadraticCurveTo(-6,-140,-3,-142); c.stroke();
    c.beginPath(); c.moveTo(3,-142); c.quadraticCurveTo(6,-140,9,-142); c.stroke();
    if(id==='jia'){
      c.fillStyle='#e8dcc3'; c.beginPath(); c.ellipse(0,-171,14,8,0,Math.PI,TAU); c.fill();
      c.fillStyle='#7d8f6d'; c.beginPath(); c.arc(13,-170,3.4,0,TAU); c.fill();
    }
    if(id==='liu'){
      // headscarf
      c.fillStyle='#435966';
      c.beginPath(); c.moveTo(-18,-158); c.quadraticCurveTo(-20,-180,0,-181); c.quadraticCurveTo(20,-180,18,-158);
      c.quadraticCurveTo(8,-166,0,-166); c.quadraticCurveTo(-8,-166,-18,-158); c.fill();
      c.strokeStyle='rgba(230,214,180,.45)'; c.lineWidth=1;
      c.beginPath(); c.moveTo(-15,-169); c.quadraticCurveTo(0,-173,15,-169); c.stroke();
      c.fillStyle='#435966'; c.beginPath(); c.moveTo(15,-160); c.quadraticCurveTo(26,-154,22,-144); c.lineTo(16,-150); c.fill();
    }
  } else {
    // young hair ornaments
    c.fillStyle = ch.hair;
    c.beginPath(); c.ellipse(0,-164,14,9,0,Math.PI,TAU); c.fill();
    if(female){
      c.strokeStyle=ch.trim; c.lineWidth=1.8;
      c.beginPath(); c.moveTo(-11,-166); c.lineTo(12,-169); c.stroke();
      c.fillStyle=ch.trim; c.beginPath(); c.arc(12,-169,2.6,0,TAU); c.fill();
      c.fillStyle= id==='feng' ? '#c53f38' : '#a96058';
      c.beginPath(); c.arc(-12,-167,2.2,0,TAU); c.fill();
    }
    if(id==='baoyu'){
      c.fillStyle='#4c7563'; c.beginPath(); c.arc(0,-158,2.8,0,TAU); c.fill();
      c.strokeStyle='#b8935b'; c.lineWidth=1; c.beginPath(); c.arc(0,-158,4.3,0,TAU); c.stroke();
    }
  }

  // facial features
  c.strokeStyle='#3a2b22'; c.lineWidth=1.15; c.lineCap='round';
  const eyeY=-150;
  const eyeOpen = mood==='laugh' ? .2 : 1;
  c.beginPath(); c.moveTo(-10,eyeY); c.quadraticCurveTo(-7,eyeY-2.2*eyeOpen,-4,eyeY); c.stroke();
  c.beginPath(); c.moveTo(4,eyeY); c.quadraticCurveTo(7,eyeY-2.2*eyeOpen,10,eyeY); c.stroke();
  c.fillStyle='#2b211b';
  if(mood!=='laugh'){
    c.beginPath(); c.arc(-7,eyeY-.2,1,0,TAU); c.fill();
    c.beginPath(); c.arc(7,eyeY-.2,1,0,TAU); c.fill();
  }
  // brows
  c.strokeStyle='rgba(58,42,31,.7)'; c.lineWidth=1;
  c.beginPath(); c.moveTo(-11,-155); c.quadraticCurveTo(-7,-157,-4,-155); c.stroke();
  c.beginPath(); c.moveTo(4,-155); c.quadraticCurveTo(7,-157,11,-155); c.stroke();
  // nose
  c.strokeStyle='rgba(138,91,63,.5)'; c.lineWidth=.85;
  c.beginPath(); c.moveTo(0,-149); c.lineTo(1,-144); c.stroke();
  // mouth
  c.strokeStyle= id==='feng' ? '#9d3b37' : '#a45d55';
  c.lineWidth=1.25;
  c.beginPath();
  if(mood==='laugh'){ c.arc(0,-140,4,0,Math.PI); }
  else if(mood==='smile'){ c.moveTo(-3,-140); c.quadraticCurveTo(0,-138,3,-140); }
  else { c.moveTo(-3,-140); c.quadraticCurveTo(0,-139.5,3,-140); }
  c.stroke();
  // blush
  c.fillStyle='rgba(177,95,74,.1)'; ellipse(c,-10,-145,4,2.4); c.fill(); ellipse(c,10,-145,4,2.4); c.fill();

  // accessories: cane for 贾母, basket for 刘姥姥
  if(id==='jia'){
    c.strokeStyle='#6b4d31'; c.lineWidth=3;
    c.beginPath(); c.moveTo(38,-65); c.lineTo(47,-1); c.stroke();
    c.strokeStyle='#b3935c'; c.lineWidth=2; c.beginPath(); c.arc(38,-70,4,0,TAU); c.stroke();
  }
  if(id==='liu'){
    c.strokeStyle='#9b825c'; c.lineWidth=1.8;
    c.beginPath(); c.arc(-44,-44,11,0,Math.PI); c.stroke();
    c.beginPath(); c.moveTo(-55,-43); c.lineTo(-52,-25); c.moveTo(-33,-43); c.lineTo(-36,-25); c.stroke();
    c.beginPath(); c.moveTo(-55,-25); c.quadraticCurveTo(-44,-20,-33,-25); c.stroke();
    c.fillStyle='#738a5a'; c.beginPath(); c.arc(-45,-45,3,0,TAU); c.fill();
  }
  if(id==='baner'){
    c.fillStyle='#d7b66e'; c.beginPath(); c.ellipse(-28,-45,5.5,6,0.3,0,TAU); c.fill();
    c.strokeStyle='#8d7b45'; c.lineWidth=.8; c.stroke();
  }
  c.restore();
}

/* portrait painter */
function drawPortrait(id){
  const c = $('portrait').getContext('2d');
  c.clearRect(0,0,196,236);
  const ch=CHARS[id]||CHARS.liu;
  if(id==='narrator'){
    c.fillStyle='rgba(233,222,199,.4)'; c.fillRect(0,0,196,236);
    c.strokeStyle='rgba(121,91,54,.4)'; c.lineWidth=1;
    c.beginPath(); c.arc(98,104,54,0,TAU); c.stroke();
    c.beginPath(); c.arc(98,104,61,0,TAU); c.stroke();
    c.fillStyle='#5a4b3a'; c.font='42px '+SERIF; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('记',98,106);
    c.font='13px '+SANS; c.fillStyle='#8a765a'; c.fillText('此 间 旧 事',98,182);
    return;
  }
  // atmospheric wash
  c.fillStyle='rgba(235,224,201,.44)'; c.fillRect(0,0,196,236);
  c.fillStyle=radial(c,98,115,110,[[0,'rgba(255,250,238,.75)'],[.7,'rgba(229,214,186,.3)'],[1,'rgba(229,214,186,0)']]);
  c.fillRect(0,0,196,236);
  // faint foliage
  c.strokeStyle='rgba(89,108,80,.18)'; c.lineWidth=2;
  for(let i=0;i<4;i++){c.beginPath();c.moveTo(155+i*9,0);c.quadraticCurveTo(130+i*5,90,168+i*4,236);c.stroke();}
  c.save();
  c.beginPath(); c.rect(0,0,196,236); c.clip();
  drawFigure(c,id,99,254,1.46,1,0,'stand','calm',1);
  c.restore();
  // vignette
  const vg=c.createLinearGradient(0,0,0,236);
  vg.addColorStop(0,'rgba(243,234,216,.12)'); vg.addColorStop(.7,'rgba(243,234,216,0)'); vg.addColorStop(1,'rgba(232,218,193,.7)');
  c.fillStyle=vg; c.fillRect(0,0,196,236);
}

/* ============================================================
   Painted backgrounds (all generated with canvas)
   ============================================================ */
function paperWash(c,w,h,tint='#f1e5ca'){
  c.fillStyle=tint; c.fillRect(0,0,w,h);
  const g=c.createLinearGradient(0,0,w,h);
  g.addColorStop(0,'rgba(255,250,235,.24)'); g.addColorStop(.55,'rgba(255,255,255,0)'); g.addColorStop(1,'rgba(127,98,58,.08)');
  c.fillStyle=g; c.fillRect(0,0,w,h);
}
function paperGrain(c,w,h,seed=7,amount=900){
  const r=mulberry32(seed);
  c.save();
  for(let i=0;i<amount;i++){
    const x=r()*w,y=r()*h,a=r()*.055;
    c.fillStyle=r()>.5?`rgba(93,72,44,${a})`:`rgba(255,253,244,${a*1.4})`;
    c.fillRect(x,y,r()*2+.3,r()*1.2+.3);
  }
  // long fibres
  c.strokeStyle='rgba(120,92,54,.035)'; c.lineWidth=.55;
  for(let i=0;i<70;i++){
    const x=r()*w,y=r()*h,l=12+r()*80;
    c.beginPath(); c.moveTo(x,y); c.quadraticCurveTo(x+l*.5,y+(r()-.5)*4,x+l,y+(r()-.5)*3); c.stroke();
  }
  c.restore();
}
function inkMountain(c,x,y,w,h,col,seed=1){
  const r=mulberry32(seed);
  c.save(); c.fillStyle=col;
  c.beginPath(); c.moveTo(x-w*.55,y+h);
  c.quadraticCurveTo(x-w*.3,y+h*.1,x-w*.1,y+h*.45);
  c.quadraticCurveTo(x+w*.05,y-h*.25,x+w*.24,y+h*.18);
  c.quadraticCurveTo(x+w*.36,y-h*.1,x+w*.55,y+h);
  c.closePath(); c.fill();
  c.strokeStyle='rgba(71,74,62,.18)'; c.lineWidth=1.2;
  for(let i=0;i<8;i++){
    const sx=x-w*.35+r()*w*.7, sy=y+h*.25+r()*h*.6;
    c.beginPath(); c.moveTo(sx,sy); c.quadraticCurveTo(sx+9,sy-14,sx+22,sy-20); c.stroke();
  }
  c.restore();
}
function drawWillow(c,x,groundY,scale,time=0,col='#71805b',sway=1){
  c.save(); c.translate(x,groundY); c.scale(scale,scale);
  c.strokeStyle='#594a34'; c.lineWidth=9; c.lineCap='round';
  c.beginPath(); c.moveTo(0,0); c.bezierCurveTo(-4,-70,14,-120,-3,-186); c.stroke();
  c.lineWidth=4;
  c.beginPath(); c.moveTo(-2,-146); c.quadraticCurveTo(-42,-174,-70,-162); c.stroke();
  c.beginPath(); c.moveTo(0,-165); c.quadraticCurveTo(42,-195,76,-174); c.stroke();
  const r=mulberry32(33);
  for(let i=0;i<30;i++){
    const bx=-88+r()*178, by=-202+r()*57;
    const len=48+r()*90;
    const sw=(r()-.5)*7;
    c.strokeStyle= i%3===0 ? 'rgba(90,101,69,.48)' : 'rgba(111,120,83,.4)';
    c.lineWidth=1.2;
    c.beginPath(); c.moveTo(bx,by);
    c.bezierCurveTo(bx+sw,by+len*.35,bx-sw,by+len*.7,bx+sw*.5,by+len); c.stroke();
    for(let j=0;j<4;j++){
      const yy=by+len*(.28+j*.18), xx=bx+Math.sin(j*2+i)*5;
      c.fillStyle=`rgba(103,118,76,${.42+r()*.25})`;
      c.beginPath(); c.ellipse(xx+3,yy,3.8,1.4,.55,0,TAU); c.fill();
      c.beginPath(); c.ellipse(xx-3,yy+3,3.4,1.3,-.6,0,TAU); c.fill();
    }
  }
  c.restore();
}
function drawBamboo(c,x,groundY,scale,seed=1,dark=false){
  const r=mulberry32(seed);
  c.save(); c.translate(x,groundY); c.scale(scale,scale);
  for(let i=0;i<8;i++){
    const bx=-70+r()*140, bh=160+r()*180, lean=(r()-.5)*35;
    c.strokeStyle=dark?`rgba(44,69,51,${.45+r()*.3})`:`rgba(77,103,67,${.42+r()*.28})`;
    c.lineWidth=2.4+r()*2;
    c.beginPath(); c.moveTo(bx,0); c.quadraticCurveTo(bx+lean*.4,-bh*.55,bx+lean,-bh); c.stroke();
    for(let j=1;j<6;j++){
      const yy=-bh*j/6, xx=bx+lean*(j/6);
      c.strokeStyle='rgba(38,58,41,.35)'; c.lineWidth=1;
      c.beginPath(); c.moveTo(xx-3,yy); c.lineTo(xx+3,yy); c.stroke();
      if(r()>.25){
        c.strokeStyle=dark?'rgba(52,79,56,.55)':'rgba(78,105,69,.55)'; c.lineWidth=1.1;
        const dir=r()>.5?1:-1, ll=22+r()*27;
        c.beginPath(); c.moveTo(xx,yy); c.quadraticCurveTo(xx+dir*ll*.55,yy-6,xx+dir*ll,yy-2); c.stroke();
        for(let k=0;k<3;k++){
          c.fillStyle=dark?'rgba(54,85,57,.42)':'rgba(84,112,71,.4)';
          c.beginPath(); c.ellipse(xx+dir*(ll*.55+k*6),yy-3-k*1.6,7,1.6,dir*.3,0,TAU); c.fill();
        }
      }
    }
  }
  c.restore();
}
function drawRoof(c,x,y,w,h,col='#4d3b31',edge='#2e2621'){
  c.save();
  c.fillStyle=col;
  c.beginPath();
  c.moveTo(x-w*.58,y+h*.1);
  c.quadraticCurveTo(x-w*.52,y-h*.2,x-w*.43,y-h*.22);
  c.lineTo(x+w*.43,y-h*.22);
  c.quadraticCurveTo(x+w*.52,y-h*.2,x+w*.58,y+h*.1);
  c.quadraticCurveTo(x+w*.48,y+h*.02,x+w*.38,y+h*.04);
  c.lineTo(x-w*.38,y+h*.04);
  c.quadraticCurveTo(x-w*.48,y+h*.02,x-w*.58,y+h*.1);
  c.closePath(); c.fill();
  c.strokeStyle=edge; c.lineWidth=1.3; c.stroke();
  c.strokeStyle='rgba(228,211,175,.22)'; c.lineWidth=1;
  for(let i=-6;i<=6;i++){
    c.beginPath(); c.moveTo(x+i*w*.072,y-h*.21); c.quadraticCurveTo(x+i*w*.076,y-h*.05,x+i*w*.067,y+h*.02); c.stroke();
  }
  // ridge
  c.strokeStyle='#241e19'; c.lineWidth=5; c.beginPath(); c.moveTo(x-w*.44,y-h*.22); c.lineTo(x+w*.44,y-h*.22); c.stroke();
  c.strokeStyle='#8d6b47'; c.lineWidth=1.4; c.beginPath(); c.moveTo(x-w*.44,y-h*.24); c.lineTo(x+w*.44,y-h*.24); c.stroke();
  // eave tips
  c.strokeStyle='#332822'; c.lineWidth=4;
  c.beginPath(); c.moveTo(x-w*.58,y+h*.1); c.quadraticCurveTo(x-w*.67,y-h*.03,x-w*.7,y-h*.12); c.stroke();
  c.beginPath(); c.moveTo(x+w*.58,y+h*.1); c.quadraticCurveTo(x+w*.67,y-h*.03,x+w*.7,y-h*.12); c.stroke();
  c.restore();
}
function drawPillar(c,x,y,h,w=12,col='#8e3d37',dark='#5f2927'){
  const gr=linear(c,x-w,y,x+w,y,[[0,dark],[.35,col],[.68,col],[1,dark]]);
  c.fillStyle=gr; c.fillRect(x-w/2,y-h,w,h);
  c.fillStyle='rgba(47,29,22,.25)'; c.fillRect(x+w/2-2,y-h,2,h);
  c.fillStyle='#b08b52'; c.fillRect(x-w/2-3,y-7,w+6,7);
  c.fillStyle='#6b4e32'; c.fillRect(x-w/2-3,y-1,w+6,3);
}
function drawLantern(c,x,y,s=1,glow=true,time=0){
  if(glow){
    c.fillStyle=radial(c,x,y,80*s,[[0,'rgba(255,183,94,.2)'],[1,'rgba(255,183,94,0)']]);
    c.fillRect(x-80*s,y-80*s,160*s,160*s);
  }
  c.strokeStyle='#4f2c22'; c.lineWidth=1.2;
  c.beginPath(); c.moveTo(x,y-62*s); c.lineTo(x,y-40*s); c.stroke();
  c.fillStyle='#b83d32';
  c.beginPath(); c.ellipse(x,y,21*s,27*s,0,0,TAU); c.fill();
  c.strokeStyle='rgba(244,206,135,.65)'; c.lineWidth=1;
  for(let i=-2;i<=2;i++){ c.beginPath(); c.ellipse(x,y,Math.abs(i)*7*s+3*s,27*s,0,0,TAU); c.stroke(); }
  c.fillStyle='#d9ae61'; c.fillRect(x-11*s,y-29*s,22*s,4*s); c.fillRect(x-11*s,y+25*s,22*s,4*s);
  c.strokeStyle='#c9a25b'; c.lineWidth=1.4;
  c.beginPath(); c.moveTo(x,y+29*s); c.lineTo(x,y+41*s); c.stroke();
  c.fillStyle='#9d3129'; c.beginPath(); c.moveTo(x-4*s,y+40*s); c.lineTo(x+4*s,y+40*s); c.lineTo(x,y+53*s); c.fill();
}
function drawChrysanthemum(c,x,y,s,col='#e7c76e',center='#aa8437',petals=14){
  c.save(); c.translate(x,y); c.scale(s,s);
  c.strokeStyle='rgba(90,84,52,.4)'; c.lineWidth=1;
  c.beginPath(); c.moveTo(0,8); c.quadraticCurveTo(-3,25,2,40); c.stroke();
  c.fillStyle='rgba(91,111,72,.8)';
  c.beginPath(); c.ellipse(-7,30,8,3,-.4,0,TAU); c.fill();
  c.beginPath(); c.ellipse(7,34,8,3,.35,0,TAU); c.fill();
  for(let layer=2;layer>=0;layer--){
    const rad=8+layer*4;
    for(let i=0;i<petals;i++){
      const a=i/petals*TAU+layer*.2;
      c.fillStyle=layer===2?col:layer===1?'#f0d588':'#f7e5b1';
      c.beginPath();
      c.ellipse(Math.cos(a)*rad*.58,Math.sin(a)*rad*.58,rad*.52,2.2,a,0,TAU); c.fill();
      c.strokeStyle='rgba(133,99,48,.18)'; c.lineWidth=.4; c.stroke();
    }
  }
  c.fillStyle=center; c.beginPath(); c.arc(0,0,4.2,0,TAU); c.fill();
  c.restore();
}
function drawVase(c,x,y,s=1,col='#8ea7a1'){
  c.save(); c.translate(x,y); c.scale(s,s);
  c.fillStyle=linear(c,-25,-70,25,0,[[0,'#e4eee7'],[.4,col],[1,'#577068']]);
  c.beginPath(); c.moveTo(-6,-74); c.quadraticCurveTo(-12,-64,-15,-54); c.quadraticCurveTo(-31,-33,-22,-8); c.quadraticCurveTo(-12,4,0,4); c.quadraticCurveTo(12,4,22,-8); c.quadraticCurveTo(31,-33,15,-54); c.quadraticCurveTo(12,-64,6,-74); c.closePath(); c.fill();
  c.strokeStyle='rgba(49,71,66,.5)'; c.lineWidth=1; c.stroke();
  c.strokeStyle='rgba(255,255,255,.35)'; c.lineWidth=2; c.beginPath(); c.moveTo(-15,-38); c.quadraticCurveTo(-3,-29,14,-37); c.stroke();
  c.restore();
}
function drawRock(c,x,baseY,w,h,seed=3,tint='#7e8378'){
  const r=mulberry32(seed);
  c.save();
  c.fillStyle=linear(c,x-w/2,baseY-h,x+w/2,baseY,[[0,'#a9a99b'],[.45,tint],[1,'#5f645b']]);
  c.beginPath(); c.moveTo(x-w*.55,baseY);
  c.lineTo(x-w*.48,baseY-h*.46);
  c.quadraticCurveTo(x-w*.37,baseY-h*.62,x-w*.3,baseY-h*.82);
  c.quadraticCurveTo(x-w*.17,baseY-h*.98,x-w*.04,baseY-h*.86);
  c.quadraticCurveTo(x+w*.09,baseY-h*1.04,x+w*.22,baseY-h*.79);
  c.quadraticCurveTo(x+w*.33,baseY-h*.68,x+w*.39,baseY-h*.4);
  c.lineTo(x+w*.55,baseY); c.closePath(); c.fill();
  c.strokeStyle='rgba(54,57,50,.35)'; c.lineWidth=1;
  for(let i=0;i<12;i++){
    const sx=x-w*.35+r()*w*.7, sy=baseY-h*.4-r()*h*.45;
    c.beginPath(); c.moveTo(sx,sy); c.quadraticCurveTo(sx+7,sy+8,sx+12,sy+22); c.stroke();
  }
  c.fillStyle='rgba(103,120,80,.18)'; c.beginPath(); c.ellipse(x-w*.2,baseY-h*.6,20,8,-.5,0,TAU); c.fill();
  c.restore();
}
function drawVines(c,x,y,w,h,seed=8,col='#667a58'){
  const r=mulberry32(seed);
  c.save(); c.strokeStyle=col; c.lineWidth=1.4;
  for(let i=0;i<10;i++){
    const sx=x+r()*w, sy=y+r()*h*.3, len=35+r()*h*.6;
    c.beginPath(); c.moveTo(sx,sy); c.bezierCurveTo(sx+(r()-.5)*35,sy+len*.35,sx+(r()-.5)*45,sy+len*.7,sx+(r()-.5)*22,sy+len); c.stroke();
    for(let j=0;j<5;j++){
      const yy=sy+len*(j/5), xx=sx+Math.sin(j+i)*10;
      c.fillStyle=`rgba(88,109,74,${.35+r()*.25})`;
      c.beginPath(); c.ellipse(xx+4,yy,5.5,2,0.5,0,TAU); c.fill();
      c.beginPath(); c.ellipse(xx-4,yy+4,5,1.8,-.5,0,TAU); c.fill();
    }
  }
  c.restore();
}
function drawHangingScroll(c,x,y,w,h,title='',col='#d9d0b8'){
  c.fillStyle='#584a37'; c.fillRect(x-4,y-12,w+8,6); c.fillRect(x-4,y+h+6,w+8,6);
  c.fillStyle=col; c.fillRect(x,y,w,h);
  c.strokeStyle='rgba(95,79,55,.4)'; c.lineWidth=1; c.strokeRect(x,y,w,h);
  c.fillStyle='rgba(243,238,224,.35)'; c.fillRect(x+5,y+5,w-10,h-10);
  if(title){
    c.save(); c.fillStyle='#4a4032'; c.font='18px '+SERIF; c.textAlign='center'; c.textBaseline='middle';
    const chars=[...title];
    chars.forEach((ch,i)=>c.fillText(ch,x+w/2,y+28+i*27));
    c.restore();
  }
}
function drawWindowLattice(c,x,y,w,h,col='#5f4632'){
  c.fillStyle=col; c.fillRect(x,y,w,h);
  c.fillStyle='#e5dbc3'; c.fillRect(x+8,y+8,w-16,h-16);
  c.strokeStyle='rgba(85,64,43,.7)'; c.lineWidth=2;
  const cols=6,rows=4;
  for(let i=1;i<cols;i++){ c.beginPath(); c.moveTo(x+8+(w-16)*i/cols,y+8); c.lineTo(x+8+(w-16)*i/cols,y+h-8); c.stroke(); }
  for(let j=1;j<rows;j++){ c.beginPath(); c.moveTo(x+8,y+8+(h-16)*j/rows); c.lineTo(x+w-8,y+8+(h-16)*j/rows); c.stroke(); }
  c.strokeStyle='rgba(255,255,255,.25)'; c.lineWidth=4; c.strokeRect(x+4,y+4,w-8,h-8);
}
function drawWater(c,x,y,w,h,top='#8ea8a0',bottom='#506f6b'){
  c.fillStyle=linear(c,0,y,0,y+h,[[0,top],[1,bottom]]); c.fillRect(x,y,w,h);
  c.save(); c.globalAlpha=.35; c.strokeStyle='#e8e2cc'; c.lineWidth=1;
  for(let i=0;i<24;i++){
    const yy=y+8+i*(h-12)/24, xx=x+((i*97)%Math.max(1,w-140));
    c.beginPath(); c.moveTo(xx,yy); c.quadraticCurveTo(xx+35,yy+3,xx+70,yy); c.stroke();
  }
  c.restore();
}
function drawStonePath(c,x,y,w,h,seed=2){
  const r=mulberry32(seed);
  c.save(); c.fillStyle='#9b9784'; c.fillRect(x,y,w,h);
  for(let i=0;i<42;i++){
    const sx=x+r()*w, sy=y+r()*h;
    c.fillStyle=`rgba(${120+r()*35|0},${118+r()*32|0},${103+r()*26|0},.55)`;
    c.beginPath(); c.ellipse(sx,sy,8+r()*17,4+r()*8,r()*3,0,TAU); c.fill();
  }
  c.fillStyle='rgba(86,105,74,.32)';
  for(let i=0;i<18;i++){ c.beginPath(); c.ellipse(x+r()*w,y+r()*h,3+r()*6,2+r()*3,0,0,TAU); c.fill(); }
  c.restore();
}
function drawDishes(c,x,y,w,seed=5){
  const r=mulberry32(seed);
  for(let i=0;i<7;i++){
    const dx=x+20+i*(w-40)/6, dy=y+(i%2?4:-3);
    c.fillStyle='#ddd1b6'; c.beginPath(); c.ellipse(dx,dy,15,5,0,0,TAU); c.fill();
    c.strokeStyle='#8a7357'; c.lineWidth=.8; c.stroke();
    c.fillStyle=i%3===0?'#9f4d39':i%3===1?'#bd9d52':'#6e8151';
    c.beginPath(); c.ellipse(dx,dy-2,10,3.3,0,0,TAU); c.fill();
  }
}
function drawBanquetTable(c,x,y,w,seed=1){
  c.fillStyle=linear(c,0,y,0,y+115,[[0,'#8f3a30'],[.4,'#7b2f2a'],[1,'#4e201e']]);
  c.beginPath(); c.moveTo(x,y); c.lineTo(x+w,y); c.lineTo(x+w-8,y+108); c.lineTo(x+8,y+108); c.closePath(); c.fill();
  c.strokeStyle='#b08b52'; c.lineWidth=2; c.beginPath(); c.moveTo(x,y+2); c.lineTo(x+w,y+2); c.stroke();
  c.fillStyle='rgba(249,225,172,.14)';
  for(let i=0;i<8;i++) c.fillRect(x+12+i*(w-24)/8,y+8,1,92);
  // dishes and wine
  c.fillStyle='#d8c8a7'; c.fillRect(x+30,y-5,w-60,5);
  drawDishes(c,x+36,y-8,w-72,seed);
  c.fillStyle='#c8b88d'; c.beginPath(); c.ellipse(x+w*.28,y-8,9,3,0,0,TAU); c.fill();
  c.fillStyle='#7d8f73'; c.beginPath(); c.ellipse(x+w*.7,y-8,8,3,0,0,TAU); c.fill();
}

function paintTitle(c){
  paperWash(c,W,H,'#c9b894');
  // dusk sky
  c.fillStyle=linear(c,0,0,0,H,[[0,'#8e8872'],[.32,'#c7b28e'],[.67,'#d7bd91'],[1,'#8e8267']]);
  c.fillRect(0,0,W,H);
  const mg=c.createRadialGradient(1010,150,12,1010,150,150);
  mg.addColorStop(0,'rgba(255,249,220,.95)'); mg.addColorStop(.38,'rgba(250,230,177,.7)'); mg.addColorStop(1,'rgba(250,230,177,0)');
  c.fillStyle=mg; c.fillRect(820,0,390,340);
  c.fillStyle='rgba(249,237,196,.86)'; c.beginPath(); c.arc(1010,150,70,0,TAU); c.fill();
  inkMountain(c,170,220,300,180,'rgba(91,95,80,.26)',12);
  inkMountain(c,420,235,340,210,'rgba(82,89,76,.3)',4);
  inkMountain(c,1160,230,330,210,'rgba(71,81,69,.32)',9);
  // distant tower
  drawRoof(c,1035,172,190,52,'#4c4035');
  c.fillStyle='#5e4b3d'; c.fillRect(985,178,100,105);
  c.fillStyle='rgba(223,195,144,.3)'; c.fillRect(1002,192,66,8); c.fillRect(1002,218,66,8);
  // lake
  drawWater(c,0,400,W,230,'#8c9d8a','#4e665e');
  c.fillStyle='rgba(241,212,154,.18)';
  for(let i=0;i<20;i++){ c.beginPath(); c.ellipse(770+i*14+i*i*.4,390+i*8,40,2,0,0,TAU); c.fill(); }
  // stone bank and terrace
  c.fillStyle='#a8a18a'; c.beginPath(); c.moveTo(0,538); c.quadraticCurveTo(400,500,780,532); c.quadraticCurveTo(1060,552,1280,520); c.lineTo(1280,720); c.lineTo(0,720); c.fill();
  drawStonePath(c,560,520,720,200,44);
  // bridge left
  c.strokeStyle='#837b68'; c.lineWidth=14;
  c.beginPath(); c.moveTo(0,480); c.quadraticCurveTo(190,438,390,488); c.stroke();
  c.strokeStyle='#c9c0a7'; c.lineWidth=3;
  c.beginPath(); c.moveTo(0,472); c.quadraticCurveTo(190,430,390,480); c.stroke();
  c.strokeStyle='#6e6553'; c.lineWidth=4;
  for(let i=0;i<10;i++){ const x=15+i*39,y=474-Math.sin(i/9*Math.PI)*31; c.beginPath(); c.moveTo(x,y); c.lineTo(x,y-40); c.stroke(); }
  // pavilion
  c.fillStyle='rgba(94,73,52,.15)'; c.beginPath(); c.ellipse(850,510,260,42,0,0,TAU); c.fill();
  drawRoof(c,880,188,470,75,'#553d32');
  c.fillStyle='#6e4a39'; c.fillRect(690,242,390,20);
  c.fillStyle='#d3b579'; c.fillRect(842,255,96,36);
  c.fillStyle='#5c3a2e'; c.font='25px '+SERIF; c.textAlign='center'; c.textBaseline='middle'; c.fillText('沁 芳 亭',890,275);
  drawPillar(c,685,500,260,14);
  drawPillar(c,745,500,270,12);
  drawPillar(c,1040,500,270,12);
  drawPillar(c,1100,500,260,14);
  // railing
  c.strokeStyle='#71402f'; c.lineWidth=5;
  c.beginPath(); c.moveTo(670,470); c.lineTo(1112,470); c.stroke();
  c.lineWidth=3;
  for(let i=0;i<12;i++){ c.beginPath(); c.moveTo(675+i*39,470); c.lineTo(675+i*39,518); c.stroke(); }
  c.beginPath(); c.moveTo(665,518); c.lineTo(1118,518); c.stroke();
  drawLantern(c,710,290,.8,true);
  drawLantern(c,1070,290,.8,true);
  // hanging willow right and left
  drawWillow(c,1125,525,1.3,0,'#71805b');
  drawWillow(c,68,542,.92,0,'#7f8962');
  // chrysanthemum beds foreground
  const r=mulberry32(66);
  for(let i=0;i<34;i++){
    const x=20+r()*280, y=596+r()*84;
    drawChrysanthemum(c,x,y,.78+r()*.55,i%3===0?'#d9ae52':i%3===1?'#e8cc83':'#f0dfae','#a7823d',12);
  }
  for(let i=0;i<26;i++){
    const x=990+r()*270, y=600+r()*82;
    drawChrysanthemum(c,x,y,.68+r()*.6,i%4===0?'#c67854':'#e1bd6c','#9c743a',12);
  }
  // ink texture / vignette
  paperGrain(c,W,H,8,700);
  c.fillStyle=linear(c,0,0,0,H,[[0,'rgba(47,40,29,.13)'],[.35,'rgba(47,40,29,0)'],[1,'rgba(41,34,24,.22)']]);
  c.fillRect(0,0,W,H);
  c.fillStyle=linear(c,0,0,W,0,[[0,'rgba(30,26,19,.12)'],[.5,'rgba(30,26,19,0)'],[1,'rgba(30,26,19,.1)']]);
  c.fillRect(0,0,W,H);
}

function paintQinfang(c){
  paperWash(c,W,H,'#e9dfc6');
  c.fillStyle=linear(c,0,0,0,430,[[0,'#d8dcc4'],[.55,'#ebe2c7'],[1,'#f2e5c9']]);
  c.fillRect(0,0,W,440);
  inkMountain(c,240,240,290,130,'rgba(108,119,100,.18)',5);
  inkMountain(c,470,245,320,150,'rgba(101,114,96,.2)',11);
  inkMountain(c,980,255,370,170,'rgba(97,110,94,.17)',7);
  // distant tower
  drawRoof(c,190,186,180,44,'rgba(75,65,54,.6)');
  c.fillStyle='rgba(82,69,56,.5)'; c.fillRect(148,190,84,86);
  // pond
  drawWater(c,0,400,W,145,'#9baea2','#637e76');
  c.strokeStyle='rgba(238,231,205,.26)'; c.lineWidth=1;
  for(let i=0;i<20;i++){ c.beginPath(); c.ellipse(160+i*58,430+(i%4)*19,58,2.4,0,0,TAU); c.stroke(); }
  // lotus leaves
  for(let i=0;i<15;i++){
    const x=50+i*83, y=435+(i%3)*21;
    c.fillStyle='rgba(83,110,75,.65)'; c.beginPath(); c.ellipse(x,y,16,6,-.2,0,TAU); c.fill();
    if(i%4===0){c.strokeStyle='rgba(226,208,166,.5)';c.lineWidth=1;c.beginPath();c.moveTo(x,y);c.lineTo(x+7,y-13);c.stroke();}
  }
  // terrace
  c.fillStyle='#b2ab93'; c.beginPath(); c.moveTo(0,535); c.quadraticCurveTo(350,505,700,530); c.quadraticCurveTo(1000,550,1280,518); c.lineTo(1280,720); c.lineTo(0,720); c.closePath(); c.fill();
  drawStonePath(c,540,520,740,200,17);
  // stone bridge left
  c.strokeStyle='#7d7867'; c.lineWidth=18; c.beginPath(); c.moveTo(0,492); c.quadraticCurveTo(170,445,350,500); c.stroke();
  c.strokeStyle='#c5bda5'; c.lineWidth=4; c.beginPath(); c.moveTo(0,483); c.quadraticCurveTo(170,437,350,492); c.stroke();
  c.strokeStyle='#6d6555'; c.lineWidth=4;
  for(let i=0;i<9;i++){ const x=18+i*38,y=478-Math.sin(i/8*Math.PI)*29; c.beginPath(); c.moveTo(x,y); c.lineTo(x,y-35); c.stroke(); }
  c.strokeStyle='#776f5d'; c.lineWidth=3; c.beginPath(); c.moveTo(0,443); c.quadraticCurveTo(170,398,350,453); c.stroke();
  // pavilion
  c.fillStyle='rgba(81,68,49,.13)'; ellipse(c,875,514,252,33); c.fill();
  drawRoof(c,885,165,470,80,'#584135');
  c.fillStyle='#73503e'; c.fillRect(690,225,395,21);
  c.fillStyle='#d5b77b'; c.fillRect(846,238,88,34);
  c.fillStyle='#54382c'; c.font='24px '+SERIF; c.textAlign='center'; c.textBaseline='middle'; c.fillText('沁 芳 亭',890,258);
  drawPillar(c,690,508,283,13,'#8f4038');
  drawPillar(c,748,508,292,11,'#8f4038');
  drawPillar(c,1040,508,292,11,'#8f4038');
  drawPillar(c,1098,508,283,13,'#8f4038');
  c.fillStyle='rgba(60,36,29,.25)'; c.fillRect(690,252,408,8);
  // inner railing
  c.strokeStyle='#783e30'; c.lineWidth=4; c.beginPath(); c.moveTo(676,455); c.lineTo(1112,455); c.stroke();
  for(let i=0;i<12;i++){ c.beginPath(); c.moveTo(680+i*39,455); c.lineTo(680+i*39,508); c.stroke(); }
  c.beginPath(); c.moveTo(670,508); c.lineTo(1118,508); c.stroke();
  drawLantern(c,714,275,.82,true);
  drawLantern(c,1068,275,.82,true);
  // willows
  drawWillow(c,1145,542,1.3,0,'#6d7c58');
  drawWillow(c,78,548,.92,0,'#7d8761');
  // chrysanthemums
  const r=mulberry32(103);
  for(let i=0;i<30;i++){
    const x=13+r()*310, y=590+r()*92;
    drawChrysanthemum(c,x,y,.7+r()*.6,['#d9a94f','#e8c777','#f1dfa9'][i%3],'#a27d3c',13);
  }
  for(let i=0;i<25;i++){
    const x=970+r()*295, y=594+r()*92;
    drawChrysanthemum(c,x,y,.66+r()*.62,['#c97856','#e0bc6b','#ead79e'][i%3],'#9c743a',13);
  }
  // grass strokes
  c.strokeStyle='rgba(88,103,66,.45)'; c.lineWidth=1;
  for(let i=0;i<40;i++){ const x=10+r()*340,y=700; c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+8,y-18,x+2,y-31);c.stroke(); }
  paperGrain(c,W,H,21,780);
  c.fillStyle=linear(c,0,0,0,H,[[0,'rgba(53,44,30,.12)'],[.28,'rgba(53,44,30,0)'],[1,'rgba(46,37,25,.18)']]);
  c.fillRect(0,0,W,H);
  c.fillStyle=linear(c,0,0,W,0,[[0,'rgba(41,34,24,.16)'],[.42,'rgba(41,34,24,0)'],[1,'rgba(41,34,24,.08)']]);
  c.fillRect(0,0,W,H);
}

function paintXiang(c){
  paperWash(c,W,H,'#dfe3cf');
  c.fillStyle=linear(c,0,0,0,H,[[0,'#bbcbb3'],[.36,'#d3ddc9'],[1,'#8fa38a']]);
  c.fillRect(0,0,W,H);
  // mist
  c.fillStyle=radial(c,440,230,300,[[0,'rgba(242,243,226,.5)'],[1,'rgba(242,243,226,0)']]); c.fillRect(100,0,700,500);
  inkMountain(c,200,250,400,150,'rgba(87,106,87,.2)',31);
  // white wall
  const wall=linear(c,0,170,0,540,[[0,'#c9c8b2'],[.08,'#e8e2cd'],[.75,'#ded9c2'],[1,'#bcb69f']]);
  c.fillStyle=wall; c.fillRect(0,185,W,330);
  c.fillStyle='#8a8270'; c.fillRect(0,177,W,12);
  c.strokeStyle='#5e594b'; c.lineWidth=2; c.beginPath(); c.moveTo(0,185); c.lineTo(W,185); c.stroke();
  // tile caps
  for(let i=0;i<45;i++){ c.fillStyle='#6d6758'; c.beginPath(); c.arc(i*30,178,7,Math.PI,TAU); c.fill(); }
  // wall texture
  const r=mulberry32(77);
  c.strokeStyle='rgba(112,105,85,.08)'; c.lineWidth=1;
  for(let i=0;i<30;i++){ const x=r()*W,y=200+r()*300; c.beginPath(); c.moveTo(x,y); c.lineTo(x+20+r()*40,y+(r()-.5)*7); c.stroke(); }
  // moon gate right
  c.fillStyle='#7e7a68'; c.beginPath(); c.arc(1080,380,144,Math.PI,TAU); c.lineTo(1224,520); c.lineTo(936,520); c.closePath(); c.fill();
  c.fillStyle='#9a9682'; c.beginPath(); c.arc(1080,380,130,Math.PI,TAU); c.lineTo(1210,510); c.lineTo(950,510); c.closePath(); c.fill();
  c.fillStyle='#6b7b67'; c.beginPath(); c.arc(1080,382,118,Math.PI,TAU); c.lineTo(1198,512); c.lineTo(962,512); c.closePath(); c.fill();
  c.fillStyle='rgba(225,232,210,.32)'; c.beginPath(); c.arc(1080,390,80,Math.PI,TAU); c.lineTo(1160,512); c.lineTo(1000,512); c.closePath(); c.fill();
  // lattice window and gauze
  drawWindowLattice(c,790,255,196,155,'#664c37');
  c.fillStyle='rgba(165,196,172,.34)'; c.fillRect(800,265,176,135);
  c.strokeStyle='rgba(121,158,128,.38)'; c.lineWidth=1; 
  for(let i=0;i<8;i++){c.beginPath();c.moveTo(800,270+i*16);c.lineTo(976,270+i*16);c.stroke();}
  // desk beneath window with books
  c.fillStyle='#6e5138'; c.fillRect(778,410,220,13); c.fillRect(792,423,10,72); c.fillRect(974,423,10,72);
  c.fillStyle='rgba(229,218,191,.8)';
  c.fillRect(806,392,22,17); c.fillRect(832,388,18,21); c.fillRect(855,394,26,15);
  c.strokeStyle='rgba(99,77,49,.5)'; c.lineWidth=.8;
  c.strokeRect(806,392,22,17); c.strokeRect(832,388,18,21); c.strokeRect(855,394,26,15);
  // small tea set
  c.fillStyle='#b9c5b3'; c.beginPath(); c.ellipse(940,405,10,4,0,0,TAU); c.fill();
  c.fillStyle='#9aae9a'; c.beginPath(); c.arc(958,398,6,0,TAU); c.fill();
  // path and moss
  c.fillStyle='#8d9b7c'; c.beginPath(); c.moveTo(0,515); c.quadraticCurveTo(640,482,1280,508); c.lineTo(1280,720); c.lineTo(0,720); c.closePath(); c.fill();
  drawStonePath(c,380,505,550,190,61);
  c.fillStyle='rgba(86,112,77,.42)';
  for(let i=0;i<28;i++){c.beginPath();c.ellipse(330+r()*640,545+r()*150,5+r()*14,3+r()*7,.4,0,TAU);c.fill();}
  // bamboo
  drawBamboo(c,70,600,1.35,9,true);
  drawBamboo(c,220,590,1.2,15,false);
  drawBamboo(c,350,580,.9,23,false);
  drawBamboo(c,1190,590,1.25,44,true);
  drawBamboo(c,1240,600,1.1,51,false);
  // foreground stones / moss
  c.fillStyle='#7c8770'; c.beginPath(); c.ellipse(130,690,100,28,0,0,TAU); c.fill();
  c.fillStyle='#8d987e'; c.beginPath(); c.ellipse(1160,696,110,30,0,0,TAU); c.fill();
  // few chrysanthemums
  for(let i=0;i<9;i++) drawChrysanthemum(c,430+i*48,665+((i*13)%22),.55,'#d8c786','#9f8440',11);
  // bamboo leaves foreground
  c.strokeStyle='rgba(57,85,58,.45)'; c.lineWidth=1.4;
  for(let i=0;i<18;i++){const x=20+r()*280,y=100+r()*90;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+18,y+6,x+38,y+3);c.stroke();}
  paperGrain(c,W,H,32,720);
  c.fillStyle=linear(c,0,0,0,H,[[0,'rgba(47,54,39,.16)'],[.3,'rgba(47,54,39,0)'],[1,'rgba(39,49,35,.2)']]); c.fillRect(0,0,W,H);
  c.fillStyle=linear(c,0,0,W,0,[[0,'rgba(34,47,32,.2)'],[.45,'rgba(34,47,32,0)'],[1,'rgba(34,47,32,.16)']]); c.fillRect(0,0,W,H);
}

function paintQiushuang(c){
  paperWash(c,W,H,'#efe2c8');
  // wall
  c.fillStyle=linear(c,0,0,0,520,[[0,'#e8dcc1'],[.6,'#f2e7ce'],[1,'#d8c9aa']]); c.fillRect(0,0,W,530);
  c.fillStyle='#b2a184'; c.fillRect(0,514,W,18);
  c.fillStyle='#755439'; c.fillRect(0,530,W,190);
  // floor boards
  c.strokeStyle='rgba(83,57,36,.35)'; c.lineWidth=1;
  for(let i=0;i<12;i++){ c.beginPath(); c.moveTo(0,548+i*15); c.lineTo(W,540+i*17); c.stroke(); }
  for(let i=0;i<20;i++){ c.beginPath(); c.moveTo(i*72,530); c.lineTo(i*72-30,720); c.stroke(); }
  // left lattice window
  drawWindowLattice(c,40,170,235,236,'#63462e');
  c.fillStyle='rgba(207,220,190,.3)'; c.fillRect(50,180,215,216);
  c.strokeStyle='rgba(89,112,80,.35)'; c.lineWidth=2;
  for(let i=0;i<6;i++){ c.beginPath(); c.moveTo(230,200+i*36); c.quadraticCurveTo(160,210+i*33,95,206+i*36); c.stroke(); }
  // pillars
  drawPillar(c,340,530,530,16,'#8f4437','#613029');
  drawPillar(c,930,530,530,16,'#8f4437','#613029');
  // wall scrolls
  drawHangingScroll(c,108,66,88,164,'烟霞闲骨格','#d8cfb5');
  drawHangingScroll(c,230,86,72,146,'泉石野生涯','#ddd4ba');
  // large desk
  c.fillStyle='#6b432c';
  c.beginPath(); c.moveTo(380,370); c.lineTo(850,360); c.lineTo(880,440); c.lineTo(350,452); c.closePath(); c.fill();
  c.fillStyle='#8a5b3b'; c.beginPath(); c.moveTo(380,370); c.lineTo(850,360); c.lineTo(854,380); c.lineTo(376,390); c.closePath(); c.fill();
  c.strokeStyle='rgba(53,33,21,.4)'; c.lineWidth=1; c.stroke();
  c.fillStyle='#5e3b27'; c.fillRect(367,446,18,90); c.fillRect(844,438,18,96);
  // desk objects: books, inks, brush pot
  c.fillStyle='#dfd4b9'; c.fillRect(440,348,34,19); c.fillRect(480,344,26,23); c.fillRect(512,350,42,17);
  c.strokeStyle='rgba(97,76,51,.55)'; c.lineWidth=.8;
  c.strokeRect(440,348,34,19); c.strokeRect(480,344,26,23); c.strokeRect(512,350,42,17);
  c.fillStyle='#3e3a31'; c.fillRect(590,341,84,22);
  c.fillStyle='#6c7463'; c.fillRect(626,322,9,22); c.fillRect(647,326,7,18);
  c.strokeStyle='#9a845a'; c.lineWidth=2; c.beginPath(); c.moveTo(630,322); c.lineTo(636,290); c.stroke();
  c.fillStyle='#525b4b'; c.beginPath(); c.ellipse(770,342,20,8,0,0,TAU); c.fill();
  c.fillStyle='#6d7661'; c.fillRect(756,318,28,25);
  // vase with white chrysanthemums at right of desk
  drawVase(c,800,356,1.1,'#9eb5aa');
  for(let i=0;i<9;i++){
    const a=-Math.PI*.94+i*.16, dx=Math.cos(a)*70, dy=Math.sin(a)*105;
    c.strokeStyle='rgba(85,105,69,.55)'; c.lineWidth=1.6; c.beginPath(); c.moveTo(800,290); c.quadraticCurveTo(800+dx*.4,290+dy*.65,800+dx,290+dy); c.stroke();
    drawChrysanthemum(c,800+dx,290+dy,.78,'#f3f0dc','#c2b87d',15);
  }
  // right bed with green curtain
  c.fillStyle='#5b4130'; c.fillRect(978,315,264,16);
  c.fillStyle='#6f4d37'; c.fillRect(988,331,12,170); c.fillRect(1218,331,12,170);
  c.fillStyle='#8e755c'; c.fillRect(996,430,218,62);
  c.fillStyle='#d7cdb3'; c.fillRect(1004,414,198,22);
  c.fillStyle='rgba(107,133,97,.7)'; c.fillRect(992,245,220,177);
  c.strokeStyle='rgba(223,229,201,.3)'; c.lineWidth=1;
  for(let i=0;i<12;i++){c.beginPath();c.moveTo(1002+i*18,250);c.quadraticCurveTo(988+i*19,330,1000+i*17,418);c.stroke();}
  c.fillStyle='rgba(70,95,65,.55)'; c.fillRect(988,240,228,12);
  // hanging tassels
  c.strokeStyle='#b93d35'; c.lineWidth=4; c.beginPath(); c.moveTo(990,252); c.lineTo(990,300); c.stroke();
  c.beginPath(); c.moveTo(1205,252); c.lineTo(1205,300); c.stroke();
  // screen / side cabinet
  c.fillStyle='#694936'; c.fillRect(105,438,180,76);
  c.fillStyle='#82613f'; c.fillRect(113,444,164,64);
  c.strokeStyle='rgba(213,185,131,.35)'; c.lineWidth=1; c.strokeRect(120,451,150,50);
  // small side table with fruit (佛手)
  c.fillStyle='#6d4c35'; c.fillRect(950,500,170,12); c.fillRect(962,512,10,45); c.fillRect(1098,512,10,45);
  c.fillStyle='#c9b268';
  for(let i=0;i<4;i++){ c.beginPath(); c.ellipse(980+i*26,488,9,12,.2,0,TAU); c.fill(); c.strokeStyle='#a08843'; c.lineWidth=.8; c.stroke(); }
  // floor textile
  c.fillStyle='rgba(138,47,42,.18)'; c.fillRect(390,585,500,100);
  c.strokeStyle='rgba(138,47,42,.28)'; c.lineWidth=1; c.strokeRect(400,593,480,84);
  paperGrain(c,W,H,47,760);
  c.fillStyle=linear(c,0,0,0,H,[[0,'rgba(55,40,24,.14)'],[.3,'rgba(55,40,24,0)'],[1,'rgba(49,35,21,.2)']]); c.fillRect(0,0,W,H);
  c.fillStyle=linear(c,0,0,W,0,[[0,'rgba(54,40,26,.16)'],[.5,'rgba(54,40,26,0)'],[1,'rgba(54,40,26,.12)']]); c.fillRect(0,0,W,H);
}

function paintWuyuan(c){
  paperWash(c,W,H,'#d8ddcd');
  c.fillStyle=linear(c,0,0,0,H,[[0,'#aebaa9'],[.32,'#cad2c0'],[1,'#7c8b78']]); c.fillRect(0,0,W,H);
  // mist and distant rocks
  c.fillStyle=radial(c,400,220,420,[[0,'rgba(233,236,216,.44)'],[1,'rgba(233,236,216,0)']]); c.fillRect(0,0,900,560);
  inkMountain(c,200,280,420,130,'rgba(88,104,84,.18)',62);
  // white wall / room
  c.fillStyle=linear(c,0,160,0,520,[[0,'#d7d8c6'],[.4,'#e9e7d5'],[1,'#c3c3ae']]); c.fillRect(170,190,960,325);
  c.fillStyle='#7c7c69'; c.fillRect(160,180,980,12);
  for(let i=0;i<33;i++){ c.fillStyle='#5f6253'; c.beginPath(); c.arc(168+i*30,181,6.5,Math.PI,TAU); c.fill(); }
  // room opening
  c.fillStyle='#555f52'; c.fillRect(525,250,400,280);
  c.fillStyle='#7d8a79'; c.fillRect(535,260,380,270);
  c.fillStyle='#c5c8b5'; c.fillRect(548,274,354,256);
  // pale interior
  c.fillStyle='#d9d9c5'; c.fillRect(560,288,330,242);
  // plain table
  c.fillStyle='#6e5b43'; c.fillRect(660,405,140,12); c.fillRect(676,417,9,75); c.fillRect(775,417,9,75);
  // vase with few chrysanthemums
  drawVase(c,730,405,.86,'#b2c3b8');
  for(let i=0;i<5;i++){
    const dx=(i-2)*18, dy=-62-Math.abs(i-2)*7;
    c.strokeStyle='rgba(83,105,69,.55)'; c.lineWidth=1.4; c.beginPath(); c.moveTo(730,350); c.quadraticCurveTo(730+dx*.4,350+dy*.6,730+dx,350+dy); c.stroke();
    drawChrysanthemum(c,730+dx,350+dy,.65,'#efe9cd','#b7ae7b',13);
  }
  // two books and tea cup
  c.fillStyle='#d9cfb4'; c.fillRect(680,394,25,11); c.fillRect(707,391,18,14);
  c.fillStyle='#b6c1b0'; c.beginPath(); c.ellipse(790,399,7,3,0,0,TAU); c.fill();
  // plain bed at right
  c.fillStyle='#76634b'; c.fillRect(900,400,190,10); c.fillRect(906,410,9,90); c.fillRect(1075,410,9,90);
  c.fillStyle='#d0ceba'; c.fillRect(910,382,174,18);
  c.fillStyle='rgba(143,165,151,.42)'; c.fillRect(908,300,180,84);
  // window gauze left of room
  c.fillStyle='#b8c1ae'; c.fillRect(210,280,110,170);
  c.strokeStyle='rgba(255,255,255,.25)'; c.lineWidth=9; c.strokeRect(214,284,102,162);
  // rockery left and right
  drawRock(c,70,600,180,380,5,'#737b6d');
  drawRock(c,166,590,130,280,16,'#7f8777');
  drawRock(c,1220,610,170,380,27,'#6c7568');
  drawRock(c,1100,600,110,260,35,'#7d8577');
  // vines over wall and rocks
  drawVines(c,120,130,450,220,8,'#5c7055');
  drawVines(c,830,110,390,210,13,'#607356');
  drawVines(c,0,430,180,160,19,'#53674e');
  // ground
  c.fillStyle='#7e8976'; c.beginPath(); c.moveTo(0,505); c.quadraticCurveTo(640,478,1280,510); c.lineTo(1280,720); c.lineTo(0,720); c.closePath(); c.fill();
  drawStonePath(c,290,500,710,195,70);
  c.fillStyle='rgba(72,94,67,.4)';
  for(let i=0;i<22;i++){c.beginPath();c.ellipse(250+((i*83)%780),540+((i*47)%145),6+((i*13)%16),3+((i*7)%7),.5,0,TAU);c.fill();}
  // stone steps
  c.strokeStyle='rgba(76,79,67,.5)'; c.lineWidth=2;
  for(let i=0;i<4;i++){ c.beginPath(); c.moveTo(500+i*14,620+i*20); c.lineTo(780-i*12,620+i*20); c.stroke(); }
  // small chrysanthemums foreground
  const r=mulberry32(81);
  for(let i=0;i<14;i++) drawChrysanthemum(c,120+r()*1060,635+r()*55,.55,'#d9ce98','#a89d68',11);
  paperGrain(c,W,H,52,700);
  c.fillStyle=linear(c,0,0,0,H,[[0,'rgba(43,52,41,.18)'],[.3,'rgba(43,52,41,0)'],[1,'rgba(38,46,36,.2)']]); c.fillRect(0,0,W,H);
  c.fillStyle=linear(c,0,0,W,0,[[0,'rgba(37,45,35,.16)'],[.5,'rgba(37,45,35,0)'],[1,'rgba(37,45,35,.16)']]); c.fillRect(0,0,W,H);
}

function paintZhuijin(c){
  paperWash(c,W,H,'#e2c59d');
  // dusk sky
  c.fillStyle=linear(c,0,0,0,470,[[0,'#837f76'],[.3,'#b9a17e'],[.66,'#d9b27f'],[1,'#b48b67']]); c.fillRect(0,0,W,480);
  // sun glow
  c.fillStyle=radial(c,310,250,220,[[0,'rgba(255,217,151,.42)'],[1,'rgba(255,217,151,0)']]); c.fillRect(60,20,520,470);
  inkMountain(c,260,300,360,120,'rgba(82,83,75,.23)',72);
  inkMountain(c,1080,300,430,150,'rgba(76,79,72,.25)',74);
  // lake
  drawWater(c,0,360,W,240,'#6f8580','#3e5551');
  c.strokeStyle='rgba(238,201,142,.22)'; c.lineWidth=1;
  for(let i=0;i<22;i++){ c.beginPath(); c.ellipse(250+i*47,390+(i%5)*17,45,2,0,0,TAU); c.stroke(); }
  // distant pavilion 藕香榭
  drawRoof(c,1050,260,210,42,'rgba(89,56,43,.8)');
  c.fillStyle='rgba(112,61,46,.78)'; c.fillRect(1004,267,86,84);
  for(let i=0;i<4;i++){ c.fillStyle='rgba(98,53,40,.85)'; c.fillRect(985+i*32,280,7,75); }
  drawLantern(c,1000,300,.34,false); drawLantern(c,1094,300,.34,false);
  // reeds and lotus left
  c.strokeStyle='rgba(126,116,74,.5)'; c.lineWidth=1.3;
  for(let i=0;i<26;i++){ const x=15+i*14,y=520; c.beginPath(); c.moveTo(x,y); c.quadraticCurveTo(x+8,y-50,x+3,y-80-(i%4)*16); c.stroke(); }
  for(let i=0;i<8;i++){ c.fillStyle='rgba(96,94,65,.42)'; c.beginPath(); c.ellipse(40+i*19,505-(i%3)*16,6,2,.6,0,TAU); c.fill(); }
  // main pavilion
  c.fillStyle='rgba(50,37,26,.22)'; c.beginPath(); c.ellipse(670,570,420,45,0,0,TAU); c.fill();
  drawRoof(c,650,110,760,96,'#4f342c','#2c201b');
  c.fillStyle='#754636'; c.fillRect(294,165,714,22);
  c.fillStyle='#d0b16b'; c.fillRect(594,178,114,38);
  c.fillStyle='#4f2f27'; c.font='25px '+SERIF; c.textAlign='center'; c.textBaseline='middle'; c.fillText('缀 锦 阁',651,198);
  drawPillar(c,300,530,362,15,'#913e35','#5e2625');
  drawPillar(c,356,540,380,12,'#913e35','#5e2625');
  drawPillar(c,942,540,380,12,'#913e35','#5e2625');
  drawPillar(c,998,530,362,15,'#913e35','#5e2625');
  // lattice windows behind
  c.fillStyle='rgba(179,120,74,.35)'; c.fillRect(380,210,560,120);
  c.strokeStyle='rgba(85,50,35,.55)'; c.lineWidth=2;
  for(let i=0;i<10;i++){ c.beginPath(); c.moveTo(390+i*55,210); c.lineTo(390+i*55,330); c.stroke(); }
  for(let j=0;j<4;j++){ c.beginPath(); c.moveTo(380,220+j*30); c.lineTo(940,220+j*30); c.stroke(); }
  // lanterns along eaves
  for(let i=0;i<7;i++) drawLantern(c,330+i*108,235,.62,true);
  // hanging red silk / banners
  c.fillStyle='rgba(162,47,41,.72)';
  c.beginPath(); c.moveTo(370,210); c.lineTo(400,210); c.lineTo(392,300); c.lineTo(380,270); c.lineTo(368,300); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(890,210); c.lineTo(920,210); c.lineTo(908,300); c.lineTo(898,268); c.lineTo(886,300); c.closePath(); c.fill();
  // banqueting floor
  c.fillStyle='#8d7a5e'; c.beginPath(); c.moveTo(0,530); c.quadraticCurveTo(640,505,1280,530); c.lineTo(1280,720); c.lineTo(0,720); c.closePath(); c.fill();
  c.fillStyle='rgba(181,148,99,.38)'; c.fillRect(0,540,W,180);
  c.strokeStyle='rgba(91,63,39,.28)'; c.lineWidth=1;
  for(let i=0;i<14;i++){ c.beginPath(); c.moveTo(0,560+i*13); c.lineTo(W,552+i*14); c.stroke(); }
  // tables left and right (front part is foreground)
  drawBanquetTable(c,38,590,470,3);
  drawBanquetTable(c,772,590,470,8);
  // cushions
  c.fillStyle='rgba(146,47,42,.48)';
  c.beginPath(); c.ellipse(230,578,112,12,0,0,TAU); c.fill();
  c.beginPath(); c.ellipse(1050,578,112,12,0,0,TAU); c.fill();
  // water glints foreground
  c.fillStyle='rgba(240,191,114,.16)';
  for(let i=0;i<20;i++){c.beginPath();c.ellipse(40+i*63,540+(i%3)*10,25,1.8,0,0,TAU);c.fill();}
  paperGrain(c,W,H,66,780);
  c.fillStyle=radial(c,640,320,620,[[0,'rgba(43,33,23,0)'],[1,'rgba(31,26,19,.28)']]); c.fillRect(0,0,W,H);
  c.fillStyle=linear(c,0,0,0,H,[[0,'rgba(44,34,24,.18)'],[.3,'rgba(44,34,24,0)'],[1,'rgba(37,28,20,.25)']]); c.fillRect(0,0,W,H);
}

const BG_PAINTERS = {qinfang:paintQinfang, xiang:paintXiang, qiushuang:paintQiushuang, wuyuan:paintWuyuan, zhuijin:paintZhuijin, title:paintTitle};
const BG_CACHE = {};
function getBG(id){
  if(!BG_CACHE[id]){
    const cv=document.createElement('canvas'); cv.width=W; cv.height=H;
    const c=cv.getContext('2d');
    (BG_PAINTERS[id]||paintTitle)(c);
    BG_CACHE[id]=cv;
  }
  return BG_CACHE[id];
}

/* Add 迎春 for the banquet tableau */
CHARS.yingchun = {name:'迎春', role:'二姑娘', seal:'迎', skin:'#eccfb2', hair:'#29231f', robe:'#c9b79a', robe2:'#b39f83', skirt:'#95836b', trim:'#9b8a68', accent:'#f2e7d0', build:.95};

/* ============================================================
   Scenes and state
   ============================================================ */
const SCENE_META = {
  qinfang:   {chapterNo:'一', chapter:'第一折 · 沁芳亭', sceneName:'沁芳亭', sub:'一园秋色', chapterFlash:'第一折', flashTitle:'沁芳亭', flashSub:'一园秋色', next:'xiang', objective:'陪老太太在园中逛逛'},
  xiang:     {chapterNo:'二', chapter:'第二折 · 潇湘馆', sceneName:'潇湘馆', sub:'竹影窗纱', chapterFlash:'第二折', flashTitle:'潇湘馆', flashSub:'竹影窗纱', next:'qiushuang', objective:'往潇湘馆去'},
  qiushuang: {chapterNo:'三', chapter:'第三折 · 秋爽斋', sceneName:'秋爽斋', sub:'宴笑一堂', chapterFlash:'第三折', flashTitle:'秋爽斋', flashSub:'宴笑一堂', next:'wuyuan', objective:'往秋爽斋去'},
  wuyuan:    {chapterNo:'四', chapter:'第四折 · 蘅芜苑', sceneName:'蘅芜苑', sub:'雪洞生香', chapterFlash:'第四折', flashTitle:'蘅芜苑', flashSub:'雪洞生香', next:'zhuijin', objective:'往蘅芜苑去'},
  zhuijin:   {chapterNo:'五', chapter:'第五折 · 缀锦阁', sceneName:'缀锦阁', sub:'牙牌酒令', chapterFlash:'第五折', flashTitle:'缀锦阁', flashSub:'牙牌酒令', next:null, objective:'赴老太太的席，行牙牌令'}
};
const SCENE_ORDER = ['qinfang','xiang','qiushuang','wuyuan','zhuijin'];
const SCENE_LABEL = {qinfang:'沁芳亭',xiang:'潇湘馆',qiushuang:'秋爽斋',wuyuan:'蘅芜苑',zhuijin:'缀锦阁'};

const SCENE_NPCS = {
  qinfang: [
    {id:'jia', x:792, y:574, facing:-1, mood:'smile'},
    {id:'feng', x:900, y:580, facing:-1, mood:'smile'},
    {id:'xichun', x:1008, y:584, facing:-1, mood:'calm'},
    {id:'baner', x:398, y:622, facing:1, mood:'calm'}
  ],
  xiang: [
    {id:'daiyu', x:858, y:575, facing:-1, mood:'calm'},
    {id:'jia', x:714, y:570, facing:1, mood:'smile'},
    {id:'wang', x:1012, y:582, facing:-1, mood:'calm'},
    {id:'feng', x:560, y:586, facing:1, mood:'smile'},
    {id:'baner', x:330, y:624, facing:1, mood:'calm'}
  ],
  qiushuang: [
    {id:'tanchun', x:920, y:574, facing:-1, mood:'smile'},
    {id:'feng', x:770, y:584, facing:-1, mood:'smile'},
    {id:'yuanyang', x:842, y:588, facing:-1, mood:'smile'},
    {id:'jia', x:1040, y:574, facing:-1, mood:'smile'},
    {id:'baner', x:392, y:624, facing:1, mood:'calm'}
  ],
  wuyuan: [
    {id:'baochai', x:910, y:576, facing:-1, mood:'calm'},
    {id:'jia', x:730, y:572, facing:1, mood:'calm'},
    {id:'xue', x:1040, y:582, facing:-1, mood:'smile'},
    {id:'yuanyang', x:838, y:590, facing:1, mood:'calm'}
  ],
  zhuijin: [
    {id:'jia', x:622, y:578, facing:1, mood:'smile'},
    {id:'yuanyang', x:700, y:582, facing:-1, mood:'smile'},
    {id:'feng', x:774, y:584, facing:-1, mood:'smile'},
    {id:'baner', x:286, y:634, facing:1, mood:'calm'}
  ]
};
const SCENE_DECOR = {
  zhuijin: [
    {id:'xue',x:170,y:556,s:.8},{id:'wang',x:248,y:558,s:.8},{id:'xiangyun',x:326,y:555,s:.8},
    {id:'baochai',x:402,y:556,s:.8},{id:'daiyu',x:468,y:554,s:.8},
    {id:'yingchun',x:860,y:554,s:.8},{id:'tanchun',x:928,y:556,s:.8},{id:'xichun',x:994,y:558,s:.8},
    {id:'baoyu',x:1060,y:556,s:.8}
  ]
};

const state = {
  mode:'title',
  started:false,
  scene:'qinfang',
  player:{x:300,y:650,facing:1,target:null,moving:false,walkPhase:0},
  stats:{rapport:2,dignity:2},
  flags:{},
  choices:{},
  sceneState:{},
  unlocked:['qinfang'],
  objective:'陪老太太在园中逛逛',
  storyToken:0,
  pendingResolve:null,
  choiceResolve:null,
  activeChoice:null,
  promptKey:'',
  pausedFrom:null,
  time:0,
  ending:null,
  flashTimer:null,
  storyTimer:null,
  toastTimer:null,
  mapOpen:false,
  jump:null,
  followPending:null,
  promptThing:null,
  transitionAlpha:0,
  uiLift:0,
  pendingSceneStart:null
};
const keys = {};

function freshSceneState(){
  return {qinfang:{visited:false,done:false},xiang:{visited:false,done:false},qiushuang:{visited:false,done:false},wuyuan:{visited:false,done:false},zhuijin:{visited:false,done:false}};
}
function resetGameData(){
  state.storyToken++;
  state.storyActive=false;
  state.pendingResolve=null;
  state.choiceResolve=null;
  state.activeChoice=null;
  state.started=false;
  state.mode='title';
  state.scene='qinfang';
  state.player={x:300,y:650,facing:1,target:null,moving:false,walkPhase:0};
  state.stats={rapport:2,dignity:2};
  state.flags={};
  state.choices={};
  state.sceneState=freshSceneState();
  state.unlocked=['qinfang'];
  state.objective='陪老太太在园中逛逛';
  state.ending=null;
  state.mapOpen=false;
  state.followPending=null;
  state.promptKey='';
  state.promptThing=null;
  state.transitionAlpha=0;
  state.uiLift=0;
  state.pendingSceneStart=null;
  if(state.flashTimer){clearTimeout(state.flashTimer);state.flashTimer=null;}
  if(state.storyTimer){clearTimeout(state.storyTimer);state.storyTimer=null;}
  if(state.toastTimer){clearTimeout(state.toastTimer);state.toastTimer=null;}
  $('dialogue').classList.add('hidden');
  $('choice-panel').classList.add('hidden');
  $('map-overlay').classList.add('hidden');
  $('pause-overlay').classList.add('hidden');
  $('ending-screen').classList.add('hidden');
  $('chapter-flash').classList.add('hidden');
  $('prompt').classList.add('hidden');
  $('hud').classList.add('hidden');
}

/* ============================================================
   HUD, toast, prompts
   ============================================================ */
function updateHUD(){
  const meta=SCENE_META[state.scene]||SCENE_META.qinfang;
  $('chapter-seal').textContent=meta.chapterNo;
  $('chapter-name').textContent=meta.chapter;
  $('objective').textContent=state.objective;
  $('stat-rapport').textContent=state.stats.rapport;
  $('stat-dignity').textContent=state.stats.dignity;
}
function showToast(text,ms=2300){
  const el=$('toast');
  el.textContent=text;
  el.classList.add('show');
  if(state.toastTimer) clearTimeout(state.toastTimer);
  state.toastTimer=setTimeout(()=>el.classList.remove('show'),ms);
}
function showChapterFlash(meta){
  const el=$('chapter-flash');
  $('flash-no').textContent=meta.flashNo||meta.chapterFlash;
  $('flash-title').textContent=meta.flashTitle;
  $('flash-sub').textContent=meta.flashSub;
  el.classList.remove('hidden');
  // restart CSS animation
  el.style.animation='none'; void el.offsetWidth; el.style.animation='';
  if(state.flashTimer) clearTimeout(state.flashTimer);
  state.flashTimer=setTimeout(()=>el.classList.add('hidden'),1900);
}

function hidePrompt(){
  if(state.promptKey!==''){
    state.promptKey=''; state.promptThing=null;
    $('prompt').classList.add('hidden');
  }
}
function setPrompt(key,text){
  if(state.promptKey===key) return;
  state.promptKey=key;
  $('prompt-text').textContent=text;
  $('prompt').classList.remove('hidden');
}

function nearestThing(){
  if(state.mode!=='playing') return null;
  const p=state.player;
  let best=null,bestD=1e9;
  for(const npc of SCENE_NPCS[state.scene]||[]){
    const d=Math.hypot(p.x-npc.x,p.y-npc.y);
    if(d<138 && d<bestD){best={type:'npc',npc,d};bestD=d;}
  }
  if(best) return best;
  // exits
  const ex=exitsFor(state.scene);
  for(const e of ex){
    if(e.side==='right' && p.x>1140 && p.y>500) return {type:'exit',exit:e,d:0};
    if(e.side==='left' && p.x<140 && p.y>500) return {type:'exit',exit:e,d:0};
  }
  return null;
}
function updatePrompt(){
  if(state.mode!=='playing'){hidePrompt();return;}
  const thing=nearestThing();
  if(!thing){hidePrompt();return;}
  if(thing.type==='npc'){
    setPrompt('npc:'+thing.npc.id,'与 '+CHARS[thing.npc.id].name+' 交谈');
  } else {
    const e=thing.exit;
    if(e.enabled) setPrompt('exit:'+e.to,'前往 '+SCENE_LABEL[e.to]);
    else setPrompt('exit-locked:'+e.to,'前头还未到时候');
  }
  state.promptThing=thing;
}

/* ============================================================
   Movement and drawing
   ============================================================ */
function playerScale(y){return .94 + clamp((y-540)/150,0,1)*.06;}
function sceneSpawn(id,side='center'){
  if(side==='left') return {x:150,y:648};
  if(side==='right') return {x:1110,y:640};
  return {x:290,y:650};
}
function enterScene(id,opts={}){
  if(!SCENE_META[id]) return;
  state.scene=id;
  const sp=sceneSpawn(id,opts.side||'center');
  state.player.x=sp.x; state.player.y=sp.y; state.player.target=null; state.player.moving=false; state.player.facing=1;
  state.mode='playing';
  state.transitionAlpha=.55;
  $('hud').classList.remove('hidden');
  $('ending-screen').classList.add('hidden');
  $('intro-screen').classList.add('hidden');
  $('title-screen').classList.add('hidden');
  $('pause-overlay').classList.add('hidden');
  updateHUD();
  updatePrompt();
  const ss=state.sceneState[id];
  if(!ss.visited){
    ss.visited=true;
    const meta=SCENE_META[id];
    showChapterFlash(meta);
    if(state.storyTimer) clearTimeout(state.storyTimer);
    state.storyTimer=setTimeout(()=>{
      if(state.scene===id && !state.sceneState[id].done){
        state.pendingSceneStart=id;
      }
    },1820);
  } else if(ss.done){
    // keep existing objective; refresh map
  }
  renderMap();
}
function startSceneFlow(id){
  if(state.mode!=='playing' && state.mode!=='dialogue') return;
  startStory(async t=>{
    if(id==='qinfang') await qinfangFlow(t);
    else if(id==='xiang') await xiangFlow(t);
    else if(id==='qiushuang') await qiushuangFlow(t);
    else if(id==='wuyuan') await wuyuanFlow(t);
    else if(id==='zhuijin') await zhuijinFlow(t);
  });
}
function updateMovement(dt){
  if(state.mode!=='playing' || state.mapOpen) return;
  const p=state.player;
  let dx=0,dy=0;
  if(keys['arrowleft']||keys['a']) dx-=1;
  if(keys['arrowright']||keys['d']) dx+=1;
  if(keys['arrowup']||keys['w']) dy-=1;
  if(keys['arrowdown']||keys['s']) dy+=1;
  const speed=205;
  if(dx||dy){
    p.target=null;
    const len=Math.hypot(dx,dy)||1;
    p.x+=dx/len*speed*dt; p.y+=dy/len*speed*dt;
    if(dx) p.facing=dx>0?1:-1;
    p.moving=true; p.walkPhase+=dt*10;
  } else if(p.target){
    const tx=p.target.x,ty=p.target.y;
    const ddx=tx-p.x,ddy=ty-p.y,d=Math.hypot(ddx,ddy);
    if(d<5){p.target=null;p.moving=false;}
    else{
      p.x+=ddx/d*Math.min(speed*dt,d); p.y+=ddy/d*Math.min(speed*dt,d);
      if(Math.abs(ddx)>.5) p.facing=ddx>0?1:-1;
      p.moving=true; p.walkPhase+=dt*10;
    }
  } else p.moving=false;
  p.x=clamp(p.x,62,1218);
  p.y=clamp(p.y,518,692);
  // auto-interact after click-to-walk
  if(state.followPending){
    const target=state.followPending;
    if(Math.hypot(p.x-target.x,p.y-target.y)<150){
      state.followPending=null;
      if(target.type==='npc') talkTo(target.npc);
      else if(target.type==='exit') tryExit(target.exit);
    }
  }
}

function drawLeaves(c,time,count=24,palette=['#b98a4c','#9d6b3e','#c5a25f']){
  c.save();
  for(let i=0;i<count;i++){
    const speed=18+(i%5)*6;
    const x=((i*137+time*speed)%1500)-80;
    const y=((i*89+time*(12+i%7*3))%760)-30;
    const rot=time*(.5+i%3*.3)+i;
    c.fillStyle=palette[i%palette.length]+'cc';
    c.globalAlpha=.45+(i%4)*.1;
    c.beginPath(); c.ellipse(x,y,7+(i%3)*2,2.2,rot,0,TAU); c.fill();
  }
  c.restore();
}
function drawDust(c,time,count=30,x0=0,y0=0,x1=W,y1=H){
  c.save();
  for(let i=0;i<count;i++){
    const x=x0+((i*173+time*(6+i%4*2))%(x1-x0));
    const y=y0+((i*97+Math.sin(time*.4+i)*22)%(y1-y0));
    c.fillStyle='rgba(255,244,212,.4)';
    c.beginPath(); c.arc(x,y,1+(i%3)*.6,0,TAU); c.fill();
  }
  c.restore();
}
function drawFireflies(c,time,count=18){
  c.save();
  for(let i=0;i<count;i++){
    const x=200+((i*157)%900)+Math.sin(time*.25+i)*24;
    const y=400+((i*71)%220)+Math.cos(time*.3+i*1.3)*14;
    const a=.3+.4*Math.abs(Math.sin(time*.8+i));
    c.fillStyle=`rgba(246,202,107,${a})`;
    c.beginPath(); c.arc(x,y,1.5+i%2,0,TAU); c.fill();
    c.fillStyle=`rgba(246,202,117,${a*.12})`; c.beginPath(); c.arc(x,y,8,0,TAU); c.fill();
  }
  c.restore();
}
function drawScreenVignette(c){
  c.fillStyle=linear(c,0,0,0,H,[[0,'rgba(36,30,21,.2)'],[.22,'rgba(36,30,21,0)'],[.84,'rgba(36,30,21,0)'],[1,'rgba(32,26,18,.24)']]);
  c.fillRect(0,0,W,H);
  c.fillStyle=linear(c,0,0,W,0,[[0,'rgba(33,28,20,.14)'],[.2,'rgba(33,28,20,0)'],[.82,'rgba(33,28,20,0)'],[1,'rgba(33,28,20,.1)']]);
  c.fillRect(0,0,W,H);
}
function drawExitSign(c,e,time){
  if(!e) return;
  const x=e.side==='right'?1211:69;
  const y=458;
  c.save();
  c.translate(x,y);
  c.globalAlpha=e.enabled?1:.52;
  // post
  c.strokeStyle='#5b4631'; c.lineWidth=3; c.beginPath(); c.moveTo(0,35); c.lineTo(0,128); c.stroke();
  // board
  c.fillStyle='#efe1c2'; c.strokeStyle=e.enabled?'#8f352e':'#71695a'; c.lineWidth=1.4;
  rr(c,-29,-45,58,84,2); c.fill(); c.stroke();
  c.strokeStyle='rgba(142,53,46,.35)'; c.lineWidth=1; rr(c,-24,-40,48,74,1); c.stroke();
  // vertical text
  c.fillStyle=e.enabled?'#51352b':'#6a6357';
  c.font='16px '+SERIF; c.textAlign='center'; c.textBaseline='middle';
  const chars=[...SCENE_LABEL[e.to]];
  chars.forEach((ch,i)=>c.fillText(ch,0,-21+i*20));
  // arrow
  c.fillStyle=e.enabled?'#9b342d':'#7b7261';
  c.beginPath();
  if(e.side==='right'){c.moveTo(-7,48);c.lineTo(7,48);c.lineTo(0,58);}
  else{c.moveTo(7,48);c.lineTo(-7,48);c.lineTo(0,58);}
  c.fill();
  if(e.enabled){
    c.fillStyle='rgba(255,235,185,.2)';
    c.beginPath(); c.arc(0,2,44+Math.sin(time*2)*2,0,TAU); c.fill();
  }
  c.restore();
}
function drawExitSigns(c,time){
  const exits=exitsFor(state.scene);
  for(const e of exits) drawExitSign(c,e,time);
}
function drawSceneCharacters(c,time){
  const entities=[];
  const decor=SCENE_DECOR[state.scene]||[];
  for(const d of decor) entities.push({...d,kind:'decor',y:d.y,scale:d.s||.82});
  for(const n of SCENE_NPCS[state.scene]||[]) entities.push({id:n.id,x:n.x,y:n.y,kind:'npc',npc:n,scale:1,facing:n.facing,mood:n.mood});
  const p=state.player;
  entities.push({id:'liu',x:p.x,y:p.y,kind:'player',scale:playerScale(p.y),facing:p.facing,mood:'calm',pose:p.moving?'walk':'stand'});
  entities.sort((a,b)=>a.y-b.y);
  const lift=-58*state.uiLift;
  for(const e of entities){
    const bob=e.kind==='player'?(e.pose==='walk'?Math.sin(e.x*.05+time*8)*1:0):0;
    drawFigure(c,e.id,e.x,e.y+lift,e.scale,e.facing||1,time+bob,e.pose||'stand',e.mood||'calm');
  }
  // nearest-character marker
  if(state.mode==='playing'){
    const thing=nearestThing();
    if(thing&&thing.type==='npc'){
      const y=thing.npc.y-185+Math.sin(time*3)*4;
      c.save(); c.fillStyle='rgba(143,45,38,.85)'; c.translate(thing.npc.x,y); c.rotate(Math.PI/4); c.fillRect(-4,-4,8,8); c.restore();
    }
  }
}
function drawScene(time){
  const bg=getBG(state.scene);
  ctx.drawImage(bg,0,0);
  // dynamic atmosphere
  if(state.scene==='qinfang'){
    drawLeaves(ctx,time,26,['#b98745','#a96f3d','#d0ad67']);
    ctx.fillStyle='rgba(255,246,210,.05)'; ctx.fillRect(0,0,W,H);
  } else if(state.scene==='xiang'){
    drawLeaves(ctx,time,12,['#71855b','#8da06e','#a2ad78']);
    ctx.fillStyle=radial(ctx,320,200,360,[[0,'rgba(238,243,222,.15)'],[1,'rgba(238,243,222,0)']]); ctx.fillRect(0,0,W,H);
  } else if(state.scene==='qiushuang'){
    drawDust(ctx,time,34,40,100,900,600);
    ctx.fillStyle=linear(ctx,0,0,400,0,[[0,'rgba(255,238,190,.1)'],[1,'rgba(255,238,190,0)']]); ctx.fillRect(0,0,700,600);
  } else if(state.scene==='wuyuan'){
    ctx.strokeStyle='rgba(232,230,210,.22)'; ctx.lineWidth=2;
    for(let i=0;i<3;i++){
      const sx=695+i*35, sy=390;
      ctx.beginPath(); ctx.moveTo(sx,sy);
      for(let j=1;j<6;j++){ctx.lineTo(sx+Math.sin(time*.45+j+i)*10,sy-j*24);}
      ctx.stroke();
    }
    drawLeaves(ctx,time,8,['#7f906c','#9aa87c']);
  } else if(state.scene==='zhuijin'){
    drawFireflies(ctx,time,24);
    // lantern pulse
    for(const x of [330,438,546,654,762,870,978]){
      ctx.fillStyle=radial(ctx,x,235,65,[[0,'rgba(255,173,86,.11)'],[1,'rgba(255,173,86,0)']]);
      ctx.fillRect(x-70,165,140,140);
    }
    ctx.strokeStyle='rgba(238,198,132,.18)'; ctx.lineWidth=1;
    for(let i=0;i<12;i++){ctx.beginPath();ctx.ellipse(80+i*105,545+Math.sin(time*.7+i)*2,35,1.8,0,0,TAU);ctx.stroke();}
  }
  drawExitSigns(ctx,time);
  drawSceneCharacters(ctx,time);
  drawScreenVignette(ctx);
  if(state.transitionAlpha>0.01){
    ctx.fillStyle=`rgba(24,21,15,${state.transitionAlpha})`; ctx.fillRect(0,0,W,H);
  }
}
function drawTitleScene(time){
  ctx.drawImage(getBG('title'),0,0);
  drawLeaves(ctx,time*.75,20,['#bd8b4b','#d1a55d','#91663e']);
  ctx.fillStyle=radial(ctx,1030,180,250,[[0,'rgba(255,246,206,.10)'],[1,'rgba(255,246,206,0)']]); ctx.fillRect(760,0,520,430);
  // faint drifting mist
  ctx.fillStyle='rgba(240,233,212,.05)';
  for(let i=0;i<4;i++){ ctx.beginPath(); ctx.ellipse(800+Math.sin(time*.12+i)*50,360+i*24,220,18,0,0,TAU); ctx.fill(); }
}
function drawEndingScene(time){
  ctx.drawImage(getBG('zhuijin'),0,0);
  drawFireflies(ctx,time,30);
  ctx.fillStyle=radial(ctx,640,260,550,[[0,'rgba(22,18,12,.12)'],[1,'rgba(18,16,11,.7)']]); ctx.fillRect(0,0,W,H);
  if(state.ending==='dignified'){
    ctx.fillStyle='rgba(44,67,77,.22)'; ctx.fillRect(0,0,W,H);
  } else if(state.ending==='afterglow'){
    ctx.fillStyle='rgba(94,69,38,.15)'; ctx.fillRect(0,0,W,H);
  }
}

/* ============================================================
   Exits and garden map
   ============================================================ */
const SCENE_EXITS = {
  qinfang: [
    {to:'xiang',side:'right',enabled:()=>state.sceneState.qinfang.done}
  ],
  xiang: [
    {to:'qinfang',side:'left',enabled:()=>true},
    {to:'qiushuang',side:'right',enabled:()=>state.sceneState.xiang.done}
  ],
  qiushuang: [
    {to:'xiang',side:'left',enabled:()=>true},
    {to:'wuyuan',side:'right',enabled:()=>state.sceneState.qiushuang.done}
  ],
  wuyuan: [
    {to:'qiushuang',side:'left',enabled:()=>true},
    {to:'zhuijin',side:'right',enabled:()=>state.sceneState.wuyuan.done}
  ],
  zhuijin: [
    {to:'wuyuan',side:'left',enabled:()=>true}
  ]
};
function exitsFor(id){
  return (SCENE_EXITS[id]||[]).map(e=>({to:e.to,side:e.side,enabled:!!e.enabled()}));
}

const MAP_NODES = [
  {id:'qinfang', x:170, y:305, sub:'一 · 簪花'},
  {id:'xiang', x:365, y:158, sub:'二 · 窗纱'},
  {id:'qiushuang', x:555, y:288, sub:'三 · 宴笑'},
  {id:'wuyuan', x:665, y:120, sub:'四 · 素室'},
  {id:'zhuijin', x:755, y:345, sub:'五 · 牙牌'}
];
let mapBgCache=null;
function getMapBG(){
  if(mapBgCache) return mapBgCache;
  const cv=document.createElement('canvas'); cv.width=880; cv.height=420;
  const c=cv.getContext('2d');
  paperWash(c,880,420,'#f0e5d0');
  // hills
  inkMountain(c,155,190,190,100,'rgba(109,115,94,.22)',4);
  inkMountain(c,390,160,220,110,'rgba(103,113,94,.2)',8);
  inkMountain(c,700,150,300,130,'rgba(99,110,92,.18)',12);
  // lake
  c.fillStyle=linear(c,0,290,0,420,[[0,'rgba(132,157,149,.45)'],[1,'rgba(91,118,112,.3)']]);
  c.beginPath(); c.moveTo(0,300); c.quadraticCurveTo(260,250,510,310); c.quadraticCurveTo(700,360,880,310); c.lineTo(880,420); c.lineTo(0,420); c.fill();
  c.strokeStyle='rgba(249,240,217,.35)'; c.lineWidth=1;
  for(let i=0;i<18;i++){ c.beginPath(); c.ellipse(80+i*42,325+Math.sin(i)*23,30,2,0,0,TAU); c.stroke(); }
  // paths
  c.strokeStyle='rgba(143,111,71,.52)'; c.lineWidth=4; c.setLineDash([2,7]); c.lineCap='round';
  const pts=[[170,305],[290,245],[365,158],[450,220],[555,288],[620,205],[665,120],[710,240],[755,345]];
  c.beginPath(); c.moveTo(pts[0][0],pts[0][1]);
  for(let i=1;i<pts.length;i++) c.lineTo(pts[i][0],pts[i][1]);
  c.stroke(); c.setLineDash([]);
  // small pavilions
  function mapPavilion(x,y,label,col){
    c.fillStyle='rgba(248,240,222,.85)'; c.beginPath(); c.arc(x,y,25,0,TAU); c.fill();
    c.strokeStyle=col; c.lineWidth=1.2; c.stroke();
    drawRoof(c,x,y-8,38,12,col);
    c.fillStyle=col; c.fillRect(x-13,y-2,4,15); c.fillRect(x+9,y-2,4,15);
    c.fillStyle=col; c.fillRect(x-14,y+12,28,3);
  }
  mapPavilion(170,305,'沁芳亭','#8b4137');
  c.strokeStyle='#72826a'; c.lineWidth=2;
  for(let i=0;i<10;i++){ c.beginPath(); c.moveTo(340+i*4,190); c.quadraticCurveTo(350+i*4,140,342+i*5,105); c.stroke(); }
  mapPavilion(555,288,'秋爽斋','#8b4137');
  mapPavilion(665,120,'蘅芜苑','#65766c');
  // water pavilion zhuijin
  c.fillStyle='rgba(145,52,44,.82)'; c.fillRect(742,362,26,14);
  drawRoof(c,755,350,50,14,'#7e332e');
  c.strokeStyle='rgba(118,91,57,.38)'; c.lineWidth=1;
  for(let i=0;i<16;i++){ c.beginPath(); c.moveTo(40+i*52,30); c.quadraticCurveTo(48+i*52,80,35+i*52,120); c.stroke(); }
  paperGrain(c,880,420,84,400);
  c.fillStyle=radial(c,440,210,500,[[0,'rgba(255,250,235,0)'],[1,'rgba(116,87,55,.12)']]); c.fillRect(0,0,880,420);
  mapBgCache=cv; return cv;
}
function openMap(){
  if(state.mode!=='playing') return;
  state.mapOpen=true; state.mode='map';
  hidePrompt();
  $('map-overlay').classList.remove('hidden');
  renderMap();
}
function closeMap(){
  if(!state.mapOpen) return;
  state.mapOpen=false; state.mode='playing';
  $('map-overlay').classList.add('hidden');
  updatePrompt();
}
function renderMap(){
  const c=$('map-canvas').getContext('2d');
  c.clearRect(0,0,880,420);
  c.drawImage(getMapBG(),0,0);
  const wrap=$('map-nodes');
  wrap.innerHTML='';
  for(const n of MAP_NODES){
    const unlocked=state.unlocked.includes(n.id);
    const active=state.scene===n.id;
    const b=document.createElement('button');
    b.type='button';
    b.className='map-node'+(active?' active':'')+(unlocked?'':' locked');
    b.style.left=n.x+'px'; b.style.top=n.y+'px';
    b.innerHTML=`<span class="node-name">${SCENE_LABEL[n.id]}</span><span class="node-sub">${unlocked?n.sub:'尚未走到'}</span>`;
    b.addEventListener('click',(ev)=>{
      ev.stopPropagation();
      if(!unlocked) return;
      travelTo(n.id);
    });
    wrap.appendChild(b);
  }
}
function travelTo(id){
  if(!SCENE_META[id]) return;
  if(!state.unlocked.includes(id)){showToast('前头还未走到');return;}
  if(id===state.scene){closeMap();return;}
  closeMap();
  state.transitionAlpha=.7;
  enterScene(id,{side:'center'});
  showToast('已到 · '+SCENE_LABEL[id],1600);
}
function tryExit(exit){
  if(!exit) return;
  if(!exit.enabled){showToast('前头还未到时候');return;}
  if(!state.unlocked.includes(exit.to)){showToast('前头还未走到');return;}
  state.transitionAlpha=.7;
  enterScene(exit.to,{side:exit.side==='right'?'left':'right'});
  showToast('已到 · '+SCENE_LABEL[exit.to],1600);
}

/* ============================================================
   Dialogue and choice engine
   ============================================================ */
class StoryCancelled extends Error {}
function ensure(t){ if(t!==state.storyToken) throw new StoryCancelled('story cancelled'); }
function startStory(fn){
  const t=++state.storyToken;
  state.storyActive=true;
  Promise.resolve().then(()=>fn(t)).catch(err=>{
    if(!(err instanceof StoryCancelled)) console.error(err);
  }).finally(()=>{
    if(t===state.storyToken){
      state.storyActive=false;
      if(state.mode==='dialogue'||state.mode==='choice'){
        state.mode='playing'; hideDialogue(); hideChoice(); updateHUD();
      }
    }
  });
}
function hideDialogue(){ $('dialogue').classList.add('hidden'); }
function hideChoice(){ $('choice-panel').classList.add('hidden'); }
function say(t,speaker,text,opts={}){
  ensure(t);
  state.mode='dialogue';
  hidePrompt();
  hideChoice();
  const ch=CHARS[speaker]||CHARS.narrator;
  $('speaker-name').textContent=ch.name;
  $('speaker-role').textContent=ch.role||'';
  $('portrait-seal').textContent=ch.seal||'记';
  $('dialogue-text').textContent=text;
  $('dialogue-text').classList.toggle('narration',speaker==='narrator');
  drawPortrait(speaker);
  $('dialogue').classList.remove('hidden');
  // subtle ink-in animation
  const el=$('dialogue-text'); el.style.animation='none'; void el.offsetWidth; el.style.animation='inkIn .24s ease-out';
  return new Promise(resolve=>{ state.pendingResolve=resolve; });
}
function advanceDialogue(){
  if(state.mode!=='dialogue' || !state.pendingResolve) return;
  const r=state.pendingResolve;
  state.pendingResolve=null;
  r();
}
function choose(t,prompt,options){
  ensure(t);
  state.mode='choice';
  hidePrompt();
  hideDialogue();
  state.activeChoice=options;
  $('choice-scene').textContent=SCENE_META[state.scene].sceneName;
  $('choice-prompt').textContent=prompt;
  const list=$('choice-list'); list.innerHTML='';
  options.forEach((opt,i)=>{
    const b=document.createElement('button');
    b.type='button'; b.className='choice-option';
    b.innerHTML=`<span class="num">${i+1}</span><span class="option-text">${opt.text}</span>${opt.tone?`<span class="tone">${opt.tone}</span>`:''}`;
    b.addEventListener('click',(ev)=>{ev.stopPropagation();selectChoice(i);});
    list.appendChild(b);
  });
  $('choice-panel').classList.remove('hidden');
  return new Promise(resolve=>{ state.choiceResolve=resolve; });
}
function selectChoice(idx){
  if(state.mode!=='choice' || !state.choiceResolve) return;
  const r=state.choiceResolve;
  state.choiceResolve=null;
  state.activeChoice=null;
  hideChoice();
  state.mode='playing';
  r(idx);
}
const CHOICE_EFFECTS = {
  flower:[{r:2,d:-1,flag:'playful'},{r:0,d:2,flag:'restrained'},{r:1,d:1,flag:'shared'}],
  study:[{r:2,d:0,flag:'canonical'},{r:1,d:2,flag:'graceful'},{r:1,d:-1,flag:'humble'}],
  gauze:[{r:1,d:2,flag:'decline'},{r:2,d:0,flag:'accept'},{r:2,d:1,flag:'quip'}],
  baner:[{r:1,d:-2,flag:'scold'},{r:1,d:2,flag:'restrain'},{r:2,d:0,flag:'jest'}],
  joke:[{r:3,d:-1,flag:'canonical'},{r:-1,d:2,flag:'decline'},{r:2,d:1,flag:'witty'}],
  egg:[{r:2,d:0,flag:'lament'},{r:1,d:2,flag:'quip'},{r:1,d:1,flag:'mother'}],
  room:[{r:1,d:0,flag:'grandma'},{r:0,d:2,flag:'baochai'},{r:2,d:1,flag:'mediate'}],
  game:[{r:3,d:0,flag:'canonical'},{r:-1,d:2,flag:'decline'},{r:1,d:1,flag:'partial'}]
};
function applyChoice(t,key,idx){
  ensure(t);
  const e=CHOICE_EFFECTS[key][idx];
  state.stats.rapport=clamp(state.stats.rapport+e.r,0,30);
  state.stats.dignity=clamp(state.stats.dignity+e.d,0,30);
  state.flags[key]=e.flag;
  state.choices[key]=idx;
  updateHUD();
  const bits=[];
  if(e.r) bits.push('情分 '+(e.r>0?'+':'')+e.r);
  if(e.d) bits.push('体面 '+(e.d>0?'+':'')+e.d);
  if(bits.length) showToast(bits.join(' · '),1900);
}
function finishScene(t,id,next,objective){
  ensure(t);
  state.sceneState[id].done=true;
  state.sceneState[id].visited=true;
  if(next && !state.unlocked.includes(next)) state.unlocked.push(next);
  state.objective=objective;
  state.mode='playing';
  hideDialogue(); hideChoice(); hidePrompt();
  updateHUD(); renderMap();
  if(next) showToast('前路已开 · '+SCENE_LABEL[next],2600);
}
function unlockOnly(next){
  if(next && !state.unlocked.includes(next)){state.unlocked.push(next);renderMap();}
}

/* ============================================================
   Chapter I — 沁芳亭
   ============================================================ */
async function qinfangFlow(t,opts={}){
  const skipIntro=!!opts.skipIntro;
  if(!skipIntro){
    await say(t,'narrator','清早，露水未干。你带着板儿，跟着丰儿进了大观园。老太太已经坐在沁芳亭上，满园秋色，菊花开得正好。');
    await say(t,'jia','姥姥，你来了。这园子好不好？');
    await say(t,'liu','我们乡下人到了年下，都上城来买画儿贴。时常闲了，大家都说，怎么得也到画儿上去逛逛。谁知今儿进这园一瞧，竟比那画儿还强十倍。');
    await say(t,'xichun','姥姥说得好。等明儿我照这园子画一张，把姥姥也画上。');
    await say(t,'feng','老太太，让我打扮她。');
    await say(t,'narrator','凤姐拉过你，将一盘子折枝菊花横三竖四插了一头。满亭子的人都笑起来，贾母笑得直不起腰。');
  }
  const idx=await choose(t,'一盘子菊花横三竖四插了满头，凤姐还拿着花往你鬓边比。满亭子的眼睛都看着你。你要怎么应？',[
    {text:'由着凤姐插，笑道：“我这头也不知修了什么福，今儿这样体面起来。我虽老了，年轻时也风流，今儿老风流才好。”',tone:'凑趣 · 让满亭子都笑'},
    {text:'轻轻拔下几枝，只留一朵：“老太太赏一朵，就够我体面了。插多了，倒遮了老太太的园子。”',tone:'持重 · 留一分分寸'},
    {text:'把花递给板儿：“给这孩子戴，倒像个小花神。”',tone:'转圜 · 疼孙子，也不扫兴'}
  ]);
  applyChoice(t,'flower',idx);
  if(idx===0){
    await say(t,'jia','你们听听，她这张嘴！倒比这花还鲜亮。');
    await say(t,'feng','姥姥今日是老风流，明日可别忘了我这插花的手艺。');
    await say(t,'narrator','众人都笑。你也不恼，跟着笑，心里却把这满亭子的脸色一一记下了。');
  } else if(idx===1){
    await say(t,'jia','这话说得不俗。赏花不在多，在人。');
    await say(t,'feng','倒显得我轻狂了。姥姥是个有主意的。');
    await say(t,'narrator','凤姐把余下的花递给丫头，脸上仍旧笑着，只是那笑比方才淡了些。');
  } else {
    await say(t,'baner','姥姥，我不戴花，我要吃果子。');
    await say(t,'jia','这孩子倒知道疼孙子。罢了，这花给他顽罢。');
    await say(t,'feng','姥姥倒会疼人。只是板儿这一头花，倒比姥姥还体面。');
    await say(t,'narrator','满亭子又笑了一阵。板儿躲在你身后，只露出一双眼睛。');
  }
  await say(t,'jia','这园子才逛了个角儿。前头潇湘馆，是你林姑娘的屋子，咱们去坐坐。');
  await say(t,'narrator','你应了声，替板儿理了理衣裳。老太太在前，姑娘们簇拥着，一路往潇湘馆去了。');
  finishScene(t,'qinfang','xiang','往潇湘馆去，看看林姑娘的屋子');
}

/* ============================================================
   Chapter II — 潇湘馆
   ============================================================ */
async function xiangFlow(t,opts={}){
  const skipIntro=!!opts.skipIntro;
  const startAt=opts.startAt||'study';
  if(!skipIntro){
    await say(t,'narrator','进了潇湘馆，两边翠竹夹路，地上苍苔布满，中间一条石子漫的小路。你让出大路给老太太众人，自己却去走那土地。');
    await say(t,'narrator','你只顾上头和人说话，不防脚下一滑，咕咚一跤跌倒。众人拍手都笑起来。');
    await say(t,'jia','小蹄子们，还不搀起来，只站着笑。');
    await say(t,'liu','才说嘴就打了嘴。');
    await say(t,'jia','可扭了腰不曾？叫丫头们捶一捶。');
    await say(t,'liu','那里说的我这么娇嫩了。那一天不跌两下子，都要捶起来，还了得呢。');
    await say(t,'narrator','紫鹃打起湘帘，众人进来坐下。黛玉亲自用小茶盘捧了一盖碗茶来奉与贾母。');
    await say(t,'daiyu','姥姥，请坐。');
    await say(t,'liu','这窗下案上设着笔砚，又见书架上磊着满满的书。这必定是那位哥儿的书房了。');
    await say(t,'jia','这是我这外孙女儿的屋子。');
  }
  if(startAt==='gauze'){
    const g0=await choose(t,'凤姐已命人取了一匹软烟罗来。老太太说，要送你两匹。那纱轻得像一阵烟，托在手里几乎没分量。你要怎么接？',[
      {text:'连忙推辞：“这样贵重东西，给我们糊窗可惜了。留着给姑娘们做衣裳罢。”',tone:'辞让 · 不贪这份体面'},
      {text:'起身谢赏：“多谢老太太！拿回去做个帐子，够我们乡里夸一辈子。”',tone:'领情 · 把欢喜说在明处'},
      {text:'小心摸一摸：“这样轻软，拿它做帐子，夜里做梦都怕压坏了。”',tone:'说笑 · 赞到东西的好处'}
    ]);
    applyChoice(t,'gauze',g0);
    await xiangGauzeAfter(t,g0);
    return;
  }
  const idx=await choose(t,'一屋子人都看着你。方才认错了屋子，黛玉也正望着你。你要怎么接这句话？',[
    {text:'留神打量黛玉一番，笑道：“这哪像个小姐的绣房，竟比那上等的书房还好。”',tone:'原著本色 · 夸到人心里'},
    {text:'笑道：“怪不得。这样清雅的屋子，必是位神仙似的姑娘住的。”',tone:'周全 · 不叫姑娘难堪'},
    {text:'摆摆手：“我们乡下人眼拙，只认得字纸，不认得书。姑娘莫笑。”',tone:'自嘲 · 把窘处说破'}
  ]);
  applyChoice(t,'study',idx);
  if(idx===0){
    await say(t,'daiyu','姥姥谬赞了。不过几卷闲书，哪里比得上上等的书房。');
    await say(t,'jia','你听听，她倒会说话。');
    await say(t,'wang','难为姥姥，一眼就看出这屋子的好处。');
    await say(t,'narrator','黛玉低头一笑，命丫头给你倒了茶。屋里的气氛，像窗外的竹影一样，慢慢松下来。');
  } else if(idx===1){
    await say(t,'daiyu','神仙似的？姥姥这话，我可当不起。');
    await say(t,'jia','这倒也是实话。我这外孙女儿，模样是好的。');
    await say(t,'narrator','黛玉被你夸得低下头去，手里的帕子绞了一绞。王夫人看在眼里，只端起茶来。');
  } else {
    await say(t,'daiyu','姥姥说笑了。字纸糊窗，我们可舍不得。');
    await say(t,'wang','乡里人实诚，倒也不必这样自轻。');
    await say(t,'narrator','你笑着应了，心里却想：这屋子里的每一句话，都像竹子一样，节节都有讲究。');
  }
  await say(t,'jia','这窗上纱的颜色旧了。这个院子里又没有个桃杏树，这竹子已是绿的，再拿这绿纱糊上反不配。');
  await say(t,'feng','昨儿我开库房，看见大板箱里还有好些匹银红蝉翼纱，颜色又鲜，纱又轻软。');
  await say(t,'jia','呸，人人都说你没有不经过不见过，连这个纱还不认得呢。正经名字叫作“软烟罗”。');
  await say(t,'jia','那个软烟罗只有四样颜色：雨过天晴，秋香色，松绿，银红。银红的又叫作“霞影纱”。');
  await say(t,'liu','我们想他作衣裳也不能，拿着糊窗子，岂不可惜？');
  await say(t,'jia','明儿就找出几匹来，拿银红的替他糊窗子。再送这刘亲家两匹。');
  const g=await choose(t,'凤姐已命人取了一匹软烟罗来。老太太说，要送你两匹。那纱轻得像一阵烟，托在手里几乎没分量。你要怎么接？',[
    {text:'连忙推辞：“这样贵重东西，给我们糊窗可惜了。留着给姑娘们做衣裳罢。”',tone:'辞让 · 不贪这份体面'},
    {text:'起身谢赏：“多谢老太太！拿回去做个帐子，够我们乡里夸一辈子。”',tone:'领情 · 把欢喜说在明处'},
    {text:'小心摸一摸：“这样轻软，拿它做帐子，夜里做梦都怕压坏了。”',tone:'说笑 · 赞到东西的好处'}
  ]);
  applyChoice(t,'gauze',g);
  await xiangGauzeAfter(t,g);
}
async function xiangGauzeAfter(t,g){
  if(g===0){
    await say(t,'jia','给你做帐子，我挂。下剩的添上里子，做些夹背心子给丫头们穿，白收着霉坏了。');
    await say(t,'yuanyang','老太太既说，姥姥就收着。我替你包好。');
    await say(t,'narrator','你还想再辞，鸳鸯已笑着把纱交给小丫头。你只得谢了，心里倒比收了东西还安稳。');
  } else if(g===1){
    await say(t,'jia','这才是。好东西给人用，才算好东西。');
    await say(t,'feng','姥姥这一谢，倒像这纱是我们沾了你的光。');
    await say(t,'narrator','满屋的人都笑了。鸳鸯取来一块青绸包袱，把两匹软烟罗细细包好。');
  } else {
    await say(t,'jia','你听听，她倒会替这纱操心。');
    await say(t,'xue','姥姥这张嘴，把我们都比下去了。');
    await say(t,'narrator','你摸着那纱，像摸着一层薄薄的霞。凤姐在旁边看着，笑了一声，没再打趣。');
  }
  await say(t,'jia','这屋里窄，再往别处逛去。今日早饭，摆在你三妹妹那里。');
  await say(t,'feng','姥姥，还有好的呢，我都带你去瞧瞧。');
  await say(t,'narrator','你随着众人出了潇湘馆。日头高了些，竹影落在青苔上，像一地碎金。');
  finishScene(t,'xiang','qiushuang','往秋爽斋去，老太太在那里摆饭');
}

/* ============================================================
   Chapter III — 秋爽斋
   ============================================================ */

async function qiushuangFlow(t,opts={}){
  const startAt=opts.startAt||'intro';
  if(startAt==='intro'){
    await say(t,'narrator','秋爽斋三间屋子不曾隔断，当地一张花梨大理石大案，案上磊着法帖宝砚，笔海里的笔像树林一般。西墙挂着米襄阳《烟雨图》，两边是颜鲁公的对联。');
    await say(t,'narrator','那边斗大的汝窑花囊里，插着满满一囊水晶球儿的白菊。东边拔步床上，悬着葱绿双绣花卉草虫的纱帐。');
    await say(t,'tanchun','姥姥请坐。这屋子没有隔断，图个敞亮，不必拘束。');
    await say(t,'narrator','板儿先要摘那白玉比目磬的锤子，被丫鬟拦住；又要佛手吃。探春拣了一个给他：“顽罢，吃不得的。”');
    await say(t,'narrator','板儿又跑向拔步床，指着纱帐上的草虫叫：“这是蝈蝈，这是蚂蚱！”伸手便去扯那帐子。');
  }
  if(startAt==='intro'||startAt==='baner'){
    const idx=await choose(t,'板儿越发上脸，伸手去扯姑娘帐子上的绣花。满屋子人都看着你。你要怎么管他？',[
      {text:'一巴掌打在他手上，骂道：“下作黄子，没干没净的乱闹。倒叫你进来瞧瞧，就上脸了。”',tone:'原著本色 · 严管孙子'},
      {text:'忙拉住板儿，向探春赔不是：“姑娘莫怪，孩子不懂事，我替她赔礼。”',tone:'守礼 · 给姑娘留体面'},
      {text:'笑道：“乡下孩子没见过世面，见了画儿上的虫儿也当真的。姑娘莫怪。”',tone:'解围 · 把窘处化作一笑'}
    ]);
    applyChoice(t,'baner',idx);
    if(idx===0){
      await say(t,'narrator','板儿挨了一巴掌，哇的一声哭起来。你心里也疼，面上却仍旧板着。');
      await say(t,'tanchun','不妨，小孩子家，姥姥别打他。这屋里原没有什么值钱的东西。');
      await say(t,'jia','你也是，今日高兴，别为这点子事打孩子。');
      await say(t,'narrator','丫鬟忙把板儿哄到一边，拿果子给他吃。你搓了搓手，觉得自己那一巴掌，倒像打在众人眼里。');
    } else if(idx===1){
      await say(t,'baner','姥姥，我错了。');
      await say(t,'tanchun','姥姥太客气了。孩子家看见新鲜东西，哪里忍得住。');
      await say(t,'narrator','探春命丫鬟把佛手递给板儿，又叫人带他去看廊下的雀儿。你向探春欠了欠身，心里的那口气，才慢慢平下来。');
    } else {
      await say(t,'tanchun','姥姥这话有趣。他爱看，就让他看罢。');
      await say(t,'feng','还是姥姥会说话，一屋子人都叫你逗笑了。');
      await say(t,'narrator','板儿见没人打他，反倒不好意思，缩到你身边。探春把佛手塞在他手里，他捧着，不敢再动。');
    }
  }
  if(startAt!=='egg'){
    if(startAt==='joke'){
      // jump point: choice follows immediately
    } else {
      await say(t,'narrator','一时摆上饭来。鸳鸯拉你到廊下，悄悄嘱咐了一席话，又说：“这是我们家的规矩，若错了我们就笑话呢。”');
      await say(t,'yuanyang','姥姥，今日老太太高兴，我们都要取个笑儿。你只管听我的，别忘了。');
      await say(t,'liu','姑娘放心。');
      await say(t,'narrator','席上，凤姐单拿一双老年四楞象牙镶金的筷子与你，又偏拣了一碗鸽子蛋放在你桌上。');
      await say(t,'feng','姥姥，试试这个，可比你们那铁掀还沉？');
    }
    const idx=await choose(t,'满席的人都等着你开口，鸳鸯才递过眼色。你要怎么给老太太凑这个趣？',[
      {text:'站起身来，高声说道：“老刘，老刘，食量大似牛，吃一个老母猪不抬头。”自己却鼓着腮不语。',tone:'原著本色 · 满堂大笑'},
      {text:'只把筷子放下，笑道：“我是个乡下人，不会说笑话，只会吃。多吃两碗，就是给老太太添兴了。”',tone:'实诚 · 不拿自己作耍'},
      {text:'端起杯子先敬凤姐：“我先敬凤姑娘一杯。只是这鸽子蛋真个一两银子一个？若真，我可舍不得吃。”',tone:'机变 · 把取笑绕回凤姐'}
    ]);
    applyChoice(t,'joke',idx);
    if(idx===0){
      await say(t,'narrator','你站起身来，高声说道：“老刘，老刘，食量大似牛，吃一个老母猪不抬头。”自己却鼓着腮不语。');
      await say(t,'narrator','众人先是发怔，后来上上下下都哈哈大笑。湘云一口饭喷了出来，黛玉笑岔了气，伏着桌子叫嗳哟；宝玉滚到贾母怀里，贾母笑得搂着他叫“心肝”。');
      await say(t,'narrator','王夫人笑得指着凤姐说不出话；薛姨妈一口茶喷了探春一裙子；探春的饭碗合在迎春身上。独有凤姐鸳鸯还撑着，只管让菜。');
      await say(t,'jia','这定是凤丫头促狭鬼儿闹的，快别信他的话了。');
    } else if(idx===1){
      await say(t,'narrator','你没有起身说笑话，只把筷子放下，笑得实诚。满席的人等你下文，等了一会儿，也跟着笑了几声。');
      await say(t,'feng','姥姥今日倒斯文起来了。');
      await say(t,'jia','难为她实诚。罢了，别难为她，咱们吃酒。');
      await say(t,'narrator','鸳鸯看了你一眼，像是松了口气，又像是有些失望。');
    } else {
      await say(t,'narrator','你端起杯子，先向凤姐一敬。满席的人都转过脸来看凤姐，等着她答话。');
      await say(t,'feng','哎呀，倒叫姥姥将了我一军。这鸽子蛋是老太太赏的，我哪里敢说价钱。');
      await say(t,'jia','这张嘴，倒比凤丫头还利。');
      await say(t,'narrator','满席都笑了。这笑不全是看你的笑话，倒有一半是看凤姐的。');
    }
  }
  if(startAt!=='egg'){
    await say(t,'narrator','你伸箸去夹那鸽子蛋，象牙镶金的筷子沉甸甸不伏手。好容易撮起一个，才伸着脖子要吃，偏又滑下来，滚在地下。');
    await say(t,'narrator','早有地下的人捡了出去了。满席的人看着你，又笑起来。');
  }
  const e=await choose(t,'鸽子蛋滚到地下，一两银子就这样没了。你要怎么接这一句？',[
    {text:'叹道：“一两银子，也没听见响声儿就没了。”',tone:'原著本色 · 满堂又笑'},
    {text:'笑说：“这蛋比我们家的鸡还金贵，怪不得不肯叫我吃。”',tone:'自嘲 · 不叫场面冷下来'},
    {text:'不言语，悄悄把自己碗里的夹给板儿：“孩子，你吃。”',tone:'疼孙子 · 席上忽然静了一静'}
  ]);
  applyChoice(t,'egg',e);
  if(e===0){
    await say(t,'narrator','贾母笑得眼泪出来，琥珀在后捶着。满屋子人又笑了一阵。');
    await say(t,'jia','这定是凤丫头促狭鬼儿闹的。快把那筷子换了，把菜端过来给姥姥吃。');
    await say(t,'narrator','丫头忙换上乌木镶银的筷子。贾母又把自己的菜端过来与你，你谢了，心里热起来。');
  } else if(e===1){
    await say(t,'feng','姥姥这张嘴，死的也说活了。');
    await say(t,'jia','你倒会替它遮羞。快别叫她再夹了，把菜端过来。');
    await say(t,'narrator','贾母命人换了筷子，又把自己跟前的一碗菜推给你。你笑着受了，板儿在旁边也得了满满一碗。');
  } else {
    await say(t,'narrator','席上忽然静了一静。贾母看着你把菜夹给板儿，眼神软下来。');
    await say(t,'jia','可怜见儿的，还想着孩子。来人，把各样的菜给板儿夹在碗上。');
    await say(t,'yuanyang','姥姥，你也吃。今日这席，原是为着你们祖孙两个。');
    await say(t,'narrator','你低下头，把那口菜慢慢吃了。板儿捧着碗，吃得满脸都是。');
  }
  await say(t,'narrator','一时吃毕，贾母等都往探春卧室中去说闲话。这里收拾过残桌，又放了一桌。');
  await say(t,'liu','别的罢了，我只爱你们家这行事。怪道说“礼出大家”。');
  await say(t,'feng','姥姥别多心，才刚不过大家取笑儿。');
  await say(t,'yuanyang','姥姥别恼，我给你老人家赔个不是。');
  await say(t,'liu','姑娘说那里话，咱们哄着老太太开个心儿，可有什么恼的！我要心里恼，也就不说了。');
  await say(t,'jia','吃完了，咱们坐船到蘅芜苑瞧瞧你薛姑娘。');
  await say(t,'narrator','你应着，替板儿擦了擦嘴。窗外梧桐的影子，已经斜到廊下去了。');
  finishScene(t,'qiushuang','wuyuan','往蘅芜苑去，瞧瞧薛姑娘的屋子');
}

/* ============================================================
   Chapter IV — 蘅芜苑
   ============================================================ */
async function wuyuanFlow(t,opts={}){
  const startAt=opts.startAt||'intro';
  if(startAt==='intro'){
    await say(t,'narrator','从荇叶渚上船，橹声欸乃。两岸衰草残菱，更助秋情。宝玉嫌破荷叶碍眼，宝钗说这几日天天逛园子，哪里还有人来收拾。');
    await say(t,'daiyu','我最不喜欢李义山的诗，只喜他这一句：“留得残荷听雨声”。偏你们又不留着残荷了。');
    await say(t,'baoyu','果然好句。以后咱们就别叫人拔去了。');
    await say(t,'narrator','船到花溆的萝港之下，贾母见岸上清厦旷朗，便命拢岸。顺着云步石梯上去，一同进了蘅芜苑。');
    await say(t,'narrator','只觉异香扑鼻。那些奇草仙藤愈冷愈苍翠，都结了实，似珊瑚豆子一般。及进了房屋，却雪洞一般，一色玩器全无。');
    await say(t,'narrator','案上只有一个土定瓶，供着数枝菊花，并两部书、茶奁茶杯而已。床上只吊着青纱帐幔，衾褥也十分朴素。');
    await say(t,'jia','这孩子太老实了。你没有陈设，何妨和你姨娘要些。我也没理论，也没想到。');
    await say(t,'xue','他在家里也不大弄这些东西的。');
    await say(t,'jia','使不得。年轻的姑娘们，房里这样素净，也忌讳。');
  }
  const idx=await choose(t,'宝钗的屋子雪洞一般，老太太看了摇头。满屋子人都没有说话。你要怎么接这个话头？',[
    {text:'顺着贾母道：“姑娘屋里太素净了，添些花才像过日子的。”',tone:'顺着老太太 · 说一句家常'},
    {text:'替宝钗分辩：“我们乡下人看着，这样干净屋子才养人。姑娘爱清静，倒难得。”',tone:'护着姑娘 · 担一分不是'},
    {text:'笑着圆场：“老太太疼姑娘，姑娘爱清静。依我看，摆一瓶菊花就很好——又素净，又有秋意。”',tone:'圆融 · 两边都顾到'}
  ]);
  applyChoice(t,'room',idx);
  if(idx===0){
    await say(t,'jia','你听，连姥姥都这么说。年轻姑娘的屋子，太素净了，亲戚看着也不像。');
    await say(t,'baochai','老太太说得是。我原想着省事，明儿就收拾起来。');
    await say(t,'narrator','宝钗应得恭敬，脸上却淡淡的。你忽然觉得，自己这一句，像是替老太太添了一把火。');
  } else if(idx===1){
    await say(t,'baochai','姥姥是体贴我。我原爱这样清静，倒叫人看着不像了。');
    await say(t,'jia','你倒会做好人。罢了，我替你收拾，包管又大方又素净。');
    await say(t,'narrator','宝钗看了你一眼，那目光里有几分意外，也有几分谢意。');
  } else {
    await say(t,'jia','这话公道。既素净，又有秋意，倒难为你想着。');
    await say(t,'baochai','姥姥这一句，倒比我自己的话还中听。');
    await say(t,'narrator','满屋子的人都笑了。方才那一点紧绷，像被风吹开的帘子，轻轻散了。');
  }
  await say(t,'jia','鸳鸯，你把那石头盆景儿、那架纱桌屏，还有个墨烟冻石鼎，这三样摆在这案上。再把水墨字画白绫帐子拿来，把这帐子也换了。');
  await say(t,'yuanyang','这些东西都搁在东楼上的不知那个箱子里，还得慢慢找去，明儿再拿去也罢了。');
  await say(t,'jia','明日后日都使得，只别忘了。');
  await say(t,'narrator','正说着，忽一阵风过，隐隐听得鼓乐之声。贾母问是谁家娶亲，王夫人等笑回，是园中女孩子们演习吹打。');
  await say(t,'jia','既是他们演，何不叫他们进来演习。就铺排在藕香榭的水亭子上，借着水音更好听。回来咱们就在缀锦阁底下吃酒。');
  await say(t,'narrator','众人称好。你跟着出了蘅芜苑，天色渐渐向晚，水面上浮起一层薄薄的金。');
  finishScene(t,'wuyuan','zhuijin','往缀锦阁去，赴老太太的席');
}

/* ============================================================
   Chapter V — 缀锦阁
   ============================================================ */
async function zhuijinFlow(t,opts={}){
  const startAt=opts.startAt||'intro';
  if(startAt==='intro'){
    await say(t,'narrator','缀锦阁下，铺陈整齐。上面左右两张榻，每一榻前两张雕漆几，海棠式、梅花式、荷叶式、葵花式，其式不一。');
    await say(t,'narrator','每人一把乌银洋錾自斟壶，一个十锦珐琅杯。天色向晚，水亭上鼓乐隐隐，红烛把湖水照得一片暖。');
    await say(t,'jia','咱们先吃两杯，今日也行一令才有意思。');
    await say(t,'xue','老太太自然有好酒令，我们如何会呢，安心要我们醉了。');
    await say(t,'wang','便说不上来，就便多吃一杯酒，醉了睡觉去，还有谁笑话咱们不成。');
    await say(t,'feng','既行令，还叫鸳鸯姐姐来行更好。');
    await say(t,'narrator','鸳鸯半推半就，谢了坐，也吃了一钟酒。');
    await say(t,'yuanyang','酒令大如军令，不论尊卑，惟我是主。违了我的话，是要受罚的。');
    await say(t,'narrator','你听了，忙下席摆手：“别这样捉弄人家，我家去了。”鸳鸯喝令小丫头子们：“拉上席去！”众人都笑着，果然把你拉入席中。');
    await say(t,'yuanyang','再多言的罚一壶。');
    await say(t,'narrator','你方住了声。鸳鸯说起骨牌副儿，从老太太起，顺领说下去。');
    await say(t,'narrator','贾母说“头上有青天”“六桥梅花香彻骨”；薛姨妈说“梅花朵朵风前舞”；湘云说“双悬日月照乾坤”；宝钗说“双双燕子语梁间”。');
    await say(t,'narrator','黛玉说“良辰美景奈何天”，宝钗回头看了她一眼；黛玉只顾怕罚，也不理论。迎春错了韵，笑着饮了一口。');
    await say(t,'yuanyang','左边“四四”是个人。姥姥，到你了。');
  } else if(startAt!=='game'){
    await say(t,'narrator','鸳鸯说起骨牌副儿，从老太太起，顺领说下去。轮到你了，满席的人都安静下来。');
    await say(t,'yuanyang','左边“四四”是个人。姥姥，到你了。');
  }
  const idx=await choose(t,'轮到你了。满席的人都知道凤姐和鸳鸯要听什么。你要怎么行这一令？',[
    {text:'想了一想，笑道：“是个庄家人罢。”接着道：“大火烧了毛毛虫”“一个萝卜一头蒜”“花儿落了结个大倭瓜”。',tone:'原著本色 · 把乡野说成诗'},
    {text:'起身摆手：“老太太、姑奶奶们，这令大如军令，我可真不会。情愿吃三杯，饶了我罢。”',tone:'求饶 · 守住自己的分寸'},
    {text:'只说头一句：“是个庄家人罢。下头的，我可编不上来了。”',tone:'半让 · 留一半，退一半'}
  ]);
  applyChoice(t,'game',idx);
  if(idx===0){
    await say(t,'narrator','你两只手比着，说道：“花儿落了结个大倭瓜。”满屋子人笑得前仰后合。');
    await say(t,'jia','说的好，就是这样说。');
    await say(t,'liu','我们庄家人，不过是现成的本色，众位别笑。');
    await say(t,'feng','姥姥这本色，比诗还妙。');
    await say(t,'narrator','鸳鸯也撑不住笑了，替你斟满一杯。水亭上的鼓乐正巧奏到热闹处，满园的灯影都晃起来。');
  } else if(idx===1){
    await say(t,'narrator','你连吃了三杯，脸上泛起红来。鸳鸯还要再劝，贾母却摆了摆手。');
    await say(t,'jia','罢了，别难为她。她一个乡里人，能坐到这会儿，已经难为了。');
    await say(t,'narrator','席上静了一静。凤姐笑着转去说别的，鸳鸯也替你换了热茶。那最热闹的一阵笑，终究没有响起来。');
  } else {
    await say(t,'narrator','你说了一句，便笑着求饶。满席的人有的笑，有的替你遮掩。鸳鸯便道：“也罢，算你过。”');
    await say(t,'jia','这一句也尽够了。');
    await say(t,'narrator','你饮了半杯，心里知道自己没有全放开，也没有全缩回去。这半日的分寸，到这里刚刚好。');
  }
  let ending='afterglow';
  if(idx===1) ending='dignified';
  else if(idx===0 && state.flags.joke==='canonical' && state.stats.rapport>=12) ending='canonical';
  await say(t,'narrator',ending==='canonical'?'夜风从水面上来，吹得满席的灯影乱晃。你坐在老太太下手，忽然觉得，这园子再大，此刻也有一角是容得下你的。':ending==='dignified'?'你放下酒杯，望了望水亭上的灯。那灯影落在湖里，碎成一片一片，像你此刻说不清的心事。':'你抬头看天，暮色已经沉下来。远处水亭上还在奏乐，近处的人声却慢慢低了。');
  showEnding(ending);
}

/* ============================================================
   Ambient conversations after a scene has unfolded
   ============================================================ */
const AMBIENT = {
  qinfang: {
    jia:()=>[['jia','这园子大，慢慢逛，别拘束。前头潇湘馆的竹子好，你去看看。']],
    feng:()=>state.flags.flower==='restrained'
      ? [['feng','姥姥今日只簪一朵，倒显得我们轻狂了。']]
      : [['feng','姥姥这满头花，倒比我们都鲜亮。明儿还想不想再戴？']],
    xichun:()=>[['xichun','我正想着，把今日这园子画下来。姥姥说，画里要不要有板儿？'],['liu','要的要的，画上他，叫他回去也威风一日。']],
    baner:()=>[['baner','姥姥，我饿了。那果子什么时候吃？'],['liu','快了，到了你三姨奶奶那里，可不许再乱动东西。']]
  },
  xiang: {
    daiyu:()=>state.flags.study==='canonical'
      ? [['daiyu','姥姥方才那句话，倒比许多读过书的人说得中听。']]
      : [['daiyu','姥姥坐一坐，喝口茶罢。这屋子窄，别嫌委屈。']],
    jia:()=>[['jia','你三妹妹那里摆了饭，咱们这就过去。']],
    wang:()=>[['wang','老太太今日高兴，你多陪她说说笑笑。']],
    feng:()=>[['feng','姥姥，那两匹软烟罗，我替你包好了。回去做帐子，可别忘了我们。']],
    baner:()=>[['baner','姥姥，这竹子这么高，能砍一根做钓竿么？'],['liu','胡说，姑娘的竹子，动一根也了不得。']]
  },
  qiushuang: {
    tanchun:()=>[['tanchun','这屋子没有隔断，图个敞亮。姥姥若爱，多坐一会儿。']],
    feng:()=>state.flags.joke==='decline'
      ? [['feng','姥姥今日倒稳当。只是老太太没听够笑话，回去怕要念叨。']]
      : [['feng','姥姥，今日这满堂的笑，可都记在你身上了。']],
    yuanyang:()=>[['yuanyang','姥姥别恼，今日不过是大家取笑儿。你心里若有不自在，只管对我说。']],
    jia:()=>[['jia','吃完了，咱们坐船去蘅芜苑。你薛姑娘的屋子，素净得很。']],
    baner:()=>[['baner','姥姥，佛手不能吃，那我拿着顽，行么？'],['liu','拿着罢，别碰坏了姑娘的东西。']]
  },
  wuyuan: {
    baochai:()=>state.flags.room==='baochai'
      ? [['baochai','姥姥方才替我说话，我记在心里。这样干净屋子，原是我懒怠收拾。']]
      : [['baochai','让姥姥见笑了。我原不爱这些陈设，老太太偏说我太素净。']],
    jia:()=>[['jia','你看这屋子，素净得过了分。年轻姑娘，总要有些颜色才好。']],
    xue:()=>[['xue','这孩子在家里也不大弄这些东西，倒叫老太太操心。']],
    yuanyang:()=>[['yuanyang','那些石头盆景、纱桌屏，我明儿就找出来。姥姥若得闲，也来看看。']]
  },
  zhuijin: {
    jia:()=>[['jia','今日这席，倒比往年热闹。']],
    yuanyang:()=>[['yuanyang','姥姥，酒令大如军令，你可别怪我方才凶。']],
    feng:()=>[['feng','姥姥这张嘴，今日把我们都比下去了。']],
    baner:()=>[['baner','姥姥，这园子里的灯，比我们村里的星星还多。']]
  }
};
function ambientLines(scene,id){
  const f=AMBIENT[scene]&&AMBIENT[scene][id];
  if(f) return f();
  return [[id,'园中光阴短，咱们往前走走罢。']];
}
function talkTo(npc){
  if(state.mode!=='playing') return;
  const lines=ambientLines(state.scene,npc.id);
  startStory(async t=>{
    for(const [speaker,text] of lines){
      await say(t,speaker,text);
    }
  });
}

/* ============================================================
   Endings
   ============================================================ */
const ENDINGS = {
  canonical:{
    kicker:'结局 · 原著之径',
    title:'尽兴而归',
    kind:'warm',
    text:'满园的笑声顺着水亭飘出去。贾母笑得眼泪都出来了，命人把攒盒里的菜拣了几样，连同先前那两匹软烟罗，都送与你。鸳鸯亲自替你斟满一杯，笑道：“姥姥，今日可别恼。”你摆摆手：“姑娘说那里话，咱们哄着老太太开个心儿，可有什么恼的。”\n你坐在老太太下手，听着满园的笑。水亭上的鼓乐、湖里的灯影、姑娘们头上的花，都拢在这一刻里。你忽然觉得，这园子再大，此刻也有一角是容得下你的。',
    quote:'刘姥姥两只手比著，说道：“花儿落了结个大倭瓜。”众人大笑起来。\n——第四十回末句',
    tag:'你让一园人都笑了',
    note:'情分极厚 · 你把自己放得很低，却把这一日抬得很高'
  },
  dignified:{
    kicker:'结局 · 另一种分寸',
    title:'体面而还',
    kind:'cool',
    text:'你没有把那句“花儿落了结个大倭瓜”说出口，只连吃了三杯。脸上热，心里却清明。贾母没有勉强，只叫人把攒盒里的菜拣了几样，又取两匹软烟罗包好，递与你：“难为你陪我们这半日。”\n你谢了恩，带着板儿从二门出去。身后水亭上仍有笑语，那笑声不是你的，你也不觉得冷清。你想：乡里人进一趟城，能这样体体面面地回去，已经够了。',
    quote:'“别的罢了，我只爱你们家这行事。怪道说‘礼出大家’。”\n——刘姥姥',
    tag:'你把后半截笑话咽了回去',
    note:'体面守住了 · 有些热闹，原也不必凑完'
  },
  afterglow:{
    kicker:'结局 · 半日清欢',
    title:'秋窗余兴',
    kind:'glimmer',
    text:'你说了一句庄家话，便笑着住了口。满席的人笑了一阵，也就转去说别的。贾母仍叫人给你添菜，鸳鸯也替你斟了酒。只是那最热闹的一阵笑，终究没有响起来。\n散席时，天色已经暗了。你带着板儿走过沁芳亭，水里映着灯影。你想起早上的菊花、潇湘馆的竹子、秋爽斋的佛手，觉得这一日像做了半场好梦。梦没有做完，也不算坏。',
    quote:'“我最不喜欢李义山的诗，只喜他这一句：‘留得残荷听雨声’。”\n——林黛玉',
    tag:'你只说了半令',
    note:'半日清欢 · 不很尽兴，也不曾失了自己'
  }
};
const CHOICE_LABELS = {
  flower:['簪花凑趣','只簪一朵','花赠板儿'],
  study:['书房之赞','神仙姑娘','自认眼拙'],
  gauze:['辞让软烟罗','欢喜领赏','说笑受赠'],
  baner:['打了板儿','赔礼教子','自嘲解围'],
  joke:['老刘老刘','不作耍','反敬凤姐'],
  egg:['一两银子','蛋比鸡贵','夹给板儿'],
  room:['顺着老太太','护着宝钗','菊花圆场'],
  game:['庄家本色','求饶吃酒','半让半退']
};
function choiceSummary(){
  const keys=['flower','study','gauze','baner','joke','egg','room','game'];
  const arr=[];
  for(const k of keys){
    if(state.choices[k]!==undefined) arr.push(CHOICE_LABELS[k][state.choices[k]]);
  }
  return arr.slice(-4).join(' · ');
}
function showEnding(kind){
  const e=ENDINGS[kind]||ENDINGS.afterglow;
  state.mode='ending';
  state.ending=kind;
  state.pendingResolve=null;
  state.choiceResolve=null;
  state.activeChoice=null;
  hideDialogue(); hideChoice(); hidePrompt();
  $('hud').classList.add('hidden');
  $('map-overlay').classList.add('hidden');
  $('pause-overlay').classList.add('hidden');
  $('chapter-flash').classList.add('hidden');
  if(state.flashTimer){clearTimeout(state.flashTimer);state.flashTimer=null;}
  const screen=$('ending-screen');
  screen.dataset.kind=e.kind;
  $('ending-kicker').textContent=e.kicker;
  $('ending-title').textContent=e.title;
  $('ending-text').textContent=e.text;
  $('ending-quote').textContent=e.quote;
  $('ending-summary').innerHTML=
    `<span>情分 <b>${state.stats.rapport}</b></span>`+
    `<span>体面 <b>${state.stats.dignity}</b></span>`+
    `<span>${e.tag}</span>`+
    (choiceSummary()?`<span>此日之选：<b>${choiceSummary()}</b></span>`:'')+
    `<span>${e.note}</span>`;
  screen.classList.remove('hidden');
  screen.style.animation='none'; void screen.offsetWidth; screen.style.animation='';
}

/* ============================================================
   Title / reset / pause
   ============================================================ */
function clearHash(){
  try{ history.replaceState(null,'',location.pathname+location.search); }catch(e){}
}
function showTitleScreen(){
  resetGameData();
  state.mode='title';
  $('title-screen').classList.remove('hidden');
  $('intro-screen').classList.add('hidden');
  $('ending-screen').classList.add('hidden');
  $('hud').classList.add('hidden');
  $('pause-overlay').classList.add('hidden');
  $('map-overlay').classList.add('hidden');
  $('chapter-flash').classList.add('hidden');
  hideDialogue(); hideChoice(); hidePrompt();
}
function openIntro(){
  resetGameData();
  state.mode='intro';
  $('title-screen').classList.add('hidden');
  $('intro-screen').classList.remove('hidden');
  $('hud').classList.add('hidden');
}
function startNewGame(){
  clearHash();
  resetGameData();
  state.started=true;
  $('title-screen').classList.add('hidden');
  $('intro-screen').classList.add('hidden');
  $('ending-screen').classList.add('hidden');
  $('pause-overlay').classList.add('hidden');
  $('hud').classList.remove('hidden');
  enterScene('qinfang',{side:'center'});
}
function openPause(){
  if(state.mode!=='playing') return;
  state.pausedFrom='playing';
  state.mode='paused';
  hidePrompt();
  $('pause-overlay').classList.remove('hidden');
}
function resumeGame(){
  if(state.mode!=='paused') return;
  state.mode='playing';
  $('pause-overlay').classList.add('hidden');
  updatePrompt();
}

/* ============================================================
   Jump points (for evaluation)
   ============================================================ */
const JUMP_SETUP = {
  C1:{scene:'qinfang',r:2,d:2,flags:{},choices:{},done:[],unlock:['qinfang']},
  C2:{scene:'xiang',r:4,d:1,flags:{flower:'playful'},choices:{flower:0},done:['qinfang'],unlock:['qinfang','xiang']},
  C3:{scene:'xiang',r:6,d:1,flags:{flower:'playful',study:'canonical'},choices:{flower:0,study:0},done:['qinfang','xiang'],unlock:['qinfang','xiang','qiushuang']},
  C4:{scene:'qiushuang',r:8,d:2,flags:{flower:'playful',study:'canonical',gauze:'quip'},choices:{flower:0,study:0,gauze:2},done:['qinfang','xiang'],unlock:['qinfang','xiang','qiushuang']},
  C5:{scene:'qiushuang',r:10,d:2,flags:{flower:'playful',study:'canonical',gauze:'quip',baner:'jest'},choices:{flower:0,study:0,gauze:2,baner:2},done:['qinfang','xiang'],unlock:['qinfang','xiang','qiushuang']},
  C6:{scene:'qiushuang',r:13,d:1,flags:{flower:'playful',study:'canonical',gauze:'quip',baner:'jest',joke:'canonical'},choices:{flower:0,study:0,gauze:2,baner:2,joke:0},done:['qinfang','xiang'],unlock:['qinfang','xiang','qiushuang']},
  C7:{scene:'wuyuan',r:15,d:1,flags:{flower:'playful',study:'canonical',gauze:'quip',baner:'jest',joke:'canonical',egg:'lament'},choices:{flower:0,study:0,gauze:2,baner:2,joke:0,egg:0},done:['qinfang','xiang','qiushuang'],unlock:['qinfang','xiang','qiushuang','wuyuan']},
  C8:{scene:'zhuijin',r:17,d:2,flags:{flower:'playful',study:'canonical',gauze:'quip',baner:'jest',joke:'canonical',egg:'lament',room:'mediate'},choices:{flower:0,study:0,gauze:2,baner:2,joke:0,egg:0,room:2},done:['qinfang','xiang','qiushuang','wuyuan'],unlock:['qinfang','xiang','qiushuang','wuyuan','zhuijin']}
};
const JUMP_OBJECTIVES = {
  C1:'陪老太太在园中逛逛',C2:'在潇湘馆陪老太太说话',C3:'在潇湘馆看那软烟罗',
  C4:'在秋爽斋看姑娘的屋子',C5:'在秋爽斋陪老太太用饭',C6:'在秋爽斋用饭',
  C7:'在蘅芜苑看姑娘的屋子',C8:'赴席行牙牌令'
};
function applyJump(id){
  if(!id) return;
  id=String(id).toUpperCase();
  if(id.startsWith('E') || id==='ENDING1' || id==='ENDING2' || id==='ENDING3'){
    const map={E1:'canonical',E2:'dignified',E3:'afterglow',ENDING1:'canonical',ENDING2:'dignified',ENDING3:'afterglow'};
    const kind=map[id];
    if(!kind) return false;
    resetGameData();
    state.started=true;
    state.scene='zhuijin';
    state.sceneState=freshSceneState();
    for(const k of SCENE_ORDER){state.sceneState[k].visited=true;state.sceneState[k].done=true;}
    state.unlocked=[...SCENE_ORDER];
    state.stats = kind==='canonical'?{rapport:20,dignity:2}:kind==='dignified'?{rapport:16,dignity:4}:{rapport:18,dignity:3};
    state.flags={flower:'playful',study:'canonical',gauze:'quip',baner:'jest',joke:'canonical',egg:'lament',room:'mediate',game:kind==='canonical'?'canonical':kind==='dignified'?'decline':'partial'};
    state.choices={flower:0,study:0,gauze:2,baner:2,joke:0,egg:0,room:2,game:kind==='canonical'?0:kind==='dignified'?1:2};
    state.objective='席散';
    $('title-screen').classList.add('hidden');
    $('intro-screen').classList.add('hidden');
    $('hud').classList.add('hidden');
    $('pause-overlay').classList.add('hidden');
    showEnding(kind);
    return true;
  }
  const setup=JUMP_SETUP[id];
  if(!setup) return false;
  resetGameData();
  state.started=true;
  state.mode='playing';
  state.scene=setup.scene;
  state.stats={rapport:setup.r,dignity:setup.d};
  state.flags={...setup.flags};
  state.choices={...setup.choices};
  state.sceneState=freshSceneState();
  for(const d of setup.done){state.sceneState[d].visited=true;state.sceneState[d].done=true;}
  state.sceneState[setup.scene].visited=true;
  state.unlocked=[...setup.unlock];
  state.objective=JUMP_OBJECTIVES[id]||SCENE_META[setup.scene].objective;
  const sp=sceneSpawn(setup.scene,'center');
  state.player={x:sp.x,y:sp.y,facing:1,target:null,moving:false,walkPhase:0};
  $('title-screen').classList.add('hidden');
  $('intro-screen').classList.add('hidden');
  $('ending-screen').classList.add('hidden');
  $('pause-overlay').classList.add('hidden');
  $('hud').classList.remove('hidden');
  $('chapter-flash').classList.add('hidden');
  updateHUD(); renderMap(); updatePrompt();
  startStory(async t=>{
    if(id==='C1') await qinfangFlow(t,{skipIntro:true});
    else if(id==='C2') await xiangFlow(t,{skipIntro:true});
    else if(id==='C3') await xiangFlow(t,{skipIntro:true,startAt:'gauze'});
    else if(id==='C4') await qiushuangFlow(t,{startAt:'baner'});
    else if(id==='C5') await qiushuangFlow(t,{startAt:'joke'});
    else if(id==='C6') await qiushuangFlow(t,{startAt:'egg'});
    else if(id==='C7') await wuyuanFlow(t,{startAt:'room'});
    else if(id==='C8') await zhuijinFlow(t,{startAt:'game'});
  });
  return true;
}
function checkHashJump(){
  const m=location.hash.match(/^#jump=([A-Za-z0-9_-]+)$/);
  if(!m) return;
  if(applyJump(m[1])) showToast('已跳转 · '+m[1].toUpperCase(),1500);
}

/* ============================================================
   Input, loop and boot
   ============================================================ */
function interact(){
  if(state.mode!=='playing') return;
  const thing=nearestThing();
  if(!thing){return;}
  if(thing.type==='npc') talkTo(thing.npc);
  else tryExit(thing.exit);
}
function canvasCoords(ev){
  const r=canvas.getBoundingClientRect();
  return {x:(ev.clientX-r.left)*(W/r.width),y:(ev.clientY-r.top)*(H/r.height)};
}
function onClickCanvas(ev){
  if(state.mode!=='playing') return;
  const {x,y}=canvasCoords(ev);
  // click a character
  let hit=null;
  for(const npc of SCENE_NPCS[state.scene]||[]){
    if(Math.abs(x-npc.x)<62 && y>npc.y-205 && y<npc.y+28){hit=npc;break;}
  }
  if(hit){
    const p=state.player;
    if(Math.hypot(p.x-hit.x,p.y-hit.y)<150){talkTo(hit);}
    else{
      state.followPending={type:'npc',npc:hit,x:hit.x,y:hit.y};
      const side=p.x<hit.x?-1:1;
      p.target={x:clamp(hit.x+side*82,70,1210),y:clamp(hit.y+8,520,690)};
    }
    return;
  }
  // click an exit sign / edge
  const exits=exitsFor(state.scene);
  for(const e of exits){
    if(e.side==='right' && x>1120){state.followPending={type:'exit',exit:e,x:1180,y:650};state.player.target={x:1170,y:650};return;}
    if(e.side==='left' && x<160){state.followPending={type:'exit',exit:e,x:80,y:650};state.player.target={x:90,y:650};return;}
  }
  state.player.target={x:clamp(x,70,1210),y:clamp(y,522,690)};
  state.followPending=null;
}
function handleKeyDown(e){
  const k=e.key.toLowerCase();
  if(['arrowleft','arrowright','arrowup','arrowdown',' '].includes(k)) e.preventDefault();
  if(e.repeat && !['arrowleft','arrowright','arrowup','arrowdown','w','a','s','d'].includes(k)) return;
  if(state.mode==='title'){
    if(k==='enter'||k===' ') openIntro();
    return;
  }
  if(state.mode==='intro'){
    if(k==='enter'||k===' ') startNewGame();
    return;
  }
  if(state.mode==='dialogue'){
    if(k===' '||k==='enter'||k==='e') advanceDialogue();
    return;
  }
  if(state.mode==='choice'){
    if(k==='1'||k==='2'||k==='3') selectChoice(parseInt(k,10)-1);
    return;
  }
  if(state.mode==='map'){
    if(k==='m'||k==='escape') closeMap();
    return;
  }
  if(state.mode==='paused'){
    if(k==='escape') resumeGame();
    return;
  }
  if(state.mode==='ending') return;
  if(state.mode!=='playing') return;
  if(['arrowleft','a','arrowright','d','arrowup','w','arrowdown','s'].includes(k)){
    keys[k]=true;
    if(k==='arrowleft'||k==='a') keys['arrowleft']=true,keys['a']=true;
    if(k==='arrowright'||k==='d') keys['arrowright']=true,keys['d']=true;
    if(k==='arrowup'||k==='w') keys['arrowup']=true,keys['w']=true;
    if(k==='arrowdown'||k==='s') keys['arrowdown']=true,keys['s']=true;
    return;
  }
  if(k==='e'||k===' '||k==='enter'){interact();return;}
  if(k==='m'){openMap();return;}
  if(k==='escape'){openPause();return;}
}
function handleKeyUp(e){
  const k=e.key.toLowerCase();
  keys[k]=false;
  if(k==='arrowleft'||k==='a'){keys['arrowleft']=false;keys['a']=false;}
  if(k==='arrowright'||k==='d'){keys['arrowright']=false;keys['d']=false;}
  if(k==='arrowup'||k==='w'){keys['arrowup']=false;keys['w']=false;}
  if(k==='arrowdown'||k==='s'){keys['arrowdown']=false;keys['s']=false;}
}
function fitStage(){
  const s=Math.min(window.innerWidth/W,window.innerHeight/H);
  $('stage').style.transform=`scale(${s})`;
}
let lastFrame=performance.now();
function frame(now){
  const dt=Math.min(.05,(now-lastFrame)/1000);
  lastFrame=now;
  state.time+=dt;
  if(state.mode!=='paused') updateMovement(dt);
  const liftTarget=state.mode==='dialogue'?1:0;
  state.uiLift+=(liftTarget-state.uiLift)*Math.min(1,dt*10);
  if(state.mode==='playing' && state.pendingSceneStart){
    const sid=state.pendingSceneStart; state.pendingSceneStart=null;
    if(state.scene===sid && !state.sceneState[sid].done) startSceneFlow(sid);
  }
  if(state.mode==='playing') updatePrompt(); else hidePrompt();
  if(state.transitionAlpha>0) state.transitionAlpha=Math.max(0,state.transitionAlpha-dt*1.9);
  if(state.mode==='title'||state.mode==='intro') drawTitleScene(state.time);
  else if(state.mode==='ending') drawEndingScene(state.time);
  else drawScene(state.time);
  requestAnimationFrame(frame);
}
function initUI(){
  $('start-btn').addEventListener('click',()=>{openIntro();$('start-btn').blur();});
  $('intro-btn').addEventListener('click',()=>{startNewGame();$('intro-btn').blur();});
  $('ending-restart').addEventListener('click',()=>{startNewGame();$('ending-restart').blur();});
  $('ending-title').addEventListener('click',()=>{clearHash();showTitleScreen();$('ending-title').blur();});
  $('map-btn').addEventListener('click',()=>{openMap();$('map-btn').blur();});
  $('resume-btn').addEventListener('click',()=>{resumeGame();$('resume-btn').blur();});
  $('restart-btn').addEventListener('click',()=>{startNewGame();$('restart-btn').blur();});
  $('quit-btn').addEventListener('click',()=>{clearHash();showTitleScreen();$('quit-btn').blur();});
  $('dialogue').addEventListener('click',()=>advanceDialogue());
  canvas.addEventListener('click',onClickCanvas);
  document.addEventListener('keydown',handleKeyDown);
  document.addEventListener('keyup',handleKeyUp);
  window.addEventListener('resize',fitStage);
  window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#jump=')) checkHashJump();});
  $('map-overlay').addEventListener('click',(ev)=>{if(ev.target===$('map-overlay'))closeMap();});
}
function boot(){
  initUI();
  fitStage();
  showTitleScreen();
  requestAnimationFrame(frame);
  setTimeout(checkHashJump,60);
}
boot();
