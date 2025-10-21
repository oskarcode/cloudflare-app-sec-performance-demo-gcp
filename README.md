# Cloudflare Security Demo E-commerce Site

A deliberately vulnerable Django e-commerce application designed to demonstrate Cloudflare's security features including WAF, Bot Management, Rate Limiting, DDoS Protection, and Access Rules.

**🌐 Live Demo:** https://appdemo.oskarcode.com  
**📊 Presentation:** https://appdemo.oskarcode.com/presentation/  
**🔧 Health Check:** https://appdemo.oskarcode.com/health/

## ⚠️ Security Warning

This application contains **intentional vulnerabilities** for demonstration purposes only.
- **Never deploy this to a production environment**
- **Do not use real credentials or sensitive data**
- **Only use in controlled demo/testing environments**

## 🎯 Project Overview

This demo site showcases how Cloudflare's security features protect against common web application attacks:
- **SQL Injection** - Vulnerable search endpoint for WAF testing
- **Credential Exposure** - Exposed configuration files and git secrets for access rule testing  
- **Bot Attacks** - Bot-attractive endpoints for bot management testing
- **Rate Limiting** - API endpoints for rate limiting demonstration
- **DDoS Simulation** - Load testing endpoints

## 🏗️ Architecture

**Current Deployment:** Google Cloud Platform VM with Traditional Django + Nginx
- **Web Server:** Nginx (reverse proxy)
- **Application:** Django 5.2.7 with Gunicorn
- **Database:** SQLite (for simplicity)
- **Process Management:** systemd service
- **Domain:** appdemo.oskarcode.com

## 🔧 Development Setup

### Prerequisites
- Python 3.11+
- Git
- Google Cloud SDK (for deployment)

### Local Development
```bash
# Clone repository
git clone https://github.com/oskarcode/cloudflare-app-sec-performance-demo-gcp.git
cd cloudflare-app-sec-performance-demo-gcp

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Populate database with demo products
python manage.py populate_products

# Start development server
python manage.py runserver
```

Visit http://localhost:8000 to see the application.

### Traditional Python Setup (Alternative)
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup database
python manage.py migrate
python manage.py populate_products
python manage.py collectstatic --noinput

# Run development server
python manage.py runserver 0.0.0.0:8000
```

## 🚀 Production Deployment

### Google Cloud Platform VM Deployment (Current Setup)

#### Prerequisites
- Google Cloud SDK installed locally
- Access to GCP project: `globalse-198312`
- VM: `oskar-appdemo-se` in zone `us-east4-b`

#### One-Command Deployment
```bash
# Deploy to production VM
./deploy-traditional.sh
```

This script will:
1. Connect to your GCP VM
2. Set up traditional Django + Nginx deployment
3. Install Python dependencies
4. Configure systemd service
5. Set up Nginx reverse proxy
6. Run health checks
7. Verify deployment

#### Manual VM Setup (First Time Only)
```bash
# Connect to VM
gcloud compute ssh --zone "us-east4-b" "oskar-appdemo-se" --project "globalse-198312"

# Install system packages
sudo apt update
sudo apt install -y python3 python3-pip python3-venv nginx supervisor

# Set up application directory
sudo mkdir -p /var/www/django-app
sudo chown oskarablimit:oskarablimit /var/www/django-app
```

### AWS EC2 Deployment (Legacy)

#### 1. Server Setup
```bash
# Connect to server
ssh -i /path/to/your-key.pem ubuntu@YOUR_SERVER_IP

# Update system
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-pip python3-venv nginx
```

#### 2. Application Deployment
```bash
# Transfer files using rsync
rsync -avz --delete -e "ssh -i /path/to/your-key.pem" \
  ./cloudflare_demo_ecommerce/ \
  ubuntu@YOUR_SERVER_IP:/home/ubuntu/cloudflare_demo_ecommerce/ \
  --exclude 'venv/' --exclude '*.pyc' --exclude '__pycache__/'

# Setup on server
ssh -i /path/to/your-key.pem ubuntu@YOUR_SERVER_IP
cd /home/ubuntu/cloudflare_demo_ecommerce

# Setup Python environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Setup database
python manage.py migrate
python manage.py populate_products
python manage.py collectstatic --noinput

# Set production settings
sed -i 's/DEBUG = True/DEBUG = False/' cloudflare_demo_ecommerce/settings.py
```

#### 3. Nginx Configuration
```bash
# Update nginx site configuration
sudo cp nginx.conf /etc/nginx/sites-available/your-site
sudo ln -s /etc/nginx/sites-available/your-site /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

#### 4. Start Services
```bash
# Start Django (development server for demo)
cd /home/ubuntu/cloudflare_demo_ecommerce
source venv/bin/activate
nohup python manage.py runserver 0.0.0.0:8000 > django.log 2>&1 &

# For production, use Gunicorn:
# gunicorn --bind 0.0.0.0:8000 --workers 3 cloudflare_demo_ecommerce.wsgi:application
```

### Docker Deployment (Alternative)
```bash
# Build and run containers
docker-compose up -d --build

# Populate database
docker-compose exec web python manage.py populate_products

# Check status
docker-compose ps
```

## 📚 Documentation

### Comprehensive Guides
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Complete deployment and maintenance guide
- **[VM_MONITORING_GUIDE.md](VM_MONITORING_GUIDE.md)** - VM monitoring and troubleshooting
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Essential commands cheat sheet
- **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** - Complete server migration guide

### Key Files
- **`docker-compose.yml`** - Container orchestration
- **`Dockerfile`** - Application containerization
- **`nginx.conf`** - Reverse proxy configuration
- **`deploy-production.sh`** - Automated deployment script
- **`env.production`** - Production environment variables

## 🔄 Git Workflow & Deployment

### Simple Workflow
```bash
# 1. Make changes locally
git add .
git commit -m "Your changes"
git push origin main

# 2. Deploy to production
./deploy-production.sh
```

### Available Scripts
- **`deploy-production.sh`** - Deploy to GCP VM (main deployment script)
- **`new-feature.sh`** - Start new feature branch (if using feature branches)
- **`finish-feature.sh`** - Complete and merge feature (if using feature branches)

## ☁️ Cloudflare Configuration

### DNS Setup
1. **Add A Record:** `appdemo.oskarcode.com` → `34.86.12.252` (GCP VM IP)
2. **Enable Proxy:** Orange cloud the DNS record
3. **Add WWW Record:** `www.appdemo.oskarcode.com` → `34.86.12.252`

### SSL/TLS Configuration
1. **SSL Mode:** Set to "Full" or "Full (Strict)" 
2. **Always Use HTTPS:** Enable
3. **HSTS:** Enable with max-age 31536000
4. **TLS Version:** Minimum TLS 1.2

### Security Rules

#### WAF Managed Rules
- **OWASP Core Ruleset:** Enable
- **Cloudflare Managed Ruleset:** Enable
- **Action:** Block malicious requests

#### Custom WAF Rules
```javascript
// SQL Injection Protection
(http.request.uri.query contains "' OR " or 
 http.request.uri.query contains "UNION SELECT")
Action: Block

// Admin Protection  
http.request.uri.path contains "/admin"
Action: Challenge (Managed Challenge)

// Credential Protection
(http.request.uri.path contains "/.git/" or 
 http.request.uri.path contains "/.env")
Action: Block
```

#### Rate Limiting Rules
- **API Endpoint:** `/api/*` - 10 requests/minute
- **Login Endpoint:** `/login` - 5 requests/minute  
- **Contact Form:** `/contact` - 3 requests/minute

#### Bot Management
- **Bot Fight Mode:** Enable
- **Static Resource Protection:** Enable
- **Challenge Bad Bots:** Enable

## 🧪 Security Testing

### SQL Injection Testing
```bash
export DEMO_URL="https://your-domain.com"

# Basic SQL injection
curl "$DEMO_URL/search?q=test' OR '1'='1' --"

# Union-based injection
curl -G "$DEMO_URL/search" --data-urlencode "q=' UNION SELECT 1,2,3,4 --"

# Time-based injection  
curl -G "$DEMO_URL/search" --data-urlencode "q=' AND SLEEP(5) --"
```

### Rate Limiting Testing
```bash
# API rate limiting
for i in {1..15}; do
  curl -w "%{http_code}\n" -o /dev/null -s "$DEMO_URL/api/products/"
  sleep 1
done

# Login brute force
for i in {1..10}; do
  curl -X POST "$DEMO_URL/login" \
    -d "username=admin&password=test$i" \
    -w "%{http_code}\n" -o /dev/null -s
done
```

### Bot Management Testing
```bash
# Bad bot user agents
curl -I "$DEMO_URL/robots-welcome" -A "BadBot/1.0"
curl -I "$DEMO_URL/admin-portal" -A "sqlmap/1.4.9" 

# High-frequency requests
for i in {1..20}; do
  curl -s "$DEMO_URL/robots-welcome" > /dev/null &
done
```

### Credential Exposure Testing
```bash
# Test exposed files (should be blocked by Cloudflare WAF)
curl "https://appdemo.oskarcode.com/.env.backup"
curl "https://appdemo.oskarcode.com/git-secrets/"
curl "https://appdemo.oskarcode.com/config/database.yml"

# Test common paths
curl -I "https://appdemo.oskarcode.com/.git/config"
curl -I "https://appdemo.oskarcode.com/wp-config.php"
```

## 🎬 Demo Scenarios

### Scenario 1: WAF Protection Demo (5 minutes)
1. **Show Normal Usage:** Navigate to search, enter "shirt"
2. **Attempt SQL Injection:** Enter `test' OR '1'='1' --`
3. **Show Blocked Request:** Display Cloudflare Security Events
4. **Try Advanced Injection:** Show various attack patterns blocked
5. **Test Credential Exposure:** Try accessing `/git-secrets/` and `/.env.backup`

### Scenario 2: Rate Limiting Demo (3 minutes) 
1. **Normal API Usage:** Show successful API calls
2. **Trigger Rate Limits:** Run rapid request script
3. **Show 429 Responses:** Display rate limit errors
4. **Recovery Time:** Show normal access restored

### Scenario 3: Bot Management Demo (4 minutes)
1. **Human Access:** Normal browser visit to `/robots-welcome`
2. **Bot Access:** Curl with suspicious user agent
3. **Show Bot Scores:** Display Cloudflare bot analysis
4. **Challenge/Block Actions:** Show automated responses

## 🔧 Troubleshooting

### Docker Issues

#### Containers Won't Start
```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs web
docker-compose logs nginx

# Restart containers
docker-compose restart
```

#### Database Issues
```bash
# Check database file permissions
ls -la db.sqlite3

# Fix permissions
sudo chown -R 1000:1000 ~/cloudflare-demo-ecommerce/

# Reset database
docker-compose exec web python manage.py migrate
docker-compose exec web python manage.py populate_products
```

#### Application Not Responding
```bash
# Check health endpoint
curl http://localhost:8000/health/

# Check container logs
docker-compose logs web | tail -20

# Restart web container
docker-compose restart web
```

### VM Monitoring
```bash
# Connect to VM
gcloud compute ssh --zone "us-east4-b" "oskar-appdemo-se" --project "globalse-198312"

# Check system resources
free -h
df -h

# Check Docker status
docker-compose ps
docker-compose logs --tail 10
```

### Performance Issues
```bash
# Check container resource usage
docker stats

# Check system resources
free -h
df -h

# Monitor logs
docker-compose logs -f web
```

## 🔄 Future Updates

### Adding New Features
1. **Local Development:**
   ```bash
   # Make changes locally
   git add .
   git commit -m "Add new feature"
   git push origin main
   ```

2. **Deploy to Production:**
   ```bash
   # One-command deployment
   ./deploy-production.sh
   ```

### Maintenance Tasks
```bash
# Update dependencies
docker-compose exec web pip install -r requirements.txt --upgrade

# Update Django
docker-compose exec web pip install Django --upgrade

# Update static files
docker-compose exec web python manage.py collectstatic --noinput

# Database maintenance
docker-compose exec web python manage.py migrate
```

### Monitoring Setup
```bash
# Connect to VM for monitoring
gcloud compute ssh --zone "us-east4-b" "oskar-appdemo-se" --project "globalse-198312"

# Check application health
curl http://localhost:8000/health/

# Monitor container logs
docker-compose logs -f web
```

## 📁 Detailed Directory Structure

### 🏠 Local Project Structure

```
cloudflare_demo_ecommerce/                      # Main project root
├── 📄 README.md                                # This comprehensive documentation
├── 📄 LICENSE                                  # Project license
├── 📄 WORKFLOW_TEST.md                         # Git workflow test documentation
├── 📄 requirements.txt                         # Python dependencies and versions
├── 📄 manage.py                               # Django management script
├── 📄 db.sqlite3                             # Local SQLite database
├── 📄 django.log                             # Django application logs
├── 📄 nginx.conf                             # Nginx server configuration
├── 📄 wrangler.toml                          # Cloudflare Workers configuration
│
├── 📁 scripts/                                # Organized automation scripts
│   ├── git/                                  # Git workflow scripts
│   │   ├── new-feature.sh                    # Start new feature branch
│   │   ├── finish-feature.sh                 # Complete and merge feature
│   │   └── git-workflow-help.sh              # Show workflow commands
│   ├── deployment/                           # Server deployment scripts
│   │   ├── deploy-to-server.sh               # Deploy to production server
│   │   └── setup-production-env.sh           # Setup production environment
│   ├── cloudflare/                           # Cloudflare Workers scripts
│   │   └── deploy-worker.sh                  # Deploy workers to Cloudflare
│   ├── setup/                                # Initial setup scripts
│   │   └── setup-github.sh                   # Connect to GitHub repository
│   └── README.md                             # Script documentation
│
├── 🔗 Script Shortcuts (Root Level)
│   ├── new-feature.sh                        # → scripts/git/new-feature.sh
│   ├── finish-feature.sh                     # → scripts/git/finish-feature.sh
│   ├── deploy-to-server.sh                   # → scripts/deployment/deploy-to-server.sh
│   └── git-workflow-help.sh                  # → scripts/git/git-workflow-help.sh
│
├── ☁️ Cloudflare Workers
│   ├── flash-sale-rate-limiter.js            # Rate limiting for flash sales
│   ├── admin-redirect-worker.js              # Admin portal protection
│   └── deploy-worker.sh                      # Deploy workers to Cloudflare
│
├── 🏗️ Django Project Configuration
│   └── cloudflare_demo_ecommerce/
│       ├── __init__.py                        # Python package marker
│       ├── settings.py                       # Django configuration (DEBUG, ALLOWED_HOSTS, etc.)
│       ├── urls.py                           # Main URL routing configuration
│       ├── wsgi.py                           # WSGI application entry point
│       └── asgi.py                           # ASGI application entry point
│
├── 🛍️ Shop Application (Main Django App)
│   └── shop/
│       ├── __init__.py                        # Python package marker
│       ├── admin.py                          # Django admin interface configuration
│       ├── apps.py                           # Application configuration
│       ├── models.py                         # Database models (Product, User, etc.)
│       ├── views.py                          # View logic with intentional vulnerabilities
│       ├── urls.py                           # Shop-specific URL routing
│       ├── tests.py                          # Unit tests (placeholder)
│       │
│       ├── 🗃️ Database Management
│       │   └── management/commands/
│       │       ├── __init__.py
│       │       └── populate_products.py      # Script to create demo products
│       │
│       ├── 📄 Database Migrations
│       │   └── migrations/
│       │       ├── __init__.py
│       │       └── 0001_initial.py           # Initial database schema
│       │
│       └── 🎨 Frontend Templates
│           └── templates/shop/
│               ├── base.html                 # Base template with Bootstrap
│               ├── home.html                 # Homepage with product catalog
│               ├── product_detail.html       # Individual product pages
│               ├── search.html               # Vulnerable search functionality
│               ├── login.html                # User authentication
│               ├── register.html             # User registration
│               ├── contact.html              # Contact form
│               ├── admin_portal.html         # Fake admin interface
│               ├── flash_sale.html           # Rate limiting demo page
│               ├── robots_welcome.html       # Bot magnet page
│               ├── sitemap.html              # SEO bot attractor
│               └── presentation.html         # Demo presentation page
│
├── 🎯 Intentionally Vulnerable Files
│   └── static/
│       └── config/
│           └── database.yml                  # Fake database credentials
│
├── 📦 Generated Static Files
│   └── staticfiles/                          # Collected Django static files
│       └── admin/                           # Django admin interface assets
│           ├── css/                         # Admin stylesheets
│           ├── img/                         # Admin images and icons
│           └── js/                          # Admin JavaScript files
│
└── 🐍 Python Virtual Environment
    └── venv/                                # Isolated Python environment
```

### 🖥️ Server Directory Structure (AWS EC2)

```
/home/ubuntu/                                   # Ubuntu user home directory
├── 🚀 Deployment Script
│   └── deploy.sh                              # Automated deployment script
│
└── 📁 Application Directory
    └── cloudflare_demo_ecommerce/             # Cloned from GitHub repository
        ├── 🐍 Python Environment
        │   └── venv/                          # Server virtual environment
        │       ├── bin/                       # Python executables
        │       ├── lib/python3.10/site-packages/ # Installed packages
        │       └── pyvenv.cfg                 # Environment configuration
        │
        ├── 🗃️ Database
        │   └── db.sqlite3                     # Production SQLite database
        │
        ├── 📊 Logs
        │   └── django.log                     # Django application logs
        │
        ├── 📦 Static Files
        │   └── staticfiles/                   # Collected static files for nginx
        │
        └── [All project files from GitHub]    # Complete project structure
```

### 🌐 Nginx Configuration Structure

```
/etc/nginx/                                    # Nginx root directory
├── nginx.conf                                # Main nginx configuration
├── sites-available/                          # Available site configurations
│   ├── default                              # Default nginx site (disabled)
│   ├── demo.oskarcode.com                    # Our site configuration
│   └── [backup files]                       # Previous configurations
│
├── sites-enabled/                            # Active site configurations
│   └── demo.oskarcode.com -> ../sites-available/demo.oskarcode.com
│
└── mime.types                               # MIME type definitions
```

### 🔐 SSL Certificate Structure (Let's Encrypt)

```
/etc/letsencrypt/                             # Let's Encrypt directory
├── live/demo.oskarcode.com/                  # Live certificates
│   ├── fullchain.pem                        # Full certificate chain
│   ├── privkey.pem                          # Private key
│   ├── cert.pem                             # Certificate only
│   └── chain.pem                            # Certificate chain
│
├── archive/demo.oskarcode.com/               # Certificate archive
└── renewal/demo.oskarcode.com.conf           # Auto-renewal configuration
```

### 🔄 Process Management

```
System Processes:
├── 🌐 nginx (Port 80/443)
│   ├── Master process (root)
│   └── Worker processes (www-data)
│
├── 🐍 Django (Port 8000)
│   └── python manage.py runserver 0.0.0.0:8000
│
├── 🔄 Certbot (Cron job)
│   └── Automatic certificate renewal
│
└── 🖥️ SSH Service (Port 22)
    └── Remote access for deployment
```

### 📊 Key File Purposes

#### **Configuration Files:**
- **settings.py** - Django configuration with DEBUG, ALLOWED_HOSTS, database settings
- **nginx.conf** - Reverse proxy configuration, SSL settings, static file serving
- **wrangler.toml** - Cloudflare Workers deployment configuration
- **requirements.txt** - Python package dependencies with versions

#### **Security Demo Files:**
- **views.py** - Contains intentional SQL injection vulnerabilities
- **static/config/database.yml** - Fake credentials for access rule testing
- **templates/robots_welcome.html** - Bot magnet for bot management demos

#### **Automation Scripts:**
- **deploy.sh** (server) - Automated deployment with dependency management
- **new-feature.sh** (local) - Creates feature branches with proper naming
- **deploy-to-server.sh** (local) - One-command production deployment

## 🎯 Features & Vulnerabilities

### Main Application Features
- **Product Catalog** - Bootstrap-styled e-commerce interface
- **Search Functionality** - Product search with filters
- **User Authentication** - Registration, login, logout
- **Contact Form** - Customer inquiry form
- **Admin Interface** - Django admin panel
- **API Endpoints** - JSON product data

### Intentional Vulnerabilities

#### 1. SQL Injection
**Location:** `/search` endpoint  
**Vulnerability:** Raw SQL query construction
```python
# VULNERABLE CODE - DO NOT USE IN PRODUCTION
sql = f"SELECT * FROM shop_product WHERE name LIKE '%{query}%'"
```

#### 2. Credential Exposure
**Files Exposed:**
- `/.git/secrets.txt` - API keys and database credentials
- `/.env.backup` - Environment variables  
- `/config/database.yml` - Database configuration

#### 3. Bot-Attractive Endpoints
- `/robots-welcome` - Designed to attract scrapers
- `/admin-portal` - Fake admin interface
- `/sitemap-generator` - SEO bot magnet

#### 4. Rate Limiting Targets
- `/api/products/` - Product data API
- `/login` - Authentication endpoint
- `/contact` - Form submission

## 📝 License & Usage

This project is for **demonstration purposes only**. Not licensed for production use.

**Restrictions:**
- ❌ Do not use in production environments
- ❌ Do not process real customer data  
- ❌ Do not expose to public internet without Cloudflare protection
- ✅ Use for security training and demonstrations
- ✅ Use in controlled lab environments
- ✅ Use for Cloudflare feature testing

---

**🎯 Current Status:** Production deployed on GCP VM with Docker Compose + Nginx + Django, ready for Cloudflare security demonstrations.

**📚 Documentation:** See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md), [VM_MONITORING_GUIDE.md](VM_MONITORING_GUIDE.md), and [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for detailed guides.
