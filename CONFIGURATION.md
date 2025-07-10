# Configuration Guide

This document explains how to configure the Event Manager application for different environments and storage options.

## Overview

The application uses a centralized configuration system that supports multiple environments and storage backends. Configuration is managed through environment variables and TypeScript configuration files.

## Backend Configuration

### Environment Variables

Copy `backend/env.example` to `backend/.env` and customize the values:

```bash
# Environment
NODE_ENV=development

# Server Configuration
PORT=4000
HOST=localhost
FRONTEND_URL=http://localhost:3000
GRAPHQL_PATH=/graphql

# Database Configuration
DB_TYPE=memory  # Options: memory, cache, mongodb, postgresql

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12
```

### Storage Options

#### 1. In-Memory Storage (Default)
```bash
DB_TYPE=memory
MEMORY_CACHE_SIZE=1000
```
- **Use case**: Development, testing
- **Pros**: Fast, no setup required
- **Cons**: Data lost on restart, not suitable for production

#### 2. MongoDB Storage
```bash
DB_TYPE=mongodb
MONGODB_URL=mongodb://localhost:27017/event-manager
```
- **Use case**: Production, development with persistence
- **Pros**: Flexible schema, good for document-based data
- **Cons**: Requires MongoDB installation

#### 3. PostgreSQL Storage
```bash
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=event_manager
DB_USER=postgres
DB_PASSWORD=your_password
```
- **Use case**: Production with relational data needs
- **Pros**: ACID compliance, powerful querying
- **Cons**: Requires PostgreSQL installation

#### 4. Cache Storage (Redis)
```bash
DB_TYPE=cache
CACHE_HOST=localhost
CACHE_PORT=6379
CACHE_PASSWORD=
CACHE_TTL=3600
```
- **Use case**: High-performance caching
- **Pros**: Very fast, good for session storage
- **Cons**: Data can expire, requires Redis

### Cache Configuration

Separate from database storage, you can configure caching:

```bash
# Memory cache (default)
CACHE_TYPE=memory
MEMORY_CACHE_TTL=3600

# Redis cache
CACHE_TYPE=redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TTL=3600
```

### Logging Configuration

```bash
LOG_LEVEL=info  # error, warn, info, debug
LOG_FORMAT=simple  # simple, json
LOG_CONSOLE=true
LOG_FILE=false
LOG_FILE_PATH=./logs/app.log
```

## Frontend Configuration

### Environment Variables

Copy `frontend/env.example` to `frontend/.env.local` and customize:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
NEXT_PUBLIC_WS_URL=ws://localhost:4000/graphql

# Authentication
NEXT_PUBLIC_AUTH_TOKEN_KEY=authToken
NEXT_PUBLIC_AUTH_USER_KEY=authUser
NEXT_PUBLIC_AUTH_REFRESH_TOKEN_KEY=refreshToken

# Features
NEXT_PUBLIC_ENABLE_WEBSOCKETS=true
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=false
NEXT_PUBLIC_ENABLE_PWA=false
```

### API Configuration

```bash
# Base API URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000

# GraphQL endpoint
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql

# WebSocket endpoint (for real-time features)
NEXT_PUBLIC_WS_URL=ws://localhost:4000/graphql

# API timeout and retry settings
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_API_RETRY_ATTEMPTS=3
NEXT_PUBLIC_API_RETRY_DELAY=1000
```

### Authentication Configuration

```bash
# Local storage keys
NEXT_PUBLIC_AUTH_TOKEN_KEY=authToken
NEXT_PUBLIC_AUTH_USER_KEY=authUser
NEXT_PUBLIC_AUTH_REFRESH_TOKEN_KEY=refreshToken

# Auto-refresh settings
NEXT_PUBLIC_AUTH_AUTO_REFRESH=true
NEXT_PUBLIC_AUTH_REFRESH_THRESHOLD=300  # 5 minutes
```

### Feature Flags

```bash
# Enable/disable features
NEXT_PUBLIC_ENABLE_WEBSOCKETS=true
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=false
NEXT_PUBLIC_ENABLE_PWA=false
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

### UI Configuration

```bash
# Theme and localization
NEXT_PUBLIC_THEME=auto  # light, dark, auto
NEXT_PUBLIC_LANGUAGE=en
NEXT_PUBLIC_TIMEZONE=UTC
NEXT_PUBLIC_DATE_FORMAT=MM/DD/YYYY
NEXT_PUBLIC_TIME_FORMAT=HH:mm
```

### Upload Configuration

```bash
# File upload limits
NEXT_PUBLIC_MAX_FILE_SIZE=5242880  # 5MB
NEXT_PUBLIC_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,application/pdf

# Image compression
NEXT_PUBLIC_IMAGE_COMPRESSION=true
NEXT_PUBLIC_COMPRESSION_QUALITY=0.8
```

## Environment-Specific Configurations

### Development Environment

```bash
# Backend (.env)
NODE_ENV=development
DB_TYPE=memory
LOG_LEVEL=debug
LOG_CONSOLE=true

# Frontend (.env.local)
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_ENABLE_WEBSOCKETS=true
NEXT_PUBLIC_THEME=auto
```

### Production Environment

```bash
# Backend (.env)
NODE_ENV=production
DB_TYPE=mongodb
MONGODB_URL=mongodb://your-production-mongodb-url
JWT_SECRET=your-production-jwt-secret
LOG_LEVEL=warn
LOG_FILE=true

# Frontend (.env.local)
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_THEME=light
```

### Test Environment

```bash
# Backend (.env)
NODE_ENV=test
DB_TYPE=memory
LOG_LEVEL=error
LOG_CONSOLE=false

# Frontend (.env.local)
NEXT_PUBLIC_API_BASE_URL=http://localhost:4001
NEXT_PUBLIC_ENABLE_WEBSOCKETS=false
```

## Using Configuration in Code

### Backend

```typescript
import { config, database, server, auth } from './config';

// Access configuration
console.log(`Server running on port ${server.port}`);
console.log(`Using ${database.type} database`);

// Validate configuration
validateConfig();
```

### Frontend

```typescript
import { config, api, auth, features } from './config';

// Access configuration
console.log(`Connecting to ${api.graphqlUrl}`);
console.log(`WebSockets enabled: ${features.enableWebsockets}`);

// Helper functions
if (isDevelopment()) {
  console.log('Running in development mode');
}
```

## Configuration Validation

Both backend and frontend configurations include validation functions that check for required values and logical consistency:

```typescript
// Backend
import { validateConfig } from './config';
validateConfig(); // Throws error if configuration is invalid

// Frontend
import { validateConfig } from './config';
validateConfig(); // Throws error if configuration is invalid
```

## Security Considerations

1. **Never commit `.env` files** to version control
2. **Use strong JWT secrets** in production
3. **Limit CORS origins** to trusted domains
4. **Use HTTPS** in production environments
5. **Rotate secrets** regularly

## Troubleshooting

### Common Issues

1. **Configuration not loading**: Ensure `.env` files are in the correct location
2. **Database connection errors**: Check database credentials and network connectivity
3. **CORS errors**: Verify `FRONTEND_URL` matches your frontend domain
4. **Authentication issues**: Check JWT secret and token expiration settings

### Debug Mode

Enable debug logging to troubleshoot configuration issues:

```bash
# Backend
LOG_LEVEL=debug
LOG_CONSOLE=true

# Frontend
NEXT_PUBLIC_DEBUG=true
```

## Migration Guide

When upgrading from older versions:

1. Copy the new `env.example` files
2. Update your existing `.env` files with new variables
3. Test configuration validation
4. Update any hardcoded configuration values in your code 