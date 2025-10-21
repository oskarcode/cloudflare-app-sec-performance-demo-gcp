# VM Monitoring & Troubleshooting Guide

## 🔍 **VM Access & Navigation**

### **Connect to VM:**
```bash
gcloud compute ssh --zone "us-east4-b" "oskar-appdemo-se" --project "globalse-198312"
```

### **Key Directory Locations:**
```bash
# Project directory
cd /var/www/django-app

# System directories
/etc/nginx/                    # Nginx configuration
/var/log/nginx/                # Nginx logs
/etc/systemd/system/           # Systemd services
/home/oskarablimit/            # User home directory
```

## 🐍 **Django Application Management**

### **Check Django Service Status:**
```bash
# Django service status
sudo systemctl status django-app

# Django service logs
sudo journalctl -u django-app -f

# Restart Django service
sudo systemctl restart django-app
```

### **Check Nginx Status:**
```bash
# Nginx service status
sudo systemctl status nginx

# Nginx configuration test
sudo nginx -t

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### **Check Application Logs:**
```bash
# Django application logs
sudo journalctl -u django-app --no-pager -n 50

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

## 🌐 **Nginx Web Server**

### **Check Nginx Status:**
```bash
# Check if nginx is running
sudo systemctl status nginx

# Check nginx configuration
sudo nginx -t

# Reload nginx configuration
sudo systemctl reload nginx
```

### **Nginx Configuration:**
```bash
# Main configuration file
sudo nano /etc/nginx/nginx.conf

# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

## 🐍 **Django Application**

### **Check Django Status:**
```bash
# Check if Django service is running
sudo systemctl status django-app

# Check Django processes
ps aux | grep gunicorn

# Check Django logs
sudo journalctl -u django-app --no-pager -n 50

# Check Django health endpoint
curl http://localhost:8000/health/
```

### **Django Management Commands:**
```bash
# Navigate to project directory
cd /var/www/django-app

# Activate virtual environment
source venv/bin/activate

# Run Django commands
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py populate_products

# Check Django shell
python manage.py shell

# Create superuser
python manage.py createsuperuser
```

## 💾 **Database Management**

### **SQLite Database:**
```bash
# Navigate to project directory
cd /var/www/django-app

# Check database file
ls -la db.sqlite3

# Backup database
cp db.sqlite3 db.sqlite3.backup.$(date +%Y%m%d_%H%M%S)

# Check database integrity
sqlite3 db.sqlite3 "PRAGMA integrity_check;"

# View database schema
sqlite3 db.sqlite3 ".schema"
```

### **Database Operations:**
```bash
# Run migrations
cd /var/www/django-app
source venv/bin/activate
python manage.py migrate

# Create migrations
python manage.py makemigrations

# Show migration status
python manage.py showmigrations
```

## 🔧 **System Monitoring**

### **System Resources:**
```bash
# Check system resources
htop
# or
top

# Check memory usage
free -h

# Check disk usage
df -h

# Check disk usage by directory
du -sh /var/www/django-app/*
```

### **Process Monitoring:**
```bash
# Check running processes
ps aux | grep -E "(nginx|gunicorn|python)"

# Check systemd services
systemctl list-units --type=service --state=running

# Check service status
sudo systemctl status django-app nginx
```

## 🚨 **Troubleshooting**

### **Common Issues:**

#### **Django Service Not Starting:**
```bash
# Check service status
sudo systemctl status django-app

# Check logs
sudo journalctl -u django-app --no-pager -n 50

# Check configuration
cd /var/www/django-app
source venv/bin/activate
python manage.py check
```

#### **Nginx Not Starting:**
```bash
# Check nginx status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log
```

#### **Database Issues:**
```bash
# Check database file permissions
ls -la /var/www/django-app/db.sqlite3

# Fix permissions if needed
sudo chown oskarablimit:oskarablimit /var/www/django-app/db.sqlite3

# Check database integrity
cd /var/www/django-app
sqlite3 db.sqlite3 "PRAGMA integrity_check;"
```

#### **Static Files Not Loading:**
```bash
# Check static files directory
ls -la /var/www/django-app/staticfiles/

# Collect static files
cd /var/www/django-app
source venv/bin/activate
python manage.py collectstatic --noinput

# Check nginx static file configuration
sudo nginx -t
```

### **Performance Monitoring:**
```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s https://appdemo.oskarcode.com/

# Monitor real-time logs
sudo tail -f /var/log/nginx/access.log | grep -E "(GET|POST)"

# Check active connections
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :8000
```

## 🔄 **Service Management**

### **Start/Stop Services:**
```bash
# Start services
sudo systemctl start django-app
sudo systemctl start nginx

# Stop services
sudo systemctl stop django-app
sudo systemctl stop nginx

# Restart services
sudo systemctl restart django-app
sudo systemctl restart nginx

# Enable services (start on boot)
sudo systemctl enable django-app
sudo systemctl enable nginx
```

### **Service Configuration:**
```bash
# Edit Django service
sudo systemctl edit django-app

# Edit Nginx configuration
sudo nano /etc/nginx/nginx.conf

# Reload configurations
sudo systemctl daemon-reload
sudo nginx -t && sudo systemctl reload nginx
```

## 📊 **Health Checks**

### **Application Health:**
```bash
# Django health endpoint
curl http://localhost:8000/health/

# External health check
curl https://appdemo.oskarcode.com/health/

# Check all endpoints
curl -I https://appdemo.oskarcode.com/
curl -I https://appdemo.oskarcode.com/presentation/
curl -I https://appdemo.oskarcode.com/search/
```

### **System Health:**
```bash
# Check all services
sudo systemctl status django-app nginx

# Check system resources
htop

# Check logs for errors
sudo journalctl --since "1 hour ago" --priority=err
```

## 🛠️ **Quick Fixes**

### **Restart Everything:**
```bash
sudo systemctl restart django-app nginx
```

### **Update Application:**
```bash
cd /var/www/django-app
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart django-app
```

### **Check Everything:**
```bash
# Service status
sudo systemctl status django-app nginx

# Configuration test
sudo nginx -t

# Health check
curl https://appdemo.oskarcode.com/health/
```

This guide covers all the essential monitoring and troubleshooting commands for your traditional Django + Nginx deployment!