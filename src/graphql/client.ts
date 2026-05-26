import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL ?? 'http://localhost:4000/graphql';

export const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: graphqlUrl }),
  cache: new InMemoryCache({
    typePolicies: {
      Board: {
        fields: {
          columns: {
            merge: false,
          },
          tags: {
            merge: false,
          },
        },
      },
      Column: {
        fields: {
          cards: {
            keyArgs: ['filter'],
            merge(existing = { nodes: [], edges: [] }, incoming, { args }) {
              if (!args?.after) return incoming;
              return {
                ...incoming,
                edges: [...(existing.edges ?? []), ...(incoming.edges ?? [])],
                nodes: [...(existing.nodes ?? []), ...(incoming.nodes ?? [])],
              };
            },
          },
        },
      },
      Query: {
        fields: {
          boards: {
            merge: false,
          },
          columnCards: {
            keyArgs: ['columnId', 'filter'],
            merge(existing = { nodes: [], edges: [] }, incoming, { args }) {
              if (!args?.after) return incoming;
              return {
                ...incoming,
                edges: [...(existing.edges ?? []), ...(incoming.edges ?? [])],
                nodes: [...(existing.nodes ?? []), ...(incoming.nodes ?? [])],
              };
            },
          },
        },
      },
    },
  }),
});
