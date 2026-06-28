import { useEffect } from 'react'
import { useTelemetryStore } from '../store/telemetryStore'
import { useUIStore } from '../store/uiStore'

export function useKeyboardShortcuts() {
  const pause  = useTelemetryStore(s => s.pause)
  const resume = useTelemetryStore(s => s.resume)
  const isPaused = useTelemetryStore(s => s.isPaused)
  const setSearch = useUIStore(s => s.setSearch)

  useEffect(() => {
    function handler(e) {
      // Space — pause/resume
      if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault()
        isPaused ? resume() : pause()
      }
      // Escape — search clear
      if (e.code === 'Escape') {
        setSearch('')
      }
      // Ctrl+E — export
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault()
        document.getElementById('export-btn')?.click()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isPaused, pause, resume, setSearch])
}