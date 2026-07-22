const { chromium } = require('playwright-core');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 for(const url of ['http://127.0.0.1:4320/','https://shoes-dev.arypratama.com/']){
  const page=await browser.newPage({viewport:{width:1440,height:1000},ignoreHTTPSErrors:true});
  const errors=[]; const failed=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('requestfailed',r=>failed.push(`${r.url()} ${r.failure()?.errorText}`));
  await page.goto(url,{waitUntil:'networkidle',timeout:60000});
  await page.waitForTimeout(1500);
  const script=await page.locator('script[src*="app"]').getAttribute('src');
  const cards=await page.locator('.google-review-card').count();
  console.log(JSON.stringify({url,title:await page.title(),script,cards,errors,failed}));
  await page.close();
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
