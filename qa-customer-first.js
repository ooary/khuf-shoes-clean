const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'khuf-cdp-'));
const chrome = spawn('/usr/bin/chromium', [
  '--headless','--no-sandbox','--disable-gpu','--hide-scrollbars',
  '--remote-debugging-port=9224',`--user-data-dir=${profile}`,'--window-size=390,844','about:blank'
], { stdio:'ignore' });
let ws, seq=0, pending=new Map();
const wait = ms => new Promise(r=>setTimeout(r,ms));
async function endpoint(){for(let i=0;i<50;i++){try{const tabs=await fetch('http://127.0.0.1:9224/json');return (await tabs.json())[0].webSocketDebuggerUrl}catch{}await wait(100)}throw new Error('CDP unavailable')}
function send(method,params={}){return new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))})}
async function evaluate(expression){const res=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(res.result.exceptionDetails)throw new Error(res.result.exceptionDetails.text);return res.result.result.value}
async function screenshot(file){const res=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(file,Buffer.from(res.result.data,'base64'))}
(async()=>{
 try{
  ws=new WebSocket(await endpoint()); await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j});
  ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){pending.get(m.id).resolve(m);pending.delete(m.id)}};
  await send('Page.enable'); await send('Runtime.enable'); await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await send('Page.navigate',{url:'http://127.0.0.1:4173/kasir.html?cdp=customer-first'}); await wait(4000);
  const initial=await evaluate(`(()=>({customerVisible:!customerStep.classList.contains('hidden'),catalogHidden:catalogStep.classList.contains('hidden'),cartHidden:mobileCartButton.classList.contains('hidden'),continueDisabled:continueToCatalogButton.disabled,fileInputs:document.querySelectorAll('input[type=file]').length,detailPhotos:document.querySelectorAll('.detail-photos').length,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth}))()`);
  assert.deepEqual(initial,{customerVisible:true,catalogHidden:true,cartHidden:true,continueDisabled:true,fileInputs:1,detailPhotos:0,overflow:false});
  const catalog=await evaluate(`(()=>{const set=(el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}))};set(customerName,'Dimas Saputra');set(customerPhone,'081244328821');set(customerAddress,'Pejaten Barat');continueToCatalogButton.click();const cards=[...document.querySelectorAll('[data-catalog-id]')];const a=cards[0].getBoundingClientRect(),b=cards[1].getBoundingClientRect();return{catalogVisible:!catalogStep.classList.contains('hidden'),customerHidden:customerStep.classList.contains('hidden'),cartVisible:!mobileCartButton.classList.contains('hidden'),sameRow:Math.abs(a.top-b.top)<2,columns:getComputedStyle(serviceCatalog).gridTemplateColumns.split(' ').length,cards:cards.length,cardWidth:a.width,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth}})()`);
  assert.equal(catalog.catalogVisible,true);assert.equal(catalog.customerHidden,true);assert.equal(catalog.cartVisible,true);assert.equal(catalog.sameRow,true);assert.equal(catalog.columns,2);assert.equal(catalog.cards,8);assert.equal(catalog.overflow,false);
  await screenshot('/root/artifacts/khuf/khuf-catalog-two-column-mobile.png');
  const flow=await evaluate(`(()=>{const tap=id=>document.querySelector('[data-catalog-id="'+id+'"]').click();tap('shoe-deep-cleaning');tap('shoe-deep-cleaning');tap('bag-repair');checkoutButton.click();const set=(el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))};const rows=[...document.querySelectorAll('[data-checkout-id]')];set(rows[0].querySelector('.detail-name'),'Nike Air Force 1');set(rows[0].querySelector('.detail-notes'),'Noda sedang');set(rows[1].querySelector('.detail-name'),'Coach Tote Bag');set(rows[1].querySelector('.detail-notes'),'Handle longgar');const dt=new DataTransfer();dt.items.add(new File(['a'],'foto-order.jpg',{type:'image/jpeg'}));orderPhoto.files=dt.files;orderPhoto.dispatchEvent(new Event('change',{bubbles:true}));set(paymentStatus,'partial');set(paymentMethod,'QRIS');set(amountPaid,'100000');const ready=!createOrderButton.disabled;cashierForm.requestSubmit();const order=KhufCashier.getLatestOrder();const pdf=KhufCashier.generateReceiptPdf(order);const buf=pdf.output('arraybuffer');return{items:order.items.map(x=>({name:x.name,quantity:x.quantity,notes:x.notes})),orderPhotoCount:order.orderPhotoCount,total:order.total,paid:order.payment.paid,due:order.payment.due,status:order.payment.status,ready,success:!orderSuccess.classList.contains('hidden'),fileInputs:document.querySelectorAll('input[type=file]').length,pdf:{magic:String.fromCharCode(...new Uint8Array(buf).slice(0,5)),pages:pdf.getNumberOfPages(),images:Object.keys(pdf.internal.collections.addImage_images||{}).length}}})()`);
  assert.equal(flow.orderPhotoCount,1);assert.equal(flow.fileInputs,1);assert.equal(flow.total,190000);assert.equal(flow.paid,100000);assert.equal(flow.due,90000);assert.equal(flow.status,'DP');assert.equal(flow.ready,true);assert.equal(flow.success,true);assert.equal(flow.pdf.magic,'%PDF-');assert.equal(flow.pdf.pages,1);assert.equal(flow.pdf.images,1);
  console.log(JSON.stringify({initial,catalog,flow},null,2)); console.log('Customer-first mobile contract passed');
 } finally { try{ws?.close()}catch{} chrome.kill('SIGKILL'); await wait(300); try{fs.rmSync(profile,{recursive:true,force:true,maxRetries:3,retryDelay:100})}catch{} }
})().catch(err=>{console.error(err);process.exitCode=1});
