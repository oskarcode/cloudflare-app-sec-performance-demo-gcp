# 🚀 Quick Reference Card - VM Monitoring

## 🔌 **Connect to VM**
```bash
gcloud compute ssh --zone "us-east4-b" "oskar-appdemo-se" --project "globalse-198312"
```

## 📍 **Navigate to Project**
```bash
cd ~/cloudflare-demo-ecommerce
```

## 🐳 **Docker Commands**
```bash
# Check status
docker-compose ps

# View logs
docker-compose logs web
docker-compose logs nginx

# Restart services
docker-compose restart
docker-compose restart web

# Rebuild and start
docker-compose up -d --build
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
ps aux | grep docker
ps aux | grep nginx

# Network
netstat -tulpn | grep :80
netstat -tulpn | grep :8000
```

## 🗄️ **Database**
```bash
# Check database file
ls -la db.sqlite3

# Django database commands
docker-compose exec web python manage.py dbshell
docker-compose exec web python manage.py showmigrations
```

## 🚨 **Emergency Commands**
```bash
# Stop everything
docker-compose down

# Start everything
docker-compose up -d

# Fix permissions
sudo chown -R 1000:1000 .

# Check logs for errors
docker-compose logs | grep -i error
```

## 📁 **Key Files**
```bash
# Configuration files
cat docker-compose.yml
cat nginx.conf
cat cloudflare_demo_ecommerce/settings.py

# Log files
docker-compose logs web
docker-compose logs nginx
```

## 🔧 **Troubleshooting**
```bash
# Complete status check
docker-compose ps && echo "=== LOGS ===" && docker-compose logs --tail 10

# Quick health check
curl http://localhost:8000/health/ && curl http://localhost/health/

# Restart everything
docker-compose down && docker-compose up -d
```

---
**💡 Pro Tip**: Create aliases in `~/.bashrc`:
```bash
alias dcl='docker-compose logs'
alias dcp='docker-compose ps'
alias dcu='docker-compose up -d'
alias dcd='docker-compose down'
alias dcr='docker-compose restart'
```
