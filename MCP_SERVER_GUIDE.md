# MCP Server Deployment Guide

## Overview

This MCP (Model Context Protocol) server allows AI assistants to dynamically read and update presentation content through natural language commands.

## Architecture

```
AI Assistant (Claude with MCP Connector)
    ↓
Cloudflare Worker (MCP Server)
    ↓
Django REST API
    ↓
PostgreSQL/SQLite Database
    ↓
Dynamic Presentation Page
```

## Deployment Steps

### 1. Deploy MCP Server to Cloudflare

```bash
# Deploy using the MCP-specific wrangler config
wrangler deploy --config wrangler-mcp.toml

# Or to deploy to workers.dev for testing:
# Edit wrangler-mcp.toml and set workers_dev = true
# Then run:
# wrangler deploy --config wrangler-mcp.toml
```

### 2. Verify Deployment

```bash
# Test MCP server info
curl https://appdemo.oskarcode.com/mcp/info

# Test tools list
curl https://appdemo.oskarcode.com/mcp/tools/list

# Test getting all sections
curl -X POST https://appdemo.oskarcode.com/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "get_all_sections",
    "arguments": {}
  }'
```

## MCP Tools Available

### 1. `get_all_sections`
Get all presentation sections at once.

**Example:**
```json
{
  "name": "get_all_sections",
  "arguments": {}
}
```

### 2. `get_presentation_section`
Get a specific section.

**Example:**
```json
{
  "name": "get_presentation_section",
  "arguments": {
    "section_type": "case_background"
  }
}
```

### 3. `update_case_background`
Update the case background section.

**Example:**
```json
{
  "name": "update_case_background",
  "arguments": {
    "content": {
      "business_context": {
        "title": "Updated Title",
        "description": "New description",
        "stats": [...]
      },
      "pain_points": [...]
    }
  }
}
```

### 4. `update_architecture`
Update the architecture section.

### 5. `update_how_cloudflare_help`
Update how Cloudflare helps section.

### 6. `update_business_value`
Update business value section.

## Testing with curl

### Get all sections
```bash
curl -X POST https://appdemo.oskarcode.com/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "get_all_sections",
    "arguments": {}
  }' | jq .
```

### Update case background
```bash
curl -X POST https://appdemo.oskarcode.com/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "update_case_background",
    "arguments": {
      "content": {
        "business_context": {
          "title": "AI-Updated E-commerce Platform",
          "description": "Updated via MCP",
          "stats": [
            {"icon": "users", "label": "Users", "value": "1M+ active users"}
          ]
        },
        "current_solution": {
          "title": "Legacy System",
          "description": "Multiple point solutions"
        },
        "pain_points": []
      }
    }
  }' | jq .
```

## Integration with Claude MCP Connector

### Option 1: Direct MCP Connection

Configure Claude to connect to your MCP server:

```json
{
  "mcpServers": {
    "presentation-manager": {
      "url": "https://appdemo.oskarcode.com/mcp",
      "transport": "sse"
    }
  }
}
```

### Option 2: Local MCP Client (for development)

Create a local MCP client that connects to your deployed worker:

```javascript
import { MCPClient } from '@modelcontextprotocol/sdk';

const client = new MCPClient({
  serverUrl: 'https://appdemo.oskarcode.com/mcp',
  transport: 'sse'
});

// Call a tool
const result = await client.callTool('get_all_sections', {});
console.log(result);
```

## AI Assistant Usage Examples

Once connected via MCP Connector, you can use natural language commands:

### Example Commands:

1. **"Show me the current case background content"**
   - AI calls: `get_presentation_section` with `section_type: "case_background"`

2. **"Update the business context to focus on retail with 500K monthly users"**
   - AI calls: `update_case_background` with updated content

3. **"Change the architecture section to show 3 problems instead of 2"**
   - AI calls: `get_presentation_section` to see current content
   - AI calls: `update_architecture` with modified problems_mapping

4. **"Add a new value proposition about cost savings"**
   - AI calls: `get_presentation_section` for business_value
   - AI calls: `update_business_value` with new proposition added

## Troubleshooting

### MCP Server Not Responding
```bash
# Check if worker is deployed
wrangler deployments list --config wrangler-mcp.toml

# Check worker logs
wrangler tail --config wrangler-mcp.toml
```

### CORS Issues
The MCP server includes CORS headers. If you still face issues:
- Check that `Access-Control-Allow-Origin: *` is in responses
- For production, restrict CORS to specific origins in the worker code

### Django API Not Accessible
```bash
# Test Django API directly
curl https://appdemo.oskarcode.com/api/presentation/sections/

# Check Django logs
# On your server: tail -f /path/to/django/logs
```

## Security Considerations

### For Production:

1. **Add Authentication**
   ```javascript
   // In presentation-mcp-server.js, add:
   const API_KEY = env.MCP_API_KEY;
   if (request.headers.get('Authorization') !== `Bearer ${API_KEY}`) {
     return new Response('Unauthorized', { status: 401 });
   }
   ```

2. **Rate Limiting**
   - Add rate limiting to MCP endpoints
   - Use Cloudflare's rate limiting rules

3. **Input Validation**
   - Validate all content updates
   - Add JSON schema validation

4. **Audit Logging**
   - Log all content changes
   - Track which AI/user made changes

## Next Steps

1. Deploy MCP server: `wrangler deploy --config wrangler-mcp.toml`
2. Test endpoints manually
3. Set up Claude MCP Connector
4. Add AI assistant UI button to presentation page
5. Test end-to-end workflow

## Resources

- [Model Context Protocol Docs](https://modelcontextprotocol.io/)
- [Claude MCP Connector](https://docs.claude.com/en/docs/agents-and-tools/mcp-connector)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
