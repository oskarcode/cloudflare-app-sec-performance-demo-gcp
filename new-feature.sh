#!/bin/bash

# New Feature Branch Script
# Usage: ./new-feature.sh "feature-name" "Optional description"

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if feature name provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage: ./new-feature.sh \"feature-name\" \"Optional description\"${NC}"
    echo -e "${YELLOW}Examples:${NC}"
    echo "  ./new-feature.sh \"add-payment-system\""
    echo "  ./new-feature.sh \"fix-ssl-redirect\" \"Fix SSL redirect issue on homepage\""
    exit 1
fi

FEATURE_NAME="$1"
DESCRIPTION="$2"

# Sanitize feature name (replace spaces with hyphens, lowercase)
FEATURE_NAME=$(echo "$FEATURE_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')

# Determine branch prefix based on feature name
if [[ "$FEATURE_NAME" == *"fix"* ]] || [[ "$FEATURE_NAME" == *"bug"* ]]; then
    BRANCH_NAME="fix/$FEATURE_NAME"
elif [[ "$FEATURE_NAME" == *"enhance"* ]] || [[ "$FEATURE_NAME" == *"improve"* ]]; then
    BRANCH_NAME="enhance/$FEATURE_NAME"  
elif [[ "$FEATURE_NAME" == *"update"* ]]; then
    BRANCH_NAME="update/$FEATURE_NAME"
elif [[ "$FEATURE_NAME" == *"refactor"* ]]; then
    BRANCH_NAME="refactor/$FEATURE_NAME"
else
    BRANCH_NAME="feature/$FEATURE_NAME"
fi

echo -e "${BLUE}🌿 Creating new branch: $BRANCH_NAME${NC}"

# Make sure we're on main and up to date
echo -e "${BLUE}📥 Updating main branch...${NC}"
git checkout main
git pull origin main

# Create and switch to new branch
git checkout -b "$BRANCH_NAME"

echo -e "${GREEN}✅ Created and switched to branch: $BRANCH_NAME${NC}"
echo -e "${BLUE}📝 Ready to start working on your feature!${NC}"
echo
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Make your changes"
echo "2. Test locally"
echo "3. Run: ./finish-feature.sh \"$DESCRIPTION\""
echo
echo -e "${BLUE}Current branch:${NC} $(git branch --show-current)"