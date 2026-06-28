# ⚡ RPA Monitor — High-Density Enterprise Telemetry Dashboard

A real-time, client-side RPA (Robotic Process Automation) monitoring dashboard built to handle 50,000+ live-streaming rows with zero backend dependency, custom virtualization, and full client-side analytics.

🔗 **Live Demo:** [https://rpa-monitor-one.vercel.app/](https://rpa-monitor-one.vercel.app/)
📦 **Repo:** [https://github.com/Mayur-web03/rpa-monitor](https://github.com/Mayur-web03/rpa-monitor)

---

## 🎯 Overview

This project simulates a high-frequency enterprise telemetry pipeline — 50,000 RPA project records streamed live at 200ms intervals, fully processed and rendered on the client side with no server, no backend API, and no third-party grid libraries.

Built entirely with **React + Zustand + Vite**, using a **hand-rolled virtual scroller**, **custom multi-column sort engine**, and **fuzzy search**, optimized for sustained 50+ FPS performance even under continuous live data mutation.

---

## ✨ Features

| Feature | Details |
|---|---|
| **Live KPI Dashboard** | Total Rows, Active Robots, Total Savings — updates in real time, throttled to avoid main-thread overload |
| **Number Formatting** | Currency (`$1,234,567`), Percentage (`23.45%`), comma-formatted counts |
| **Alerts & Highlighting** | Rows auto-highlight on `Failed` status or negative ROI, with tooltip explanation |
| **Single & Multi-Column Sort** | Click to sort; **Shift+Click** to stack multiple sort keys with priority indicators (▲1, ▲2) |
| **Pause / Resume** | Pause freezes the UI while the stream continues collecting data in a background queue; Resume flushes queued updates in animation-frame-batched chunks |
| **Layout Persistence** | Filters, sort order, and search state persist across page refresh via LocalStorage |
| **Dropdown Filters** | Department, Industry, Automation Type |
| **Custom Virtualized Grid** | Hand-built virtual scroller — renders only ~20–30 DOM rows regardless of dataset size. **No AG Grid, react-window, or TanStack Table.** |
| **Fuzzy Search** | Multi-word, any-order matching across all visible fields (e.g. `Cloud Tata Completed`) |
| **Snapshot Export (CSV)** | Exports the *currently sorted + filtered* dataset to CSV, chunk-processed via `setTimeout` to avoid blocking the main thread |
| **Analytics View** | On pause, toggling "📊 Analytics View" renders a frozen-snapshot dashboard using **Chart.js** — Status Distribution, Savings by Department, Avg ROI by Industry, Automation Type Breakdown |

---

## 🏗️ Architecture
rpa-monitor/

├── public/

│   ├── rpa_database_2026.csv     # Static dataset (50k rows)

│   ├── dataStream.js             # Telemetry firehose engine (200ms ticks)

│   └── csvWorker.js              # Web Worker — parses CSV off the main thread

│

├── src/

│   ├── components/

│   │   ├── Dashboard/KPICards.jsx

│   │   ├── Grid/                 # Custom virtualized grid (Grid, Header, Row, Scroller)

│   │   ├── Filters/FilterBar.jsx

│   │   ├── Search/SearchBar.jsx

│   │   ├── Analytics/AnalyticsView.jsx   # Chart.js analytics overlay

│   │   └── Common/PauseButton.jsx

│   │

│   ├── hooks/

│   │   ├── useTelemetry.js       # Worker-driven bulk load → live stream handoff

│   │   ├── useVirtualGrid.js     # Scroll-position → visible row range

│   │   └── useFilters.js         # Throttled, async filter+search+sort pipeline

│   │

│   ├── store/

│   │   ├── telemetryStore.js     # Core state — rows, KPI, pause/resume, batching

│   │   ├── selectors.js          # Pure filter/search/sort derivation logic

│   │   └── uiStore.js            # UI state — sort keys, filters, search, persistence

│   │

│   └── utils/

│       ├── multiSort.js          # Custom multi-key comparator (no localeCompare overhead)

│       ├── fuzzySearch.js        # Any-order, multi-word matcher

│       ├── exportCSV.js          # Chunked CSV export with Blob API

│       └── formatter.js          # Currency / percent / number formatting

---

## ⚙️ Key Engineering Decisions

### 1. Initial Bulk Load vs. Live Stream Separation
The official `dataStream.js` firehose only sends small randomized batches (5–50 rows/tick) — it does not bulk-deliver the full dataset. To avoid a slowly-trickling grid on first load, a **dedicated Web Worker (`csvWorker.js`)** parses the entire CSV off the main thread in progressive chunks. Only once the worker signals `done` does the UI unlock (`isFullyLoaded`) and the live stream start — ensuring users always see a complete dataset before any interaction.

### 2. Avoiding Main-Thread Re-render Storms
The live stream mutates state every ~200ms. Naively subscribing to `rows` at the App root caused full-tree re-renders on every tick, dropping FPS to single digits. Fixed by:
- Components subscribe only to the specific slices they need (`kpi`, `isPaused`, etc.) — not the full `rows` object
- Derived filter/sort/search computation (`useFilters.js`) is throttled to a fixed interval, decoupled from the raw stream tick rate
- `getState()` used for one-off reads (e.g. CSV export) instead of reactive subscriptions

### 3. Custom Virtualization — No Libraries
**Virtualization, Sorting, and Search are entirely custom-coded with zero external dependencies for these functions.**
The virtual scroller calculates visible row range from scroll position + fixed row height, keeping DOM node count constant (~20–30 nodes) regardless of whether the dataset is 500 or 50,000 rows.

### 4. Non-Blocking Async Sort Engine
Sorting 50k rows synchronously on the main thread freezes the UI. The custom `multiSort` engine:
- Uses a pre-computed comparator pipeline with direct numeric subtraction and plain string comparison (no `localeCompare` overhead — significantly faster at scale)
- For datasets exceeding 10,000 rows, sort is deferred via `setTimeout(0)` — yielding the main thread before executing, keeping interactions responsive
- Sorts only the already-filtered subset, not the full 50k row set
- **Multi-column sort:** Click any column header to sort; **Shift+Click** additional headers to stack sort keys. Priority order shown with indicators (▲1, ▲2, ▲3)

### 5. Queue-Based Pause/Resume with Instant KPI Sync
When paused, incoming stream batches are pushed into a `pendingQueue` (capped at 500 entries) rather than discarded. On pause, KPI is recomputed instantly from current rows — no stale 500ms debounce. On resume, the queue is flushed in `requestAnimationFrame`-batched chunks to prevent a single large re-render.

### 6. Analytics View — Memory-Safe Chart.js Integration
The Analytics overlay renders a frozen snapshot of data taken at pause-time (`getSnapshot()`), ensuring charts never reflect mid-stream state. All Chart.js instances are stored in a ref array and explicitly destroyed (`chart.destroy()`) both on re-render and unmount — preventing the canvas memory leaks that Chart.js is known for. `animation: false` is set on all charts for immediate render performance on large datasets.

### 7. String Interning for Memory Stability
Repetitive string values (`"COMPLETED"`, `"Finance"`, `"Email Automation"`) were creating millions of duplicate heap allocations under continuous streaming. A global `STRING_POOL` interns these values on first write — subsequent rows reuse the same reference, confirmed via Chrome DevTools heap snapshots showing stable, non-growing string counts.

### 8. Client-Side Only
No server, no backend API, no Node/Express/Firebase/Supabase. CSV parsing, state management, sorting, filtering, search, and export all run in the browser — Web Workers for parsing, Blob API for export.

---

## 🚀 Running Locally

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`

## 📦 Build

```bash
npm run build
npm run preview
```

---

## 🧪 How to Verify Key Behaviors

- **Pause/Resume:** Pause the stream, watch the "Queued Updates" counter grow, then Resume to see it flush
- **Multi-sort:** Click a column header, then **Shift+Click** another — priority indicators (▲1, ▲2) appear on headers
- **Fuzzy Search:** Try out-of-order multi-word queries like `Cloud Tata Completed`
- **Layout Persistence:** Apply filters/sort, refresh the page — state restores from LocalStorage
- **Analytics View:** Pause the stream, click "📊 Analytics View" to see Chart.js breakdown of the frozen snapshot
- **Snapshot Export:** Apply any filter/sort, click "⬇ Export CSV" — exported file matches exactly what's visible in the grid

---

## 🛠️ Tech Stack

- **React 18** + **Vite**
- **Zustand** — state management
- **Chart.js** — Analytics View only (only visualization library used)
- **Web Workers** — off-main-thread CSV parsing
- Vanilla CSS Modules — zero UI component libraries

---

## 📋 Known Limitations

- ROI anomaly highlighting triggers only if the source dataset contains negative `roi_percent` values — the live stream does not mutate ROI, so this depends on static CSV content

---
*Made with ❤️ for Frontend Battle *Virtualization, Sorting, and Search are custom-coded — **no AG Grid, react-window, or TanStack Table used**
