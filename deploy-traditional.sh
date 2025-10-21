#!/bin/bash

# Traditional Django + Nginx Deployment Script for GCP VM
# This script deploys Django without Docker containers

set -e

VM_ZONE="us-east4-b"
VM_NAME="oskar-appdemo-se"
PROJECT_ID="globalse-198312"
APP_DIR="/var/www/django-app"
USER="oskarablimit"
REPO_URL="https://github.com/oskarcode/cloudflare-app-sec-performance-demo-gcp.git"

echo "🚀 Starting traditional Django deployment..."
echo "VM: $VM_NAME"
echo "Zone: $VM_ZONE"
echo "App Directory: $APP_DIR"

# Step 1: Install system packages and set up application directory
echo "📥 Setting up Django application on VM..."
gcloud compute ssh --zone "$VM_ZONE" "$VM_NAME" --project "$PROJECT_ID" --command "
sudo apt update && \
sudo apt install -y python3 python3-pip python3-venv nginx supervisor && \
sudo mkdir -p $APP_DIR && \
sudo chown $USER:$USER $APP_DIR
"

# Step 2: Clone Git repository
echo "📥 Cloning Git repository..."
gcloud compute ssh --zone "$VM_ZONE" "$VM_NAME" --project "$PROJECT_ID" --command "
cd $APP_DIR && \
git clone $REPO_URL . && \
echo '✅ Git repository cloned successfully'
"

# Step 3: Set up virtual environment, install dependencies, run migrations, collect static
echo "🐍 Setting up Python environment and Django..."
gcloud compute ssh --zone "$VM_ZONE" "$VM_NAME" --project "$PROJECT_ID" --command "
cd $APP_DIR && \
python3 -m venv venv && \
source venv/bin/activate && \
pip install -r requirements.txt && \
python manage.py migrate && \
python manage.py populate_products && \
python manage.py collectstatic --noinput
"

# Step 4: Configure Gunicorn systemd service
echo "⚙️ Configuring Gunicorn systemd service..."
GUNICORN_SERVICE_CONTENT="[Unit]
Description=Django App
After=network.target

[Service]
User=$USER
Group=$USER
WorkingDirectory=$APP_DIR
ExecStart=$APP_DIR/venv/bin/gunicorn --bind 127.0.0.1:8000 --workers 2 cloudflare_demo_ecommerce.wsgi:application
Restart=on-failure

[Install]
WantedBy=multi-user.target"

gcloud compute ssh --zone "$VM_ZONE" "$VM_NAME" --project "$PROJECT_ID" --command "
echo \"$GUNICORN_SERVICE_CONTENT\" | sudo tee /etc/systemd/system/django-app.service && \
sudo systemctl daemon-reload && \
sudo systemctl enable django-app && \
sudo systemctl start django-app
"

# Step 5: Configure Nginx
echo "🌐 Configuring Nginx..."
NGINX_CONF_CONTENT="events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name appdemo.oskarcode.com 34.86.12.252;

        add_header X-Frame-Options \"SAMEORIGIN\";
        add_header X-Content-Type-Options \"nosniff\";

        location /static/ {
            alias $APP_DIR/staticfiles/;
            expires 30d;
            add_header Cache-Control \"public, immutable\";
        }

        location /.git/secrets.txt {
            alias $APP_DIR/staticfiles/.git/secrets.txt;
            add_header Content-Type text/plain;
        }

        location /config/database.yml {
            alias $APP_DIR/staticfiles/config/database.yml;
            add_header Content-Type text/plain;
        }

        location / {
            proxy_pass http://127.0.0.1:8000;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        location /health/ {
            access_log off;
            return 200 \"healthy\\n\";
            add_header Content-Type text/plain;
        }
    }
}"

gcloud compute ssh --zone "$VM_ZONE" "$VM_NAME" --project "$PROJECT_ID" --command "
echo \"$NGINX_CONF_CONTENT\" | sudo tee /etc/nginx/nginx.conf && \
sudo nginx -t && \
sudo systemctl restart nginx
"

echo "🎉 Traditional deployment completed!"
echo "🌐 App is available at: http://34.86.12.252"
echo "📊 Health check: http://34.86.12.252/health/"
