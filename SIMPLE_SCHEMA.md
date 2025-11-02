# SIMPLE Presentation Schema

## Overview
This is the SIMPLIFIED, RELIABLE schema for AI-editable presentations. Use this for testing.

**Accessed at:** `/presentation/simple/`

---

## Schema Definition

### 1. Case Background
```json
{
  "company": "string",
  "industry": "string", 
  "description": "string",
  "current_challenge": "string",
  "pain_points": ["string", "string", "string"]
}
```

**Example:**
```json
{
  "company": "TechCorp E-commerce",
  "industry": "Online Retail",
  "description": "A global e-commerce platform serving 1M+ customers",
  "current_challenge": "High bandwidth costs and security vulnerabilities",
  "pain_points": [
    "DDoS attacks causing downtime",
    "SQL injection vulnerabilities",
    "Slow page load times globally"
  ]
}
```

---

### 2. Architecture
```json
{
  "current_stack": ["string", "string", ...],
  "cloudflare_stack": ["string", "string", ...]
}
```

**Example:**
```json
{
  "current_stack": [
    "User → Origin Server",
    "Manual DDoS mitigation",
    "No WAF protection",
    "Single region deployment"
  ],
  "cloudflare_stack": [
    "User → Cloudflare Edge",
    "Automatic DDoS protection",
    "WAF at the edge",
    "Global CDN with 330+ locations"
  ]
}
```

---

### 3. How Cloudflare Helps
```json
{
  "solutions": [
    {
      "name": "string",
      "description": "string"
    }
  ]
}
```

**Example:**
```json
{
  "solutions": [
    {
      "name": "WAF Protection",
      "description": "Blocks SQL injection and XSS attacks automatically"
    },
    {
      "name": "DDoS Mitigation",
      "description": "Absorbs attacks with 405 Tbps capacity"
    },
    {
      "name": "Global CDN",
      "description": "Caches content at 330+ edge locations worldwide"
    }
  ]
}
```

---

### 4. Business Value
```json
{
  "metrics": [
    {
      "category": "string",
      "value": "string"
    }
  ]
}
```

**Example:**
```json
{
  "metrics": [
    {
      "category": "Cost Savings",
      "value": "$50K/year in bandwidth costs"
    },
    {
      "category": "Performance",
      "value": "50% faster page load times"
    },
    {
      "category": "Security",
      "value": "99.9% attack mitigation rate"
    }
  ]
}
```

---

## AI Instructions for Updates

When the AI updates any section, it MUST follow this exact schema.

### Example AI Commands:

**Update case background:**
```
"Update case background to a gaming company with DDoS protection needs"
```

**Update architecture:**
```
"Change architecture to show gaming traffic flow"
```

**Update solutions:**
```
"Update solutions to focus on gaming industry needs"
```

**Update metrics:**
```
"Change business value metrics to gaming-specific ROI"
```

---

## MCP Tool Usage

The MCP tools accept content in this format:

```python
content = {
  "company": "NewCorp",
  "industry": "Gaming",
  # ... other fields
}
```

---

## Testing Workflow

1. **Seed simple data:**
   ```bash
   python manage.py seed_presentation_simple
   ```

2. **View presentation:**
   ```
   http://34.86.12.252/presentation/simple/
   ```

3. **Test AI updates via admin chat:**
   ```
   http://34.86.12.252/ai-chat-admin/
   ```

4. **Verify changes:**
   - Refresh presentation page
   - Check debug info at bottom
   - Verify all fields display correctly

---

## Key Differences from Complex Schema

| Feature | Complex | Simple |
|---------|---------|--------|
| Nested objects | Yes (3+ levels) | No (max 2 levels) |
| Arrays of objects | Yes | Yes (but simple) |
| Optional fields | Many | Few |
| Total fields | 30+ | 15 |
| Icons/styling | Custom per item | Standard |
| Validation | Strict | Flexible |

---

## Success Criteria

✅ All fields display on frontend  
✅ AI can update any section  
✅ Updates appear immediately (no cache)  
✅ No field name mismatches  
✅ Debug info shows correct keys  

---

## Troubleshooting

If content doesn't show:

1. Check debug info at bottom of page
2. Verify database has correct keys
3. Ensure no typos in field names
4. Re-seed if structure is wrong

```bash
# Check database
python manage.py shell
>>> from shop.models import PresentationSection
>>> section = PresentationSection.objects.get(section_type='case_background')
>>> print(section.content_json.keys())
```
