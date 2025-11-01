#!/bin/bash

echo "🚀 Deploying Read/Write MCP Server to Cloudflare..."
echo ""
echo "📦 Building and deploying..."
echo ""

# Deploy using wrangler-readwrite.jsonc
npx wrangler deploy --config wrangler-readwrite.jsonc

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔗 Read/Write MCP Server URL: https://mcpw.devdemo.oskarcode.com/mcp"
echo ""
echo "📝 Tools available:"
echo "   ✅ get_all_sections (READ)"
echo "   ✅ get_presentation_section (READ)"
echo "   ✏️  update_case_background (WRITE)"
echo "   ✏️  update_architecture (WRITE)"
echo "   ✏️  update_how_cloudflare_help (WRITE)"
echo "   ✏️  update_business_value (WRITE)"
echo ""
echo "🔐 Protect this endpoint with Cloudflare Access IDP authentication"
