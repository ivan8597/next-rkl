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

  enum SeatCategory {
    standard
    vip
    economy
  }

  enum BookingStatus {
    active
    expired
    cancelled
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
    id: ID!
    row: Int!
    number: Int!
    status: String!
    type: String!
    price: Int!
    category: String!
  }

  type Query {
    seats(type: String!): [Seat!]!
    me: User
    userBookings: [Booking!]!
  }

  type Mutation {
    signIn(email: String!, password: String!): AuthResponse!
    signUp(email: String!, password: String!, name: String): AuthResponse!
    bookSeats(seatIds: [String!]!, type: String!): [Seat!]!
  }

  type Booking {
    id: ID!
    seats: [Seat!]!
    userId: String!
    createdAt: String!
    status: BookingStatus!
  }

  type Subscription {
    seatUpdated(type: String!): Seat
  }
`;