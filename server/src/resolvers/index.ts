import { DateTimeResolver } from 'graphql-scalars';
import { Prisma, Priority } from '@prisma/client';
import { type GraphQLContext } from '../graphql/context.js';
import { decodeCursor, encodeCursor } from '../graphql/cursor.js';
import { assertNonEmpty, badUserInput, notFound } from '../graphql/errors.js';

const DEFAULT_USER_EMAIL = 'demo.user@kanban.local';

type CardFilter = {
  priorities?: Priority[] | null;
  tagIds?: string[] | null;
  assigneeId?: string | null;
  search?: string | null;
};

function cardWhere(columnId: string, filter?: CardFilter | null): Prisma.CardWhereInput {
  const search = filter?.search?.trim();
  return {
    columnId,
    deletedAt: null,
    ...(filter?.priorities?.length ? { priority: { in: filter.priorities } } : {}),
    ...(filter?.assigneeId ? { assigneeId: filter.assigneeId } : {}),
    ...(filter?.tagIds?.length ? { tags: { some: { tagId: { in: filter.tagIds } } } } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };
}

async function getDemoUserId(ctx: GraphQLContext) {
  const user = await ctx.prisma.user.upsert({
    where: { email: DEFAULT_USER_EMAIL },
    update: {},
    create: { email: DEFAULT_USER_EMAIL, name: 'Demo User' },
  });
  return user.id;
}

async function cardConnection(ctx: GraphQLContext, columnId: string, first = 20, after?: string | null, filter?: CardFilter | null) {
  if (first < 1 || first > 50) badUserInput('first must be between 1 and 50', { field: 'first' });
  const cursor = decodeCursor(after);
  const where = cardWhere(columnId, filter);
  const cursorWhere = cursor
    ? { OR: [{ order: { gt: cursor.order } }, { order: cursor.order, id: { gt: cursor.id } }] }
    : {};

  const [totalCount, rows] = await Promise.all([
    ctx.prisma.card.count({ where }),
    ctx.prisma.card.findMany({
      where: { ...where, ...cursorWhere },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
      take: first + 1,
    }),
  ]);

  const visibleRows = rows.slice(0, first);
  const edges = visibleRows.map((node) => ({ node, cursor: encodeCursor(node.order, node.id) }));

  return {
    edges,
    nodes: visibleRows,
    totalCount,
    pageInfo: {
      startCursor: edges[0]?.cursor ?? null,
      endCursor: edges.at(-1)?.cursor ?? null,
      hasNextPage: rows.length > first,
      hasPreviousPage: Boolean(after),
    },
  };
}

async function activeColumnIds(ctx: GraphQLContext, boardId: string) {
  return ctx.prisma.column.findMany({
    where: { boardId, deletedAt: null },
    orderBy: { order: 'asc' },
    select: { id: true },
  });
}

async function normalizeCardOrders(ctx: GraphQLContext, columnId: string) {
  const cards = await ctx.prisma.card.findMany({
    where: { columnId, deletedAt: null },
    orderBy: [{ order: 'asc' }, { updatedAt: 'asc' }],
    select: { id: true },
  });
  await Promise.all(cards.map((card, order) => ctx.prisma.card.update({ where: { id: card.id }, data: { order } })));
}

export const resolvers = {
  DateTime: DateTimeResolver,

  Node: {
    __resolveType(value: { email?: string; boardId?: string; columnId?: string; color?: string; action?: string }) {
      if ('email' in value) return 'User';
      if ('action' in value) return 'AuditLog';
      if ('columnId' in value) return 'Card';
      if ('color' in value) return 'Tag';
      if ('boardId' in value) return 'Column';
      return 'Board';
    },
  },

  SearchResult: {
    __resolveType(value: { boardId?: string; columnId?: string }) {
      if ('columnId' in value) return 'Card';
      if ('boardId' in value) return 'Column';
      return 'Board';
    },
  },

  Board: {
    columns: (board: { id: string }, _args: unknown, ctx: GraphQLContext) =>
      ctx.prisma.column.findMany({ where: { boardId: board.id, deletedAt: null }, orderBy: { order: 'asc' } }),
    tags: (board: { id: string }, _args: unknown, ctx: GraphQLContext) =>
      ctx.prisma.tag.findMany({ where: { boardId: board.id }, orderBy: { label: 'asc' } }),
  },

  Column: {
    cards: (column: { id: string }, args: { first?: number; after?: string | null; filter?: CardFilter }, ctx: GraphQLContext) =>
      cardConnection(ctx, column.id, args.first, args.after, args.filter),
  },

  Card: {
    assignee: (card: { assigneeId?: string | null }, _args: unknown, ctx: GraphQLContext) =>
      card.assigneeId ? ctx.loaders.users.load(card.assigneeId) : null,
    tags: (card: { id: string }, _args: unknown, ctx: GraphQLContext) => ctx.loaders.tagsByCardId.load(card.id),
    isOverdue: (card: { dueDate?: Date | null }) => Boolean(card.dueDate && card.dueDate < new Date()),
  },

  AuditLog: {
    actor: (audit: { actorId?: string | null }, _args: unknown, ctx: GraphQLContext) =>
      audit.actorId ? ctx.loaders.users.load(audit.actorId) : null,
  },

  Query: {
    users: (_parent: unknown, _args: unknown, ctx: GraphQLContext) =>
      ctx.prisma.user.findMany({ orderBy: { name: 'asc' } }),

    boards: (_parent: unknown, _args: unknown, ctx: GraphQLContext) =>
      ctx.prisma.board.findMany({ where: { deletedAt: null }, orderBy: { order: 'asc' } }),

    board: (_parent: unknown, args: { id: string }, ctx: GraphQLContext) =>
      ctx.prisma.board.findFirst({ where: { id: args.id, deletedAt: null } }),

    node: async (_parent: unknown, args: { id: string }, ctx: GraphQLContext) =>
      (await ctx.prisma.board.findUnique({ where: { id: args.id } })) ??
      (await ctx.prisma.column.findUnique({ where: { id: args.id } })) ??
      (await ctx.prisma.card.findUnique({ where: { id: args.id } })) ??
      (await ctx.prisma.tag.findUnique({ where: { id: args.id } })) ??
      (await ctx.prisma.user.findUnique({ where: { id: args.id } })),

    columnCards: (_parent: unknown, args: { columnId: string; first?: number; after?: string | null; filter?: CardFilter }, ctx: GraphQLContext) =>
      cardConnection(ctx, args.columnId, args.first, args.after, args.filter),

    search: async (_parent: unknown, args: { boardId: string; term: string }, ctx: GraphQLContext) => {
      const term = args.term.trim();
      if (!term) return [];
      const [boards, columns, cards] = await Promise.all([
        ctx.prisma.board.findMany({ where: { id: args.boardId, deletedAt: null, title: { contains: term, mode: 'insensitive' } } }),
        ctx.prisma.column.findMany({ where: { boardId: args.boardId, deletedAt: null, title: { contains: term, mode: 'insensitive' } } }),
        ctx.prisma.card.findMany({
          where: {
            boardId: args.boardId,
            deletedAt: null,
            OR: [
              { title: { contains: term, mode: 'insensitive' } },
              { description: { contains: term, mode: 'insensitive' } },
            ],
          },
        }),
      ]);
      return [...boards, ...columns, ...cards];
    },
  },

  Mutation: {
    createBoard: async (_parent: unknown, args: { input: { title: string } }, ctx: GraphQLContext) => {
      const title = assertNonEmpty(args.input.title, 'title', 80);
      const count = await ctx.prisma.board.count({ where: { deletedAt: null } });
      return ctx.prisma.board.create({
        data: {
          title,
          order: count,
          columns: {
            create: [
              { title: 'To Do', order: 0 },
              { title: 'In Progress', order: 1 },
              { title: 'Done', order: 2 },
            ],
          },
        },
      });
    },

    updateBoard: async (_parent: unknown, args: { input: { id: string; title: string } }, ctx: GraphQLContext) =>
      ctx.prisma.board.update({ where: { id: args.input.id }, data: { title: assertNonEmpty(args.input.title, 'title', 80) } }),

    deleteBoard: (_parent: unknown, args: { id: string }, ctx: GraphQLContext) =>
      ctx.prisma.board.update({ where: { id: args.id }, data: { deletedAt: new Date() } }),

    restoreBoard: (_parent: unknown, args: { id: string }, ctx: GraphQLContext) =>
      ctx.prisma.board.update({ where: { id: args.id }, data: { deletedAt: null } }),

    createColumn: async (_parent: unknown, args: { input: { boardId: string; title: string } }, ctx: GraphQLContext) => {
      const title = assertNonEmpty(args.input.title, 'title', 50);
      const order = await ctx.prisma.column.count({ where: { boardId: args.input.boardId, deletedAt: null } });
      return ctx.prisma.column.create({ data: { boardId: args.input.boardId, title, order } });
    },

    updateColumn: (_parent: unknown, args: { input: { id: string; title: string } }, ctx: GraphQLContext) =>
      ctx.prisma.column.update({ where: { id: args.input.id }, data: { title: assertNonEmpty(args.input.title, 'title', 50) } }),

    deleteColumn: async (_parent: unknown, args: { id: string }, ctx: GraphQLContext) => {
      const deletedAt = new Date();
      return ctx.prisma.$transaction(async (tx) => {
        const column = await tx.column.update({ where: { id: args.id }, data: { deletedAt } });
        await tx.card.updateMany({ where: { columnId: args.id, deletedAt: null }, data: { deletedAt } });
        return column;
      });
    },

    restoreColumn: (_parent: unknown, args: { id: string }, ctx: GraphQLContext) =>
      ctx.prisma.column.update({ where: { id: args.id }, data: { deletedAt: null } }),

    reorderColumns: async (_parent: unknown, args: { input: { boardId: string; columnIds: string[] } }, ctx: GraphQLContext) => {
      const current = await activeColumnIds(ctx, args.input.boardId);
      const currentIds = current.map((column) => column.id).sort();
      const requestedIds = [...args.input.columnIds].sort();
      if (currentIds.join('|') !== requestedIds.join('|')) badUserInput('columnIds must include every active column exactly once');

      await ctx.prisma.$transaction(
        args.input.columnIds.map((id, order) => ctx.prisma.column.update({ where: { id }, data: { order } }))
      );
      const board = await ctx.prisma.board.findUnique({ where: { id: args.input.boardId } });
      if (!board) notFound('Board not found');
      return board;
    },

    createCard: async (_parent: unknown, args: { input: Record<string, string | string[] | null> }, ctx: GraphQLContext) => {
      const column = await ctx.prisma.column.findUnique({ where: { id: String(args.input.columnId) } });
      if (!column || column.deletedAt) notFound('Column not found');

      const title = assertNonEmpty(String(args.input.title), 'title', 100);
      const order = await ctx.prisma.card.count({ where: { columnId: column.id, deletedAt: null } });
      const card = await ctx.prisma.card.create({
        data: {
          boardId: column.boardId,
          columnId: column.id,
          title,
          description: String(args.input.description ?? ''),
          priority: args.input.priority as Priority,
          dueDate: args.input.dueDate ? new Date(String(args.input.dueDate)) : null,
          assigneeId: args.input.assigneeId ? String(args.input.assigneeId) : null,
          order,
          tags: {
            create: ((args.input.tagIds as string[] | undefined) ?? []).map((tagId) => ({ tagId })),
          },
        },
      });
      await ctx.prisma.auditLog.create({
        data: { cardId: card.id, actorId: await getDemoUserId(ctx), action: 'CREATED', message: `Created card "${card.title}"` },
      });
      return card;
    },

    updateCard: async (_parent: unknown, args: { input: Record<string, string | string[] | null | undefined> }, ctx: GraphQLContext) => {
      const id = String(args.input.id);
      const data: Prisma.CardUncheckedUpdateInput = {
        ...(args.input.title !== undefined ? { title: assertNonEmpty(String(args.input.title), 'title', 100) } : {}),
        ...(args.input.description !== undefined ? { description: String(args.input.description ?? '') } : {}),
        ...(args.input.priority !== undefined ? { priority: args.input.priority as Priority } : {}),
        ...(args.input.dueDate !== undefined ? { dueDate: args.input.dueDate ? new Date(String(args.input.dueDate)) : null } : {}),
        ...(args.input.assigneeId !== undefined ? { assigneeId: args.input.assigneeId ? String(args.input.assigneeId) : null } : {}),
      };
      return ctx.prisma.$transaction(async (tx) => {
        const card = await tx.card.update({ where: { id }, data });
        if (args.input.tagIds) {
          await tx.cardTag.deleteMany({ where: { cardId: id } });
          await tx.cardTag.createMany({ data: (args.input.tagIds as string[]).map((tagId) => ({ cardId: id, tagId })) });
        }
        return card;
      });
    },

    deleteCard: (_parent: unknown, args: { id: string }, ctx: GraphQLContext) =>
      ctx.prisma.card.update({ where: { id: args.id }, data: { deletedAt: new Date() } }),

    restoreCard: (_parent: unknown, args: { id: string }, ctx: GraphQLContext) =>
      ctx.prisma.card.update({ where: { id: args.id }, data: { deletedAt: null } }),

    moveCard: async (_parent: unknown, args: { input: { cardId: string; toColumnId: string; toIndex: number } }, ctx: GraphQLContext) => {
      const card = await ctx.prisma.card.findUnique({ where: { id: args.input.cardId } });
      const targetColumn = await ctx.prisma.column.findUnique({ where: { id: args.input.toColumnId } });
      if (!card || card.deletedAt) notFound('Card not found');
      if (!targetColumn || targetColumn.deletedAt) notFound('Target column not found');
      if (targetColumn.boardId !== card.boardId) badUserInput('Cannot move a card across boards');

      await ctx.prisma.card.update({
        where: { id: card.id },
        data: { columnId: targetColumn.id, order: Math.max(0, args.input.toIndex) },
      });
      await normalizeCardOrders(ctx, card.columnId);
      await normalizeCardOrders(ctx, targetColumn.id);
      await ctx.prisma.auditLog.create({
        data: { cardId: card.id, actorId: await getDemoUserId(ctx), action: 'MOVED', message: `Moved card "${card.title}"` },
      });
      return ctx.prisma.card.findUniqueOrThrow({ where: { id: card.id } });
    },

    reorderCards: async (_parent: unknown, args: { input: { columnId: string; cardIds: string[] } }, ctx: GraphQLContext) => {
      const cards = await ctx.prisma.card.findMany({ where: { columnId: args.input.columnId, deletedAt: null }, select: { id: true } });
      const current = cards.map((card) => card.id).sort();
      const requested = [...args.input.cardIds].sort();
      if (current.join('|') !== requested.join('|')) badUserInput('cardIds must include every active card exactly once');
      await ctx.prisma.$transaction(
        args.input.cardIds.map((id, order) => ctx.prisma.card.update({ where: { id }, data: { order } }))
      );
      return ctx.prisma.column.findUniqueOrThrow({ where: { id: args.input.columnId } });
    },

    createTag: (_parent: unknown, args: { input: { boardId: string; label: string; color: string } }, ctx: GraphQLContext) =>
      ctx.prisma.tag.create({
        data: {
          boardId: args.input.boardId,
          label: assertNonEmpty(args.input.label, 'label', 30),
          color: assertNonEmpty(args.input.color, 'color', 20),
        },
      }),

    updateTag: (_parent: unknown, args: { input: { id: string; label?: string | null; color?: string | null } }, ctx: GraphQLContext) =>
      ctx.prisma.tag.update({
        where: { id: args.input.id },
        data: {
          ...(args.input.label !== undefined ? { label: assertNonEmpty(args.input.label ?? '', 'label', 30) } : {}),
          ...(args.input.color !== undefined ? { color: assertNonEmpty(args.input.color ?? '', 'color', 20) } : {}),
        },
      }),

    deleteTag: async (_parent: unknown, args: { id: string }, ctx: GraphQLContext) => {
      const tag = await ctx.prisma.tag.findUnique({ where: { id: args.id } });
      if (!tag) notFound('Tag not found');
      await ctx.prisma.tag.delete({ where: { id: args.id } });
      return tag;
    },
  },
};
