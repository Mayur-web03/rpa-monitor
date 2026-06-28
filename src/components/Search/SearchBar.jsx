import React, { useState, useCallback, useRef } from 'react'
import { useUIStore } from '../../store/uiStore'

export function SearchBar() {
  const setSearch = useUIStore(s => s.setSearch)
  const [local, setLocal] = useState('')
  const timerRef = useRef(null)

  const handleChange = useCallback((e) => {
    const val = e.target.value
    setLocal(val)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setSearch(val), 150)
  }, [setSearch])

  return (
    <div className="search-wrap">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        className="search-input"
        placeholder="Fuzzy search — any order, any column..."
        value={local}
        onChange={handleChange}
      />
      {local && (
        <button
          className="search-clear"
          onClick={() => { setLocal(''); setSearch('') }}
        >×</button>
      )}
    </div>
  )
}