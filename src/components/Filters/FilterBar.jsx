import React from 'react'
import { useUIStore } from '../../store/uiStore'
import { useFilters } from '../../hooks/useFilters'

export function FilterBar() {
  const filters = useUIStore(s => s.filters)
  const setFilter = useUIStore(s => s.setFilter)
  const { departments, industries, automationTypes } = useFilters()

  const clearAll = () => {
    setFilter('department', '')
    setFilter('industry', '')
    setFilter('automationType', '')
  }

  const hasFilter = filters.department || filters.industry || filters.automationType

  return (
    <div className="filter-bar">
      <Select label="Department"  value={filters.department}     onChange={v => setFilter('department', v)}     options={departments} />
      <Select label="Industry"    value={filters.industry}       onChange={v => setFilter('industry', v)}       options={industries} />
      <Select label="Type"        value={filters.automationType} onChange={v => setFilter('automationType', v)} options={automationTypes} />
      {hasFilter && (
        <button className="btn btn-ghost" onClick={clearAll}>✕ Clear</button>
      )}
    </div>
  )
}

function Select({ label, value, onChange, options }) {
  return (
    <select className="filter-select" value={value} onChange={e => onChange(e.target.value)}>
      <option value="">All {label}s</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}