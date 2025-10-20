# VM Monitoring & Troubleshooting Guide

## 🔍 **VM Access & Navigation**

### **Connect to VM:**
```bash
gcloud compute ssh --zone "us-east4-b" "oskar-appdemo-se" --project "globalse-198312"
```

### **Key Directory Locations:**
```bash
# Project directory
cd ~/cloudflare-demo-ecommerce

# System directories
/etc/nginx/                    # Nginx configuration
/var/log/nginx/                # Nginx logs
/var/lib/docker/               # Docker data
/home/oskarablimit/            # User home directory
```

## 🐳 **Docker Container Management**

### **Check Container Status:**
```bash
# All containers
docker ps -a

# Running containers only
docker ps

# Container details
docker inspect <container_name>

# Container resource usage
docker stats
```

### **Container Logs:**
```bash
# All logs
docker-compose logs

# Specific service logs
docker-compose logs web
docker-compose logs nginx

# Follow logs in real-time
docker-compose logs -f web

# Last 50 lines
docker-compose logs --tail 50 web
```

### **Container Management:**
```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# Restart specific service
docker-compose restart web

# Rebuild and start
docker-compose up -d --build

# Execute commands inside container
docker-compose exec web bash
docker-compose exec nginx sh
```

## 🌐 **Nginx Web Server**

### **Check Nginx Status:**
```bash
# Check if nginx container is running
docker-compose ps nginx

# Check nginx configuration
docker-compose exec nginx nginx -t

# Reload nginx configuration
docker-compose exec nginx nginx -s reload

# Check nginx processes
docker-compose exec nginx ps aux
```

### **Nginx Logs:**
```bash
# Access logs
docker-compose exec nginx tail -f /var/log/nginx/access.log

# Error logs
docker-compose exec nginx tail -f /var/log/nginx/error.log

# All nginx logs
docker-compose logs nginx
```

### **Test Nginx Configuration:**
```bash
# Test configuration syntax
docker-compose exec nginx nginx -t

# Check loaded modules
docker-compose exec nginx nginx -V
```

## 🐍 **Django Application**

### **Check Django Status:**
```bash
# Check if web container is running
docker-compose ps web

# Check Django processes
docker-compose exec web ps aux

# Check Django logs
docker-compose logs web

# Check Django health endpoint
curl http://localhost:8000/health/
```

### **Django Management Commands:**
```bash
# Run Django shell
docker-compose exec web python manage.py shell

# Check Django configuration
docker-compose exec web python manage.py check

# Run migrations
docker-compose exec web python manage.py migrate

# Collect static files
docker-compose exec web python manage.py collectstatic

# Create superuser
docker-compose exec web python manage.py createsuperuser

# Check database
docker-compose exec web python manage.py dbshell
```

### **Django Debugging:**
```bash
# Check Django settings
docker-compose exec web python -c "from django.conf import settings; print(settings.DEBUG)"

# Check database connection
docker-compose exec web python -c "from django.db import connection; connection.ensure_connection()"

# Check installed apps
docker-compose exec web python -c "from django.conf import settings; print(settings.INSTALLED_APPS)"
```

## 🗄️ **Database Management**

### **SQLite Database:**
```bash
# Check database file
ls -la ~/cloudflare-demo-ecommerce/db.sqlite3

# Check database permissions
ls -la ~/cloudflare-demo-ecommerce/db.sqlite3

# Database file size
du -h ~/cloudflare-demo-ecommerce/db.sqlite3

# Backup database
cp ~/cloudflare-demo-ecommerce/db.sqlite3 ~/backup-$(date +%Y%m%d).sqlite3
```

### **Database Operations:**
```bash
# Connect to database
docker-compose exec web python manage.py dbshell

# Check database tables
docker-compose exec web python manage.py showmigrations

# Run specific migration
docker-compose exec web python manage.py migrate shop 0001

# Check database integrity
docker-compose exec web python -c "import sqlite3; conn = sqlite3.connect('/app/db.sqlite3'); conn.execute('PRAGMA integrity_check'); print('Database OK')"
```

## 📊 **System Monitoring**

### **System Resources:**
```bash
# CPU and memory usage
top
htop  # if available

# Disk usage
df -h
du -sh ~/cloudflare-demo-ecommerce/*

# Memory usage
free -h

# Network connections
netstat -tulpn
ss -tulpn
```

### **Docker System Info:**
```bash
# Docker system information
docker system info

# Docker disk usage
docker system df

# Clean up unused resources
docker system prune

# Check Docker logs
journalctl -u docker.service
```

### **Process Monitoring:**
```bash
# All processes
ps aux

# Docker processes
ps aux | grep docker

# Nginx processes
ps aux | grep nginx

# Python/Django processes
ps aux | grep python
```

## 🔧 **File System Navigation**

### **Project Structure:**
```bash
# Navigate to project
cd ~/cloudflare-demo-ecommerce

# List all files
ls -la

# Check file permissions
ls -la db.sqlite3
ls -la docker-compose.yml

# Check directory ownership
ls -la | head -10
```

### **Configuration Files:**
```bash
# Docker Compose configuration
cat docker-compose.yml

# Nginx configuration
cat nginx.conf

# Django settings
cat cloudflare_demo_ecommerce/settings.py

# Environment variables
cat env.production
```

### **Log Files:**
```bash
# Application logs
tail -f ~/cloudflare-demo-ecommerce/django.log

# System logs
tail -f /var/log/syslog

# Docker logs
journalctl -u docker.service -f
```

## 🚨 **Troubleshooting Commands**

### **Application Not Responding:**
```bash
# Check container status
docker-compose ps

# Check logs for errors
docker-compose logs web | tail -20

# Restart containers
docker-compose restart

# Check port binding
netstat -tulpn | grep :8000
netstat -tulpn | grep :80
```

### **Database Issues:**
```bash
# Check database file
ls -la db.sqlite3

# Fix permissions
sudo chown -R 1000:1000 ~/cloudflare-demo-ecommerce/

# Check database integrity
docker-compose exec web python manage.py check --database default
```

### **Nginx Issues:**
```bash
# Check nginx status
docker-compose ps nginx

# Test nginx config
docker-compose exec nginx nginx -t

# Check nginx logs
docker-compose logs nginx

# Restart nginx
docker-compose restart nginx
```

### **Permission Issues:**
```bash
# Check file ownership
ls -la ~/cloudflare-demo-ecommerce/

# Fix ownership
sudo chown -R 1000:1000 ~/cloudflare-demo-ecommerce/

# Check user in container
docker-compose exec web whoami
docker-compose exec web id
```

## 📈 **Performance Monitoring**

### **Container Performance:**
```bash
# Real-time container stats
docker stats

# Container resource usage
docker-compose exec web top
docker-compose exec nginx top
```

### **Application Performance:**
```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8000/

# Monitor logs for slow queries
docker-compose logs web | grep -i "slow"

# Check Django debug info
docker-compose exec web python manage.py check --deploy
```

## 🔍 **Debugging Commands**

### **Network Debugging:**
```bash
# Test local connectivity
curl http://localhost:8000/health/
curl http://localhost/health/

# Check external connectivity
curl http://34.86.12.252/health/

# Test DNS resolution
nslookup appdemo.oskarcode.com
```

### **Container Debugging:**
```bash
# Enter container shell
docker-compose exec web bash
docker-compose exec nginx sh

# Check container environment
docker-compose exec web env

# Check container network
docker-compose exec web netstat -tulpn
```

### **Application Debugging:**
```bash
# Django debug mode
docker-compose exec web python manage.py shell

# Check Django configuration
docker-compose exec web python -c "import django; django.setup(); from django.conf import settings; print(settings.ALLOWED_HOSTS)"

# Test database connection
docker-compose exec web python -c "from django.db import connection; cursor = connection.cursor(); cursor.execute('SELECT 1'); print('DB OK')"
```

## 📋 **Quick Reference Commands**

### **Essential Commands:**
```bash
# Check everything at once
docker-compose ps && echo "=== LOGS ===" && docker-compose logs --tail 10

# Quick health check
curl http://localhost:8000/health/ && curl http://localhost/health/

# Restart everything
docker-compose down && docker-compose up -d

# Check disk space
df -h && du -sh ~/cloudflare-demo-ecommerce/*

# Check system resources
free -h && top -bn1 | head -5
```

### **Emergency Commands:**
```bash
# Stop everything
docker-compose down

# Start everything
docker-compose up -d

# Rebuild everything
docker-compose down && docker-compose up -d --build

# Check logs for errors
docker-compose logs | grep -i error
```

---

**Pro Tip**: Create aliases for frequently used commands:
```bash
# Add to ~/.bashrc
alias dcl='docker-compose logs'
alias dcp='docker-compose ps'
alias dcu='docker-compose up -d'
alias dcd='docker-compose down'
alias dcr='docker-compose restart'
```
