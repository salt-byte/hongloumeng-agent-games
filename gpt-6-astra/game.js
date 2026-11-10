'use strict';
const $=id=>document.getElementById(id), canvas=$('world'),ctx=canvas.getContext('2d');
const W=1280,H=720, FONT='"Songti SC","Noto Serif CJK SC","SimSun",serif';
const chars={
 liu:{name:'刘姥姥',role:'庄家老人 · 你',robe:'#756a49',trim:'#c3b08b',hair:'#bbb5a0',skin:'#cba77d'},
 jia:{name:'贾母',role:'贾府老太太',robe:'#66536b',trim:'#cab581',hair:'#ded9c3',skin:'#e6c5a0'},
 feng:{name:'凤姐',role:'管家奶奶',robe:'#a84e3f',trim:'#dec489',hair:'#293631',skin:'#edc9a7'},
 yuan:{name:'鸳鸯',role:'贾母的贴身丫鬟',robe:'#b07b57',trim:'#dfc49a',hair:'#263b35',skin:'#e7bf99'},
 dai:{name:'林黛玉',role:'潇湘馆主人',robe:'#a6bcb0',trim:'#e8e2c7',hair:'#263833',skin:'#edcfb6'},
 bao:{name:'薛宝钗',role:'蘅芜苑主人',robe:'#b9ac83',trim:'#e5d8b4',hair:'#293b34',skin:'#ebcba8'},
 li:{name:'李纨',role:'预备茶酒的奶奶',robe:'#777e76',trim:'#cec7a6',hair:'#2d3b34',skin:'#e5c09c'},
 amber:{name:'琥珀',role:'贾母身边的丫鬟',robe:'#b7a26e',trim:'#e8d3a9',hair:'#293a30',skin:'#e7c29c'},
 narrator:{name:'园中记',role:'这一日的见闻',robe:'#6e8063',trim:'#cbbd94',hair:'#333',skin:'#dbbd98'}
};
const scenes={
 qin:{name:'沁芳亭',act:'壹 · 入画',desc:'秋菊簪鬓，画里逢人',next:'xiao',npcs:[['li',350,490],['jia',600,433],['feng',850,481]],spots:[['菊花盘',1000,397,'荷叶式的翡翠盘中，盛着各色折枝菊花。园里的富贵，连秋天也簪在头上。']]},
 xiao:{name:'潇湘馆',act:'贰 · 翠竹',desc:'翠竹夹路，书香满窗',next:'qiu',npcs:[['amber',346,485],['dai',688,448],['jia',944,492]],spots:[['窗下书案',800,372,'笔砚在案，书架磊满了书。原来这并不是哪位哥儿的书房，而是林姑娘的屋子。']]},
 qiu:{name:'秋爽斋',act:'叁 · 入席',desc:'一双牙箸，一席笑声',next:'heng',npcs:[['yuan',455,471],['feng',830,482],['li',1020,422]],spots:[['白菊与佛手',298,382,'花囊里满是水晶球儿似的白菊，盘里盛着娇黄的佛手。阔朗三间屋子，都是三姑娘的气度。']]},
 heng:{name:'蘅芜苑',act:'肆 · 素室',desc:'奇草生香，雪洞无华',next:'zhui',npcs:[['bao',595,439],['jia',913,484]],spots:[['土定瓶',745,373,'一只土定瓶，几枝菊花，两部书，茶奁茶杯。热闹园子里，偏有这样一间素净的屋子。']]},
 zhui:{name:'缀锦阁',act:'伍 · 本色',desc:'隔水听曲，牙牌传令',next:null,npcs:[['jia',486,435],['yuan',796,466],['feng',1017,498]],spots:[['雕漆花几',650,375,'海棠式、梅花式、荷叶式，几与攒盒各随其形。藕香榭的曲声隔水传来，席上正待行令。']]}
};
let state,mode='title',scene='qin',player={x:260,y:557},target=null,keys={},dialog=null,queue=[],afterQueue=null,near=null,hover=null,clock=0,last=0,toastTimer=0,flashTimer=0,laughUntil=0,saveOK=true;
const fresh=()=>({scene:'qin',flowers:null,path:null,silk:false,feast:null,reply:null,plain:false,cards:null,notes:[],visited:['qin'],ending:null});
state=fresh();
function resize(){const s=Math.min(innerWidth/W,innerHeight/H);$('game').style.transform=`scale(${s})`;$('game').style.left=(innerWidth-W*s)/2+'px';$('game').style.top=(innerHeight-H*s)/2+'px'}
addEventListener('resize',resize);resize();
function rand(seed){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}}
function poly(c,pts,fill,stroke=null,lw=1){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke()}}
function line(c,pts,color,width=1){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.strokeStyle=color;c.lineWidth=width;c.stroke()}
function ellipse(c,x,y,rx,ry,color){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill()}
function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h)}
function text(c,str,x,y,size=16,color='#344e42',align='center'){c.font=`${size}px ${FONT}`;c.fillStyle=color;c.textAlign=align;c.fillText(str,x,y)}
function flower(c,x,y,size,color='#c3aa5c'){for(let i=0;i<9;i++){let a=i*Math.PI*2/9;ellipse(c,x+Math.cos(a)*size*.6,y+Math.sin(a)*size*.6,size*.45,size*.35,color)}ellipse(c,x,y,size*.26,size*.26,'#ad8248')}
function rock(c,x,y,s){poly(c,[[x-s,y],[x-s*.73,y-s*.65],[x-s*.3,y-s],[x+s*.25,y-s*.85],[x+s*.7,y-s*.48],[x+s,y],[x+s*.4,y+s*.16]],'#929c85','#768976');line(c,[[x-s*.3,y-s],[x-s*.1,y-s*.25],[x+s*.4,y]],'#bbc0a6',2);line(c,[[x+s*.25,y-s*.85],[x+s*.1,y-s*.4],[x+s*.7,y-s*.48]],'#6f8373')}
function tree(c,x,y,s,seed=1,color='#72896a'){const r=rand(seed);line(c,[[x,y],[x-10*s,y-82*s],[x+10*s,y-160*s],[x-2*s,y-218*s]],'#606b52',11*s);for(let i=0;i<18;i++){let dx=(r()-.5)*125*s,dy=y-(145+r()*105)*s;line(c,[[x,y-100*s],[x+dx,dy]],'#697355',3*s);for(let j=0;j<7;j++){let xx=x+dx+(r()-.5)*55*s,yy=dy+(r()-.5)*35*s;ellipse(c,xx,yy,(16+r()*17)*s,(10+r()*12)*s,color)}}}
function bamboo(c,x,y,s,seed){const r=rand(seed);for(let i=0;i<9;i++){let bx=x+(r()-.5)*90*s,top=y-(160+r()*100)*s;line(c,[[bx,y],[bx+8*s,top]],'#5c8062',3*s);for(let yy=y-20*s;yy>top;yy-=28*s){line(c,[[bx-2*s,yy],[bx+4*s,yy]],'#b2bc8d',2*s);if(r()>.35){let dir=r()>.5?1:-1;for(let k=0;k<4;k++){let ex=bx+dir*(22+k*9)*s,ey=yy-(12+k*5)*s;line(c,[[bx,yy],[ex,ey]],'#58765a',s);poly(c,[[ex-13*s*dir,ey+5*s],[ex+16*s*dir,ey-8*s],[ex,ey+3*s]],'#54745b')}}}}}
function lattice(c,x,y,w,h,base='#b0b6a0',wood='#6c7760'){rect(c,x,y,w,h,base);c.strokeStyle=wood;c.lineWidth=3;c.strokeRect(x,y,w,h);for(let xx=x+12;xx<x+w;xx+=17)line(c,[[xx,y],[xx,y+h]],wood,1);for(let yy=y+12;yy<y+h;yy+=18)line(c,[[x,yy],[x+w,yy]],wood,1);for(let xx=x+8;xx<x+w-8;xx+=34)for(let yy=y+9;yy<y+h-8;yy+=36)poly(c,[[xx,yy-7],[xx+7,yy],[xx,yy+7],[xx-7,yy]],null,wood,.7)}
function roof(c,x,y,w,h){poly(c,[[x-30,y+h],[x+22,y+h-24],[x+w*.32,y+10],[x+w*.5,y],[x+w*.7,y+12],[x+w-10,y+h-26],[x+w+39,y+h-3],[x+w+18,y+h+11],[x-16,y+h+13]],'#4a675f','#35564d',2);for(let j=0;j<6;j++){let yy=y+22+j*(h-18)/6,frac=(yy-y)/h;line(c,[[x+w*.5*(1-frac)-12,yy],[x+w*.5*(1+frac)+12,yy+1]],j%2?'#698477':'#789285',2)}for(let i=0;i<29;i++){let xx=x+i*w/28;line(c,[[x+w/2+(xx-x-w/2)*.28,y+20],[xx,y+h+6]],'#314e45',.8)}line(c,[[x-30,y+h],[x+w+36,y+h]],'#a8b29b',3);for(let xx=x-10;xx<x+w+20;xx+=13)ellipse(c,xx,y+h+11,5,3,'#3e5b51')}
function pavilion(c,x,y,w,label='沁 芳'){rect(c,x+18,y+85,w-36,178,'#d6ccb0');for(let xx=x+42;xx<x+w-30;xx+=67)lattice(c,xx,y+107,49,106,'#a4af92','#777a5a');rect(c,x+7,y+241,w-14,14,'#b5ab8b');for(let xx=x+12;xx<=x+w-12;xx+=w-24){rect(c,xx,y+79,13,182,'#7e6048');rect(c,xx+3,y+79,3,182,'#af8960')}roof(c,x-10,y,w+20,90);rect(c,x-20,y+262,w+40,10,'#b4b79c');rect(c,x-36,y+272,w+72,12,'#ced0b3');rect(c,x+w/2-50,y+102,100,31,'#375b4e');text(c,label,x+w/2,y+125,19,'#d6c995');}
function railing(c,x,y,w){rect(c,x,y,w,5,'#c7c6a7');rect(c,x,y+35,w,5,'#b3b69a');for(let xx=x;xx<=x+w;xx+=32){rect(c,xx,y-3,5,52,'#d4cfad');ellipse(c,xx+2,y-6,6,5,'#d6d1b4');line(c,[[xx+5,y+7],[Math.min(xx+32,x+w),y+31]],'#a0ac93',2)}}
function pot(c,x,y,color='#748c7d',white=true){poly(c,[[x-13,y-28],[x+13,y-28],[x+18,y-4],[x+9,y+13],[x-9,y+13],[x-18,y-4]],color,'#526d5e');for(let i=0;i<7;i++){let a=i*2.4,xx=x+Math.sin(a)*25,yy=y-47+Math.cos(a)*17;line(c,[[x,y-21],[xx,yy]],'#6f8056',1.5);flower(c,xx,yy,8,white?'#e4dec3':'#c5a956')}}
function table(c,x,y,w,h=44,color='#785c42'){rect(c,x+7,y,w-14,h,color);rect(c,x+11,y+h,6,30,color);rect(c,x+w-17,y+h,6,30,color);poly(c,[[x-6,y],[x+4,y-13],[x+w-4,y-13],[x+w+6,y]],'#a18a66','#655e44');line(c,[[x+9,y+7],[x+w-9,y+7]],'#b59d6f',2);for(let xx=x+20;xx<x+w-15;xx+=22)poly(c,[[xx,y+16],[xx+7,y+24],[xx,y+32],[xx-7,y+24]],null,'#9f865c',1)}
function bowl(c,x,y,s=1){ellipse(c,x,y,18*s,7*s,'#ece7ce');poly(c,[[x-17*s,y],[x-11*s,y+13*s],[x+11*s,y+13*s],[x+17*s,y]],'#bdc8b3','#718f7c');ellipse(c,x,y,14*s,4*s,'#d7bc7b')}
function roomBase(c,wall='#d5cfb9',floor='#b6b69a'){rect(c,0,0,1280,720,'#bac7a8');rect(c,80,130,1120,443,wall);poly(c,[[100,350],[1180,350],[1280,650],[0,650]],floor);for(let y=380;y<650;y+=44)line(c,[[0,y],[1280,y]],'#89947b55');for(let x=-500;x<1600;x+=130)line(c,[[640+(x-640)*.48,350],[x,650]],'#89947b55');rect(c,80,340,1120,15,'#71795e');rect(c,80,130,1120,22,'#696f54');for(let x of [88,1180]){rect(c,x,135,16,450,'#6b6850');rect(c,x+3,135,3,450,'#a6996f')}roof(c,60,25,1160,106);}
function createScene(id){const cv=document.createElement('canvas');cv.width=W;cv.height=H;const c=cv.getContext('2d'),r=rand(42);
 const sky=c.createLinearGradient(0,0,0,720);sky.addColorStop(0,'#dce1c8');sky.addColorStop(1,'#a8bea4');rect(c,0,0,W,H,sky);
 if(id==='qin'){
  for(let i=0;i<8;i++)ellipse(c,150+i*180,150+Math.sin(i)*25,190,105,'#b7c6aa');
  rect(c,0,285,1280,435,'#91b3a4');for(let i=0;i<70;i++){let x=r()*1280,y=300+r()*390;line(c,[[x,y],[x+30+r()*80,y]],'#c1cbb04a',1)}
  poly(c,[[0,380],[160,349],[300,361],[430,402],[610,359],[840,340],[1280,355],[1280,650],[0,650]],'#b7bea0');
  poly(c,[[0,501],[220,457],[480,470],[730,410],[1050,431],[1280,485],[1280,567],[1000,500],[755,479],[490,539],[235,526],[0,573]],'#d9d3b6');
  for(let i=0;i<160;i++){let x=r()*1280,y=470+r()*83;ellipse(c,x,y,2+r()*4,1.4,'#9eaa8870')}
  tree(c,1085,350,1.35,45,'#7b8c67');tree(c,416,320,1,4,'#849477');bamboo(c,40,412,1.25,7);bamboo(c,186,360,.85,12);
  pavilion(c,660,98,310);railing(c,633,350,380);rock(c,503,408,46);rock(c,1138,397,65);
  table(c,951,392,88,22);ellipse(c,995,380,39,12,'#789b84');for(let i=0;i<8;i++)flower(c,968+i*8,374+Math.sin(i)*5,6,i%2?'#c5a857':'#a85d49');
  poly(c,[[80,604],[317,583],[371,608],[134,639]],'#a8ad8d');railing(c,72,576,280);
  for(let i=0;i<18;i++){let x=450+r()*780,y=625+r()*95;line(c,[[x,y+20],[x-8,y-13]],'#687f59');ellipse(c,x-8,y-14,13,5,'#7f9671')}
 }else if(id==='xiao'){
  roomBase(c,'#d0d1b7','#bbc0a4');rect(c,110,156,230,187,'#a9bd9b');bamboo(c,160,361,1.05,23);bamboo(c,274,360,.95,44);
  lattice(c,420,174,148,147,'#9baa83');lattice(c,809,174,148,147,'#9baa83');
  rect(c,610,168,132,157,'#6c7255');for(let y=175;y<320;y+=47){rect(c,614,y+37,123,5,'#a59a72');for(let i=0;i<9;i++){let h=24+r()*12;rect(c,620+i*12,y+36-h,8,h,['#bcc0a0','#ddd1af','#82927b'][i%3]);rect(c,622+i*12,y+37-h,2,h-2,'#e0d4b4')}}
  table(c,618,357,277,37);for(let i=0;i<4;i++)rect(c,654+i*2,339-i*3,58,6,i%2?'#c9c9ad':'#7e8d75');ellipse(c,770,346,23,8,'#4a5e50');rect(c,830,320,16,29,'#9b8966');for(let i=0;i<5;i++)line(c,[[834+i*2,325],[827+i*5,292]],'#4b5744',2);pot(c,512,350,'#8b9b80');
  rect(c,999,237,145,102,'#acbda0');poly(c,[[984,165],[1019,165],[1030,356],[983,356]],'#b8c4a1');poly(c,[[1125,165],[1159,165],[1160,356],[1118,356]],'#b8c4a1');
  for(let i=0;i<35;i++)ellipse(c,150+r()*180,390+r()*205,8+r()*10,3,'#78926d66');rock(c,76,486,57);
 }else if(id==='qiu'){
  roomBase(c,'#dbd0b1','#bbb69b');
  for(let x of [160,990])lattice(c,x,178,128,151,'#a9b49a','#8b7755');
  rect(c,475,157,326,160,'#b7a779');rect(c,488,168,300,137,'#dfd7b9');
  for(let i=0;i<7;i++)poly(c,[[490+i*41,292],[525+i*30,210+r()*50],[570+i*32,292]],'#92a38b70');for(let i=0;i<10;i++)line(c,[[500+r()*280,180],[500+r()*280,295]],'#c6c5a555');
  text(c,'烟 雨',640,194,16,'#75846e');for(let x of [432,843]){rect(c,x,165,28,151,'#e9ddbb');let str=x===432?'烟霞闲骨格':'泉石野生涯';[...str].forEach((s,i)=>text(c,s,x+14,191+i*25,17,'#505b49'))}
  table(c,427,352,431,36);pot(c,480,338,'#75998c');for(let i=0;i<12;i++)line(c,[[780+i*2,341],[766+i*4,299-r()*20]],'#5d614a',2);rect(c,777,316,35,31,'#987f56');ellipse(c,642,337,31,12,'#6c785e');
  table(c,231,375,104,37);pot(c,281,357,'#77988a');table(c,960,361,147,38);ellipse(c,1035,346,60,11,'#c9cbb0');for(let i=0;i<6;i++)ellipse(c,998+i*14,340,9,14,'#c8ad56');
  for(let t of [[530,439,168],[875,400,97]]){table(c,...t,29);bowl(c,t[0]+40,t[1]-12,.8);bowl(c,t[0]+110,t[1]-12,.65);line(c,[[t[0]+62,t[1]-17],[t[0]+101,t[1]-17]],'#e1d6ab',3);line(c,[[t[0]+63,t[1]-12],[t[0]+102,t[1]-12]],'#e1d6ab',3)}
  rect(c,105,560,1075,5,'#8a8767');
 }else if(id==='heng'){
  roomBase(c,'#e0decb','#bfc4ac');lattice(c,184,177,200,161,'#b4c2a3','#89957b');lattice(c,914,177,193,161,'#b4c2a3','#89957b');
  table(c,645,354,203,30,'#867e61');pot(c,747,337,'#928e74');for(let i=0;i<2;i++)rect(c,662,334-i*7,48,5,i?'#8c9579':'#cbcbb1');bowl(c,814,340,.5);
  rect(c,446,233,132,103,'#a9b59c');rect(c,438,323,150,24,'#918d70');poly(c,[[428,164],[460,164],[470,336],[429,336]],'#97b1a4');poly(c,[[558,164],[593,164],[592,336],[551,336]],'#97b1a4');line(c,[[434,165],[587,165]],'#738e7c',3);
  for(let i=0;i<5;i++){let x=112+i*18;line(c,[[x,510],[x+30,280]],'#708465',3);for(let j=0;j<9;j++){let yy=315+j*21;ellipse(c,x+25+Math.sin(j)*14,yy,13,5,'#768c63');ellipse(c,x+35,yy+10,3,4,'#a76f4a')}}rock(c,111,524,62);
 }else{
  rect(c,0,224,1280,496,'#91aea0');for(let i=0;i<90;i++){let x=r()*1280,y=250+r()*440;line(c,[[x,y],[x+70,y]],'#d1d4b35c')}
  tree(c,1040,294,.8,16,'#80906e');pavilion(c,1000,96,171,'藕香榭');railing(c,976,347,250);
  poly(c,[[0,275],[920,275],[1220,650],[0,650]],'#c2c1a3');for(let y=340;y<650;y+=50)line(c,[[0,y],[920+(y-275)*.8,y]],'#9eaa8d');for(let x=0;x<1100;x+=120)line(c,[[x*.8,275],[x,650]],'#9eaa8d');
  railing(c,0,291,937);roof(c,-10,15,940,121);rect(c,46,125,15,485,'#82664b');rect(c,900,125,17,283,'#82664b');rect(c,48,130,4,474,'#b6a276');
  for(let i=0;i<5;i++){let x=330+i*143,y=375+(i%2)*35;table(c,x,y,100,23);ellipse(c,x+40,y-12,30,11,'#995f49');for(let j=0;j<5;j++)ellipse(c,x+21+j*10,y-13,5,5,'#d3b778');bowl(c,x+79,y-11,.4)}
  rect(c,654,205,141,37,'#476b59');text(c,'缀 锦 阁',724,231,21,'#d9cea4');
  for(let i=0;i<20;i++){let x=1050+r()*220,y=430+r()*250;line(c,[[x,y+17],[x-8,y-9]],'#687d5c');ellipse(c,x-10,y-12,12,4,'#7c906b')}
 }
 for(let i=0;i<6500;i++){let x=r()*1280,y=r()*720;rect(c,x,y,1+r()*2,1,r()>.5?'#fff4ce12':'#344c3010')}
 const vignette=c.createRadialGradient(650,330,220,650,330,760);vignette.addColorStop(0,'#1a3e2500');vignette.addColorStop(1,'#243d252a');rect(c,0,0,1280,720,vignette);return cv;
}
const backgrounds={};for(const k in scenes)backgrounds[k]=createScene(k);
function person(c,id,x,y,scale=1,walking=false,portrait=false){const a=chars[id]||chars.liu;c.save();c.translate(x,y);c.scale(scale,scale);if(!portrait)ellipse(c,0,1,25,8,'#2d49382e');let bob=walking?Math.sin(clock*11)*2:Math.sin(clock*1.5+x)*.5;c.translate(0,bob);
 // cloth silhouette and split hems
 ellipse(c,-8,-5,10,4,'#3e493b');ellipse(c,9,-5,10,4,'#3e493b');poly(c,[[-16,-72],[-23,-46],[-25,-8],[25,-8],[23,-46],[16,-72]],a.robe,'#3b4b3b',.8);
 poly(c,[[-15,-69],[-28,-54],[-34,-30],[-21,-25],[-9,-52]],a.robe,'#3b4b3b',.7);poly(c,[[15,-69],[28,-54],[34,-30],[21,-25],[9,-52]],a.robe,'#3b4b3b',.7);
 line(c,[[-17,-15],[17,-15]],a.trim,3);line(c,[[0,-66],[10,-49],[9,-16]],a.trim,2);line(c,[[-12,-59],[-15,-22]],'#f3e6c52b',1.5);line(c,[[15,-51],[19,-23]],'#253e302e',2);
 ellipse(c,-25,-29,5,5,a.skin);ellipse(c,25,-29,5,5,a.skin);
 poly(c,[[-11,-73],[0,-58],[12,-74],[0,-69]],a.trim);rect(c,-5,-81,10,12,a.skin);
 ellipse(c,0,-94,17,22,a.hair);ellipse(c,0,-91,14,18,a.skin);poly(c,[[-16,-99],[-11,-113],[7,-115],[17,-99],[8,-104],[-1,-108],[-9,-101]],a.hair);
 ellipse(c,-8,-118,9,7,a.hair);ellipse(c,7,-116,10,8,a.hair);line(c,[[-8,-92],[-4,-92]],'#4d5140',1.2);line(c,[[4,-92],[8,-92]],'#4d5140',1.2);line(c,[[0,-90],[-1,-85],[2,-85]],'#ae8968',.8);line(c,[[-3,-80],[3,-80]],'#a17660',1);
 if(['liu','jia'].includes(id)){line(c,[[-11,-87],[-7,-86]],'#a48765',.7);line(c,[[7,-86],[11,-87]],'#a48765',.7)}
 if(id==='liu'){poly(c,[[-17,-103],[-15,-113],[12,-113],[18,-103]],'#9a9275');if(state.flowers==='crown'){for(let i=0;i<6;i++)flower(c,-17+i*7,-113-Math.sin(i)*5,5,i%2?'#d4b36a':'#ad6651')}else if(state.flowers==='single')flower(c,14,-111,6,'#be805d')}
 else if(id==='jia'||id==='feng'){line(c,[[-19,-113],[19,-115]],'#d1b570',3);flower(c,13,-114,6,id==='feng'?'#d1ac62':'#af5c4a');ellipse(c,-13,-82,2,4,'#d4b871');ellipse(c,13,-82,2,4,'#d4b871')}
 else{line(c,[[-13,-115],[15,-114]],a.trim,2);flower(c,13,-114,4,a.trim)}
 if(id==='jia'){for(let i=0;i<9;i++)ellipse(c,-12+i*3,-63+Math.sin(i*.4)*7,2,2,'#b8ac77')}
 c.restore();}
function drawDominoes(c){
 const t=dialog.text;let active=/四四|庄家人罢/.test(t)?0:/三四|毛毛虫/.test(t)?1:/幺四|萝卜/.test(t)?2:/一枝花|倭瓜/.test(t)?3:-1;
 rect(c,431,172,408,172,'#294d42e8');c.strokeStyle='#b2ae7a';c.lineWidth=1;c.strokeRect(437,178,396,160);text(c,'牙 牌 令 · 以 本 色 相 对',635,197,12,'#ded3aa');
 const sets=[[4,4],[3,4],[1,4]],names=['四四 · 人','三四 · 绿配红','幺四 · 真好看'];
 const dots={1:[[0,0]],3:[[-8,-8],[0,0],[8,8]],4:[[-8,-8],[8,-8],[-8,8],[8,8]]};
 sets.forEach((pair,i)=>{let x=502+i*110,y=210;rect(c,x+3,y+3,48,90,'#102f2866');rect(c,x,y,48,90,'#eee4c5');c.strokeStyle=(active===i||active===3)?'#d4ad61':'#9d9877';c.lineWidth=(active===i||active===3)?3:1;c.strokeRect(x,y,48,90);line(c,[[x+5,y+45],[x+43,y+45]],'#b9ab84',1);pair.forEach((n,j)=>dots[n].forEach(([dx,dy])=>ellipse(c,x+24+dx,y+23+j*44+dy,3.1,3.1,n===1||n===4?'#a35340':'#3d6958')));text(c,names[i],x+24,321,11,'#e7dab4')});
}
function draw(){ctx.clearRect(0,0,W,H);ctx.drawImage(backgrounds[scene],0,0);
 // wind carries a few autumn leaves across the still painting
 for(let i=0;i<12;i++){let x=(i*129+clock*(9+i%3))%1350-30,y=160+(i*43+clock*(5+i%2))%435;ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(clock+i));ellipse(ctx,0,0,4,1.7,i%2?'#b99959aa':'#d0bd78aa');ctx.restore()}
 if(mode==='title'){person(ctx,'jia',718,452,.86);person(ctx,'feng',851,468,.87);person(ctx,'liu',604,538,.86);return}
 const sc=scenes[scene];
 if(scene==='zhui'&&dialog)drawDominoes(ctx);
 if(scene==='qiu'&&state.feast==='perform'){ellipse(ctx,705,486,5,3,'#f3ead0');line(ctx,[[591,429],[625,429]],'#625443',3)}
 if(scene==='qiu'&&state.feast==='steady'){line(ctx,[[591,429],[625,429]],'#625443',3);bowl(ctx,685,426,.48)}
 if(scene==='xiao'&&state.silk){text(ctx,'明日换银红窗纱',883,331,11,'#727d63')}
 if(scene==='heng'&&state.plain){text(ctx,'陈设明日送来',746,290,12,'#83907c')}
 const entities=sc.npcs.map(n=>({id:n[0],x:n[1],y:n[2],npc:true}));entities.push({id:'liu',x:player.x,y:player.y,npc:false});entities.sort((a,b)=>a.y-b.y);
 for(const e of entities){if(!e.npc){ellipse(ctx,e.x,e.y+2,26,10,'#f1deb076');ctx.strokeStyle='#ede2b6';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(e.x,e.y+2,28,10,0,0,Math.PI*2);ctx.stroke()}
 person(ctx,e.id,e.x,e.y,.83,!e.npc&&(!!target||Object.values(keys).some(Boolean)));
 if(e.npc){let isNear=near&&near.id===e.id;rect(ctx,e.x-33,e.y+14,66,22,isNear?'#f0ead7ee':'#eee9d7bb');text(ctx,chars[e.id].name,e.x,e.y+30,12,'#455f4c');if(isQuest(e.id)){ellipse(ctx,e.x,e.y-116+Math.sin(clock*2)*3,9,9,'#f4e8c9');text(ctx,'!',e.x,e.y-112+Math.sin(clock*2)*3,12,'#a0683c')}}
 if(clock<laughUntil&&e.npc)text(ctx,'呵呵…',e.x+30,e.y-116-Math.sin(clock*3+e.x)*5,14,'#986d42');}
 if(mode==='play'&&!dialog&&!isModal()){for(const sp of sc.spots){ctx.strokeStyle='#eee5c2b0';ctx.lineWidth=1;ctx.beginPath();ctx.arc(sp[1],sp[2],8+Math.sin(clock*2)*1,0,7);ctx.stroke();text(ctx,'·',sp[1],sp[2]+5,17,'#f7eccb')}
 if(sc.next){const ready=unlocked(sc.next);poly(ctx,[[1140,550],[1150,542],[1160,550],[1150,558]],ready?'#f1e4bb':'#9aa98d');rect(ctx,1090,572,125,28,'#f0ead6dd');text(ctx,ready?'往'+scenes[sc.next].name+' →':'园路 · 待同行',1152,591,12,ready?'#3c604e':'#8b917b')}
 if(target){ctx.strokeStyle='#f6ecd1';ctx.beginPath();ctx.ellipse(target.x,target.y,8,3,0,0,7);ctx.stroke()}}
}
function unlocked(id){return id==='qin'||id==='xiao'&&!!state.flowers||id==='qiu'&&state.silk||id==='heng'&&!!state.reply||id==='zhui'&&state.plain}
function isQuest(id){if(scene==='qin')return id==='feng'&&!state.flowers;if(scene==='xiao')return !state.path?id==='amber':!state.silk&&id==='jia';if(scene==='qiu')return id==='yuan'&&!state.reply;if(scene==='heng')return id==='jia'&&!state.plain;if(scene==='zhui')return id==='yuan';return false}
function objective(){let t='';if(scene==='qin')t=state.flowers?'菊花簪好了。沿园路去潇湘馆。':'凤姐捧着菊花盘，正招手唤你过去。';if(scene==='xiao')t=!state.path?'竹下苍苔湿滑。先听琥珀说些什么。':!state.silk?'看过林姑娘的书房，再与贾母说话。':'银红软烟罗明日换窗。往秋爽斋用早饭。';if(scene==='qiu')t=!state.feast?'开席以前，鸳鸯要悄悄嘱咐你几句。':!state.reply?'一席笑声已过。听听鸳鸯的赔话。':'饭罢乘船，前往蘅芜苑。';if(scene==='heng')t=state.plain?'素净也有讲究。去缀锦阁听曲行令。':'雪洞一般的屋子。与宝钗、贾母聊聊。';if(scene==='zhui')t='牙牌令将传到你面前。去找鸳鸯入席。';$('act').textContent=scenes[scene].act;$('place').textContent=scenes[scene].name;$('task').textContent=t;$('chapter-label').textContent='游园 · '+(Object.keys(scenes).indexOf(scene)+1)+' / 5';$('footer-state').textContent=state.flowers==='crown'?'鬓边簪着一头菊花':state.flowers==='single'?'鬓边留着一枝秋菊':'清晨入园 · 秋光正好'}
function save(){try{localStorage.setItem('honglou40-v1',JSON.stringify(state))}catch(e){saveOK=false}}
function note(title,body){if(!state.notes.some(n=>n.title===title)){state.notes.push({title,body});save();toast('见闻已记 · '+title)}}
function toast(s){$('toast').textContent=s;$('toast').classList.add('show');toastTimer=clock+3.5}
function travel(id,quiet=false){if(!unlocked(id))return;scene=id;state.scene=id;player={x:210,y:552};target=null;near=null;keys={};if(!state.visited.includes(id))state.visited.push(id);objective();save();if(!quiet){$('location-flash').textContent=scenes[id].name;$('location-flash').style.opacity=1;flashTimer=clock+2.4;if(id==='heng')toast('棠木舫靠岸 · 衰草残菱，更助秋情');else if(id==='zhui')toast('藕香榭隔水传来曲声')}}
function setGameUI(show){for(const id of ['hud','objective','footer'])$(id).classList.toggle('hidden',!show)}
function newGame(){state=fresh();mode='play';scene='qin';$('title').classList.add('hidden');$('ending').classList.add('hidden');setGameUI(true);closeModal();hideDialog();travel('qin',true);intro()}
function intro(){showModal(`<div class="eyebrow">清秋 · 大观园</div><h2>今儿，也热闹一天</h2><p>你是刘姥姥，带着板儿来贾府的庄家老人。老太太留你住下，今日还要带你游园、吃席。</p><p>这里的花木、器用，样样都新鲜。只是贵人们的规矩，未必都写在脸上。<br>你想好好领受这一番情，也想让自己应对得体。</p><p style="font-size:13px">用 <b>WASD / 方向键</b> 行走，或<b>点击地面</b>。走近人物按 <b>E</b> 交谈，也可直接点击人物。<b>M</b> 查看园图，<b>J</b> 翻阅见闻。选择没有倒计时。</p><button class="primary" id="intro-go">走进园中 →</button>`);$('intro-go').onclick=closeModal}
function showModal(html){target=null;keys={};$('modal-card').innerHTML=html;$('modal').classList.remove('hidden');$('interact').classList.add('hidden')}
function closeModal(){$('modal').classList.add('hidden');keys={}}
function isModal(){return !$('modal').classList.contains('hidden')}
function showMap(){if(mode!=='play'||dialog)return;showModal(`<button class="close" aria-label="关闭">×</button><div class="eyebrow">大观园 · 今日游踪</div><h2>一径秋光</h2><p>点选已开启的地点前往。完成当前的人情往来，才好随众人往下一处。</p><div class="map-grid">${Object.entries(scenes).map(([id,s],i)=>`<button class="map-stop ${scene===id?'current':''}" data-scene="${id}" ${unlocked(id)?'':'disabled'}><span class="number">0${i+1}</span><strong>${s.name}</strong><small>${s.desc}</small><span>${scene===id?'此处':unlocked(id)?'前往 →':'未至'}</span></button>`).join('')}</div>`);$('modal-card').querySelector('.close').onclick=closeModal;document.querySelectorAll('[data-scene]').forEach(b=>b.onclick=()=>{closeModal();travel(b.dataset.scene)})}
function showJournal(){showModal(`<button class="close" aria-label="关闭">×</button><div class="eyebrow">刘姥姥 · 园中见闻</div><h2>半日心上事</h2>${state.notes.length?state.notes.map(n=>`<div class="journal-entry"><h4>${n.title}</h4><p>${n.body}</p></div>`).join(''):'<p class="empty">这一日才开头。与人说话，看看陈设，见闻便会留在这里。</p>'}<p style="font-size:11px">选择的余味记在此处；没有分数，也不论输赢。</p>`);$('modal-card').querySelector('.close').onclick=closeModal}
function showMenu(){if(mode!=='play')return;showModal(`<button class="close" aria-label="关闭">×</button><div class="eyebrow">稍歇一歇</div><h2>园中小憩</h2><p>行走：WASD / 方向键，或点击地面。<br>交谈：走近按 E，或点击人物自动走近。<br>对话：空格 / 回车继续，数字 1、2 选择。<br>园图 M · 见闻 J · 暂停 Esc</p><p style="font-size:12px">${saveOK?'进度已自动保存在此浏览器。':'浏览器未开放本地存储；本次游玩不受影响。'}<br>原作：曹雪芹《红楼梦》第四十回。美术均由代码绘制。</p><div class="modal-actions"><button class="primary" id="continue">继续游园 →</button><button class="quiet" id="back-title">回到标题</button></div>`);$('continue').onclick=closeModal;$('modal-card').querySelector('.close').onclick=closeModal;$('back-title').onclick=toTitle}
function toTitle(){$('toast').classList.remove('show');$('location-flash').style.opacity=0;closeModal();hideDialog();mode='title';scene='qin';target=null;keys={};setGameUI(false);$('ending').classList.add('hidden');$('title').classList.remove('hidden');$('interact').classList.add('hidden');checkResume()}
function checkResume(){try{$('resume').classList.toggle('hidden',!localStorage.getItem('honglou40-v1'))}catch(e){$('resume').classList.add('hidden')}}
function say(speaker,txt,tag=''){return {speaker,text:txt,tag}}
function sequence(lines,done){queue=lines.slice();afterQueue=done||null;advance()}
function advance(){if(queue.length){displayDialogue(queue.shift());return}const cb=afterQueue;afterQueue=null;hideDialog();if(cb)cb();objective();save()}
function displayDialogue(d){dialog=d;target=null;keys={};$('interact').classList.add('hidden');$('dialogue').classList.remove('hidden');const c=chars[d.speaker]||chars.narrator;$('speaker').textContent=c.name;$('speaker-role').textContent=c.role;$('dialogue-tag').textContent=d.tag||'园中人语';$('line').textContent=d.text;const pc=$('portrait').getContext('2d');pc.clearRect(0,0,170,190);ellipse(pc,85,87,64,66,'#e1ddc7');if(d.speaker==='narrator'){bamboo(pc,80,150,.45,3);text(pc,'记',85,111,35,'#576f56')}else person(pc,d.speaker,85,185,1.37,false,true);
 $('answers').innerHTML='';if(d.options){d.options.forEach((op,i)=>{let b=document.createElement('button');b.innerHTML=`<span class="num">${i+1}</span>${op.label}`;b.onclick=()=>{hideDialog();op.action()};$('answers').appendChild(b)})}else{let b=document.createElement('button');b.className='next';b.textContent=queue.length?'听下去 →':'继续 →';b.onclick=advance;$('answers').appendChild(b)}}
function hideDialog(){dialog=null;$('dialogue').classList.add('hidden');$('answers').innerHTML=''}
function choice(speaker,txt,options){displayDialogue({speaker,text:txt,tag:'此刻 · 由你作答',options})}
function talk(id){if(dialog||isModal()||mode!=='play')return;
 if(scene==='qin'){
  if(id==='feng'){if(!state.flowers)flowerChoice();else sequence([say('feng',state.flowers==='crown'?'这一头花，倒叫园里的菊花也让你三分。走罢，还有好的呢！':'好，好，留一枝也好。老太太等着呢，我带你瞧好的去。')]);}
  if(id==='jia')sequence([say('jia','这园子好不好？'),say('liu','我们乡下人到了年下，都上城来买画儿贴。谁知今儿进这园一瞧，竟比那画儿还强十倍。'),say('jia','你瞧我这个小孙女儿，她就会画。等明儿叫她画一张如何？')],()=>note('比画还真','老太太说，四姑娘会画。若能把园子带回乡下，大家也能见见这画里的真地方。'));
  if(id==='li')sequence([say('li','才开了缀锦阁，搬下二十多张高几。船上的篙桨、遮阳幔子，也都预备着了。'),say('liu','老太太留下我，叫我也热闹一天去。'),say('li','姥姥慢慢看。那些花灯桌椅，可别只顾看得忘了脚下。')]);
 }else if(scene==='xiao'){
  if(id==='amber'){if(!state.path)pathChoice();else sequence([say('amber',state.path==='moss'?'老太太问你扭了腰没有。真不妨事了？':'这石子路虽窄，走着却稳。姥姥只管上来走。'),say('liu',state.path==='moss'?'那里说的我这么娇嫩了。那一天不跌两下子！':'听姑娘的。可别为我这一双乡下脚，耽搁了大家。')]);}
  if(id==='dai')sequence([say('liu','这必定是哪位哥儿的书房了。'),say('dai','这是我的屋子。姥姥请坐，茶已预备下了。','据屋中待客情节补写'),say('liu','这哪像个小姐的绣房，竟比那上等的书房还好。')],()=>note('满架书香','林姑娘亲自奉茶。眼前笔砚、书架，叫我把小姐的绣房认成了哥儿的书房。'));
  if(id==='jia'){if(!state.path){sequence([say('jia','先慢些走。这竹下苍苔滑，听琥珀指给你路。')]);return}sequence([say('jia','这竹子已是绿的，再拿绿纱糊上反不配。明儿拿银红的替她糊窗子。'),say('feng','昨儿开库房，见过这样的。我竟认作蝉翼纱了，好祖宗，教给我罢。'),say('jia','正经名字叫作“软烟罗”。那银红的，又叫作“霞影纱”。'),say('liu','我们想它作衣裳也不能，拿着糊窗子，岂不可惜？'),say('jia','再找一找，若还有青的，送这刘亲家两匹。白收着霉坏了。')],()=>{state.silk=true;note('软烟罗','庄家人舍不得拿来穿的料子，这里却用来糊窗。贾母吩咐找两匹相赠；这是吩咐，并未在此刻交到手里。');toast('园路已开 · 秋爽斋')})}
 }else if(scene==='qiu'){
  if(id==='yuan'){if(!state.feast)feastChoice();else if(!state.reply)replyChoice();else sequence([say('yuan',state.reply==='accept'?'姥姥明白就好。来人，倒茶给姥姥吃！':'姥姥的话我记着。待会行令，只管拿你庄家的话来。','据赔不是情节补写')]);}
  if(id==='feng')sequence([say('feng',!state.feast?'老太太叫把小楠木桌抬来，让你近她那边坐。先听鸳鸯姐姐的嘱咐。':state.feast==='perform'?'一两银子一个呢，你快尝尝罢！你别多心，才刚不过大家取笑儿。':'换了这乌木箸，姥姥可拿得惯？今日只管吃个香甜。','部分据情节补写')]);
  if(id==='li')sequence([say('li','她们一点好事也不做，又不是个小孩儿，还这么淘气，仔细老太太说。'),say('liu','我只爱你们家这行事。怪道说“礼出大家”。')]);
 }else if(scene==='heng'){
  if(id==='bao')sequence([say('bao','姥姥请坐。屋里不过几件日用的东西。','据素室陈设补写'),say('liu','看了半日的花花绿绿，到了姑娘这里，眼睛倒歇住了。','补写'),say('bao','各人取个便宜罢了。姥姥随意。','补写')],()=>note('雪洞一般','一色玩器全无，只有菊花、书与茶具。宝姑娘的素净，与前头屋子的精致竟这样不同。'));
  if(id==='jia')sequence([say('jia','这孩子太老实了。年轻的姑娘们，房里这样素净，也忌讳。'),say('jia','若很爱素净，少几样倒使得。让我替你收拾，包管又大方又素净。'),say('yuan','这些东西都搁在东楼上，不知哪个箱子里，还得慢慢找去，明儿再拿去也罢了。'),say('jia','明日后日都使得，只别忘了。'),say('liu','原来富贵人家的素净，也自有一番讲究。','内心补写')],()=>{state.plain=true;note('素净的规矩','贾母要送石头盆景、纱桌屏、墨烟冻石鼎，还要换白绫帐。体面不只在于多，也在于怎样摆。');toast('园路已开 · 缀锦阁')});
 }else{
  if(id==='yuan')cardIntro();
  if(id==='jia')sequence([say('jia','咱们先吃两杯，今日也行一令才有意思。'),say('liu','我这庄家人，听着她们的好句子，心里也要掂量掂量。','内心补写')]);
  if(id==='feng')sequence([say('feng','既行令，还叫鸳鸯姐姐来行更好。'),say('yuan','酒令大如军令，不论尊卑，惟我是主。违了我的话，是要受罚的。')]);
 }
}
function flowerChoice(){choice('feng','过来带花儿。让我打扮你！',[
 {label:'由她插满一头，笑说自己“老风流”。',action:()=>{state.flowers='crown';laughUntil=clock+5;note('一头菊花','我由凤姐横三竖四插了一头花，笑说“今儿老风流才好”。满园人笑，我也笑。');sequence([say('liu','我这头也不知修了什么福，今儿这样体面起来。'),say('liu','我虽老了，年轻时也风流，爱个花儿粉儿的，今儿老风流才好。'),say('narrator','众人笑得了不得。贾母歇过一回，领着你往潇湘馆去。')],()=>toast('园路已开 · 潇湘馆'))}},
 {label:'扶住花盘，请她只留一枝。',action:()=>{state.flowers='single';note('一枝秋色','我领了凤姐的好意，只请留一枝菊花。热闹仍在，自己也自在些。〔选择分支〕');sequence([say('liu','奶奶的好意我领了。留这一枝罢，别把好花都费在我这老头上。','分支补写'),say('feng','姥姥倒会惜花。也罢，这一枝就够你风流了。','分支补写'),say('narrator','凤姐收了花盘，笑声轻轻过去。你扶稳鬓边的一枝菊花。')],()=>toast('园路已开 · 潇湘馆'))}}
 ])}
function pathChoice(){choice('amber','姥姥，你上来走，仔细苍苔滑了。',[
 {label:'让出石子路，自己走惯了土地。',action:()=>{state.path='moss';player.x=325;player.y=520;note('才说嘴，就打嘴','怕姑娘们沾脏绣鞋，我偏走苍苔地，果然跌了一跤。贾母叫人来搀，还问可扭了腰。');sequence([say('liu','不相干的，我们走熟了的。可惜你们的那绣鞋，别沾脏了。'),say('narrator','只顾抬头说话，脚下一滑，你跌坐在地。众人笑起来，贾母忙叫丫头搀你。'),say('liu','才说嘴就打了嘴。'),say('jia','可扭了腰了不曾？叫丫头们捶一捶。')],()=>{laughUntil=clock+3;toast('站稳了脚 · 进屋看看')})}},
 {label:'听她提醒，随众人走石子路。',action:()=>{state.path='stone';player.x=385;note('脚下的分寸','我听琥珀的提醒，走上石子路。让路的好意，也不必勉强自己的脚。〔选择分支〕');sequence([say('liu','姑娘说得是。我这老骨头，可不敢搅了老太太的兴。','分支补写'),say('amber','姥姥留神，前头便到了。','分支补写'),say('narrator','你踏上石子路，平稳走过竹荫。湘帘里传出奉茶的声响。')])}}
 ])}
function feastChoice(){sequence([say('narrator','鸳鸯拉你离席，悄悄教了一句逗趣的话。桌上，凤姐专给你摆了一双沉甸甸的象牙镶金箸。'),say('yuan','这是我们家的规矩，若错了我们就笑话呢。')],()=>choice('liu','她们要借我逗老太太一笑。这一席，我怎样领情？',[
 {label:'“姑娘放心。”照她教的话凑趣。',action:()=>{state.feast='perform';note('一席大笑','我照鸳鸯教的话逗趣，满堂笑成一片。牙箸不好使，鸽子蛋又滚在地上；后来贾母吩咐换了筷子。');laughUntil=clock+20;sequence([say('jia','请。'),say('liu','老刘，老刘，食量大似牛，吃一个老母猪不抬头。'),say('narrator','满席先是一怔，接着笑作一团。你夹起一枚鸽子蛋，偏又滑落了。'),say('liu','一两银子，也没听见响声儿就没了。'),say('jia','这定是凤丫头促狭鬼儿闹的，快别信她的话了。还不把那筷子换了呢！'),say('narrator','乌木镶银箸换到手里。贾母见你吃得香甜，又把自己的菜端过来。')],()=>toast('席已散 · 鸳鸯还有话与你说'))}},
 {label:'愿陪着说笑，只求先换一双伏手的筷子。',action:()=>{state.feast='steady';note('换一双伏手的箸','我愿陪着说笑，却先求换了沉重的牙箸。这回鸽子蛋没有落地，笑声也少了一番撮弄。〔选择分支〕');sequence([say('liu','姑娘放心，我也愿哄老太太开心。只是这叉爬子实在沉，先替我换双伏手的罢。','分支补写'),say('feng','姥姥还没入席，倒先挑起筷子来了。给她换了罢。','分支补写'),say('narrator','乌木箸先换上了。你说了几句庄家的趣话，席上也笑；这一回，鸽子蛋稳稳送到了嘴边。','选择后果'),say('jia','让刘亲家好生吃。','分支补写')],()=>toast('席已散 · 鸳鸯还有话与你说'))}}
 ]))}
function replyChoice(){choice('yuan','姥姥别恼，我给你老人家赔个不是。',[
 {label:'“咱们哄着老太太开心，可有什么恼的！”',action:()=>{state.reply='accept';note('笑是我自己肯的','我告诉鸳鸯：她先嘱咐，我就明白了。“我要心里恼，也就不说了。”她忙叫人给我倒茶。');sequence([say('liu','姑娘说那里话，咱们哄着老太太开个心儿，可有什么恼的！'),say('liu','你先嘱咐我，我就明白了，不过大家取个笑儿。我要心里恼，也就不说了。'),say('yuan','为什么不倒茶给姥姥吃？'),say('narrator','茶已饮过，余菜也分送下去。众人往荇叶渚上船，沿残荷衰草，到了蘅芜苑。')],()=>toast('园路已开 · 蘅芜苑'))}},
 {label:'领她的赔话，也说下回不必再用难使的器物。',action:()=>{state.reply='boundary';note('把分寸说给她听','我领了鸳鸯的赔话，也说愿意凑趣，不必再拿难使的器物试我。她应下了。〔选择分支〕');sequence([say('liu','姑娘言重了。笑话我会说，只是那难使的家伙，下回饶过我罢。','分支补写'),say('yuan','姥姥既这么说，我记着了。来，喝碗茶。','分支补写'),say('narrator','话说得轻，却也让她听见了。席面收拾停当，众人往荇叶渚上船。')],()=>toast('园路已开 · 蘅芜苑'))}}
 ])}
function cardIntro(){sequence([say('yuan','酒令大如军令，不论尊卑，惟我是主。'),say('yuan','我说骨牌副儿，你比上一句。无论诗词歌赋、成语俗话，都要叶韵。错了的罚一杯。'),say('narrator','前席有人说诗，有人受罚。轮到你时，众人的目光都围了过来。')],cardChoice)}
function cardChoice(){choice('yuan',state.reply==='boundary'?'姥姥，这回只凭你的话来。左边“四四”是个人。':'左边“四四”是个人。姥姥，你只管说，不相干。',[
 {label:'不用诗书，就拿庄家人的本色接令。',action:()=>{state.cards='rustic';note('庄家本色','不用借旁人的诗书，我把田间的庄家人、毛虫、萝卜蒜和大倭瓜带到了席上。');sequence([say('liu','是个庄家人罢。'),say('jia','说得好，就是这样说。'),say('liu','我们庄家人，不过是现成的本色，众位别笑。'),say('yuan','中间“三四”绿配红。'),say('liu','大火烧了毛毛虫。'),say('yuan','右边“幺四”真好看。'),say('liu','一个萝卜一头蒜。'),say('yuan','凑成便是一枝花。'),say('liu','花儿落了结个大倭瓜。'),say('narrator','你两只手比着，满席又大笑起来。外面忽然一阵乱嚷——')],()=>finish(allOriginal()?'original':'measured'));laughUntil=clock+45}},
 {label:'照令饮一杯，辞了这一轮。',action:()=>{state.cards='drink';note('这一轮，且饮一杯','既然答不上可以罚酒，我便照规矩饮了一杯，安稳坐回席中。〔选择分支〕');sequence([say('liu','好姑娘，诗书我不懂。依你的军令，罚我一杯，我听众位说罢。','分支补写'),say('yuan','既认了罚，这一轮就饶了你。','分支补写'),say('narrator','你接过杯来饮了，席上有人笑，有人仍等你的乡下趣话。你放稳杯子，没有再开口。','选择后果')],()=>finish('quiet'))}}
 ])}
function allOriginal(){return state.flowers==='crown'&&state.path==='moss'&&state.feast==='perform'&&state.reply==='accept'}
const endings={
 original:{type:'原著情节走向',title:'一席本色',text:'你把庄家人的话，说进了这满席诗书之间。众人大笑，你也笑——这笑里有逢迎，也有你自己拿得出的见识与机敏。\n一头秋菊，一枚滑落的鸽子蛋，最后结成一个大倭瓜。画里的人家，终于听见了画外的声音。'},
 measured:{type:'选择分支 · 本色仍在',title:'笑里有度',text:'你仍用萝卜、蒜和大倭瓜接下牙牌令。只是这一路，你也有过自己的主意：有的好意照单领受，有的热闹轻轻让过。\n满席的笑声没有停。你笑着坐在其中，记得哪些话是自己愿意说的。'},
 quiet:{type:'选择分支 · 依令饮酒',title:'且饮一杯',text:'这一轮，你没有说出那句“大倭瓜”。牙牌令既有罚酒的规矩，你便照规矩饮了，听席间的笑声落下去。\n今日见过的翠竹、软烟罗与素净屋子，仍都留在心里。人在画中，也可以有一刻只看，只听。'}
};
function finish(kind){$('toast').classList.remove('show');toastTimer=0;$('location-flash').style.opacity=0;state.ending=kind;save();mode='ending';hideDialog();setGameUI(false);$('interact').classList.add('hidden');$('ending').classList.remove('hidden');const e=endings[kind];$('ending-type').textContent=e.type;$('ending-title').textContent=e.title;$('ending-text').innerText=e.text;$('ending-memory').innerHTML=(state.flowers==='single'?'一枝菊花':'满头秋菊')+'　／　'+(state.feast==='steady'?'换了伏手的箸':'笑落一枚鸽子蛋')+'　／　'+(state.reply==='boundary'?'赔话中说清分寸':'明白而肯凑趣')+'<br>这一天的选择，已收进「园中见闻」。'}
function interact(){if(!near||dialog||isModal()||mode!=='play')return;if(near.type==='npc')talk(near.id);else if(near.type==='gate'){const next=scenes[scene].next;if(unlocked(next))travel(next);else toast('且先完成眼前的事，再随众人同行。')}else{const sp=scenes[scene].spots[near.index];sequence([say('narrator',sp[3],'园中细看')],()=>note(sp[0],sp[3]))}}
function getNear(){let options=scenes[scene].npcs.map(n=>({type:'npc',id:n[0],x:n[1],y:n[2],label:'与'+chars[n[0]].name+'交谈'}));scenes[scene].spots.forEach((sp,i)=>options.push({type:'spot',index:i,x:sp[1],y:sp[2]+28,label:'细看'+sp[0]}));if(scenes[scene].next)options.push({type:'gate',x:1150,y:550,label:unlocked(scenes[scene].next)?'往'+scenes[scenes[scene].next].name:'园路尚未开启'});options.forEach(n=>n.dist=Math.hypot(player.x-n.x,player.y-n.y));options.sort((a,b)=>a.dist-b.dist);return options[0]?.dist<96?options[0]:null}
function update(dt){if(toastTimer&&clock>toastTimer){$('toast').classList.remove('show');toastTimer=0}if(flashTimer&&clock>flashTimer){$('location-flash').style.opacity=0;flashTimer=0}if(mode!=='play'||dialog||isModal()){$('interact').classList.add('hidden');return}let dx=(keys.ArrowRight||keys.d?1:0)-(keys.ArrowLeft||keys.a?1:0),dy=(keys.ArrowDown||keys.s?1:0)-(keys.ArrowUp||keys.w?1:0);if(dx||dy){target=null;let l=Math.hypot(dx,dy);player.x+=dx/l*195*dt;player.y+=dy/l*195*dt}else if(target){let tx=target.x-player.x,ty=target.y-player.y,d=Math.hypot(tx,ty);if(d<4){const action=target.action;target=null;if(action){near=getNear();if(near)interact()}}else{player.x+=tx/d*Math.min(d,195*dt);player.y+=ty/d*Math.min(d,195*dt)}}player.x=Math.max(120,Math.min(1170,player.x));player.y=Math.max(390,Math.min(605,player.y));near=getNear();$('interact').classList.toggle('hidden',!near);if(near){$('interact').innerHTML='<b>E</b>'+near.label;$('interact').style.left=Math.max(150,Math.min(1130,player.x))+'px';$('interact').style.top=Math.max(278,player.y-156)+'px'}}
canvas.addEventListener('click',ev=>{if(mode!=='play'||dialog||isModal())return;const r=canvas.getBoundingClientRect(),x=(ev.clientX-r.left)*W/r.width,y=(ev.clientY-r.top)*H/r.height;if(y<260||y>647)return;let npc=scenes[scene].npcs.find(n=>Math.abs(x-n[1])<40&&y>n[2]-113&&y<n[2]+35);if(npc){target={x:npc[1]-50,y:npc[2]+22,action:true};return}let sp=scenes[scene].spots.find(s=>Math.hypot(x-s[1],y-s[2])<35);if(sp){target={x:sp[1]-35,y:Math.max(390,sp[2]+50),action:true};return}if(scenes[scene].next&&Math.abs(x-1150)<85&&y>515){target={x:1120,y:550,action:true};return}target={x:Math.max(120,Math.min(1170,x)),y:Math.max(390,Math.min(605,y))}});
canvas.addEventListener('mousemove',ev=>{const r=canvas.getBoundingClientRect(),x=(ev.clientX-r.left)*W/r.width,y=(ev.clientY-r.top)*H/r.height;canvas.style.cursor=mode==='play'&&!dialog&&!isModal()&&scenes[scene].npcs.some(n=>Math.abs(x-n[1])<40&&y>n[2]-113&&y<n[2]+35)?'pointer':'default'});
addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].includes(e.key)&&e.key!=='Tab')e.preventDefault();const key=e.key.length===1?e.key.toLowerCase():e.key;if(e.repeat)return;if(key==='Escape'){if(isModal())closeModal();else showMenu();return}if(isModal())return;if(dialog){if((key===' '||key==='Enter'||key==='e')&&!dialog.options){advance();return}if(dialog.options&&['1','2','3'].includes(key)){$('answers').children[Number(key)-1]?.click()}return}if(mode!=='play')return;if(key==='m'){showMap();return}if(key==='j'){showJournal();return}if(key==='e'){interact();return}keys[key]=true});
addEventListener('keyup',e=>{keys[e.key.length===1?e.key.toLowerCase():e.key]=false});addEventListener('blur',()=>{keys={};target=null});
$('start').onclick=newGame;$('resume').onclick=()=>{try{const s=JSON.parse(localStorage.getItem('honglou40-v1'));if(!s||!scenes[s.scene])return newGame();state=s;mode='play';$('title').classList.add('hidden');setGameUI(true);travel(s.scene,true);if(s.ending)finish(s.ending)}catch(e){newGame()}};
$('interact').onclick=interact;$('map-button').onclick=showMap;$('journal-button').onclick=showJournal;$('menu-button').onclick=showMenu;$('restart').onclick=toTitle;$('ending-journal').onclick=showJournal;
$('about').onclick=()=>{showModal('<button class="close" aria-label="关闭">×</button><div class="eyebrow">游玩须知</div><h2>以本色入画</h2><p>本作改编自当前项目 SOURCE.txt 所收《红楼梦》第四十回。你扮演刘姥姥，走过五处园景，作出五次选择，抵达三个结局之一。</p><p>点击人物便会自动走近交谈。也可用方向键或 WASD 行走，E 交谈。空格继续对话，数字 1、2 选择。M 打开园图，J 查看见闻。游戏无时间限制。</p><p>原文对白与补写相间；分支不声称是原著发生的事实。详细对照见项目中的 DESIGN.md。</p><p>所有场景、人物、纹理均用代码绘制，无外部素材，无联网需求。</p>');$('modal-card').querySelector('.close').onclick=closeModal};
// Deterministic review points. Each jump reconstructs a complete, independent state.
function jump(id){const valid=['c1','c2','c3','c4','c5','end-original','end-measured','end-quiet'];if(!valid.includes(id))return;state=fresh();mode='play';$('title').classList.add('hidden');$('ending').classList.add('hidden');closeModal();hideDialog();setGameUI(true);if(id!=='c1'){state.flowers='crown';state.notes.push({title:'一头菊花',body:'凤姐插满一头花，我笑说“今儿老风流才好”。'})}if(!['c1','c2'].includes(id)){state.path='moss';state.silk=true}if(!['c1','c2','c3'].includes(id)){state.feast='perform'}if(!['c1','c2','c3','c4'].includes(id)){state.reply='accept';state.plain=true}const dest={c1:'qin',c2:'xiao',c3:'qiu',c4:'qiu',c5:'zhui'}[id]||'zhui';travel(dest,true);player={x:650,y:545};if(id==='c1')flowerChoice();if(id==='c2')pathChoice();if(id==='c3'){// open the actual decision immediately, skipping only its two-line preamble
 feastChoice();advance();advance();}
 if(id==='c4')replyChoice();if(id==='c5')cardChoice();if(id.startsWith('end-')){state.cards=id==='end-quiet'?'drink':'rustic';if(id==='end-measured')state.reply='boundary';finish(id.slice(4))}}
addEventListener('hashchange',()=>{let id=new URLSearchParams(location.hash.slice(1)).get('jump');if(id)jump(id)});
checkResume();const jumpId=new URLSearchParams(location.hash.slice(1)).get('jump');if(jumpId)jump(jumpId);
function frame(ts){let dt=Math.min((ts-last)/1000||0,.04);last=ts;clock+=dt;update(dt);draw();requestAnimationFrame(frame)}requestAnimationFrame(frame);
// Read-only status aids reproducible acceptance tests without bypassing gameplay.
window.gameStatus=()=>({mode,scene,state:JSON.parse(JSON.stringify(state)),player:{...player},dialogue:dialog?{speaker:dialog.speaker,text:dialog.text,choices:dialog.options?.map(x=>x.label)||[]}:null});
