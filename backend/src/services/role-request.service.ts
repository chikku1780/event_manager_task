import { RoleRequest, RequestRolePromotionInput, UserRole } from '../types';
import { mockData, getNextCounter } from '../data';

// In-memory storage for role requests
class RoleRequestService {
  private roleRequests: Map<string, RoleRequest> = new Map();
  private requestCounter = 1;

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Initialize with mock data from centralized module
    mockData.roleRequests.forEach(request => {
      this.roleRequests.set(request.id, request);
    });
    this.requestCounter = getNextCounter('roleRequests');
  }

  getAllRoleRequests(): RoleRequest[] {
    return Array.from(this.roleRequests.values());
  }

  getRoleRequestsByUser(userId: string): RoleRequest[] {
    return Array.from(this.roleRequests.values()).filter(request => request.userId === userId);
  }

  getPendingRoleRequests(): RoleRequest[] {
    return Array.from(this.roleRequests.values()).filter(request => request.status === 'PENDING');
  }

  createRoleRequest(input: RequestRolePromotionInput, userId: string): RoleRequest {
    const now = new Date().toISOString();
    
    const roleRequest: RoleRequest = {
      id: this.requestCounter.toString(),
      userId,
      requestedRole: input.requestedRole,
      status: 'PENDING',
      message: input.message,
      createdAt: now
    };

    this.roleRequests.set(roleRequest.id, roleRequest);
    this.requestCounter++;
    return roleRequest;
  }

  updateRoleRequestStatus(requestId: string, status: 'APPROVED' | 'REJECTED'): RoleRequest | null {
    const request = this.roleRequests.get(requestId);
    if (!request) return null;

    const updatedRequest: RoleRequest = {
      ...request,
      status
    };

    this.roleRequests.set(requestId, updatedRequest);
    return updatedRequest;
  }

  deleteRoleRequest(requestId: string): boolean {
    return this.roleRequests.delete(requestId);
  }
}

export const roleRequestService = new RoleRequestService(); 