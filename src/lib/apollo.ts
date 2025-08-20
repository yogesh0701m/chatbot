import { ApolloClient, InMemoryCache, split, HttpLink, from } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient as createWsClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { nhost } from './nhost';
import toast from 'react-hot-toast';

// Auth link to add authorization header
const authLink = setContext(async (_, { headers }) => {
  const token = nhost.auth.getAccessToken();
  
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    }
  };
});

// Error link for global error handling
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
      
      if (message.includes('JWTExpired') || message.includes('Unauthorized')) {
        nhost.auth.signOut();
        window.location.reload();
      } else {
        toast.error(`Error: ${message}`);
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    toast.error('Network error occurred');
  }
});

// HTTP link for queries and mutations
const httpLink = new HttpLink({
  uri: nhost.graphql.getUrl(),
});

// WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(
  createWsClient({
    url: nhost.graphql.wsUrl || '',
    connectionParams: async () => {
      const token = nhost.auth.getAccessToken();
      return {
        headers: {
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
      };
    },
    on: {
      connected: () => console.log('GraphQL WS connected'),
      error: (error) => {
        console.error('GraphQL WS error:', error);
        toast.error('Real-time connection lost');
      },
    },
  })
);

// Split link to route operations correctly
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, splitLink]),
  cache: new InMemoryCache({
  typePolicies: {
    chats: {   // NOT "Chat"
      fields: {
        messages: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
      },
    },
  },
}),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});