import { useMemo, useRef, useState, useEffect } from 'react'
import { useTelemetryStore } from '../store/telemetryStore'
import { useUIStore } from '../store/uiStore'
import { getDerivedRowsAsync, getUniqueValues } from '../store/selectors'

const THROTTLE_MS = 400

export function useFilters() {
  const rows       = useTelemetryStore(s => s.rows)
  const rowIds     = useTelemetryStore(s => s.rowIds)
  const filters    = useUIStore(s => s.filters)
  const searchQuery = useUIStore(s => s.searchQuery)
  const sortKeys   = useUIStore(s => s.sortKeys)

  const [throttledRows, setThrottledRows] = useState(rows)
  const lastRunRef = useRef(0)
  const pendingRef = useRef(null)

  // Rows throttle — same as before
  useEffect(() => {
    const now = Date.now()
    const elapsed = now - lastRunRef.current

    if (elapsed >= THROTTLE_MS) {
      lastRunRef.current = now
      setThrottledRows(rows)
    } else {
      clearTimeout(pendingRef.current)
      pendingRef.current = setTimeout(() => {
        lastRunRef.current = Date.now()
        setThrottledRows(rows)
      }, THROTTLE_MS - elapsed)
    }

    return () => clearTimeout(pendingRef.current)
  }, [rows])

  // Async derivedIds — sort ke time UI freeze nahi hoga
  const [derivedIds, setDerivedIds] = useState(rowIds)
  const cancelRef = useRef(false)

  useEffect(() => {
    cancelRef.current = false

    getDerivedRowsAsync(throttledRows, rowIds, filters, searchQuery, sortKeys)
      .then(ids => {
        if (!cancelRef.current) setDerivedIds(ids)
      })

    return () => {
      cancelRef.current = true
    }
  }, [throttledRows, rowIds, filters, searchQuery, sortKeys])

  const departments     = useMemo(() => getUniqueValues(rows, rowIds, 'department'),      [rows, rowIds])
  const industries      = useMemo(() => getUniqueValues(rows, rowIds, 'industry'),        [rows, rowIds])
  const automationTypes = useMemo(() => getUniqueValues(rows, rowIds, 'automation_type'), [rows, rowIds])

  return { derivedIds, departments, industries, automationTypes }
}