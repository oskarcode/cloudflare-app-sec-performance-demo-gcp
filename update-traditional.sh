#!/bin/bash

# Simple Django Update Script for Traditional Deployment
# This script updates the Django application without Docker

set -e

VM_ZONE="us-east4-b"
VM_NAME="oskar-appdemo-se"
PROJECT_ID="globalse-198312"
APP_DIR="/var/www/django-app"

echo "🚀 Starting Django application update..."
echo "VM: $VM_NAME"
echo "Zone: $VM_ZONE"
echo "App Directory: $APP_DIR"

# Update on VM
echo "📥 Updating Django application on VM..."
gcloud compute ssh --zone "$VM_ZONE" "$VM_NAME" --project "$PROJECT_ID" --command "
cd $APP_DIR

# Stop the service
sudo systemctl stop django-app

# Update Python dependencies (if requirements.txt changed)
source venv/bin/activate
pip install -r requirements.txt

# Run Django migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Restart the service
sudo systemctl start django-app

# Check status
sudo systemctl status django-app --no-pager

echo '✅ Django application updated successfully!'
"

echo "🎉 Update completed!"
echo "🌐 App is available at: http://34.86.12.252"
echo "📊 Health check: http://34.86.12.252/health/"
