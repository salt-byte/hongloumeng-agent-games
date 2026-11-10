const {pathToFileURL}=require('node:url');
const path=require('node:path');
const base=pathToFileURL(path.resolve(__dirname,'../index.html')).href;
const { chromium }=require('playwright');
(async()=>{const browser=await chromium.launch({headless:true,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:1280,height:720}});let errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.screenshot({path:path.join(__dirname,'title.png')});await page.click('#start');await page.click('#intro-go');await page.screenshot({path:path.join(__dirname,'garden.png')});await page.goto(base+'#jump=c3');await page.screenshot({path:path.join(__dirname,'choice.png')});console.log(await page.evaluate(()=>gameStatus()));console.log('errors',errors);await browser.close()})();
