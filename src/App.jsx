import React, { useEffect, useState } from 'react'
import { useTelemetry } from './hooks/useTelemetry'
import { useTelemetryStore } from './store/telemetryStore'
import { useUIStore } from './store/uiStore'
import { useAnalyticsStore } from './store/analyticsStore'
import { KPICards } from './components/Dashboard/KPICards'
import { FilterBar } from './components/Filters/FilterBar'
import { SearchBar } from './components/Search/SearchBar'
import { PauseButton } from './components/Common/PauseButton'
import { Grid } from './components/Grid/Grid'
import { AnalyticsView } from './components/Analytics/AnalyticsView'
import { exportToCSV } from './utils/exportCSV'
import './styles/global.css'

// ── FPS + Memory hook ─────────────────────────────────────────────────────────
function usePerformanceStats() {
  const [stats, setStats] = useState({ fps: 0, memoryMB: null })

  useEffect(() => {
    let frames  = 0
    let lastTime = performance.now()
    let rafId

    function tick() {
      frames++
      const now = performance.now()
      if (now - lastTime >= 1000) {
        const fps = Math.round(frames * 1000 / (now - lastTime))
        const memoryMB = performance.memory
          ? Math.round(performance.memory.usedJSHeapSize / 1048576)
          : null
        setStats({ fps, memoryMB })
        frames   = 0
        lastTime = now
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  return stats
}

// ── Keyboard shortcuts hook ───────────────────────────────────────────────────
function useKeyboardShortcuts() {
  const pause    = useTelemetryStore(s => s.pause)
  const resume   = useTelemetryStore(s => s.resume)
  const isPaused = useTelemetryStore(s => s.isPaused)
  const setSearch = useUIStore(s => s.setSearch)

  useEffect(() => {
    function handler(e) {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault()
        isPaused ? resume() : pause()
      }
      if (e.code === 'Escape') {
        setSearch('')
      }
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault()
        document.getElementById('export-btn')?.click()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isPaused, pause, resume, setSearch])
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  useTelemetry()
  useKeyboardShortcuts()

  // ⚠️ rows yaha subscribe NAHI karna — har 200ms re-render hoga, FPS girega
  const isLoaded  = useTelemetryStore(s => s.isFullyLoaded)
  const isOpen    = useAnalyticsStore(s => s.isOpen)
  const { fps, memoryMB } = usePerformanceStats()

  const [isExporting, setIsExporting] = useState(false)

  const handleExport = () => {
    if (isExporting) return
    setIsExporting(true)

    // getState() se direct lo — subscribe nahi kiya isliye App re-render nahi hoga
    const { rows } = useTelemetryStore.getState()
    const ids = window.__derivedIds || Object.keys(rows)
    const filename = `RPA_Snapshot_${Date.now()}.csv`

    exportToCSV(rows, ids, filename, () => {
      setIsExporting(false)
    })
  }

  return (
    <div className="app">
      <header className="app-header">

        <h1>⚡ RPA Monitor</h1>

        {/* FPS + Memory — judges ke liye live proof */}
        {isLoaded && (
          <div style={perfStyle}>
            <span style={{ color: fps >= 50 ? '#10b981' : fps >= 30 ? '#f59e0b' : '#f43f5e' }}>
              {fps} FPS
            </span>
            {memoryMB !== null && (
              <span style={{ color: '#64748b' }}>· {memoryMB} MB</span>
            )}
          </div>
        )}

        <div className="spacer" />

        {/* Export button — current sort + filter + search ko respect karta hai */}
        {isLoaded && (
          <button
            id="export-btn"
            style={exportBtnStyle}
            onClick={handleExport}
            disabled={isExporting}
            title="Export filtered data (Ctrl+E)"
          >
            {isExporting ? '⏳ Exporting...' : '⬇ Export CSV'}
          </button>
        )}

        {isLoaded && <PauseButton />}
      </header>

      <main className="app-body">
        {!isLoaded ? (
          <Skeleton />
        ) : (
          <>
            <KPICards />
            <div className="toolbar">
              <FilterBar />
              <SearchBar />
            </div>
            <Grid onDerivedIds={ids => { window.__derivedIds = ids }} />
          </>
        )}
      </main>

      {isOpen && <AnalyticsView />}
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="skeleton-wrap">
      <div className="skeleton-title">Initializing RPA Stream...</div>
      <div className="skeleton-bar" />
      <div className="skeleton-grid">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="skeleton-row" style={{ opacity: 1 - i * 0.08 }} />
        ))}
      </div>
    </div>
  )
}

// ── Inline styles ─────────────────────────────────────────────────────────────
const perfStyle = {
  display: 'flex',
  gap: '6px',
  alignItems: 'center',
  fontSize: '12px',
  fontFamily: 'monospace',
  background: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: '6px',
  padding: '4px 10px',
}

const exportBtnStyle = {
  padding: '6px 14px',
  background: '#1e293b',
  border: '1px solid #334155',
  color: '#94a3b8',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 600,
  marginRight: '8px',
}