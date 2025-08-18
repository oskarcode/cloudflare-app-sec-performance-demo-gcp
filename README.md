# Cloudflare Security Demo E-commerce Site

A deliberately vulnerable Django e-commerce application designed to demonstrate Cloudflare's security features including WAF, Bot Management, Rate Limiting, DDoS Protection, and Access Rules.

**🌐 Live Demo:** https://demo.oskarcode.com  
**📊 Presentation:** https://demo.oskarcode.com/presentation/

## ⚠️ Security Warning

This application contains **intentional vulnerabilities** for demonstration purposes only.
- **Never deploy this to a production environment**
- **Do not use real credentials or sensitive data**
- **Only use in controlled demo/testing environments**

## 🎯 Project Overview

This demo site showcases how Cloudflare's security features protect against common web application attacks:
- **SQL Injection** - Vulnerable search endpoint for WAF testing
- **Credential Exposure** - Exposed configuration files for access rule testing  
- **Bot Attacks** - Bot-attractive endpoints for bot management testing
- **Rate Limiting** - API endpoints for rate limiting demonstration
- **DDoS Simulation** - Load testing endpoints

## 🔧 Development Setup

### Prerequisites
- Python 3.10+
- Django 5.2+
- Git

### Local Development
```bash
# Clone and setup
git clone <repository-url>
cd cloudflare_demo_ecommerce

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

Visit http://localhost:8000 to see the application.

## 🚀 Production Deployment

### AWS EC2 Deployment (Current Setup)

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

## 🔄 Updating Deployment

### Sync Local Changes to Remote
```bash
# From local machine
rsync -avz --delete -e "ssh -i /path/to/your-key.pem" \
  ./cloudflare_demo_ecommerce/ \
  ubuntu@YOUR_SERVER_IP:/home/ubuntu/cloudflare_demo_ecommerce/ \
  --exclude 'venv/' --exclude '*.pyc' --exclude '__pycache__/' --exclude 'db.sqlite3'

# Restart services on remote
ssh -i /path/to/your-key.pem ubuntu@YOUR_SERVER_IP \
  "cd /home/ubuntu/cloudflare_demo_ecommerce && \
   pkill -f 'manage.py runserver' && \
   source venv/bin/activate && \
   nohup python manage.py runserver 0.0.0.0:8000 > django.log 2>&1 &"

# Reload nginx if config changed
ssh -i /path/to/your-key.pem ubuntu@YOUR_SERVER_IP "sudo systemctl reload nginx"
```

## ☁️ Cloudflare Configuration

### DNS Setup
1. **Add A Record:** `your-domain.com` → `YOUR_SERVER_IP`
2. **Enable Proxy:** Orange cloud the DNS record
3. **Add WWW Record:** `www.your-domain.com` → `YOUR_SERVER_IP`

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
# Test exposed files
curl "$DEMO_URL/.git/secrets.txt"
curl "$DEMO_URL/.env.backup" 
curl "$DEMO_URL/config/database.yml"

# Test common paths
curl -I "$DEMO_URL/.git/config"
curl -I "$DEMO_URL/wp-config.php"
```

## 🎬 Demo Scenarios

### Scenario 1: WAF Protection Demo (5 minutes)
1. **Show Normal Usage:** Navigate to search, enter "shirt"
2. **Attempt SQL Injection:** Enter `test' OR '1'='1' --`
3. **Show Blocked Request:** Display Cloudflare Security Events
4. **Try Advanced Injection:** Show various attack patterns blocked

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

### Common Issues

#### Application Won't Start
```bash
# Check Python version
python3 --version

# Check Django installation
python3 -c "import django; print(django.get_version())"

# Check database migrations
python manage.py showmigrations
```

#### Database Issues
```bash
# Reset database
rm db.sqlite3
python manage.py migrate
python manage.py populate_products
```

#### Static Files Not Loading
```bash
# Collect static files
python manage.py collectstatic --clear --noinput

# Check nginx configuration
sudo nginx -t
sudo systemctl status nginx
```

#### SSL/TLS Issues
```bash
# Check certificate validity
echo | openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Verify nginx SSL config
sudo nginx -t
```

### Performance Issues
```bash
# Check system resources
free -h
df -h

# Monitor processes
htop

# Check Django logs
tail -f django.log
```

## 🔄 Future Updates

### Adding New Features
1. **Local Development:**
   ```bash
   # Create feature branch
   git checkout -b feature/new-feature
   
   # Make changes and test
   python manage.py test
   
   # Commit changes
   git add .
   git commit -m "Add new feature"
   ```

2. **Deploy to Production:**
   ```bash
   # Sync changes
   rsync -avz --delete -e "ssh -i /path/to/your-key.pem" \
     ./ ubuntu@YOUR_SERVER_IP:/home/ubuntu/cloudflare_demo_ecommerce/ \
     --exclude 'venv/' --exclude '*.pyc' --exclude '__pycache__/'
   
   # Restart services
   ssh -i /path/to/your-key.pem ubuntu@YOUR_SERVER_IP \
     "cd /home/ubuntu/cloudflare_demo_ecommerce && \
      pkill -f 'manage.py runserver' && \
      source venv/bin/activate && \
      python manage.py migrate && \
      python manage.py collectstatic --noinput && \
      nohup python manage.py runserver 0.0.0.0:8000 > django.log 2>&1 &"
   ```

### Maintenance Tasks
```bash
# Update dependencies
pip install -r requirements.txt --upgrade

# Update Django
pip install Django --upgrade

# Check for security updates
pip audit

# Update static files
python manage.py collectstatic --noinput

# Database maintenance
python manage.py migrate
```

### Monitoring Setup
```bash
# Basic monitoring script
cat > monitor.sh << 'EOF'
#!/bin/bash
while true; do
  echo "=== $(date) ==="
  curl -s http://localhost:8000/health/ || echo "Django down"
  sudo systemctl is-active nginx || echo "Nginx down"
  echo ""
  sleep 60
done
EOF

chmod +x monitor.sh
nohup ./monitor.sh > monitor.log 2>&1 &
```

## 📁 Project Structure

```
cloudflare_demo_ecommerce/
├── README.md                    # This comprehensive guide
├── requirements.txt             # Python dependencies
├── manage.py                    # Django management script
├── nginx.conf                   # Nginx configuration
├── deploy.sh                    # Deployment automation
│
├── cloudflare_demo_ecommerce/   # Django project settings
│   ├── settings.py              # Django configuration
│   ├── urls.py                  # Main URL routing
│   ├── wsgi.py                  # WSGI configuration
│   └── asgi.py                  # ASGI configuration
│
├── shop/                        # Main Django application
│   ├── models.py                # Database models
│   ├── views.py                 # View logic (including vulnerabilities)
│   ├── urls.py                  # URL routing
│   ├── templates/shop/          # HTML templates
│   └── management/commands/     # Django management commands
│
├── static/                      # Intentionally exposed files
│   ├── .git/secrets.txt         # Fake credentials
│   ├── .env.backup              # Fake environment variables
│   └── config/database.yml      # Fake database config
│
└── staticfiles/                 # Collected static files
```

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

**🎯 Current Status:** Production deployed on AWS EC2 with nginx + Django, ready for Cloudflare security demonstrations.