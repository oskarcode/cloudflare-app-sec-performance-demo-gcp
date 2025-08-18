#!/bin/bash

# Cloudflare Demo E-commerce Deployment Script
# This script deploys the Django application to AWS EC2

set -e

echo "🚀 Starting deployment of Cloudflare Demo E-commerce..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    sudo systemctl start docker
    sudo systemctl enable docker
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down || true

# Build and start the application
echo "🔨 Building and starting containers..."
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Populate the database with sample products
echo "📊 Populating database with sample products..."
docker-compose exec -T web python manage.py populate_products

# Show container status
echo "📋 Container status:"
docker-compose ps

# Show application URLs
echo ""
echo "🎉 Deployment complete!"
echo "📍 Application URLs:"
echo "   Main site: http://$(curl -s ipinfo.io/ip)"
echo "   Admin: http://$(curl -s ipinfo.io/ip)/admin/"
echo "   Search (vulnerable): http://$(curl -s ipinfo.io/ip)/search/"
echo "   API: http://$(curl -s ipinfo.io/ip)/api/products/"
echo "   Credential leak: http://$(curl -s ipinfo.io/ip)/.git/secrets.txt"
echo ""
echo "🔒 Ready for Cloudflare security demos!"

# Test endpoints
echo "🧪 Testing endpoints..."
sleep 5

# Test main site
if curl -s -f http://localhost > /dev/null; then
    echo "✅ Main site: OK"
else
    echo "❌ Main site: Failed"
fi

# Test API
if curl -s -f http://localhost/api/products/ > /dev/null; then
    echo "✅ API endpoint: OK"
else
    echo "❌ API endpoint: Failed"
fi

# Test vulnerable files
if curl -s -f http://localhost/.git/secrets.txt > /dev/null; then
    echo "✅ Credential leak endpoint: OK"
else
    echo "❌ Credential leak endpoint: Failed"
fi

echo "🏁 Deployment script finished!"