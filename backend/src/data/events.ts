import { Event } from '../types';

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Tech Conference 2024',
    date: '2024-03-15T09:00:00Z',
    description: 'Annual technology conference featuring the latest innovations in software development, AI, and cloud computing. Join us for networking, workshops, and keynote presentations.',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    attendees: [],
    tags: [], // Will be populated by service
    createdBy: '1'
  },
  {
    id: '2',
    title: 'Team Building Workshop',
    date: '2024-02-20T14:00:00Z',
    description: 'Interactive team building activities to improve collaboration and communication skills. Perfect for teams looking to strengthen their bonds.',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    attendees: [],
    tags: [], // Will be populated by service
    createdBy: '1'
  },
  {
    id: '3',
    title: 'Design Sprint Workshop',
    date: '2024-02-28T10:00:00Z',
    description: 'Learn the Google Design Sprint methodology. This intensive workshop will teach you how to solve big problems and test new ideas in just five days.',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    attendees: [],
    tags: [], // Will be populated by service
    createdBy: '1'
  },
  {
    id: '4',
    title: 'Annual Company Meeting',
    date: '2024-03-01T16:00:00Z',
    description: 'Join us for our annual company-wide meeting where we\'ll discuss achievements, goals, and future plans. All employees are welcome to attend.',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    attendees: [],
    tags: [], // Will be populated by service
    createdBy: '1'
  }
]; 