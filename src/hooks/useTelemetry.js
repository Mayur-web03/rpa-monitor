import { useEffect } from 'react'
import { useTelemetryStore } from '../store/telemetryStore'

export function useTelemetry() {
  const applyBatch = useTelemetryStore(s => s.applyBatch)
  const setFullyLoaded = useTelemetryStore(s => s.setFullyLoaded)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.__rpaStreamStarted) return
    window.__rpaStreamStarted = true

    let streamStarted = false

    function startStream() {
      if (streamStarted) return
      streamStarted = true

      if (window.initializeRpaStream) {
        window.initializeRpaStream((batch) => {
          applyBatch(batch)
        }, '/rpa_database_2026.csv')
      }
    }

    const worker = new Worker('/csvWorker.js')

    worker.onmessage = (e) => {
      const { type, batch } = e.data

      if (type === 'chunk') {
        applyBatch(batch)
      }

      if (type === 'done') {
        worker.terminate()
        setFullyLoaded()
        startStream()
      }

      if (type === 'error') {
        console.error('Worker error:', e.data.message)
        worker.terminate()
        setFullyLoaded()
        startStream()
      }
    }

    worker.onerror = () => {
      worker.terminate()
      setFullyLoaded()
      startStream()
    }

    worker.postMessage({ csvUrl: '/rpa_database_2026.csv' })

    return () => {
      worker.terminate()
    }
  }, [applyBatch, setFullyLoaded])
}