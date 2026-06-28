export function startPerformanceMonitor(callback) {
  let lastTime = performance.now()
  let frames = 0
  let rafId

  function tick() {
    frames++
    const now = performance.now()
    if (now - lastTime >= 1000) {
      const fps = Math.round(frames * 1000 / (now - lastTime))
      const memory = performance.memory
        ? Math.round(performance.memory.usedJSHeapSize / 1048576)
        : null
      callback({ fps, memoryMB: memory })
      frames = 0
      lastTime = now
    }
    rafId = requestAnimationFrame(tick)
  }

  rafId = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(rafId)
}