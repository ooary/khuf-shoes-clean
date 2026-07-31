(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.KhufCashierCore = api;
})(typeof self !== 'undefined' ? self : this, function () {
  const customers = [
    { id: 1, name: 'Dimas Saputra', phone: '0812-4432-8821', address: 'Pejaten Barat, Jakarta Selatan' },
    { id: 2, name: 'Siti Rahma', phone: '0878-5511-1920', address: 'Pasar Minggu, Jakarta Selatan' },
    { id: 3, name: 'Nadia Putri', phone: '0857-9924-1270', address: 'Jatiasih, Kota Bekasi' },
    { id: 4, name: 'Raka Pratama', phone: '0896-2301-4439', address: 'Cilandak, Jakarta Selatan' }
  ];

  const catalog = [
    { id: 'shoe-deep-cleaning', category: 'Sepatu', service: 'Deep Cleaning', price: 45000, icon: 'footprints', color: 'blue', description: 'Pembersihan menyeluruh upper, midsole, dan outsole.' },
    { id: 'shoe-unyellowing', category: 'Sepatu', service: 'Unyellowing', price: 75000, icon: 'sun-medium', color: 'amber', description: 'Treatment oksidasi pada midsole yang menguning.' },
    { id: 'shoe-repaint', category: 'Sepatu', service: 'Repaint', price: 150000, icon: 'palette', color: 'violet', description: 'Pemulihan warna setelah pemeriksaan kondisi.' },
    { id: 'shoe-repair', category: 'Sepatu', service: 'Repair', price: 100000, icon: 'wrench', color: 'emerald', description: 'Perbaikan minor lem, jahitan, atau bagian rusak.' },
    { id: 'bag-deep-cleaning', category: 'Tas', service: 'Deep Cleaning', price: 65000, icon: 'briefcase-business', color: 'blue', description: 'Pembersihan bagian luar dan dalam tas.' },
    { id: 'bag-repair', category: 'Tas', service: 'Repair', price: 100000, icon: 'wrench', color: 'emerald', description: 'Perbaikan handle, jahitan, dan komponen tas.' },
    { id: 'wallet-deep-cleaning', category: 'Dompet', service: 'Deep Cleaning', price: 40000, icon: 'wallet-cards', color: 'blue', description: 'Pembersihan detail sesuai material dompet.' },
    { id: 'hat-deep-cleaning', category: 'Topi', service: 'Deep Cleaning', price: 35000, icon: 'circle-dot-dashed', color: 'blue', description: 'Pembersihan topi dengan penanganan bentuk.' }
  ];

  const services = Object.fromEntries(catalog.filter(item => item.category === 'Sepatu').map(item => [item.service, item.price]));

  function toNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : 0;
  }

  function calculateLineTotal(price, quantity) {
    return toNumber(price) * Math.max(1, Math.floor(toNumber(quantity) || 1));
  }

  function calculateOrderTotal(items) {
    return items.reduce((total, item) => total + calculateLineTotal(item.price, item.quantity), 0);
  }

  function calculatePayment(total, amountPaid) {
    const normalizedTotal = Math.max(0, toNumber(total));
    const paid = Math.min(normalizedTotal, Math.max(0, toNumber(amountPaid)));
    const due = normalizedTotal - paid;
    return { status: paid === 0 ? 'BELUM LUNAS' : due === 0 ? 'LUNAS' : 'DP', paid, due };
  }

  function findCustomers(query) {
    const term = String(query || '').trim().toLowerCase().replace(/[-\s]/g, '');
    if (!term) return [];
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(term) ||
      customer.phone.replace(/[-\s]/g, '').includes(term)
    );
  }

  function maskPhone(value) {
    const digits = String(value || '').replace(/\D/g, '');
    if (digits.length <= 7) return digits;
    const visibleEnd = 4;
    const visibleStart = Math.min(4, digits.length - visibleEnd);
    return `${digits.slice(0, visibleStart)}${'•'.repeat(digits.length - visibleStart - visibleEnd)}${digits.slice(-visibleEnd)}`;
  }

  function getJourneyState(customerComplete, itemsComplete, paymentComplete) {
    const done = [
      Boolean(customerComplete),
      Boolean(customerComplete && itemsComplete),
      Boolean(customerComplete && itemsComplete && paymentComplete)
    ];
    return { currentStep: !done[0] ? 1 : !done[1] ? 2 : !done[2] ? 3 : 4, done };
  }

  function addCatalogItem(cart, catalogId) {
    const product = catalog.find(item => item.id === catalogId);
    if (!product) return cart.map(item => ({ ...item }));
    const next = cart.map(item => ({ ...item }));
    const existing = next.find(item => item.catalogId === catalogId);
    if (existing) existing.quantity += 1;
    else next.push({ catalogId, category: product.category, service: product.service, price: product.price, quantity: 1, name: '', notes: '', targetDate: '', photoCount: 0 });
    return next;
  }

  function updateCartQuantity(cart, catalogId, delta) {
    return cart.map(item => item.catalogId === catalogId ? { ...item, quantity: item.quantity + delta } : { ...item }).filter(item => item.quantity > 0);
  }

  return { customers, catalog, services, calculateLineTotal, calculateOrderTotal, calculatePayment, findCustomers, maskPhone, getJourneyState, addCatalogItem, updateCartQuantity };
});
