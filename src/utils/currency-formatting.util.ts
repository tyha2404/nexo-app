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
