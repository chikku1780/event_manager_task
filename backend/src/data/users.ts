import bcrypt from 'bcryptjs';
import { User, UserRole } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Super Admin',
    email: 'chikku1780@gmail.com',
    passwordHash: bcrypt.hashSync('Chikku@123', 10),
    role: UserRole.ADMIN,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'User One',
    email: 'user1@gmail.com',
    passwordHash: bcrypt.hashSync('Pass@123', 10),
    role: UserRole.EVENT_MANAGER,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'User Two',
    email: 'user2@gmail.com',
    passwordHash: bcrypt.hashSync('Pass@123', 10),
    role: UserRole.USER,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'User Three',
    email: 'user3@gmail.com',
    passwordHash: bcrypt.hashSync('Pass@123', 10),
    role: UserRole.USER,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]; 