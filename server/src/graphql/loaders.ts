import DataLoader from 'dataloader';
import { type PrismaClient } from '@prisma/client';

function mapById<T extends { id: string }>(rows: T[]) {
  return new Map(rows.map((row) => [row.id, row]));
}

export function createLoaders(prisma: PrismaClient) {
  return {
    users: new DataLoader(async (ids: readonly string[]) => {
      const rows = await prisma.user.findMany({ where: { id: { in: [...ids] } } });
      const byId = mapById(rows);
      return ids.map((id) => byId.get(id) ?? null);
    }),
    boards: new DataLoader(async (ids: readonly string[]) => {
      const rows = await prisma.board.findMany({ where: { id: { in: [...ids] } } });
      const byId = mapById(rows);
      return ids.map((id) => byId.get(id) ?? null);
    }),
    columns: new DataLoader(async (ids: readonly string[]) => {
      const rows = await prisma.column.findMany({ where: { id: { in: [...ids] } } });
      const byId = mapById(rows);
      return ids.map((id) => byId.get(id) ?? null);
    }),
    cards: new DataLoader(async (ids: readonly string[]) => {
      const rows = await prisma.card.findMany({ where: { id: { in: [...ids] } } });
      const byId = mapById(rows);
      return ids.map((id) => byId.get(id) ?? null);
    }),
    tagsByCardId: new DataLoader(async (cardIds: readonly string[]) => {
      const rows = await prisma.cardTag.findMany({
        where: { cardId: { in: [...cardIds] } },
        include: { tag: true },
      });
      return cardIds.map((cardId) => rows.filter((row) => row.cardId === cardId).map((row) => row.tag));
    }),
  };
}

export type Loaders = ReturnType<typeof createLoaders>;
