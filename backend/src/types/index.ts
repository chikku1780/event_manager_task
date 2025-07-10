export interface Event {
  id: string;
  title: string;
  date: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  attendees: Attendee[];
  tags: Tag[];
  createdBy?: string; // User ID who created the event
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  USER = 'USER',
  EVENT_MANAGER = 'EVENT_MANAGER',
  ADMIN = 'ADMIN'
}

export interface Attendee {
  id: string;
  name: string;
  email?: string;
  rsvpStatus: RSVPStatus;
  eventId: string;
  createdAt: string;
  approvedBy?: string; // User ID who approved/rejected
  approvedAt?: string;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export enum RSVPStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  DECLINED = 'DECLINED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface CreateEventInput {
  title: string;
  date: string;
  description?: string;
  tagIds?: string[];
}

export interface CreateAttendeeInput {
  name: string;
  email?: string;
  eventId: string;
}

export interface UpdateAttendeeInput {
  id: string;
  rsvpStatus: RSVPStatus;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface SearchEventsInput {
  keyword?: string;
  tagIds?: string[];
}

export interface RoleRequest {
  id: string;
  userId: string;
  requestedRole: UserRole;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  message?: string;
  createdAt: string;
}

export interface RequestRolePromotionInput {
  requestedRole: UserRole;
  message?: string;
} 