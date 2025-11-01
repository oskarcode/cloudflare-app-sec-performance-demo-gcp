# Cloudflare Access OAuth Setup for MCP Server

## Prerequisites
- Cloudflare Zero Trust account
- Identity provider configured (Google, Okta, etc.)

## Step 1: Create Access for SaaS Application

1. Go to [Cloudflare Zero Trust](https://one.dash.cloudflare.com)
2. Navigate to **Access controls** → **Applications**
3. Click **Add an application**
4. Select **SaaS**
5. Configure:
   - **Application name:** `Presentation MCP Server`
   - Select the text box below and click **OIDC**
6. Click **Add application**
7. Set **Redirect URLs:**
   ```
   https://appdemo.oskarcode.com/mcp/callback
   ```
8. **Copy these values** (you'll need them for Step 2):
   - Client ID
   - Client secret
   - Token endpoint
   - Authorization endpoint
   - Key endpoint

9. Configure **Access policies** to define who can access the MCP server
10. Save the application

## Step 2: Add Workers Secrets

Run these commands in the `mcp` directory:

```bash
cd mcp

# Add OAuth credentials from Step 1
wrangler secret put ACCESS_CLIENT_ID
wrangler secret put ACCESS_CLIENT_SECRET
wrangler secret put ACCESS_TOKEN_URL
wrangler secret put ACCESS_AUTHORIZATION_URL
wrangler secret put ACCESS_JWKS_URL

# Generate and add cookie encryption key
openssl rand -hex 32
wrangler secret put COOKIE_ENCRYPTION_KEY
```

When prompted, paste the corresponding values from your Access for SaaS application.

## Step 3: Create KV Namespace

Create a KV namespace to store OAuth sessions:

```bash
cd mcp
npx wrangler kv namespace create "OAUTH_KV"
```

Copy the namespace ID from the output and add it to `wrangler.jsonc`:

```json
"kv_namespaces": [
  {
    "binding": "OAUTH_KV",
    "id": "<YOUR_KV_NAMESPACE_ID>"
  }
]
```

## Step 4: Deploy Updated MCP Server

```bash
cd mcp
./deploy.sh
```

## Testing

After deployment, when you connect an MCP client:
1. You'll be redirected to your identity provider
2. Log in with your credentials
3. Grant access to the MCP server
4. MCP client receives OAuth token
5. Server validates token and returns authorized tools only

## Tool Authorization

To restrict tools per user:
1. Go to **Zero Trust** → **Access** → **Applications**
2. Click on your MCP server application
3. Go to **Tools** tab
4. Select which tools each user group can access
5. Save changes
