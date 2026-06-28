import React from 'react'
import { useUIStore } from '../../store/uiStore'
import { COLUMNS } from '../../utils/constants'
import styles from './GridHeader.module.css'

export function GridHeader() {
  const sortKeys = useUIStore(s => s.sortKeys)
  const toggleSort = useUIStore(s => s.toggleSort)

  const handleClick = (e, colKey) => {
    // Shift + Click => multi-column sort
    // Normal Click => single-column sort (cycles asc -> desc -> none)
    const isMulti = e.shiftKey
    toggleSort(colKey, isMulti)
  }

  const getSortInfo = (colKey) => {
    const idx = sortKeys.findIndex(k => k.col === colKey)
    if (idx === -1) return null
    return { dir: sortKeys[idx].dir, priority: idx + 1 }
  }

  return (
    <div className={styles.header}>
      {COLUMNS.map(col => {
        const sortInfo = getSortInfo(col.key)
        const isSortable = col.sortable !== false

        return (
          <div
            key={col.key}
            className={styles.cell}
            style={{ minWidth: col.width, width: col.width, cursor: isSortable ? 'pointer' : 'default' }}
            onClick={isSortable ? (e) => handleClick(e, col.key) : undefined}
            title={isSortable ? 'Click to sort, Shift+Click for multi-sort' : ''}
          >
            <span className={styles.label}>{col.label}</span>

            {sortInfo && (
              <span className={styles.sortIndicator}>
                {sortInfo.dir === 'asc' ? '▲' : '▼'}
                {sortKeys.length > 1 ? sortInfo.priority : ''}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}