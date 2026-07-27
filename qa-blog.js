const { chromium } = require('playwright-core');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[], failed=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('requestfailed',r=>failed.push(r.url()));
 for(const f of ['index.html','layanan.html','lokasi.html','kontak.html','promo.html','pricelist.html','blog.html','blog-detail.html']){
   await page.goto('http://127.0.0.1:4319/'+f,{waitUntil:'networkidle'});
   const count=await page.locator('header a[href="blog.html"]').count(); if(count!==2) throw Error(`${f} blog nav count=${count}`);
   if(await page.locator('header img[src="assets/khuf-logo-home-v2.png"]').count()!==1) throw Error(`${f} logo`);
 }
 await page.goto('http://127.0.0.1:4319/blog.html',{waitUntil:'networkidle'});
 if(await page.locator('#articleGrid article').count()!==6) throw Error('blog cards');
 if(await page.locator('#articleGrid article img').evaluateAll(imgs=>imgs.some(i=>!i.complete||!i.naturalWidth))) throw Error('blog images');
 await page.locator('#articleGrid article').first().locator('a').first().click();
 await page.waitForURL('**/blog-detail.html');
 if(!await page.locator('article.article-prose h2').count() || await page.locator('section .related-card').count()!==3) throw Error('detail structure');
 if(await page.locator('article.article-prose img').evaluateAll(imgs=>imgs.some(i=>!i.complete||!i.naturalWidth))) throw Error('detail images');
 await page.goto('http://127.0.0.1:4319/blog.html',{waitUntil:'networkidle'});
 await page.fill('#searchInput','unyellowing'); await page.click('#blogSearch button');
 if(await page.locator('#articleGrid article:visible').count()!==1) throw Error('search filter');
 await page.fill('#searchInput','tidak ditemukan'); await page.click('#blogSearch button');
 if(await page.locator('#emptyState:not(.hidden)').count()!==1) throw Error('empty search');
 for(const f of ['blog.html','blog-detail.html']){
   await page.setViewportSize({width:390,height:844}); await page.goto('http://127.0.0.1:4319/'+f,{waitUntil:'networkidle'});
   if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)) throw Error(`${f} mobile overflow`);
   await page.click('#menuBtn'); if(await page.locator('#mobileMenu').evaluate(e=>e.classList.contains('hidden'))) throw Error(`${f} mobile menu`);
 }
 await page.setViewportSize({width:1440,height:1000}); await page.goto('http://127.0.0.1:4319/blog.html',{waitUntil:'networkidle'}); await page.screenshot({path:'blog-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844}); await page.goto('http://127.0.0.1:4319/blog-detail.html',{waitUntil:'networkidle'}); await page.screenshot({path:'blog-detail-mobile.png',fullPage:true});
 if(errors.length||failed.length) throw Error(JSON.stringify({errors,failed}));
 console.log('BLOG QA PASS: nav=8 pages cards=6 detail-click search mobile overflow=false images=loaded'); await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
