import React, { memo, useRef, useState, useEffect } from 'react'
import { useTelemetryStore } from '../../store/telemetryStore'
import { COLUMNS, ROW_HEIGHT } from '../../utils/constants'
import { formatCurrency, formatPercent, formatNumber } from '../../utils/formatter'
import styles from './GridRow.module.css'

function formatCell(val, type) {
  if (val == null || val === '') return '-'
  switch (type) {
    case 'currency': return formatCurrency(val)
    case 'percent':  return formatPercent(val)
    case 'number':   return formatNumber(val)
    default:         return String(val)
  }
}

function getAlertClass(row) {
  if (row.project_status === 'Failed') return styles.alertFailed
  if (parseFloat(row.roi_percent) < 0) return styles.alertNegativeRoi
  return ''
}

function getAlertTooltip(row) {
  if (row.project_status === 'Failed') return '⚠️ Alert: Project Failed — Immediate Review Required'
  if (parseFloat(row.roi_percent) < 0) return '⚠️ Alert: ROI Anomaly Detected — Negative Return'
  return null
}

export const GridRow = memo(function GridRow({ id, index }) {
  const row = useTelemetryStore(s => s.rows[id])

  const prevRowRef  = useRef(row)
  const [isFlashing, setIsFlashing] = useState(false)

  useEffect(() => {
    if (prevRowRef.current !== row) {
      prevRowRef.current = row
      setIsFlashing(true)
      const t = setTimeout(() => setIsFlashing(false), 400)
      return () => clearTimeout(t)
    }
  }, [row])

  if (!row) return null

  const alertTooltip = getAlertTooltip(row)
  const alertClass   = getAlertClass(row)

  return (
    <div
      className={[
        styles.row,
        index % 2 === 1 ? styles.odd : '',
        alertClass,
        isFlashing ? styles.flash : '',
      ].filter(Boolean).join(' ')}
      style={{ height: ROW_HEIGHT }}
      title={alertTooltip ?? undefined}
    >
      {alertTooltip && (
        <div className={styles.alertDot} title={alertTooltip}>!</div>
      )}

      {COLUMNS.map(col => (
        <div
          key={col.key}
          className={[
            styles.cell,
            col.type === 'number' || col.type === 'currency' || col.type === 'percent'
              ? styles.numeric : ''
          ].filter(Boolean).join(' ')}
          style={{ minWidth: col.width, width: col.width }}
          title={alertTooltip ?? String(row[col.key] ?? '')}
        >
          {col.key === 'project_status'
            ? <StatusBadge status={row.project_status} />
            : formatCell(row[col.key], col.type)
          }
        </div>
      ))}
    </div>
  )
}, (prev, next) => prev.id === next.id && prev.index === next.index)

function StatusBadge({ status }) {
  const cls = (status || '').toLowerCase().replace(/\s+/g, '-')
  return <span className={`status-badge status-${cls}`}>{status}</span>
}