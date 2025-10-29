#!/bin/bash

# Deploy MCP Server to Cloudflare Workers
# This script deploys the presentation MCP server

set -e

echo "🚀 Deploying Presentation MCP Server to Cloudflare..."
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Install it with:"
    echo "   npm install -g wrangler"
    exit 1
fi

# Deploy
echo "📦 Building and deploying..."
wrangler deploy --config wrangler-mcp.toml

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔗 MCP Server URL: https://appdemo.oskarcode.com/mcp/sse"
echo ""
echo "📝 Test the deployment:"
echo "   curl https://appdemo.oskarcode.com/mcp/"
echo ""
echo "🧪 Test with MCP client:"
echo "   npx mcp-remote https://appdemo.oskarcode.com/mcp/sse"
