const views = document.querySelectorAll('[data-view]');
const navItems = document.querySelectorAll('[data-nav]');
const titles = {
  dashboard: 'Ringkasan Operasional',
  orders: 'Order & Pengerjaan',
  customers: 'Pelanggan',
  services: 'Layanan & Harga'
};

const orders = [
  ['KHUF-260731-005','Dimas Saputra','0812••••8821','Adidas Samba','1 item','Hari ini','Dalam proses','Belum bayar'],
  ['KHUF-260731-004','Siti Rahma','0878••••1920','New Balance 530','2 item','1 Agu 2026','Siap diambil','Lunas'],
  ['KHUF-260731-003','Raka Pratama','0896••••4439','Nike Air Jordan 1','1 item','2 Agu 2026','Diterima','DP Rp 50.000'],
  ['KHUF-260730-014','Nadia Putri','0857••••1270','Coach Tote Bag','1 item','Terlambat 1 hari','Perlu perhatian','Lunas'],
  ['KHUF-260730-011','Fajar Nugroho','0813••••6912','Vans Old Skool','2 item','3 Agu 2026','Dalam proses','Belum bayar']
];

const customers = [
  ['Dimas Saputra','0812-4432-8821','8 order','31 Jul 2026','Rp 1.140.000'],
  ['Siti Rahma','0878-5511-1920','5 order','31 Jul 2026','Rp 775.000'],
  ['Nadia Putri','0857-9924-1270','3 order','30 Jul 2026','Rp 680.000'],
  ['Raka Pratama','0896-2301-4439','2 order','31 Jul 2026','Rp 225.000']
];

const services = [
  ['Deep Cleaning','Cleaning menyeluruh sesuai material','Mulai Rp 45.000','droplets','blue'],
  ['Unyellowing','Treatment oksidasi pada midsole','Mulai Rp 75.000','sun-medium','amber'],
  ['Repaint','Pemulihan warna setelah pemeriksaan','Mulai Rp 150.000','palette','violet'],
  ['Repair','Perbaikan minor hingga restorasi','Harga pemeriksaan','wrench','emerald']
];

function renderIcons() {
  if (window.lucide) window.lucide.createIcons();
}

function renderIconsWhenReady(attempt = 0) {
  if (window.lucide?.createIcons) {
    renderIcons();
    return;
  }
  if (attempt < 20) setTimeout(() => renderIconsWhenReady(attempt + 1), 100);
}

function workBadge(status) {
  const styles = {
    'Diterima': 'bg-blue-50 text-blue-700',
    'Dalam proses': 'bg-amber-50 text-amber-700',
    'Siap diambil': 'bg-emerald-50 text-emerald-700',
    'Perlu perhatian': 'bg-rose-50 text-rose-700'
  };
  return `<span class="badge ${styles[status] || 'bg-slate-100 text-slate-600'}">${status}</span>`;
}

function paymentBadge(status) {
  const style = status === 'Lunas' ? 'bg-emerald-50 text-emerald-700' : status.startsWith('DP') ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700';
  return `<span class="badge ${style}">${status}</span>`;
}

orderRows.innerHTML = orders.map(order => `<tr class="border-t hover:bg-slate-50/70">
  <td class="p-4 whitespace-nowrap"><b>${order[0]}</b><p class="text-xs text-slate-400 mt-1">Pejaten Barat</p></td>
  <td class="p-4"><b>${order[1]}</b><p class="text-xs text-slate-400 mt-1">${order[2]}</p></td>
  <td class="p-4">${order[3]}<p class="text-xs text-slate-400 mt-1">${order[4]}</p></td>
  <td class="p-4 ${order[5].includes('Terlambat') ? 'text-rose-600 font-semibold' : ''}">${order[5]}</td>
  <td class="p-4">${workBadge(order[6])}</td>
  <td class="p-4">${paymentBadge(order[7])}</td>
  <td class="p-4 text-right"><button class="btn btn-soft" data-order-detail="${order[0]}">Lihat</button></td>
</tr>`).join('');

customerRows.innerHTML = customers.map(customer => `<tr class="border-t hover:bg-slate-50/70"><td class="p-4 font-semibold">${customer[0]}</td><td class="p-4 text-slate-500">${customer[1]}</td><td class="p-4">${customer[2]}</td><td class="p-4 text-slate-500">${customer[3]}</td><td class="p-4 font-semibold">${customer[4]}</td><td class="p-4 text-right"><button class="btn btn-soft">Lihat Riwayat</button></td></tr>`).join('');

serviceCards.innerHTML = services.map(([name,desc,price,icon,color]) => `<article class="panel p-5"><div class="flex justify-between items-start"><span class="p-2 rounded-lg bg-${color}-50 text-${color}-700"><i data-lucide="${icon}" class="w-5"></i></span><span class="badge bg-emerald-50 text-emerald-700">Aktif</span></div><h3 class="font-bold mt-5">${name}</h3><p class="text-xs text-slate-500 leading-5 mt-2 min-h-10">${desc}</p><div class="border-t mt-4 pt-4 flex justify-between items-center gap-2"><b class="text-sm">${price}</b><button class="p-2 bg-slate-100 rounded-lg" aria-label="Edit ${name}"><i data-lucide="pencil" class="w-4"></i></button></div></article>`).join('');

function switchView(id) {
  if (!titles[id]) id = 'dashboard';
  views.forEach(view => view.dataset.active = String(view.dataset.view === id));
  navItems.forEach(item => item.classList.toggle('active', item.dataset.nav === id));
  pageTitle.textContent = titles[id];
  sidebar.classList.remove('open');
  window.scrollTo(0, 0);
}

navItems.forEach(item => item.addEventListener('click', () => {
  switchView(item.dataset.nav);
  history.replaceState(null, '', `#${item.dataset.nav}`);
}));
document.querySelectorAll('[data-go]').forEach(item => item.addEventListener('click', () => switchView(item.dataset.go)));
const initialView = window.location.hash.slice(1);
if (initialView) switchView(initialView);
window.addEventListener('hashchange', () => switchView(window.location.hash.slice(1)));

function openOrderModal() {
  orderModal.classList.remove('hidden');
  orderModal.classList.add('flex');
  document.body.style.overflow = 'hidden';
  setTimeout(() => customerName.focus(), 20);
}

function closeOrderDialog() {
  orderModal.classList.add('hidden');
  orderModal.classList.remove('flex');
  document.body.style.overflow = '';
}

newOrderButton.addEventListener('click', openOrderModal);
document.querySelectorAll('[data-new-order]').forEach(button => button.addEventListener('click', openOrderModal));
closeOrderModal.addEventListener('click', closeOrderDialog);
cancelOrderModal.addEventListener('click', closeOrderDialog);
orderModal.addEventListener('click', event => { if (event.target === orderModal) closeOrderDialog(); });

orderForm.onsubmit = event => {
  event.preventDefault();
  if (!orderForm.checkValidity()) return orderForm.reportValidity();
  closeOrderDialog();
  orderSuccess.classList.remove('hidden');
  orderSuccess.classList.add('flex');
  renderIcons();
};

function closeSuccess() {
  orderSuccess.classList.add('hidden');
  orderSuccess.classList.remove('flex');
  orderForm.reset();
  targetDate.value = '2026-08-04';
  switchView('orders');
}

finishSuccess.addEventListener('click', closeSuccess);
sendWhatsapp.addEventListener('click', () => {
  toast.textContent = 'Pesan WhatsApp disiapkan di mockup';
  toast.classList.remove('translate-y-24','opacity-0');
  setTimeout(() => toast.classList.add('translate-y-24','opacity-0'), 2200);
});

function openDetail(orderNumber) {
  detailOrderNumber.textContent = orderNumber;
  orderDetail.classList.add('open');
  orderDetail.setAttribute('aria-hidden','false');
  detailBackdrop.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeDetailDrawer() {
  orderDetail.classList.remove('open');
  orderDetail.setAttribute('aria-hidden','true');
  detailBackdrop.classList.add('hidden');
  document.body.style.overflow = '';
}

document.addEventListener('click', event => {
  const detailButton = event.target.closest('[data-order-detail]');
  if (detailButton) openDetail(detailButton.dataset.orderDetail);
});
closeOrderDetail.addEventListener('click', closeDetailDrawer);
detailBackdrop.addEventListener('click', closeDetailDrawer);

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeOrderDialog();
    closeDetailDrawer();
  }
});

orderSearch.addEventListener('input', event => {
  const term = event.target.value.toLowerCase();
  [...orderRows.rows].forEach(row => row.hidden = !row.textContent.toLowerCase().includes(term));
});

openMenu.addEventListener('click', () => sidebar.classList.add('open'));
closeMenu.addEventListener('click', () => sidebar.classList.remove('open'));

renderIconsWhenReady();
setTimeout(renderIcons, 500);
window.addEventListener('load', () => setTimeout(renderIcons, 100));
