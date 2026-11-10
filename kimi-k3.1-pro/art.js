(() => {
  'use strict';
  const TAU = Math.PI * 2;
  const cache = {};
  const palettes = {
    yuanyang:{robe:'#487c6d',trim:'#d4b66f',skirt:'#6b3f45',hair:'#211e1c',skin:'#efcfb0'},
    jiamu:{robe:'#773f46',trim:'#d2af65',skirt:'#4b343b',hair:'#b9b0a1',skin:'#e6c3a4'},
    liu:{robe:'#776b51',trim:'#a6b19a',skirt:'#485b5b',hair:'#80796c',skin:'#d7ae87'},
    xichun:{robe:'#d2b77c',trim:'#f0e2b6',skirt:'#8e9d83',hair:'#27221e',skin:'#f0d1b6'},
    amber:{robe:'#ba874d',trim:'#e1c788',skirt:'#687a67',hair:'#28211e',skin:'#edcbae'},
    daiyu:{robe:'#c4b5c8',trim:'#eee4df',skirt:'#8f819b',hair:'#211d20',skin:'#f1d3bd'},
    zijuan:{robe:'#9982a4',trim:'#d9c6d9',skirt:'#655b79',hair:'#282126',skin:'#efcdb1'},
    wang:{robe:'#665269',trim:'#bca876',skirt:'#423e4c',hair:'#332b29',skin:'#e9c5a7'},
    feng:{robe:'#b55343',trim:'#e1ba67',skirt:'#763a3c',hair:'#211d1b',skin:'#f0cdb1'},
    liwan:{robe:'#71878a',trim:'#c0c9bc',skirt:'#4c6165',hair:'#292321',skin:'#eccbad'},
    tanchun:{robe:'#668d88',trim:'#d3c391',skirt:'#3f6268',hair:'#251f1d',skin:'#efceb1'},
    baoyu:{robe:'#b44b43',trim:'#e5c680',skirt:'#784047',hair:'#231e1c',skin:'#f0ceb2'},
    baochai:{robe:'#d4c89d',trim:'#f0e5c8',skirt:'#879482',hair:'#26211e',skin:'#f0d0b6'},
    xue:{robe:'#8b5a51',trim:'#c6ab7c',skirt:'#5d4845',hair:'#4c4139',skin:'#e6c2a4'},
    xiangyun:{robe:'#cc8265',trim:'#f0d396',skirt:'#8e5e58',hair:'#251f1c',skin:'#f0ceb1'},
    yingchun:{robe:'#9eae91',trim:'#dce0bc',skirt:'#687e70',hair:'#27211e',skin:'#efcfb4'},
    baner:{robe:'#867055',trim:'#c4b186',skirt:'#525f55',hair:'#2c251f',skin:'#d9b18a'}
  };
  const names = {yuanyang:'鸳鸯',jiamu:'贾母',liu:'刘姥姥',xichun:'惜春',amber:'琥珀',daiyu:'黛玉',zijuan:'紫鹃',wang:'王夫人',feng:'凤姐',liwan:'李纨',tanchun:'探春',baoyu:'宝玉',baochai:'宝钗',xue:'薛姨妈',xiangyun:'湘云',yingchun:'迎春',baner:'板儿'};
  function rng(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
  function rr(c,x,y,w,h,r){r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
  function fill(c,color){c.fillStyle=color;c.fill();}
  function stroke(c,color,width=1){c.strokeStyle=color;c.lineWidth=width;c.stroke();}
  function line(c,x1,y1,x2,y2,color,w=1){c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);stroke(c,color,w);}
  function ellipse(c,x,y,rx,ry,color){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);fill(c,color);}
  function poly(c,pts,color){c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.closePath();fill(c,color);}
  function gradient(c,x1,y1,x2,y2,stops){const g=c.createLinearGradient(x1,y1,x2,y2);for(const s of stops)g.addColorStop(s[0],s[1]);return g;}
  function radial(c,x,y,r,stops){const g=c.createRadialGradient(x,y,0,x,y,r);for(const s of stops)g.addColorStop(s[0],s[1]);return g;}
  function paper(c,seed=40){const r=rng(seed);c.save();for(let i=0;i<1600;i++){const x=r()*1280,y=r()*720;c.fillStyle=r()>.5?'rgba(255,248,221,.025)':'rgba(26,50,40,.024)';c.fillRect(x,y,r()*2+1,r()*2+1);}c.restore();}
  function stonePath(c,points,width=90){c.save();c.lineCap='round';c.lineJoin='round';c.beginPath();c.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)c.lineTo(points[i][0],points[i][1]);stroke(c,'#89988a',width+10);stroke(c,'#c2c3aa',width);c.setLineDash([3,24]);stroke(c,'#77877b',width-8);c.setLineDash([]);c.restore();}
  function roof(c,x,y,w,h=65,color='#405b57'){
    c.save();c.shadowColor='#18322d55';c.shadowBlur=12;c.shadowOffsetY=8;
    c.beginPath();c.moveTo(x-28,y+h);c.quadraticCurveTo(x-12,y+h-9,x+12,y+h-24);c.quadraticCurveTo(x+w*.25,y+5,x+w*.5,y);c.quadraticCurveTo(x+w*.75,y+5,x+w-12,y+h-24);c.quadraticCurveTo(x+w+12,y+h-9,x+w+28,y+h);c.quadraticCurveTo(x+w*.52,y+h-13,x,y+h);c.closePath();fill(c,color);c.shadowColor='transparent';
    c.beginPath();c.moveTo(x-30,y+h);c.quadraticCurveTo(x+w/2,y+h-15,x+w+30,y+h);stroke(c,'#263e3a',5);
    for(let i=0;i<15;i++){const xx=x-12+i*(w+24)/14;line(c,xx,y+h-5,x+w/2+(xx-x-w/2)*.72,y+10,'#8b9b8660',1);}
    line(c,x-15,y+h+4,x+w+15,y+h+4,'#b2996740',3);c.restore();
  }
  function windowLattice(c,x,y,w,h,gauze='#b77968'){
    c.fillStyle=gauze;c.fillRect(x,y,w,h);c.strokeStyle='#4d4a39';c.lineWidth=5;c.strokeRect(x,y,w,h);c.lineWidth=1.5;
    for(let i=1;i<5;i++)line(c,x+w*i/5,y,x+w*i/5,y+h,'#5a5748',1.5);
    for(let i=1;i<4;i++)line(c,x,y+h*i/4,x+w,y+h*i/4,'#5a5748',1.5);
    line(c,x,y,x+w,y+h,'#f4d9b438',2);line(c,x+w,y,x,y+h,'#f4d9b438',2);
  }
  function rail(c,x,y,w){line(c,x,y,x+w,y,'#754b3a',7);line(c,x,y+27,x+w,y+27,'#754b3a',5);for(let i=0;i<=w;i+=32)line(c,x+i,y,x+i,y+29,'#81523e',4);}
  function chrysanthemum(c,x,y,s,color='#d4aa55'){
    c.save();c.translate(x,y);for(let ring=0;ring<2;ring++)for(let i=0;i<12;i++){c.rotate(TAU/12);c.beginPath();c.ellipse(0,-s*(ring?0.45:.7),s*.16,s*.55,0,0,TAU);fill(c,ring?color:color+'dd');}ellipse(c,0,0,s*.22,s*.22,'#806338');c.restore();
  }
  function shrub(c,x,y,s,r,colors=['#526f4d','#72835b','#9a9d68']){for(let i=0;i<24;i++){const a=r()*TAU,d=r()*s*.7;ellipse(c,x+Math.cos(a)*d,y+Math.sin(a)*d*.45,s*(.16+r()*.12),s*(.09+r()*.08),colors[i%colors.length]);}}
  function tree(c,x,y,s,r,autumn=false){c.save();c.translate(x,y);c.scale(s,s);c.lineCap='round';c.beginPath();c.moveTo(0,100);c.quadraticCurveTo(-10,30,5,-65);stroke(c,'#5e5140',18);for(let i=0;i<7;i++){const a=-2.8+i*.46;c.beginPath();c.moveTo(0,20-i*8);c.quadraticCurveTo(Math.cos(a)*50,-20-i*8,Math.cos(a)*90,-45-i*7);stroke(c,'#665341',6);}const colors=autumn?['#b6954d','#c2a35b','#8e914f','#d0ae64']:['#446d50','#64845c','#809467'];for(let i=0;i<90;i++){const a=r()*TAU,d=Math.sqrt(r())*105;ellipse(c,Math.cos(a)*d,Math.sin(a)*d*.55-65,10+r()*15,5+r()*9,colors[i%3]+'dd');}c.restore();}
  function bamboo(c,x,y,s,r){c.save();c.translate(x,y);c.scale(s,s);for(let k=0;k<5;k++){const dx=(k-2)*15+r()*8,h=170+r()*100;c.beginPath();c.moveTo(dx,0);c.quadraticCurveTo(dx+12,-h/2,dx+3,-h);stroke(c,k%2?'#446d4e':'#577e52',6);for(let j=1;j<6;j++){const yy=-h*j/6;line(c,dx-3,yy,dx+7,yy,'#9baa73',1);const side=j%2?1:-1;c.beginPath();c.moveTo(dx+3,yy);c.quadraticCurveTo(dx+side*30,yy-25,dx+side*48,yy-35);stroke(c,'#52764f',2);for(let q=0;q<4;q++){const bx=dx+side*(17+q*9),by=yy-15-q*5;c.save();c.translate(bx,by);c.rotate(side*(.3+q*.3));ellipse(c,0,0,14,3,'#466b49dd');c.restore();}}}c.restore();}
  function rock(c,x,y,s=1,color='#7c8b7d'){c.save();c.translate(x,y);c.scale(s,s);c.beginPath();c.moveTo(-48,20);c.lineTo(-38,-22);c.lineTo(-13,-49);c.lineTo(12,-39);c.lineTo(32,-20);c.lineTo(49,19);c.closePath();fill(c,color);poly(c,[[-38,-22],[-13,-49],[12,-39],[-1,-8]],'#a5ad98');poly(c,[[-1,-8],[12,-39],[32,-20],[49,19],[14,7]],'#65796f');ellipse(c,-15,-12,6,10,'#526b60');c.restore();}
  function table(c,x,y,w=110,h=42,color='#76503a',shape=0){c.save();c.shadowColor='#1b2c2540';c.shadowBlur=8;c.shadowOffsetY=5;if(shape===1){c.beginPath();c.ellipse(x,y,w/2,h/2,0,0,TAU);fill(c,color);}else if(shape===2){c.beginPath();for(let i=0;i<8;i++){const a=i*TAU/8,rad=i%2?w*.4:w*.52;const px=x+Math.cos(a)*rad,py=y+Math.sin(a)*rad*.45;i?c.lineTo(px,py):c.moveTo(px,py);}c.closePath();fill(c,color);}else{rr(c,x-w/2,y-h/2,w,h,5);fill(c,color);}c.shadowColor='transparent';line(c,x-w*.35,y+h*.25,x-w*.32,y+h*.9,color,7);line(c,x+w*.35,y+h*.25,x+w*.32,y+h*.9,color,7);line(c,x-w*.42,y-h*.15,x+w*.42,y-h*.15,'#d4af6a70',2);c.restore();}
  function vase(c,x,y,s=1,color='#d3c6a3',flowers=true){c.save();c.translate(x,y);c.scale(s,s);c.beginPath();c.moveTo(-10,-24);c.lineTo(-8,-9);c.quadraticCurveTo(-22,5,-14,22);c.quadraticCurveTo(0,29,14,22);c.quadraticCurveTo(22,5,8,-9);c.lineTo(10,-24);c.closePath();fill(c,color);ellipse(c,0,-24,10,3,'#756f5d');if(flowers)for(let i=0;i<5;i++){line(c,0,-22,(i-2)*9,-58-Math.abs(i-2)*4,'#607653',2);chrysanthemum(c,(i-2)*9,-60-Math.abs(i-2)*4,7,i%2?'#e5ddbb':'#d5b263');}c.restore();}
  function lantern(c,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);line(c,0,-45,0,-28,'#554637',2);ellipse(c,0,0,18,25,'#b75b43');ellipse(c,0,0,12,25,'#cf7553');line(c,-15,-16,15,-16,'#e0b57560',1);line(c,-16,15,16,15,'#e0b57560',1);line(c,0,25,0,41,'#b88c52',2);c.restore();}
  function boat(c,x,y,s=1,flip=1){c.save();c.translate(x,y);c.scale(s*flip,s);c.shadowColor='#173e3c60';c.shadowBlur=8;c.shadowOffsetY=8;c.beginPath();c.moveTo(-115,0);c.quadraticCurveTo(-90,46,68,34);c.quadraticCurveTo(108,24,125,-7);c.quadraticCurveTo(30,13,-115,0);fill(c,'#79533a');c.shadowColor='transparent';c.beginPath();c.moveTo(-100,2);c.quadraticCurveTo(0,23,108,-2);stroke(c,'#c5a268',4);for(let i=-60;i<=50;i+=55){line(c,i,-3,i,-62,'#5e4a37',4);}c.beginPath();c.moveTo(-75,-58);c.quadraticCurveTo(-5,-102,70,-56);c.lineTo(58,-42);c.quadraticCurveTo(-5,-72,-63,-42);c.closePath();fill(c,'#a79870');for(let i=-55;i<60;i+=20)line(c,i,-54,i+10,-70,'#6d695044',1);line(c,100,7,150,-52,'#6a4a33',4);c.restore();}
  function base(c,top,bottom){c.fillStyle=gradient(c,0,0,0,720,[[0,top],[1,bottom]]);c.fillRect(0,0,1280,720);}
  function qinfang(c,r){
    base(c,'#b9cdb3','#718f68');
    ellipse(c,1080,410,340,255,'#6f9b91');ellipse(c,1100,420,290,220,'#86aaa0');
    for(let i=0;i<55;i++){const x=760+r()*500,y=220+r()*440;line(c,x,y,x+15+r()*35,y,'#d5dfc080',1);}
    poly(c,[[0,120],[410,90],[770,230],[720,530],[480,720],[0,720]],'#93a77a');
    stonePath(c,[[-50,600],[250,530],[500,480],[790,360],[1290,350]],105);
    for(let i=0;i<10;i++)rock(c,690+r()*150,270+r()*280,.5+r()*.7);
    c.fillStyle='#aa9c77';c.fillRect(425,192,410,116);c.fillStyle='#d6c8a4';c.fillRect(445,202,370,96);
    for(const x of [457,797]){c.fillStyle='#85533d';c.fillRect(x,198,17,172);ellipse(c,x+8,366,18,7,'#4d5e4b');}
    rail(c,470,288,330);roof(c,405,118,450,78);
    c.fillStyle='#b75e4b';c.fillRect(620,280,110,15);c.fillStyle='#dbc59b';c.fillRect(626,282,98,10);
    tree(c,140,240,1.3,r,true);tree(c,1050,130,.9,r,false);
    for(let i=0;i<18;i++){const x=30+r()*410,y=535+r()*165;shrub(c,x,y,23,r,['#60734c','#7e8b55','#8e945d']);if(i%2===0)chrysanthemum(c,x,y-14,9,['#d9b45c','#e4d7aa','#a34e43'][i%3]);}
    c.fillStyle='#38594b';c.font='22px "Noto Serif CJK SC",serif';c.textAlign='center';c.fillText('沁 芳',635,186);
    paper(c,1);
  }
  function xiaoxiang(c,r){
    base(c,'#b7c5a7','#728c6d');
    c.fillStyle='#d4d1b8';c.fillRect(610,150,570,225);c.fillStyle='#a99b7a';c.fillRect(590,355,610,27);roof(c,565,86,650,74,'#465c58');
    c.fillStyle='#69543f';c.fillRect(840,220,112,155);windowLattice(c,646,208,154,103,'#b98178');windowLattice(c,994,208,145,103,'#b98178');
    c.fillStyle='#514a3c';c.fillRect(852,239,88,136);for(let i=0;i<4;i++){c.fillStyle=['#9c8c68','#6f7b68','#a59172'][i%3];c.fillRect(860,250+i*28,70,20);}
    stonePath(c,[[0,565],[260,535],[480,460],[690,440],[905,390]],88);
    poly(c,[[0,360],[310,315],[480,420],[270,570],[0,610]],'#758c65');
    for(let i=0;i<24;i++){const x=20+r()*410,y=350+r()*230;ellipse(c,x,y,12+r()*25,5+r()*10,'#526f53'+(i%2?'88':'bb'));}
    for(let i=0;i<7;i++)bamboo(c,70+i*76,385+r()*50,.65+r()*.35,r);
    for(let i=0;i<6;i++)bamboo(c,1060+i*54,190+r()*70,.8+r()*.4,r);
    rock(c,510,330,1.2);rock(c,1160,470,1.5);rock(c,90,660,1.1);
    c.fillStyle='#536052';c.font='20px "Noto Serif CJK SC",serif';c.textAlign='center';c.fillText('潇 湘 馆',890,180);
    for(let i=0;i<25;i++){const x=410+r()*230,y=340+r()*210;ellipse(c,x,y,3+r()*6,2+r()*3,'#a2b58b');}
    paper(c,2);
  }
  function qiushuang(c,r){
    base(c,'#bac4a7','#889b74');
    c.fillStyle='#d8cfb3';c.fillRect(0,105,1280,310);c.fillStyle='#815e43';c.fillRect(0,390,1280,330);
    for(let i=0;i<18;i++)line(c,0,415+i*20,1280,415+i*20,'#b0895b25',2);
    for(const x of [30,390,920,1225]){c.fillStyle='#754a37';c.fillRect(x,100,22,490);}
    roof(c,-40,64,1360,65,'#4d6058');
    windowLattice(c,70,160,250,140);windowLattice(c,960,160,230,140);
    c.fillStyle='#3c5145';c.fillRect(470,135,400,130);c.fillStyle='#d8c9a6';c.fillRect(482,146,376,108);
    c.fillStyle='#3f4d43';c.textAlign='center';c.font='25px "Noto Serif CJK SC",serif';c.fillText('烟霞闲骨格　泉石野生涯',670,202);
    c.fillStyle='#7d5b42';c.fillRect(500,276,340,20);c.fillRect(520,294,16,80);c.fillRect(804,294,16,80);vase(c,565,262,.75,'#b9c1ae');vase(c,780,267,.65,'#d4c6a2',false);
    for(let i=0;i<5;i++){ellipse(c,778+(i-2)*10,244+Math.abs(i-2)*4,8,13,'#d1ac4d');}
    table(c,670,440,270,100,'#78503a',1);table(c,360,510,105,55,'#81573c',2);table(c,975,500,105,55,'#81573c',1);
    for(let i=0;i<7;i++){const a=i*TAU/7;ellipse(c,670+Math.cos(a)*185,450+Math.sin(a)*102,35,17,['#884b43','#5e7770','#a18756'][i%3]);}
    c.fillStyle='#b99a66';c.fillRect(545,400,40,25);c.fillStyle='#e1d9ba';c.fillRect(550,404,30,16);
    for(let i=0;i<9;i++){ellipse(c,625+i*13,420+(i%2)*6,8,5,'#d9cfb0');}
    lantern(c,425,180,.8);lantern(c,900,180,.8);paper(c,3);
  }
  function dock(c,r){
    base(c,'#a9c0af','#678e82');
    c.fillStyle=gradient(c,0,190,0,720,[[0,'#7fa99b'],[1,'#436f69']]);c.fillRect(0,190,1280,530);
    for(let i=0;i<90;i++){const x=r()*1280,y=210+r()*490;line(c,x,y,x+10+r()*48,y,'#d4ddba50',1);}
    poly(c,[[0,80],[390,105],[570,250],[435,425],[490,720],[0,720]],'#8e9e79');
    stonePath(c,[[0,600],[260,550],[450,470],[620,440]],130);
    poly(c,[[310,495],[760,410],[820,458],[370,550]],'#9a7a52');for(let i=0;i<13;i++)line(c,340+i*35,489-i*6,385+i*35,537-i*6,'#684f3b',2);
    boat(c,810,420,1.05,1);boat(c,1030,555,.8,-1);
    for(let i=0;i<35;i++){const x=480+r()*760,y=260+r()*390;line(c,x,y,x+(r()-.5)*12,y-20-r()*28,'#677453',2);if(i%3===0)ellipse(c,x,y-35,11,4,'#897f55');}
    for(let i=0;i<13;i++){const x=70+r()*340,y=250+r()*330;rock(c,x,y,.45+r()*.8);}
    c.fillStyle='#c9c7a8';c.fillRect(1030,90,230,105);roof(c,1000,55,290,50);windowLattice(c,1070,115,65,55,'#a9b09a');windowLattice(c,1160,115,65,55,'#a9b09a');
    tree(c,120,190,1,r,true);tree(c,390,160,.75,r,false);
    c.fillStyle='#e0d6b8';c.font='19px "Noto Serif CJK SC",serif';c.textAlign='center';c.fillText('荇 叶 渚',175,400);paper(c,4);
  }
  function hengyuan(c,r){
    base(c,'#c2c8b4','#879782');
    c.fillStyle='#e0dfce';c.fillRect(330,105,900,390);c.fillStyle='#c5c3ad';c.fillRect(350,120,860,355);roof(c,295,60,950,65,'#55655e');
    c.fillStyle='#d9d8c7';c.fillRect(405,160,745,300);
    for(const x of [350,1160]){c.fillStyle='#71624c';c.fillRect(x,120,19,430);}
    c.fillStyle='#b9b6a0';c.fillRect(760,282,300,22);c.fillRect(780,303,14,102);c.fillRect(1020,303,14,102);
    vase(c,900,268,.75,'#9e9278');c.fillStyle='#68755e';c.fillRect(962,248,42,9);c.fillStyle='#7a826d';c.fillRect(968,235,46,9);
    c.fillStyle='#c6c8b5';c.fillRect(430,308,240,95);c.fillStyle='#879888';c.fillRect(430,280,240,30);c.fillStyle='#768b7b55';c.fillRect(425,185,250,120);line(c,425,185,425,310,'#6c7d6d',5);line(c,675,185,675,310,'#6c7d6d',5);
    c.fillStyle='#b7b6a2';c.fillRect(0,490,1280,230);for(let i=0;i<18;i++)line(c,0,505+i*15,1280,505+i*15,'#7f8b7930',1);
    stonePath(c,[[0,625],[280,590],[480,510]],90);
    for(let i=0;i<9;i++){const x=30+r()*260,y=170+r()*350;rock(c,x,y,.5+r()*.8,'#77877b');}
    for(let i=0;i<45;i++){const x=20+r()*290,y=110+r()*330;line(c,x,y,x+12,y+30,'#4f7056',3);ellipse(c,x+8,y+12,12,5,i%3?'#52765b':'#789074');if(i%6===0)ellipse(c,x+10,y+28,4,5,'#a7604e');}
    c.fillStyle='#526052';c.font='21px "Noto Serif CJK SC",serif';c.textAlign='center';c.fillText('蘅 芜 苑',780,145);paper(c,5);
  }
  function zhuijin(c,r){
    base(c,'#bdc7ad','#799582');
    c.fillStyle='#729a8e';c.fillRect(0,85,1280,265);for(let i=0;i<45;i++)line(c,r()*1280,110+r()*220,r()*50+1200,110+r()*220,'#d8dab72b',1);
    c.fillStyle='#b8b18f';c.fillRect(850,150,240,55);roof(c,825,112,290,43);for(const x of [870,1060]){c.fillStyle='#765340';c.fillRect(x,183,10,65);}
    c.fillStyle='#d5c7a4';c.fillRect(0,260,1280,160);c.fillStyle='#8d6547';c.fillRect(0,415,1280,305);
    for(let i=0;i<20;i++)line(c,0,430+i*17,1280,430+i*17,'#d0a66b20',2);
    roof(c,-50,205,1380,67,'#4a5e55');
    for(const x of [45,360,895,1215]){c.fillStyle='#7e4d39';c.fillRect(x,270,23,400);}
    c.fillStyle='#8f3f37';c.fillRect(420,380,450,270);c.fillStyle='#bc6650';c.fillRect(430,390,430,250);for(let i=0;i<8;i++)line(c,435,400+i*30,855,400+i*30,'#e4bd7730',1);
    table(c,230,365,150,55,'#754a37',2);table(c,1040,365,150,55,'#754a37',2);table(c,230,530,125,48,'#754a37',1);table(c,1040,530,125,48,'#754a37',1);
    table(c,550,335,110,44,'#80503a',2);table(c,770,335,110,44,'#80503a',1);
    for(const p of [[230,365],[1040,365],[550,335],[770,335]]){vase(c,p[0]-25,p[1]-20,.38,'#bac0aa',false);ellipse(c,p[0]+22,p[1]-11,12,6,'#d1b072');}
    lantern(c,395,325,.85);lantern(c,880,325,.85);
    for(let i=0;i<5;i++){const x=900+i*28;line(c,x,225,x,193,'#574d3c',2);ellipse(c,x,188,6,10,'#685c49');}
    c.fillStyle='#43544a';c.font='22px "Noto Serif CJK SC",serif';c.textAlign='center';c.fillText('缀 锦 阁',650,293);paper(c,6);
  }
  function title(c,r){
    base(c,'#c8d4ba','#547c68');
    c.fillStyle=radial(c,950,130,600,[[0,'#e8e0b9'],[.5,'#a6bda0'],[1,'#527965']]);c.fillRect(0,0,1280,720);
    ellipse(c,1010,575,480,220,'#547f73');
    for(let i=0;i<75;i++)line(c,650+r()*600,410+r()*290,670+r()*600,410+r()*290,'#dce0bd35',1);
    poly(c,[[540,410],[780,300],[1040,340],[1280,270],[1280,460],[900,510]],'#749172');
    c.fillStyle='#d5c6a0';c.fillRect(830,265,350,130);for(const x of [850,1150]){c.fillStyle='#81503b';c.fillRect(x,270,18,180);}rail(c,860,370,300);roof(c,795,175,420,80,'#36554e');
    tree(c,1110,235,1.4,r,true);tree(c,730,290,1.05,r,false);rock(c,690,540,1.8);rock(c,1170,540,1.4);
    for(let i=0;i<6;i++)bamboo(c,1210+i*30,350,.7+r()*.4,r);
    stonePath(c,[[570,720],[710,590],[820,480],[985,400]],80);
    for(let i=0;i<16;i++)chrysanthemum(c,600+r()*650,550+r()*150,7+r()*5,i%3?'#d6b86b':'#a85b48');
    c.save();c.globalAlpha=.13;c.fillStyle='#173b32';c.beginPath();c.arc(1010,120,74,0,TAU);c.fill();c.restore();paper(c,40);
  }
  const drawers={qinfang,xiaoxiang,qiushuang,dock,hengyuan,zhuijin,title};
  function getBackground(scene){if(cache[scene])return cache[scene];const cv=document.createElement('canvas');cv.width=1280;cv.height=720;const c=cv.getContext('2d');drawers[scene](c,rng(40+Object.keys(drawers).indexOf(scene)));cache[scene]=cv;return cv;}
  function drawScene(c,scene,time){c.drawImage(getBackground(scene),0,0);c.save();if(scene==='qinfang'||scene==='dock'||scene==='zhuijin'||scene==='title'){c.globalAlpha=.22;c.strokeStyle='#edf0cf';c.lineWidth=1;for(let i=0;i<11;i++){const y=360+i*24;const off=Math.sin(time*.0007+i)*25;c.beginPath();c.moveTo(720+off,y);c.quadraticCurveTo(850+off,y-4,970+off,y);c.stroke();}}if(scene==='qinfang'||scene==='title'){for(let i=0;i<9;i++){const x=(i*173+time*.008*(i%3+1))%1400-60;const y=110+(i*67+Math.sin(time*.0005+i)*35)%510;c.save();c.translate(x,y);c.rotate(time*.001+i);ellipse(c,0,0,6,3,i%2?'#c6a35b':'#a97d43');c.restore();}}c.restore();}
  function drawCharacter(c,id,x,y,scale=1,time=0,opts={}){
    const p=palettes[id]||palettes.yuanyang;const walking=opts.walking||false;const bob=walking?Math.sin(time*.015)*2:Math.sin(time*.002+x)*.6;const laugh=opts.laugh?Math.abs(Math.sin(time*.018+x))*4:0;
    c.save();c.translate(x,y+bob-laugh);c.scale(scale,scale);if(opts.dir==='left')c.scale(-1,1);
    ellipse(c,0,3,25,8,'#17372f38');
    const step=walking?Math.sin(time*.015)*5:0;ellipse(c,-9+step,0,7,4,'#302c29');ellipse(c,9-step,0,7,4,'#302c29');
    c.beginPath();c.moveTo(-17,-48);c.quadraticCurveTo(-26,-16,-24,-3);c.quadraticCurveTo(0,6,24,-3);c.quadraticCurveTo(25,-18,17,-48);c.closePath();fill(c,p.skirt);
    for(let i=-14;i<18;i+=8)line(c,i,-36,i*1.2,-5,'#f3dfb21f',1);
    c.beginPath();c.moveTo(-17,-70);c.quadraticCurveTo(-28,-58,-25,-39);c.lineTo(-16,-31);c.lineTo(-12,-48);c.lineTo(-16,-23);c.quadraticCurveTo(0,-17,16,-23);c.lineTo(12,-48);c.lineTo(16,-31);c.lineTo(25,-39);c.quadraticCurveTo(28,-58,17,-70);c.closePath();fill(c,p.robe);
    line(c,0,-68,0,-24,p.trim,2);c.beginPath();c.moveTo(-12,-69);c.lineTo(0,-53);c.lineTo(12,-69);stroke(c,p.trim,3);line(c,-16,-27,16,-27,p.trim,3);
    ellipse(c,-23,-39,5,7,p.skin);ellipse(c,23,-39,5,7,p.skin);
    c.beginPath();c.moveTo(-8,-76);c.lineTo(-8,-67);c.quadraticCurveTo(0,-61,8,-67);c.lineTo(8,-77);fill(c,p.skin);
    ellipse(c,0,-88,17,21,p.skin);ellipse(c,-16,-88,3,6,p.skin);ellipse(c,16,-88,3,6,p.skin);
    c.beginPath();c.moveTo(-17,-91);c.quadraticCurveTo(-20,-115,0,-114);c.quadraticCurveTo(21,-114,18,-89);c.lineTo(13,-100);c.quadraticCurveTo(0,-91,-14,-101);c.closePath();fill(c,p.hair);
    if(id==='jiamu'||id==='liu'||id==='xue'||id==='wang'){ellipse(c,0,-111,12,8,p.hair);}else if(id==='baner'){ellipse(c,0,-112,6,5,p.hair);}else{ellipse(c,-10,-108,8,7,p.hair);ellipse(c,10,-108,8,7,p.hair);}
    if(id==='liu'){c.beginPath();c.moveTo(-19,-100);c.quadraticCurveTo(0,-122,19,-100);c.lineTo(15,-107);c.quadraticCurveTo(0,-119,-15,-107);c.closePath();fill(c,'#6e8175');for(let i=0;i<5;i++)chrysanthemum(c,-15+i*7,-109+(i%2)*4,4,['#c7503f','#e0b34e','#e4d8aa'][i%3]);}
    if(id==='yuanyang'){line(c,9,-112,22,-118,'#d4b467',2);ellipse(c,22,-118,3,3,'#b54e3b');}
    if(id==='feng'){line(c,-17,-112,17,-117,'#e1ba61',3);for(let i=0;i<3;i++)ellipse(c,-13+i*12,-116-Math.abs(i-1)*2,3,3,'#d8b75f');}
    if(id==='baoyu'){ellipse(c,0,-70,4,5,'#d8bd71');line(c,0,-65,0,-54,'#d8bd71',1);}
    line(c,-8,-88,-3,-89,'#45352f',1.3);line(c,3,-89,8,-88,'#45352f',1.3);ellipse(c,-5,-85,1.2,1.6,'#332b28');ellipse(c,5,-85,1.2,1.6,'#332b28');line(c,0,-84,-1,-79,'#b2826d',1);
    c.beginPath();if(opts.laugh)c.arc(0,-76,4,0,Math.PI);else{c.moveTo(-3,-76);c.quadraticCurveTo(0,-74,3,-76);}stroke(c,'#9d5e55',1.2);
    if(opts.selected){c.save();c.scale(opts.dir==='left'?-1:1,1);c.translate(0,-135);c.rotate(Math.PI/4);c.fillStyle='#e6c16d';c.fillRect(-5,-5,10,10);c.restore();}
    c.restore();
  }
  function drawName(c,id,x,y,near=false){const name=names[id]||id;c.save();c.font='12px "Noto Serif CJK SC","Songti SC",serif';const w=c.measureText(name).width+20;rr(c,x-w/2,y-152,w,24,3);fill(c,near?'#f1e6cdee':'#173b34c9');c.fillStyle=near?'#85432f':'#f0e5cb';c.textAlign='center';c.textBaseline='middle';c.fillText(name,x,y-140);c.restore();}
  function drawPortrait(c,id){const p=palettes[id]||palettes.yuanyang;c.clearRect(0,0,120,136);c.fillStyle=gradient(c,0,0,0,136,[[0,'#d8d7bc'],[1,'#91a58b']]);c.fillRect(0,0,120,136);c.save();c.globalAlpha=.15;for(let i=0;i<8;i++){c.beginPath();c.arc(60,65,20+i*9,0,TAU);stroke(c,'#365c4c',1);}c.restore();c.save();c.translate(60,132);c.scale(1.35,1.35);c.beginPath();c.moveTo(-31,5);c.quadraticCurveTo(-30,-46,-16,-56);c.lineTo(-9,-70);c.lineTo(9,-70);c.lineTo(16,-56);c.quadraticCurveTo(30,-46,31,5);fill(c,p.robe);c.beginPath();c.moveTo(-16,-56);c.lineTo(0,-34);c.lineTo(16,-56);stroke(c,p.trim,4);ellipse(c,0,-79,24,29,p.skin);c.beginPath();c.moveTo(-24,-82);c.quadraticCurveTo(-28,-116,0,-117);c.quadraticCurveTo(29,-116,25,-80);c.lineTo(17,-99);c.quadraticCurveTo(0,-89,-20,-100);c.closePath();fill(c,p.hair);if(id==='jiamu'||id==='liu'||id==='xue'||id==='wang')ellipse(c,0,-114,17,11,p.hair);else{ellipse(c,-15,-111,11,9,p.hair);ellipse(c,15,-111,11,9,p.hair);}if(id==='liu'){for(let i=0;i<5;i++)chrysanthemum(c,-19+i*9,-114+(i%2)*4,5,['#c7503f','#e0b34e','#e4d8aa'][i%3]);}if(id==='yuanyang'){line(c,11,-117,30,-125,'#d4b467',2);ellipse(c,30,-125,4,4,'#b54e3b');}line(c,-13,-80,-5,-82,'#4b3830',1.5);line(c,5,-82,13,-80,'#4b3830',1.5);ellipse(c,-8,-76,1.6,2,'#362b28');ellipse(c,8,-76,1.6,2,'#362b28');c.beginPath();c.moveTo(-4,-64);c.quadraticCurveTo(0,-61,5,-65);stroke(c,'#a36457',1.5);c.restore();c.fillStyle='#f4ead51f';c.fillRect(0,0,120,136);}
  const pipPositions={0:[],1:[[.5,.5]],2:[[.28,.25],[.72,.75]],3:[[.28,.22],[.5,.5],[.72,.78]],4:[[.28,.25],[.72,.25],[.28,.75],[.72,.75]],5:[[.28,.22],[.72,.22],[.5,.5],[.28,.78],[.72,.78]],6:[[.28,.2],[.72,.2],[.28,.5],[.72,.5],[.28,.8],[.72,.8]]};
  function domino(c,x,y,a,b,active=true){c.save();c.shadowColor='#2b281f55';c.shadowBlur=active?12:5;c.shadowOffsetY=5;rr(c,x,y,68,150,7);fill(c,active?'#f4efd9':'#ded7c0');c.shadowColor='transparent';rr(c,x+4,y+4,60,142,4);stroke(c,active?'#9f513e':'#9b9078',1.5);line(c,x+8,y+75,x+60,y+75,'#9c927a',1);for(const [n,yy] of [[a,y],[b,y+75]]){for(const pos of pipPositions[n]){const red=n===1||n===4;ellipse(c,x+pos[0]*68,yy+pos[1]*75,5.3,5.3,red?'#a64535':'#283e36');}}c.restore();}
  function drawDominoes(c,tiles,active=0,combined=''){c.clearRect(0,0,860,190);c.save();c.fillStyle='#8a775514';c.fillRect(0,0,860,190);const start=245;tiles.forEach((t,i)=>{domino(c,start+i*135,17,t[0],t[1],i===active||active===3);if(i<2){c.fillStyle='#9c8a67';c.font='22px serif';c.fillText('+',start+i*135+90,98);}});if(combined){c.fillStyle='#98503c';c.font='17px "Noto Serif CJK SC",serif';c.textAlign='center';c.fillText(combined,445,183);}c.restore();}
  function seal(c,text,x,y){c.save();c.translate(x,y);c.rotate(-.05);c.fillStyle='#a44b38';c.fillRect(-18,-18,36,36);c.strokeStyle='#e1c59b';c.lineWidth=1;c.strokeRect(-14,-14,28,28);c.fillStyle='#f0d8b4';c.font='12px "Noto Serif CJK SC",serif';c.textAlign='center';c.textBaseline='middle';c.fillText(text,0,1);c.restore();}
  window.Art={drawScene,drawCharacter,drawName,drawPortrait,drawDominoes,seal,palettes,names,getBackground};
})();
