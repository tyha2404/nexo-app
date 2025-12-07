export const formatCurrency = (
  amount: number,
  currency: string = 'VND',
  locale: string = 'it-IT'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Format number with thousand separators for VND
export const formatVND = (value: string): string => {
  const num = parseFloat(value.replace(/[^\d]/g, '')) || 0;
  return new Intl.NumberFormat('vi-VN').format(num);
};

// Parse VND string to number (e.g., '1.000.000' -> 1000000)
export const parseVND = (value: string): number => {
  return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
};
