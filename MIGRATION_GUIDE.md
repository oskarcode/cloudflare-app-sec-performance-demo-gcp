# 🚀 Server Migration Guide

This guide provides step-by-step instructions for migrating the entire Cloudflare Demo E-commerce project to a new server/VM.

## 📋 **Pre-Migration Checklist**

### **Source Server Information**
- [ ] Note current server IP: `34.86.12.252`
- [ ] Note current domain: `appdemo.oskarcode.com`
- [ ] Note current user: `oskar`
- [ ] Note project location: `/home/oskar/cloudflare-demo-ecommerce`
- [ ] Note GCP project: `globalse-198312`
- [ ] Note GCP zone: `us-east4-b`
- [ ] Note VM name: `oskar-appdemo-se`

### **Target Server Requirements**
- [ ] New server/VM provisioned
- [ ] SSH access configured
- [ ] Domain DNS updated (if changing domains)
- [ ] Cloudflare configuration updated (if changing domains)

## 🔧 **Step 1: Prepare Source Server**

### **1.1 Backup Current Configuration**
```bash
# Connect to source server
gcloud compute ssh --zone "us-east4-b" "oskar-appdemo-se" --project "globalse-198312"

# Create backup directory
mkdir -p ~/migration-backup
cd ~/migration-backup

# Backup project files
cp -r /home/oskar/cloudflare-demo-ecommerce ./project-backup

# Backup database
cp /home/oskar/cloudflare-demo-ecommerce/db.sqlite3 ./db-backup.sqlite3

# Backup Docker images (optional)
docker save cloudflare-demo-ecommerce_web:latest > web-image.tar
docker save nginx:alpine > nginx-image.tar

# Create configuration summary
cat > migration-info.txt << EOF
Source Server Migration Info
===========================
Date: $(date)
Source IP: 34.86.12.252
Domain: appdemo.oskarcode.com
User: oskar
Project Path: /home/oskar/cloudflare-demo-ecommerce
GCP Project: globalse-198312
GCP Zone: us-east4-b
VM Name: oskar-appdemo-se

Docker Images:
- cloudflare-demo-ecommerce_web:latest
- nginx:alpine

Database: db.sqlite3 (135KB)
EOF

# Compress backup
tar -czf migration-backup-$(date +%Y%m%d).tar.gz project-backup/ db-backup.sqlite3 *.tar migration-info.txt
```

### **1.2 Export Environment Variables**
```bash
# Export current environment for reference
cd /home/oskar/cloudflare-demo-ecommerce
cat > ~/migration-backup/env-reference.txt << EOF
Current Environment Variables:
=============================
DEBUG=False
SECRET_KEY=django-insecure-production-key-change-this
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0,34.86.12.252,appdemo.oskarcode.com

Docker Compose Services:
- web (Django + Gunicorn)
- nginx (Reverse Proxy)

Ports:
- 80 (HTTP)
- 443 (HTTPS)
- 8000 (Django)
EOF
```

## 🆕 **Step 2: Prepare Target Server**

### **2.1 Basic Server Setup**
```bash
# Connect to new server
ssh user@new-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y docker.io docker-compose-plugin git curl

# Enable Docker
sudo systemctl enable docker
sudo systemctl start docker

# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login again to apply group changes
exit
```

### **2.2 Install Google Cloud SDK (if needed)**
```bash
# Download and install gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Initialize gcloud (if using GCP)
gcloud init
```

## 📦 **Step 3: Transfer Project Files**

### **3.1 Method A: Direct Copy (if both servers accessible)**
```bash
# From source server
cd /home/oskar/migration-backup
scp migration-backup-*.tar.gz user@new-server-ip:~/

# On target server
cd ~
tar -xzf migration-backup-*.tar.gz
```

### **3.2 Method B: GitHub Repository (Recommended)**
```bash
# On target server
cd ~
git clone https://github.com/oskarcode/cloudflare-app-sec-performance-demo-gcp.git cloudflare-demo-ecommerce
cd cloudflare-demo-ecommerce

# Copy database from source server
scp user@source-server-ip:/home/oskar/cloudflare-demo-ecommerce/db.sqlite3 ./
```

### **3.3 Method C: Using gcloud (if both are GCP VMs)**
```bash
# From local machine
gcloud compute scp --zone="source-zone" "source-vm:/home/oskar/migration-backup/migration-backup-*.tar.gz" ./
gcloud compute scp --zone="target-zone" "migration-backup-*.tar.gz" "target-vm:~/"
```

## ⚙️ **Step 4: Configure Target Server**

### **4.1 Update Configuration Files**
```bash
# On target server
cd ~/cloudflare-demo-ecommerce

# Update docker-compose.yml with new IP/domain
nano docker-compose.yml
# Update ALLOWED_HOSTS with new server IP and domain

# Update nginx.conf with new domain
nano nginx.conf
# Update server_name with new domain

# Update deploy-production.sh with new server details
nano deploy-production.sh
# Update VM_ZONE, VM_NAME, PROJECT_ID variables
```

### **4.2 Example Configuration Updates**
```bash
# docker-compose.yml - Update ALLOWED_HOSTS
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0,NEW_SERVER_IP,NEW_DOMAIN.com

# nginx.conf - Update server_name
server_name NEW_DOMAIN.com NEW_SERVER_IP;

# deploy-production.sh - Update server details
VM_ZONE="new-gcp-zone"
VM_NAME="new-vm-name"
PROJECT_ID="new-gcp-project-id"
```

## 🚀 **Step 5: Deploy on Target Server**

### **5.1 Initial Deployment**
```bash
# On target server
cd ~/cloudflare-demo-ecommerce

# Set proper permissions
sudo chown -R $USER:$USER .

# Start the application
docker-compose up -d --build

# Check status
docker-compose ps

# Test health endpoint
curl http://localhost/health/
```

### **5.2 Verify External Access**
```bash
# Test from local machine
curl -I http://NEW_SERVER_IP/health/
curl -I http://NEW_DOMAIN.com/health/

# Test application functionality
curl http://NEW_DOMAIN.com/
curl http://NEW_DOMAIN.com/git-secrets/
```

## 🌐 **Step 6: Update DNS and Cloudflare**

### **6.1 Update DNS Records**
```bash
# Update A record
# OLD: appdemo.oskarcode.com → 34.86.12.252
# NEW: appdemo.oskarcode.com → NEW_SERVER_IP

# Or create new domain
# NEW: newdomain.com → NEW_SERVER_IP
```

### **6.2 Update Cloudflare Configuration**
1. **DNS Settings:**
   - Update A record to point to new server IP
   - Ensure proxy is enabled (orange cloud)

2. **SSL/TLS Settings:**
   - Set SSL mode to "Full" or "Full (Strict)"
   - Enable "Always Use HTTPS"

3. **Security Settings:**
   - Verify WAF rules are still active
   - Test security endpoints

## 🔄 **Step 7: Migration Verification**

### **7.1 Functional Testing**
```bash
# Test all endpoints
curl http://NEW_DOMAIN.com/                    # Homepage
curl http://NEW_DOMAIN.com/health/             # Health check
curl http://NEW_DOMAIN.com/git-secrets/        # WAF testing
curl http://NEW_DOMAIN.com/.env.backup         # WAF testing
curl http://NEW_DOMAIN.com/search?q=test       # Search functionality
curl http://NEW_DOMAIN.com/presentation/       # Presentation page
```

### **7.2 Security Testing**
```bash
# Test WAF protection
curl "http://NEW_DOMAIN.com/search?q=test' OR '1'='1' --"
curl "http://NEW_DOMAIN.com/.env.backup"
curl "http://NEW_DOMAIN.com/git-secrets/"

# Test rate limiting
for i in {1..15}; do curl -w "%{http_code}\n" -o /dev/null -s "http://NEW_DOMAIN.com/api/products/"; sleep 1; done
```

### **7.3 Performance Testing**
```bash
# Test response times
curl -w "@curl-format.txt" -o /dev/null -s http://NEW_DOMAIN.com/

# Monitor container resources
docker stats
```

## 🧹 **Step 8: Cleanup (Optional)**

### **8.1 Decommission Old Server**
```bash
# After confirming new server is working perfectly:

# Stop old containers
gcloud compute ssh --zone "us-east4-b" "oskar-appdemo-se" --project "globalse-198312" --command "cd /home/oskar/cloudflare-demo-ecommerce && docker-compose down"

# Optional: Delete old VM
gcloud compute instances delete oskar-appdemo-se --zone=us-east4-b --project=globalse-198312
```

### **8.2 Update Documentation**
```bash
# Update local documentation with new server details
# Update README.md with new IPs and domains
# Update deployment scripts with new server information
```

## 📋 **Migration Checklist**

### **Pre-Migration**
- [ ] Source server backed up
- [ ] Target server provisioned
- [ ] DNS records prepared
- [ ] Cloudflare configuration ready

### **Migration**
- [ ] Project files transferred
- [ ] Configuration updated
- [ ] Docker containers started
- [ ] Health checks passing
- [ ] External access verified

### **Post-Migration**
- [ ] DNS updated
- [ ] Cloudflare configured
- [ ] All endpoints tested
- [ ] Security features verified
- [ ] Performance validated
- [ ] Old server decommissioned (optional)

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Database Connection Issues**
```bash
# Check database file permissions
ls -la db.sqlite3
sudo chown -R $USER:$USER .

# Recreate database if needed
docker-compose exec web python manage.py migrate
docker-compose exec web python manage.py populate_products
```

#### **Container Won't Start**
```bash
# Check logs
docker-compose logs web
docker-compose logs nginx

# Check configuration
docker-compose config

# Rebuild containers
docker-compose down
docker-compose up -d --build
```

#### **Domain Not Working**
```bash
# Check ALLOWED_HOSTS
docker-compose exec web env | grep ALLOWED_HOSTS

# Check nginx configuration
docker-compose exec nginx nginx -t

# Check DNS propagation
nslookup NEW_DOMAIN.com
```

#### **SSL/HTTPS Issues**
```bash
# Check Cloudflare SSL settings
# Verify SSL mode is "Full" or "Full (Strict)"
# Check certificate validity
echo | openssl s_client -connect NEW_DOMAIN.com:443 -servername NEW_DOMAIN.com
```

## 📞 **Emergency Rollback**

If migration fails, you can quickly rollback:

```bash
# Update DNS back to old server
# OLD: NEW_DOMAIN.com → OLD_SERVER_IP

# Restart old server containers
gcloud compute ssh --zone "us-east4-b" "oskar-appdemo-se" --project "globalse-198312" --command "cd /home/oskar/cloudflare-demo-ecommerce && docker-compose up -d"
```

## 📚 **Additional Resources**

- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Detailed deployment instructions
- [VM_MONITORING_GUIDE.md](VM_MONITORING_GUIDE.md) - Server monitoring and troubleshooting
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Essential commands

---

**💡 Pro Tip**: Always test the migration on a staging environment first before migrating production systems.

**⏱️ Estimated Migration Time**: 2-4 hours (depending on server setup and testing)

**🔄 Rollback Time**: 5-10 minutes (if old server is still available)
