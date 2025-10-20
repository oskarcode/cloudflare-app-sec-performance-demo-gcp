#!/bin/bash

# Simple CI/CD Script for GCP VM Deployment
# Usage: ./deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
VM_ZONE="us-east4-b"
VM_NAME="oskar-appdemo-se"
PROJECT_ID="globalse-198312"
APP_DIR="~/cloudflare-demo-ecommerce"

echo "🚀 Starting deployment to GCP VM..."
echo "Environment: $ENVIRONMENT"
echo "VM: $VM_NAME"
echo "Zone: $VM_ZONE"

# Build Docker image locally
echo "🔨 Building Docker image locally..."
docker build -t cloudflare-demo-ecommerce:latest .

# Save image to tar file
echo "💾 Saving Docker image..."
docker save cloudflare-demo-ecommerce:latest | gzip > cloudflare-demo-ecommerce.tar.gz

# Upload image to VM
echo "📤 Uploading image to VM..."
gcloud compute scp --zone "$VM_ZONE" --project "$PROJECT_ID" cloudflare-demo-ecommerce.tar.gz oskarablimit@$VM_NAME:~/cloudflare-demo-ecommerce/

# Deploy on VM
echo "🚀 Deploying on VM..."
gcloud compute ssh --zone "$VM_ZONE" "$VM_NAME" --project "$PROJECT_ID" --command "
cd ~/cloudflare-demo-ecommerce && \
docker load < cloudflare-demo-ecommerce.tar.gz && \
docker stop cloudflare-demo-ecommerce || true && \
docker rm cloudflare-demo-ecommerce || true && \
docker run -d \
    --name cloudflare-demo-ecommerce \
    --restart unless-stopped \
    -p 8000:8000 \
    --env-file env.production \
    -v \$(pwd)/db.sqlite3:/app/db.sqlite3 \
    -v \$(pwd)/staticfiles:/app/staticfiles \
    -v \$(pwd)/media:/app/media \
    cloudflare-demo-ecommerce:latest && \
rm cloudflare-demo-ecommerce.tar.gz
"

# Clean up local files
rm cloudflare-demo-ecommerce.tar.gz

echo "✅ Deployment completed successfully!"
echo "🌐 App is available at: http://34.86.12.252"

# Test deployment
echo "🧪 Testing deployment..."
sleep 10
if curl -s http://34.86.12.252/health/ | grep -q "healthy"; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed!"
    exit 1
fi
