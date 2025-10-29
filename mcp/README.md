# Presentation MCP Server

**Model Context Protocol (MCP) Server for AI-powered Presentation Management**

This MCP server enables AI assistants (like Windsurf, Claude Desktop, or any MCP-compatible client) to read and update dynamic presentation content stored in the Django backend.

---

## 📋 Table of Contents

- [What is MCP?](#what-is-mcp)
- [Architecture Overview](#architecture-overview)
- [Quick Start](#quick-start)
- [Available Tools](#available-tools)
- [Configuration](#configuration)
- [Development](#development)
- [Deployment](#deployment)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)

---

## What is MCP?

The Model Context Protocol (MCP) is an open standard that enables AI assistants to securely connect to external tools and data sources. Think of it as a universal API for AI agents.

**Benefits:**
- ✅ **Standardized**: One protocol works with multiple AI clients
- ✅ **Reusable**: Write tools once, use in multiple applications
- ✅ **Secure**: Controlled access to your data and services
- ✅ **Extensible**: Easy to add new capabilities

---

## Architecture Overview

```
┌─────────────────┐
│  Windsurf IDE   │  (or Claude Desktop, any MCP client)
│   (AI Client)   │
└────────┬────────┘
         │
         │ stdio transport
         ↓
┌─────────────────┐
│   mcp-remote    │  (local proxy - converts stdio ↔ HTTP)
│  (Local Proxy)  │
└────────┬────────┘
         │
         │ HTTPS
         ↓
┌─────────────────────────────────────┐
│  Presentation MCP Server            │  ⭐ THIS SERVER
│  (Cloudflare Worker)                │
│  • appdemo.oskarcode.com/mcp/sse    │
│  • Implements MCP JSON-RPC protocol │
│  • 6 tools for content management   │
└────────┬────────────────────────────┘
         │
         │ REST API calls
         ↓
┌─────────────────────────────────────┐
│  Django Backend                     │
│  • appdemo.oskarcode.com/api        │
│  • Database: PostgreSQL             │
│  • 4 presentation sections          │
└─────────────────────────────────────┘
```

**Data Flow:**
1. User asks AI assistant: "Show me the case background"
2. AI client sends MCP request via `mcp-remote`
3. MCP server receives request at `/mcp/sse`
4. MCP server calls Django API
5. Django queries database
6. Response flows back through chain
7. AI assistant presents results to user

---

## Quick Start

### Prerequisites

- Node.js 18+ (for `mcp-remote`)
- Windsurf IDE or Claude Desktop (or any MCP client)
- Access to deployed MCP server (already live at `https://appdemo.oskarcode.com/mcp/sse`)

### Setup in Windsurf

1. **Install mcp-remote** (if not already installed):
   ```bash
   npm install -g mcp-remote
   ```

2. **Configure Windsurf**:
   
   Open Windsurf MCP config (usually at `~/.codeium/windsurf/mcp_config.json`):
   
   ```json
   {
     "mcpServers": {
       "presentation-manager": {
         "command": "npx",
         "args": [
           "-y",
           "mcp-remote",
           "https://appdemo.oskarcode.com/mcp/sse"
         ]
       }
     }
   }
   ```

3. **Restart Windsurf**

4. **Test it**:
   Ask Windsurf: "Show me all presentation sections"

---

## Available Tools

The MCP server provides 6 tools for managing presentation content:

### 1. `get_presentation_section`

**Purpose**: Retrieve a specific section of the presentation

**Parameters:**
- `section_type` (string): One of `case_background`, `architecture`, `how_cloudflare_help`, `business_value`

**Example:**
```
"Show me the case background section"
```

**Response**: Full JSON content of the section including version and last modified timestamp

---

### 2. `get_all_sections`

**Purpose**: Retrieve all presentation sections at once

**Parameters:** None

**Example:**
```
"Get all presentation sections"
```

**Response**: All 4 sections with their complete content

---

### 3. `update_case_background`

**Purpose**: Update the case background section (business context, pain points)

**Parameters:**
- `content` (object): New JSON structure for the section

**Example:**
```
"Update the business context to focus on healthcare industry with 500K monthly users"
```

**Content Structure:**
```json
{
  "business_context": {
    "title": "Company Name",
    "description": "Brief description",
    "stats": [
      {"icon": "users", "label": "User Base", "value": "500K"}
    ]
  },
  "current_solution": {
    "title": "Current Infrastructure",
    "description": "...",
    "problems": ["Problem 1", "Problem 2"]
  },
  "pain_points": [
    {
      "title": "Pain Point Name",
      "icon": "icon-name",
      "description": "Details",
      "severity": "critical|high|medium",
      "test_links": [{"text": "Test Link", "url": "/test"}]
    }
  ]
}
```

---

### 4. `update_architecture`

**Purpose**: Update architecture section (problems mapping, traffic flow)

**Parameters:**
- `content` (object): New JSON structure

**Content Structure:**
```json
{
  "problems_mapping": [
    {
      "problem": "Problem statement",
      "current_solution": "Current approach",
      "limitations": ["Limitation 1", "Limitation 2"]
    }
  ],
  "traffic_flow": {
    "before": ["Step 1", "Step 2"],
    "after": ["Step 1", "Step 2"]
  }
}
```

---

### 5. `update_how_cloudflare_help`

**Purpose**: Update solutions and how Cloudflare addresses pain points

**Parameters:**
- `content` (object): Solutions mapping and network advantages

**Content Structure:**
```json
{
  "solutions": [
    {
      "pain_point": "High Bandwidth Costs",
      "cloudflare_solution": "Free Unlimited Bandwidth",
      "how_it_works": "Explanation",
      "benefits": ["Benefit 1", "Benefit 2"]
    }
  ],
  "network_advantages": {
    "bandwidth_cost": "FREE unlimited",
    "locations": "330 cities",
    "latency": "~50ms globally"
  }
}
```

---

### 6. `update_business_value`

**Purpose**: Update ROI, value propositions, and business metrics

**Parameters:**
- `content` (object): Value propositions and ROI summary

**Content Structure:**
```json
{
  "value_propositions": [
    {
      "title": "Value Prop Title",
      "icon": "icon-name",
      "description": "Description",
      "metrics": [
        {"label": "Metric Name", "improvement": "50% faster"}
      ],
      "learn_more": [{"text": "Link", "url": "#"}]
    }
  ],
  "roi_summary": {
    "implementation_time": "< 30 minutes",
    "payback_period": "< 3 months",
    "annual_savings": "$50K - $150K",
    "revenue_impact": "+15% to +25%"
  }
}
```

---

## Configuration

### Environment Variables (Django)

These are configured in your Django deployment:

```bash
# Required - Django API base URL
DJANGO_API_URL=https://appdemo.oskarcode.com

# MCP protocol version
MCP_VERSION=2024-11-05
```

### Cloudflare Workers Configuration

Located in `wrangler-mcp.toml`:

```toml
name = "presentation-mcp-server"
main = "./presentation-mcp-server.ts"
compatibility_date = "2024-11-01"
compatibility_flags = ["nodejs_compat"]

# Your Cloudflare account
account_id = "YOUR_ACCOUNT_ID"

# Custom domain routing
route = { pattern = "appdemo.oskarcode.com/mcp/*", zone_id = "YOUR_ZONE_ID" }

[vars]
DJANGO_API_URL = "https://appdemo.oskarcode.com"
MCP_VERSION = "2024-11-05"
```

---

## Development

### Local Development

1. **Install dependencies**:
   ```bash
   npm install @modelcontextprotocol/sdk zod
   ```

2. **Test the server locally**:
   ```bash
   cd mcp
   wrangler dev --config wrangler-mcp.toml
   ```

3. **Test with MCP Inspector**:
   ```bash
   # In another terminal
   npx @modelcontextprotocol/inspector
   
   # Open http://localhost:5173
   # Connect to: http://localhost:8787/mcp/sse
   ```

### Project Structure

```
mcp/
├── README.md                    # This file
├── presentation-mcp-server.ts   # Main MCP server implementation
├── presentation-mcp-server.js   # Old version (kept for reference)
├── wrangler-mcp.toml           # Cloudflare Workers config
└── test_mcp_server.sh          # Test script
```

### Key Files

**`presentation-mcp-server.ts`**
- Main MCP server implementation
- Handles JSON-RPC protocol
- Implements 6 tools
- Makes REST API calls to Django

**`wrangler-mcp.toml`**
- Cloudflare Workers deployment configuration
- Environment variables
- Routing rules

---

## Deployment

### Deploy to Cloudflare Workers

```bash
# From project root
cd mcp
wrangler deploy --config wrangler-mcp.toml
```

**Output:**
```
✅ Uploaded presentation-mcp-server
✅ Deployed to: appdemo.oskarcode.com/mcp/*
```

### Verify Deployment

```bash
# Test initialize handshake
curl -X POST https://appdemo.oskarcode.com/mcp/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {"name": "test", "version": "1.0.0"}
    }
  }'

# Test tools list
curl -X POST https://appdemo.oskarcode.com/mcp/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list"
  }'

# Test get all sections
curl -X POST https://appdemo.oskarcode.com/mcp/sse \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "get_all_sections",
      "arguments": {}
    }
  }'
```

---

## Usage Examples

### Example 1: View Current Content

**User:** "Show me the current case background"

**What happens:**
1. AI calls `get_presentation_section` with `section_type: "case_background"`
2. MCP server calls Django API: `GET /api/presentation/sections/case_background/`
3. Django returns current content
4. AI presents it to user in natural language

---

### Example 2: Update Content

**User:** "Update the business context to focus on ToTheMoon.com, a space and astronomy e-commerce platform with high bandwidth costs"

**What happens:**
1. AI understands the intent and structures the update
2. AI calls `update_case_background` with new content
3. MCP server calls Django API: `PUT /api/presentation/sections/case_background/update/`
4. Django updates database
5. AI confirms: "✅ Successfully updated case_background section"

---

### Example 3: Bulk Updates

**User:** "Update all sections for a new customer: FinanceApp, a fintech startup concerned about API security and compliance"

**What happens:**
1. AI calls multiple tools sequentially:
   - `update_case_background` (new context)
   - `update_architecture` (security focus)
   - `update_how_cloudflare_help` (API protection)
   - `update_business_value` (compliance ROI)
2. All sections updated atomically
3. AI confirms all changes

---

## Troubleshooting

### Issue: "0 tools" shown in Windsurf

**Symptoms:** MCP server connects but shows 0 tools

**Solution:**
1. Check MCP server is deployed:
   ```bash
   curl https://appdemo.oskarcode.com/mcp/sse
   ```

2. Test tools list directly:
   ```bash
   curl -X POST https://appdemo.oskarcode.com/mcp/sse \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}'
   ```

3. Restart Windsurf completely

4. Check `mcp-remote` is running:
   ```bash
   npx mcp-remote https://appdemo.oskarcode.com/mcp/sse
   ```

---

### Issue: "Connection failed"

**Symptoms:** Cannot connect to MCP server

**Solutions:**

1. **Check server is live:**
   ```bash
   curl https://appdemo.oskarcode.com/mcp/
   # Should return: "Presentation MCP Server..."
   ```

2. **Check Cloudflare Workers:**
   ```bash
   cd mcp
   wrangler deployments list --config wrangler-mcp.toml
   ```

3. **Verify Django backend:**
   ```bash
   curl https://appdemo.oskarcode.com/api/presentation/sections/
   # Should return JSON with sections
   ```

---

### Issue: "Tool execution failed"

**Symptoms:** Tool calls return errors

**Solutions:**

1. **Check Django API directly:**
   ```bash
   # Test GET
   curl https://appdemo.oskarcode.com/api/presentation/sections/case_background/
   
   # Test UPDATE
   curl -X PUT https://appdemo.oskarcode.com/api/presentation/sections/case_background/update/ \
     -H "Content-Type: application/json" \
     -d '{"content": {"test": "data"}}'
   ```

2. **Check MCP server logs:**
   ```bash
   cd mcp
   wrangler tail --config wrangler-mcp.toml
   ```

3. **Verify content format:**
   - Ensure JSON structure matches expected schema
   - Check all required fields are present

---

### Issue: "Method not found"

**Symptoms:** MCP returns "Method not found" error

**Supported Methods:**
- `initialize` - Initial handshake
- `initialized` - Confirmation notification
- `tools/list` - Get available tools
- `tools/call` - Execute a tool
- `ping` - Keep-alive
- `resources/list` - List resources (empty)
- `prompts/list` - List prompts (empty)

If getting this error, check:
1. Method name is spelled correctly
2. Using JSON-RPC 2.0 format
3. MCP server version is latest

---

## API Reference

### MCP JSON-RPC Protocol

All requests follow JSON-RPC 2.0 format:

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "METHOD_NAME",
  "params": {
    "param1": "value1"
  }
}
```

**Response (Success):**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    // Method-specific result
  }
}
```

**Response (Error):**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32601,
    "message": "Method not found"
  }
}
```

---

## Testing

### Manual Testing

**Test script included:**
```bash
cd mcp
./test_mcp_server.sh
```

**Individual tests:**
```bash
# Test initialize
curl -X POST https://appdemo.oskarcode.com/mcp/sse \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}'

# Test tools list
curl -X POST https://appdemo.oskarcode.com/mcp/sse \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'

# Test get section
curl -X POST https://appdemo.oskarcode.com/mcp/sse \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_presentation_section","arguments":{"section_type":"case_background"}}}'
```

---

## Performance

**Metrics:**
- **Latency**: ~50-100ms per tool call
- **Throughput**: Handles concurrent requests
- **Caching**: Django response caching recommended
- **Rate Limits**: Cloudflare Workers: 100K requests/day (free tier)

**Optimization Tips:**
1. Cache frequently accessed content
2. Use batch operations when possible
3. Minimize tool call chains

---

## Security

**Current Implementation:**
- ✅ HTTPS only
- ✅ CORS configured for known origins
- ✅ Django CSRF protection
- ⚠️ No authentication (public read/write)

**Production Recommendations:**
1. Add authentication tokens
2. Implement rate limiting
3. Add audit logging
4. Restrict write operations
5. Add input validation

---

## Resources

- **MCP Specification**: https://modelcontextprotocol.io/
- **MCP SDK**: https://github.com/modelcontextprotocol/sdk
- **Cloudflare Workers**: https://developers.cloudflare.com/workers/
- **mcp-remote**: https://www.npmjs.com/package/mcp-remote

---

## Support

**Issues?**
1. Check troubleshooting section above
2. Review Cloudflare Workers logs: `wrangler tail`
3. Review Django logs
4. Test API endpoints directly

**MCP Server Status:**
- **Production**: https://appdemo.oskarcode.com/mcp/sse
- **Health Check**: `curl https://appdemo.oskarcode.com/mcp/`
- **Tools Count**: 6

---

## Changelog

### v1.0.0 (Current)
- ✅ 6 tools for presentation management
- ✅ JSON-RPC 2.0 protocol
- ✅ SSE and HTTP transports
- ✅ Deployed to Cloudflare Workers
- ✅ Integrated with Windsurf
- ✅ Production ready

---

**Built with ❤️ for AI-powered presentation management**
