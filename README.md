# Event Manager

A comprehensive event management system built with Next.js, GraphQL, and TypeScript. This application allows users to create, manage, and attend events with role-based access control and advanced features.

## Features

### 🔐 Authentication & User Management
- **User Registration & Login**: Secure authentication with JWT tokens
- **Role-Based Access Control**: Three user roles (User, Event Manager, Admin)
- **Super Admin Access**: Pre-configured admin account for system management
- **User Profile Management**: View and manage user information

### 📅 Event Management
- **Create Events**: Rich event creation with title, description, date/time, and tags
- **Event Discovery**: Browse all events with search and filtering capabilities
- **Event Details**: Comprehensive event information with attendee lists
- **My Events**: Personal dashboard for managing created events
- **Tag System**: Categorize events with colored tags for better organization

### 👥 Attendee Management
- **RSVP System**: Attendees can register for events with different statuses
- **Approval Workflow**: Event managers can approve/reject attendee requests
- **Status Tracking**: PENDING → APPROVED/REJECTED workflow
- **Attendee Lists**: View and manage event attendees

### 🔍 Search & Discovery
- **Keyword Search**: Search events by title and description
- **Tag Filtering**: Filter events by multiple tags
- **Advanced Filters**: Combine search and tag filters
- **Real-time Results**: Instant search results with loading states

### 🎨 User Interface
- **Modern Design**: Clean, responsive UI built with TailwindCSS
- **Improved Date Picker**: Enhanced datetime selection with validation
- **Tag Visualization**: Color-coded tags throughout the application
- **Loading States**: Smooth loading animations and skeleton screens
- **Error Handling**: User-friendly error messages and recovery

### 🛡️ Admin Features
- **User Management**: Admins can view and manage all users
- **Role Assignment**: Promote users to Event Manager or Admin roles
- **System Overview**: Dashboard with user statistics and management tools

## Branches

- **main**: The stable production branch. All reviewed and tested features are merged here.
- **develop**: The active development branch. New features and fixes are first pushed here before being merged into main.

## Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Apollo Client**: GraphQL client for data fetching
- **TailwindCSS**: Utility-first CSS framework
- **Formik + Yup**: Form management and validation
- **Heroicons**: Beautiful SVG icons

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **Apollo Server**: GraphQL server
- **TypeScript**: Type-safe backend development
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <repo>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development servers**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start them separately
   npm run dev:backend  # Backend on http://localhost:4000
   npm run dev:frontend # Frontend on http://localhost:3000
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - GraphQL Playground: http://localhost:4000/graphql

### Demo Accounts

The application comes with pre-configured demo accounts for testing different user roles:

#### 🛡️ Super Admin Account
- **Email:** `chikku1780@gmail.com`
- **Password:** `Chikku@123`
- **Role:** Admin
- **Permissions:** Full system access, user management, role assignment

#### 👥 Event Manager Account
- **Email:** `user1@gmail.com`
- **Password:** `Pass@123`
- **Role:** Event Manager
- **Permissions:** Create/manage events, approve/reject attendees

#### 👤 Regular User Accounts
- **Email:** `user2@gmail.com`
- **Password:** `Pass@123`
- **Role:** User
- **Permissions:** View events, register as attendee

- **Email:** `user3@gmail.com`
- **Password:** `Pass@123`
- **Role:** User
- **Permissions:** View events, register as attendee

### 🧪 Testing Scenarios

Here are some recommended testing scenarios using the demo accounts:

#### **Admin Testing (chikku1780@gmail.com)**
1. **User Management**: Visit `/admin` to view all users and manage roles
2. **Role Assignment**: Promote regular users to Event Manager or Admin roles
3. **System Overview**: Access admin dashboard with user statistics

#### **Event Manager Testing (user1@gmail.com)**
1. **Event Creation**: Create new events with tags and descriptions
2. **Attendee Management**: Approve/reject attendee requests for your events
3. **Event Editing**: Modify event details and manage attendees

#### **Regular User Testing (user2@gmail.com / user3@gmail.com)**
1. **Event Discovery**: Browse events and use search/filter features
2. **RSVP Process**: Register as attendee for events
3. **Role Requests**: Request promotion to Event Manager role

#### **Cross-Account Testing**
1. **Event Manager → User**: Create an event as Event Manager, then login as User to register
2. **Admin → Event Manager**: Promote a User to Event Manager, then test their new permissions
3. **Attendee Workflow**: Register as attendee with one account, approve/reject with Event Manager account

## User Roles & Permissions

### 👤 User
- View all events
- Register as attendee
- Create personal account

### 👥 Event Manager
- All User permissions
- Create and manage events
- Approve/reject attendee requests
- Manage event attendees

### 🛡️ Admin
- All Event Manager permissions
- Manage all users
- Assign user roles
- Full system access

## Key Features in Detail

### Authentication Flow
1. Users register with email and password
2. Login generates JWT token for session management
3. Role-based access control for all features
4. Automatic token refresh and session management

### Event Creation Process
1. Authenticated users can create events
2. Rich form with validation and tag selection
3. Improved date picker with minimum date validation
4. Real-time form feedback and error handling

### Attendee Management Workflow
1. Users register for events (PENDING status)
2. Event managers review pending requests
3. Approve or reject attendee requests
4. Status updates trigger notifications and UI updates

### Search & Discovery
1. Real-time search by keywords
2. Tag-based filtering system
3. Combined search and filter capabilities
4. Responsive results with loading states

## Project Structure

```
Event-Manager/
├── backend/                 # GraphQL backend
│   ├── src/
│   │   ├── graphql/        # GraphQL schema and resolvers
│   │   ├── services/       # Business logic services
│   │   └── types/          # TypeScript type definitions
│   └── package.json
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   ├── components/    # React components
│   │   ├── lib/           # Utilities and configurations
│   │   └── types/         # TypeScript type definitions
│   └── package.json
└── package.json           # Root package.json for workspace
```

## API Endpoints

### Authentication
- `POST /graphql` - User registration and login
- `POST /graphql` - JWT token validation

### Events
- `GET /graphql` - List all events
- `GET /graphql` - Get event details
- `POST /graphql` - Create new event
- `PUT /graphql` - Update event
- `DELETE /graphql` - Delete event

### Attendees
- `GET /graphql` - Get event attendees
- `POST /graphql` - Register as attendee
- `PUT /graphql` - Update attendee status
- `POST /graphql` - Approve/reject attendee

### Users
- `GET /graphql` - Get all users (Admin only)
- `PUT /graphql` - Update user role (Admin only)

## Development

### Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start frontend only
npm run dev:backend      # Start backend only

# Building
npm run build           # Build both frontend and backend
npm run build:frontend  # Build frontend only
npm run build:backend   # Build backend only

# Production
npm start               # Start production servers
```

### Environment Variables

Create `.env.local` in the root directory:

```env
# Backend
JWT_SECRET=your-secret-key
PORT=4000

# Frontend
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository. 