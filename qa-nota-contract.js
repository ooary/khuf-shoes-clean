const fs = require('node:fs');
const assert = require('node:assert/strict');
const core = require('./cashier-core.js');

const html = fs.existsSync('nota.html') ? fs.readFileSync('nota.html','utf8') : '';
const js = fs.existsSync('nota.js') ? fs.readFileSync('nota.js','utf8') : '';
const nginx = fs.readFileSync('nginx.conf','utf8');
const cashierJs = fs.readFileSync('kasir.js','utf8');

for (const text of ['noindex, nofollow','KHUF-260731-006','Dimas S.','0812••••8821','Nike Air Force 1','Coach Tote Bag','Rp 190.000','Rp 100.000','Rp 90.000','DP']) {
  assert(html.includes(text), `nota missing ${text}`);
}
for (const forbidden of ['0812-4432-8821','081244328821','Pejaten Barat, Jakarta Selatan','Status Pengerjaan','Dalam Proses','Siap Diambil','Mockup nota digital','contoh statis','backend Go + SQLite']) {
  assert(!`${html}\n${js}`.includes(forbidden), `public nota leaks or includes forbidden content: ${forbidden}`);
}
assert(html.includes('id="downloadNotaButton"'), 'nota needs optional PDF/print action');
assert(html.includes('id="contactWhatsappButton"'), 'nota needs WhatsApp support action');
assert(nginx.includes('location ~ ^/nota/'), 'nginx must route unique nota URLs');
assert(nginx.includes('X-Robots-Tag'), 'nota route must send noindex header');
assert.equal(core.maskPhone('0812-4432-8821'),'0812••••8821');
assert.equal(core.maskPhone('08117128844'),'0811•••8844');
assert(cashierJs.includes('/nota/khf_7M2pQ9xR4vN8'), 'cashier WhatsApp must include nota URL');
const cashierHtml = fs.readFileSync('kasir.html','utf8');
assert(cashierHtml.includes('id="viewNotaButton"'), 'POS success state must link to the web nota');
assert(cashierJs.includes('viewNotaButton.href=notaUrl'), 'POS journey must populate the nota action');
assert(cashierJs.includes('maskPhone'), 'cashier PDF must mask customer phone');
console.log('Nota contract passed');
