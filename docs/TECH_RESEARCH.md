# Kanban Task Board — Technology Research & Project Guide

> **Audience:** Freshers and reviewers who want to understand this project from scratch.  
> **Goal:** Explain *what* we used, *why* we chose it over alternatives, and *where* it lives in the codebase — with proof you can verify.

---

## Table of Contents

1. [What is this project?](#1-what-is-this-project)
2. [How to run it](#2-how-to-run-it)
3. [Folder structure (every important file)](#3-folder-structure-every-important-file)
4. [Tool-by-tool breakdown](#4-tool-by-tool-breakdown)
5. [Architecture flow](#5-architecture-flow)
6. [Why blank screen can happen (and how we fixed it)](#6-why-blank-screen-can-happen-and-how-we-fixed-it)
7. [Proof & references](#7-proof--references)

---

## 1. What is this project?

A **Kanban board** is a visual task board (like Trello). Tasks live in **columns** (To Do → In Progress → Done). Users can:

- Add, edit, delete **cards** (tasks)
- Drag cards between columns
- Search and filter cards
- Undo/redo changes
- Toggle dark mode

Everything runs in the **browser** — no backend server. Data is saved in **localStorage** so it survives page refresh.

---

## 2. How to run it

```bash
npm install
npm run dev
```

**Important:** Check the terminal output for the actual URL.

- Default port: `http://localhost:5173`
- If 5173 is already used by another app, Vite automatically uses **5174** (or the next free port).

Example terminal output:

```
➜  Local:   http://localhost:5174/
```

Open **that exact URL** in your browser.

**Still blank?** Open DevTools (F12) → Application → Local Storage → delete `kanban-store` → refresh. Old corrupted data can block the UI.

---

## 3. Folder structure (every important file)

```
kanban-task-board/
├── index.html              # HTML shell; loads main.tsx
├── vite.config.ts          # Vite dev server & build settings
├── package.json            # Dependencies list
├── docs/
│   └── TECH_RESEARCH.md    # This document
└── src/
    ├── main.tsx            # Entry point — mounts React into #root
    ├── App.tsx             # Theme + hydration + ErrorBoundary + BoardPage
    ├── index.css           # Global CSS (full height, box-sizing)
    │
    ├── types/index.ts      # TypeScript shapes: Card, Column, Board, Tag
    │
    ├── theme/index.ts      # MUI light/dark theme colors & fonts
    │
    ├── store/boardStore.ts # ALL app data + actions (Zustand)
    │
    ├── utils/
    │   ├── helpers.ts      # Date format, priority colors, tag colors
    │   └── storeRepair.ts  # Fixes broken localStorage on load
    │
    ├── hooks/
    │   ├── useKeyboardShortcuts.ts  # N, /, Ctrl+Z, Ctrl+Y
    │   ├── useFilteredCards.ts      # Filtered card IDs per column
    │   └── useBoardActions.ts       # Shortcut to store actions
    │
    └── components/         # Atomic Design
        ├── atoms/          # Smallest UI pieces
        ├── molecules/      # Small combinations
        ├── organisms/      # Full features (column, card, header)
        ├── templates/      # Page layout shell
        └── pages/          # Full screen (BoardPage)
```

### What each layer means (Atomic Design)

| Layer | Meaning | Example in our app |
|-------|---------|-------------------|
| **Atom** | One small UI element | `PriorityBadge`, `AppButton` |
| **Molecule** | Atoms combined | `SearchBar`, `ConfirmDialog` |
| **Organism** | A complete feature block | `KanbanColumn`, `TaskCard` |
| **Template** | Page layout without full logic | `BoardLayout` |
| **Page** | Real screen users see | `BoardPage` |

---

## 4. Tool-by-tool breakdown

### 4.1 React 19

| | |
|---|---|
| **What** | A JavaScript library to build UI using **components** (reusable pieces) and **state** (data that changes). |
| **Why we chose it** | Required by assignment; industry standard for SPAs; huge ecosystem. |
| **Alternatives** | Vue, Angular, Svelte |
| **Why not alternatives** | Assignment specifies React; team hiring and docs are React-heavy in most companies. |
| **Where used** | Entire `src/` folder — every `.tsx` file. |
| **Proof** | [react.dev](https://react.dev) — official docs; npm weekly downloads ~20M+ for `react`. |

**File example:** `src/components/organisms/TaskCard/index.tsx` — renders one card and reacts when data changes.

---

### 4.2 TypeScript

| | |
|---|---|
| **What** | JavaScript + **types** (rules for data shape). Catches mistakes before runtime. |
| **Why we chose it** | Safer refactors; self-documenting code (`Card`, `Board` interfaces). |
| **Alternatives** | Plain JavaScript, Flow |
| **Why not alternatives** | TypeScript is the default for new React projects in 2024–2026. |
| **Where used** | All `.ts` / `.tsx` files; especially `src/types/index.ts`. |
| **Proof** | [typescriptlang.org](https://www.typescriptlang.org); State of JS surveys show TS dominance in frontend. |

**File example:** `src/types/index.ts` defines what a `Card` must contain (title, priority, tags, etc.).

---

### 4.3 Vite 8

| | |
|---|---|
| **What** | **Build tool** — starts dev server (HMR) and bundles app for production. |
| **Why we chose it** | Required by assignment; much faster than older Create React App (Webpack). |
| **Alternatives** | Create React App (deprecated), Webpack, Parcel |
| **Why not CRA** | CRA is officially deprecated; Vite is recommended by React team for new apps. |
| **Where used** | `vite.config.ts`, `npm run dev`, `npm run build`. |
| **Proof** | [vite.dev](https://vite.dev); React docs list Vite as primary scaffolding option. |

---

### 4.4 MUI (Material UI) 9

| | |
|---|---|
| **What** | Pre-built **React UI components** (buttons, dialogs, inputs) following Material Design. |
| **Why we chose it** | Assignment preference; saves time; built-in **dark mode** via `ThemeProvider`. |
| **Alternatives** | Chakra UI, Ant Design, Tailwind + headless UI, plain CSS |
| **Why not Tailwind-only** | More setup for modals, date pickers, accessibility; MUI ships DatePicker integration. |
| **Where used** | All components; `src/theme/index.ts`; `App.tsx` wraps `ThemeProvider`. |
| **Proof** | [mui.com](https://mui.com) — used by thousands of production apps; npm `@mui/material` ~4M weekly downloads. |

**File example:** `TaskCardModal` uses MUI `Dialog`, `Select`, and `@mui/x-date-pickers` for due date.

---

### 4.5 Emotion (`@emotion/react`, `@emotion/styled`)

| | |
|---|---|
| **What** | CSS-in-JS library MUI uses internally for styling. |
| **Why we chose it** | **Required peer dependency** of MUI — not optional. |
| **Where used** | Automatically when you use MUI `sx={{ ... }}` props. |
| **Proof** | [MUI installation guide](https://mui.com/material-ui/getting-started/installation/) lists Emotion as default. |

---

### 4.6 Zustand

| | |
|---|---|
| **What** | Small **state management** library — one global store, components subscribe to slices. |
| **Why we chose it** | Kanban has many cards; **Context** would re-render too much; **Redux** is heavy for a client-only app. |
| **Alternatives** | Redux Toolkit, React Context, Jotai, Recoil |
| **Why not Redux** | No server/API cache needed; Redux adds boilerplate (actions, reducers) without benefit here. |
| **Why not Context alone** | One big context = every card re-renders on any change → slow with 50+ cards. |
| **Where used** | `src/store/boardStore.ts` — all boards, columns, cards, filters, dark mode. |
| **Proof** | [zustand.docs.pmnd.rs](https://zustand.docs.pmnd.rs); used by many startups; GitHub 55k+ stars; recommended in 2024–2025 React state comparisons for medium apps. |

**How it works (simple):**

```text
User clicks "Add card"
  → calls addCard() in boardStore
  → store updates
  → only components using that data re-render
```

---

### 4.7 Manual undo/redo history

| | |
|---|---|
| **What** | A small in-memory snapshot history for **undo/redo**. It stores the last 10 board-changing states. |
| **Why we chose it** | The app only needs local board history, so a simple stack is easier to reason about than temporal middleware. It also avoids persist/hydration conflicts. |
| **Alternatives** | zundo, Redux-undo, reducer-based history |
| **Where used** | `src/store/history.ts` stores snapshots; `boardStore.ts` calls `pushHistory`, `popUndo`, and `popRedo`; `BoardHeader` shows undo/redo buttons. |
| **Limit** | `MAX_HISTORY = 10`, so users can undo up to 10 board-changing operations. Redo is available for the operations that were just undone, until a new board change clears the redo stack. |

**How it works:**

```text
User performs a board-changing action
  → boardStore calls commitBoardChange()
  → current boards + activeBoardId are deep-cloned into undoStack
  → action updates Zustand state
  → redoStack is cleared

User clicks Undo / presses Ctrl+Z
  → current state is pushed into redoStack
  → last undoStack snapshot is restored

User clicks Redo / presses Ctrl+Y
  → current state is pushed back into undoStack
  → last redoStack snapshot is restored
```

---

### 4.8 Zustand `persist` middleware

| | |
|---|---|
| **What** | Saves chosen store fields to **localStorage** and restores on refresh. |
| **Why we chose it** | Assignment requires persistence without a backend. |
| **Alternatives** | Manual `localStorage.setItem`, IndexedDB, Dexie |
| **Why not IndexedDB** | Overkill for JSON text data; localStorage is simpler for assignment scope. |
| **Where used** | `boardStore.ts` — persists `boards`, `activeBoardId`, `darkMode`. |
| **Proof** | [Zustand persist docs](https://zustand.docs.pmnd.rs/integrations/persisting-store-data). |

---

### 4.9 @dnd-kit

| | |
|---|---|
| **What** | Modern **drag-and-drop** library for React (columns, sortable lists). |
| **Why we chose it** | Assignment allows @dnd-kit or react-beautiful-dnd; **r-b-dnd is deprecated** and has React 18/19 issues. |
| **Alternatives** | react-beautiful-dnd, react-dnd, HTML5 drag API |
| **Why not react-beautiful-dnd** | Atlassian archived it; no React 19 support; Strict Mode bugs. |
| **Where used** | `BoardPage` — `DndContext`; `TaskCard` — `useSortable`; `KanbanColumn` — `useDroppable`. |
| **Proof** | [dndkit.com](https://dndkit.com); r-b-dnd repo README states maintenance mode / archive. |

**Flow:**

```text
BoardPage (DndContext)
  └── KanbanColumn (droppable column)
        └── TaskCard (sortable card)
  └── DragOverlay (ghost while dragging)
```

---

### 4.10 dayjs

| | |
|---|---|
| **What** | Small library to **format and compare dates** (e.g. "due in 2 days"). |
| **Why we chose it** | Required by MUI DatePicker; smaller than moment.js. |
| **Alternatives** | date-fns, moment.js (legacy, large) |
| **Where used** | `utils/helpers.ts`, `TaskCardModal`, `CardMetaRow` (overdue styling). |
| **Proof** | [day.js.org](https://day.js.org); MUI X Date Pickers docs recommend dayjs adapter. |

---

### 4.11 nanoid

| | |
|---|---|
| **What** | Generates **unique IDs** for cards, columns, tags. |
| **Why we chose it** | Tiny; URL-safe; better than `Math.random()` for keys. |
| **Alternatives** | uuid, crypto.randomUUID() |
| **Where used** | `boardStore.ts` when creating boards/cards/tags. |
| **Proof** | [github.com/ai/nanoid](https://github.com/ai/nanoid) — 2KB, widely used with React lists. |

---

## 5. Architecture flow

```text
Browser loads index.html
    → main.tsx mounts <App />
        → App waits for localStorage hydration
        → ThemeProvider (MUI light/dark)
        → BoardPage
            → BoardHeader (search, filter, undo, dark mode)
            → KanbanColumn × N
                → TaskCard × N
            → TaskCardModal (create/edit)
            → AddColumnDialog

All data changes go through boardStore (Zustand)
    → persist saves to localStorage
    → store/history.ts records undo/redo snapshots for board-changing actions
```

---

## 6. Why blank screen can happen (and how we fixed it)

| Cause | What happened | Fix |
|-------|---------------|-----|
| Wrong port | Another app uses 5173; Vite uses 5174 | Read terminal URL; `vite.config.ts` sets port 5173 with `strictPort: false` |
| Bad localStorage | `activeBoardId` points to deleted board | `storeRepair.ts` + `merge` / `onRehydrateStorage` in persist |
| Hydration race | UI renders before storage loads | `App.tsx` shows spinner until `persist.hasHydrated()` |
| Infinite update loop | Temporal history middleware + persist hydration fought each other; unstable DnD `items` array | Use manual undo/redo in `store/history.ts`; `useShallow` on filtered card IDs |
| Crash in column | `cards` was undefined | `cards ?? {}` in `KanbanColumn` |
| Uncaught error | Any runtime error whites screen | `ErrorBoundary` with reset button |

---

## 7. Proof & references

| Claim | Source |
|-------|--------|
| React is industry standard | [react.dev](https://react.dev), npm trends |
| CRA deprecated | [react.dev blog - sunsetting CRA](https://react.dev/blog/2025/02/14/sunsetting-create-react-app) |
| Vite recommended | [vite.dev](https://vite.dev), React installation docs |
| react-beautiful-dnd deprecated | [GitHub atlassian/react-beautiful-dnd](https://github.com/atlassian/react-beautiful-dnd) — archived |
| @dnd-kit maintained | [dndkit.com](https://dndkit.com), active releases 2024–2026 |
| Zustand for client state | [Zustand docs](https://zustand.docs.pmnd.rs), community comparisons (Poimandres ecosystem) |
| MUI enterprise usage | [mui.com](https://mui.com), customer case studies |
| localStorage limits | ~5MB per origin — sufficient for text-only Kanban data |

---

## Quick interview answers

**Q: Why Zustand over Redux?**  
A: No server cache or middleware needed. Zustand gives selector-based subscriptions with less code.

**Q: Why @dnd-kit over react-beautiful-dnd?**  
A: r-b-dnd is archived and breaks on React 19. @dnd-kit is maintained and accessible.

**Q: Why Atomic Design?**  
A: Clear folder rules — juniors know where to add a button (atom) vs a full column (organism).

**Q: Where is state stored?**  
A: In memory via Zustand; copied to `localStorage` by `persist` middleware under key `kanban-store-v2`.

---

*Document version: 1.0 — matches codebase as of project completion.*
