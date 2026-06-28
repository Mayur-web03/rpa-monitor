export function parseCSV(text) {
  const lines = text.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  return lines.slice(1).map((line, idx) => {
    const vals = splitCSVLine(line)
    const obj = { _idx: idx }
    headers.forEach((h, i) => {
      const raw = (vals[i] || '').replace(/"/g, '').trim()
      // Numeric coercion
      const n = Number(raw)
      obj[h] = raw !== '' && !isNaN(n) ? n : raw
    })
    // Ensure id exists
    if (obj.id == null) obj.id = `row-${idx}`
    return obj
  })
}

function splitCSVLine(line) {
  const result = []
  let cur = '', inQ = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') { inQ = !inQ }
    else if (c === ',' && !inQ) { result.push(cur); cur = '' }
    else cur += c
  }
  result.push(cur)
  return result
}