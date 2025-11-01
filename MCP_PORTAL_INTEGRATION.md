# MCP Integration with Cloudflare Workers

## Overview
The AI Assistant connects to MCP servers running as Cloudflare Workers, with IP-based access control through Cloudflare Access.

## MCP Worker Endpoints

### Read-Only Worker (User Mode)
- **URL:** `https://appdemo.oskarcode.com/mcpr/sse`
- **Access:** IP-based via Cloudflare Access
- **Tools:** 2 read-only tools
  - `get_all_sections`
  - `get_presentation_section`

### Admin Worker (Admin Mode)
- **URL:** `https://appdemo.oskarcode.com/mcpw/sse`
- **Access:** IP-based via Cloudflare Access
- **Tools:** All 6 tools (2 read + 4 write)
  - `get_all_sections`
  - `get_presentation_section`
  - `update_case_background`
  - `update_architecture`
  - `update_how_cloudflare_help`
  - `update_business_value`

## MCP Portals (For End Users)

Portal URLs are available for end-user MCP clients (Claude Desktop, MCP Inspector, etc.):
- **Read-Only Portal:** `https://mcpr.appdemo.oskarcode.com/mcp`
- **Admin Portal:** `https://mcpw.appdemo.oskarcode.com/mcp`

**Note:** Django backend uses direct worker URLs for simplicity. Portals are for manual client access.

## Architecture

```
┌─────────────────────────────────────────┐
│         User's Browser                   │
│    (http://34.86.12.252)                │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│      Django AI Assistant                │
│      - Mode toggle (User/Admin)          │
│      - Chat interface                    │
│      - Conversation history              │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│     Claude API (MCP Connector)          │
│     api.anthropic.com/v1/messages       │
└────────┬────────────────────┬───────────┘
         │                    │
         ▼                    ▼
┌─────────────────┐  ┌─────────────────┐
│ Cloudflare      │  │ Cloudflare      │
│ Access (IP)     │  │ Access (IP)     │
└────────┬────────┘  └────────┬────────┘
         │                    │
         ▼                    ▼
┌─────────────────┐  ┌─────────────────┐
│  MCP Worker     │  │  MCP Worker     │
│  (Read-Only)    │  │  (Read/Write)   │
│  mcpr/sse       │  │  mcpw/sse       │
└─────────────────┘  └─────────────────┘
```

**Key Points:**
- Simple IP-based access control
- Direct connection to MCP workers
- Mode determines which worker is used
- No OAuth token complexity

## Benefits

### 1. **Simple Access Control**
- IP-based access via Cloudflare Access
- Backend server IP is allowed
- No token management required

### 2. **Dual Mode Support**
- User mode: Read-only tools (safe exploration)
- Admin mode: Full write access (content updates)
- Easy toggle between modes

### 3. **MCP Integration**
- Claude's native MCP connector
- Tool discovery and execution handled automatically
- Clean conversation history management

### 4. **Cloudflare Workers**
- Fast, globally distributed
- Serverless architecture
- Automatic scaling

## Configuration in Django

The Django AI assistant (`shop/views.py`) routes requests based on mode:

```python
if mode == 'admin':
    # Direct worker URL - backend allowed via origin IP check
    mcp_server_url = 'https://appdemo.oskarcode.com/mcpw/sse'
else:
    # Direct worker URL - backend allowed via origin IP check
    mcp_server_url = 'https://appdemo.oskarcode.com/mcpr/sse'
```

**Why Direct URLs, Not Portals?**
- Anthropic's MCP connector requires direct worker URLs
- Portal URLs are for end-user MCP clients (Claude Desktop, etc.)
- Backend is allowed by Cloudflare Access via origin IP check
- No additional authentication needed for backend

Claude's MCP connector handles:
- Tool discovery from worker
- Request routing
- Response parsing

## Access Control

### IP-Based Authentication
- Django backend IP is allowed in Cloudflare Access policy
- No additional authentication required
- Simple and reliable for backend services

### How It Works:
1. User interacts with Django AI Assistant
2. Django makes request to Anthropic API with MCP connector
3. Anthropic's MCP connector connects to worker URL
4. Cloudflare Access checks origin IP
5. Backend IP is allowed → Request proceeds
6. Worker processes request and returns tools
7. Response flows back through Django to user

## Testing

### Test User Mode (Read-Only)
```bash
curl -X POST http://34.86.12.252/api/ai-chat/ \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me the case background",
    "mode": "user",
    "history": []
  }'
```

### Test Admin Mode (Read/Write)
```bash
curl -X POST http://34.86.12.252/api/ai-chat/ \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Update the business value to highlight security",
    "mode": "admin",
    "history": []
  }'
```

## Monitoring

### Worker Logs
- View worker logs in Cloudflare dashboard
- Navigate to Workers & Pages → Your worker → Logs
- See all MCP tool calls and responses

### Django Logs
```bash
# SSH to server
gcloud compute ssh oskar-appdemo-se --zone=us-east4-b

# View nginx logs
sudo tail -f /var/log/nginx/access.log
```

## Troubleshooting

### Issue: "API request failed: 400"
**Solutions:**
- Check conversation history isn't causing tool_use/tool_result mismatch
- Switch modes to clear conversation history
- Verify MCP worker URLs are correct

### Issue: "MCP server connection failed"
**Solutions:**
- Verify backend server IP is in Cloudflare Access allowlist
- Check worker URLs are accessible
- Test with curl from server

### Issue: Mode toggle not working properly
**Solutions:**
- Refresh the page after deployment
- Clear browser cache
- Check browser console for errors

## References

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Claude MCP Connector](https://docs.claude.com/en/docs/agents-and-tools/mcp-connector)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/policies/access/)
