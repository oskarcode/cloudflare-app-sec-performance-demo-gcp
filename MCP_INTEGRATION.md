# MCP Integration - Quick Reference

This project includes an MCP (Model Context Protocol) server that enables AI assistants to manage presentation content.

## 🚀 Quick Start

### For Windsurf Users

1. Add to your Windsurf MCP config (`~/.codeium/windsurf/mcp_config.json`):
   ```json
   {
     "mcpServers": {
       "presentation-manager": {
         "command": "npx",
         "args": ["-y", "mcp-remote", "https://appdemo.oskarcode.com/mcp/sse"]
       }
     }
   }
   ```

2. Restart Windsurf

3. Ask: "Show me all presentation sections"

## 📁 MCP Files Location

All MCP-related files are in the `/mcp` folder:

```
mcp/
├── README.md                   # Complete MCP documentation
├── presentation-mcp-server.ts  # MCP server implementation  
├── wrangler-mcp.toml          # Cloudflare deployment config
└── test_mcp_server.sh         # Testing script
```

## 📖 Full Documentation

See [mcp/README.md](./mcp/README.md) for:
- Complete architecture overview
- All 6 available tools
- Deployment instructions
- Troubleshooting guide
- Usage examples

## 🛠️ Available Tools

1. **get_presentation_section** - Get specific section
2. **get_all_sections** - Get all sections
3. **update_case_background** - Update business context
4. **update_architecture** - Update architecture diagrams
5. **update_how_cloudflare_help** - Update solutions
6. **update_business_value** - Update ROI/value props

## 🌐 Live Endpoints

- **MCP Server**: https://appdemo.oskarcode.com/mcp/sse
- **Django API**: https://appdemo.oskarcode.com/api/presentation/sections/
- **Presentation Page**: https://appdemo.oskarcode.com/presentation/

## 🔧 Deployment

```bash
cd mcp
wrangler deploy --config wrangler-mcp.toml
```

## ✅ Test Connection

```bash
npx mcp-remote https://appdemo.oskarcode.com/mcp/sse
```

Should output: "Connected to remote server using StreamableHTTPClientTransport"

---

For detailed documentation, see [mcp/README.md](./mcp/README.md)
