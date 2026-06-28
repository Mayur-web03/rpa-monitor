function escapeCSVValue(val) {
  const str = String(val ?? '')
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function exportToCSV(rows, rowIds, filename = 'rpa_export.csv', onComplete) {
  const headers = [
    'project_id', 'project_name', 'project_status',
    'automation_type', 'department', 'industry',
    'roi_percent', 'annual_savings_usd', 'budget_usd',
    'robots_deployed', 'country'
  ]

  const lines = [headers.join(',')]
  const CHUNK = 2000
  let i = 0

  function processChunk() {
    const end = Math.min(i + CHUNK, rowIds.length)

    for (; i < end; i++) {
      const r = rows[rowIds[i]]
      if (!r) continue
      lines.push(headers.map(h => escapeCSVValue(r[h])).join(','))
    }

    if (i < rowIds.length) {
      // Main thread ko breathing room do — next chunk async tick pe
      setTimeout(processChunk, 0)
    } else {
      // Sab chunks ban gaye — ab Blob banao aur download trigger karo
      const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
      if (onComplete) onComplete()
    }
  }

  processChunk()
}