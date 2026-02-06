#!/bin/bash

# Artistic Nav Deployment Script
# Usage: ./deploy.sh

echo "🚀 Starting deployment..."

# Detect docker compose command (newer versions use 'docker compose', older use 'docker-compose')
if docker compose version &>/dev/null; then
    DOCKER_COMPOSE="docker compose"
elif docker-compose version &>/dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    echo "❌ Error: docker compose is not installed!"
    echo "Please install Docker Compose first:"
    echo "  sudo curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)\" -o /usr/local/bin/docker-compose"
    echo "  sudo chmod +x /usr/local/bin/docker-compose"
    exit 1
fi

echo "Using: $DOCKER_COMPOSE"

# 1. Pull latest code (if using git on server)
# git pull origin main

# 2. Build and start containers
echo "📦 Building Docker containers..."
$DOCKER_COMPOSE up -d --build

# 3. Clean up unused images
echo "🧹 Cleaning up..."
docker image prune -f

echo "✅ Deployment complete! App running on http://localhost:3000"
