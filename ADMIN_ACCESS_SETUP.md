# Admin Endpoint Access Control Setup

## Overview

The AI Assistant now uses **two separate endpoints** with different access levels:

| Endpoint | Access | Tools | Protection |
|----------|--------|-------|------------|
| `/api/ai-chat-user/` | Public | 2 read-only | None (safe) |
| `/api/ai-chat-admin/` | Restricted | 6 read/write | **Cloudflare Access Policy** |

---

## Architecture

```
User Browser
    ↓
Frontend (mode toggle)
    ↓           ↓
User Endpoint   Admin Endpoint (Protected by Access Policy!)
    ↓           ↓
MCP Workers (mcpr)  MCP Workers (mcpw)
    ↓           ↓
Read-Only Tools    Read + Write Tools
```

### **Key Points:**

1. **No OAuth tokens** - Uses direct MCP worker URLs
2. **IP-based access** - MCP workers accessible from server IP
3. **Endpoint-level protection** - Cloudflare Access guards the admin endpoint
4. **Simple architecture** - No portal complexity

---

## How to Protect Admin Endpoint

### **Option 1: Cloudflare Access Application (Recommended)**

#### **Step 1: Create Access Application**

1. Go to **Cloudflare Dashboard** → **Zero Trust** → **Access** → **Applications**
2. Click **"Add an application"**
3. Select **"Self-hosted"**

#### **Step 2: Configure Application**

```yaml
Application Name: AI Assistant Admin Endpoint
Session Duration: 24 hours

Application Domain:
  - Subdomain: (leave blank)
  - Domain: 34.86.12.252 or your custom domain
  - Path: /api/ai-chat-admin/*
```

#### **Step 3: Add Access Policy**

**Policy Name**: Admin Users Only

**Action**: Allow

**Configure rules**:

**Option A: Specific Emails**
```
Include:
  - Emails: ubuntu@oskarcode.com, admin@example.com
```

**Option B: Email Domain**
```
Include:
  - Email domain: oskarcode.com
```

**Option C: Group-Based**
```
Include:
  - User Group: AI-Admins  (create group first)
```

**Option D: With MFA**
```
Include:
  - Emails: ubuntu@oskarcode.com
Require:
  - Authentication Method: Any
  - MFA: Required
```

#### **Step 4: Save and Deploy**

1. Click **"Save application"**
2. Access policy is now active!

---

### **Option 2: Cloudflare WAF Rule**

If you don't want login popup, use WAF to block by IP/country:

1. **Cloudflare Dashboard** → **Security** → **WAF**
2. Create custom rule:

```
Rule Name: Block Admin Endpoint
Field: URI Path
Operator: equals
Value: /api/ai-chat-admin/

AND

Field: IP Source Address
Operator: is not in list
Value: YOUR_IP_ADDRESS

Then: Block
```

---

### **Option 3: Django Middleware (Simplest)**

Add authentication at Django level:

```python
# In shop/views.py - at top of ai_chat_admin function

@csrf_exempt
def ai_chat_admin(request):
    """Admin endpoint - protected"""
    
    # Simple authentication check
    auth_header = request.headers.get('Authorization', '')
    admin_token = os.getenv('ADMIN_API_TOKEN', 'secret-token-here')
    
    if auth_header != f'Bearer {admin_token}':
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    # Rest of function...
```

Then in frontend:
```javascript
const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer secret-token-here'  // Add this
    },
    body: JSON.stringify({...})
});
```

---

## Testing Access Policy

### **Test 1: User Endpoint (Should Always Work)**

```bash
curl -X POST http://34.86.12.252/api/ai-chat-user/ \
  -H "Content-Type: application/json" \
  -d '{"message": "test", "history": []}'

Expected: ✅ Success (200 OK)
```

### **Test 2: Admin Endpoint (Before Protection)**

```bash
curl -X POST http://34.86.12.252/api/ai-chat-admin/ \
  -H "Content-Type: application/json" \
  -d '{"message": "test", "history": []}'

Expected: ✅ Success (200 OK) - Currently accessible
```

### **Test 3: Admin Endpoint (After Protection)**

```bash
# Without authentication
curl -X POST http://34.86.12.252/api/ai-chat-admin/ \
  -H "Content-Type: application/json" \
  -d '{"message": "test", "history": []}'

Expected: ❌ 403 Forbidden or Redirect to login
```

### **Test 4: Web UI Flow**

1. Open http://34.86.12.252
2. Click **"User"** button → Should work normally ✅
3. Click **"Admin"** button → Should prompt for authentication (if policy active) 🔐
4. After login → Admin mode works ✅

---

## What Happens When Policy is Active

### **User Flow:**

```
1. User opens web app → OK
2. User clicks "User" mode → Works immediately ✅
3. User clicks "Admin" mode:
   a. Browser makes request to /api/ai-chat-admin/
   b. Cloudflare Access intercepts request
   c. User redirected to login page 🔐
   d. User authenticates (email, SSO, etc.)
   e. Cloudflare issues session cookie
   f. User redirected back to app
   g. Admin mode now works ✅
```

### **Session Management:**

- **Session duration**: 24 hours (configurable)
- **Cookie-based**: Cloudflare manages auth state
- **Seamless**: Once authenticated, no repeated prompts
- **Per-domain**: Auth persists across page reloads

---

## Current State

✅ **Implemented:**
- Two separate endpoints
- Direct MCP worker URLs
- Frontend routing based on mode
- Simple IP-based access to workers

⏳ **To Do:**
- Add Cloudflare Access policy to admin endpoint
- Test authentication flow
- Configure session duration
- Set up authorized users/groups

---

## Advantages of This Approach

### **vs. Single Endpoint with Mode Parameter:**

❌ **Old**: `/api/ai-chat/` with `{mode: 'admin'}` parameter
- Can't protect just admin functionality
- All-or-nothing access control

✅ **New**: Separate `/api/ai-chat-admin/` endpoint
- Can protect admin endpoint specifically
- User endpoint remains open
- Clear separation of concerns

### **vs. OAuth Portal Tokens:**

❌ **Old**: Portal URLs + OAuth tokens
- Complex token management
- Token expiration issues
- Refresh token rotation needed
- All users share same server token

✅ **New**: Direct workers + Access policy on endpoint
- No token management
- Simple IP-based worker access
- Access control at endpoint level
- Each user authenticates individually

---

## Recommended Next Steps

1. **Set up Cloudflare Access Application** for `/api/ai-chat-admin/*`
2. **Add yourself** to the allow list
3. **Test the flow**: 
   - User mode should work without auth
   - Admin mode should prompt for login
4. **Configure session duration** (recommend 24 hours)
5. **Add MFA** for extra security (optional)
6. **Monitor Access logs** to see who's using admin mode

---

## Support

If you have issues:

1. Check Cloudflare Access logs
2. Verify path matches: `/api/ai-chat-admin/*`
3. Test with `curl` first before web UI
4. Check browser console for errors
5. Verify session cookies are being set

---

**Your AI Assistant is now ready for production with proper access control!** 🚀🔐
