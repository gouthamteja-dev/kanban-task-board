import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { resolvers } from './resolvers/index.js';
import { createContext } from './graphql/context.js';
import { applyUppercaseDirective } from './graphql/directives.js';
import { prisma } from './db/prisma.js';

const typeDefs = readFileSync(join(process.cwd(), 'server/src/schema.graphql'), 'utf8');

const schema = applyUppercaseDirective(makeExecutableSchema({ typeDefs, resolvers }));

const server = new ApolloServer({
  schema,
  introspection: true,
});

const port = Number(process.env.PORT ?? 4000);

const { url } = await startStandaloneServer(server, {
  listen: { port },
  context: createContext,
});

console.log(`GraphQL API ready at ${url}`);

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
