import { prisma } from '../db/prisma.js';
import { createLoaders, type Loaders } from './loaders.js';

export interface GraphQLContext {
  prisma: typeof prisma;
  loaders: Loaders;
  currentUserId: string | null;
}

export async function createContext(): Promise<GraphQLContext> {
  return {
    prisma,
    loaders: createLoaders(prisma),
    currentUserId: null,
  };
}
