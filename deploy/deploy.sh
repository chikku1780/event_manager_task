#!/bin/bash

# Event Manager Deployment Script
# Usage: ./deploy.sh [staging|production] [version]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}
DOCKER_REGISTRY="ghcr.io/chikku1780/event_manager_task"
BACKUP_DIR="./backup"
LOG_FILE="./deploy.log"

# Function to log messages
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

# Function to log errors
error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

# Function to log success
success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

# Function to log warnings
warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Function to check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
    fi
    
    # Check if we can connect to Docker daemon
    if ! docker info &> /dev/null; then
        error "Cannot connect to Docker daemon"
    fi
    
    success "Prerequisites check passed"
}

# Function to create backup
create_backup() {
    log "Creating backup of current deployment..."
    
    mkdir -p "$BACKUP_DIR"
    BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    
    # Create backup of current containers and volumes
    docker-compose -f "docker-compose.$ENVIRONMENT.yml" ps -q | xargs docker inspect > "$BACKUP_DIR/containers.json" 2>/dev/null || true
    
    # Backup environment files
    tar -czf "$BACKUP_FILE" \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='backup' \
        . 2>/dev/null || true
    
    success "Backup created: $BACKUP_FILE"
}

# Function to pull latest image
pull_image() {
    log "Pulling latest Docker image..."
    
    if ! docker pull "$DOCKER_REGISTRY:$VERSION"; then
        error "Failed to pull Docker image $DOCKER_REGISTRY:$VERSION"
    fi
    
    success "Docker image pulled successfully"
}

# Function to deploy
deploy() {
    log "Deploying to $ENVIRONMENT environment..."
    
    # Stop current deployment
    log "Stopping current deployment..."
    docker-compose -f "docker-compose.$ENVIRONMENT.yml" down --remove-orphans || true
    
    # Start new deployment
    log "Starting new deployment..."
    if ! docker-compose -f "docker-compose.$ENVIRONMENT.yml" up -d; then
        error "Failed to start deployment"
    fi
    
    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    sleep 30
    
    # Check health
    if ! docker-compose -f "docker-compose.$ENVIRONMENT.yml" ps | grep -q "Up"; then
        error "Services failed to start properly"
    fi
    
    success "Deployment completed successfully"
}

# Function to rollback
rollback() {
    log "Rolling back deployment..."
    
    # Stop current deployment
    docker-compose -f "docker-compose.$ENVIRONMENT.yml" down --remove-orphans || true
    
    # Restore from backup if available
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/backup-*.tar.gz 2>/dev/null | head -1)
    if [ -n "$LATEST_BACKUP" ]; then
        log "Restoring from backup: $LATEST_BACKUP"
        tar -xzf "$LATEST_BACKUP" || warning "Failed to restore from backup"
    fi
    
    # Restart with previous version
    docker-compose -f "docker-compose.$ENVIRONMENT.yml" up -d || error "Failed to rollback"
    
    success "Rollback completed"
}

# Function to health check
health_check() {
    log "Performing health check..."
    
    # Wait for services to be ready
    sleep 10
    
    # Check if frontend is responding
    if ! curl -f "http://localhost:3000" &> /dev/null; then
        error "Frontend health check failed"
    fi
    
    # Check if backend is responding
    if ! curl -f "http://localhost:4000/graphql" &> /dev/null; then
        error "Backend health check failed"
    fi
    
    success "Health check passed"
}

# Function to notify
notify() {
    local status=$1
    local message=$2
    
    log "Sending notification: $message"
    
    # Add your notification logic here
    # Example: Slack, email, etc.
    echo "Deployment $status: $message" | tee -a "$LOG_FILE"
}

# Main deployment process
main() {
    log "Starting deployment process for $ENVIRONMENT environment"
    
    # Validate environment
    if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
        error "Invalid environment. Use 'staging' or 'production'"
    fi
    
    # Check if docker-compose file exists
    if [ ! -f "docker-compose.$ENVIRONMENT.yml" ]; then
        error "Docker Compose file not found: docker-compose.$ENVIRONMENT.yml"
    fi
    
    # Start deployment process
    check_prerequisites
    create_backup
    pull_image
    
    # Deploy with rollback on failure
    if deploy; then
        health_check
        notify "SUCCESS" "Deployment to $ENVIRONMENT completed successfully"
        success "Deployment completed successfully!"
    else
        error "Deployment failed, rolling back..."
        rollback
        notify "FAILED" "Deployment to $ENVIRONMENT failed, rolled back"
        error "Deployment failed and rolled back"
    fi
}

# Handle script arguments
case "${1:-}" in
    "staging"|"production")
        main
        ;;
    "rollback")
        rollback
        ;;
    "health")
        health_check
        ;;
    *)
        echo "Usage: $0 {staging|production} [version]"
        echo "       $0 rollback"
        echo "       $0 health"
        exit 1
        ;;
esac 