'use client';

import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { useRouter } from 'next/navigation';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/graphql` : 'http://localhost:4000/graphql',
});

const authLink = setContext((_, { headers }) => {
  // Получаем токен из localStorage только на клиенте
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
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
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
} 