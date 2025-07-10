# Data Module

This module contains centralized mock data for the Event Manager application.

## Structure

- `init.ts` - Main initialization file that combines all mock data
- `index.ts` - Exports for cleaner imports
- `users.ts` - User mock data
- `tags.ts` - Tag mock data  
- `events.ts` - Event mock data
- `attendees.ts` - Attendee mock data
- `roleRequests.ts` - Role request mock data

## Mock Data

The module provides mock data for:

- **Users**: Sample users with different roles (Admin, Event Manager, User)
- **Tags**: Event categorization tags with colors
- **Events**: Sample events with descriptions and metadata
- **Attendees**: Sample event attendees with RSVP statuses
- **Role Requests**: Sample role promotion requests

## Usage

```typescript
// Import combined mock data
import { mockData, getNextCounter } from '../data';

// Access mock data
const users = mockData.users;
const tags = mockData.tags;

// Get next counter for new entities
const nextUserId = getNextCounter('users');

// Or import individual mock data files
import { mockUsers } from '../data/users';
import { mockTags } from '../data/tags';
import { mockEvents } from '../data/events';
```

## Benefits

1. **Centralized Data**: All mock data is in one place
2. **Easy Maintenance**: Changes to mock data only need to be made in one location
3. **Consistency**: Ensures all services use the same mock data
4. **Type Safety**: Full TypeScript support with proper interfaces
5. **Flexibility**: Easy to extend with new mock data or modify existing data

## Adding New Mock Data

To add new mock data:

1. Add the data to the appropriate file (e.g., `users.ts` for new users)
2. Update the `MockData` interface in `init.ts` if needed
3. The `getNextCounter` function will automatically handle the counter logic

## Benefits of Modular Structure

1. **Separation of Concerns**: Each entity type has its own file
2. **Easier Maintenance**: Changes to specific entity data only affect one file
3. **Better Organization**: Clear file structure makes it easy to find specific data
4. **Selective Imports**: Can import only the mock data you need
5. **Team Collaboration**: Multiple developers can work on different entity files without conflicts 