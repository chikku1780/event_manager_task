import { gql } from '@apollo/client';

export const CREATE_EVENT = gql`
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) {
      id
      title
      date
      description
      createdAt
      updatedAt
      attendeeCount
      createdBy
      tags {
        id
        name
        color
      }
    }
  }
`;

export const UPDATE_EVENT = gql`
  mutation UpdateEvent($id: ID!, $input: UpdateEventInput!) {
    updateEvent(id: $id, input: $input) {
      id
      title
      date
      description
      createdAt
      updatedAt
      attendeeCount
      createdBy
      tags {
        id
        name
        color
      }
    }
  }
`;

export const DELETE_EVENT = gql`
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id)
  }
`;

export const CREATE_ATTENDEE = gql`
  mutation CreateAttendee($input: CreateAttendeeInput!) {
    createAttendee(input: $input) {
      id
      name
      email
      rsvpStatus
      eventId
      createdAt
    }
  }
`;

export const UPDATE_ATTENDEE = gql`
  mutation UpdateAttendee($input: UpdateAttendeeInput!) {
    updateAttendee(input: $input) {
      id
      name
      email
      rsvpStatus
      eventId
      createdAt
      approvedBy
      approvedAt
    }
  }
`;

export const DELETE_ATTENDEE = gql`
  mutation DeleteAttendee($id: ID!) {
    deleteAttendee(id: $id)
  }
`;

export const APPROVE_ATTENDEE = gql`
  mutation ApproveAttendee($attendeeId: ID!) {
    approveAttendee(attendeeId: $attendeeId) {
      id
      name
      email
      rsvpStatus
      eventId
      createdAt
      approvedBy
      approvedAt
    }
  }
`;

export const REJECT_ATTENDEE = gql`
  mutation RejectAttendee($attendeeId: ID!) {
    rejectAttendee(attendeeId: $attendeeId) {
      id
      name
      email
      rsvpStatus
      eventId
      createdAt
      approvedBy
      approvedAt
    }
  }
`;

export const REQUEST_TO_JOIN_EVENT = gql`
  mutation RequestToJoinEvent($input: RequestToJoinEventInput!) {
    requestToJoinEvent(input: $input) {
      id
      name
      email
      rsvpStatus
      eventId
      createdAt
    }
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
      role
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
        id
        name
        email
        role
        isActive
        createdAt
        updatedAt
      }
      token
    }
  }
`;

export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($userId: ID!, $role: UserRole!) {
    updateUserRole(userId: $userId, role: $role) {
      id
      name
      email
      role
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_TAG = gql`
  mutation CreateTag($name: String!, $color: String) {
    createTag(name: $name, color: $color) {
      id
      name
      color
    }
  }
`;

export const REQUEST_ROLE_PROMOTION = gql`
  mutation RequestRolePromotion($input: RequestRolePromotionInput!) {
    requestRolePromotion(input: $input) {
      id
      userId
      requestedRole
      status
      message
      createdAt
    }
  }
`; 