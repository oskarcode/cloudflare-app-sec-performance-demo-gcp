# 🚀 Quick Reference Card - VM Monitoring

## 🔌 **Connect to VM**
```bash
gcloud compute ssh --zone "us-east4-b" "oskar-appdemo-se" --project "globalse-198312"
```

## 📍 **Navigate to Project**
```bash
cd /var/www/django-app
```

## 🐍 **Django Service Commands**
```bash
# Check status
sudo systemctl status django-app

# View logs
sudo journalctl -u django-app -f

# Restart service
sudo systemctl restart django-app

# Stop/Start service
sudo systemctl stop django-app
sudo systemctl start django-app
```

## 🌐 **Nginx Commands**
```bash
# Check status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Restart service
sudo systemctl restart nginx

# Reload configuration
sudo systemctl reload nginx
```

## 🌐 **Application Health**
```bash
# Test endpoints
curl http://localhost:8000/health/
curl http://localhost/health/
curl http://34.86.12.252/health/

# Check application
curl http://localhost:8000 | grep -i "demo store"
```

## 📊 **System Status**
```bash
# Resources
free -h
df -h

# Processes
ps aux | grep gunicorn
ps aux | grep nginx

# Network
netstat -tulpn | grep :80
netstat -tulpn | grep :8000
```

## 🗄️ **Database**
```bash
# Check database file
ls -la /var/www/django-app/db.sqlite3

# Django database commands
cd /var/www/django-app
source venv/bin/activate
python manage.py dbshell
python manage.py showmigrations
```

## 🚨 **Emergency Commands**
```bash
# Restart everything
sudo systemctl restart django-app nginx

# Check all services
sudo systemctl status django-app nginx

# Fix permissions
sudo chown -R oskarablimit:oskarablimit /var/www/django-app

# Check logs for errors
sudo journalctl --since "1 hour ago" --priority=err
```

## 📁 **Key Files**
```bash
# Configuration files
cat /etc/nginx/nginx.conf
cat /etc/systemd/system/django-app.service
cat /var/www/django-app/cloudflare_demo_ecommerce/settings.py

# Log files
sudo journalctl -u django-app --no-pager -n 50
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🔧 **Troubleshooting**
```bash
# Complete status check
sudo systemctl status django-app nginx && echo "=== LOGS ===" && sudo journalctl -u django-app --no-pager -n 10

# Quick health check
curl http://localhost:8000/health/ && curl http://localhost/health/

# Restart everything
sudo systemctl restart django-app nginx
```

## 🛠️ **Django Management**
```bash
# Navigate to project
cd /var/www/django-app

# Activate virtual environment
source venv/bin/activate

# Run Django commands
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py populate_products

# Check Django
python manage.py check
```

## 📈 **Performance Monitoring**
```bash
# Check system resources
htop

# Monitor logs in real-time
sudo tail -f /var/log/nginx/access.log
sudo journalctl -u django-app -f

# Check active connections
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :8000
```

---
**💡 Pro Tip**: Create aliases in `~/.bashrc`:
```bash
alias djstatus='sudo systemctl status django-app'
alias djlogs='sudo journalctl -u django-app -f'
alias djrestart='sudo systemctl restart django-app'
alias ngstatus='sudo systemctl status nginx'
alias ngrestart='sudo systemctl restart nginx'
alias health='curl http://localhost:8000/health/'
```