const core = window.KhufCashierCore;
const rupiah = value => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value || 0);
const pdfRupiah = value => `Rp ${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(value || 0)}`;
let itemSequence = 0;
let latestOrder = null;
let receiptLogoData = '';

function loadReceiptLogo() {
  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
    canvas.getContext('2d').drawImage(image, 0, 0);
    receiptLogoData = canvas.toDataURL('image/png');
  };
  image.src = 'assets/khuf-logo.png';
}

function renderIcons() {
  if (window.lucide?.createIcons) window.lucide.createIcons();
}
function renderIconsWhenReady(attempt = 0) {
  if (window.lucide?.createIcons) return renderIcons();
  if (attempt < 20) setTimeout(() => renderIconsWhenReady(attempt + 1), 100);
}

function serviceOptions(selected = '') {
  return Object.entries(core.services).map(([name, price]) => `<option value="${name}" ${name === selected ? 'selected' : ''}>${name} — ${rupiah(price)}</option>`).join('');
}

function addItem(initial = {}) {
  const id = ++itemSequence;
  const service = initial.service || 'Deep Cleaning';
  itemsList.insertAdjacentHTML('beforeend', `<article class="item-card" data-item-id="${id}">
    <div class="flex items-center justify-between gap-3 mb-4"><div><p class="text-[10px] text-blue-600 font-bold tracking-wider">BARANG ${id}</p><h3 class="font-bold mt-1">Detail barang</h3></div><button type="button" class="btn btn-danger remove-item" aria-label="Hapus barang ${id}"><i data-lucide="trash-2" class="w-4"></i></button></div>
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <label class="label">Kategori<select class="field mt-1.5 item-category"><option>Sepatu</option><option>Tas</option><option>Dompet</option><option>Topi</option></select></label>
      <label class="label sm:col-span-1 lg:col-span-2">Nama / merek<input class="field mt-1.5 item-name" required value="${initial.name || ''}" placeholder="Contoh: Nike Air Force 1"></label>
      <label class="label">Quantity<input class="field mt-1.5 item-quantity" type="number" min="1" value="${initial.quantity || 1}" required></label>
      <label class="label sm:col-span-2">Layanan<select class="field mt-1.5 item-service">${serviceOptions(service)}</select></label>
      <label class="label">Harga satuan<input class="field mt-1.5 item-price bg-slate-50" readonly data-value="${core.services[service]}" value="${rupiah(core.services[service])}"></label>
      <label class="label">Subtotal<input class="field mt-1.5 item-subtotal bg-slate-50 font-bold" readonly data-value="${core.calculateLineTotal(core.services[service], initial.quantity || 1)}" value="${rupiah(core.calculateLineTotal(core.services[service], initial.quantity || 1))}"></label>
      <label class="label sm:col-span-2 lg:col-span-4">Catatan kondisi<textarea class="field mt-1.5 min-h-16 item-notes" placeholder="Noda, kerusakan, atau risiko treatment">${initial.notes || ''}</textarea></label>
      <label class="label sm:col-span-2 lg:col-span-4">Foto kondisi<input class="field mt-1.5 item-photos" type="file" accept="image/jpeg,image/png,image/webp" multiple><span class="photo-list flex flex-wrap gap-2 mt-2"></span></label>
    </div>
  </article>`);
  renderIcons();
  updateTotals();
}

function collectItems() {
  return [...document.querySelectorAll('[data-item-id]')].map(card => ({
    category: card.querySelector('.item-category').value,
    name: card.querySelector('.item-name').value.trim(),
    quantity: Number(card.querySelector('.item-quantity').value || 1),
    service: card.querySelector('.item-service').value,
    price: Number(card.querySelector('.item-price').dataset.value || 0),
    notes: card.querySelector('.item-notes').value.trim(),
    photoCount: card.querySelector('.item-photos').files.length
  }));
}

function updateTotals() {
  document.querySelectorAll('[data-item-id]').forEach(card => {
    const service = card.querySelector('.item-service').value;
    const quantity = Math.max(1, Number(card.querySelector('.item-quantity').value || 1));
    const price = core.services[service];
    card.querySelector('.item-price').dataset.value = price;
    card.querySelector('.item-price').value = rupiah(price);
    const subtotal = core.calculateLineTotal(price, quantity);
    card.querySelector('.item-subtotal').dataset.value = subtotal;
    card.querySelector('.item-subtotal').value = rupiah(subtotal);
  });
  const items = collectItems();
  const total = core.calculateOrderTotal(items);
  if (paymentStatus.value === 'paid') amountPaid.value = total;
  if (paymentStatus.value === 'unpaid') amountPaid.value = 0;
  const payment = core.calculatePayment(total, amountPaid.value);
  orderTotal.textContent = mobileOrderTotal.textContent = rupiah(total);
  summaryPaid.textContent = rupiah(payment.paid);
  amountDue.textContent = mobileAmountDue.textContent = rupiah(payment.due);
  summaryCustomer.innerHTML = customerName.value ? `<b class="text-slate-900">${customerName.value}</b><br>${customerPhone.value || 'WhatsApp belum diisi'}` : 'Pelanggan belum dipilih';
  summaryItems.innerHTML = items.map(item => `<div class="flex justify-between gap-3 text-xs"><span>${item.quantity}× ${item.name || item.category}<br><small class="text-slate-400">${item.service}</small></span><b>${rupiah(core.calculateLineTotal(item.price, item.quantity))}</b></div>`).join('') || '<p class="text-xs text-slate-400">Belum ada barang.</p>';
  paymentItems.innerHTML = items.map(item => `<div class="flex justify-between gap-3 text-sm"><span>${item.quantity}× ${item.name || item.category} — ${item.service}</span><b>${rupiah(core.calculateLineTotal(item.price, item.quantity))}</b></div>`).join('');
  const customerComplete = Boolean(customerName.value.trim() && customerPhone.value.trim());
  const itemsComplete = items.length > 0 && items.every(item => item.name);
  const paymentComplete = paymentStatus.value === 'unpaid' || Boolean(paymentMethod.value && (paymentStatus.value !== 'partial' || payment.paid > 0));
  const journey = core.getJourneyState(customerComplete, itemsComplete, paymentComplete);
  document.querySelectorAll('[data-step-indicator]').forEach((indicator, index) => {
    indicator.classList.toggle('done', index < 3 && journey.done[index]);
    indicator.classList.toggle('active', Number(indicator.dataset.stepIndicator) === journey.currentStep);
  });
  const orderReady = customerComplete && itemsComplete && paymentComplete;
  createOrderButton.disabled = !orderReady;
  mobileCreateOrderButton.disabled = !orderReady;
}

customerSearch.addEventListener('input', () => {
  const matches = core.findCustomers(customerSearch.value);
  customerResults.innerHTML = matches.map(customer => `<button type="button" class="search-result w-full text-left p-3 border-b last:border-b-0" data-customer-id="${customer.id}"><b class="text-sm">${customer.name}</b><p class="text-xs text-slate-400 mt-1">${customer.phone} · ${customer.address}</p></button>`).join('');
  customerResults.classList.toggle('hidden', matches.length === 0);
});
customerResults.addEventListener('click', event => {
  const button = event.target.closest('[data-customer-id]');
  if (!button) return;
  const customer = core.customers.find(item => item.id === Number(button.dataset.customerId));
  customerName.value = customer.name; customerPhone.value = customer.phone; customerAddress.value = customer.address;
  customerSearch.value = customer.name; customerResults.classList.add('hidden'); existingCustomerNote.classList.remove('hidden'); updateTotals();
});
[customerName, customerPhone, customerAddress].forEach(input => input.addEventListener('input', updateTotals));

addItemButton.addEventListener('click', () => addItem());
itemsList.addEventListener('click', event => {
  const remove = event.target.closest('.remove-item');
  if (!remove) return;
  if (document.querySelectorAll('[data-item-id]').length === 1) return;
  remove.closest('[data-item-id]').remove(); updateTotals();
});
itemsList.addEventListener('input', event => {
  if (event.target.classList.contains('item-photos')) {
    const list = event.target.closest('[data-item-id]').querySelector('.photo-list');
    list.innerHTML = [...event.target.files].map(file => `<span class="photo-pill"><i data-lucide="image" class="w-3"></i>${file.name}</span>`).join('');
    renderIcons();
  }
  updateTotals();
});
itemsList.addEventListener('change', updateTotals);

paymentStatus.addEventListener('change', () => {
  amountPaid.disabled = paymentStatus.value === 'unpaid' || paymentStatus.value === 'paid';
  updateTotals();
});
amountPaid.addEventListener('input', updateTotals);
paymentMethod.addEventListener('change', updateTotals);

function validateOrder() {
  const items = collectItems();
  if (!customerName.value.trim() || !customerPhone.value.trim()) return 'Nama dan WhatsApp pelanggan wajib diisi.';
  if (!items.length || items.some(item => !item.name)) return 'Setiap barang wajib memiliki nama atau merek.';
  if (paymentStatus.value !== 'unpaid' && !paymentMethod.value) return 'Pilih metode pembayaran.';
  if (paymentStatus.value === 'partial' && Number(amountPaid.value) <= 0) return 'Masukkan nominal pembayaran sebagian.';
  return '';
}

cashierForm.addEventListener('submit', event => {
  event.preventDefault();
  const error = validateOrder();
  if (error) return alert(error);
  const items = collectItems();
  const total = core.calculateOrderTotal(items);
  const payment = core.calculatePayment(total, amountPaid.value);
  latestOrder = {
    number: 'KHUF-260731-006', date: '31 Juli 2026, 14:30', branch: 'Pejaten Barat',
    customer: { name: customerName.value.trim(), phone: customerPhone.value.trim(), address: customerAddress.value.trim() },
    items, total, payment, method: paymentMethod.value || 'Belum ditentukan'
  };
  successOrderNumber.textContent = latestOrder.number;
  successTotal.textContent = rupiah(total); successDue.textContent = rupiah(payment.due);
  successPaymentBadge.textContent = payment.status;
  successPaymentBadge.className = `inline-flex rounded-full px-3 py-1 text-xs font-bold mt-4 ${payment.status === 'LUNAS' ? 'bg-emerald-50 text-emerald-700' : payment.status === 'DP' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`;
  orderSuccess.classList.remove('hidden'); orderSuccess.classList.add('flex'); document.body.style.overflow = 'hidden'; renderIcons();
});

function generateReceiptPdf(order) {
  if (!window.jspdf?.jsPDF) throw new Error('PDF library belum siap. Coba ulangi beberapa detik lagi.');
  const { jsPDF } = window.jspdf;
  const height = Math.max(190, 125 + order.items.length * 20);
  const doc = new jsPDF({ unit: 'mm', format: [80, height] });
  doc.setFillColor(255,255,255); doc.roundedRect(5, 5, 70, 24, 3, 3, 'F');
  if (receiptLogoData) doc.addImage(receiptLogoData, 'PNG', 24, 7, 32, 18, undefined, 'FAST');
  else { doc.setTextColor(15,23,42); doc.setFont('helvetica','bold'); doc.setFontSize(18); doc.text('KHUF',40,15,{align:'center'}); doc.setFontSize(8); doc.text('CLEAN & CARE',40,21,{align:'center'}); }
  doc.setTextColor(15,23,42);
  doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.text(order.branch, 40, 35, {align:'center'}); doc.text('+62 899-1971-197', 40, 40, {align:'center'});
  doc.setDrawColor(203,213,225); doc.line(5,45,75,45);
  let y = 51; doc.setFont('helvetica','bold'); doc.text(order.number, 5, y); doc.setFont('helvetica','normal'); doc.text(order.date, 75, y, {align:'right'}); y += 7;
  doc.text(`Pelanggan: ${order.customer.name}`,5,y); y+=5; doc.text(`WhatsApp: ${order.customer.phone}`,5,y); y+=5;
  if(order.customer.address){const lines=doc.splitTextToSize(`Alamat: ${order.customer.address}`,70);doc.text(lines,5,y);y+=lines.length*4+2}
  doc.line(5,y,75,y); y+=6;
  order.items.forEach(item => { doc.setFont('helvetica','bold'); doc.text(`${item.quantity}x ${item.name}`,5,y); doc.setFont('helvetica','normal'); doc.text(pdfRupiah(core.calculateLineTotal(item.price,item.quantity)),75,y,{align:'right'}); y+=4.5; doc.setFontSize(7); doc.text(`${item.category} - ${item.service} @ ${pdfRupiah(item.price)}`,5,y); doc.setFontSize(8); y+=7; });
  doc.line(5,y,75,y); y+=7; doc.setFont('helvetica','bold'); doc.text('TOTAL',5,y); doc.text(pdfRupiah(order.total),75,y,{align:'right'}); y+=6; doc.setFont('helvetica','normal'); doc.text(`Dibayar (${order.method})`,5,y); doc.text(pdfRupiah(order.payment.paid),75,y,{align:'right'}); y+=6; doc.text('Sisa tagihan',5,y); doc.text(pdfRupiah(order.payment.due),75,y,{align:'right'}); y+=9;
  doc.setFillColor(order.payment.status==='LUNAS'?209:order.payment.status==='DP'?219:254, order.payment.status==='LUNAS'?250:order.payment.status==='DP'?234:243, order.payment.status==='LUNAS'?229:order.payment.status==='DP'?254:199); doc.roundedRect(15,y-5,50,10,2,2,'F'); doc.setFont('helvetica','bold'); doc.text(order.payment.status,40,y+1,{align:'center'}); y+=13;
  doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.text('Terima kasih telah mempercayakan barang kesayanganmu.',40,y,{align:'center',maxWidth:68}); y+=8; doc.text('Simpan struk ini sebagai bukti order.',40,y,{align:'center'});
  return doc;
}

downloadReceiptButton.addEventListener('click', () => {
  try { generateReceiptPdf(latestOrder).save(`Struk-${latestOrder.number}.pdf`); }
  catch (error) { alert(error.message); }
});
shareWhatsappButton.addEventListener('click', () => {
  if (!latestOrder) return;
  const message = `Halo ${latestOrder.customer.name}, order ${latestOrder.number} sudah dibuat. Total ${rupiah(latestOrder.total)}, status ${latestOrder.payment.status}, sisa ${rupiah(latestOrder.payment.due)}.`;
  window.open(`https://wa.me/${latestOrder.customer.phone.replace(/\D/g,'').replace(/^0/,'62')}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
});

addItem({ name: '', service: 'Deep Cleaning', quantity: 1 });
loadReceiptLogo();
renderIconsWhenReady(); setTimeout(renderIcons, 500); window.addEventListener('load', () => setTimeout(renderIcons, 100));
window.KhufCashier = { collectItems, updateTotals, generateReceiptPdf, getLatestOrder: () => latestOrder };
