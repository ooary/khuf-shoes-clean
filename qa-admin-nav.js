const fs = require('node:fs');
const assert = require('node:assert/strict');

const cms = fs.readFileSync('cms.html', 'utf8');
const pos = fs.readFileSync('pos.html', 'utf8');
const posJs = fs.readFileSync('pos.js', 'utf8');

for (const label of ['POS', 'CMS']) {
  assert(cms.includes(`>${label}<`), `cms sidebar missing ${label} section`);
  assert(pos.includes(`>${label}<`), `pos sidebar missing ${label} section`);
}

for (const href of ['pos.html#dashboard','pos.html#orders','pos.html#customers','pos.html#services']) {
  assert(cms.includes(`href="${href}"`), `cms missing POS link ${href}`);
}

for (const href of ['cms.html#dashboard','cms.html#promo','cms.html#harga','cms.html#galeri','cms.html#layanan']) {
  assert(pos.includes(`href="${href}"`), `pos missing CMS link ${href}`);
}

assert(posJs.includes("window.location.hash"), 'POS runtime does not consume deep-link hash');
console.log('Admin navigation contract passed');
