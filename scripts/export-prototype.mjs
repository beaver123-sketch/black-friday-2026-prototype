import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const outputDir=path.resolve('黑五活动-中文原型图');
await fs.mkdir(outputDir,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:430,height:932},deviceScaleFactor:2,isMobile:true,hasTouch:true});
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.goto(pathToFileURL(path.resolve('index.html')).href,{waitUntil:'load'});
await page.addStyleTag({content:'#prototype-tools,.review-toolbar{display:none!important}html,body{width:430px!important;max-width:430px!important;overflow-x:hidden!important}#app{margin:0!important;box-shadow:none!important}*{scroll-behavior:auto!important}'});
await page.evaluate(async()=>{setLanguage('zh');setTab('promotion');await document.fonts.ready;});
await page.waitForTimeout(300);

async function state(fn){await page.evaluate(fn);await page.waitForTimeout(180);await page.evaluate(()=>window.scrollTo(0,0));}
async function shot(filename,fullPage=false){
 await page.screenshot({path:path.join(outputDir,filename),fullPage,animations:'disabled'});
 console.log('Saved',filename);
}
await shot('01-促销页面-完整.png',true);
await shot('02-促销页面-首屏.png');
await page.evaluate(()=>openRules());
await shot('03-促销活动规则弹窗.png');
await page.evaluate(()=>closeSheet());

await state(()=>{setTab('ranking');setDemoStage('live');setDemoUser('5');setRankingRegion('all');});
await shot('04-充值榜-完整页面.png',true);
await shot('05-充值榜-已上榜第5名.png');
await state(()=>{setDemoUser('11')});
await shot('06-充值榜-未上榜.png');
await state(()=>{setDemoUser('1')});
await shot('07-充值榜-第1名.png');
await page.evaluate(()=>toggleRankingRegions());
await shot('08-充值榜-地区筛选下拉.png');
await page.evaluate(()=>closeRankingRegions());
await page.evaluate(()=>openRules());
await shot('09-充值榜-活动规则弹窗.png');
await page.evaluate(()=>closeSheet());
await state(()=>{setDemoStage('pending');setDemoUser('5');});
await shot('10-充值榜-结算中.png');
await state(()=>{setDemoStage('final');setDemoUser('5');});
await shot('11-充值榜-最终排名待领取.png');
await page.evaluate(()=>claimReward(5));
await page.evaluate(()=>closeSheet());
await page.evaluate(()=>window.scrollTo(0,0));
await shot('12-充值榜-奖励已领取.png');
await fs.writeFile(path.join(outputDir,'原型图说明.txt'),
'2026 POPPO Live 黑五活动 · 中文原型图\n\n截图来自仓库 index.html 当前交互原型。\n01-03：促销页面及规则弹窗。\n04-09：充值榜完整页、本人排名状态、地区选择、规则弹窗。\n10-12：榜单结算及领奖状态。\n\n截图中的金币、地区榜单和领奖记录均为原型演示数据，非真实业务数据。\n活动时间：2026年11月25日00:00:00至2026年12月2日00:00:00（结束时刻不包含），共168小时。\n',{encoding:'utf8'});
await browser.close();
if(errors.length) {
 console.error('Browser errors:',errors.slice(0,10));
 process.exitCode=1;
}
