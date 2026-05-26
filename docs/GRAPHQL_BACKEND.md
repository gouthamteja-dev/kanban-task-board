# GraphQL Backend Notes

## Schema Decisions

- `Node` interface gives every major entity a stable `id` and supports a generic `node(id)` query.
- `SearchResult` union returns `Board`, `Column`, or `Card` from one search endpoint.
- `Priority` enum prevents invalid card priorities.
- `DateTime` scalar is used for due dates and timestamps.
- `CardConnection` follows Relay-style pagination with `edges`, `nodes`, `cursor`, and `pageInfo`.
- Board queries intentionally return columns without cards. Cards are loaded lazily with `columnCards`.

## Persistence

PostgreSQL is the source of truth. Prisma owns:

- table definitions
- relations
- migrations
- indexes
- seed data

Ordering survives restarts because `Column.order` and `Card.order` are stored in the database.

## Lazy Loading

The frontend first runs `BoardQuery` to load boards, columns, and tags. Each `KanbanColumn` then runs `ColumnCards` for its own cards:

```graphql
query ColumnCards($columnId: ID!, $first: Int!, $after: String, $filter: CardFilterInput) {
  columnCards(columnId: $columnId, first: $first, after: $after, filter: $filter) {
    nodes { id title priority }
    pageInfo { endCursor hasNextPage }
  }
}
```

`fetchMore` loads the next page by passing `after: endCursor`.

## Apollo Cache

`src/graphql/client.ts` defines type policies for:

- `Board.columns`
- `Board.tags`
- `Query.boards`
- `Query.columnCards`
- `Column.cards`

The `columnCards` policy merges paginated `nodes` and `edges` when `fetchMore` is used.

## Optimistic Drag And Drop

Card drag-and-drop updates local loaded card state immediately and sends GraphQL mutations in parallel:

- `moveCard`
- `reorderCards`

The mutation includes an optimistic response so Apollo can update normalized cache entries before the server responds.

## Advanced Patterns Included

- Custom scalar: `DateTime`
- Interface: `Node`
- Union: `SearchResult`
- Enum: `Priority`
- Custom directive: `@uppercase`
- Computed field: `Card.isOverdue`
- DataLoader batching for users, boards, columns, cards, and card tags
- Cursor-based pagination
- Seed script with 500+ cards
- Docker Compose setup

## Error Handling

Resolver helpers in `server/src/graphql/errors.ts` throw typed GraphQL errors:

- `BAD_USER_INPUT`
- `NOT_FOUND`
- `FORBIDDEN`

Inputs are trimmed and validated before writes. Invalid reorders and cross-board moves are rejected.
