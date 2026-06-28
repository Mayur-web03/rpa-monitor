import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUIStore = create(
  persist(
    (set, get) => ({
      // Sorting: array of { col, dir } - multi sort
      sortKeys: [],

      // Filters
      filters: { department: '', industry: '', automationType: '' },

      // Search
      searchQuery: '',

      // Widget visibility
      widgets: {
        kpi: true,
        filters: true,
        search: true,
        grid: true,
      },

      // Actions
      toggleSort: (col, isMulti) => {
        set(state => {
          const keys = [...state.sortKeys]
          const idx = keys.findIndex(k => k.col === col)
          if (isMulti) {
            if (idx === -1) {
              keys.push({ col, dir: 'asc' })
            } else if (keys[idx].dir === 'asc') {
              keys[idx] = { col, dir: 'desc' }
            } else {
              keys.splice(idx, 1)
            }
          } else {
            if (idx === -1 || keys.length > 1) {
              return { sortKeys: [{ col, dir: 'asc' }] }
            } else if (keys[0].dir === 'asc') {
              return { sortKeys: [{ col, dir: 'desc' }] }
            } else {
              return { sortKeys: [] }
            }
          }
          return { sortKeys: keys }
        })
      },

      setFilter: (key, value) =>
        set(state => ({ filters: { ...state.filters, [key]: value } })),

      setSearch: (q) => set({ searchQuery: q }),

      toggleWidget: (key) =>
        set(state => ({
          widgets: { ...state.widgets, [key]: !state.widgets[key] }
        })),
    }),
    {
      name: 'rpa-ui-state',
      partialize: (state) => ({ widgets: state.widgets, sortKeys: state.sortKeys }),
    }
  )
)