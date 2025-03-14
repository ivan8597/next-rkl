import gql from 'graphql-tag';

export const typeDefs = gql`
  enum SeatStatus {
    available
    booked
  }

  enum BookingError {
    ALREADY_BOOKED
    NOT_AUTHENTICATED
    TOO_MANY_SEATS
  }

  enum EventType {
    cinema
    airplane
    concert
  }

  type User {
    id: ID!
    email: String!
    name: String
  }

  type AuthResponse {
    token: String!
    user: User!
  }

  type Seat {
    id: String!
    row: Int!
    number: Int!
    status: SeatStatus!
    type: EventType!
    expiresIn: String
    userId: String
  }

  type Query {
    seats(type: String!): [Seat!]!
    me: User
  }

  type Mutation {
    signIn(email: String!, password: String!): AuthResponse!
    signUp(email: String!, password: String!, name: String): AuthResponse!
    bookSeats(seatIds: [String!]!, type: String!): [Seat!]!
  }
`;