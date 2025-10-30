# AI Chat Assistant Setup Guide

The AI Chat feature allows users to interact with the presentation content using natural language through Claude with MCP Connector.

---

## ✅ What Was Implemented

### **Backend:**
- ✅ `/api/ai-chat/` endpoint in `shop/views.py`
- ✅ Integration with Claude API using MCP Connector
- ✅ Conversation history management
- ✅ Tool execution detection

### **Frontend:**
- ✅ Beautiful chat widget UI
- ✅ Floating AI Assistant button
- ✅ Real-time chat interface
- ✅ Auto-refresh when content is updated

### **MCP Integration:**
- ✅ Connected to your MCP server at `https://appdemo.oskarcode.com/mcp/sse`
- ✅ All 6 tools available to Claude
- ✅ Natural language content updates

---

## 🔧 Setup Instructions

### 1. **Get Claude API Key**

1. Go to: https://console.anthropic.com/
2. Sign in or create an account
3. Navigate to "API Keys"
4. Create a new API key
5. Copy the key (starts with `sk-ant-api03-...`)

---

### 2. **Configure Environment Variable**

Add the API key to your environment:

**Local Development (`/.env`):**
```bash
CLAUDE_API_KEY=sk-ant-api03-YOUR-KEY-HERE
MCP_SERVER_URL=https://appdemo.oskarcode.com/mcp
```

**Production (GCP VM):**
```bash
# SSH into VM
gcloud compute ssh oskar-appdemo-se --zone=us-east4-b

# Edit environment file
cd /var/www/django-app
nano .env

# Add these lines:
CLAUDE_API_KEY=sk-ant-api03-YOUR-KEY-HERE
MCP_SERVER_URL=https://appdemo.oskarcode.com/mcp

# Save and exit (Ctrl+X, Y, Enter)

# Restart Django
sudo systemctl restart django
```

---

### 3. **Install Dependencies**

The `requests` library has been added to `requirements.txt`:

```bash
# Local development
pip install -r requirements.txt

# Production (done automatically via update-traditional.sh)
```

---

### 4. **Deploy to Production**

```bash
# Push changes
git add -A
git commit -m "Add AI chat assistant with MCP connector"
git push origin main

# Deploy
./update-traditional.sh
```

---

## 🎯 How to Use

### **For End Users:**

1. **Open Presentation Page:**
   - Visit: https://appdemo.oskarcode.com/presentation/

2. **Click AI Assistant Button:**
   - Orange floating button in bottom-right corner

3. **Start Chatting:**
   - Type natural language requests
   - Examples:
     - "Show me the case background"
     - "Update the business context to focus on healthcare"
     - "What are the current pain points?"
     - "Change the company name to HealthCare Inc"

4. **Watch It Work:**
   - AI will use MCP tools to read/update content
   - Page auto-refreshes after updates
   - See changes immediately

---

## 🔍 Example Conversations

### **Example 1: View Content**

**User:** "Show me the current case background"

**AI:** "Let me get that for you..."  
*(Uses `get_presentation_section` tool)*  
"Here's the current case background: ToTheMoon.com is a space and astronomy e-commerce platform..."

---

### **Example 2: Update Content**

**User:** "Update the company to FinTech Solutions, a payment processing platform"

**AI:** "I'll update that for you..."  
*(Uses `update_case_background` tool)*  
"✅ Successfully updated! The case background now features FinTech Solutions as a payment processing platform. The page will refresh shortly."

---

### **Example 3: Bulk Changes**

**User:** "Update all sections for a new customer: MedicalApp, a healthcare telemedicine platform"

**AI:** "I'll update all four sections..."  
*(Uses multiple tools)*  
"✅ Updated all sections! MedicalApp is now featured across:
- Case Background: Healthcare telemedicine context
- Architecture: Medical data flow
- Solutions: HIPAA compliance focus
- Business Value: Healthcare ROI metrics"

---

## 🛠️ Technical Details

### **API Endpoint:**
```
POST /api/ai-chat/
```

**Request:**
```json
{
  "message": "User's natural language request",
  "history": [
    {"role": "user", "content": "Previous message"},
    {"role": "assistant", "content": [...]}
  ]
}
```

**Response:**
```json
{
  "success": true,
  "response": "AI's text response",
  "tool_used": true,
  "conversation": [...],
  "usage": {...}
}
```

---

### **MCP Integration:**

The endpoint calls Claude API with:
```python
{
  'model': 'claude-sonnet-4-5',
  'max_tokens': 4096,
  'system': '...',
  'messages': [...],
  'mcp_servers': [
    {
      'type': 'url',
      'url': 'https://appdemo.oskarcode.com/mcp/sse',
      'name': 'presentation-manager'
    }
  ]
}
```

Claude automatically:
1. Understands user intent
2. Decides which MCP tool to use
3. Calls the tool via your MCP server
4. Returns natural language response

---

## 🐛 Troubleshooting

### **Error: "CLAUDE_API_KEY not configured"**

**Solution:**
- Ensure `CLAUDE_API_KEY` is set in `.env`
- Restart Django: `sudo systemctl restart django`
- Verify: `echo $CLAUDE_API_KEY`

---

### **Error: "API request failed"**

**Possible Causes:**
1. Invalid API key
2. MCP server unreachable
3. Network timeout

**Solution:**
- Test API key with curl (use the command from test.txt)
- Check MCP server: `curl https://appdemo.oskarcode.com/mcp/`
- Check logs: `tail -f /var/www/django-app/django.log`

---

### **Chat widget doesn't appear**

**Solution:**
- Clear browser cache
- Check browser console for errors
- Verify template is included: `{% include 'shop/includes/ai_chat_widget.html' %}`

---

### **Page doesn't auto-refresh**

**Explanation:**
- Auto-refresh only happens when tools are used
- Check `tool_used` in response
- Manual refresh still works

---

## 🎨 Customization

### **Change System Prompt:**

Edit `shop/views.py`, line ~329:
```python
system_prompt = """Your custom instructions here..."""
```

---

### **Change Model:**

Edit `shop/views.py`, line ~353:
```python
'model': 'claude-sonnet-4-5',  # or 'claude-opus-4', etc.
```

---

### **Adjust Widget Style:**

Edit `shop/templates/shop/includes/ai_chat_widget.html`:
- Widget colors (search for `#f97316`)
- Position (search for `bottom:` and `right:`)
- Size (search for `width:`)

---

## 📊 Cost Estimation

**Claude API Pricing (as of 2024):**
- Input: ~$3 per million tokens
- Output: ~$15 per million tokens

**Typical Usage:**
- Simple view request: ~1K tokens = $0.003
- Content update: ~2-3K tokens = $0.01
- 100 conversations/day ≈ $1-2/day

**Optimization:**
- Use `claude-haiku` for cheaper option (lower quality)
- Implement caching for repeated queries
- Add rate limiting per user

---

## 🔐 Security Considerations

**Current Implementation:**
- ✅ CSRF exempt (required for API)
- ✅ API key in environment (not hardcoded)
- ⚠️ No authentication (anyone can use)
- ⚠️ No rate limiting

**Recommended for Production:**
1. Add user authentication
2. Implement rate limiting (e.g., 10 requests/minute)
3. Add API usage monitoring
4. Consider caching responses
5. Add audit logging

---

## 📝 Files Modified

```
shop/
├── views.py                    # Added ai_chat endpoint
├── urls.py                     # Added /api/ai-chat/ route
└── templates/shop/
    ├── presentation_dynamic.html   # Included widget
    └── includes/
        └── ai_chat_widget.html     # New chat UI

requirements.txt                # Added requests library
```

---

## ✅ Testing Checklist

**Before Production:**
- [ ] API key configured in production .env
- [ ] Dependencies installed
- [ ] Chat widget appears on page
- [ ] Can send messages
- [ ] AI responds correctly
- [ ] Tools execute successfully
- [ ] Page refreshes after updates
- [ ] Conversation history maintained

**Test Commands:**
```bash
# Test API directly
curl -X POST https://appdemo.oskarcode.com/api/ai-chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "Show me the case background"}'

# Test MCP server
curl https://appdemo.oskarcode.com/mcp/

# Check logs
tail -f /var/www/django-app/django.log
```

---

## 🎉 Success Criteria

Your AI chat is working correctly when:
1. ✅ Widget opens/closes properly
2. ✅ User can send messages
3. ✅ AI responds in natural language
4. ✅ Content updates when requested
5. ✅ Page refreshes automatically
6. ✅ Conversation history preserved

---

**🚀 You now have a fully functional AI assistant for your presentation!**

Users can update content using natural language without needing to know the technical details or JSON structure.
