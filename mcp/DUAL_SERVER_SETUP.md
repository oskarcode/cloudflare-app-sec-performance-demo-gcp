# Dual MCP Server Setup

Two separate MCP servers for read-only and read/write access control.

---

## 🎯 **Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│  Read-Only Server (mcpr)                                    │
│  https://mcpr.devdemo.oskarcode.com/mcp                     │
│                                                              │
│  Tools: 2 (READ ONLY)                                       │
│  ✅ get_all_sections                                        │
│  ✅ get_presentation_section                                │
│                                                              │
│  Access: Service Token (Anyone with token)                  │
│  Use Case: Public viewing, demos, AI assistants             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Read/Write Server (mcpw)                                   │
│  https://mcpw.devdemo.oskarcode.com/mcp                     │
│                                                              │
│  Tools: 6 (READ + WRITE)                                    │
│  ✅ get_all_sections                                        │
│  ✅ get_presentation_section                                │
│  ✏️  update_case_background                                 │
│  ✏️  update_architecture                                    │
│  ✏️  update_how_cloudflare_help                             │
│  ✏️  update_business_value                                  │
│                                                              │
│  Access: IDP Authentication (Only you)                      │
│  Use Case: Admin operations, content updates                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 **Deployment**

### Deploy Read-Only Server
```bash
cd mcp
./deploy-readonly.sh
```

### Deploy Read/Write Server
```bash
cd mcp
./deploy-readwrite.sh
```

### Deploy Both
```bash
cd mcp
./deploy-readonly.sh && ./deploy-readwrite.sh
```

---

## 🔐 **Security Setup**

### Read-Only Server (mcpr)
**Cloudflare Access Configuration:**

1. Go to **Zero Trust** → **Access** → **Applications**
2. Create new application:
   - **Type:** Self-hosted
   - **Name:** `MCP Read-Only`
   - **Domain:** `mcpr.devdemo.oskarcode.com`
   - **Path:** `/mcp/*`
3. Add **Access Policy** with **Service Token**:
   - Create service token for read-only access
   - Anyone with token can view presentation data

### Read/Write Server (mcpw)
**Cloudflare Access Configuration:**

1. Go to **Zero Trust** → **Access** → **Applications**
2. Create new application:
   - **Type:** Self-hosted
   - **Name:** `MCP Read/Write (Admin)`
   - **Domain:** `mcpw.devdemo.oskarcode.com`
   - **Path:** `/mcp/*`
3. Add **Access Policy** with **IDP Authentication**:
   - Require login via your identity provider
   - Only you (admin) can update presentation data

---

## 🧪 **Testing**

### Test Read-Only Server
```bash
curl -X POST https://mcpr.devdemo.oskarcode.com/mcp/sse \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Mcp-Session-Id: test-123" \
  -H "CF-Access-Client-Id: YOUR_SERVICE_TOKEN_ID" \
  -H "CF-Access-Client-Secret: YOUR_SERVICE_TOKEN_SECRET" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
```

**Expected:** Should list 2 tools (get_all_sections, get_presentation_section)

### Test Read/Write Server
```bash
# Requires browser-based IDP login first
curl https://mcpw.devdemo.oskarcode.com/mcp/
```

**Expected:** Should show 6 tools after authentication

---

## 🔌 **Connecting MCP Clients**

### Read-Only Access (Public/Demo)
```json
{
  "mcpServers": {
    "presentation-readonly": {
      "url": "https://mcpr.devdemo.oskarcode.com/mcp/sse",
      "transport": "sse",
      "headers": {
        "CF-Access-Client-Id": "YOUR_SERVICE_TOKEN_ID",
        "CF-Access-Client-Secret": "YOUR_SERVICE_TOKEN_SECRET"
      }
    }
  }
}
```

### Read/Write Access (Admin Only)
```json
{
  "mcpServers": {
    "presentation-admin": {
      "url": "https://mcpw.devdemo.oskarcode.com/mcp/sse",
      "transport": "sse"
    }
  }
}
```
*Note: This will prompt for browser-based authentication*

---

## 📊 **Benefits**

| Feature | Single Server + OAuth | Dual Servers (Current) |
|---------|----------------------|------------------------|
| **Complexity** | High (OAuth flow, KV storage, token management) | Low (2 simple workers) |
| **Setup Time** | 30+ minutes | 5 minutes |
| **Maintenance** | Complex (secrets, sessions, debugging) | Simple (deploy scripts) |
| **Access Control** | Single endpoint with token-based auth | Separate URLs with different policies |
| **Security** | OAuth 2.1 + PKCE | Cloudflare Access (proven solution) |
| **Tool Authorization** | Portal-based (requires OAuth) | Worker-level (built-in) |
| **Debugging** | Complex (check tokens, sessions, PKCE) | Simple (check worker logs) |

---

## 📁 **File Structure**

```
mcp/
├── index.ts                     # Read/Write server (6 tools)
├── index-readonly.ts            # Read-Only server (2 tools)
├── wrangler.jsonc               # Legacy config (not used)
├── wrangler-readonly.jsonc      # Read-Only config
├── wrangler-readwrite.jsonc     # Read/Write config
├── deploy.sh                    # Legacy deploy (not used)
├── deploy-readonly.sh           # Deploy read-only
├── deploy-readwrite.sh          # Deploy read/write
├── README.md                    # General documentation
├── DUAL_SERVER_SETUP.md         # This file
└── test_mcp_server.sh           # Testing utilities
```

---

## 🎯 **Use Cases**

### Read-Only Server (mcpr)
- ✅ AI chatbot integration (public demos)
- ✅ Customer-facing presentation viewer
- ✅ Team members viewing content
- ✅ External partners accessing data
- ✅ Automated reporting tools

### Read/Write Server (mcpw)
- ✏️  Admin content updates
- ✏️  Presentation editing
- ✏️  Data management
- ✏️  Configuration changes
- ✏️  Maintenance operations

---

## 🔄 **Migration from Single Server**

If you're currently using the single server at `appdemo.oskarcode.com/mcp`:

1. **Deploy both new servers** (already done ✅)
2. **Update MCP portal** to use `mcpr` or `mcpw` URLs
3. **Configure Cloudflare Access** policies
4. **Test both endpoints**
5. **Update client configurations**
6. **Optional:** Keep old server running during transition

---

## 💡 **Recommendations**

1. **Use Read-Only (mcpr) for:**
   - MCP portals with public access
   - AI assistants for demos
   - Anyone who needs to view data

2. **Use Read/Write (mcpw) for:**
   - Your admin operations
   - Trusted team members
   - Automated content updates (with IDP service account)

3. **Access Control:**
   - Read-Only: Service token (easy to share, rotate regularly)
   - Read/Write: IDP authentication (personal login required)

---

**Both servers are deployed and ready to use!** 🚀
