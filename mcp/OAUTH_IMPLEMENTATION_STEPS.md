# OAuth Implementation - Final Steps

You're almost done! Follow these steps to complete the OAuth setup:

---

## ✅ **What's Been Done:**

1. ✅ Installed `@cloudflare/workers-oauth-provider`
2. ✅ Created `auth-handler.ts` - OAuth flow implementation  
3. ✅ Created `index-oauth.ts` - OAuth-protected MCP server
4. ✅ Updated `wrangler.jsonc` with KV namespace placeholder
5. ✅ Enabled `workers.dev` subdomain
6. ✅ Created Access for SaaS application
7. ✅ Saved OAuth credentials in `OAUTH_SETUP.md`

---

## 🚀 **Steps to Complete:**

### **Step 1: Create KV Namespace**

Run this command in the `mcp` directory:

```bash
cd mcp
npx wrangler kv namespace create "OAUTH_KV"
```

**Output will look like:**
```json
{
  "binding": "OAUTH_KV",
  "id": "abc123xyz456..."
}
```

**Copy the `id` value** and replace `REPLACE_WITH_YOUR_KV_NAMESPACE_ID` in `wrangler.jsonc` line 28.

---

### **Step 2: Add Workers Secrets**

Add your OAuth credentials from `OAUTH_SETUP.md` as Workers secrets:

```bash
cd mcp

# Add OAuth client ID
wrangler secret put ACCESS_CLIENT_ID
# When prompted, paste: 2e36d0ba68d83787c9f0e45de222c428fb8374f53aeba25acdbeb45bf08e4e46

# Add OAuth client secret
wrangler secret put ACCESS_CLIENT_SECRET
# When prompted, paste: 6bf0a0e9a1856147e3cd366b74f3307576ab7d5a4947c357760e35ef54ea22da

# Add token endpoint
wrangler secret put ACCESS_TOKEN_URL
# When prompted, paste: https://oskarman.cloudflareaccess.com/cdn-cgi/access/sso/oidc/2e36d0ba68d83787c9f0e45de222c428fb8374f53aeba25acdbeb45bf08e4e46/token

# Add authorization endpoint
wrangler secret put ACCESS_AUTHORIZATION_URL
# When prompted, paste: https://oskarman.cloudflareaccess.com/cdn-cgi/access/sso/oidc/2e36d0ba68d83787c9f0e45de222c428fb8374f53aeba25acdbeb45bf08e4e46/authorization

# Add JWKS endpoint
wrangler secret put ACCESS_JWKS_URL
# When prompted, paste: https://oskarman.cloudflareaccess.com/cdn-cgi/access/sso/oidc/2e36d0ba68d83787c9f0e45de222c428fb8374f53aeba25acdbeb45bf08e4e46/jwks

# Generate and add cookie encryption key
openssl rand -hex 32
# Copy the output, then run:
wrangler secret put COOKIE_ENCRYPTION_KEY
# Paste the generated key
```

---

### **Step 3: Update wrangler.jsonc to Use OAuth Version**

Change the `main` field in `wrangler.jsonc`:

**From:**
```json
"main": "index.ts",
```

**To:**
```json
"main": "index-oauth.ts",
```

---

### **Step 4: Deploy the OAuth-Protected MCP Server**

```bash
cd mcp
./deploy.sh
```

---

## 🧪 **Testing:**

### **Test 1: Check OAuth Info**

```bash
curl https://presentation-mcp-server.oskarmansanqu.workers.dev/
```

**Expected Response:**
```json
{
  "name": "Presentation MCP Server",
  "version": "1.0.0",
  "oauth_enabled": true,
  "endpoints": {
    "authorization": "https://presentation-mcp-server.oskarmansanqu.workers.dev/authorize",
    "token": "https://presentation-mcp-server.oskarmansanqu.workers.dev/token",
    "mcp": "https://presentation-mcp-server.oskarmansanqu.workers.dev/mcp/sse"
  }
}
```

### **Test 2: Try Accessing MCP Without Auth**

```bash
curl -X POST https://presentation-mcp-server.oskarmansanqu.workers.dev/mcp/sse \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'
```

**Expected Response:**
```json
{
  "error": "unauthorized",
  "error_description": "Valid access token required",
  "authorization_url": "https://presentation-mcp-server.oskarmansanqu.workers.dev/authorize"
}
```

✅ This means OAuth is working!

---

## 🔌 **Connecting from MCP Client:**

### **In Claude Desktop / Windsurf:**

1. Add the MCP server in your config:
   ```json
   {
     "mcpServers": {
       "presentation": {
         "url": "https://presentation-mcp-server.oskarmansanqu.workers.dev/mcp/sse",
         "transport": "sse"
       }
     }
   }
   ```

2. When you first connect, you'll be redirected to Cloudflare Access to log in

3. After logging in, you'll be redirected back and the connection will complete

4. The MCP client will now have access to your tools!

---

## 🎯 **Tool Authorization in Cloudflare Portal:**

Now that OAuth is working, the portal tool authorization should work correctly:

1. Go to **Zero Trust** → **Access** → **Applications**
2. Click on your **Presentation MCP Server** app
3. Go to **Tools** tab
4. **Check/uncheck** which tools users can access
5. **Save**

The changes will now be enforced because each request is authenticated with OAuth!

---

## 📝 **Summary:**

**What this achieves:**
- ✅ Users must authenticate via Cloudflare Access (your IDP)
- ✅ Tool-level authorization works in the portal
- ✅ Access policies control who can use the MCP server
- ✅ Sessions are stored securely in Workers KV
- ✅ PKCE flow for enhanced security

**URLs:**
- OAuth Server: `https://presentation-mcp-server.oskarmansanqu.workers.dev`
- Custom Domain: `https://appdemo.oskarcode.com/mcp/sse` (also works)

---

## 🐛 **Troubleshooting:**

### Issue: "Invalid or expired authorization code"
- Check that KV namespace ID is correct in `wrangler.jsonc`
- Check that all secrets are set correctly

### Issue: "Token exchange failed"
- Verify OAuth endpoints in secrets match exactly (no extra spaces)
- Check that redirect URL in Access app matches worker URL

### Issue: Still seeing all 6 tools in MCP client
- Make sure OAuth is enabled (check `/` endpoint response)
- Portal tool authorization only works with OAuth authentication
- Clear MCP client cache and reconnect

---

**Ready to deploy? Run the commands above!** 🚀
