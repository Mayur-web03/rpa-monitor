import { create } from 'zustand'

const MAX_PENDING = 500
const MAX_ROWS = 50000

let kpiTimer = null

const STRING_POOL = Object.create(null)
function intern(val) {
  if (typeof val !== 'string') return val
  const existing = STRING_POOL[val]
  if (existing !== undefined) return existing
  STRING_POOL[val] = val
  return val
}

const INTERN_FIELDS = [
  'project_status',
  'automation_type',
  'department',
  'industry',
  'country',
  'implementation_partner',
  'ai_enabled',
  'cloud_deployment'
]

function internRow(row) {
  for (let i = 0; i < INTERN_FIELDS.length; i++) {
    const f = INTERN_FIELDS[i]
    if (row[f] !== undefined) row[f] = intern(row[f])
  }
  return row
}

export const useTelemetryStore = create((set, get) => ({
  rows: {},
  rowIds: [],
  rowExists: {},
  isLoaded: false,
  isFullyLoaded: false,  
  isPaused: false,
  pendingQueue: [],
  pendingCount: 0,      
  isFlushing: false,    
  loadStartTime: Date.now(),
  kpi: { totalRows: 0, activeRobots: 0, totalSavings: 0 },

  setFullyLoaded: () => set({ isFullyLoaded: true }),   

  applyBatch: (batch) => {
    const { isPaused, pendingQueue } = get()
    if (isPaused) {
      let newQ = [...pendingQueue, ...batch]
      if (newQ.length > MAX_PENDING) newQ = newQ.slice(-MAX_PENDING)
      set({ pendingQueue: newQ, pendingCount: newQ.length })
      return
    }
    get()._mergeBatch(batch)
  },

  _mergeBatch: (batch) => {
    set(state => {
      let rows = state.rows
      let rowExists = state.rowExists
      let rowIds = state.rowIds
      let idsChanged = false
      let newIds = null

      for (let i = 0; i < batch.length; i++) {
        const row = batch[i]
        const uid = row.internal_uid
        if (!uid) continue

        internRow(row)

        if (!rowExists[uid]) {
          if (rowIds.length >= MAX_ROWS) continue

          if (!idsChanged && rows === state.rows) {
            rows = { ...state.rows }
            rowExists = { ...state.rowExists }
            newIds = []
            idsChanged = true
          }

          rowExists[uid] = true
          newIds.push(uid)
        } else if (rows === state.rows) {
          rows = { ...state.rows }
        }

        const existing = rows[uid]
        rows[uid] = existing
          ? Object.assign({}, existing, row)
          : Object.assign({}, row)
      }

      if (rows === state.rows) return state

      if (idsChanged) {
        rowIds = rowIds.concat(newIds)
      }

      scheduleKPI(rows, rowIds, set)
      return { rows, rowIds, rowExists, isLoaded: true }
    })
  },

  pause: () => set({ isPaused: true }),

  resume: () => {
    const { pendingQueue, _mergeBatch } = get()
    const queuedCount = pendingQueue.length

    
    set({ isPaused: false, pendingQueue: [], pendingCount: 0, isFlushing: queuedCount > 0 })

    if (queuedCount > 0) {
      flushInChunks(pendingQueue, _mergeBatch, () => {
        
        set({ isFlushing: false })
      })
    }
  },
}))

function scheduleKPI(rows, rowIds, setFn) {
  if (kpiTimer) return
  kpiTimer = setTimeout(() => {
    kpiTimer = null   
    try {
      const kpi = computeKPI(rows, rowIds)
      setFn({ kpi })
    } catch (err) {
      console.error('KPI compute failed:', err)
    }
  }, 500)
}

function computeKPI(rows, rowIds) {
  let totalSavings = 0
  let activeRobots = 0
  const len = rowIds.length
  for (let i = 0; i < len; i++) {
    const r = rows[rowIds[i]]
    if (!r) continue
    const savings = Number(r.annual_savings_usd)
    if (isFinite(savings)) totalSavings += savings
    if (r.project_status === 'Active') activeRobots++
  }
  return { totalRows: len, activeRobots, totalSavings }
}

function flushInChunks(queue, mergeFn, onComplete) {
  if (queue.length <= MAX_PENDING) {
    mergeFn(queue)
    setTimeout(onComplete, 100)
    return
  }

  const CHUNK = 250
  let i = 0
  function tick() {
    mergeFn(queue.slice(i, i + CHUNK))
    i += CHUNK
    if (i < queue.length) {
      requestAnimationFrame(tick)
    } else {
      onComplete()
    }
  }
  requestAnimationFrame(tick)
}