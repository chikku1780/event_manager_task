import { RoleRequest, UserRole } from '../types';

export const mockRoleRequests: RoleRequest[] = [
  {
    id: '2',
    userId: '3',
    requestedRole: UserRole.EVENT_MANAGER,
    status: 'APPROVED',
    message: 'Need to organize team events and workshops.',
    createdAt: '2024-01-10T14:30:00Z'
  }
]; 