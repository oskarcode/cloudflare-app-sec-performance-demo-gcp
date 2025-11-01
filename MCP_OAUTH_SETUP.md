# MCP Portal OAuth Token Setup

## Overview
To use Cloudflare MCP portals with Access policies, you need OAuth tokens for authentication. This guide shows you how to obtain and configure these tokens.

## Architecture

### Without OAuth Tokens (Current - Fallback)
```
Django → Direct Worker URLs → Cloudflare Access (IP check)
```

### With OAuth Tokens (Recommended)
```
Django → Portal URLs → OAuth Auth → Cloudflare Access (Policy) → Workers
```

---

## Step 1: Obtain OAuth Tokens

### Method 1: Using MCP Inspector (Recommended)

1. **Install Node.js** (if not already installed)

2. **Run MCP Inspector**
   ```bash
   npx @modelcontextprotocol/inspector
   ```

3. **Configure Read-Only Portal**
   - In the left sidebar, select "SSE" for Transport type
   - Enter URL: `https://mcpr.appdemo.oskarcode.com/mcp`
   - Click "Open Auth Settings" button
   - Click "Quick OAuth Flow"
   - Complete the OAuth authorization in your browser
   - Click "Continue" through the OAuth Flow Progress
   - When you see "Authentication complete", copy the `access_token` value

4. **Configure Admin Portal** (Repeat for admin)
   - Enter URL: `https://mcpw.appdemo.oskarcode.com/mcp`
   - Follow same OAuth flow
   - Copy the `access_token` value

### Method 2: Using Claude Desktop (Alternative)

If you have Claude Desktop configured with the portal:

1. The tokens are stored in `~/.mcp-auth/`
2. Look for JSON files with your portal URLs
3. Extract the `access_token` from the stored credentials

---

## Step 2: Configure Environment Variables

Add the OAuth tokens to your `.env` file:

```bash
# MCP OAuth Tokens for Portal Access
MCP_OAUTH_TOKEN_READONLY=eyJ... (your read-only portal token)
MCP_OAUTH_TOKEN_ADMIN=eyJ... (your admin portal token)
```

### On Production Server

SSH to your server and update the `.env` file:

```bash
# SSH to server
gcloud compute ssh oskar-appdemo-se --zone=us-east4-b

# Edit .env file
cd /var/www/django-app
nano .env

# Add the tokens:
# MCP_OAUTH_TOKEN_READONLY=your_readonly_token
# MCP_OAUTH_TOKEN_ADMIN=your_admin_token

# Restart the application
sudo systemctl restart gunicorn
```

---

## Step 3: Test the Integration

### Test with curl

```bash
# Test with OAuth token
curl -s https://api.anthropic.com/v1/messages \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $CLAUDE_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: mcp-client-2025-04-04" \
  -d '{
    "model": "claude-sonnet-4-5",
    "max_tokens": 1000,
    "messages": [{"role": "user", "content": "What tools do you have?"}],
    "mcp_servers": [{
      "type": "url",
      "url": "https://mcpr.appdemo.oskarcode.com/mcp",
      "name": "test",
      "authorization_token": "YOUR_OAUTH_TOKEN"
    }]
  }'
```

### Test through AI Assistant

1. Visit http://34.86.12.252
2. Open AI Assistant
3. Try: "Show me the case background"
4. Should work with portal URL + OAuth token

---

## How It Works

### Backend Logic (shop/views.py)

```python
# Get OAuth tokens from environment
mcp_auth_token_readonly = os.getenv('MCP_OAUTH_TOKEN_READONLY', '')
mcp_auth_token_admin = os.getenv('MCP_OAUTH_TOKEN_ADMIN', '')

if mode == 'admin':
    if mcp_auth_token_admin:
        # Use portal with OAuth (enforces Access policy)
        mcp_server_url = 'https://mcpw.appdemo.oskarcode.com/mcp'
        mcp_auth_token = mcp_auth_token_admin
    else:
        # Fallback to direct worker (IP-based)
        mcp_server_url = 'https://appdemo.oskarcode.com/mcpw/sse'
        mcp_auth_token = None

# Build config with token if available
mcp_server_config = {
    'type': 'url',
    'url': mcp_server_url,
    'name': 'presentation-manager'
}

if mcp_auth_token:
    mcp_server_config['authorization_token'] = mcp_auth_token
```

---

## Benefits of OAuth Tokens

### ✅ With OAuth Tokens (Portal URLs)
- **Enforces Cloudflare Access policies** - Identity-based access control
- **Centralized management** - Manage permissions in Zero Trust dashboard
- **Audit logging** - Track all tool usage in portal logs
- **Granular permissions** - Control which tools each user can access
- **User attribution** - Know which user made which requests

### ⚠️ Without OAuth Tokens (Direct Worker URLs)
- **IP-based access only** - Less secure, harder to manage
- **No audit trail** - Can't track who did what
- **All-or-nothing** - Either full access or no access
- **No portal benefits** - Miss out on centralized management

---

## Token Management

### Token Expiration
- OAuth tokens may expire after some time
- You'll need to re-authenticate and get new tokens
- Update the `.env` file with fresh tokens

### Token Security
- **Never commit tokens to Git** - Keep them in `.env` file
- **Use different tokens** for development and production
- **Rotate tokens regularly** for security

### Multiple Environments

**Development:**
```bash
# .env
MCP_OAUTH_TOKEN_READONLY=dev_readonly_token
MCP_OAUTH_TOKEN_ADMIN=dev_admin_token
```

**Production:**
```bash
# .env on server
MCP_OAUTH_TOKEN_READONLY=prod_readonly_token
MCP_OAUTH_TOKEN_ADMIN=prod_admin_token
```

---

## Troubleshooting

### Issue: "Connection error" with portal URL
**Solution:** Obtain OAuth token and add to `.env`

### Issue: "Authentication failed"
**Solutions:**
- Token may have expired - get a new token
- Check if token is for the correct portal URL
- Verify `.env` file has the token correctly set

### Issue: Still using direct worker URLs
**Cause:** No OAuth token in environment
**Solution:** 
1. Obtain tokens using MCP Inspector
2. Add to `.env` file
3. Restart application

---

## Next Steps

1. ✅ **Code Updated** - Backend now supports OAuth tokens
2. 📝 **Obtain Tokens** - Use MCP Inspector to get tokens
3. ⚙️ **Configure .env** - Add tokens to environment
4. 🚀 **Deploy** - Push changes and restart application
5. 🧪 **Test** - Verify portal URLs work with tokens
6. 📊 **Monitor** - Check portal logs in Zero Trust dashboard

---

## References

- [Claude MCP Connector Documentation](https://docs.claude.com/en/docs/agents-and-tools/mcp-connector)
- [Cloudflare MCP Portal Documentation](https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/mcp-portals/)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
- [MCP OAuth Specification](https://modelcontextprotocol.io/specification/2025-03-26/basic/authorization)
