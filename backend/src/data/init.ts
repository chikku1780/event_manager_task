import { User, Event, Tag, Attendee, RoleRequest } from '../types';
import { mockUsers } from './users';
import { mockTags } from './tags';
import { mockEvents } from './events';
import { mockAttendees } from './attendees';
import { mockRoleRequests } from './roleRequests';

export interface MockData {
  users: User[];
  events: Event[];
  tags: Tag[];
  attendees: Attendee[];
  roleRequests: RoleRequest[];
}

export const mockData: MockData = {
  users: mockUsers,
  tags: mockTags,
  events: mockEvents,
  attendees: mockAttendees,
  roleRequests: mockRoleRequests
};

// Helper function to get the next counter value for each entity type
export const getNextCounter = (entityType: keyof MockData): number => {
  const data = mockData[entityType];
  if (Array.isArray(data)) {
    return data.length + 1;
  }
  return 1;
}; 