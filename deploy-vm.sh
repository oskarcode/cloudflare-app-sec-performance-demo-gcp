#!/bin/bash

# GCP VM Deployment Script for Django Ecommerce App
# This script deploys the Django app using Docker on GCP VM

set -e

echo "🚀 Starting Django App Deployment on GCP VM..."

# Create app directory
APP_DIR="/home/oskarablimit/cloudflare-demo-ecommerce"
mkdir -p $APP_DIR
cd $APP_DIR

echo "📁 Created app directory: $APP_DIR"

# Copy project files (this will be done via SCP from local machine)
echo "📋 Project files will be copied via SCP..."

# Build Docker image
echo "🔨 Building Docker image..."
docker build -t cloudflare-demo-ecommerce:latest .

# Stop existing container if running
echo "🛑 Stopping existing container..."
docker stop cloudflare-demo-ecommerce || true
docker rm cloudflare-demo-ecommerce || true

# Run new container
echo "🏃 Starting new container..."
docker run -d \
    --name cloudflare-demo-ecommerce \
    --restart unless-stopped \
    -p 8000:8000 \
    --env-file env.production \
    -v $(pwd)/db.sqlite3:/app/db.sqlite3 \
    -v $(pwd)/staticfiles:/app/staticfiles \
    -v $(pwd)/media:/app/media \
    cloudflare-demo-ecommerce:latest

# Wait for container to start
echo "⏳ Waiting for container to start..."
sleep 10

# Check if container is running
if docker ps | grep -q cloudflare-demo-ecommerce; then
    echo "✅ Container is running successfully!"
    echo "🌐 App is available at: http://$(curl -s ifconfig.me):8000"
else
    echo "❌ Container failed to start. Checking logs..."
    docker logs cloudflare-demo-ecommerce
    exit 1
fi

# Configure Nginx
echo "🔧 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/cloudflare-demo-ecommerce > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /static/ {
        alias /home/oskarablimit/cloudflare-demo-ecommerce/staticfiles/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /media/ {
        alias /home/oskarablimit/cloudflare-demo-ecommerce/media/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/cloudflare-demo-ecommerce /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
sudo nginx -t && sudo systemctl reload nginx

echo "🎉 Deployment completed successfully!"
echo "🌐 Your app is now available at: http://$(curl -s ifconfig.me)"
echo "📊 Container status:"
docker ps | grep cloudflare-demo-ecommerce
