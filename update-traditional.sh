#!/bin/bash

# Git-based Django Update Script for Traditional Deployment
# This script updates the Django application using Git pull

set -e

VM_ZONE="us-east4-b"
VM_NAME="oskar-appdemo-se"
PROJECT_ID="globalse-198312"
APP_DIR="/var/www/django-app"
REPO_URL="https://github.com/oskarcode/cloudflare-app-sec-performance-demo-gcp.git"

echo "🚀 Starting Git-based Django application update..."
echo "VM: $VM_NAME"
echo "Zone: $VM_ZONE"
echo "App Directory: $APP_DIR"
echo "Repository: $REPO_URL"

# Step 1: Pull latest changes from Git repository
echo "📥 Pulling latest changes from Git repository..."
gcloud compute ssh --zone "$VM_ZONE" "$VM_NAME" --project "$PROJECT_ID" --command "
cd $APP_DIR && \
git fetch origin && \
git reset --hard origin/main && \
echo '✅ Git pull completed successfully'
"

# Step 2: Run migrations, collect static, and restart Gunicorn
echo "🐍 Updating Python environment and Django..."
gcloud compute ssh --zone "$VM_ZONE" "$VM_NAME" --project "$PROJECT_ID" --command "
cd $APP_DIR && \
source venv/bin/activate && \
pip install -r requirements.txt && \
python manage.py migrate && \
python manage.py collectstatic --noinput && \
sudo systemctl restart django-app
"

# Step 3: Restart Nginx to ensure new static files are served
echo "🌐 Restarting Nginx..."
gcloud compute ssh --zone "$VM_ZONE" "$VM_NAME" --project "$PROJECT_ID" --command "
sudo nginx -t && \
sudo systemctl restart nginx
"

echo "🎉 Git-based update completed!"
echo "🌐 App is available at: http://34.86.12.252"
echo "📊 Health check: http://34.86.12.252/health/"