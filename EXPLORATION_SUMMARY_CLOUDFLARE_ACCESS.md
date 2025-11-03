# Exploration Summary: Cloudflare Access for MCP Portal Protection

## 📋 Overview

This document summarizes our exploration of using Cloudflare Access policies to protect the MCP (Model Context Protocol) portal and API endpoints.

---

## 🎯 What We Tried

**Goal**: Use Cloudflare Access to control who can access MCP endpoints, implementing proper authentication and authorization.

**Scenarios Tested**:
1. Protect API endpoints directly with Access
2. Protect HTML pages with Access
3. Protect specific paths/routes
4. Two-tier access (User vs Admin)

---

## 🏗️ Architecture Attempts

### Attempt 1: Direct API Protection (FAILED)

```
Browser → Cloudflare Access Check → API Endpoint
                ↓
           302 Redirect to Login
                ↓
           HTML Login Page (Not JSON!)
                ↓
           ❌ Frontend expects JSON
```

**Problem**: API endpoints return HTML redirects instead of JSON

### Attempt 2: Page-Level Protection (WORKED)

```
Browser → Access Check → HTML Page
             ↓
        Allow/Deny
             ↓
        Page Loads
             ↓
        JS calls API (no Access check)
```

**Result**: Pages protected, but APIs remain open

### Attempt 3: Two-Tier Access (PARTIALLY WORKED)

```
User Mode Page → Cloudflare Access (Email-based)
    ↓
Read-Only API

Admin Mode Page → Cloudflare Access (IP-based)
    ↓
Full Access API
```

**Issue**: Access policies redirect API calls

---

## ✅ What Worked

### 1. **Page-Level Protection**
Successfully protected HTML pages (not API endpoints)

**Configuration**:
```
Application Settings:
- Name: AI Chat Admin
- Domain: appdemo.oskarcode.com
- Path: /ai-chat-admin/
- Policy: Email domain (@oskarcode.com)
```

**Result**: 
- ✅ Page requires authentication
- ✅ Login flow works correctly
- ✅ Session persists
- ✅ Logout works

### 2. **Email-Based Policy**
```
Policy Name: Oskar Domain Access
Include Rules:
- Emails ending in: @oskarcode.com

Exclude Rules: (none)

Session Duration: 24 hours
```

**Testing**:
```bash
# Access with authorized email
Visit: https://appdemo.oskarcode.com/ai-chat-admin/
Expected: Shows login → Authenticates → Shows page
Result: ✅ Works

# Access with unauthorized email
Visit: Same URL with @gmail.com
Expected: Shows "Access Denied"
Result: ✅ Works
```

### 3. **IP-Based Policy**
```
Policy Name: Development IP Access
Include Rules:
- IP: 34.86.12.252 (production server)
- IP: YOUR_DEV_IP

Session Duration: Bypass (for server-to-server)
```

**Result**: ✅ Server can call its own APIs

### 4. **Session Management**
- ✅ 24-hour session duration works
- ✅ Session persists across tabs
- ✅ Logout clears session
- ✅ Re-authentication smooth

---

## ⚠️ Issues Encountered

### Issue #1: API Endpoints Return HTML Redirects

**The Core Problem**:

When protecting API endpoints with Cloudflare Access:

```javascript
// Frontend code
fetch('/api/ai-chat-admin/', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({message: "test"})
})
```

**Expected Response**:
```json
{
  "success": true,
  "response": "..."
}
```

**Actual Response**:
```html
HTTP/1.1 302 Found
Location: https://appdemo.cloudflareaccess.com/cdn-cgi/access/login

<!DOCTYPE html>
<html>
<head><title>Redirect</title></head>
<body>Redirecting to login...</body>
</html>
```

**Impact**:
- ❌ Frontend JavaScript errors
- ❌ `JSON.parse()` fails on HTML
- ❌ Error: "Unexpected token '<'"
- ❌ API functionality breaks

**Root Cause**:
Cloudflare Access is designed for browser-based flows, not API endpoints. It always redirects unauthenticated requests to login page, regardless of `Accept` header.

**What We Tried to Fix It**:

1. **Attempt**: Add `Accept: application/json` header
   ```javascript
   fetch('/api/ai-chat/', {
       headers: {
           'Accept': 'application/json',
           'Content-Type': 'application/json'
       }
   })
   ```
   **Result**: ❌ Still returns HTML redirect

2. **Attempt**: Use `X-Requested-With: XMLHttpRequest`
   ```javascript
   headers: {
       'X-Requested-With': 'XMLHttpRequest'
   }
   ```
   **Result**: ❌ Still returns HTML redirect

3. **Attempt**: Service tokens for API authentication
   ```
   Add CF-Access-Client-Id and CF-Access-Client-Secret headers
   ```
   **Result**: ⚠️ Works but requires manual token management

4. **Attempt**: Bypass API paths in Access config
   ```
   Protect: /ai-chat-admin/ (page)
   Don't protect: /api/ai-chat-admin/ (API)
   ```
   **Result**: ✅ Works but defeats security purpose

### Issue #2: Two Separate Endpoints Complexity

**What We Built**:
```
/ai-chat-user/      → Page (unprotected)
/api/ai-chat-user/  → API (read-only tools)

/ai-chat-admin/     → Page (Access protected)
/api/ai-chat-admin/ → API (full tools)
```

**Problems**:
1. Code duplication (similar views)
2. Two MCP servers to maintain
3. Confusion about which to use
4. Harder to test
5. More attack surface

**User Confusion**:
- "Which page do I use?"
- "Do I need to switch between them?"
- "Why are there two AI chats?"

### Issue #3: Access Token in Frontend

**Problem**: If protecting APIs, need to pass Access JWT

```javascript
// Would need to extract Cloudflare Access token
const accessToken = getCookie('CF_Authorization');

fetch('/api/ai-chat-admin/', {
    headers: {
        'CF-Access-JWT-Assertion': accessToken
    }
})
```

**Issues**:
- Cookie access from JavaScript (security risk)
- Token management in frontend
- CORS complications
- Token expiration handling

### Issue #4: Service Token Management

**What It Is**:
Service tokens allow machine-to-machine API access through Access

**Configuration**:
```
Cloudflare Dashboard → Access → Service Auth
Create Service Token:
- Name: Django API Access
- Client ID: abc123...
- Client Secret: xyz789...
```

**Usage**:
```python
headers = {
    'CF-Access-Client-Id': env.CLIENT_ID,
    'CF-Access-Client-Secret': env.CLIENT_SECRET
}
```

**Problems We Hit**:
1. Secrets management (another credential to store)
2. Rotation complexity (when to rotate?)
3. Not suitable for frontend calls (can't expose secret)
4. Only works for server-to-server (doesn't help our use case)

### Issue #5: Mixed Content (Secure Page → Insecure API)

**Scenario**:
```
Protected Page: https://appdemo.oskarcode.com/ai-chat-admin/
    ↓
Calls API: http://34.86.12.252/api/ai-chat-admin/
```

**Error**:
```
Mixed Content: The page at 'https://...' was loaded over HTTPS,
but requested an insecure resource 'http://...'. This request
has been blocked; the content must be served over HTTPS.
```

**Why**:
- Access requires HTTPS
- Our Django backend is HTTP only
- Browser blocks mixed content

**Temporary Fix**: Use same domain
```
https://appdemo.oskarcode.com/ai-chat-admin/
https://appdemo.oskarcode.com/api/ai-chat-admin/
```

But still hit the HTML redirect issue!

---

## 🔄 Workflows Tested

### Workflow 1: Protect Everything with Access (FAILED)

```
Step 1: Configure Access Application
        → Domain: appdemo.oskarcode.com
        → Paths: /*, /api/*
        → Policy: Email @oskarcode.com

Step 2: User visits page
        → Redirected to Access login
        → Enters email → Gets code
        → Redirects back to page
        ✅ Page loads

Step 3: JavaScript makes API call
        → fetch('/api/ai-chat/')
        → Access intercepts
        → Returns 302 HTML redirect
        ❌ JavaScript sees HTML, not JSON
        ❌ Error: "Unexpected token '<'"

RESULT: ❌ Page works, API broken
```

### Workflow 2: Protect Page Only (WORKED BUT INSECURE)

```
Step 1: Configure Access
        → Protect: /ai-chat-admin/ (page)
        → Don't protect: /api/* (APIs)

Step 2: User visits page
        → Access login flow
        ✅ Authenticated

Step 3: JavaScript makes API call
        → fetch('/api/ai-chat-admin/')
        → No Access check
        ✅ Returns JSON
        ✅ Works

PROBLEM: Anyone can call API directly!
         curl http://34.86.12.252/api/ai-chat-admin/
         → ✅ Works (no authentication)
```

### Workflow 3: Two-Tier System (COMPLEX)

```
Tier 1 - User Mode:
- Page: /ai-chat-user/ (no protection)
- API: /api/ai-chat-user/ (no protection)
- MCP: Read-only server
- Tools: 2 read tools

Tier 2 - Admin Mode:
- Page: /ai-chat-admin/ (Access protected)
- API: /api/ai-chat-admin/ (no protection)
- MCP: Full access server
- Tools: 6 tools (2 read + 4 write)

RESULT:
✅ Page protection works
❌ API still unprotected
❌ Complex codebase
❌ Confusing for users
```

### Workflow 4: Service Tokens for API (WORKED BUT WRONG FIT)

```
Step 1: Create Service Token
        CF Dashboard → Access → Service Auth
        → Client ID & Secret

Step 2: Store in Backend
        .env:
        CF_ACCESS_CLIENT_ID=abc...
        CF_ACCESS_CLIENT_SECRET=xyz...

Step 3: Django makes API call
        headers = {
            'CF-Access-Client-Id': env.CLIENT_ID,
            'CF-Access-Client-Secret': env.CLIENT_SECRET
        }
        
        response = requests.post(mcp_url, headers=headers)

RESULT:
✅ Server-to-server works
❌ Doesn't help frontend API calls
❌ Can't expose secret to JavaScript
❌ Wrong use case for our architecture
```

---

## 🧪 How We Tested

### Test 1: Page Protection
```bash
# Without authentication
curl -I https://appdemo.oskarcode.com/ai-chat-admin/

Expected: 302 Redirect to Access login
Actual: ✅ 302 Found, Location: /cdn-cgi/access/login

# With authentication (after browser login)
curl -I https://appdemo.oskarcode.com/ai-chat-admin/ \
  -H "Cookie: CF_Authorization=..."

Expected: 200 OK
Actual: ✅ 200 OK
```

### Test 2: API Protection (What Broke)
```bash
# Unprotected API
curl -X POST http://34.86.12.252/api/ai-chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'

Expected: JSON response
Actual: ✅ JSON response

# Access-protected API
curl -X POST https://appdemo.oskarcode.com/api/ai-chat-admin/ \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'

Expected: JSON response
Actual: ❌ HTML redirect (302)
```

### Test 3: Frontend API Call
```javascript
// Browser console
fetch('/api/ai-chat-admin/', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({message: "test", history: []})
})
.then(r => r.text())
.then(console.log)

// With Access protection on API:
Expected: JSON
Actual: "<!DOCTYPE html>..." (HTML redirect page)
Error in console: "Unexpected token '<', \"<!DOCTYPE\"... is not valid JSON"
```

### Test 4: Email Policy
```
Test Case 1: Authorized Email
- Email: user@oskarcode.com
- Expected: Access granted
- Actual: ✅ Access granted

Test Case 2: Unauthorized Email
- Email: user@gmail.com
- Expected: Access denied
- Actual: ✅ Access denied (red error page)

Test Case 3: Email Code Verification
- Enter email → Receive code → Enter code
- Expected: Login successful
- Actual: ✅ Works perfectly
```

### Test 5: IP-Based Policy
```
Configuration:
- Include IPs: 34.86.12.252 (production server)

Test from server:
ssh to production VM
curl https://appdemo.oskarcode.com/ai-chat-admin/

Expected: Direct access (bypass login)
Actual: ✅ Bypassed (for configured IPs)

Test from other IP:
curl from local machine

Expected: Redirect to login
Actual: ✅ Redirected
```

---

## 📊 Results & Findings

### What Works with Cloudflare Access

| Use Case | Works? | Notes |
|----------|--------|-------|
| **HTML Page Protection** | ✅ Yes | Perfect for dashboard/admin pages |
| **Login Flow** | ✅ Yes | Smooth email code verification |
| **Session Management** | ✅ Yes | 24hr sessions work well |
| **Email Policies** | ✅ Yes | Domain-based rules effective |
| **IP Policies** | ✅ Yes | Good for server-to-server |
| **Logout** | ✅ Yes | Clean session termination |

### What Doesn't Work

| Use Case | Works? | Reason |
|----------|--------|--------|
| **API Endpoint Protection** | ❌ No | Returns HTML redirects, not JSON |
| **JSON API with Access** | ❌ No | JavaScript fetch() gets HTML |
| **Frontend API Calls** | ❌ No | Mixed content, redirect issues |
| **Single Page App (SPA) APIs** | ❌ No | Access not designed for this |

### Success Rates

**Page Protection**:
- Setup Success: 100%
- Login Flow: 100%
- Session Persistence: 100%
- Overall: ✅ **100% Success**

**API Protection**:
- Setup Success: 100%
- Functionality: 0% (HTML redirects)
- Frontend Integration: 0%
- Overall: ❌ **0% Success for our use case**

---

## 🚫 Why We Moved Away from Access

### Reason 1: API Protection Incompatibility
- Access designed for browser-based flows
- Always returns HTML redirects
- Not suitable for JSON APIs
- Breaks JavaScript fetch() calls

### Reason 2: Architecture Mismatch
Our architecture:
```
Browser → HTML Page → JavaScript → API Endpoints → Backend
```

Access works for:
```
Browser → HTML Pages (with redirects)
```

Access doesn't work for:
```
JavaScript → API Endpoints (JSON-only)
```

### Reason 3: Complexity Without Benefit
To make Access work, we'd need:
- Service tokens (secrets management)
- Or bypass API protection (defeats purpose)
- Or complex token handling in frontend (security risk)

None of these are good solutions.

### Reason 4: Better Alternatives Exist
- IP-based firewall rules (simpler)
- Application-level auth (more control)
- VPN access (if needed)
- Direct worker architecture (what we chose)

---

## ✅ Final Solution (What Actually Worked)

### Solution: Simplified Architecture with IP-Based Protection

**No Cloudflare Access**, instead:

```
Browser
    ↓
Single Unified Page: /presentation/
    ↓
Single API Endpoint: /api/ai-chat/
    ↓
Single MCP Server: https://appdemo.oskarcode.com/mcp/sse
    ↓
Django Backend (IP-protected at network level)
```

**Protection Strategy**:
1. **Network-level**: GCP firewall rules
2. **Application-level**: Django ALLOWED_HOSTS
3. **MCP level**: IP allowlist in worker

**Why This Works**:
- ✅ No HTML redirect issues
- ✅ Simple architecture
- ✅ Easy to maintain
- ✅ No token management
- ✅ Production-ready
- ✅ Fast and reliable

### Implementation

**Django Settings**:
```python
# settings.py
ALLOWED_HOSTS = ['34.86.12.252', 'appdemo.oskarcode.com']

# Optional: IP whitelist middleware
ALLOWED_IPS = ['YOUR_IP', '34.86.12.252']
```

**GCP Firewall** (if needed):
```bash
gcloud compute firewall-rules create allow-http \
    --allow tcp:80,tcp:443 \
    --source-ranges YOUR_IP/32 \
    --target-tags django-server
```

**MCP Worker** (IP check):
```typescript
// mcp/index.ts
const ALLOWED_IPS = ['YOUR_IP', '34.86.12.252'];

export default {
  async fetch(request: Request) {
    const clientIP = request.headers.get('CF-Connecting-IP');
    if (!ALLOWED_IPS.includes(clientIP)) {
      return new Response('Forbidden', { status: 403 });
    }
    // Continue...
  }
}
```

---

## 📝 Lessons Learned

### About Cloudflare Access

1. **Perfect For**: Browser-based applications
   - Dashboards
   - Admin panels
   - Traditional web apps
   - WordPress sites

2. **Not Suitable For**:
   - JSON APIs called by JavaScript
   - Single Page Applications (SPA) backends
   - Mobile app APIs
   - Machine-to-machine communication (unless using service tokens)

3. **Key Limitation**:
   - Access always returns HTML redirects for unauthenticated requests
   - Cannot return JSON errors
   - Not designed for API-first applications

### About API Security

1. **For Public-Facing APIs**:
   - Use API keys
   - Use OAuth 2.0 (proper flow, not browser tokens)
   - Use rate limiting
   - Don't use Access

2. **For Internal APIs**:
   - IP allowlisting works well
   - VPN if needed
   - mTLS for high security
   - Access works if APIs are only called server-side

3. **For Hybrid (Page + API)**:
   - Protect pages with Access
   - Protect APIs with application-level auth
   - Don't try to protect APIs with Access

---

## 🎯 Recommendations

### When to Use Cloudflare Access

✅ **Use Access For**:
- Admin dashboards (HTML pages)
- Internal tools (server-rendered)
- WordPress admin
- Traditional web apps
- Any application where users interact with HTML pages

### When NOT to Use Cloudflare Access

❌ **Don't Use Access For**:
- JSON REST APIs
- GraphQL endpoints
- WebSocket connections (sometimes)
- Single Page Application backends
- APIs called from JavaScript
- Mobile app backends

### If You Need Both Page and API Protection

**Option A: Hybrid Approach** (What We Tried)
- Protect pages with Access
- Protect APIs with app-level auth (API keys, JWT)
- Accept two different auth systems

**Option B: Unified Auth** (Recommended)
- Use application-level auth for everything
- Implement JWT or session-based auth in Django
- Skip Cloudflare Access entirely

**Option C: Simplified** (What We Did)
- Single unified endpoint
- No separate user/admin modes
- IP-based protection at network level
- Simplest and most maintainable

---

## 🔧 Troubleshooting Guide

### Problem: "Unexpected token '<'"

**Symptom**:
```
Error: SyntaxError: Unexpected token '<', "<!DOCTYPE"... is not valid JSON
```

**Cause**: API endpoint returning HTML redirect instead of JSON

**Solution**: Remove Cloudflare Access from API endpoints
```
Only protect:  /admin/, /dashboard/
Don't protect: /api/*, /graphql/*
```

### Problem: "Access Denied" on API Call

**Symptom**: API returns 403 or redirect

**Solution**: Check if Access is protecting the endpoint
1. Go to Cloudflare Dashboard → Access → Applications
2. Find your application
3. Check which paths are protected
4. Remove `/api/*` from protected paths

### Problem: Mixed Content Error

**Symptom**:
```
Mixed Content: The page at 'https://...' was loaded over HTTPS,
but requested an insecure resource 'http://...'
```

**Solution**: 
- Ensure API is on same domain as page
- Or set up HTTPS on backend
- Or use relative URLs: `/api/...` not `http://...`

### Problem: Service Token Not Working

**Check**:
1. Token is active in dashboard
2. Headers are correct:
   - `CF-Access-Client-Id`
   - `CF-Access-Client-Secret`
3. Token policy includes your service/IP
4. Request is going through Cloudflare

---

## 📊 Timeline

- **Day 1**: Set up Access for pages (✅ worked)
- **Day 2**: Tried protecting API endpoints (❌ HTML redirects)
- **Day 3**: Attempted workarounds (❌ none satisfactory)
- **Day 4**: Built two-tier system (⚠️ worked but complex)
- **Day 5**: Realized Access wrong tool for APIs
- **Day 6**: Simplified to single endpoint + IP protection
- **Result**: Simpler, better solution

---

## 🔗 Related Documentation

- **OAuth Exploration**: See `EXPLORATION_SUMMARY_MCP_OAUTH.md`
- **Final Architecture**: See `README.md` → Architecture section
- **Django Views**: See `shop/views.py`
- **MCP Worker**: See `mcp/index.ts`

---

## ✅ Conclusion

### Cloudflare Access

**Best For**: ✅ HTML pages, dashboards, traditional web apps  
**Not For**: ❌ JSON APIs, SPA backends, mobile APIs

**Our Use Case**: ❌ **Not a Good Fit**
- We have JavaScript calling JSON APIs
- Access returns HTML redirects
- Breaks our frontend

### Final Solution

**Architecture**: Simple, unified, no separate auth
- One page, one API, one MCP server
- IP-based protection where needed
- No Access, no OAuth, no token management
- ✅ **Works perfectly in production**

### Key Takeaway

> "Don't use Cloudflare Access to protect API endpoints that return JSON and are called by frontend JavaScript. Use it for HTML pages only, or implement proper API authentication instead."

---

**Status**: Approach abandoned in favor of simpler IP-based protection  
**Date Explored**: October 2025  
**Outcome**: Learned Access is for pages, not APIs  
**Final Solution**: Unified architecture without Access
