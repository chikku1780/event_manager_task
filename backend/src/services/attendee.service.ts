import { Attendee, CreateAttendeeInput, UpdateAttendeeInput, RSVPStatus } from '../types';
import { mockData, getNextCounter } from '../data';

// In-memory storage for attendees
class AttendeeService {
  private attendees: Map<string, Attendee> = new Map();
  private attendeeCounter = 1;

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Initialize with mock data from centralized module
    mockData.attendees.forEach(attendee => {
      this.attendees.set(attendee.id, attendee);
    });
    this.attendeeCounter = getNextCounter('attendees');
  }

  getAllAttendees(): Attendee[] {
    return Array.from(this.attendees.values());
  }

  getAttendeesByEvent(eventId: string): Attendee[] {
    return Array.from(this.attendees.values()).filter(attendee => attendee.eventId === eventId);
  }

  getAttendeeById(id: string): Attendee | null {
    return this.attendees.get(id) || null;
  }

  createAttendee(input: CreateAttendeeInput): Attendee {
    const now = new Date().toISOString();
    const attendee: Attendee = {
      id: this.attendeeCounter.toString(),
      name: input.name,
      email: input.email,
      rsvpStatus: RSVPStatus.PENDING,
      eventId: input.eventId,
      createdAt: now
    };

    this.attendees.set(attendee.id, attendee);
    this.attendeeCounter++;
    return attendee;
  }

  updateAttendee(input: UpdateAttendeeInput): Attendee | null {
    const attendee = this.attendees.get(input.id);
    if (!attendee) return null;

    const updatedAttendee: Attendee = {
      ...attendee,
      rsvpStatus: input.rsvpStatus
    };

    this.attendees.set(input.id, updatedAttendee);
    return updatedAttendee;
  }

  approveAttendee(attendeeId: string, approvedBy: string): Attendee | null {
    const attendee = this.attendees.get(attendeeId);
    if (!attendee) return null;

    const updatedAttendee: Attendee = {
      ...attendee,
      rsvpStatus: RSVPStatus.APPROVED,
      approvedBy,
      approvedAt: new Date().toISOString()
    };

    this.attendees.set(attendeeId, updatedAttendee);
    return updatedAttendee;
  }

  rejectAttendee(attendeeId: string, rejectedBy: string): Attendee | null {
    const attendee = this.attendees.get(attendeeId);
    if (!attendee) return null;

    const updatedAttendee: Attendee = {
      ...attendee,
      rsvpStatus: RSVPStatus.REJECTED,
      approvedBy: rejectedBy,
      approvedAt: new Date().toISOString()
    };

    this.attendees.set(attendeeId, updatedAttendee);
    return updatedAttendee;
  }

  deleteAttendee(id: string): boolean {
    return this.attendees.delete(id);
  }

  getPendingAttendees(eventId: string): Attendee[] {
    return this.getAttendeesByEvent(eventId).filter(attendee => 
      attendee.rsvpStatus === RSVPStatus.PENDING
    );
  }
}

export const attendeeService = new AttendeeService(); 