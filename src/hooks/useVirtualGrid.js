import { useState, useCallback, useRef, useEffect } from 'react'
import { ROW_HEIGHT, OVERSCAN } from '../utils/constants'

export function useVirtualGrid(totalRows, containerHeight) {
  const [scrollTop, setScrollTop] = useState(0)
  const rafRef = useRef(null)

  const onScroll = useCallback((e) => {
    const top = e.currentTarget.scrollTop
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      setScrollTop(top)
    })
  }, [])

  const startIdx = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN)
  const visibleCount = Math.ceil(containerHeight / ROW_HEIGHT) + OVERSCAN * 2
  const endIdx = Math.min(totalRows - 1, startIdx + visibleCount)

  const totalHeight = totalRows * ROW_HEIGHT
  const offsetY = startIdx * ROW_HEIGHT

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [])

  return { startIdx, endIdx, totalHeight, offsetY, onScroll }
}