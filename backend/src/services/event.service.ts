import { Event, CreateEventInput, SearchEventsInput } from '../types';
import { tagService } from './tag.service';
import { mockData, getNextCounter } from '../data';

// In-memory storage for events
class EventService {
  private events: Map<string, Event> = new Map();
  private eventCounter = 1;

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Initialize with mock data from centralized module
    // Note: We need to populate tags after tagService is initialized
    const mockEvents = mockData.events.map(event => ({
      ...event,
      tags: this.getEventTags(event.id)
    }));

    mockEvents.forEach(event => {
      this.events.set(event.id, event);
    });
    this.eventCounter = getNextCounter('events');
  }

  private getEventTags(eventId: string) {
    // Define tag mappings for events
    const eventTagMappings: { [key: string]: string[] } = {
      '1': ['1', '2'], // Tech Conference: Technology, Business
      '2': ['1'],      // Team Building: Technology
      '3': ['2'],      // Design Sprint: Business
      '4': ['1']       // Annual Meeting: Technology
    };

    const tagIds = eventTagMappings[eventId] || [];
    return tagIds.map(id => tagService.getTagById(id)).filter((tag): tag is NonNullable<typeof tag> => tag !== null);
  }

  getAllEvents(): Event[] {
    return Array.from(this.events.values());
  }

  searchEvents(input: SearchEventsInput): Event[] {
    let events = Array.from(this.events.values());

    // Filter by keyword
    if (input.keyword) {
      const keyword = input.keyword.toLowerCase();
      events = events.filter(event => 
        event.title.toLowerCase().includes(keyword) ||
        (event.description && event.description.toLowerCase().includes(keyword))
      );
    }

    // Filter by tags
    if (input.tagIds && input.tagIds.length > 0) {
      events = events.filter(event => 
        event.tags.some(tag => input.tagIds!.includes(tag.id))
      );
    }

    return events;
  }

  getEventById(id: string): Event | null {
    return this.events.get(id) || null;
  }

  createEvent(input: CreateEventInput, createdBy: string): Event {
    const now = new Date().toISOString();
    const tags = input.tagIds ? tagService.getTagsByIds(input.tagIds) : [];
    
    const event: Event = {
      id: this.eventCounter.toString(),
      title: input.title,
      date: input.date,
      description: input.description,
      createdAt: now,
      updatedAt: now,
      attendees: [],
      tags,
      createdBy
    };

    this.events.set(event.id, event);
    this.eventCounter++;
    return event;
  }

  updateEvent(id: string, input: Partial<CreateEventInput>): Event | null {
    const event = this.events.get(id);
    if (!event) return null;

    const tags = input.tagIds ? tagService.getTagsByIds(input.tagIds) : event.tags;

    const updatedEvent: Event = {
      ...event,
      ...input,
      tags,
      updatedAt: new Date().toISOString()
    };

    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  deleteEvent(id: string): boolean {
    return this.events.delete(id);
  }

  getEventsByUser(userId: string): Event[] {
    return Array.from(this.events.values()).filter(event => event.createdBy === userId);
  }
}

export const eventService = new EventService(); 