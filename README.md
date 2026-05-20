# Kanban Task Board

A Trello-style Kanban board built with React 19, TypeScript, MUI, Zustand, and @dnd-kit. Organize tasks across columns with drag-and-drop, filtering, persistence, dark mode, and undo/redo.

🚀 **[Live Deployment Link](https://kanban-task-board-cyan-omega.vercel.app/)**  
📹 **[Video Walkthrough / Demo](https://mail.google.com/mail/u/0/?hl=en#inbox/FMfcgzQgLrzgHKJCNDcLHdbHrwDbjdvd?projector=1)** 


## Features

### Core
- **Board columns** — Default "To Do", "In Progress", "Done"; add, rename, delete columns
- **Task cards** — Title, description, priority (Low/Medium/High), due date, tags
- **Card detail modal** — Create and edit cards in a full modal
- **Drag and drop** — Move cards between columns and reorder within a column (@dnd-kit)
- **Persistence** — Board state saved to `localStorage` via Zustand `persist`
- **Search & filter** — Filter by title/description, priority, and tags

### Stretch
- **Dark mode** — Toggle with persistence
- **Undo / Redo** — Last 10 board-changing actions via a manual snapshot stack in `src/store/history.ts`; `Ctrl+Z` / `Ctrl+Y`
- **Keyboard shortcuts** — `N` new card, `/` focus search, `Ctrl+Z`/`Ctrl+Y` undo/redo

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Build | Vite 8 | Fast HMR, modern ESM bundling |
| UI | React 19 + TypeScript 6 | Current stable stack |
| Components | MUI 9 | Accessible, themeable, DatePicker support |
| State | Zustand + persist + manual history stack | Selector subscriptions, localStorage, undo/redo without extra middleware |
| DnD | @dnd-kit | React 19 compatible, maintained, accessible |
| IDs | nanoid | Lightweight unique IDs |
| Dates | dayjs | Small bundle, MUI DatePicker adapter |

## Trade-offs

- **Zustand over Redux** — Less boilerplate; no server cache needed for this scope.
- **@dnd-kit over react-beautiful-dnd** — Active maintenance and React 19 support; r-b-dnd is effectively deprecated.
- **localStorage over IndexedDB** — Sufficient for JSON card data; IndexedDB for attachments later.
- **Single board in UI** — Store supports multiple boards; UI focuses on one active board for assignment scope.

## Project Structure (Atomic Design)

```
src/
├── types/           # Board, Column, Card, Tag, Priority
├── store/           # Zustand store, persist config, manual undo/redo history
├── hooks/           # useKeyboardShortcuts, useFilteredCards, useBoardActions
├── theme/           # MUI light/dark themes
├── utils/           # Date helpers, priority colors
└── components/
    ├── atoms/       # AppButton, AppInput, PriorityBadge, TagChip, EmptyState
    ├── molecules/   # SearchBar, FilterBar, CardMetaRow, ConfirmDialog
    ├── organisms/   # TaskCard, KanbanColumn, BoardHeader, TaskCardModal, …
    ├── templates/   # BoardLayout
    └── pages/       # BoardPage (DndContext root)
```

## Getting Started

### Prerequisites
- Node.js 20+
- npm 10+

### Install & run

```bash
npm install
npm run dev
```

Open the URL printed in your terminal (usually [http://localhost:5173](http://localhost:5173)). If that port is busy, Vite uses the next free port (e.g. 5174).

**Blank page or error screen?** Clear old storage in DevTools → Application → Local Storage → delete `kanban-store` and `kanban-store-v2`, then refresh. See [docs/TECH_RESEARCH.md](docs/TECH_RESEARCH.md#6-why-blank-screen-can-happen-and-how-we-fixed-it).

### Build

```bash
npm run build
npm run preview
```

### Lint

```bash
npm run lint
```

## Deployment

### Vercel (recommended)

1. Push the repo to GitHub.
2. Import the project at [vercel.com](https://vercel.com).
3. Framework preset: **Vite**; build command: `npm run build`; output: `dist`.
4. Deploy.

Or via CLI:

```bash
npx vercel --prod
```

## Loom Walkthrough

Record a 5–7 minute walkthrough covering:
- Atomic folder structure and why
- Zustand store shape, persist setup, and manual undo/redo snapshots
- @dnd-kit `onDragEnd` flow
- Filter/search implementation
- Trade-offs from this README

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `N` | New card (first column) |
| `/` | Focus search |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Redo |

## License

Private — Zemoso React assignment.
