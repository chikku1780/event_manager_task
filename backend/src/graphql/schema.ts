import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Event {
    id: ID!
    title: String!
    date: String!
    description: String
    createdAt: String!
    updatedAt: String!
    attendees: [Attendee!]!
    tags: [Tag!]!
    attendeeCount: Int!
    createdBy: String
  }

  type Attendee {
    id: ID!
    name: String!
    email: String
    rsvpStatus: RSVPStatus!
    eventId: ID!
    createdAt: String!
    approvedBy: String
    approvedAt: String
  }

  type Tag {
    id: ID!
    name: String!
    color: String
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: UserRole!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type RoleRequest {
    id: ID!
    userId: String!
    requestedRole: UserRole!
    status: RoleRequestStatus!
    message: String
    createdAt: String!
    user: User
  }

  enum RoleRequestStatus {
    PENDING
    APPROVED
    REJECTED
  }

  enum RSVPStatus {
    PENDING
    CONFIRMED
    DECLINED
    APPROVED
    REJECTED
  }

  enum UserRole {
    USER
    EVENT_MANAGER
    ADMIN
  }

  input CreateEventInput {
    title: String!
    date: String!
    description: String
    tagIds: [ID!]
  }

  input UpdateEventInput {
    title: String!
    date: String!
    description: String
    tagIds: [ID!]
  }

  input CreateAttendeeInput {
    name: String!
    email: String
    eventId: ID!
  }

  input RequestToJoinEventInput {
    eventId: ID!
  }

  input UpdateAttendeeInput {
    id: ID!
    rsvpStatus: RSVPStatus!
  }

  input CreateUserInput {
    name: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input SearchEventsInput {
    keyword: String
    tagIds: [ID!]
  }

  input RequestRolePromotionInput {
    requestedRole: UserRole!
    message: String
  }

  type AuthResponse {
    user: User!
    token: String!
  }

  type Query {
    events: [Event!]!
    event(id: ID!): Event
    attendees(eventId: ID!): [Attendee!]!
    searchEvents(input: SearchEventsInput!): [Event!]!
    tags: [Tag!]!
    users: [User!]!
    user(id: ID!): User
    eventManagers: [User!]!
    myEvents: [Event!]!
    pendingAttendees(eventId: ID!): [Attendee!]!
    roleRequests: [RoleRequest!]!
  }

  type Mutation {
    # Event mutations
    createEvent(input: CreateEventInput!): Event!
    updateEvent(id: ID!, input: UpdateEventInput!): Event
    deleteEvent(id: ID!): Boolean!
    
    # Attendee mutations
    createAttendee(input: CreateAttendeeInput!): Attendee
    updateAttendee(input: UpdateAttendeeInput!): Attendee
    deleteAttendee(id: ID!): Boolean!
    approveAttendee(attendeeId: ID!): Attendee
    rejectAttendee(attendeeId: ID!): Attendee
    requestToJoinEvent(input: RequestToJoinEventInput!): Attendee
    
    # User mutations
    createUser(input: CreateUserInput!): User!
    login(input: LoginInput!): AuthResponse!
    updateUserRole(userId: ID!, role: UserRole!): User
    requestRolePromotion(input: RequestRolePromotionInput!): RoleRequest!
    
    # Tag mutations
    createTag(name: String!, color: String): Tag!
  }
`; 