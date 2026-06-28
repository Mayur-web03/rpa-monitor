const currencyFmt = new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD', maximumFractionDigits: 0
})

const pctFmt = new Intl.NumberFormat('en-US', {
  style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2
})

export function formatCurrency(val) {
  const n = Number(val)
  if (!isFinite(n) || isNaN(n)) return '-'
  return currencyFmt.format(n)
}

export function formatPercent(val) {
  const n = Number(val)
  if (!isFinite(n) || isNaN(n)) return '-'
  return pctFmt.format(n / 100)
}

export function formatNumber(val) {
  const n = Number(val)
  if (!isFinite(n) || isNaN(n)) return '-'
  return n.toLocaleString('en-US')
}