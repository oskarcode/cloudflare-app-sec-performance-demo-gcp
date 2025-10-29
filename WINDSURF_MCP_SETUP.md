# Connect Your MCP Server to Windsurf IDE

## ✅ Your MCP Server is Live!

**URL:** `https://appdemo.oskarcode.com/mcp/sse`

**Available Tools:** 6 tools for managing presentation content

## Step 1: Install mcp-remote (Proxy for Remote MCP Servers)

```bash
npm install -g mcp-remote
```

This creates a local proxy that translates between Windsurf's stdio transport and your remote MCP server's HTTP/SSE transport.

## Step 2: Configure Windsurf

### Option A: Using mcp-remote Proxy

1. Open Windsurf settings
2. Find the MCP configuration file (usually in `~/.windsurf/config.json` or similar)
3. Add your MCP server:

```json
{
  "mcpServers": {
    "presentation-manager": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://appdemo.oskarcode.com/mcp/sse"
      ]
    }
  }
}
```

### Option B: Direct Configuration (if Windsurf supports HTTP transport)

```json
{
  "mcpServers": {
    "presentation-manager": {
      "url": "https://appdemo.oskarcode.com/mcp/sse",
      "transport": "sse"
    }
  }
}
```

## Step 3: Restart Windsurf

After updating the config, restart Windsurf to load the MCP server.

## Step 4: Test Your MCP Tools

Once connected, try asking Windsurf AI:

### Example Prompts:

**View Content:**
```
"Can you show me the current case background from the presentation?"
```

**Update Content:**
```
"Update the business context in the case background to focus on healthcare industry"
```

**Get All Sections:**
```
"Show me all presentation sections"
```

## Available MCP Tools

Your MCP server provides these 6 tools:

### 1. **get_presentation_section**
Get content of a specific section (case_background, architecture, how_cloudflare_help, or business_value)

**Example:**
```
"Get the architecture section"
```

### 2. **get_all_sections**
Retrieve all presentation sections at once

**Example:**
```
"Show me all sections"
```

### 3. **update_case_background**
Update business context, current solution, and pain points

**Example:**
```
"Update the case background to focus on e-commerce retail with 2M monthly users"
```

### 4. **update_architecture**
Update problems mapping and traffic flow diagrams

**Example:**
```
"Add a problem about DDoS attacks to the architecture section"
```

### 5. **update_how_cloudflare_help**
Update solutions mapping and network advantages

**Example:**
```
"Add CDN performance benefits to the Cloudflare help section"
```

### 6. **update_business_value**
Update value propositions and ROI summary

**Example:**
```
"Change the ROI payback period to 3 months"
```

## How It Works

```
Windsurf IDE
    ↓
mcp-remote (local proxy)
    ↓
Your MCP Server (Cloudflare: appdemo.oskarcode.com/mcp)
    ↓
Django API (appdemo.oskarcode.com/api/presentation/sections/)
    ↓
Database
```

## Troubleshooting

### "MCP server not found"
- Check that mcp-remote is installed: `npm list -g mcp-remote`
- Verify the URL is correct: `https://appdemo.oskarcode.com/mcp/sse`
- Try running manually: `npx mcp-remote https://appdemo.oskarcode.com/mcp/sse`

### "Connection failed"
- Test the server directly:
  ```bash
  curl https://appdemo.oskarcode.com/mcp/tools/list
  ```
- Should return JSON with 6 tools

### "Tools not appearing"
- Restart Windsurf after config changes
- Check Windsurf's MCP logs/console
- Verify config file syntax is correct (valid JSON)

## Test Your MCP Server Manually

### List Available Tools
```bash
curl https://appdemo.oskarcode.com/mcp/tools/list | jq .
```

### Call a Tool
```bash
curl -X POST https://appdemo.oskarcode.com/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "get_all_sections",
    "arguments": {}
  }' | jq .
```

### Get Specific Section
```bash
curl -X POST https://appdemo.oskarcode.com/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "get_presentation_section",
    "arguments": {
      "section_type": "case_background"
    }
  }' | jq .
```

## Architecture Benefits

### Why This is Better Than Web Chat:
1. ✅ **IDE Integration** - AI assistance right in your code editor
2. ✅ **Context Aware** - Windsurf knows your project context
3. ✅ **Reusable** - Same MCP server can be used by multiple tools
4. ✅ **Standard Protocol** - Follows MCP specification
5. ✅ **No Frontend Code** - No chat widget to maintain

### Your Setup:
- **MCP Server**: Runs on Cloudflare Edge (fast, globally distributed)
- **Tools**: Manage presentation content via natural language
- **Backend**: Django API handles database operations
- **Frontend**: Dynamic presentation page shows updates

## Next Steps

1. Configure Windsurf with the settings above
2. Restart Windsurf
3. Try: "Show me the current case background"
4. Try: "Update the business context to focus on fintech"
5. Visit http://localhost:8000/presentation/ to see changes!

## Alternative: Use with Claude Desktop

The same MCP server works with Claude Desktop! Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "presentation-manager": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://appdemo.oskarcode.com/mcp/sse"
      ]
    }
  }
}
```

## Resources

- [MCP Documentation](https://modelcontextprotocol.io/)
- [mcp-remote Package](https://www.npmjs.com/package/mcp-remote)
- [Cloudflare MCP Guide](https://developers.cloudflare.com/agents/guides/remote-mcp-server/)
- Your MCP Server: https://appdemo.oskarcode.com/mcp/
