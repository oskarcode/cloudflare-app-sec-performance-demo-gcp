#!/bin/bash

# Production Deployment Script for GCP VM
# This script pulls from Git and deploys using Docker Compose

set -e

VM_ZONE="us-east4-b"
VM_NAME="oskar-appdemo-se"
PROJECT_ID="globalse-198312"
APP_DIR="~/cloudflare-demo-ecommerce"
REPO_URL="https://github.com/oskarcode/cloudflare-app-sec-performance-demo-gcp.git"

echo "🚀 Starting production deployment..."
echo "VM: $VM_NAME"
echo "Zone: $VM_ZONE"
echo "Repository: $REPO_URL"

# Deploy on VM
echo "📥 Pulling latest code and deploying on VM..."
gcloud compute ssh --zone "$VM_ZONE" "$VM_NAME" --project "$PROJECT_ID" --command "
cd ~/cloudflare-demo-ecommerce && \
echo '📥 Pulling latest changes from Git...' && \
git pull origin main && \
echo '🛑 Stopping existing containers...' && \
docker-compose down || true && \
echo '🔨 Building and starting new containers...' && \
docker-compose up -d --build && \
echo '⏳ Waiting for services to start...' && \
sleep 15 && \
echo '🧪 Testing deployment...' && \
curl -f http://localhost/health/ && \
echo '✅ Deployment completed successfully!'
"

echo "🎉 Production deployment completed!"
echo "🌐 App is available at: http://34.86.12.252"
echo "📊 Health check: http://34.86.12.252/health/"
