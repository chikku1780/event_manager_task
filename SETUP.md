# Event Manager - Setup Guide

This guide provides detailed instructions for setting up and running the Event Manager application.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js) or **yarn**
- **Git** (for cloning the repository)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Event-Manager
```

### 2. Install Dependencies

The project uses npm workspaces to manage both frontend and backend dependencies. Install all dependencies with a single command:

```bash
npm install
```

This will install dependencies for:
- Root workspace
- Backend (`/backend`)
- Frontend (`/frontend`)

### 3. Environment Configuration

Create environment files for both frontend and backend:

#### Backend Environment

Create `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS Configuration (optional)
CORS_ORIGIN=http://localhost:3000
```

#### Frontend Environment

Create `.env.local` file in the `frontend/` directory:

```env
# GraphQL Endpoint
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql

# Next.js Configuration
NEXT_PUBLIC_APP_NAME=Event Manager
```

## Development

### Starting the Application

#### Option 1: Start Both Services (Recommended)

```bash
npm run dev
```

This command starts both the backend and frontend servers simultaneously.

#### Option 2: Start Services Separately

```bash
# Terminal 1 - Start Backend
npm run dev:backend

# Terminal 2 - Start Frontend
npm run dev:frontend
```

### Access Points

Once the servers are running, you can access:

- **Frontend Application**: http://localhost:3000
- **GraphQL Playground**: http://localhost:4000/graphql
- **Backend Health Check**: http://localhost:4000/health

## Authentication Setup

### Default Admin Account

The application comes with a pre-configured super admin account:

- **Email**: `chikku1780@gmail.com`
- **Password**: `Chikku@123`

### User Registration

1. Navigate to http://localhost:3000/signup
2. Create a new user account
3. Login with your credentials
4. Users start with "User" role by default

### Role Management

#### Admin Role Assignment

Only existing admins can assign roles:

1. Login with admin credentials
2. Navigate to Admin Panel
3. Select a user and change their role to "Event Manager" or "Admin"

#### Role Permissions

- **User**: View events, register as attendee
- **Event Manager**: Create events, manage attendees, approve/reject requests
- **Admin**: Full system access, user management

## Database

### In-Memory Storage

The application uses in-memory storage as specified in the requirements:

- **Data Persistence**: Data is lost on server restart
- **Mock Data**: Pre-populated with sample events, users, and tags
- **No Database Required**: No external database setup needed

### Sample Data

The application includes:

- **Events**: Sample events with different dates and descriptions
- **Users**: Super admin account and sample users
- **Tags**: Pre-configured tags (Technology, Business, Social, etc.)
- **Attendees**: Sample attendee registrations

## Production Deployment

### Building for Production

```bash
# Build both applications
npm run build

# Or build separately
npm run build:backend
npm run build:frontend
```

### Environment Variables for Production

Update environment variables for production:

```env
# Backend Production
NODE_ENV=production
JWT_SECRET=your-production-jwt-secret
CORS_ORIGIN=https://yourdomain.com

# Frontend Production
NEXT_PUBLIC_GRAPHQL_URL=https://yourdomain.com/graphql
```

### Docker Deployment

The project includes a Dockerfile for containerized deployment:

```bash
# Build Docker image
docker build -t event-manager .

# Run container
docker run -p 3000:3000 -p 4000:4000 event-manager
```

## Development Workflow

### Code Structure

```
Event-Manager/
├── backend/
│   ├── src/
│   │   ├── graphql/          # GraphQL schema and resolvers
│   │   ├── services/         # Business logic
│   │   ├── types/           # TypeScript types
│   │   └── index.ts         # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js pages
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities
│   │   └── types/           # TypeScript types
│   └── package.json
└── package.json             # Workspace configuration
```

### Available Scripts

```bash
# Development
npm run dev                  # Start both services
npm run dev:frontend         # Start frontend only
npm run dev:backend          # Start backend only

# Building
npm run build               # Build both applications
npm run build:frontend      # Build frontend only
npm run build:backend       # Build backend only

# Production
npm start                   # Start production servers
npm start:frontend          # Start frontend production
npm start:backend           # Start backend production

# Utilities
npm run clean               # Clean build artifacts
npm run type-check          # TypeScript type checking
```

## Troubleshooting

### Common Issues

#### Port Already in Use

If you get "port already in use" errors:

```bash
# Kill processes on specific ports
npx kill-port 3000 4000

# Or use different ports
PORT=4001 npm run dev:backend
```

#### Authentication Issues

If you encounter authentication problems:

1. Clear browser local storage
2. Check JWT_SECRET in backend environment
3. Verify GraphQL endpoint in frontend environment

#### GraphQL Errors

For GraphQL-related issues:

1. Check GraphQL Playground at http://localhost:4000/graphql
2. Verify schema and resolver implementations
3. Check console for detailed error messages

### Debug Mode

Enable debug logging:

```bash
# Backend debug
DEBUG=* npm run dev:backend

# Frontend debug
NODE_ENV=development npm run dev:frontend
```

## Testing

### Manual Testing

Test the following workflows:

1. **User Registration**: Create new user accounts
2. **Event Creation**: Create events with different tags
3. **Attendee Registration**: Register for events
4. **Approval Workflow**: Approve/reject attendee requests
5. **Search & Filtering**: Test search and tag filtering
6. **Role Management**: Assign different user roles

### API Testing

Use GraphQL Playground for API testing:

1. Open http://localhost:4000/graphql
2. Test queries and mutations
3. Verify authentication headers
4. Check error handling

## Security Considerations

### JWT Security

- Use strong, unique JWT secrets
- Rotate secrets regularly in production
- Set appropriate token expiration times

### CORS Configuration

Configure CORS for production:

```javascript
// Backend CORS setup
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
};
```

### Input Validation

- All user inputs are validated on both frontend and backend
- GraphQL schema enforces type safety
- Form validation prevents invalid data submission

## Performance Optimization

### Frontend Optimization

- Apollo Client caching for GraphQL queries
- Optimistic UI updates for better perceived performance
- Code splitting with Next.js dynamic imports
- Image optimization with Next.js Image component

### Backend Optimization

- Efficient GraphQL resolvers
- In-memory data structures for fast access
- Proper error handling and logging

## Monitoring and Logging

### Development Logging

Enable detailed logging in development:

```bash
# Backend logging
npm run dev:backend

# Frontend logging
npm run dev:frontend
```

### Production Monitoring

For production deployment, consider:

- Application performance monitoring (APM)
- Error tracking (Sentry)
- Health check endpoints
- Log aggregation services

## Support and Maintenance

### Regular Maintenance

- Update dependencies regularly
- Monitor for security vulnerabilities
- Backup configuration and environment variables
- Review and update documentation

### Getting Help

- Check the troubleshooting section above
- Review the main README.md file
- Open an issue in the repository
- Check GraphQL Playground for API documentation

## Next Steps

After successful setup, consider:

1. **Database Integration**: Replace in-memory storage with PostgreSQL/MongoDB
2. **Email Notifications**: Add email service for attendee notifications
3. **File Uploads**: Implement image upload for events
4. **Real-time Features**: Add WebSocket support for live updates
5. **Mobile App**: Create React Native mobile application
6. **Analytics**: Add event analytics and reporting features 