# Event Manager Data Model Design

## Overview

This document describes the data model for the Event Manager application, focusing on the relationships between Users, Events, Attendees, and Tags.

## Entities

### User
- **id**: string (unique identifier, UUID)
- **name**: string (user's full name)
- **email**: string (unique email address)
- **passwordHash**: string (hashed password for authentication)
- **createdAt**: date (timestamp when user was created)
- **updatedAt**: date (timestamp when user was last updated)
- **isActive**: boolean (whether the user account is active)

**Constraints:**
- Email must be unique across all users
- Name is required and must be between 2-100 characters
- Email must be a valid email format

**Indexes:**
- Primary key on `id`
- Unique index on `email`
- Index on `isActive` for filtering active users

### Event
- **id**: string (unique identifier, UUID)
- **title**: string (event title)
- **description**: string (optional event description)
- **date**: datetime (event date and time)
- **location**: string (optional event location)
- **maxAttendees**: number (optional maximum number of attendees)
- **isPublic**: boolean (whether the event is publicly visible)
- **status**: enum (DRAFT, PUBLISHED, CANCELLED, COMPLETED)
- **createdBy**: string (ID of the user who created the event, references User)
- **createdAt**: date (timestamp when event was created)
- **updatedAt**: date (timestamp when event was last updated)

**Constraints:**
- Title is required and must be between 3-200 characters
- Date must be in the future when creating/updating
- CreatedBy must reference a valid User

**Indexes:**
- Primary key on `id`
- Index on `createdBy` for user's events
- Index on `date` for date-based queries
- Index on `status` for filtering by status
- Index on `isPublic` for public/private filtering

### Attendee
- **id**: string (unique identifier, UUID)
- **name**: string (attendee's full name)
- **email**: string (optional email address)
- **phone**: string (optional phone number)
- **rsvpStatus**: enum (PENDING, CONFIRMED, DECLINED, MAYBE)
- **eventId**: string (ID of the event, references Event)
- **createdAt**: date (timestamp when attendee was added)
- **updatedAt**: date (timestamp when attendee was last updated)

**Constraints:**
- Name is required and must be between 2-100 characters
- Email must be a valid email format if provided
- EventId must reference a valid Event
- RSVP status defaults to PENDING

**Indexes:**
- Primary key on `id`
- Index on `eventId` for event's attendees
- Index on `email` for email-based lookups
- Index on `rsvpStatus` for status filtering
- Composite index on `(eventId, email)` for unique email per event

### Tag
- **id**: string (unique identifier, UUID)
- **name**: string (tag name)
- **color**: string (hex color code for UI display)
- **description**: string (optional tag description)
- **createdBy**: string (ID of the user who created the tag, references User)
- **createdAt**: date (timestamp when tag was created)
- **updatedAt**: date (timestamp when tag was last updated)

**Constraints:**
- Name is required and must be unique
- Name must be between 2-50 characters
- Color must be a valid hex color code

**Indexes:**
- Primary key on `id`
- Unique index on `name`
- Index on `createdBy` for user's tags

## Join Entities

### EventTag (Many-to-Many relationship between Event and Tag)
- **id**: string (unique identifier, UUID)
- **eventId**: string (ID of the event, references Event)
- **tagId**: string (ID of the tag, references Tag)
- **createdAt**: date (timestamp when association was created)

**Constraints:**
- EventId must reference a valid Event
- TagId must reference a valid Tag
- Combination of eventId and tagId must be unique

**Indexes:**
- Primary key on `id`
- Unique composite index on `(eventId, tagId)`
- Index on `eventId` for event's tags
- Index on `tagId` for tag's events

## Performance Considerations

### Database Indexes
- All foreign key relationships have indexes for efficient joins
- Composite indexes on frequently queried combinations
- Text search indexes on title and description fields for search functionality

### Caching Strategy
- Event lists can be cached with short TTL (5-10 minutes)
- Individual event details can be cached longer (30-60 minutes)
- Attendee lists should have minimal caching due to frequent updates

### Query Optimization
- Use pagination for large attendee lists
- Implement lazy loading for event details
- Consider denormalization for frequently accessed data (e.g., attendee count on events)

## Assumptions

1. **User Management**: Users can create and manage multiple events
2. **Attendee Privacy**: Attendees are not Users - they are separate entities that can attend multiple events
3. **RSVP Tracking**: Each attendee has an RSVP status that can be updated
4. **Tag System**: Events can have multiple tags for categorization
5. **Event Ownership**: Events are created by Users but can be attended by non-Users
6. **Email Uniqueness**: Email addresses should be unique per event (same person can attend multiple events with same email)
7. **Soft Deletes**: Consider implementing soft deletes for events and attendees
8. **Audit Trail**: Track creation and modification timestamps for all entities

## Future Considerations

1. **Notifications**: Add notification preferences for attendees
2. **Recurring Events**: Support for recurring event patterns
3. **Event Templates**: Predefined event templates for common event types
4. **Waitlists**: Support for waitlists when events reach capacity
5. **Event Categories**: Hierarchical categorization system
6. **Social Features**: Comments, likes, and sharing capabilities
7. **Integration**: Calendar integration and email notifications 