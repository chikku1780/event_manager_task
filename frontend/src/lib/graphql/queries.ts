import { gql } from '@apollo/client';

export const GET_EVENTS = gql`
  query GetEvents {
    events {
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

export const GET_EVENT = gql`
  query GetEvent($id: ID!) {
    event(id: $id) {
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
      attendees {
        id
        name
        email
        rsvpStatus
        createdAt
        approvedBy
        approvedAt
      }
    }
  }
`;

export const GET_ATTENDEES = gql`
  query GetAttendees($eventId: ID!) {
    attendees(eventId: $eventId) {
      id
      name
      email
      rsvpStatus
      createdAt
      approvedBy
      approvedAt
    }
  }
`;

export const SEARCH_EVENTS = gql`
  query SearchEvents($input: SearchEventsInput!) {
    searchEvents(input: $input) {
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

export const GET_TAGS = gql`
  query GetTags {
    tags {
      id
      name
      color
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    users {
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

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
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

export const GET_EVENT_MANAGERS = gql`
  query GetEventManagers {
    eventManagers {
      id
      name
      email
      role
      isActive
    }
  }
`;

export const GET_MY_EVENTS = gql`
  query GetMyEvents {
    myEvents {
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
      attendees {
        id
        name
        email
        rsvpStatus
        createdAt
        approvedBy
        approvedAt
      }
    }
  }
`;

export const GET_PENDING_ATTENDEES = gql`
  query GetPendingAttendees($eventId: ID!) {
    pendingAttendees(eventId: $eventId) {
      id
      name
      email
      rsvpStatus
      createdAt
    }
  }
`;

export const GET_ROLE_REQUESTS = gql`
  query GetRoleRequests {
    roleRequests {
      id
      userId
      requestedRole
      status
      message
      createdAt
      user {
        id
        name
        email
        role
      }
    }
  }
`; 