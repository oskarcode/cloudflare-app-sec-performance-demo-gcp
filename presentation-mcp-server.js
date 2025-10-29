/**
 * Cloudflare Workers MCP Server for Presentation Content Management
 * 
 * This worker implements the Model Context Protocol (MCP) to allow AI assistants
 * to read and update presentation content stored in the Django backend.
 * 
 * Deploy: wrangler deploy presentation-mcp-server.js
 */

// MCP Protocol Implementation
const MCP_VERSION = "2024-11-05";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers for browser access
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // MCP Endpoints
    if (url.pathname === '/mcp/info') {
      return handleInfo(corsHeaders);
    }

    if (url.pathname === '/mcp/tools/list') {
      return handleToolsList(corsHeaders);
    }

    if (url.pathname === '/mcp/tools/call') {
      return handleToolCall(request, env, corsHeaders);
    }

    // SSE endpoint for real-time updates (optional)
    if (url.pathname === '/mcp/sse') {
      return handleSSE(request, corsHeaders);
    }

    return new Response('MCP Server - Presentation Content Management', {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
    });
  }
};

// Handle MCP server info
function handleInfo(corsHeaders) {
  const info = {
    protocol_version: MCP_VERSION,
    server_name: "presentation-content-manager",
    server_version: "1.0.0",
    capabilities: {
      tools: true,
      resources: false,
      prompts: false
    },
    description: "MCP server for managing e-commerce security presentation content"
  };

  return new Response(JSON.stringify(info, null, 2), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// List available MCP tools
function handleToolsList(corsHeaders) {
  const tools = {
    tools: [
      {
        name: "get_presentation_section",
        description: "Get the current content of a specific presentation section",
        inputSchema: {
          type: "object",
          properties: {
            section_type: {
              type: "string",
              enum: ["case_background", "architecture", "how_cloudflare_help", "business_value"],
              description: "The type of section to retrieve"
            }
          },
          required: ["section_type"]
        }
      },
      {
        name: "get_all_sections",
        description: "Get all presentation sections at once",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "update_case_background",
        description: "Update the case background section with business context, current solution, and pain points",
        inputSchema: {
          type: "object",
          properties: {
            content: {
              type: "object",
              description: "JSON content for case background section"
            }
          },
          required: ["content"]
        }
      },
      {
        name: "update_architecture",
        description: "Update the architecture section with problems mapping and traffic flow",
        inputSchema: {
          type: "object",
          properties: {
            content: {
              type: "object",
              description: "JSON content for architecture section"
            }
          },
          required: ["content"]
        }
      },
      {
        name: "update_how_cloudflare_help",
        description: "Update how Cloudflare helps section with solutions and network advantages",
        inputSchema: {
          type: "object",
          properties: {
            content: {
              type: "object",
              description: "JSON content for how Cloudflare helps section"
            }
          },
          required: ["content"]
        }
      },
      {
        name: "update_business_value",
        description: "Update business value section with value propositions and ROI summary",
        inputSchema: {
          type: "object",
          properties: {
            content: {
              type: "object",
              description: "JSON content for business value section"
            }
          },
          required: ["content"]
        }
      }
    ]
  };

  return new Response(JSON.stringify(tools, null, 2), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Handle tool execution
async function handleToolCall(request, env, corsHeaders) {
  try {
    const body = await request.json();
    const { name, arguments: args } = body;

    // Get Django API base URL from environment variable
    const API_BASE = env.DJANGO_API_URL || 'https://appdemo.oskarcode.com';

    let result;

    switch (name) {
      case 'get_all_sections':
        result = await getAllSections(API_BASE);
        break;

      case 'get_presentation_section':
        result = await getSection(API_BASE, args.section_type);
        break;

      case 'update_case_background':
        result = await updateSection(API_BASE, 'case_background', args.content);
        break;

      case 'update_architecture':
        result = await updateSection(API_BASE, 'architecture', args.content);
        break;

      case 'update_how_cloudflare_help':
        result = await updateSection(API_BASE, 'how_cloudflare_help', args.content);
        break;

      case 'update_business_value':
        result = await updateSection(API_BASE, 'business_value', args.content);
        break;

      default:
        return new Response(JSON.stringify({
          error: `Unknown tool: ${name}`
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({
      success: true,
      result: result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Get all sections
async function getAllSections(apiBase) {
  const response = await fetch(`${apiBase}/api/presentation/sections/`);
  if (!response.ok) {
    throw new Error(`Failed to fetch sections: ${response.statusText}`);
  }
  return await response.json();
}

// Get specific section
async function getSection(apiBase, sectionType) {
  const response = await fetch(`${apiBase}/api/presentation/sections/${sectionType}/`);
  if (!response.ok) {
    throw new Error(`Failed to fetch section ${sectionType}: ${response.statusText}`);
  }
  return await response.json();
}

// Update section
async function updateSection(apiBase, sectionType, content) {
  const response = await fetch(`${apiBase}/api/presentation/sections/${sectionType}/update/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update section ${sectionType}: ${errorText}`);
  }

  return await response.json();
}

// Handle SSE for real-time updates with JSON-RPC protocol
function handleSSE(request, corsHeaders) {
  // Create a TransformStream for SSE
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  // Send proper JSON-RPC notification for connection
  const initMessage = {
    jsonrpc: "2.0",
    method: "notifications/initialized",
    params: {
      protocolVersion: "2024-11-05",
      serverInfo: {
        name: "presentation-content-manager",
        version: "1.0.0"
      }
    }
  };
  writer.write(encoder.encode(`data: ${JSON.stringify(initMessage)}\n\n`));

  // Keep connection alive with periodic heartbeats
  const interval = setInterval(() => {
    try {
      const heartbeat = {
        jsonrpc: "2.0",
        method: "notifications/ping",
        params: { timestamp: Date.now() }
      };
      writer.write(encoder.encode(`data: ${JSON.stringify(heartbeat)}\n\n`));
    } catch (e) {
      clearInterval(interval);
    }
  }, 30000);

  return new Response(readable, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
