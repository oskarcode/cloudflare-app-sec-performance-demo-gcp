#!/bin/bash

# Finish Feature Branch Script
# Usage: ./finish-feature.sh "Commit message" [keep-branch]

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if commit message provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage: ./finish-feature.sh \"Commit message\" [keep-branch]${NC}"
    echo -e "${YELLOW}Examples:${NC}"
    echo "  ./finish-feature.sh \"Add payment integration with Stripe\""
    echo "  ./finish-feature.sh \"Fix SSL redirect issue\" keep-branch"
    exit 1
fi

COMMIT_MESSAGE="$1"
KEEP_BRANCH="$2"
CURRENT_BRANCH=$(git branch --show-current)

# Check if we're on a feature branch (not main)
if [ "$CURRENT_BRANCH" = "main" ]; then
    echo -e "${RED}❌ You're on main branch. Please switch to a feature branch first.${NC}"
    echo -e "${YELLOW}Use: ./new-feature.sh \"your-feature-name\"${NC}"
    exit 1
fi

echo -e "${BLUE}🔄 Finishing feature: $CURRENT_BRANCH${NC}"

# Check if there are changes to commit
if git diff --quiet && git diff --cached --quiet; then
    echo -e "${YELLOW}⚠️  No changes detected. Make sure you've made your changes.${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    # Stage all changes
    echo -e "${BLUE}📦 Staging changes...${NC}"
    git add .
    
    # Show what will be committed
    echo -e "${BLUE}📋 Changes to be committed:${NC}"
    git diff --cached --name-status
    echo
    
    # Commit changes
    git commit -m "$COMMIT_MESSAGE"
    echo -e "${GREEN}✅ Changes committed${NC}"
fi

# Push feature branch
echo -e "${BLUE}📤 Pushing feature branch...${NC}"
git push origin "$CURRENT_BRANCH"

# Switch to main and merge
echo -e "${BLUE}🔄 Merging into main...${NC}"
git checkout main
git pull origin main
git merge "$CURRENT_BRANCH"

# Push main
echo -e "${BLUE}📤 Pushing to main...${NC}"
git push origin main

# Delete branch if not keeping it
if [ "$KEEP_BRANCH" != "keep-branch" ]; then
    echo -e "${BLUE}🗑️  Cleaning up feature branch...${NC}"
    git branch -d "$CURRENT_BRANCH"
    git push origin --delete "$CURRENT_BRANCH"
    echo -e "${GREEN}✅ Feature branch deleted${NC}"
else
    echo -e "${YELLOW}🌿 Keeping feature branch: $CURRENT_BRANCH${NC}"
fi

echo -e "${GREEN}🎉 Feature completed and merged!${NC}"
echo -e "${BLUE}📊 Summary:${NC}"
echo "   • Feature: $CURRENT_BRANCH"
echo "   • Commit: $COMMIT_MESSAGE"  
echo "   • Git commit: $(git rev-parse --short HEAD)"
echo
echo -e "${YELLOW}Ready to deploy? Run: ./deploy-to-server.sh${NC}"