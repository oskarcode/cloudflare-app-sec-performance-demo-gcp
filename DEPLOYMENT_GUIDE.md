# Cloudflare Demo Ecommerce - Deployment Guide

## 🚀 **Quick Start**

Your Django ecommerce application is now running on Google Cloud VM with Docker Compose!

- **Live Application**: http://appdemo.oskarcode.com
- **Health Check**: http://appdemo.oskarcode.com/health/
- **VM IP**: http://34.86.12.252

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Internet      │    │   Nginx         │    │   Django        │
│   (Port 80)     │───▶│   Reverse Proxy │───▶│   + Gunicorn    │
│                 │    │   (Port 80)     │    │   (Port 8000)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   SQLite DB     │
                       │   (Persistent)  │
                       └─────────────────┘
```

### **Components:**
- **VM**: `oskar-appdemo-se` in `us-east4-b` zone
- **Web Container**: Django + Gunicorn (2 workers)
- **Nginx Container**: Reverse proxy + static file serving
- **Database**: SQLite (persistent via volume mount)
- **Domain**: `appdemo.oskarcode.com`

## 🔄 **Git Workflow & Updates**

### **Repository:**
- **GitHub**: https://github.com/oskarcode/cloudflare-app-sec-performance-demo-gcp.git
- **Branch**: `main`

### **Making Updates:**

1. **Make changes locally:**
   ```bash
   # Edit files in your local project
   # Test locally with: docker-compose up
   ```

2. **Commit and push:**
   ```bash
   git add .
   git commit -m "Description of your changes"
   git push origin main
   ```

3. **Deploy to production:**
   ```bash
   ./deploy-production.sh
   ```

### **What the deployment script does:**
- Pulls latest code from Git
- Stops existing containers
- Builds new Docker images
- Starts containers with new code
- Tests the deployment
- Reports success/failure

## 🛠️ **Development Setup**

### **Local Development:**

1. **Clone repository:**
   ```bash
   git clone https://github.com/oskarcode/cloudflare-app-sec-performance-demo-gcp.git
   cd cloudflare-app-sec-performance-demo-gcp
   ```

2. **Start local development:**
   ```bash
   docker-compose up --build
   ```

3. **Access locally:**
   - Application: http://localhost:8000
   - Through Nginx: http://localhost

### **Environment Variables:**

The application uses these environment variables:

```bash
DEBUG=False                                    # Production mode
SECRET_KEY=django-insecure-production-key     # Change this!
ALLOWED_HOSTS=appdemo.oskarcode.com,34.86.12.252  # Allowed domains
```

## 📁 **Project Structure**

```
cloudflare_demo_ecommerce/
├── cloudflare_demo_ecommerce/     # Django project settings
├── shop/                          # Main Django app
│   ├── templates/shop/           # HTML templates
│   ├── views.py                  # Django views
│   └── urls.py                   # URL routing
├── static/                       # Static files (CSS, JS, images)
├── media/                        # User uploads
├── docker-compose.yml            # Container orchestration
├── Dockerfile                    # Web container definition
├── nginx.conf                    # Nginx configuration
├── requirements.txt              # Python dependencies
├── deploy-production.sh          # Production deployment script
└── db.sqlite3                    # SQLite database
```

## 🔧 **Configuration Files**

### **docker-compose.yml**
- Defines web and nginx services
- Sets up volume mounts for persistence
- Configures environment variables
- Sets up health checks

### **nginx.conf**
- Reverse proxy configuration
- Static file serving
- Security headers
- Domain configuration

### **Dockerfile**
- Python 3.11 slim base image
- Installs dependencies
- Creates non-root user
- Sets up health checks

## 🚨 **Troubleshooting**

### **Application not accessible:**

1. **Check container status:**
   ```bash
   gcloud compute ssh --zone "us-east4-b" "oskar-appdemo-se" --project "globalse-198312" --command "cd ~/cloudflare-demo-ecommerce && docker-compose ps"
   ```

2. **Check logs:**
   ```bash
   gcloud compute ssh --zone "us-east4-b" "oskar-appdemo-se" --project "globalse-198312" --command "cd ~/cloudflare-demo-ecommerce && docker-compose logs web"
   ```

3. **Restart containers:**
   ```bash
   gcloud compute ssh --zone "us-east4-b" "oskar-appdemo-se" --project "globalse-198312" --command "cd ~/cloudflare-demo-ecommerce && docker-compose restart"
   ```

### **Database issues:**

1. **Check database permissions:**
   ```bash
   gcloud compute ssh --zone "us-east4-b" "oskar-appdemo-se" --project "globalse-198312" --command "cd ~/cloudflare-demo-ecommerce && ls -la db.sqlite3"
   ```

2. **Fix permissions:**
   ```bash
   gcloud compute ssh --zone "us-east4-b" "oskar-appdemo-se" --project "globalse-198312" --command "cd ~/cloudflare-demo-ecommerce && sudo chown -R 1000:1000 ."
   ```

### **Domain not working:**

1. **Check DNS settings:**
   - Ensure `appdemo.oskarcode.com` points to `34.86.12.252`
   - Check DNS propagation: https://dnschecker.org

2. **Check nginx configuration:**
   ```bash
   gcloud compute ssh --zone "us-east4-b" "oskar-appdemo-se" --project "globalse-198312" --command "cd ~/cloudflare-demo-ecommerce && docker-compose logs nginx"
   ```

## 🔐 **Security Features**

### **WAF Testing Endpoints:**
- **Git Secrets**: http://appdemo.oskarcode.com/git-secrets/
- **Environment Backup**: http://appdemo.oskarcode.com/.env.backup
- **Search (SQL Injection)**: http://appdemo.oskarcode.com/search/

### **Security Headers:**
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- Content Security Policy (configurable)

## 📊 **Monitoring**

### **Health Checks:**
- **Application Health**: http://appdemo.oskarcode.com/health/
- **Container Health**: Built into Docker Compose

### **Logs:**
```bash
# Application logs
docker-compose logs web

# Nginx logs
docker-compose logs nginx

# All logs
docker-compose logs
```

## 🔄 **Backup & Recovery**

### **Database Backup:**
```bash
# Copy database file
gcloud compute scp --zone "us-east4-b" "oskar-appdemo-se:~/cloudflare-demo-ecommerce/db.sqlite3" ./backup-$(date +%Y%m%d).sqlite3 --project "globalse-198312"
```

### **Full Project Backup:**
```bash
# Copy entire project
gcloud compute scp --zone "us-east4-b" --recurse "oskar-appdemo-se:~/cloudflare-demo-ecommerce" ./backup-$(date +%Y%m%d) --project "globalse-198312"
```

## 🚀 **Scaling & Future Improvements**

### **Current Setup:**
- Single VM deployment
- SQLite database
- 2 Gunicorn workers
- Nginx reverse proxy

### **Future Enhancements:**
- **Load Balancer**: Add Google Cloud Load Balancer
- **Database**: Migrate to Cloud SQL (PostgreSQL/MySQL)
- **SSL**: Add Let's Encrypt certificates
- **CDN**: Add Cloudflare CDN
- **Monitoring**: Add Prometheus/Grafana
- **CI/CD**: Add GitHub Actions for automated testing

## 📞 **Support**

### **Useful Commands:**

```bash
# Connect to VM
gcloud compute ssh --zone "us-east4-b" "oskar-appdemo-se" --project "globalse-198312"

# Deploy updates
./deploy-production.sh

# Check status
curl http://appdemo.oskarcode.com/health/

# View logs
docker-compose logs -f web
```

### **Emergency Procedures:**

1. **Rollback to previous version:**
   ```bash
   git log --oneline  # Find previous commit
   git checkout <previous-commit-hash>
   ./deploy-production.sh
   ```

2. **Restart everything:**
   ```bash
   gcloud compute ssh --zone "us-east4-b" "oskar-appdemo-se" --project "globalse-198312" --command "cd ~/cloudflare-demo-ecommerce && docker-compose down && docker-compose up -d"
   ```

---

**Last Updated**: October 2024  
**Version**: 1.0  
**Maintainer**: Oskar Ablimit
