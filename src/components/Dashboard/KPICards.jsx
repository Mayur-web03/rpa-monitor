import React, { useState, useEffect } from 'react'
import { useTelemetryStore } from '../../store/telemetryStore'
import { formatCurrency, formatNumber } from '../../utils/formatter'

export function KPICards() {
  const kpi          = useTelemetryStore(s => s.kpi)
  const isPaused     = useTelemetryStore(s => s.isPaused)
  const isFlushing   = useTelemetryStore(s => s.isFlushing)
  const pendingCount = useTelemetryStore(s => s.pendingCount)
  const isLoaded     = useTelemetryStore(s => s.isLoaded)
  const loadStartTime = useTelemetryStore(s => s.loadStartTime)

  const [loadTime, setLoadTime] = useState(null)

  useEffect(() => {
    if (isLoaded && loadTime === null) {
      setLoadTime(((Date.now() - loadStartTime) / 1000).toFixed(2))
    }
  }, [isLoaded, loadStartTime, loadTime])

  return (
    <div className="kpi-bar">
      <KPICard
        label="Total Rows"
        value={formatNumber(kpi.totalRows)}
        icon="📋"
        color="#7b8cde"
      />
      <KPICard
        label="Active Robots"
        value={formatNumber(kpi.activeRobots)}
        icon="🤖"
        color="#4ecdc4"
      />
      <KPICard
        label="Total Savings"
        value={formatCurrency(kpi.totalSavings)}
        icon="💰"
        color="#45b7d1"
      />
      {loadTime && (
        <KPICard
          label="Load Time"
          value={`${loadTime}s`}
          icon="⚡"
          color="#10b981"
        />
      )}
      {/* Paused — pending queue count dikhao */}
      {isPaused && pendingCount > 0 && (
        <KPICard
          label="Queued Updates"
          value={formatNumber(pendingCount)}
          icon="⏳"
          color="#f59e0b"
        />
      )}
      {/* Resume ke baad flush ho raha hai */}
      {isFlushing && (
        <KPICard
          label="Applying Updates"
          value="Flushing..."
          icon="🔄"
          color="#6366f1"
        />
      )}
      {/* Normal paused state — no pending */}
      {isPaused && pendingCount === 0 && (
        <KPICard
          label="Stream"
          value="PAUSED"
          icon="⏸"
          color="#ffc107"
        />
      )}
    </div>
  )
}

function KPICard({ label, value, icon, color }) {
  return (
    <div className="kpi-card" style={{ borderTop: `3px solid ${color}` }}>
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-body">
        <div className="kpi-value" style={{ color }}>{value}</div>
        <div className="kpi-label">{label}</div>
      </div>
    </div>
  )
}