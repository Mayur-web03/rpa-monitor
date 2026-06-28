import React, { useEffect, useRef, useMemo } from 'react'
import { Chart, registerables } from 'chart.js'
import { useTelemetryStore } from '../../store/telemetryStore'
import { useAnalyticsStore } from '../../store/analyticsStore'

Chart.register(...registerables)

// ─── Aggregation helpers ──────────────────────────────────────────────────────

function countBy(rows, key) {
  const map = {}
  for (const r of rows) {
    const v = r[key] ?? 'Unknown'
    map[v] = (map[v] ?? 0) + 1
  }
  return map
}

function avgRoiByField(rows, field) {
  const sum = {}
  const cnt = {}
  for (const r of rows) {
    const v = r[field] ?? 'Unknown'
    const roi = Number(r.roi_percent)
    if (!isFinite(roi)) continue
    sum[v] = (sum[v] ?? 0) + roi
    cnt[v] = (cnt[v] ?? 0) + 1
  }
  const result = {}
  for (const k of Object.keys(sum)) result[k] = sum[k] / cnt[k]
  return result
}

function savingsByDept(rows) {
  const map = {}
  for (const r of rows) {
    const d = r.department ?? 'Unknown'
    const s = Number(r.annual_savings_usd)
    if (!isFinite(s)) continue
    map[d] = (map[d] ?? 0) + s
  }
  return map
}

function topN(map, n = 8) {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
}

// ─── Palette ──────────────────────────────────────────────────────────────────

const PALETTE = [
  '#6366f1','#22d3ee','#f59e0b','#10b981',
  '#f43f5e','#a78bfa','#34d399','#fb923c',
  '#38bdf8','#e879f9','#4ade80','#fbbf24',
]

// ─── Chart Card ───────────────────────────────────────────────────────────────

function ChartCard({ title, canvasRef, height = '260px' }) {
  return (
    <div style={styles.card}>
      <p style={styles.cardTitle}>{title}</p>
      <div style={{ ...styles.canvasWrap, height }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}

// ─── KPI Badge ────────────────────────────────────────────────────────────────

function KpiBadge({ label, value }) {
  return (
    <div style={styles.badge}>
      <span style={styles.badgeVal}>{value}</span>
      <span style={styles.badgeLabel}>{label}</span>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AnalyticsView() {
  const close       = useAnalyticsStore(s => s.close)
  const kpi         = useTelemetryStore(s => s.kpi)
  const getSnapshot = useTelemetryStore(s => s.getSnapshot)

  const statusRef  = useRef(null)
  const deptRef    = useRef(null)
  const roiRef     = useRef(null)
  const savingsRef = useRef(null)
  const charts     = useRef([])

  // getSnapshot() — mount pe ek baar, stream paused hai toh data stale nahi hoga
  const snapshot = useMemo(() => getSnapshot(), []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Pehle purane charts destroy karo
    Object.values(charts.current).forEach(c => c?.destroy())
    charts.current = []

    // ── 1. Status Distribution — Doughnut ────────────────────────────────────
    const statusMap  = countBy(snapshot, 'project_status')
    const statusData = topN(statusMap, 8)

    charts.current.push(
      new Chart(statusRef.current, {
        type: 'doughnut',
        data: {
          labels: statusData.map(([k]) => k),
          datasets: [{
            data: statusData.map(([, v]) => v),
            backgroundColor: PALETTE,
            borderColor: '#1a1f2e',
            borderWidth: 2,
          }],
        },
        options: {
          animation: false,
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#cbd5e1',
                font: { size: 11 },
                padding: 16,
                boxWidth: 12,
              },
            },
            tooltip: {
              callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}` },
            },
          },
        },
      })
    )

    // ── 2. Savings by Department — Horizontal Bar ─────────────────────────────
    const savMap  = savingsByDept(snapshot)
    const savData = topN(savMap, 8)

    charts.current.push(
      new Chart(deptRef.current, {
        type: 'bar',
        data: {
          labels: savData.map(([k]) => k),
          datasets: [{
            label: 'Annual Savings (USD)',
            data: savData.map(([, v]) => v),
            backgroundColor: PALETTE,
            borderRadius: 4,
          }],
        },
        options: {
          animation: false,
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => ` $${(ctx.parsed.x / 1_000_000).toFixed(2)}M`,
              },
            },
          },
          scales: {
            x: {
              ticks: {
                color: '#94a3b8',
                callback: v => `$${(v / 1_000_000).toFixed(1)}M`,
              },
              grid: { color: '#1e293b' },
            },
            y: {
              ticks: { color: '#cbd5e1', font: { size: 11 } },
              grid: { display: false },
            },
          },
        },
      })
    )

    // ── 3. Avg ROI by Industry — Vertical Bar ─────────────────────────────────
    const roiMap  = avgRoiByField(snapshot, 'industry')
    const roiData = topN(roiMap, 8)

    charts.current.push(
      new Chart(roiRef.current, {
        type: 'bar',
        data: {
          labels: roiData.map(([k]) => k),
          datasets: [{
            label: 'Avg ROI %',
            data: roiData.map(([, v]) => parseFloat(v.toFixed(1))),
            backgroundColor: PALETTE,
            borderRadius: 4,
          }],
        },
        options: {
          animation: false,
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: { label: ctx => ` ${ctx.parsed.y.toFixed(1)}%` },
            },
          },
          scales: {
            x: {
              ticks: { color: '#cbd5e1', font: { size: 11 } },
              grid: { display: false },
            },
            y: {
              ticks: { color: '#94a3b8', callback: v => `${v}%` },
              grid: { color: '#1e293b' },
            },
          },
        },
      })
    )

    // ── 4. Automation Type Breakdown — Pie ────────────────────────────────────
    const typeMap  = countBy(snapshot, 'automation_type')
    const typeData = topN(typeMap, 8)

    charts.current.push(
      new Chart(savingsRef.current, {
        type: 'pie',
        data: {
          labels: typeData.map(([k]) => k),
          datasets: [{
            data: typeData.map(([, v]) => v),
            backgroundColor: PALETTE,
            borderColor: '#1a1f2e',
            borderWidth: 2,
          }],
        },
        options: {
          animation: false,
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#cbd5e1',
                font: { size: 11 },
                padding: 16,
                boxWidth: 12,
              },
            },
          },
        },
      })
    )

    return () => {
      Object.values(charts.current).forEach(c => c?.destroy())
      charts.current = []
    }
  }, [snapshot])

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) close()
  }

  return (
    <div style={styles.backdrop} onClick={handleBackdrop}>
      <div style={styles.panel}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <span style={styles.headerTitle}>📊 Analytics View</span>
            <span style={styles.headerSub}>
              Frozen snapshot — {snapshot.length.toLocaleString()} rows
            </span>
          </div>
          <div style={styles.kpiRow}>
            <KpiBadge label="Total Rows"    value={kpi.totalRows.toLocaleString()} />
            <KpiBadge label="Active Robots" value={kpi.activeRobots.toLocaleString()} />
            <KpiBadge label="Total Savings" value={`$${(kpi.totalSavings / 1_000_000).toFixed(2)}M`} />
          </div>
          <button style={styles.closeBtn} onClick={close} aria-label="Close analytics">✕</button>
        </div>

        {/* 2x2 Chart Grid */}
        <div style={styles.grid}>
          <ChartCard
            title="Project Status Distribution"
            canvasRef={statusRef}
            height="320px"
          />
          <ChartCard
            title="Annual Savings by Department"
            canvasRef={deptRef}
            height="320px"
          />
          <ChartCard
            title="Avg ROI % by Industry"
            canvasRef={roiRef}
            height="320px"
          />
          <ChartCard
            title="Automation Type Breakdown"
            canvasRef={savingsRef}
            height="320px"
          />
        </div>

      </div>
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  backdrop: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.75)',
    backdropFilter: 'blur(4px)',
    zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px',
  },
  panel: {
    background: '#0f1623',
    border: '1px solid #1e293b',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '1100px',
    maxHeight: '90vh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex', alignItems: 'center', gap: '16px',
    padding: '18px 24px',
    borderBottom: '1px solid #1e293b',
    flexWrap: 'wrap',
    position: 'sticky', top: 0,
    background: '#0f1623',
    zIndex: 1,
  },
  headerTitle: {
    fontSize: '18px', fontWeight: 700, color: '#f1f5f9',
    display: 'block',
  },
  headerSub: {
    fontSize: '12px', color: '#64748b',
    display: 'block', marginTop: '2px',
  },
  kpiRow: {
    display: 'flex', gap: '12px',
    marginLeft: 'auto', flexWrap: 'wrap',
  },
  badge: {
    background: '#1e293b', borderRadius: '8px',
    padding: '6px 14px', textAlign: 'center',
    minWidth: '90px',
  },
  badgeVal: {
    display: 'block', fontSize: '16px', fontWeight: 700, color: '#6366f1',
  },
  badgeLabel: {
    display: 'block', fontSize: '10px', color: '#64748b', marginTop: '2px',
  },
  closeBtn: {
    background: 'transparent', border: '1px solid #334155',
    color: '#94a3b8', borderRadius: '6px',
    width: '32px', height: '32px',
    cursor: 'pointer', fontSize: '14px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1px',
    background: '#1e293b',
    borderRadius: '0 0 12px 12px',
    overflow: 'hidden',
  },
  card: {
    background: '#0f1623',
    padding: '20px',
    display: 'flex', flexDirection: 'column', gap: '12px',
  },
  cardTitle: {
    margin: 0, fontSize: '13px', fontWeight: 600,
    color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  canvasWrap: {
    position: 'relative',
    width: '100%',
  },
}