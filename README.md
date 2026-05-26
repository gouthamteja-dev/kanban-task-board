# Kanban Task Board

A Trello-style Kanban board built with React 19, TypeScript, MUI, Apollo Client, Apollo Server, Prisma, PostgreSQL, and @dnd-kit. Organize tasks across columns with drag-and-drop, filtering, lazy-loaded cards, persistent ordering, dark mode, and optimistic updates.

🚀 **[Live Deployment Link](https://kanban-task-board-cyan-omega.vercel.app/)**  
📹 **[Video Walkthrough / Demo](https://mail.google.com/mail/u/0/?hl=en#inbox/FMfcgzQgLrzgHKJCNDcLHdbHrwDbjdvd?projector=1)** 


## Features

### Core
- **Board columns** — Default "To Do", "In Progress", "Done"; add, rename, delete columns
- **Task cards** — Title, description, priority (Low/Medium/High), due date, tags
- **Card detail modal** — Create and edit cards in a full modal
- **Drag and drop** — Move cards between columns and reorder within a column with optimistic Apollo updates
- **Persistence** — Board state saved in PostgreSQL through Apollo GraphQL
- **Lazy loading** — Board query loads columns first; cards load per column with cursor pagination
- **Search & filter** — Filter by title/description, priority, and tags

### Stretch
- **Dark mode** — Toggle with persistence
- **GraphQL patterns** — `Node` interface, `SearchResult` union, `DateTime` scalar, `@uppercase` directive, and `Card.isOverdue`
- **Seed data** — 500+ cards for testing pagination performance
- **Keyboard shortcuts** — `N` new card and `/` focus search

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Build | Vite 8 | Fast HMR, modern ESM bundling |
| UI | React 19 + TypeScript 6 | Current stable stack |
| Components | MUI 9 | Accessible, themeable, DatePicker support |
| State | Apollo Client + small Zustand UI store | Apollo cache is the server-backed source of truth; Zustand only stores local UI preferences |
| API | Apollo Server GraphQL | Schema-first API matching production stack expectations |
| Database | PostgreSQL + Prisma | Relational persistence, migrations, seed script, ordering indexes |
| DnD | @dnd-kit | React 19 compatible, maintained, accessible |
| IDs | nanoid | Lightweight unique IDs |
| Dates | dayjs | Small bundle, MUI DatePicker adapter |

## Trade-offs

- **Apollo Client over localStorage board state** — Required for Part 2; gives normalized cache, fetchMore pagination, and optimistic updates.
- **Zustand retained only for UI state** — Dark mode and filters do not need a database write on every keystroke.
- **Prisma over raw SQL** — Migrations and generated types make database setup reproducible.
- **@dnd-kit over react-beautiful-dnd** — Active maintenance and React 19 support; r-b-dnd is effectively deprecated.
- **PostgreSQL over MongoDB** — Ordering, joins, and many-to-many tags are straightforward relational data.
- **Single active board in UI** — API supports multiple boards; UI focuses on the first board for assignment scope.

## Project Structure (Atomic Design)

```
src/
├── types/           # Board, Column, Card, Tag, Priority
├── graphql/         # Apollo Client, fragments, queries, mutations, cache policies
├── store/           # Local UI-only Zustand state
├── hooks/           # Keyboard shortcuts and supporting hooks
├── theme/           # MUI light/dark themes
├── utils/           # Date helpers, priority colors
└── components/
    ├── atoms/       # AppButton, AppInput, PriorityBadge, TagChip, EmptyState
    ├── molecules/   # SearchBar, FilterBar, CardMetaRow, ConfirmDialog
    ├── organisms/   # TaskCard, KanbanColumn, BoardHeader, TaskCardModal, …
    ├── templates/   # BoardLayout
    └── pages/       # BoardPage (DndContext root)

server/
├── prisma/          # Prisma schema, SQL migration, seed script
└── src/
    ├── schema.graphql
    ├── index.ts
    ├── db/
    ├── graphql/     # Context, DataLoader, directives, cursor helpers, errors
    └── resolvers/
```

## Getting Started

### Prerequisites
- Node.js 20+
- npm 10+

### Install & run

Copy the environment template:

```bash
cp .env.example .env
```

Start PostgreSQL and the API with Docker:

```bash
docker compose up
```

In another terminal, run the Vite client:

```bash
npm install
npm run dev:client
```

Open [http://localhost:5173](http://localhost:5173). The API runs at [http://localhost:4000/graphql](http://localhost:4000/graphql).

Useful backend commands:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev:server
```

### Build

```bash
npm run build
npm run build:server
npm run preview
```

### Lint

```bash
npm run lint
```

## Deployment

### Frontend: Vercel

1. Push the repo to GitHub.
2. Import the project at [vercel.com](https://vercel.com).
3. Add `VITE_GRAPHQL_URL` pointing to the deployed API.
4. Framework preset: **Vite**; build command: `npm run build`; output: `dist`.
5. Deploy.

### Backend: Railway / Render

1. Create a PostgreSQL database.
2. Set `DATABASE_URL`, `PORT`, and `CLIENT_ORIGIN`.
3. Build command: `npm install && npm run db:generate && npm run build:server`.
4. Start command: `npm run db:deploy && npm run start:server`.

Or via CLI:

```bash
npx vercel --prod
```

## Loom Walkthrough

Record a 7–10 minute walkthrough covering:
- Atomic folder structure and why
- GraphQL schema decisions: `Node`, `SearchResult`, `DateTime`, `Priority`, and pagination connections
- Prisma models, ordering persistence, DataLoader, and seed script
- Apollo Client type policies, `fetchMore`, fragments, and optimistic drag-and-drop updates
- @dnd-kit `onDragEnd` flow
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
