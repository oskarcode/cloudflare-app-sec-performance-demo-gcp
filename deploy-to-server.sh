#!/bin/bash

# Deploy to Server Script
# Usage: ./deploy-to-server.sh

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
SERVER_USER="ubuntu"
SERVER_IP="ec2-3-83-104-93.compute-1.amazonaws.com"
SSH_KEY="/Users/oskarablimit/Desktop/personal/Projects/aws/aws migration/ec2-key/aws1_keys.pem"
REPO_URL="https://github.com/YOUR_USERNAME/cloudflare-demo-ecommerce.git"  # You'll need to update this

echo -e "${BLUE}🚀 Deploying to server...${NC}"

# Check if we have uncommitted changes
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo -e "${RED}❌ You have uncommitted changes!${NC}"
    echo -e "${YELLOW}Please commit or stash your changes first.${NC}"
    echo -e "${YELLOW}Use: ./finish-feature.sh \"Your commit message\"${NC}"
    exit 1
fi

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}⚠️  You're on branch: $CURRENT_BRANCH${NC}"
    echo -e "${YELLOW}Typically you should deploy from main branch.${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Ensure latest changes are pushed
echo -e "${BLUE}📤 Ensuring latest changes are pushed...${NC}"
git push origin "$CURRENT_BRANCH"

# Deploy to server
echo -e "${BLUE}🌐 Connecting to server and running deployment...${NC}"
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "
    echo '🔧 Running deployment script on server...'
    if [ -f deploy.sh ]; then
        ./deploy.sh '$REPO_URL'
    else
        echo '❌ Deploy script not found on server!'
        exit 1
    fi
"

# Check if deployment was successful
if [ $? -eq 0 ]; then
    echo
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${BLUE}🌍 Your site should be live at: https://demo.oskarcode.com${NC}"
    echo
    echo -e "${BLUE}📝 Useful commands:${NC}"
    echo "   • Check site: curl -I https://demo.oskarcode.com"
    echo "   • View logs: ssh -i \"$SSH_KEY\" $SERVER_USER@$SERVER_IP 'tail -f cloudflare_demo_ecommerce/django.log'"
    echo "   • Server status: ssh -i \"$SSH_KEY\" $SERVER_USER@$SERVER_IP 'ps aux | grep python'"
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    echo -e "${YELLOW}Check the server logs for details.${NC}"
    exit 1
fi