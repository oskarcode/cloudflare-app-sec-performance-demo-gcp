#!/bin/bash

echo "🚀 Deploying Read-Only MCP Server to Cloudflare..."
echo ""
echo "📦 Building and deploying..."
echo ""

# Deploy using wrangler-readonly.jsonc
npx wrangler deploy --config wrangler-readonly.jsonc

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔗 Read-Only MCP Server URL: https://mcpr.devdemo.oskarcode.com/mcp"
echo ""
echo "📝 Tools available:"
echo "   ✅ get_all_sections (READ)"
echo "   ✅ get_presentation_section (READ)"
echo ""
echo "🔐 Protect this endpoint with Cloudflare Access service token"
