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

  const services = {
    'Deep Cleaning': 45000,
    'Unyellowing': 75000,
    'Repaint': 150000,
    'Repair': 100000
  };

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

  function getJourneyState(customerComplete, itemsComplete, paymentComplete) {
    const done = [
      Boolean(customerComplete),
      Boolean(customerComplete && itemsComplete),
      Boolean(customerComplete && itemsComplete && paymentComplete)
    ];
    return { currentStep: !done[0] ? 1 : !done[1] ? 2 : !done[2] ? 3 : 4, done };
  }

  return { customers, services, calculateLineTotal, calculateOrderTotal, calculatePayment, findCustomers, getJourneyState };
});
