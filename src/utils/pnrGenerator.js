export function generatePNR() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let pnr = 'RB';
  for (let i = 0; i < 4; i++) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pnr;
}

export function calculateSavings(baseFare, cabinClass = 'Economy') {
  let multiplier = 0.25; // 25% average
  if (cabinClass === 'Business') multiplier = 0.30;
  if (cabinClass === 'First') multiplier = 0.32;
  
  const discountAmount = Math.round(baseFare * multiplier);
  const finalPrice = baseFare - discountAmount;
  
  return {
    originalPrice: baseFare,
    discountAmount,
    finalPrice,
    savingsPercentage: Math.round(multiplier * 100)
  };
}

export const CURRENCY_RATES = {
  USD: { rate: 1.0, symbol: '$', code: 'USD', name: 'USD ($)' },
  EUR: { rate: 0.92, symbol: '€', code: 'EUR', name: 'EUR (€)' },
  GBP: { rate: 0.78, symbol: '£', code: 'GBP', name: 'GBP (£)' }
};

export function formatCurrency(amount, currency = 'USD') {
  if (amount === undefined || amount === null || isNaN(amount)) return '$0';
  const info = CURRENCY_RATES[currency] || CURRENCY_RATES.USD;
  const convertedAmount = Math.round(amount * info.rate);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: info.code,
    maximumFractionDigits: 0
  }).format(convertedAmount);
}
