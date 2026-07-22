const { chromium } = require('playwright-core');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 for(const f of ['index.html','layanan.html','lokasi.html','kontak.html']){
  await page.goto('http://127.0.0.1:4319/'+f,{waitUntil:'networkidle'});
  if(!(await page.locator('header').count())||!(await page.locator('main').count())) throw Error(f+' structure');
  if(!(await page.locator('svg.lucide').count())) throw Error(f+' lucide');
  console.log(f,'title=',await page.title(),'icons=',await page.locator('svg.lucide').count());
 }
 await page.setViewportSize({width:390,height:844});
 await page.goto('http://127.0.0.1:4319/index.html',{waitUntil:'networkidle'});
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth);
 if(overflow) throw Error('mobile overflow');
 await page.click('#menuBtn');
 if(await page.locator('#mobileMenu').evaluate(e=>e.classList.contains('hidden'))) throw Error('menu did not open');
 await page.click('#menuBtn');
 if(!(await page.locator('#mobileMenu').evaluate(e=>e.classList.contains('hidden')))) throw Error('menu did not close');
 await page.screenshot({path:'khuf-mobile.png',fullPage:true});
 await page.setViewportSize({width:1440,height:1000});
 await page.goto('http://127.0.0.1:4319/index.html',{waitUntil:'networkidle'});
 await page.screenshot({path:'khuf-desktop.png',fullPage:true});
 await page.goto('http://127.0.0.1:4319/kontak.html',{waitUntil:'networkidle'});
 await page.fill('[name=name]','Ary'); await page.selectOption('[name=service]','Cleaning'); await page.fill('[name=item]','Sneakers suede');
 const valid=await page.$eval('#contactForm',f=>f.checkValidity()); if(!valid) throw Error('form invalid');
 const href=await page.evaluate(()=>{const f=document.querySelector('#contactForm'),d=new FormData(f);return `https://wa.me/628991971197?text=${encodeURIComponent(`Halo Khuf, saya ${d.get('name')}. Saya ingin konsultasi ${d.get('service')} untuk ${d.get('item')}. Catatan: ${d.get('message')||'-'}`)}`});
 if(!href.includes('628991971197')||!decodeURIComponent(href).includes('Sneakers suede'))throw Error('WA construction');
 await page.goto('http://127.0.0.1:4319/index.html',{waitUntil:'networkidle'});
 const bg=await page.$eval('.hero-bg',e=>getComputedStyle(e).backgroundImage); if(!bg.includes('google-2.jpg')) throw Error('hero background missing');
 const reviewCount=await page.locator('.google-review-card').count(); if(reviewCount!==6) throw Error('review cards '+reviewCount);
 const names=await page.locator('.google-review-card h3').allTextContents(); if(!names.includes('Sausan Aulia')||!names.includes('Shaninca Divana')) throw Error('real reviewer names missing');
 const controls=await page.locator('#reviewPrev,#reviewNext').count(); if(controls!==0) throw Error('carousel controls still visible');
 const before=await page.$eval('#reviewTrack',e=>e.scrollLeft); await page.waitForTimeout(4700); const after=await page.$eval('#reviewTrack',e=>e.scrollLeft); if(after<=before) throw Error('carousel autoplay failed');
 const sourceLinks=await page.locator('.google-review-card a[href*="google.com/maps"]').count(); if(sourceLinks!==6) throw Error('review source links');
 if(errors.length)throw Error(errors.join('; '));
 console.log('QA PASS mobile-menu overflow=false form-valid hero-background carousel-real-reviews source-links');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
