import { fuzzyMatch } from '../utils/fuzzySearch'
import { multiSort, multiSortAsync } from '../utils/multiSort'

const searchTextCache = new WeakMap()

function getSearchText(row) {
  let cached = searchTextCache.get(row)
  if (cached !== undefined) return cached

  const text = [
    row.project_name,
    row.project_status,
    row.automation_type,
    row.department,
    row.industry,
    row.country,
    row.implementation_partner,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  searchTextCache.set(row, text)
  return text
}

export function getUniqueValues(rows, rowIds, col) {
  const seen = new Set()
  rowIds.forEach(id => {
    const v = rows[id]?.[col]
    if (v != null && v !== '') seen.add(v)
  })
  return Array.from(seen).sort()
}

// Sync version — 10k se kam rows ke liye, ya jab async cancel ho jaye
export function getDerivedRows(rows, rowIds, filters, searchQuery, sortKeys) {
  let ids = rowIds

  if (filters.department) {
    ids = ids.filter(id => rows[id]?.department === filters.department)
  }
  if (filters.industry) {
    ids = ids.filter(id => rows[id]?.industry === filters.industry)
  }
  if (filters.automationType) {
    ids = ids.filter(id => rows[id]?.automation_type === filters.automationType)
  }

  const query = searchQuery.trim()
  if (query) {
    ids = ids.filter(id => {
      const row = rows[id]
      if (!row) return false
      return fuzzyMatch(getSearchText(row), query)
    })
  }

  if (sortKeys.length > 0 && ids.length > 0) {
    const rowObjs = ids.map(id => rows[id]).filter(Boolean)
    const sorted = multiSort(rowObjs, sortKeys)
    ids = sorted.map(r => r.internal_uid)
  }

  return ids
}

// Async version — 10k+ sorted rows ke liye UI freeze nahi hoga
export async function getDerivedRowsAsync(rows, rowIds, filters, searchQuery, sortKeys) {
  let ids = rowIds

  if (filters.department) {
    ids = ids.filter(id => rows[id]?.department === filters.department)
  }
  if (filters.industry) {
    ids = ids.filter(id => rows[id]?.industry === filters.industry)
  }
  if (filters.automationType) {
    ids = ids.filter(id => rows[id]?.automation_type === filters.automationType)
  }

  const query = searchQuery.trim()
  if (query) {
    ids = ids.filter(id => {
      const row = rows[id]
      if (!row) return false
      return fuzzyMatch(getSearchText(row), query)
    })
  }

  if (sortKeys.length > 0 && ids.length > 0) {
    const rowObjs = ids.map(id => rows[id]).filter(Boolean)
    const sorted = await multiSortAsync(rowObjs, sortKeys)
    ids = sorted.map(r => r.internal_uid)
  }

  return ids
}