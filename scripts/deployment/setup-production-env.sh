#!/bin/bash

# Production Environment Setup Script
# Run this on your server to set up proper environment variables

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔧 Setting up production environment variables...${NC}"

# Generate a new production secret key
echo -e "${BLUE}🔑 Generating new production SECRET_KEY...${NC}"
PROD_SECRET_KEY=$(python3 -c "import secrets; import string; chars = string.ascii_letters + string.digits + '!@#\$%^&*(-_=+)'; print(''.join(secrets.choice(chars) for i in range(50)))")

# Create production .env file
cat > /home/ubuntu/cloudflare_demo_ecommerce/.env << EOF
# Production Environment Variables
# Generated: $(date)

# Django Configuration
DEBUG=False
SECRET_KEY=$PROD_SECRET_KEY

# Allowed Hosts
ALLOWED_HOSTS=demo.oskarcode.com,www.demo.oskarcode.com

# Security Settings
SECURE_SSL_REDIRECT=True
SECURE_BROWSER_XSS_FILTER=True
SECURE_CONTENT_TYPE_NOSNIFF=True

# Database (SQLite for demo - in real production use PostgreSQL)
# DATABASE_URL=postgresql://user:password@localhost/dbname

# Optional: Email Configuration
# EMAIL_HOST=smtp.gmail.com
# EMAIL_HOST_USER=your-email@example.com
# EMAIL_HOST_PASSWORD=your-app-password
# EMAIL_PORT=587

# Optional: Cloudflare Configuration
# CLOUDFLARE_ACCOUNT_ID=your-account-id
# CLOUDFLARE_ZONE_ID=your-zone-id
# CLOUDFLARE_API_TOKEN=your-api-token
EOF

# Set proper permissions
chmod 600 /home/ubuntu/cloudflare_demo_ecommerce/.env
chown ubuntu:ubuntu /home/ubuntu/cloudflare_demo_ecommerce/.env

echo -e "${GREEN}✅ Production .env file created${NC}"
echo -e "${BLUE}📊 Environment setup complete:${NC}"
echo "   • New SECRET_KEY generated"
echo "   • DEBUG=False for production"
echo "   • SSL redirects enabled"
echo "   • File permissions secured (600)"
echo
echo -e "${YELLOW}📝 Remember to restart Django after deployment!${NC}"