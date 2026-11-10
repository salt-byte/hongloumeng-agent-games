const {pathToFileURL}=require('node:url');
const path=require('node:path');
const base=pathToFileURL(path.resolve(__dirname,'../index.html')).href;
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:1280,height:720}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const status=()=>page.evaluate(()=>gameStatus());
 async function nextAll(){for(let i=0;i<40;i++){const s=await status();if(!s.dialogue||s.dialogue.choices.length)return s;await page.locator('#answers button').click()}throw Error('dialogue never finishes')}
 async function talk(x,y){await page.mouse.click(x,y-45);await page.waitForFunction(()=>!!gameStatus().dialogue,{},{timeout:10000})}
 async function choose(n){await page.locator('#answers button').nth(n).click();await nextAll()}
 async function goGate(expected){await page.mouse.click(1150,586);await page.waitForFunction(s=>gameStatus().scene===s,expected,{timeout:10000})}
 await page.goto(base);await page.click('#start');await page.click('#intro-go');
 // Verify keyboard movement and optional examination.
 let before=(await status()).player.x;await page.keyboard.down('d');await page.waitForTimeout(400);await page.keyboard.up('d');assert((await status()).player.x>before+40);
 await talk(600,433);await nextAll();await talk(850,481);await choose(0);assert.equal((await status()).state.flowers,'crown');
 await goGate('xiao');await talk(346,485);await choose(0);await talk(688,448);await nextAll();await talk(944,492);await nextAll();assert((await status()).state.silk);
 await goGate('qiu');await talk(455,471);await nextAll();await choose(0);await talk(455,471);await choose(0);
 await goGate('heng');await talk(595,439);await nextAll();await talk(913,484);await nextAll();
 await goGate('zhui');await talk(796,466);await nextAll();await choose(0);assert.equal((await status()).state.ending,'original');await page.screenshot({path:path.join(__dirname,'ending.png')});
 await page.click('#ending-journal');assert(await page.locator('.journal-entry').count()>=8);await page.click('.close');await page.click('#restart');assert.equal((await status()).mode,'title');
 for(const id of ['c1','c2','c3','c4','c5']){await page.goto(base+'#jump='+id);let s=await status();assert.equal(s.dialogue.choices.length,2,id);await choose(1);s=await status();assert(!s.dialogue,id+' alternate complete');console.log(id,'alternate verified')}
 for(const id of ['end-original','end-measured','end-quiet']){await page.goto(base+'#jump='+id);assert.equal((await status()).mode,'ending');assert(await page.locator('#ending-title').isVisible());console.log(id,'verified')}
 // Mixed route must derive the second ending through the actual final dialogue.
 await page.goto(base+'#jump=c4');await choose(1);await page.click('#map-button');await page.locator('[data-scene="heng"]').click();await talk(913,484);await nextAll();await page.click('#map-button');await page.locator('[data-scene="zhui"]').click();await talk(796,466);await nextAll();await choose(0);assert.equal((await status()).state.ending,'measured');
 assert.deepEqual(errors,[]);console.log('PASS: full original playthrough, five alternate choices, three endings, map travel, keyboard movement, journal and restart. No browser errors.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
