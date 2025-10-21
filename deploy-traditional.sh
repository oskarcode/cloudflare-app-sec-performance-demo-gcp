#!/bin/bash

# Traditional Django + Nginx Deployment Script for GCP VM
# This script deploys Django without Docker containers

set -e

VM_ZONE="us-east4-b"
VM_NAME="oskar-appdemo-se"
PROJECT_ID="globalse-198312"
APP_DIR="/opt/django-app"
REPO_URL="https://github.com/oskarcode/cloudflare-app-sec-performance-demo-gcp.git"

echo "🚀 Starting traditional Django deployment..."
echo "VM: $VM_NAME"
echo "Zone: $VM_ZONE"
echo "App Directory: $APP_DIR"

# Deploy on VM
echo "📥 Setting up Django application on VM..."
gcloud compute ssh --zone "$VM_ZONE" "$VM_NAME" --project "$PROJECT_ID" --command "
# Create app directory
sudo mkdir -p $APP_DIR
sudo chown oskar:oskar $APP_DIR

# Install system packages
sudo apt update
sudo apt install -y python3 python3-pip python3-venv nginx supervisor

# Clone repository
cd $APP_DIR
git clone $REPO_URL .

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Set up Django
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py populate_products

# Create Gunicorn configuration
cat > gunicorn.conf.py << 'EOF'
bind = '127.0.0.1:8000'
workers = 2
worker_class = 'sync'
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 100
timeout = 30
keepalive = 2
preload_app = True
user = 'oskar'
group = 'oskar'
tmp_upload_dir = None
errorlog = '/var/log/gunicorn/error.log'
accesslog = '/var/log/gunicorn/access.log'
loglevel = 'info'
EOF

# Create log directory
sudo mkdir -p /var/log/gunicorn
sudo chown oskar:oskar /var/log/gunicorn

# Create systemd service
sudo tee /etc/systemd/system/django-app.service > /dev/null << 'EOF'
[Unit]
Description=Django App
After=network.target

[Service]
Type=notify
User=oskar
Group=oskar
WorkingDirectory=$APP_DIR
Environment=PATH=$APP_DIR/venv/bin
ExecStart=$APP_DIR/venv/bin/gunicorn --config gunicorn.conf.py cloudflare_demo_ecommerce.wsgi:application
ExecReload=/bin/kill -s HUP \$MAINPID
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# Configure Nginx
sudo tee /etc/nginx/sites-available/django-app > /dev/null << 'EOF'
server {
    listen 80;
    server_name appdemo.oskarcode.com 34.86.12.252;
    
    # Security headers
    add_header X-Frame-Options \"SAMEORIGIN\";
    add_header X-Content-Type-Options \"nosniff\";
    
    # Serve static files directly
    location /static/ {
        alias $APP_DIR/staticfiles/;
        expires 30d;
        add_header Cache-Control \"public, immutable\";
    }
    
    # Serve vulnerable static files for demo
    location /.git/secrets.txt {
        alias $APP_DIR/static/.git/secrets.txt;
        add_header Content-Type text/plain;
    }
    
    location /config/database.yml {
        alias $APP_DIR/static/config/database.yml;
        add_header Content-Type text/plain;
    }
    
    # Proxy all other requests to Django
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Health check endpoint
    location /health/ {
        access_log off;
        return 200 \"healthy\\n\";
        add_header Content-Type text/plain;
    }
}
EOF

# Enable Nginx site
sudo ln -sf /etc/nginx/sites-available/django-app /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Start services
sudo systemctl daemon-reload
sudo systemctl enable django-app
sudo systemctl start django-app
sudo systemctl restart nginx

# Check status
sudo systemctl status django-app --no-pager
sudo systemctl status nginx --no-pager

echo '✅ Traditional Django deployment completed!'
"

echo "🎉 Traditional deployment completed!"
echo "🌐 App is available at: http://34.86.12.252"
echo "📊 Health check: http://34.86.12.252/health/"
