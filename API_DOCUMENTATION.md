# Presentation API Documentation

Complete documentation for all presentation page API endpoints.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Base URL](#base-url)
3. [API Endpoints](#api-endpoints)
   - [Get All Sections](#1-get-all-sections)
   - [Get Single Section](#2-get-single-section)
   - [Update Section](#3-update-section)
   - [AI Chat](#4-ai-chat)
4. [Data Structures](#data-structures)
5. [Error Responses](#error-responses)

---

## Overview

The Presentation API provides RESTful endpoints to manage dynamic presentation content. Content is organized into four sections:
- **case_background** - Business context and pain points
- **architecture** - Current vs. proposed architecture
- **how_cloudflare_help** - Solutions and network advantages
- **business_value** - ROI and value propositions

---

## Base URL

**Production:** `https://appdemo.oskarcode.com`  
**Local:** `http://localhost:8000`

---

# API Endpoints

## 1. Get All Sections

Retrieve all presentation sections at once.

### **Endpoint**
```
GET /api/presentation/sections/
```

### **Method**
- `GET`

### **Authentication**
- None (public endpoint)

### **Request Headers**
```
Content-Type: application/json
```

### **Request Parameters**
None

### **Response Format**
```json
{
  "case_background": {
    "content": { ... },
    "last_modified": "2024-10-30T00:00:00.000000",
    "version": 1
  },
  "architecture": {
    "content": { ... },
    "last_modified": "2024-10-30T00:00:00.000000",
    "version": 1
  },
  "how_cloudflare_help": {
    "content": { ... },
    "last_modified": "2024-10-30T00:00:00.000000",
    "version": 1
  },
  "business_value": {
    "content": { ... },
    "last_modified": "2024-10-30T00:00:00.000000",
    "version": 1
  }
}
```

### **Status Codes**
- `200 OK` - Success

### **Example Request**
```bash
curl https://appdemo.oskarcode.com/api/presentation/sections/
```

---

## 2. Get Single Section

Retrieve a specific presentation section by type.

### **Endpoint**
```
GET /api/presentation/sections/<section_type>/
```

### **Method**
- `GET`

### **URL Parameters**
- `section_type` (string, required) - One of:
  - `case_background`
  - `architecture`
  - `how_cloudflare_help`
  - `business_value`

### **Authentication**
- None (public endpoint)

### **Request Headers**
```
Content-Type: application/json
```

### **Response Format**
```json
{
  "section_type": "case_background",
  "content": {
    "business_context": { ... },
    "current_solution": { ... },
    "pain_points": [ ... ]
  },
  "last_modified": "2024-10-30T00:00:00.000000",
  "version": 1
}
```

### **Status Codes**
- `200 OK` - Success
- `404 Not Found` - Section does not exist

### **Example Request**
```bash
curl https://appdemo.oskarcode.com/api/presentation/sections/case_background/
```

### **Example Error Response**
```json
{
  "error": "Section invalid_name not found"
}
```

---

## 3. Update Section

Update or create a presentation section. Used by AI assistant via MCP.

### **Endpoint**
```
PUT /api/presentation/sections/<section_type>/update/
```

### **Method**
- `PUT` (only)

### **URL Parameters**
- `section_type` (string, required) - One of:
  - `case_background`
  - `architecture`
  - `how_cloudflare_help`
  - `business_value`

### **Authentication**
- None (CSRF exempt for MCP integration)

### **Request Headers**
```
Content-Type: application/json
```

### **Request Body**
```json
{
  "content": {
    // Section-specific JSON structure (see Data Structures below)
  }
}
```

### **Required Fields**
- `content` (object, required) - The complete section data

### **Response Format**
```json
{
  "success": true,
  "section_type": "case_background",
  "version": 2,
  "last_modified": "2024-10-30T00:00:00.000000",
  "created": false
}
```

### **Status Codes**
- `200 OK` - Success
- `400 Bad Request` - Invalid JSON or missing content
- `405 Method Not Allowed` - Wrong HTTP method
- `500 Internal Server Error` - Server error

### **Example Request**
```bash
curl -X PUT https://appdemo.oskarcode.com/api/presentation/sections/case_background/update/ \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "business_context": {
        "title": "Updated Title",
        "description": "New description"
      }
    }
  }'
```

### **Example Error Responses**

**Missing Content:**
```json
{
  "error": "Content is required"
}
```

**Invalid JSON:**
```json
{
  "error": "Invalid JSON"
}
```

**Wrong Method:**
```json
{
  "error": "PUT method required"
}
```

---

## 4. AI Chat

Interactive AI assistant endpoint for natural language content editing.

### **Endpoint**
```
POST /api/ai-chat/
```

### **Method**
- `POST` (only)

### **Authentication**
- None (CSRF exempt)
- Requires `CLAUDE_API_KEY` environment variable

### **Request Headers**
```
Content-Type: application/json
```

### **Request Body**
```json
{
  "message": "User's question or command",
  "history": [
    {
      "role": "user",
      "content": "Previous user message"
    },
    {
      "role": "assistant",
      "content": "Previous AI response"
    }
  ]
}
```

### **Required Fields**
- `message` (string, required) - User's current message
- `history` (array, optional) - Conversation history for context

### **Response Format**
```json
{
  "response": "AI's response text",
  "conversation": [
    {
      "role": "user",
      "content": "User message"
    },
    {
      "role": "assistant",
      "content": "AI response"
    }
  ],
  "tool_used": true
}
```

### **Response Fields**
- `response` (string) - AI's text response
- `conversation` (array) - Updated conversation history
- `tool_used` (boolean) - Whether AI used MCP tools to update content

### **Status Codes**
- `200 OK` - Success
- `400 Bad Request` - Missing message
- `405 Method Not Allowed` - Wrong HTTP method
- `500 Internal Server Error` - API key not configured or API error

### **Example Request**
```bash
curl -X POST https://appdemo.oskarcode.com/api/ai-chat/ \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me the case background",
    "history": []
  }'
```

### **Example Response**
```json
{
  "response": "ToTheMoon.com is a space collectibles site with $5K/month bandwidth costs. Main issues: expensive hosting, no WAF protection, bot scraping. Solutions coming up.",
  "conversation": [
    {
      "role": "user",
      "content": "Show me the case background"
    },
    {
      "role": "assistant",
      "content": "ToTheMoon.com is a space collectibles site..."
    }
  ],
  "tool_used": false
}
```

### **Example Update Request**
```bash
curl -X POST https://appdemo.oskarcode.com/api/ai-chat/ \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Update network capacity to 500 Tbps",
    "history": []
  }'
```

### **Example Error Response**
```json
{
  "error": "Message is required"
}
```

---

# Data Structures

## Section Type: `case_background`

### Structure
```json
{
  "business_context": {
    "title": "string",
    "description": "string",
    "stats": [
      {
        "icon": "string",           // FontAwesome icon name
        "label": "string",
        "value": "string"
      }
    ]
  },
  "current_solution": {
    "title": "string",
    "description": "string",
    "problems": ["string"]          // Array of problem descriptions
  },
  "pain_points": [
    {
      "title": "string",
      "icon": "string",              // FontAwesome icon name
      "description": "string",
      "severity": "string",          // "low", "medium", "high", "critical"
      "test_links": [
        {
          "text": "string",
          "url": "string"            // Relative or absolute URL
        }
      ]
    }
  ]
}
```

### Example
```json
{
  "business_context": {
    "title": "E-commerce Application",
    "description": "Global online retail platform",
    "stats": [
      {
        "icon": "users",
        "label": "Global User Base",
        "value": "Users all over the world"
      }
    ]
  },
  "current_solution": {
    "title": "Current Solution",
    "description": "Point security solution",
    "problems": [
      "Limited coverage",
      "Complex management"
    ]
  },
  "pain_points": [
    {
      "title": "SQL Injection Attacks",
      "icon": "bug",
      "description": "Database vulnerabilities",
      "severity": "critical",
      "test_links": [
        {
          "text": "Test: SQL Injection",
          "url": "/search/?q=test' OR '1'='1' --"
        }
      ]
    }
  ]
}
```

---

## Section Type: `architecture`

### Structure
```json
{
  "problems_mapping": [
    {
      "problem": "string",
      "current_solution": "string",
      "limitations": ["string"]      // Array of limitation descriptions
    }
  ],
  "traffic_flow": {
    "before": ["string"],            // Array of traffic flow steps
    "after": ["string"]              // Array of traffic flow steps
  }
}
```

### Example
```json
{
  "problems_mapping": [
    {
      "problem": "Slow content delivery globally",
      "current_solution": "CDN - AWS CloudFront",
      "limitations": [
        "Limited edge locations",
        "Higher latency in some regions"
      ]
    }
  ],
  "traffic_flow": {
    "before": [
      "User → DNS",
      "DNS → AWS CloudFront (CDN)",
      "CloudFront → Fastly (WAF)",
      "Fastly → Web Server"
    ],
    "after": [
      "User → DNS",
      "DNS → Cloudflare (CDN + WAF + DDoS)",
      "Cloudflare → Web Server"
    ]
  }
}
```

---

## Section Type: `how_cloudflare_help`

### Structure
```json
{
  "solutions": [
    {
      "pain_point": "string",
      "cloudflare_solution": "string",
      "how_it_works": "string",
      "benefits": ["string"]         // Array of benefit descriptions
    }
  ],
  "network_advantages": {
    "latency": "string",             // Concise stat
    "network_capacity": "string",    // Concise stat
    "locations": "string",           // Concise stat
    "direct_connections": "string"   // Concise stat
  }
}
```

### Example
```json
{
  "solutions": [
    {
      "pain_point": "SQL Injection",
      "cloudflare_solution": "WAF OWASP Core Ruleset",
      "how_it_works": "Inspects requests for SQL injection patterns",
      "benefits": [
        "99.9% detection rate",
        "No application changes needed"
      ]
    }
  ],
  "network_advantages": {
    "latency": "~50ms from 95% of population",
    "network_capacity": "405 Tbps",
    "locations": "330 cities in 125+ countries",
    "direct_connections": "13,000 networks"
  }
}
```

---

## Section Type: `business_value`

### Structure
```json
{
  "value_propositions": [
    {
      "title": "string",
      "icon": "string",              // FontAwesome icon name
      "description": "string",
      "metrics": [
        {
          "label": "string",
          "improvement": "string"
        }
      ],
      "learn_more": [
        {
          "text": "string",
          "url": "string"
        }
      ]
    }
  ],
  "roi_summary": {
    "implementation_time": "string",  // Concise stat
    "payback_period": "string",       // Concise stat
    "annual_savings": "string",       // Concise stat
    "revenue_impact": "string"        // Concise stat
  }
}
```

### Example
```json
{
  "value_propositions": [
    {
      "title": "Superior Online Experience",
      "icon": "rocket",
      "description": "Fast, reliable shopping experiences",
      "metrics": [
        {
          "label": "Page Load Time",
          "improvement": "50% faster"
        },
        {
          "label": "Conversion Rate",
          "improvement": "25% increase"
        }
      ],
      "learn_more": [
        {
          "text": "Web Optimization",
          "url": "https://cloudflare.com/..."
        }
      ]
    }
  ],
  "roi_summary": {
    "implementation_time": "< 30 minutes",
    "payback_period": "Immediate",
    "annual_savings": "$50K-150K+",
    "revenue_impact": "+15-25%"
  }
}
```

---

# Error Responses

## Standard Error Format

All errors follow this format:

```json
{
  "error": "Error message description"
}
```

## Common HTTP Status Codes

| Code | Meaning | When It Occurs |
|------|---------|----------------|
| `200` | OK | Request successful |
| `400` | Bad Request | Invalid JSON, missing required fields |
| `404` | Not Found | Section does not exist |
| `405` | Method Not Allowed | Wrong HTTP method (e.g., GET instead of PUT) |
| `500` | Internal Server Error | Server-side error, missing config |

## Example Error Responses

### 400 - Bad Request
```json
{
  "error": "Content is required"
}
```

### 404 - Not Found
```json
{
  "error": "Section invalid_section not found"
}
```

### 405 - Method Not Allowed
```json
{
  "error": "PUT method required"
}
```

### 500 - Internal Server Error
```json
{
  "error": "CLAUDE_API_KEY not configured"
}
```

---

# Integration Examples

## JavaScript (Fetch API)

### Get All Sections
```javascript
fetch('https://appdemo.oskarcode.com/api/presentation/sections/')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

### Update Section
```javascript
fetch('https://appdemo.oskarcode.com/api/presentation/sections/case_background/update/', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    content: {
      business_context: {
        title: "Updated Title"
      }
    }
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

### AI Chat
```javascript
fetch('https://appdemo.oskarcode.com/api/ai-chat/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: "Show me the network advantages",
    history: []
  })
})
  .then(response => response.json())
  .then(data => {
    console.log('AI Response:', data.response);
    console.log('Tool Used:', data.tool_used);
  })
  .catch(error => console.error('Error:', error));
```

---

## Python (Requests)

### Get All Sections
```python
import requests

response = requests.get('https://appdemo.oskarcode.com/api/presentation/sections/')
data = response.json()
print(data)
```

### Update Section
```python
import requests

url = 'https://appdemo.oskarcode.com/api/presentation/sections/case_background/update/'
data = {
    'content': {
        'business_context': {
            'title': 'Updated Title'
        }
    }
}

response = requests.put(url, json=data)
print(response.json())
```

### AI Chat
```python
import requests

url = 'https://appdemo.oskarcode.com/api/ai-chat/'
data = {
    'message': 'Show me the ROI summary',
    'history': []
}

response = requests.post(url, json=data)
result = response.json()
print(f"AI: {result['response']}")
print(f"Tool Used: {result['tool_used']}")
```

---

## curl Examples

### Get All Sections
```bash
curl https://appdemo.oskarcode.com/api/presentation/sections/
```

### Get Single Section
```bash
curl https://appdemo.oskarcode.com/api/presentation/sections/case_background/
```

### Update Section
```bash
curl -X PUT https://appdemo.oskarcode.com/api/presentation/sections/case_background/update/ \
  -H "Content-Type: application/json" \
  -d '{"content": {"business_context": {"title": "New Title"}}}'
```

### AI Chat with History
```bash
curl -X POST https://appdemo.oskarcode.com/api/ai-chat/ \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Update network capacity to 500 Tbps",
    "history": [
      {"role": "user", "content": "Show me network advantages"},
      {"role": "assistant", "content": "Here are the stats..."}
    ]
  }'
```

---

# Notes & Best Practices

## Data Validation
- All JSON must be valid and properly formatted
- Section types are case-sensitive
- Icon names should be valid FontAwesome icons
- URLs in `test_links` can be relative or absolute

## Versioning
- Each update increments the `version` field
- `last_modified` timestamp updates automatically
- Use version numbers to track changes

## AI Chat Best Practices
- Provide conversation history for context
- Be specific in requests (e.g., "Update latency to 45ms")
- Check `tool_used` flag to know if content was modified
- Frontend should auto-refresh when `tool_used` is true

## Performance
- All endpoints respond within 50-200ms
- AI chat may take 2-5 seconds depending on complexity
- Network advantages should use concise stats for clean display

---

**Last Updated:** 2024-10-30  
**API Version:** 1.0  
**Base URL:** https://appdemo.oskarcode.com
