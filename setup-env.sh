#!/bin/bash

# Environment Setup Script for Event Manager
# This script helps you set up environment files for different environments

set -e

echo "🚀 Event Manager Environment Setup"
echo "=================================="

# Function to copy environment files
setup_environment() {
    local env=$1
    local backend_source="backend/env.${env}"
    local frontend_source="frontend/env.${env}"
    local backend_target="backend/.env"
    local frontend_target="frontend/.env.local"
    
    echo ""
    echo "Setting up ${env} environment..."
    
    # Copy backend environment file
    if [ -f "$backend_source" ]; then
        cp "$backend_source" "$backend_target"
        echo "✅ Backend environment file copied: $backend_source → $backend_target"
    else
        echo "❌ Backend environment file not found: $backend_source"
        return 1
    fi
    
    # Copy frontend environment file
    if [ -f "$frontend_source" ]; then
        cp "$frontend_source" "$frontend_target"
        echo "✅ Frontend environment file copied: $frontend_source → $frontend_target"
    else
        echo "❌ Frontend environment file not found: $frontend_source"
        return 1
    fi
    
    echo "🎉 ${env} environment setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Review and customize the environment files if needed"
    echo "2. Install dependencies: npm install (in both backend/ and frontend/)"
    echo "3. Start the development server: npm run dev (in both directories)"
    echo ""
}

# Function to show available environments
show_available() {
    echo "Available environments:"
    echo "  dev    - Development environment (default)"
    echo "  prod   - Production environment"
    echo "  test   - Test environment"
    echo ""
    echo "Usage: $0 [dev|prod|test]"
    echo ""
}

# Main script logic
if [ $# -eq 0 ]; then
    echo "No environment specified. Using 'dev' as default."
    setup_environment "dev"
elif [ "$1" = "dev" ] || [ "$1" = "prod" ] || [ "$1" = "test" ]; then
    setup_environment "$1"
else
    echo "❌ Invalid environment: $1"
    show_available
    exit 1
fi

echo "📝 Environment files created successfully!"
echo "⚠️  Remember to:"
echo "   - Never commit .env files to version control"
echo "   - Update production secrets before deployment"
echo "   - Test your configuration before going live" 