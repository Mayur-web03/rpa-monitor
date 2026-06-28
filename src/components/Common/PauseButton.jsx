
import React from 'react'
import { useTelemetryStore } from '../../store/telemetryStore'
import { useAnalyticsStore } from '../../store/analyticsStore'

export function PauseButton() {
  const isPaused  = useTelemetryStore(s => s.isPaused)
  const pause     = useTelemetryStore(s => s.pause)
  const resume    = useTelemetryStore(s => s.resume)
  const isOpen    = useAnalyticsStore(s => s.isOpen)
  const toggle    = useAnalyticsStore(s => s.toggle)
  const closeAnalytics = useAnalyticsStore(s => s.close)

  const handlePauseResume = () => {
    if (isPaused) {
      closeAnalytics() // Analytics band karo pehle
      resume()
    } else {
      pause()
    }
  }

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <button
        onClick={handlePauseResume}
        style={{
          ...btnBase,
          background: isPaused ? '#10b981' : '#f43f5e',
          boxShadow: isPaused
            ? '0 0 12px rgba(16,185,129,0.4)'
            : '0 0 12px rgba(244,63,94,0.4)',
        }}
      >
        {isPaused ? '▶ Resume' : '⏸ Pause'}
      </button>

      {/* Analytics button sirf paused state me dikhega */}
      {isPaused && (
        <button
          onClick={toggle}
          style={{
            ...btnBase,
            background: isOpen ? '#6366f1' : '#1e293b',
            border: '1px solid #6366f1',
            boxShadow: isOpen ? '0 0 12px rgba(99,102,241,0.5)' : 'none',
          }}
        >
          📊 Analytics View
        </button>
      )}
    </div>
  )
}

const btnBase = {
  padding: '7px 16px',
  borderRadius: '7px',
  border: 'none',
  color: '#fff',
  fontWeight: 600,
  fontSize: '13px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  whiteSpace: 'nowrap',
}