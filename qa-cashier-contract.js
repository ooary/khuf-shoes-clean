const fs = require('node:fs');
const assert = require('node:assert/strict');

const cms = fs.readFileSync('cms.html', 'utf8');
const pos = fs.readFileSync('pos.html', 'utf8');
const cashier = fs.existsSync('kasir.html') ? fs.readFileSync('kasir.html', 'utf8') : '';
const cashierJs = fs.existsSync('kasir.js') ? fs.readFileSync('kasir.js', 'utf8') : '';
const cashierSurface = `${cashier}\n${cashierJs}`;
const core = fs.existsSync('cashier-core.js') ? require('./cashier-core.js') : null;

assert(cms.includes('Dashboard Sales'), 'CMS sidebar must say Dashboard Sales');
assert(cms.includes('Dashboard Content'), 'CMS sidebar must say Dashboard Content');
assert(pos.includes('Dashboard Sales'), 'POS sidebar must say Dashboard Sales');
assert(pos.includes('Dashboard Content'), 'POS sidebar must say Dashboard Content');
assert(cms.includes('href="kasir.html"'), 'CMS sidebar must link to cashier page');
assert(pos.includes('href="kasir.html"'), 'POS sidebar must link to cashier page');

for (const id of ['customerSearch','customerName','customerPhone','customerAddress','itemsList','addItemButton','paymentStatus','paymentMethod','amountPaid','orderTotal','amountDue','createOrderButton','downloadReceiptButton']) {
  assert(cashier.includes(`id="${id}"`), `cashier page missing #${id}`);
}
assert(cashierSurface.includes('multiple'), 'cashier photos input must support multiple files');
assert(cashier.includes('vendor-jspdf.2.5.1.min.js'), 'cashier must load the local PDF library');
assert(cashierJs.includes("assets/khuf-logo.png"), 'receipt must load the real Khuf logo asset');
assert(cashierJs.includes('addImage'), 'receipt PDF must embed the Khuf logo image');
assert(core, 'cashier core module missing');

assert.equal(core.calculateLineTotal(45000, 3), 135000);
assert.equal(core.calculateOrderTotal([{price:45000,quantity:2},{price:75000,quantity:1}]), 165000);
assert.deepEqual(core.calculatePayment(165000, 0), {status:'BELUM LUNAS', paid:0, due:165000});
assert.deepEqual(core.calculatePayment(165000, 50000), {status:'DP', paid:50000, due:115000});
assert.deepEqual(core.calculatePayment(165000, 200000), {status:'LUNAS', paid:165000, due:0});
assert.equal(core.findCustomers('dimas').length, 1);
assert.equal(core.findCustomers('0812').length, 1);
assert.deepEqual(core.getJourneyState(false, false, true), {currentStep:1, done:[false,false,false]});
assert.deepEqual(core.getJourneyState(true, false, true), {currentStep:2, done:[true,false,false]});
assert.deepEqual(core.getJourneyState(true, true, true), {currentStep:4, done:[true,true,true]});
console.log('Cashier contract passed');
