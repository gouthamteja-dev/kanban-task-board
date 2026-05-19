export type Priority = 'low' | 'medium' | 'high';

export interface Tag {
  id: string;
  label: string;
  color: string;
}

export interface Card {
  id: string;
  columnId: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string | null;
  tags: Tag[];
  createdAt: string;
  order: number;
}

export interface Column {
  id: string;
  title: string;
  cardIds: string[];
}

export interface Board {
  id: string;
  title: string;
  columnOrder: string[];
  columns: Record<string, Column>;
  cards: Record<string, Card>;
}

export interface FilterState {
  search: string;
  priorities: Priority[];
  tagIds: string[];
}
