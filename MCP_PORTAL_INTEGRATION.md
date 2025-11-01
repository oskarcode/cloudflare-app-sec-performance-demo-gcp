# MCP Portal Integration with Cloudflare Access

## Overview
The AI Assistant now connects to MCP servers through Cloudflare MCP Portals with Access policies for enhanced security and centralized management.

## Portal URLs

### Read-Only Portal (User Mode)
- **URL:** `https://mcpr.appdemo.oskarcode.com/mcp`
- **Access:** Protected by Cloudflare Access policy
- **Tools:** 2 read-only tools
  - `get_all_sections`
  - `get_presentation_section`

### Admin Portal (Admin Mode)
- **URL:** `https://mcpw.appdemo.oskarcode.com/mcp`
- **Access:** Protected by Cloudflare Access policy (stricter controls)
- **Tools:** All 6 tools (2 read + 4 write)
  - `get_all_sections`
  - `get_presentation_section`
  - `update_case_background`
  - `update_architecture`
  - `update_how_cloudflare_help`
  - `update_business_value`

## Architecture

### Backend Flow (AI Assistant)
```
┌─────────────────┐
│  AI Assistant   │
│  (Django App)   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│     Claude API (MCP Connector)          │
└────────┬────────────────────┬───────────┘
         │                    │
         ▼                    ▼
┌─────────────────┐  ┌─────────────────┐
│ Cloudflare      │  │ Cloudflare      │
│ Access Check    │  │ Access Check    │
│ (Origin IP OK)  │  │ (Origin IP OK)  │
└────────┬────────┘  └────────┬────────┘
         │                    │
         ▼                    ▼
┌─────────────────┐  ┌─────────────────┐
│  MCP Worker     │  │  MCP Worker     │
│  (Read-Only)    │  │  (Read/Write)   │
│  /mcpr/sse      │  │  /mcpw/sse      │
└─────────────────┘  └─────────────────┘
```

**Key Points:**
- Django backend connects directly to worker URLs
- Access policy allows backend via origin IP check
- No portal needed for programmatic access

### End-User Flow (MCP Clients)
```
┌─────────────────┐
│  Claude Desktop │
│  or MCP Client  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  MCP Portal     │
│  (mcpr/mcpw)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Cloudflare      │
│ Access Login    │
│ (IdP Auth)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  MCP Workers    │
│  (Read/Write)   │
└─────────────────┘
```

**Key Points:**
- End users access via portal URLs
- Portal handles authentication and tool filtering
- Provides observability and audit logs

## Benefits

### 1. **Centralized Access Control**
- All MCP server access goes through Cloudflare Access
- Policies managed in Cloudflare Zero Trust dashboard
- Single source of truth for permissions

### 2. **Observability**
- Portal logs show all tool usage
- Track which tools are being called
- Monitor request duration and status
- View logs per portal or per server

### 3. **Granular Tool Control**
- Enable/disable specific tools per portal
- Customize available tools for different use cases
- Separate read-only vs read/write access

### 4. **Security**
- Identity-based access control via IdP
- No hardcoded credentials in application
- OAuth-based authentication
- Audit trail of all API calls

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

## Authentication Considerations

### Current Setup: Origin IP Check ✅
- **Access Policy:** Origin IP check allows Django backend
- **No Additional Auth Required:** Backend IP is in the allow list
- **Direct Worker Access:** Backend connects to worker URLs directly
- **Portal URLs:** Reserved for end-user MCP clients only

### How It Works:
1. Django backend makes request to Anthropic API
2. Anthropic's MCP connector connects to worker URL
3. Cloudflare Access checks origin IP
4. Backend IP is allowed → Request proceeds
5. Worker processes request and returns tools

### If You Need Different Auth:

**Option 1: Service Token** (for stricter security)
   ```python
   headers = {
       'CF-Access-Client-Id': os.getenv('CF_SERVICE_TOKEN_ID'),
       'CF-Access-Client-Secret': os.getenv('CF_SERVICE_TOKEN_SECRET'),
   }
   ```

**Option 2: IP Allowlist** (current approach)
   - Backend IP added to Access policy
   - No code changes required
   - Simple and effective for known backend IPs

**Option 3: Custom Header**
   - Add custom header validation in Access policy
   - Backend sends secret header
   - More flexible than IP-based auth

## Testing

### Test Read-Only Portal (User Mode)
```bash
# Try viewing content (should work)
curl -X POST http://34.86.12.252/api/ai-chat/ \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me the case background",
    "mode": "user",
    "history": []
  }'

# Try updating (should be blocked)
curl -X POST http://34.86.12.252/api/ai-chat/ \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Update the business value",
    "mode": "user",
    "history": []
  }'
```

### Test Admin Portal (Admin Mode)
```bash
# Try updating (should work if auth is configured)
curl -X POST http://34.86.12.252/api/ai-chat/ \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Update the business value",
    "mode": "admin",
    "history": []
  }'
```

## Monitoring

### View Portal Logs
1. Go to [Cloudflare Zero Trust](https://one.dash.cloudflare.com/)
2. Navigate to **Access controls** > **AI controls**
3. Find your portal → **Edit** → **Logs**

### Log Fields
- **Time**: When the request was made
- **Status**: Success/failure
- **Server**: Which MCP server handled it
- **Capability**: Which tool was used
- **Duration**: Processing time in ms

## Troubleshooting

### Issue: "MCP server connection failed"
**Cause:** Cloudflare Access blocking the request
**Solution:** 
1. Check Access policy allows backend service
2. Add service token if needed
3. Verify portal URL is correct

### Issue: "Tool not available"
**Cause:** Tool disabled in portal settings
**Solution:**
1. Go to Zero Trust dashboard
2. Edit the portal
3. Enable the required tool

### Issue: "Authentication required"
**Cause:** Backend needs auth credentials
**Solution:**
1. Generate Cloudflare service token
2. Add to Django environment variables
3. Pass in request headers

## Next Steps

1. **Test the integration** with current setup
2. **Add service token auth** if Cloudflare Access blocks requests
3. **Monitor portal logs** to verify tool usage
4. **Adjust Access policies** based on requirements
5. **Document any auth headers** needed for production

## References

- [Cloudflare MCP Portal Documentation](https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/mcp-portals/)
- [Secure MCP Servers with Access](https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/saas-mcp/)
- [Cloudflare Access Policies](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/)
