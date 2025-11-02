# MCP OAuth Auto-Refresh System

## Overview

The AI Assistant now uses **Cloudflare MCP Portals** with **automatic OAuth token refresh** for authentication. This provides:

- ✅ **Portal Benefits**: Audit logs, centralized management, access policies
- ✅ **Auto-Refresh**: Tokens refresh automatically when they expire
- ✅ **Low Maintenance**: Only need to re-authenticate every 30-90 days (when refresh token expires)

---

## Architecture

```
User Browser
    ↓
Django AI Assistant
    ↓
Token Manager (Auto-Refresh Logic)
    ↓
Claude API (MCP Connector)
    ↓
Cloudflare MCP Portal (OAuth Auth)
    ↓
MCP Workers
```

### **Endpoints:**
- **User Mode (Read-Only)**: `https://mcpr.appdemo.oskarcode.com/mcp`
- **Admin Mode (Read/Write)**: `https://mcpw.appdemo.oskarcode.com/mcp`

---

## Initial Setup

### Step 1: Get OAuth Tokens from MCP Inspector

For **both** readonly and admin modes:

```bash
# Run MCP Inspector
npx @modelcontextprotocol/inspector
```

Then:
1. **Transport type**: SSE
2. **URL**: `https://mcpr.appdemo.oskarcode.com/mcp` (readonly) or `https://mcpw.appdemo.oskarcode.com/mcp` (admin)
3. Click **"Open Auth Settings"**
4. Click **"Quick OAuth Flow"**
5. Complete authorization
6. Copy the **access_token** and **refresh_token**

### Step 2: Set Up Tokens with Helper Script

```bash
# Run the setup script
python3 scripts/setup_mcp_tokens.py
```

Follow the prompts to enter:
- Readonly access_token
- Readonly refresh_token
- Admin access_token
- Admin refresh_token

**Tokens are stored in:**
- `.mcp_tokens_readonly.json`
- `.mcp_tokens_admin.json`

*(These files are gitignored for security)*

---

## How Auto-Refresh Works

### **Token Lifecycle:**

```
Day 1: Initial setup via Inspector
  ↓
Hour 1-24: Access token valid
  ↓
Hour 24: Access token expires
  ↓
Auto-refresh: System uses refresh_token to get new access_token
  ↓
Days 2-30: Continue auto-refreshing
  ↓
Day 30-90: Refresh token expires
  ↓
Action Required: Re-authenticate via Inspector
```

### **When Tokens Are Checked:**

Every time the AI Assistant makes an MCP request:
1. Token manager checks if access_token is still valid
2. If expired (or expiring soon), automatically refreshes using refresh_token
3. If refresh succeeds, new access_token is cached
4. If refresh fails, returns error (need to re-authenticate)

### **Token Storage:**

```json
// .mcp_tokens_readonly.json
{
  "access_token": "eyJhbGci...",
  "refresh_token": "8e4e2cff...",
  "expires_at": "2025-11-03T13:00:00",
  "created_at": "2025-11-02T12:00:00"
}
```

---

## Usage

Once tokens are set up, the system works automatically!

### **User Mode (Readonly)**
```bash
# AI Assistant automatically:
1. Gets token from readonly manager
2. Auto-refreshes if expired
3. Connects to readonly portal
4. Tools: get_all_sections, get_presentation_section
```

### **Admin Mode (Read/Write)**
```bash
# AI Assistant automatically:
1. Gets token from admin manager
2. Auto-refreshes if expired
3. Connects to admin portal
4. Tools: All 6 tools (read + write)
```

---

## Maintenance

### **When Do I Need to Take Action?**

#### ✅ **No Action Needed (Auto-Handled):**
- Access token expires (refreshes automatically)
- Token expires in next hour (proactive refresh)
- Normal day-to-day usage

#### ⚠️ **Action Needed (~Monthly):**
- Refresh token expires (30-90 days)
- Need to re-authenticate via Inspector
- Run setup script again with new tokens

### **How to Check Token Status:**

```python
# In Python shell
from shop.mcp_token_manager import get_token_manager

# Check readonly tokens
readonly_mgr = get_token_manager('readonly')
print(readonly_mgr.tokens)

# Check admin tokens  
admin_mgr = get_token_manager('admin')
print(admin_mgr.tokens)
```

### **Manual Token Update:**

If you need to update tokens manually:

```bash
# Run setup script again
python3 scripts/setup_mcp_tokens.py
```

Or programmatically:

```python
from shop.mcp_token_manager import get_token_manager

# Update readonly tokens
readonly_mgr = get_token_manager('readonly')
readonly_mgr.update_tokens(
    access_token="eyJhbGci...",
    refresh_token="8e4e2cff...",
    expires_in=3600
)

# Update admin tokens
admin_mgr = get_token_manager('admin')
admin_mgr.update_tokens(
    access_token="eyJhbGci...",
    refresh_token="8e4e2cff...",
    expires_in=3600
)
```

---

## Troubleshooting

### **Issue: "MCP authentication failed"**

**Cause:** Token refresh failed or refresh token expired

**Solution:**
1. Re-authenticate via MCP Inspector
2. Run `python3 scripts/setup_mcp_tokens.py`
3. Enter new tokens

### **Issue: "OAuth token unavailable"**

**Cause:** No tokens configured

**Solution:**
1. Get tokens from MCP Inspector
2. Run setup script
3. Enter tokens

### **Issue: Token refresh returns 401**

**Cause:** Refresh token expired

**Solution:**
1. Re-authenticate via Inspector (get fresh tokens)
2. Update via setup script

### **Issue: Wrong mode tools showing**

**Cause:** Wrong portal/token being used

**Solution:**
1. Check token files exist for both modes
2. Verify portal URLs are correct
3. Clear browser cache and retry

---

## Deployment

### **Production Server Setup:**

```bash
# SSH to server
gcloud compute ssh oskar-appdemo-se --zone=us-east4-b

# Navigate to app directory
cd /var/www/django-app

# Get tokens from Inspector (on local machine)
# Then copy tokens to server

# Run setup script on server
python3 scripts/setup_mcp_tokens.py

# Token files created:
# .mcp_tokens_readonly.json
# .mcp_tokens_admin.json

# Deploy code
git pull origin main

# Restart service
sudo systemctl restart nginx
```

### **Token Rotation Schedule:**

- **Daily**: No action (auto-refresh handles it)
- **Weekly**: No action
- **Monthly**: Check if refresh tokens are approaching expiration
- **Quarterly**: Re-authenticate and update tokens (proactive)

---

## Benefits

### **Compared to Manual Tokens:**

| Feature | Manual | Auto-Refresh |
|---------|--------|--------------|
| **Token Updates** | Daily | Monthly |
| **Maintenance** | High | Low |
| **Downtime Risk** | High | Low |
| **Automation** | None | Full |

### **Compared to IP-Based:**

| Feature | IP-Based | Portal + OAuth |
|---------|----------|----------------|
| **Audit Logs** | ❌ None | ✅ Full |
| **Access Control** | Basic | Granular |
| **Observability** | Limited | Complete |
| **Management** | Per-worker | Centralized |

---

## Files

### **Code Files:**
- `shop/mcp_token_manager.py` - Token management logic
- `shop/views.py` - AI chat view with portal integration
- `scripts/setup_mcp_tokens.py` - Token setup helper

### **Data Files (gitignored):**
- `.mcp_tokens_readonly.json` - Readonly mode tokens
- `.mcp_tokens_admin.json` - Admin mode tokens

### **Documentation:**
- This file: `MCP_OAUTH_AUTO_REFRESH.md`
- Portal info: `MCP_PORTAL_INTEGRATION.md`

---

## Security Notes

- ✅ Token files are gitignored (never committed)
- ✅ Tokens stored locally on server filesystem
- ✅ Refresh token enables automatic renewal
- ⚠️ Protect `.mcp_tokens_*.json` files (contain secrets)
- ⚠️ Use proper file permissions on server

---

## References

- [Claude MCP Connector](https://docs.claude.com/en/docs/agents-and-tools/mcp-connector)
- [Cloudflare MCP Portals](https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/mcp-portals/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
