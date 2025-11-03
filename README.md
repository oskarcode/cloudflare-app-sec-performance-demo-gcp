# Cloudflare App Security & Performance Demo

A live Django e-commerce demonstration showcasing Cloudflare's security and performance capabilities with AI-powered presentation management.

## 🚀 Live Demo

- **Website**: http://34.86.12.252
- **AI-Powered Presentation**: http://34.86.12.252/presentation/
- **Health Check**: http://34.86.12.252/health/

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Deployment](#deployment)
- [AI Assistant](#ai-assistant)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Management Commands](#management-commands)
- [Project Structure](#project-structure)

---

## ✨ Features

### E-Commerce Platform
- Product catalog with search functionality
- Intentionally vulnerable endpoints for demo purposes
- Rate limiting demonstrations
- SQL injection examples
- DDoS simulation endpoints

### AI-Powered Presentation Manager
- **Natural language editing** of presentation content
- **4 presentation sections**:
  - Case Background (business context, pain points)
  - Architecture (problems, traffic flow)
  - How Cloudflare Helps (solutions, network advantages)
  - Business Value (value propositions, ROI)
- **6 MCP tools** (2 read, 4 write)
- **Real-time updates** with auto-refresh
- **Schema preservation** - AI maintains data structure

### Security Demonstrations
- **SQL Injection**: `/search/` endpoint
- **Credential Exposure**: `/.env.backup/`, `/.git/secrets.txt`
- **Rate Limiting**: `/api/login-test/`
- **Bot Detection**: `/bots/`
- **Flash Sale**: `/flash-sale/` (traffic spike simulation)

---

## 🏗️ Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
┌──────▼───────────────────────────────────┐
│     Cloudflare Global Network            │
│  (CDN, WAF, Rate Limiting, DDoS)         │
└──────┬───────────────────────────────────┘
       │
┌──────▼──────┐
│   Nginx     │ :80
└──────┬──────┘
       │
┌──────▼──────┐
│  Gunicorn   │ :8000 (2 workers)
└──────┬──────┘
       │
┌──────▼──────┐
│   Django    │ (Python 3.11)
│   SQLite    │
└─────────────┘
```

### AI Integration Flow

```
User Request
    ↓
AI Chat Widget (presentation page)
    ↓
Django Endpoint: /api/ai-chat/
    ↓
Claude API (Anthropic)
    ↓
MCP Server (Cloudflare Worker)
    ↓
Django API: /api/presentation/sections/
    ↓
SQLite Database
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- pip
- Git

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

# Set up environment variables
cp .env.example .env
# Edit .env and add your CLAUDE_API_KEY

# Run migrations
python manage.py migrate

# Seed database
python manage.py seed_presentation
python manage.py populate_products

# Run development server
python manage.py runserver

# Visit http://localhost:8000
```

---

## 📦 Deployment

### Production Server (GCP VM)

**VM Details:**
- **Name**: oskar-appdemo-se
- **Zone**: us-east4-b
- **IP**: 34.86.12.252
- **OS**: Ubuntu
- **Python**: 3.11

### Deployment Script

```bash
./update-traditional.sh
```

This script:
1. Pulls latest code from GitHub
2. Installs Python dependencies
3. Runs Django migrations
4. Collects static files
5. Restarts Django app service
6. Restarts Nginx

### Manual Deployment

```bash
# SSH to server
gcloud compute ssh oskar-appdemo-se --zone=us-east4-b

# Navigate to app directory
cd /var/www/django-app

# Pull latest changes
git pull origin main

# Activate virtualenv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Restart services
sudo systemctl restart django-app
sudo systemctl restart nginx
```

### Service Management

```bash
# Check Django app status
sudo systemctl status django-app

# Check Nginx status
sudo systemctl status nginx

# View logs
sudo journalctl -u django-app -f
sudo tail -f /var/log/nginx/error.log
```

---

## 🤖 AI Assistant

The AI-powered presentation editor uses Claude AI with Model Context Protocol (MCP) integration.

### How It Works

1. **Open Presentation**: http://34.86.12.252/presentation/
2. **Click 🤖 button** (bottom-right)
3. **Type natural language commands**:
   - "What is the company?"
   - "Change company to Manufacturing"
   - "Update all sections for fintech context"
   - "Show me the pain points"

### AI Features

- **Natural Language Interface**: No need to know JSON structure
- **Schema Preservation**: AI maintains correct data structure
- **Multi-Tool Operations**: Can read and update multiple sections
- **Auto-Refresh**: Page reloads after updates
- **Progress Indicators**: Shows AI activity status

### Available MCP Tools

**Read Operations (2 tools):**
- `get_all_sections` - Retrieve all presentation sections
- `get_presentation_section` - Get specific section

**Write Operations (4 tools):**
- `update_case_background` - Update business context
- `update_architecture` - Update architecture section
- `update_how_cloudflare_help` - Update solutions
- `update_business_value` - Update value propositions

### MCP Server

**Cloudflare Worker URL**: `https://appdemo.oskarcode.com/mcp/sse`

The MCP server runs as a Cloudflare Worker using Durable Objects, providing:
- Direct API access to Django backend
- Tool execution for Claude AI
- Schema validation
- Error handling

---

## 📚 API Documentation

### Presentation API Endpoints

#### Get All Sections
```bash
GET /api/presentation/sections/

Response:
{
  "case_background": {...},
  "architecture": {...},
  "how_cloudflare_help": {...},
  "business_value": {...}
}
```

#### Get Specific Section
```bash
GET /api/presentation/sections/<section_type>/

# section_type: case_background | architecture | how_cloudflare_help | business_value

Response:
{
  "section_type": "case_background",
  "content": {...}
}
```

#### Update Section
```bash
PUT /api/presentation/sections/<section_type>/update/
Content-Type: application/json

{
  "content": {...}
}

Response:
{
  "success": true,
  "message": "Section updated successfully"
}
```

### AI Chat Endpoint

```bash
POST /api/ai-chat/
Content-Type: application/json

{
  "message": "Your question or command",
  "history": []
}

Response:
{
  "success": true,
  "response": "AI response text",
  "tool_used": true/false,
  "conversation": [...]
}
```

---

## 🔧 Environment Variables

Create a `.env` file in the project root:

```bash
# Django Settings
DEBUG=False
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=34.86.12.252,yourdomain.com

# Claude API (Required for AI features)
CLAUDE_API_KEY=sk-ant-api03-your-key-here

# MCP Server (Optional - defaults to appdemo.oskarcode.com)
MCP_SERVER_URL=https://appdemo.oskarcode.com/mcp

# Database (SQLite by default)
# For production, you can configure PostgreSQL/MySQL here
```

**Get Claude API Key:**
1. Visit https://console.anthropic.com/
2. Create an account
3. Generate an API key
4. Add to `.env` file

---

## 🛠️ Management Commands

### Seed Presentation Data

```bash
# Seed complete presentation (recommended)
python manage.py seed_presentation

# Seed simple presentation (for testing)
python manage.py seed_presentation_simple
```

### Populate Products

```bash
python manage.py populate_products
```

### Other Django Commands

```bash
# Create superuser
python manage.py createsuperuser

# Run migrations
python manage.py migrate

# Create migrations
python manage.py makemigrations

# Collect static files
python manage.py collectstatic

# Open Django shell
python manage.py shell
```

---

## 📁 Project Structure

```
cloudflare_demo_ecommerce/
├── shop/                          # Main Django app
│   ├── management/
│   │   └── commands/
│   │       ├── seed_presentation.py
│   │       ├── seed_presentation_simple.py
│   │       └── populate_products.py
│   ├── migrations/                # Database migrations
│   ├── templates/
│   │   └── shop/
│   │       ├── base.html
│   │       ├── home.html
│   │       ├── presentation_dynamic.html
│   │       └── includes/
│   │           └── ai_chat_widget.html
│   ├── static/
│   │   └── shop/
│   │       ├── css/
│   │       ├── js/
│   │       └── images/
│   ├── models.py                  # Database models
│   ├── views.py                   # Views and API endpoints
│   ├── urls.py                    # URL routing
│   └── admin.py                   # Admin interface
├── cloudflare_demo_ecommerce/     # Project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── mcp/                           # MCP Cloudflare Worker
│   ├── index.ts                   # Main MCP server logic
│   ├── wrangler.jsonc             # Cloudflare config
│   ├── deploy.sh                  # Deployment script
│   └── package.json
├── scripts/                       # Utility scripts
├── manage.py                      # Django management
├── requirements.txt               # Python dependencies
├── update-traditional.sh          # Deployment script
├── .env                          # Environment variables (gitignored)
└── README.md                     # This file
```

---

## 🗄️ Database Models

### PresentationSection

```python
class PresentationSection(models.Model):
    section_type = models.CharField(
        max_length=50,
        unique=True,
        choices=[
            ('case_background', 'Case Background'),
            ('architecture', 'Architecture'),
            ('how_cloudflare_help', 'How Cloudflare Helps'),
            ('business_value', 'Business Value'),
        ]
    )
    content = models.JSONField()
    last_updated = models.DateTimeField(auto_now=True)
```

### Product

```python
class Product(models.Model):
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    image = models.ImageField(upload_to='products/')
    created_at = models.DateTimeField(auto_now_add=True)
```

---

## 🔐 Security Demo Endpoints

These endpoints are **intentionally vulnerable** for demonstration purposes:

### SQL Injection
```bash
# Vulnerable search endpoint
GET /search/?q=test' OR '1'='1' --

# This will return all products due to SQL injection
```

### Exposed Credentials
```bash
# Simulated .env backup file
GET /.env.backup/

# Simulated .git secrets
GET /.git/secrets.txt
```

### Rate Limiting Demo
```bash
# Login endpoint without rate limiting
POST /api/login-test/
{"username": "test", "password": "test"}

# Try multiple times to demonstrate need for rate limiting
```

### Bot Traffic
```bash
# Robots welcome page (bots should be blocked)
GET /bots/
```

### Traffic Spike
```bash
# Flash sale endpoint (demonstrates traffic spike)
GET /flash-sale/
```

**⚠️ Warning**: These vulnerabilities are for demo purposes only. Never deploy such code in production!

---

## 🎯 Use Cases

### For Sales Demos
1. **Show vulnerabilities** using demo endpoints
2. **Explain Cloudflare solutions** via presentation
3. **Live edit presentation** using AI to match customer context
4. **Demonstrate protection** by enabling Cloudflare features

### For Training
1. **Understand web vulnerabilities** through safe examples
2. **Learn Django development** patterns
3. **Explore AI integration** with MCP
4. **Practice deployment** on cloud infrastructure

### For Proof of Concept
1. **Customize for your industry** using AI editor
2. **Add customer-specific pain points**
3. **Update ROI metrics** in real-time
4. **Generate tailored presentations** quickly

---

## 🐛 Troubleshooting

### AI Chat Not Working

**Issue**: "Server error: Expected JSON but got HTML"

**Solution**:
```bash
# Check if CLAUDE_API_KEY is set
echo $CLAUDE_API_KEY

# On production server
cd /var/www/django-app
source venv/bin/activate
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('API Key:', 'SET' if os.getenv('CLAUDE_API_KEY') else 'NOT SET')"

# If not set, add to .env file
echo "CLAUDE_API_KEY=sk-ant-..." >> .env

# Restart Django
sudo systemctl restart django-app
```

### Architecture Section Not Displaying

**Issue**: Architecture section appears empty

**Solution**: The template expects specific field names. Make sure database schema matches:
- `problem_mapping` (not `problems_mapping`)
- `traffic_flow.user_types`
- `traffic_flow.origin_infrastructure`

### Static Files Not Loading

**Solution**:
```bash
python manage.py collectstatic --noinput
sudo systemctl restart nginx
```

### Database Issues

**Solution**:
```bash
# Reset database
rm db.sqlite3
python manage.py migrate
python manage.py seed_presentation
python manage.py populate_products
```

---

## 📝 Development Tips

### Testing AI Updates Locally

```bash
# Start local server
python manage.py runserver

# In another terminal, test API
curl -X POST http://localhost:8000/api/ai-chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the company?", "history": []}'
```

### Viewing Database Content

```bash
# Open Django shell
python manage.py shell

# Query presentation sections
from shop.models import PresentationSection
sections = PresentationSection.objects.all()
for s in sections:
    print(f"{s.section_type}: {s.content}")
```

### Testing MCP Tools Directly

```bash
# Get all sections
curl http://34.86.12.252/api/presentation/sections/

# Get specific section
curl http://34.86.12.252/api/presentation/sections/case_background/

# Update section
curl -X PUT http://34.86.12.252/api/presentation/sections/case_background/update/ \
  -H "Content-Type: application/json" \
  -d '{"content": {...}}'
```

---

## 🤝 Contributing

This is a demonstration project. For improvements:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

This project is for demonstration purposes. Not licensed for commercial use without permission.

---

## 🔗 Links

- **GitHub**: https://github.com/oskarcode/cloudflare-app-sec-performance-demo-gcp
- **Live Demo**: http://34.86.12.252
- **Presentation**: http://34.86.12.252/presentation/
- **Cloudflare**: https://www.cloudflare.com
- **Claude AI**: https://www.anthropic.com/claude
- **Django**: https://www.djangoproject.com

---

## 📞 Support

For questions or issues:
- Open a GitHub issue
- Check troubleshooting section above
- Review AI chat logs in browser console

---

**Built with Django, Claude AI, and Cloudflare** 🚀
