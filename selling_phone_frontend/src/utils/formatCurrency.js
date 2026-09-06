export function formatCurrency(value) {
  if (value == null) return 'Dang cap nhat';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value));
}
