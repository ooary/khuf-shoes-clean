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

for (const id of ['serviceSearch','serviceCatalog','cartItems','cartCount','customerSearch','customerName','customerPhone','customerAddress','paymentStatus','paymentMethod','amountPaid','orderTotal','amountDue','createOrderButton','downloadReceiptButton','mobileCartButton']) {
  assert(cashier.includes(`id="${id}"`), `cashier page missing #${id}`);
}
assert(!cashierSurface.includes('item-category'), 'cashier must not use category dropdowns');
assert(!cashierSurface.includes('item-service'), 'cashier must not use service dropdowns');
assert(cashierSurface.includes('data-catalog-id'), 'service cards must be add-to-cart controls');
assert(cashierSurface.includes('cart-increase'), 'cart must support quantity increase');
assert(cashierSurface.includes('cart-decrease'), 'cart must support quantity decrease');
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
assert(core.catalog.length >= 8, 'catalog must expose visible category + treatment cards');
assert(core.catalog.every(item => item.id && item.category && item.service && item.price), 'catalog cards need id, category, service, and price');
let cart = core.addCatalogItem([], 'shoe-deep-cleaning');
cart = core.addCatalogItem(cart, 'shoe-deep-cleaning');
assert.equal(cart.length, 1);
assert.equal(cart[0].quantity, 2);
cart = core.updateCartQuantity(cart, 'shoe-deep-cleaning', -1);
assert.equal(cart[0].quantity, 1);
cart = core.updateCartQuantity(cart, 'shoe-deep-cleaning', -1);
assert.equal(cart.length, 0);
assert.deepEqual(core.getJourneyState(false, false, true), {currentStep:1, done:[false,false,false]});
assert.deepEqual(core.getJourneyState(true, false, true), {currentStep:2, done:[true,false,false]});
assert.deepEqual(core.getJourneyState(true, true, true), {currentStep:4, done:[true,true,true]});
console.log('Cashier contract passed');
