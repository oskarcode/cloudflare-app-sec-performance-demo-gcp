#!/bin/bash

echo "🚀 Deploying Presentation MCP Server to Cloudflare..."
echo ""
echo "📦 Building and deploying..."
echo ""

# Deploy using wrangler.jsonc
npx wrangler deploy --config wrangler.jsonc

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
