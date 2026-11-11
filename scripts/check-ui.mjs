import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.INTSOMI_NODE_MODULES+'/playwright');
const browser=await chromium.launch({headless:true,channel:"msedge"});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
page.on('pageerror',e=>console.error('PAGE ERROR:',e.message));
await page.goto('http://127.0.0.1:4176');
await page.waitForSelector('[data-action="open-maqoma"]');
await page.locator('[data-action="open-maqoma"]').click();
await page.waitForFunction(()=>document.querySelector('.project-mini strong')?.textContent.includes('uMaqoma'),{timeout:30000});
console.log('DEMO OPENED');
for(const view of ['story','bible','assets','stewardship','storyboard','animatic','comic','languages','preview']){await page.locator('nav [data-view="'+view+'"]').click();console.log(view,await page.locator('h1').first().textContent());}
await page.screenshot({path:'../../work/reader.png',fullPage:true});
await page.locator('nav [data-view="comic"]').click();
await page.screenshot({path:'../../work/composer.png'});
await browser.close();

