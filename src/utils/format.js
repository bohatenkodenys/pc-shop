const formatter = new Intl.NumberFormat('uk-UA', {
  style: 'currency',
  currency: 'UAH',
  maximumFractionDigits: 0,
})

// 7999 -> "7 999 ₴"
export function formatPrice(value) {
  return formatter.format(value)
}
