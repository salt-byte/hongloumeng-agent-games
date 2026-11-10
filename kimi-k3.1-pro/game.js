(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const canvas=$('game-canvas'),ctx=canvas.getContext('2d');
  const roles={鸳鸯:'贾母身边大丫鬟',贾母:'史太君',刘姥姥:'乡间老亲家',惜春:'贾府四姑娘',琥珀:'贾母身边丫鬟',黛玉:'林姑娘',紫鹃:'潇湘馆丫鬟',王夫人:'贾府夫人',凤姐:'琏二奶奶',李纨:'大奶奶',探春:'贾府三姑娘',板儿:'刘姥姥的外孙',宝玉:'宝二爷',宝钗:'薛姑娘',薛姨妈:'薛家姨妈',史湘云:'史大姑娘',迎春:'贾府二姑娘',旁白:'园中记',你的分寸:'鸳鸯心想'};
  const acts=[['第一幕','园中画'],['第二幕','潇湘茶'],['第三幕','一箸一笑'],['第四幕','残荷秋声'],['第五幕','雪洞陈设'],['第六幕','牙牌生香']];
  const sceneDefs={
    qinfang:{name:'沁芳亭',sub:'菊影临水 · 园中第一景',short:'亭',objective:'见过贾母，陪刘姥姥游园',left:{x:150,y:525},right:{x:1080,y:400},bounds:[45,1215,295,635],npcs:[['jiamu',670,355],['liu',520,425],['xichun',850,400],['amber',745,410],['baner',465,450]],exits:[{to:'xiaoxiang',x:1170,y:395,label:'月洞门 · 往潇湘馆',req:'qinMet'}]},
    xiaoxiang:{name:'潇湘馆',sub:'翠竹夹路 · 霞影糊窗',short:'竹',objective:'往正屋吃茶，听贾母说窗纱',left:{x:125,y:540},right:{x:1100,y:490},bounds:[45,1215,330,640],npcs:[['liu',390,480],['jiamu',740,380],['daiyu',895,405],['wang',690,450],['feng',1040,465],['zijuan',960,390]],exits:[{to:'qinfang',x:65,y:555,label:'返回沁芳亭'},{to:'qiushuang',x:1170,y:500,label:'往秋爽斋',req:'gauze'}]},
    qiushuang:{name:'秋爽斋',sub:'晓翠堂早饭 · 烟霞泉石',short:'宴',objective:'早饭前，听凤姐有何安排',left:{x:130,y:570},right:{x:1090,y:575},bounds:[45,1215,340,650],npcs:[['feng',350,375],['liwan',395,575],['liu',600,570],['jiamu',820,375],['tanchun',1040,430]],exits:[{to:'xiaoxiang',x:65,y:590,label:'返回潇湘馆'},{to:'dock',x:1180,y:585,label:'饭后往荇叶渚',req:'banquet'}],obstacles:[[535,395,270,95]]},
    dock:{name:'荇叶渚',sub:'棠木舫头 · 留得残荷听雨声',short:'舟',objective:'到残荷边听黛玉说话',left:{x:115,y:575},right:{x:650,y:490},bounds:[40,745,355,650],npcs:[['feng',280,410],['baoyu',445,505],['daiyu',565,445],['baochai',650,540]],exits:[{to:'qiushuang',x:60,y:600,label:'返回秋爽斋'},{to:'hengyuan',x:710,y:455,label:'登棠木舫 · 往蘅芜苑',req:'lotus'}]},
    hengyuan:{name:'蘅芜苑',sub:'异香藤翠 · 雪洞一般',short:'素',objective:'听贾母如何收拾蘅芜苑',left:{x:130,y:565},right:{x:1090,y:560},bounds:[45,1215,355,650],npcs:[['baochai',660,440],['jiamu',835,390],['xue',1000,465]],exits:[{to:'dock',x:65,y:595,label:'返回荇叶渚'},{to:'zhuijin',x:1170,y:575,label:'往缀锦阁吃酒',req:'heng'}]},
    zhuijin:{name:'缀锦阁',sub:'水亭听乐 · 金鸳鸯三宣牙牌令',short:'令',objective:'请贾母饮令酒，开牙牌令',left:{x:140,y:585},right:{x:1090,y:585},bounds:[45,1215,330,650],npcs:[['jiamu',650,365],['liu',505,490],['feng',855,410],['xiangyun',1010,455],['daiyu',1090,555],['baochai',950,585],['yingchun',350,565]],exits:[{to:'hengyuan',x:65,y:605,label:'返回蘅芜苑'}]}
  };
  const order=Object.keys(sceneDefs);
  const keys={};
  let player={x:160,y:530,dir:'right',walking:false,target:null,pendingNpc:null,pendingExit:null};
  let dialogue=null,previousMode='play',toastTimer=0,captionTimer=0,lastTime=0,nearest=null,started=false;
  let cardState=null;
  const baseFlags=()=>({qinMet:false,slip:false,gauze:null,prank:null,chopsticks:null,banquet:false,lotus:false,heng:null,cardsStarted:false,card:null});
  const state={mode:'title',scene:'qinfang',flags:baseFlags(),unlocked:['qinfang'],visited:['qinfang'],journal:[],objective:sceneDefs.qinfang.objective,laughing:false};
  function fit(){document.documentElement.style.setProperty('--scale',Math.min(innerWidth/1280,innerHeight/720));}
  addEventListener('resize',fit);fit();
  function setMode(mode){state.mode=mode;}
  function hideAll(){
    for(const id of ['title-screen','intro-screen','hud','dialogue','map-overlay','jump-overlay','cards-overlay','ending-screen','interact-prompt','control-hint','scene-caption'])$(id).classList.add('hidden');
  }
  function reset(){Object.assign(state,{scene:'qinfang',flags:baseFlags(),unlocked:['qinfang'],visited:['qinfang'],journal:[],objective:sceneDefs.qinfang.objective,laughing:false});player={x:160,y:530,dir:'right',walking:false,target:null,pendingNpc:null,pendingExit:null};dialogue=null;cardState=null;}
  function showTitle(){reset();started=false;hideAll();$('title-screen').classList.remove('hidden');setMode('title');history.replaceState(null,'',location.pathname+location.search);}
  function startNew(){reset();started=true;hideAll();$('intro-screen').classList.remove('hidden');setMode('intro');history.replaceState(null,'',location.pathname+location.search);}
  function enterGarden(){hideAll();$('hud').classList.remove('hidden');$('control-hint').classList.remove('hidden');setMode('play');goScene('qinfang',null,true);updateHUD();}
  function setObjective(text){state.objective=text;updateHUD();}
  function updateHUD(){
    const index=order.indexOf(state.scene);$('act-number').textContent=acts[index][0];$('act-name').textContent=acts[index][1];$('objective-text').textContent=state.objective;
    $('progress-dots').innerHTML=order.map((s,i)=>`<i class="progress-dot ${state.visited.includes(s)?'done':''} ${i===index?'current':''}" title="${sceneDefs[s].name}"></i>`).join('');
  }
  function unlock(scene){if(!state.unlocked.includes(scene))state.unlocked.push(scene);}
  function record(key,label){const old=state.journal.findIndex(j=>j.key===key);if(old>=0)state.journal.splice(old,1);state.journal.push({key,label});}
  function toast(html){const el=$('toast');el.innerHTML=html;el.classList.remove('hidden');el.style.animation='none';void el.offsetWidth;el.style.animation='toast 3.4s both';clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.add('hidden'),3400);}
  function sceneCaption(scene){const d=sceneDefs[scene],el=$('scene-caption');el.querySelector('h2').textContent=d.name;el.querySelector('p').textContent=d.sub;el.classList.remove('hidden');el.style.animation='none';void el.offsetWidth;el.style.animation='caption 3.1s both';clearTimeout(captionTimer);captionTimer=setTimeout(()=>el.classList.add('hidden'),3100);}
  function goScene(scene,from=null,initial=false){
    if(!state.unlocked.includes(scene))return;
    const prior=from||state.scene;state.scene=scene;if(!state.visited.includes(scene))state.visited.push(scene);
    const priorIndex=order.indexOf(prior),nextIndex=order.indexOf(scene);const spawn=initial?sceneDefs[scene].left:(nextIndex<priorIndex?sceneDefs[scene].right:sceneDefs[scene].left);
    player.x=spawn.x;player.y=spawn.y;player.target=null;player.path=[];player.pendingNpc=null;player.pendingExit=null;nearest=null;
    $('map-overlay').classList.add('hidden');setMode('play');updateHUD();sceneCaption(scene);Story.onEnter(scene);
  }
  function drawPortrait(name){
    const c=$('portrait').getContext('2d');
    if(name==='旁白'){c.clearRect(0,0,120,136);const grad=c.createLinearGradient(0,0,0,136);grad.addColorStop(0,'#b7c5a7');grad.addColorStop(1,'#688573');c.fillStyle=grad;c.fillRect(0,0,120,136);c.strokeStyle='#f0e2bd35';for(let i=0;i<5;i++){c.beginPath();c.arc(60,62,15+i*12,0,Math.PI*2);c.stroke();}c.fillStyle='#f2e5c7';c.textAlign='center';c.font='20px "Noto Serif CJK SC",serif';c.fillText('园',60,55);c.fillText('中',60,80);c.fillText('记',60,105);return;}
    const ids={你的分寸:'yuanyang'};Art.drawPortrait(c,ids[name]||Object.keys(Art.names).find(k=>Art.names[k]===name)||'yuanyang');
  }
  function say(lines,onComplete=null){
    if(!Array.isArray(lines)||!lines.length){if(onComplete)onComplete();return;}
    $('map-overlay').classList.add('hidden');$('choices').classList.add('hidden');$('dialogue').classList.remove('hidden');$('interact-prompt').classList.add('hidden');setMode('dialogue');
    dialogue={lines,index:0,onComplete,started:performance.now(),shown:-1,full:false};renderDialogueLine();
  }
  function renderDialogueLine(){
    const line=dialogue.lines[dialogue.index];$('speaker-name').textContent=line.speaker;$('speaker-role').textContent=roles[line.speaker]||'';$('portrait-seal').textContent=line.speaker==='旁白'?'第四十回':'大观园';drawPortrait(line.speaker);dialogue.started=performance.now();dialogue.shown=-1;dialogue.full=false;$('dialogue-text').textContent='';$('continue-hint').classList.remove('hidden');
  }
  function revealDialogue(){if(!dialogue)return;const line=dialogue.lines[dialogue.index];$('dialogue-text').textContent=line.text;dialogue.full=true;dialogue.shown=line.text.length;}
  function advanceDialogue(){
    if(state.mode!=='dialogue'||!dialogue)return;
    if(!dialogue.full){revealDialogue();return;}
    if(dialogue.index<dialogue.lines.length-1){dialogue.index++;renderDialogueLine();return;}
    const done=dialogue.onComplete;dialogue=null;$('dialogue').classList.add('hidden');setMode('play');if(done)done();
  }
  function choice(prompt,options,speaker='你的分寸'){
    setMode('choice');$('dialogue').classList.remove('hidden');$('speaker-name').textContent=speaker;$('speaker-role').textContent=roles[speaker]||'';$('portrait-seal').textContent='由你决定';drawPortrait(speaker);$('dialogue-text').textContent=prompt;$('continue-hint').classList.add('hidden');
    const box=$('choices');box.innerHTML='';box.classList.remove('hidden');options.forEach((op,i)=>{const b=document.createElement('button');b.className='choice-button';b.innerHTML=`<span class="num">${['一','二','三'][i]}</span>${op.label}${op.detail?`<small>${op.detail}</small>`:''}`;b.addEventListener('click',ev=>{ev.stopPropagation();box.classList.add('hidden');$('dialogue').classList.add('hidden');setMode('play');op.run();});box.appendChild(b);});
  }
  function npcData(id){return sceneDefs[state.scene].npcs.find(n=>n[0]===id);}
  function exitAvailable(ex){return state.unlocked.includes(ex.to)&&(!ex.req||state.flags[ex.req]);}
  function interactNpc(id){player.target=null;player.path=[];player.pendingNpc=null;player.pendingExit=null;Story.interact(id);}
  function tryExit(ex){
    if(!exitAvailable(ex)){const hints={qinMet:'先见过贾母',gauze:'先听完窗纱这一段',banquet:'还未饭毕',lotus:'先听听黛玉说残荷',heng:'先领下蘅芜苑的陈设'};toast(hints[ex.req]||'此处尚未开启');return;}
    goScene(ex.to,state.scene);
  }
  function nearestInteraction(){
    if(state.mode!=='play')return null;let best=null,dist=94;
    for(const n of sceneDefs[state.scene].npcs){const d=Math.hypot(player.x-n[1],player.y-(n[2]+20));if(d<dist){dist=d;best={type:'npc',data:n,x:n[1],y:n[2]-120,text:`与${Art.names[n[0]]}交谈`};}}
    for(const ex of sceneDefs[state.scene].exits){const d=Math.hypot(player.x-ex.x,player.y-ex.y);if(d<dist){dist=d;best={type:'exit',data:ex,x:ex.x,y:ex.y-45,text:exitAvailable(ex)?ex.label:'出入口 · 尚未开启'};}}
    return best;
  }
  function collides(x,y){
    const b=sceneDefs[state.scene].bounds;if(x<b[0]||x>b[1]||y<b[2]||y>b[3])return true;
    if(state.scene==='qinfang'&&x>850&&y>470)return true;
    const obs=sceneDefs[state.scene].obstacles||[];return obs.some(r=>x>r[0]-16&&x<r[0]+r[2]+16&&y>r[1]-15&&y<r[1]+r[3]+16);
  }
  function findPath(sx,sy,tx,ty){
    const size=32,cols=40,rows=23,key=(x,y)=>y*cols+x;
    const nearestCell=(px,py)=>{const bx=Math.max(0,Math.min(cols-1,Math.floor(px/size))),by=Math.max(0,Math.min(rows-1,Math.floor(py/size)));let best=null,score=Infinity;for(let radius=0;radius<8&&!best;radius++)for(let y=by-radius;y<=by+radius;y++)for(let x=bx-radius;x<=bx+radius;x++){if(x<0||y<0||x>=cols||y>=rows)continue;const wx=x*size+16,wy=y*size+16;if(collides(wx,wy))continue;const d=Math.hypot(wx-px,wy-py);if(d<score){score=d;best={x,y};}}return best;};
    const start=nearestCell(sx,sy),goal=nearestCell(tx,ty);if(!start||!goal)return[];
    const open=[{...start,f:0}],came=new Map(),cost=new Map([[key(start.x,start.y),0]]),closed=new Set();let found=null;
    while(open.length){open.sort((a,b)=>a.f-b.f);const cur=open.shift(),ck=key(cur.x,cur.y);if(closed.has(ck))continue;closed.add(ck);if(cur.x===goal.x&&cur.y===goal.y){found=cur;break;}
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const x=cur.x+dx,y=cur.y+dy;if(x<0||y<0||x>=cols||y>=rows)continue;const wx=x*size+16,wy=y*size+16;if(collides(wx,wy))continue;const nk=key(x,y),ng=(cost.get(ck)||0)+Math.hypot(dx,dy);if(ng>=(cost.get(nk)??Infinity))continue;cost.set(nk,ng);came.set(nk,ck);open.push({x,y,f:ng+Math.hypot(goal.x-x,goal.y-y)});}
    }
    if(!found)return[];const cells=[];let k=key(goal.x,goal.y);while(k!==key(start.x,start.y)){const x=k%cols,y=Math.floor(k/cols);cells.push({x:x*size+16,y:y*size+16});k=came.get(k);if(k===undefined)return[];}cells.reverse();if(!collides(tx,ty))cells.push({x:tx,y:ty});return cells;
  }
  function setDestination(x,y,npc=null,exit=null){const path=findPath(player.x,player.y,x,y);player.pendingNpc=npc;player.pendingExit=exit;player.path=path;player.target=path.shift()||null;if(!player.target){player.pendingNpc=null;player.pendingExit=null;}}
  function updatePlayer(dt,time){
    player.walking=false;if(state.mode!=='play')return;
    let dx=(keys.ArrowRight||keys.d?1:0)-(keys.ArrowLeft||keys.a?1:0),dy=(keys.ArrowDown||keys.s?1:0)-(keys.ArrowUp||keys.w?1:0);
    if(dx||dy){player.target=null;player.path=[];player.pendingNpc=null;player.pendingExit=null;const n=Math.hypot(dx,dy);dx/=n;dy/=n;}else if(player.target){const tx=player.target.x-player.x,ty=player.target.y-player.y,d=Math.hypot(tx,ty);if(d<7){if(player.path&&player.path.length){player.target=player.path.shift();return;}player.target=null;if(player.pendingNpc){const id=player.pendingNpc;player.pendingNpc=null;interactNpc(id);}else if(player.pendingExit){const ex=player.pendingExit;player.pendingExit=null;tryExit(ex);}}else{dx=tx/d;dy=ty/d;}}
    if(dx||dy){const speed=220,step=Math.min(dt,40)/1000*speed;let nx=player.x+dx*step,ny=player.y+dy*step;if(!collides(nx,player.y))player.x=nx;if(!collides(player.x,ny))player.y=ny;player.dir=dx<-.05?'left':dx>.05?'right':player.dir;player.walking=true;}
  }
  function drawExit(ex,time){
    const open=exitAvailable(ex),pulse=(Math.sin(time*.004)+1)/2;ctx.save();ctx.translate(ex.x,ex.y);ctx.globalAlpha=open?1:.55;ctx.strokeStyle=open?'#e9d28f':'#6e7d70';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-20,25+pulse*3,Math.PI,0);ctx.lineTo(25+pulse*3,20);ctx.moveTo(-25-pulse*3,-20);ctx.lineTo(-25-pulse*3,20);ctx.stroke();ctx.fillStyle=open?'#f1d384':'#8c9889';ctx.beginPath();ctx.moveTo(0,-37-pulse*4);ctx.lineTo(7,-27-pulse*4);ctx.lineTo(-7,-27-pulse*4);ctx.closePath();ctx.fill();ctx.font='13px "Noto Serif CJK SC","Songti SC",serif';const w=Math.min(210,ctx.measureText(ex.label).width+26);ctx.fillStyle=open?'#173c34dc':'#394b43bb';ctx.fillRect(-w/2,28,w,28);ctx.fillStyle=open?'#f2e5c6':'#bdc3b2';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(ex.label,0,42,w-15);ctx.restore();
  }
  function render(time){
    const scene=!started?'title':state.scene;Art.drawScene(ctx,scene,time);
    if(started){
      const def=sceneDefs[state.scene];for(const ex of def.exits)drawExit(ex,time);
      const sprites=def.npcs.map(n=>({id:n[0],x:n[1],y:n[2]}));sprites.push({id:'yuanyang',x:player.x,y:player.y,player:true});sprites.sort((a,b)=>a.y-b.y);
      for(const s of sprites){const near=nearest&&nearest.type==='npc'&&nearest.data[0]===s.id;Art.drawCharacter(ctx,s.id,s.x,s.y,s.id==='baner'?.72:1,time,{walking:s.player&&player.walking,dir:s.player?player.dir:'right',selected:s.player,laugh:state.laughing&&!s.player});Art.drawName(ctx,s.id,s.x,s.y,near);}
    }
    nearest=nearestInteraction();const prompt=$('interact-prompt');if(nearest&&state.mode==='play'){prompt.classList.remove('hidden');prompt.style.left=nearest.x+'px';prompt.style.top=nearest.y+'px';prompt.querySelector('span').textContent=nearest.text;}else prompt.classList.add('hidden');
    if(dialogue&&state.mode==='dialogue'&&!dialogue.full){const line=dialogue.lines[dialogue.index],count=Math.min(line.text.length,Math.floor((time-dialogue.started)/24));if(count!==dialogue.shown){$('dialogue-text').textContent=line.text.slice(0,count);dialogue.shown=count;}if(count>=line.text.length)dialogue.full=true;}
  }
  function loop(time){const dt=time-lastTime;lastTime=time;updatePlayer(dt,time);render(time);requestAnimationFrame(loop);}requestAnimationFrame(loop);
  function canvasPoint(ev){const r=canvas.getBoundingClientRect();return{x:(ev.clientX-r.left)*1280/r.width,y:(ev.clientY-r.top)*720/r.height};}
  canvas.addEventListener('click',ev=>{
    if(state.mode!=='play')return;const p=canvasPoint(ev);
    for(const n of sceneDefs[state.scene].npcs){if(Math.hypot(p.x-n[1],p.y-(n[2]-55))<48){if(Math.hypot(player.x-n[1],player.y-(n[2]+20))<94)interactNpc(n[0]);else setDestination(n[1],n[2]+48,n[0]);return;}}
    for(const ex of sceneDefs[state.scene].exits){if(Math.abs(p.x-ex.x)<85&&Math.abs(p.y-ex.y)<70){if(Math.hypot(player.x-ex.x,player.y-ex.y)<100)tryExit(ex);else setDestination(ex.x,ex.y,null,ex);return;}}
    setDestination(p.x,p.y);
  });
  addEventListener('keydown',ev=>{
    const k=ev.key.length===1?ev.key.toLowerCase():ev.key;keys[k]=true;
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(ev.key))ev.preventDefault();
    if((ev.key===' '||ev.key==='Enter')&&state.mode==='dialogue'){advanceDialogue();return;}
    if((ev.key===' '||ev.key==='Enter')&&state.mode==='cards'&&cardState&&!cardState.choosing){nextCard();return;}
    if((k==='e'||ev.key===' ')&&state.mode==='play'){const n=nearestInteraction();if(n){if(n.type==='npc')interactNpc(n.data[0]);else tryExit(n.data);}return;}
    if(k==='m'&&state.mode==='play'){openMap();return;}
    if(ev.key==='Escape'){if(state.mode==='map')closeMap();else if(state.mode==='jump'){$('jump-overlay').classList.add('hidden');setMode(started?'play':'title');}else if(state.mode==='play')openMap();}
    if(state.mode==='choice'&&['1','2','3'].includes(k)){const b=$('choices').children[Number(k)-1];if(b)b.click();}
    if(state.mode==='cards'&&cardState&&cardState.choosing&&['1','2','3'].includes(k)){const b=$('card-choices').children[Number(k)-1];if(b)b.click();}
  });
  addEventListener('keyup',ev=>{keys[ev.key.length===1?ev.key.toLowerCase():ev.key]=false;});
  $('dialogue').addEventListener('click',ev=>{if(state.mode==='dialogue'&&!ev.target.closest('button'))advanceDialogue();});
  function openMap(){if(!started)return;previousMode=state.mode;setMode('map');renderMap();$('map-overlay').classList.remove('hidden');}
  function closeMap(){$('map-overlay').classList.add('hidden');setMode('play');}
  function renderMap(){
    $('map-objective').textContent='此刻要做：'+state.objective;
    $('map-route').innerHTML=order.map(s=>{const d=sceneDefs[s],available=state.unlocked.includes(s),current=state.scene===s,visited=state.visited.includes(s);return `<button class="map-node ${available?'available':''} ${current?'current':''}" data-scene="${s}" ${available?'':'disabled'}><span class="node-icon">${available?d.short:'·'}</span><strong>${d.name}</strong><small>${current?'你在这里':visited?'重游此地':available?'可以前往':'尚未开启'}</small></button>`;}).join('');
    $('map-route').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.scene===state.scene)closeMap();else goScene(b.dataset.scene,state.scene);}));
    $('choice-journal').innerHTML=state.journal.length?state.journal.map(j=>`<span class="journal-chip"><b>留签</b>${j.label}</span>`).join(''):'<span class="journal-chip">你的选择会在这里留下小签</span>';
  }
  const cardRounds=[
    {id:'jia',name:'贾母',tiles:[[6,6],[5,6],[6,1]],combined:'蓬头鬼',steps:[['左边是张“天”。','头上有青天。'],['当中是个“五与六”。','六桥梅花香彻骨。'],['剩得一张“六与幺”。','一轮红日出云霄。'],['凑成便是个“蓬头鬼”。','这鬼抱住锺馗腿。']]},
    {id:'xiang',name:'史湘云',tiles:[[1,1],[1,1],[1,4]],combined:'樱桃九熟',steps:[['左边“长幺”两点明。','双悬日月照乾坤。'],['右边“长幺”两点明。','闲花落地听无声。'],['中间还得“幺四”来。','日边红杏倚云栽。'],['凑成“樱桃九熟”。','御园却被鸟衔出。']]},
    {id:'dai',name:'黛玉',tiles:[[6,6],[4,6],[2,6]],combined:'篮子好采花',steps:[['左边一个“天”。','良辰美景奈何天。'],['中间“锦屏”颜色俏。','纱窗也没有红娘报。'],['剩了“二六”八点齐。','双瞻玉座引朝仪。'],['凑成“篮子”好采花。','仙杖香挑芍药花。']]},
    {id:'ying',name:'迎春',tiles:[[4,5],[3,4],[1,4]],combined:'该罚一杯',penalty:true,steps:[['左边“四五”成花九。','桃花带雨浓。']]},
    {id:'liu',name:'刘姥姥',tiles:[[4,4],[3,4],[1,4]],combined:'一枝花',steps:[['左边“四四”是个人。','是个庄家人罢。'],['中间“三四”绿配红。','大火烧了毛毛虫。'],['右边“幺四”真好看。','一个萝卜一头蒜。'],['凑成便是一枝花。','花儿落了结个大倭瓜。']]}
  ];
  function startCards(pos=0){
    state.flags.cardsStarted=true;setMode('cards');$('cards-overlay').classList.remove('hidden');$('interact-prompt').classList.add('hidden');
    cardState={round:0,step:0,choosing:false,complete:false};
    if(pos==='liuChoice'){cardState.round=4;showLiuChoice();}else renderCard();
  }
  function currentLiuSteps(){if(state.flags.card==='substitute')return [['左边“四四”是个人。','人间百姓家。'],['中间“三四”绿配红。','绿柳映红霞。'],['右边“幺四”真好看。','萝卜配新瓜。'],['凑成便是一枝花。','秋实满田家。']];return cardRounds[4].steps;}
  function renderCard(){
    if(!cardState)return;cardState.choosing=false;$('card-choices').classList.add('hidden');$('card-next').classList.remove('hidden');
    const round=cardRounds[cardState.round],isLiu=round.id==='liu',steps=isLiu?currentLiuSteps():round.steps;
    $('card-round').textContent=`第${['一','二','三','四','五'][cardState.round]}副 · ${round.name}`;
    $('card-progress').innerHTML=cardRounds.map((r,i)=>`<i class="card-pip ${i<=cardState.round?'done':''}"></i>`).join('');
    Art.drawDominoes($('domino-canvas').getContext('2d'),round.tiles,cardState.step,round.combined);
    if(cardState.step===-1){$('card-speaker').textContent='鸳鸯';$('card-text').textContent='姥姥莫急。我先把三张牌拆开，讲明怎样叶韵；你想好了再说，没人催你。';$('card-next').innerHTML='请姥姥慢慢对 <b>›</b>';return;}
    const step=steps[cardState.step];$('card-speaker').textContent=isLiu&&state.flags.card==='substitute'?`鸳鸯 代 ${round.name}`:`鸳鸯 → ${round.name}`;$('card-text').textContent=`“${step[0]}”　${round.name}道：“${step[1]}”`;
    if(round.penalty){$('card-text').textContent+='　众人道：“错了韵，而且又不象，该罚！”迎春笑着饮了一口。';}
    if(cardState.step===3){$('card-text').textContent+=round.id==='jia'?'　众人笑说：“极妙。”':'　众人称赏，饮了一钟。';}
    $('card-next').innerHTML=cardState.step===steps.length-1?(cardState.round===4?'收令 · 看结局':'宣下一副'):(cardState.step===2?'凑成一副':'宣下一张')+' <b>›</b>';
  }
  function showLiuChoice(){
    cardState.choosing=true;cardState.step=0;Art.drawDominoes($('domino-canvas').getContext('2d'),cardRounds[4].tiles,0,'一枝花');$('card-round').textContent='第五副 · 轮到刘姥姥';$('card-speaker').textContent='你的分寸';$('card-text').textContent='刘姥姥道：“我们庄家人的本色，众位别笑。”你怎样宣这最后一副？';$('card-next').classList.add('hidden');
    const ops=[
      ['由她依庄家的本色说','原著走向：不代说，让她自己想、自己答。','nature'],
      ['先讲清牌面与叶韵，容她慢慢对','非原著走向：仍由她说本色话，但不催她凑趣。','slow'],
      ['以令官身份代她宣句，免她为难','非原著走向：保留牌令，不再让她成为席间笑话。','substitute']
    ];const box=$('card-choices');box.innerHTML='';box.classList.remove('hidden');ops.forEach((o,i)=>{const b=document.createElement('button');b.className='choice-button';b.innerHTML=`<span class="num">${['一','二','三'][i]}</span>${o[0]}<small>${o[1]}</small>`;b.onclick=()=>{state.flags.card=o[2];record('card',o[2]==='nature'?'牙牌令 · 本色相和':o[2]==='slow'?'牙牌令 · 容她慢对':'牙牌令 · 令官代宣');cardState.step=o[2]==='slow'?-1:0;renderCard();};box.appendChild(b);});
  }
  function nextCard(){
    if(!cardState||cardState.choosing)return;
    const round=cardRounds[cardState.round],steps=round.id==='liu'?currentLiuSteps():round.steps;
    if(cardState.step===-1){cardState.step=0;renderCard();return;}
    if(cardState.step<steps.length-1){cardState.step++;renderCard();return;}
    if(cardState.round<4){cardState.round++;cardState.step=0;if(cardState.round===4)showLiuChoice();else renderCard();return;}
    $('cards-overlay').classList.add('hidden');cardState=null;showEnding();
  }
  $('card-next').addEventListener('click',nextCard);
  function ledger(){
    const f=state.flags;return [
      ['霞影纱',f.gauze==='gift'?'赠刘亲家两匹':'只记换窗'],
      ['早饭玩笑',f.prank==='briefed'?'事前言明':f.prank==='secret'?'未曾言明':'婉言劝止'],
      ['席上之箸',f.chopsticks==='ivory'?'象牙镶金':f.chopsticks==='own'?'由她自拣':'乌木镶银'],
      ['蘅芜陈设',f.heng==='three'?'三样古器':f.heng==='ask'?'先问心意':'只换帐子'],
      ['最后一令',f.card==='nature'?'庄家本色':f.card==='slow'?'容她慢对':'令官代宣']
    ];
  }
  function showEnding(){
    const data=Story.endingData();hideAll();setMode('ending');$('ending-screen').classList.remove('hidden');$('ending-kicker').textContent=data.kicker;$('ending-title').textContent=data.title;$('ending-quote').textContent=data.quote;$('ending-body').innerHTML=data.body.map(p=>`<p>${p}</p>`).join('');$('ending-ledger').innerHTML=ledger().map(x=>`<span class="ledger-item"><b>${x[0]}</b>${x[1]}</span>`).join('');started=true;state.laughing=data.id==='canon';
  }
  function openJumps(){previousMode=state.mode;setMode('jump');$('jump-overlay').classList.remove('hidden');}
  const jumps=[['c1','选择一 · 霞影纱去留'],['c2','选择二 · 是否设局'],['c3','选择三 · 席上之箸'],['c4','选择四 · 蘅芜陈设'],['c5','选择五 · 最后一令'],['e1','结局 · 花落结瓜'],['e2','结局 · 欢宴有度'],['e3','结局 · 笑里一根刺']];
  $('jump-list').innerHTML=jumps.map(j=>`<button class="jump-item ${j[0][0]==='e'?'ending':''}" data-jump="${j[0]}"><b>#jump=${j[0]}</b><span>${j[1]}</span></button>`).join('');
  $('jump-list').querySelectorAll('button').forEach(b=>b.onclick=()=>applyJump(b.dataset.jump));
  function prepareJump(scene){
    reset();started=true;hideAll();$('hud').classList.remove('hidden');$('control-hint').classList.remove('hidden');const upto=order.indexOf(scene);state.unlocked=order.slice(0,upto+1);state.visited=order.slice(0,upto+1);state.flags.qinMet=true;state.flags.slip=true;state.flags.gauze='gift';state.flags.prank='briefed';state.flags.chopsticks='ivory';state.flags.banquet=true;state.flags.lotus=true;state.flags.heng='three';state.journal=[{key:'gauze',label:'霞影纱 · 赠两匹'},{key:'prank',label:'席间玩笑 · 事前言明'},{key:'chopsticks',label:'席上之箸 · 象牙镶金'},{key:'heng',label:'蘅芜陈设 · 三样古器'}];goScene(scene,scene,true);
  }
  function applyJump(id){
    history.replaceState(null,'',location.pathname+location.search+'#jump='+id);
    if(id==='c1'){prepareJump('xiaoxiang');setObjective('决定软烟罗的去留');Story.choiceGauze();return;}
    if(id==='c2'){prepareJump('qiushuang');state.flags.prank=null;state.flags.chopsticks=null;state.flags.banquet=false;state.journal=state.journal.filter(j=>j.key==='gauze');setObjective('决定是否凑成这场玩笑');Story.choicePrank();return;}
    if(id==='c3'){prepareJump('qiushuang');state.flags.banquet=false;setObjective('替刘姥姥拣一双箸');Story.choiceChopsticks();return;}
    if(id==='c4'){prepareJump('hengyuan');setObjective('决定如何收拾宝钗的屋子');Story.choiceHeng();return;}
    if(id==='c5'){prepareJump('zhuijin');state.flags.card=null;setObjective('宣最后一副牙牌');startCards('liuChoice');return;}
    if(id==='e1'){prepareJump('zhuijin');state.flags.card='nature';showEnding();return;}
    if(id==='e2'){prepareJump('zhuijin');state.flags.gauze='silent';state.flags.prank='refused';state.flags.chopsticks='ebony';state.flags.heng='ask';state.flags.card='slow';showEnding();return;}
    if(id==='e3'){prepareJump('zhuijin');state.flags.prank='secret';state.flags.card='nature';showEnding();}
  }
  $('start-button').onclick=startNew;$('intro-button').onclick=enterGarden;$('jump-button').onclick=openJumps;$('map-button').onclick=openMap;$('pause-button').onclick=showTitle;$('restart-button').onclick=startNew;$('ending-title-button').onclick=showTitle;
  document.querySelector('[data-close="map"]').onclick=closeMap;document.querySelector('[data-close="jump"]').onclick=()=>{$('jump-overlay').classList.add('hidden');setMode(started?'play':'title');};
  document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click',ev=>{if(ev.target===m){if(m.id==='map-overlay')closeMap();else{m.classList.add('hidden');setMode(started?'play':'title');}}}));
  window.Game={state,say,choice,toast,setObjective,unlock,record,goScene,startCards,showEnding,applyJump};
  const hash=location.hash.match(/^#jump=(c[1-5]|e[1-3])$/);if(hash)applyJump(hash[1]);else showTitle();
  addEventListener('hashchange',()=>{const match=location.hash.match(/^#jump=(c[1-5]|e[1-3])$/);if(match)applyJump(match[1]);});
})();
