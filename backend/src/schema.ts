import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Seat {
    id: Int!
    row: String!
    number: Int!
    status: String!
  }

  type Query {
    seats(type: String!): [Seat!]!
  }

  type Mutation {
    bookSeats(seatIds: [Int!]!): [Seat!]!
  }
`;