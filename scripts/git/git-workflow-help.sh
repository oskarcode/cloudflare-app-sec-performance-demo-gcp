#!/bin/bash

# Git Workflow Help Script
# Shows available commands and workflow

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}🔧 Cloudflare Demo E-commerce - Git Workflow${NC}"
echo -e "${BLUE}===============================================${NC}"
echo
echo -e "${GREEN}📋 Available Commands:${NC}"
echo
echo -e "${CYAN}🆕 Start New Feature:${NC}"
echo "   ./new-feature.sh \"feature-name\""
echo "   Examples:"
echo "     ./new-feature.sh \"add-search-filters\""
echo "     ./new-feature.sh \"fix-login-bug\""
echo "     ./new-feature.sh \"enhance-security\""
echo
echo -e "${CYAN}✅ Finish Feature:${NC}"
echo "   ./finish-feature.sh \"Commit message\""
echo "   ./finish-feature.sh \"Commit message\" keep-branch  # Keep branch after merge"
echo "   Examples:"
echo "     ./finish-feature.sh \"Add advanced search with filters\""
echo "     ./finish-feature.sh \"Fix login redirect issue\" keep-branch"
echo
echo -e "${CYAN}🚀 Deploy to Server:${NC}"
echo "   ./deploy-to-server.sh"
echo "   (Deploys current branch to production server)"
echo
echo -e "${CYAN}🔗 Setup GitHub:${NC}"
echo "   ./setup-github.sh"
echo "   (Connect local repo to GitHub - run once)"
echo
echo -e "${CYAN}📖 Show This Help:${NC}"
echo "   ./git-workflow-help.sh"
echo
echo -e "${GREEN}🔄 Complete Workflow Example:${NC}"
echo
echo -e "${YELLOW}1. Start new feature:${NC}"
echo "   ./new-feature.sh \"add-payment-system\""
echo
echo -e "${YELLOW}2. Make your changes (edit files, test locally)${NC}"
echo
echo -e "${YELLOW}3. Finish feature:${NC}"
echo "   ./finish-feature.sh \"Add Stripe payment integration\""
echo
echo -e "${YELLOW}4. Deploy to server:${NC}"
echo "   ./deploy-to-server.sh"
echo
echo -e "${GREEN}🌿 Branch Naming Convention:${NC}"
echo "   feature/your-feature-name    # For new features"
echo "   fix/your-bug-fix            # For bug fixes"
echo "   enhance/your-enhancement    # For improvements"
echo "   update/your-update          # For updates"
echo "   refactor/your-refactor      # For code refactoring"
echo
echo -e "${GREEN}📊 Useful Git Commands:${NC}"
echo "   git status                  # Check current status"
echo "   git branch                  # List branches"
echo "   git log --oneline          # View commit history"
echo "   git diff                   # See unstaged changes"
echo "   git stash                  # Temporarily save changes"
echo
echo -e "${BLUE}🌍 Live Site: https://demo.oskarcode.com${NC}"
echo