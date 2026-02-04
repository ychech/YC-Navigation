#!/bin/bash

# Artistic Nav Deployment Script
# Usage: ./deploy.sh

echo "🚀 Starting deployment..."

# 1. Pull latest code (if using git on server)
# git pull origin main

# 2. Build and start containers
echo "📦 Building Docker containers..."
docker-compose up -d --build

# 3. Clean up unused images
echo "🧹 Cleaning up..."
docker image prune -f

echo "✅ Deployment complete! App running on http://localhost:3000"
