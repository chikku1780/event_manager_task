# Docker Setup for Event Manager

This document explains how to build and run the Event Manager application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose (usually comes with Docker Desktop)

## Quick Start

### Using Docker Compose (Recommended)

1. **Clone the repository and navigate to the project directory:**
   ```bash
   cd Event-Manager
   ```

2. **Build and run the application:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend GraphQL: http://localhost:4000/graphql

4. **Stop the application:**
   ```bash
   docker-compose down
   ```

### Using Docker directly

1. **Build the Docker image:**
   ```bash
   docker build -t event-manager .
   ```

2. **Run the container:**
   ```bash
   docker run -p 3000:3000 -p 4000:4000 event-manager
   ```

## Dockerfile Explanation

The Dockerfile uses a multi-stage build approach for optimization:

### Stage 1: Dependencies (`deps`)
- Uses Node.js 18 Alpine for a smaller base image
- Installs `libc6-compat` for compatibility
- Copies package files and installs dependencies for:
  - Root workspace
  - Backend
  - Frontend

### Stage 2: Builder (`builder`)
- Copies dependencies from the deps stage
- Copies source code
- Builds the backend TypeScript code
- Builds the frontend Next.js application with standalone output

### Stage 3: Runner (`runner`)
- Creates a production-ready image
- Sets up a non-root user for security
- Copies only the built artifacts
- Configures the startup script to run both services

## Key Features

### Multi-stage Build
- **Dependencies Stage**: Installs all npm dependencies
- **Builder Stage**: Compiles TypeScript and builds Next.js
- **Runner Stage**: Creates minimal production image

### Security
- Runs as non-root user (`nextjs`)
- Uses Alpine Linux for smaller attack surface
- Proper file permissions

### Optimization
- Layer caching for faster rebuilds
- Only copies necessary files to final image
- Uses `npm ci` for reproducible builds

### Health Checks
- Monitors application health
- Automatically restarts unhealthy containers

## Environment Configuration

### Environment Files
The application expects environment files:
- `backend/env.prod` - Backend environment variables
- `frontend/env.prod` - Frontend environment variables

### Required Environment Variables

#### Backend (`backend/env.prod`)
```env
NODE_ENV=production
PORT=4000
JWT_SECRET=your-jwt-secret
# Add other backend-specific variables
```

#### Frontend (`frontend/env.prod`)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/graphql
# Add other frontend-specific variables
```

## Ports

- **3000**: Frontend (Next.js)
- **4000**: Backend (GraphQL API)

## Development vs Production

### Development
```bash
# Run in development mode
docker-compose -f docker-compose.dev.yml up
```

### Production
```bash
# Run in production mode
docker-compose up --build
```

## Troubleshooting

### Build Issues

1. **Clear Docker cache:**
   ```bash
   docker system prune -a
   ```

2. **Rebuild without cache:**
   ```bash
   docker-compose build --no-cache
   ```

### Runtime Issues

1. **Check container logs:**
   ```bash
   docker-compose logs event-manager
   ```

2. **Access container shell:**
   ```bash
   docker-compose exec event-manager sh
   ```

3. **Check health status:**
   ```bash
   docker-compose ps
   ```

### Common Issues

1. **Port conflicts**: Ensure ports 3000 and 4000 are available
2. **Permission issues**: Check file permissions on mounted volumes
3. **Memory issues**: Increase Docker memory allocation if needed

## Performance Optimization

### Build Optimization
- Uses multi-stage builds to reduce final image size
- Leverages Docker layer caching
- Excludes unnecessary files via `.dockerignore`

### Runtime Optimization
- Uses Alpine Linux for smaller base image
- Runs as non-root user for security
- Implements health checks for reliability

## Monitoring

### Health Checks
The container includes health checks that monitor:
- Frontend availability on port 3000
- Automatic restart on failure

### Logs
- Application logs are available via `docker-compose logs`
- Both frontend and backend logs are captured

## Scaling

For production deployments, consider:
- Using a reverse proxy (nginx)
- Implementing load balancing
- Adding monitoring and logging solutions
- Using container orchestration (Kubernetes, Docker Swarm)

## Security Considerations

1. **Non-root user**: Application runs as `nextjs` user
2. **Minimal base image**: Uses Alpine Linux
3. **No sensitive data in image**: Environment variables are mounted
4. **Regular updates**: Keep base images updated

## Next Steps

1. Set up environment variables
2. Configure your domain and SSL certificates
3. Set up monitoring and logging
4. Implement CI/CD pipeline
5. Add database service if needed 