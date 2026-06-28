function toComparable(val) {
  if (val == null) return null
  if (typeof val === 'number') return val
  const n = parseFloat(String(val).replace(/[^0-9.-]/g, ''))
  return isFinite(n) ? n : String(val)
}

export function multiSort(rows, sortKeys) {
  if (!sortKeys.length) return rows
  if (!rows.length) return rows

  const comparators = sortKeys.map(({ col, dir }) => ({
    col,
    mul: dir === 'asc' ? 1 : -1,
  }))

  return [...rows].sort((a, b) => {
    for (let i = 0; i < comparators.length; i++) {
      const { col, mul } = comparators[i]
      const av = toComparable(a[col])
      const bv = toComparable(b[col])

      if (av === bv) continue
      if (av == null) return mul
      if (bv == null) return -mul

      let cmp
      if (typeof av === 'number' && typeof bv === 'number') {
        cmp = av - bv
      } else {
        const as = String(av)
        const bs = String(bv)
        cmp = as < bs ? -1 : as > bs ? 1 : 0
      }

      if (cmp !== 0) return cmp * mul
    }
    return 0
  })
}

export function multiSortAsync(rows, sortKeys) {
  return new Promise(resolve => {
    if (rows.length <= 10000) {
      resolve(multiSort(rows, sortKeys))
      return
    }
    setTimeout(() => {
      resolve(multiSort(rows, sortKeys))
    }, 0)
  })
}