'use client';

import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink, from, gql } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';


const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});

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

const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  console.log('Apollo Provider initialized');
  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
} 