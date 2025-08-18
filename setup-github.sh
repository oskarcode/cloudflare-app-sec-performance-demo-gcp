#!/bin/bash

# GitHub Setup Script
# Run this after creating your GitHub repository

echo "🔗 Setting up GitHub remote..."

# Replace YOUR_USERNAME with your actual GitHub username
read -p "Enter your GitHub username: " GITHUB_USERNAME
read -p "Enter repository name (default: cloudflare-demo-ecommerce): " REPO_NAME
REPO_NAME=${REPO_NAME:-cloudflare-demo-ecommerce}

# Add GitHub remote
git remote add origin https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git

# Push to GitHub
echo "📤 Pushing to GitHub..."
git branch -M main
git push -u origin main

echo "✅ Repository connected to GitHub!"
echo "🌐 Repository URL: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"