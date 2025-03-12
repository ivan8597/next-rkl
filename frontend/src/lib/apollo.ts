import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { gql } from '@apollo/client';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',  // Явно указываем URL
  credentials: 'include'
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only'
    }
  }
});

// Проверяем подключение
client.query({
  query: gql`
    query TestConnection {
      seats(type: "cinema") {
        id
      }
    }
  `
}).then(() => {
  console.log('GraphQL connected successfully');
}).catch(error => {
  console.error('GraphQL connection error:', error);
}); 