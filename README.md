# ⚡ RPA Monitor — High-Density Enterprise Telemetry Dashboard

A real-time, client-side RPA (Robotic Process Automation) monitoring dashboard built to handle 50,000+ live-streaming rows with zero backend dependency, custom virtualization, and full client-side analytics.

🔗 **Live Demo:** [your-vercel-url-here]
🎥 **Walkthrough Video:** [your-video-link-here]
📦 **Repo:** [your-github-url-here]

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
| **Single & Multi-Column Sort** | Click to sort, Shift+Click to stack multiple sort keys with priority indicators |
| **Pause / Resume** | Pause freezes the UI while the stream continues collecting data in the background; Resume flushes queued updates in animation-frame-batched chunks |
| **Layout Persistence** | Filters, sort order, and search state persist across page refresh via LocalStorage |
| **Dropdown Filters** | Department, Industry, Automation Type |
| **Custom Virtualized Grid** | Hand-built virtual scroller — renders only ~20–30 DOM rows regardless of dataset size (no AG Grid / react-window / TanStack Table) |
| **Fuzzy Search** | Multi-word, any-order matching across all visible fields |
| **Snapshot Export (CSV)** | Exports the *currently sorted + filtered* dataset to CSV, chunk-processed via `setTimeout` to avoid blocking the main thread, even on 50k+ rows |
| **Analytics View** | On pause, toggling "Analytics View" renders a frozen-snapshot dashboard using **Chart.js** — Status Distribution, Savings by Department, Avg ROI by Industry, and Automation Type Breakdown |

---

## 🏗️ Architecture
rpa-monitor/

├── public/

│   ├── rpa_database_2026.csv     # Static dataset (50k rows)

│   ├── dataStream.js             # Official telemetry firehose engine (200ms ticks)

│   └── csvWorker.js              # Web Worker — parses CSV off the main thread

│

├── src/

│   ├── components/

│   │   ├── Dashboard/KPICards.jsx

│   │   ├── Grid/                 # Custom virtualized grid (Grid, Header, Row, Scroller)

│   │   ├── Filters/FilterBar.jsx

│   │   ├── Search/SearchBar.jsx

│   │   ├── Analytics/AnalyticsView.jsx   # Chart.js powered analytics overlay

│   │   └── Common/PauseButton.jsx

│   │

│   ├── hooks/

│   │   ├── useTelemetry.js       # Worker-driven initial bulk load → live stream handoff

│   │   ├── useVirtualGrid.js     # Scroll-position → visible row range calculation

│   │   └── useFilters.js         # Throttled, memoized filter+search+sort pipeline

│   │

│   ├── store/

│   │   ├── telemetryStore.js     # Core state engine — rows, KPI, pause/resume, batching

│   │   ├── selectors.js          # Pure filter/search/sort derivation logic

│   │   └── uiStore.js            # UI state — sort keys, filters, search, persisted layout

│   │

│   └── utils/

│       ├── multiSort.js          # Custom multi-key comparator (no localeCompare overhead)

│       ├── fuzzySearch.js        # Any-order, multi-word matcher

│       ├── exportCSV.js          # Chunked CSV export with Blob API

│       └── formatter.js          # Currency / percent / number formatting

│

├── Architecture.md

└── package.json

---

## ⚙️ Key Engineering Decisions

### 1. Initial Bulk Load vs. Live Stream Separation
The official `dataStream.js` firehose only sends small randomized batches (5–50 rows/tick) — it does not bulk-deliver the full dataset. To avoid showing a slowly-trickling, incomplete grid on first load, a **dedicated Web Worker (`csvWorker.js`)** parses the entire CSV off the main thread and delivers it in progressive chunks. Only once the worker signals `done` does the UI unlock (`isFullyLoaded`) and the live `dataStream.js` stream is started — ensuring users always see a complete, ready dataset before any rendering happens.

### 2. Avoiding Main-Thread Re-render Storms
The live stream mutates the `rows` object reference every ~200ms. Naively subscribing to `rows` at the App root caused full-tree re-renders on every tick, tanking FPS to single digits. Fixed by:
- Removing root-level `rows` subscriptions — components only subscribe to the specific slices they need (`kpi`, `isPaused`, etc.)
- Throttling derived filter/sort/search computation (`useFilters.js`) to a fixed interval, decoupled from the raw stream tick rate
- Using `getState()` for one-off reads (e.g. CSV export) instead of reactive subscriptions

### 3. Custom Virtualization
No AG Grid, react-window, or TanStack Table. The virtual scroller calculates the visible row range from scroll position + fixed row height, rendering only the rows currently in (or near) the viewport — keeping DOM node count constant regardless of whether the dataset is 500 or 50,000 rows.

### 4. Multi-Column Sort Performance
Initial implementation used `localeCompare` with `{ numeric: true }` on every comparison, which is significantly slower than primitive comparison at scale. Replaced with a pre-computed comparator pipeline using direct numeric subtraction and plain string comparison, sorting only the already-filtered subset rather than the full 50k-row set.

### 5. Memory Stability
Verified via Chrome DevTools heap snapshots taken several minutes apart under continuous streaming — heap size fluctuates (rises with new batches, falls after GC) but does not grow unbounded, confirming no persistent memory leak under sustained load.

### 6. Client-Side Only
No server, no backend API, no Node/Express/Firebase/Supabase. CSV parsing, state management, sorting, filtering, search, and CSV export are all performed entirely in the browser — using Web Workers for CSV parsing and the Blob API for export, both to avoid blocking the main thread.

---

## 🚀 Running Locally

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173` (or the port Vite assigns).

## 📦 Build

```bash
npm run build
npm run preview
```

---

## 🧪 How to Verify Key Behaviors

- **Pause/Resume:** Pause the stream, watch the "Queued Updates" counter grow, then Resume to see it flush.
- **Multi-sort:** Click a column header, then Shift+Click another — priority indicators (▲1, ▲2) appear.
- **Fuzzy Search:** Try out-of-order multi-word queries (e.g. `Cloud Tata Completed`).
- **Layout Persistence:** Apply filters/sort, refresh the page — state restores from LocalStorage.
- **Analytics View:** Pause the stream, click "📊 Analytics View" to see a Chart.js-powered breakdown of the frozen snapshot.
- **Snapshot Export:** Apply any filter/sort, click "⬇ Export CSV" — the exported file matches exactly what's visible in the grid.

---

## 🛠️ Tech Stack

- **React 18** + **Vite**
- **Zustand** for state management
- **Chart.js** for the Analytics View (only library used for visualization, per bounty constraints)
- **Web Workers** for off-main-thread CSV parsing
- Vanilla CSS Modules — no UI component libraries

---

## 📋 Known Limitations

- ROI anomaly highlighting (negative ROI) triggers only if the source dataset contains negative `roi_percent` values — the live stream does not mutate ROI, so this depends entirely on the static CSV content.
