import { type Board, type Card, type Column, type Priority, type Tag } from '../types';

export type ServerPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface GqlTag {
  __typename?: 'Tag';
  id: string;
  boardId: string;
  label: string;
  color: string;
}

export interface GqlColumn {
  __typename?: 'Column';
  id: string;
  boardId: string;
  title: string;
  order: number;
}

export interface GqlCard {
  __typename?: 'Card';
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description: string;
  priority: ServerPriority;
  dueDate: string | null;
  order: number;
  tags: GqlTag[];
  createdAt: string;
}

export interface GqlBoard {
  __typename?: 'Board';
  id: string;
  title: string;
  columns: GqlColumn[];
  tags: GqlTag[];
}

export interface CardConnection {
  nodes: GqlCard[];
  edges: Array<{ cursor: string; node: GqlCard }>;
  pageInfo: { endCursor: string | null; hasNextPage: boolean };
  totalCount: number;
}

export function toServerPriority(priority: Priority): ServerPriority {
  return priority.toUpperCase() as ServerPriority;
}

export function toClientPriority(priority: ServerPriority): Priority {
  return priority.toLowerCase() as Priority;
}

export function toClientTag(tag: GqlTag): Tag {
  return { id: tag.id, label: tag.label, color: tag.color };
}

export function toClientColumn(column: GqlColumn): Column {
  return { id: column.id, title: column.title, cardIds: [] };
}

export function toClientCard(card: GqlCard): Card {
  return {
    id: card.id,
    columnId: card.columnId,
    title: card.title,
    description: card.description,
    priority: toClientPriority(card.priority),
    dueDate: card.dueDate,
    tags: card.tags.map(toClientTag),
    createdAt: card.createdAt,
    order: card.order,
  };
}

export function toClientBoard(board: GqlBoard): Board {
  const columns = Object.fromEntries(board.columns.map((column) => [column.id, toClientColumn(column)]));
  return {
    id: board.id,
    title: board.title,
    columnOrder: board.columns.map((column) => column.id),
    columns,
    cards: {},
  };
}
