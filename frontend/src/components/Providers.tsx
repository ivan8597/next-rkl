'use client';

import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink, from, gql } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { split } from '@apollo/client/core';
import { getMainDefinition } from '@apollo/client/utilities';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});

const wsLink = typeof window !== 'undefined' 
  ? new GraphQLWsLink(
      createClient({
        url: 'ws://localhost:4000/graphql',
        connectionParams: () => {
          const token = localStorage.getItem('token');
          return {
            authToken: token,
          };
        },
      })
    )
  : null;

const authLink = setContext((_, { headers }) => {
  console.log('Setting auth headers');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  console.log('Current token:', token);
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  };
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (let err of graphQLErrors) {
      if (err.message === 'Not authenticated') {
        // Если токен недействителен, очищаем localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          window.location.href = '/auth/signin';
        }
      }
    }
  }
});

// Разделяем HTTP и WebSocket запросы
const splitLink = typeof window !== 'undefined' && wsLink != null
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      from([errorLink, authLink, httpLink])
    )
  : from([errorLink, authLink, httpLink]);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
    },
  },
});

export { client };

export function Providers({ children }: { children: React.ReactNode }) {
  console.log('Apollo Provider initialized');
  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
} 