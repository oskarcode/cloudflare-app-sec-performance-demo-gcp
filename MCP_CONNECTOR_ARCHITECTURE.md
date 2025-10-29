# MCP Connector Architecture

## Overview

We're now using **Claude's MCP Connector** feature, which allows Claude to directly connect to external MCP servers and execute tools.

## Architecture Comparison

### Old Approach (Manual Tools)
```
User → Django → Claude API (with manually defined tools)
                     ↓
              Django executes tools locally
                     ↓
              Database updates
```

**Problems:**
- Tools defined twice (Django + MCP server)
- MCP server wasn't being used
- More code to maintain
- Tool execution logic in Django

### New Approach (MCP Connector) ✅
```
User → Django → Claude API with MCP Connector
                     ↓
              Claude connects to MCP Server (Cloudflare Worker)
                     ↓
              MCP Server calls Django API
                     ↓
              Database updates
```

**Benefits:**
- Tools defined once in MCP server
- Claude handles MCP protocol automatically
- Cleaner separation of concerns
- Less code in Django
- The deployed MCP server is now used!

## How It Works

### 1. User Sends Message
```javascript
// Chat widget
fetch('/api/ai-chat/', {
  method: 'POST',
  body: JSON.stringify({
    message: "Update the business context",
    history: []
  })
})
```

### 2. Django Calls Claude with MCP Connector
```python
# shop/views.py
response = client.beta.messages.create(
    model="claude-3-sonnet-20240229",
    max_tokens=4096,
    system=system_prompt,
    messages=messages,
    mcp_servers=[{
        "type": "url",
        "url": "https://appdemo.oskarcode.com/mcp/sse",
        "name": "presentation-manager"
    }],
    betas=["mcp-client-2025-04-04"]
)
```

### 3. Claude Discovers Tools via MCP
Claude automatically:
1. Connects to the MCP server via SSE
2. Calls `/mcp/tools/list` to discover available tools
3. Understands which tools to use based on user message

### 4. Claude Executes Tools via MCP
When Claude needs to use a tool:
1. Calls `/mcp/tools/call` with tool name and arguments
2. MCP server receives request
3. MCP server calls Django API endpoints
4. Database gets updated
5. Result returned to Claude

### 5. Claude Responds to User
Claude formulates natural language response and returns it to Django, which sends it to the user.

## MCP Server Configuration

### Environment Variable
```bash
# .env
MCP_SERVER_URL=https://appdemo.oskarcode.com/mcp
```

### MCP Server Details
- **Location**: Cloudflare Worker
- **URL**: https://appdemo.oskarcode.com/mcp/*
- **SSE Endpoint**: https://appdemo.oskarcode.com/mcp/sse
- **Tools Endpoint**: https://appdemo.oskarcode.com/mcp/tools/list
- **Call Endpoint**: https://appdemo.oskarcode.com/mcp/tools/call

### Available Tools (auto-discovered by Claude)
1. **get_presentation_section** - Retrieve section content
2. **get_all_sections** - Get all sections at once
3. **update_case_background** - Update business context
4. **update_architecture** - Update architecture info
5. **update_how_cloudflare_help** - Update solutions
6. **update_business_value** - Update value propositions

## Code Changes

### Before (Manual Tools)
```python
# Defined tools manually in Django
tools = [{
    "name": "get_presentation_section",
    "description": "...",
    "input_schema": {...}
}]

# Called regular messages endpoint
response = client.messages.create(
    model="claude-3-sonnet-20240229",
    messages=messages,
    tools=tools  # Manual tools
)

# Executed tools manually in Django
if block.type == "tool_use":
    if tool_name == "get_presentation_section":
        # Execute locally
        section = PresentationSection.objects.get(...)
```

### After (MCP Connector)
```python
# Tools are in MCP server, not Django!

# Call beta endpoint with MCP server
response = client.beta.messages.create(
    model="claude-3-sonnet-20240229",
    messages=messages,
    mcp_servers=[{
        "type": "url",
        "url": f"{mcp_server_url}/sse",
        "name": "presentation-manager"
    }],
    betas=["mcp-client-2025-04-04"]
)

# No manual tool execution needed!
# Claude handles everything via MCP protocol
```

## Testing

### Test MCP Server Directly
```bash
# List tools
curl https://appdemo.oskarcode.com/mcp/tools/list | jq .

# Call a tool
curl -X POST https://appdemo.oskarcode.com/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "get_all_sections",
    "arguments": {}
  }' | jq .
```

### Test via Chat Widget
1. Visit: http://localhost:8000/presentation/
2. Click "AI Assistant"
3. Try: "Show me the current case background"
4. Claude will use MCP to call the tool
5. Content is retrieved and displayed

## Benefits of This Approach

1. **Single Source of Truth**: Tools defined once in MCP server
2. **Protocol Compliance**: Uses official MCP protocol
3. **Reusability**: Same MCP server can be used by:
   - Web chat (current)
   - Claude Desktop
   - Other AI clients
   - Command line tools
4. **Separation**: Business logic in MCP server, not mixed with Django
5. **Testability**: Can test MCP server independently
6. **Scalability**: MCP server runs on Cloudflare Edge

## Troubleshooting

### "MCP server not responding"
- Check MCP server is deployed: `wrangler deployments list --config wrangler-mcp.toml`
- Test SSE endpoint: `curl https://appdemo.oskarcode.com/mcp/sse`

### "Tools not found"
- Verify tools list: `curl https://appdemo.oskarcode.com/mcp/tools/list`
- Check MCP_SERVER_URL in .env

### "Tool execution failed"
- Check Django API is accessible from MCP server
- Review MCP server logs: `wrangler tail --config wrangler-mcp.toml`
- Check Django logs for API errors

## Future Enhancements

1. **Add Authentication**: Secure MCP server with tokens
2. **Tool Versioning**: Version control for tool schemas
3. **Monitoring**: Track tool usage and performance
4. **Caching**: Cache tool results in MCP server
5. **Multiple MCP Servers**: Connect Claude to multiple servers for different capabilities

## References

- [Claude MCP Connector Docs](https://docs.claude.com/en/docs/agents-and-tools/mcp-connector)
- [Model Context Protocol Spec](https://modelcontextprotocol.io/)
- [Our MCP Server Code](./presentation-mcp-server.js)
- [Our Django Integration](./shop/views.py#L300-L395)
