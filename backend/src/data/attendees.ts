import { Attendee, RSVPStatus } from '../types';

export const mockAttendees: Attendee[] = [
  {
    id: '1',
    name: 'User One',
    email: 'user1@gmail.com',
    rsvpStatus: RSVPStatus.PENDING,
    eventId: '1',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'User Two',
    email: 'user2@gmail.com',
    rsvpStatus: RSVPStatus.PENDING,
    eventId: '1',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'User One',
    email: 'user1@gmail.com',
    rsvpStatus: RSVPStatus.APPROVED,
    eventId: '2',
    approvedBy: '1',
    approvedAt: '2024-01-02T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'User Two',
    email: 'user2@gmail.com',
    rsvpStatus: RSVPStatus.REJECTED,
    eventId: '3',
    approvedBy: '1',
    approvedAt: '2024-01-02T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    name: 'User Three',
    email: 'user3@gmail.com',
    rsvpStatus: RSVPStatus.PENDING,
    eventId: '2',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '6',
    name: 'User Three',
    email: 'user3@gmail.com',
    rsvpStatus: RSVPStatus.APPROVED,
    eventId: '4',
    approvedBy: '1',
    approvedAt: '2024-01-02T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z'
  }
]; 