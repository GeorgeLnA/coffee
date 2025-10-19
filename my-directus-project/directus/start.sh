#!/bin/bash

# Directus Startup Script
echo "🚀 Starting Directus CMS..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "Please create a .env file based on the example in SETUP.md"
    exit 1
fi

# Start Docker containers
echo "📦 Starting Docker containers..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 5

# Check container status
echo "📊 Container status:"
docker-compose ps

echo ""
echo "✅ Directus is starting up!"
echo "📍 Admin Panel: http://localhost:8055"
echo "📝 Check logs with: docker-compose logs -f"
echo ""

