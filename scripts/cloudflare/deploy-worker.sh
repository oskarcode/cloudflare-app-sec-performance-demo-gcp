#!/bin/bash
# Deploy Cloudflare Workers Script
# Admin Portal Protection Worker Deployment

set -e

echo "🚀 Deploying Cloudflare Workers - Admin Portal Protection"
echo "=================================================="

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Check authentication
echo "🔐 Checking Cloudflare authentication..."
wrangler whoami

# Validate configuration
echo "📋 Validating wrangler.toml configuration..."
wrangler validate

# Deploy to production
echo "🚀 Deploying Admin Portal Protection Worker..."
wrangler deploy --env production

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Worker Details:"
echo "   Name: admin-portal-protection"
echo "   Zone: demo.oskarcode.com"  
echo "   Route: demo.oskarcode.com/admin-portal/*"
echo "   Account ID: f2b0debf4bd2bf50f7d1a81d1ab88946"
echo "   Zone ID: ce1a9880ae2ffdcad159a40283e838a8"
echo ""
echo "🧪 Testing Commands:"
echo "   # First attempt (should work)"
echo "   curl -I https://demo.oskarcode.com/admin-portal/"
echo ""
echo "   # Third attempt (should redirect)"  
echo "   for i in {1..4}; do"
echo "     echo \"Attempt \$i:\""
echo "     curl -I https://demo.oskarcode.com/admin-portal/"
echo "     echo"
echo "   done"
echo ""
echo "🔍 Monitor logs:"
echo "   wrangler tail admin-portal-protection"
echo ""
echo "🎯 Expected Behavior:"
echo "   • Attempts 1-2: Allow with warning headers"
echo "   • Attempt 3+: Redirect to homepage (302)"
echo "   • Reset after 5 minutes of inactivity"
echo ""
echo "🛡️ Security Headers Added:"
echo "   • X-Security-Action: Admin-Access-Blocked"
echo "   • X-Attempt-Count: [number]"  
echo "   • X-Remaining-Attempts: [number]"
echo "   • X-Client-IP: [IP address]"
echo ""
echo "📈 Demo Value:"
echo "   • Shows advanced Cloudflare Workers capabilities"
echo "   • Demonstrates edge-side security logic"
echo "   • Real-time threat protection"
echo "   • Custom security responses"
echo "   • Enterprise-grade bot protection"

# Optional: Set up KV namespace if needed
# echo "📦 Setting up KV namespace (optional)..."
# wrangler kv:namespace create "ADMIN_PROTECTION_KV"
# wrangler kv:namespace create "ADMIN_PROTECTION_KV" --preview

echo ""
echo "🎉 Cloudflare Workers deployment complete!"
echo "Your admin portal protection is now active!"