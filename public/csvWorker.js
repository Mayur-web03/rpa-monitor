self.onmessage = function(e) {
  const { csvUrl } = e.data

  fetch(csvUrl)
    .then(r => r.text())
    .then(csvText => {
      const lines = csvText.trim().split('\n')
      
      const headers = lines[0].split('\t').length > lines[0].split(',').length
        ? lines[0].split('\t').map(h => h.trim())
        : lines[0].split(',').map(h => h.trim())

      const INTEGER_FIELDS = new Set([
        'employee_count','annual_revenue_usd',
        'customer_count','founded_year'
      ])

      const CHUNK = 2000
      let i = 1

      function processChunk() {
        const end = Math.min(i + CHUNK, lines.length)
        const batch = []

        for (; i < end; i++) {
          if (!lines[i].trim()) continue
          const values = lines[i].includes('\t')
            ? lines[i].split('\t')
            : lines[i].split(',')

          if (values.length !== headers.length) continue

          const row = { internal_uid: `uid-row-${i}` }
          for (let j = 0; j < headers.length; j++) {
            const h = headers[j]
            const val = values[j].trim()
            if (INTEGER_FIELDS.has(h)) {
              row[h] = parseInt(val, 10) || 0
            } else if (h === 'market_share_percent') {
              row[h] = parseFloat(val) || 0
            } else {
              row[h] = val
            }
          }
          batch.push(row)
        }

        // Har chunk main thread ko bhejo — progressive loading
        if (batch.length > 0) {
          self.postMessage({ type: 'chunk', batch })
        }

        if (i < lines.length) {
          // setTimeout — worker ka apna event loop block nahi hoga
          setTimeout(processChunk, 0)
        } else {
          self.postMessage({ type: 'done' })
        }
      }

      processChunk()
    })
    .catch(err => self.postMessage({ type: 'error', message: err.message }))
}