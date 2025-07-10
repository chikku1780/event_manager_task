import { eventService } from '../services/event.service';
import { attendeeService } from '../services/attendee.service';
import { userService } from '../services/user.service';
import { tagService } from '../services/tag.service';
import { roleRequestService } from '../services/role-request.service';
import { UserRole } from '../types';

const getCurrentUser = (context: any) => {
  // Handle different context shapes
  const authHeader = context.req?.headers?.authorization || 
                    context.headers?.authorization || 
                    (context.req && typeof context.req.get === 'function' ? context.req.get('authorization') : null);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  return userService.verifyToken(token);
};

const requireAuth = (context: any) => {
  const user = getCurrentUser(context);
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
};

const requireRole = (context: any, roles: UserRole[]) => {
  const user = requireAuth(context);
  if (!roles.includes(user.role)) {
    throw new Error('Insufficient permissions');
  }
  return user;
};

export const resolvers = {
  Query: {
    events: () => {
      return eventService.getAllEvents();
    },
    
    event: (_: any, { id }: { id: string }) => {
      return eventService.getEventById(id);
    },
    
    attendees: (_: any, { eventId }: { eventId: string }) => {
      return attendeeService.getAttendeesByEvent(eventId);
    },
    
    searchEvents: (_: any, { input }: { input: any }) => {
      return eventService.searchEvents(input);
    },
    
    tags: () => {
      return tagService.getAllTags();
    },
    
    users: (_: any, __: any, context: any) => {
      requireRole(context, [UserRole.ADMIN]);
      return userService.getAllUsers();
    },
    
    user: (_: any, { id }: { id: string }) => {
      return userService.getUserById(id);
    },
    
    eventManagers: () => {
      return userService.getEventManagers();
    },
    
    myEvents: (_: any, __: any, context: any) => {
      const user = requireAuth(context);
      return eventService.getEventsByUser(user.userId);
    },
    
    pendingAttendees: (_: any, { eventId }: { eventId: string }, context: any) => {
      requireRole(context, [UserRole.EVENT_MANAGER, UserRole.ADMIN]);
      return attendeeService.getPendingAttendees(eventId);
    },
    
    roleRequests: (_: any, __: any, context: any) => {
      requireRole(context, [UserRole.ADMIN]);
      return roleRequestService.getAllRoleRequests();
    }
  },

  Mutation: {
    createEvent: (_: any, { input }: { input: any }, context: any) => {
      const user = requireAuth(context);
      return eventService.createEvent(input, user.userId);
    },
    
    updateEvent: (_: any, { id, input }: { id: string; input: any }, context: any) => {
      const user = requireAuth(context);
      const event = eventService.getEventById(id);
      if (!event) {
        throw new Error('Event not found');
      }
      
      // Only event creator or admin can update
      if (event.createdBy !== user.userId && user.role !== UserRole.ADMIN) {
        throw new Error('Insufficient permissions');
      }
      
      return eventService.updateEvent(id, input);
    },
    
    deleteEvent: (_: any, { id }: { id: string }, context: any) => {
      const user = requireAuth(context);
      const event = eventService.getEventById(id);
      if (!event) {
        throw new Error('Event not found');
      }
      
      // Only event creator or admin can delete
      if (event.createdBy !== user.userId && user.role !== UserRole.ADMIN) {
        throw new Error('Insufficient permissions');
      }
      
      return eventService.deleteEvent(id);
    },
    
    createAttendee: (_: any, { input }: { input: any }) => {
      return attendeeService.createAttendee(input);
    },
    
    updateAttendee: (_: any, { input }: { input: any }) => {
      return attendeeService.updateAttendee(input);
    },
    
    deleteAttendee: (_: any, { id }: { id: string }, context: any) => {
      requireRole(context, [UserRole.EVENT_MANAGER, UserRole.ADMIN]);
      return attendeeService.deleteAttendee(id);
    },
    
    approveAttendee: (_: any, { attendeeId }: { attendeeId: string }, context: any) => {
      const user = requireRole(context, [UserRole.EVENT_MANAGER, UserRole.ADMIN]);
      return attendeeService.approveAttendee(attendeeId, user.userId);
    },
    
    rejectAttendee: (_: any, { attendeeId }: { attendeeId: string }, context: any) => {
      const user = requireRole(context, [UserRole.EVENT_MANAGER, UserRole.ADMIN]);
      return attendeeService.rejectAttendee(attendeeId, user.userId);
    },
    
    requestToJoinEvent: (_: any, { input }: { input: any }, context: any) => {
      const user = requireAuth(context);
      const event = eventService.getEventById(input.eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      
      // Prevent event owner from joining their own event
      if (event.createdBy === user.userId) {
        throw new Error('You cannot join your own event');
      }
      
      // Check if user is already an attendee
      const existingAttendees = attendeeService.getAttendeesByEvent(input.eventId);
      const isAlreadyAttendee = existingAttendees.some(attendee => attendee.email === user.email);
      
      if (isAlreadyAttendee) {
        throw new Error('You have already requested to join this event');
      }
      
      const currentUser = userService.getUserById(user.userId);
      if (!currentUser) {
        throw new Error('User not found');
      }
      
      return attendeeService.createAttendee({
        name: currentUser.name,
        email: currentUser.email,
        eventId: input.eventId
      });
    },
    
    createUser: (_: any, { input }: { input: any }) => {
      return userService.createUser(input);
    },
    
    login: (_: any, { input }: { input: any }) => {
      return userService.login(input);
    },
    
    updateUserRole: (_: any, { userId, role }: { userId: string; role: UserRole }, context: any) => {
      requireRole(context, [UserRole.ADMIN]);
      return userService.updateUserRole(userId, role);
    },
    
    createTag: (_: any, { name, color }: { name: string; color?: string }, context: any) => {
      requireRole(context, [UserRole.EVENT_MANAGER, UserRole.ADMIN]);
      return tagService.createTag(name, color);
    },
    
    requestRolePromotion: (_: any, { input }: { input: any }, context: any) => {
      const user = requireAuth(context);
      return roleRequestService.createRoleRequest(input, user.userId);
    }
  },

  Event: {
    attendees: (parent: any) => {
      return attendeeService.getAttendeesByEvent(parent.id);
    },
    
    attendeeCount: (parent: any) => {
      return attendeeService.getAttendeesByEvent(parent.id).length;
    }
  },
  
  RoleRequest: {
    user: (parent: any) => {
      return userService.getUserById(parent.userId);
    }
  }
}; 