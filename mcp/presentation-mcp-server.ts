// Simple MCP Server for Presentation Content Management
// Implements MCP protocol manually without complex SDK dependencies

// Django API configuration
const DJANGO_API_BASE = "https://appdemo.oskarcode.com";

// Helper function to make API calls to Django backend
async function callDjangoAPI(endpoint: string, method: string = "GET", body?: any) {
    const url = `${DJANGO_API_BASE}${endpoint}`;
    const options: RequestInit = {
        method,
        headers: {
            "Content-Type": "application/json",
        },
    };
    
    if (body && method !== "GET") {
        options.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        return data;
    } catch (error) {
        throw new Error(`API call failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// Define available MCP tools
const tools = [
  {
    name: "get_presentation_section",
    description: "Get the current content of a specific presentation section",
    inputSchema: {
      type: "object",
      properties: {
        section_type: {
          type: "string",
          enum: ["case_background", "architecture", "how_cloudflare_help", "business_value"],
          description: "The type of section to retrieve",
        },
      },
      required: ["section_type"],
    },
  },
  {
    name: "get_all_sections",
    description: "Get all presentation sections at once",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "update_case_background",
    description: "Update the case background section with business context, current solution, and pain points",
    inputSchema: {
      type: "object",
      properties: {
        content: {
          type: "object",
          description: "JSON content for case background section",
        },
      },
      required: ["content"],
    },
  },
  {
    name: "update_architecture",
    description: "Update the architecture section with problems mapping and traffic flow",
    inputSchema: {
      type: "object",
      properties: {
        content: {
          type: "object",
          description: "JSON content for architecture section",
        },
      },
      required: ["content"],
    },
  },
  {
    name: "update_how_cloudflare_help",
    description: "Update how Cloudflare helps section with solutions and network advantages",
    inputSchema: {
      type: "object",
      properties: {
        content: {
          type: "object",
          description: "JSON content for how Cloudflare helps section",
        },
      },
      required: ["content"],
    },
  },
  {
    name: "update_business_value",
    description: "Update business value section with value propositions and ROI summary",
    inputSchema: {
      type: "object",
      properties: {
        content: {
          type: "object",
          description: "JSON content for business value section",
        },
      },
      required: ["content"],
    },
  },
];

// Handle tool execution
async function executeTool(name: string, args: any) {
  try {
    switch (name) {
      case "get_presentation_section": {
        const { section_type } = args;
        const result = await callDjangoAPI(`/api/presentation/sections/${section_type}/`);
        
        return {
          content: [
            {
              type: "text",
              text: `📄 **${section_type}** Section\n\n` +
                `**Content:**\n${JSON.stringify(result.content, null, 2)}\n\n` +
                `**Version:** ${result.version}\n` +
                `**Last Modified:** ${result.last_modified}`,
            },
          ],
        };
      }

      case "get_all_sections": {
        const result = await callDjangoAPI("/api/presentation/sections/");
        
        let text = "📋 **All Presentation Sections**\n\n";
        for (const [sectionType, data] of Object.entries(result)) {
          text += `\n## ${sectionType}\n`;
          text += `Version: ${(data as any).version}\n`;
          text += `Last Modified: ${(data as any).last_modified}\n`;
          text += `Content:\n${JSON.stringify((data as any).content, null, 2)}\n`;
          text += `---\n`;
        }
        
        return {
          content: [
            {
              type: "text",
              text,
            },
          ],
        };
      }

      case "update_case_background":
      case "update_architecture":
      case "update_how_cloudflare_help":
      case "update_business_value": {
        const { content } = args;
        const sectionTypeMap: Record<string, string> = {
          update_case_background: "case_background",
          update_architecture: "architecture",
          update_how_cloudflare_help: "how_cloudflare_help",
          update_business_value: "business_value",
        };
        
        const sectionType = sectionTypeMap[name];
        const result = await callDjangoAPI(
          `/api/presentation/sections/${sectionType}/update/`,
          "PUT",
          { content: content }
        );
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Successfully updated ${sectionType} section\n\n` +
                `**Version:** ${result.version}\n` +
                `**Last Modified:** ${result.last_modified}`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}

// CORS headers helper
function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("Origin");
  const allowedOrigins = [
    "https://playground.ai.cloudflare.com",
    "https://claude.ai",
    "http://localhost:3000",
    "http://localhost:5173",
  ];

  // Allow all Cloudflare dashboard domains
  const isCloudflareOrigin = origin && (
    origin.includes(".cloudflare.com") ||
    origin.includes(".cloudflarestatus.com")
  );

  const corsOrigin = (origin && (allowedOrigins.includes(origin) || isCloudflareOrigin)) ? origin : "*";

  return {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

// Worker fetch handler
export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const corsHeaders = getCorsHeaders(request);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    try {
      // SSE endpoint for MCP connections  
      if ((url.pathname === "/mcp/sse" || url.pathname === "/sse") && request.method === "GET") {
        // Create SSE stream
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        const encoder = new TextEncoder();
        
        // Send immediate connection message
        (async () => {
          try {
            await writer.write(encoder.encode(`: MCP SSE connection established\n\n`));
            
            // Keep connection alive with periodic heartbeats
            const interval = setInterval(async () => {
              try {
                await writer.write(encoder.encode(`: keepalive\n\n`));
              } catch (e) {
                clearInterval(interval);
                writer.close();
              }
            }, 15000);
            
            // Handle connection close
            request.signal?.addEventListener('abort', () => {
              clearInterval(interval);
              writer.close();
            });
          } catch (e) {
            writer.close();
          }
        })();
        
        return new Response(readable, {
          headers: {
            ...corsHeaders,
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
          },
        });
      }

      // POST endpoint for JSON-RPC requests (both /mcp and /mcp/sse)
      if ((url.pathname === "/mcp/sse" || url.pathname === "/sse" || url.pathname === "/mcp" || url.pathname === "/mcp/message") && request.method === "POST") {
        const body = await request.json();
        
        // Log the method for debugging
        console.log("Received method:", body.method);
        
        // Handle JSON-RPC requests
        if (body.method === "initialize") {
          return new Response(JSON.stringify({
            jsonrpc: "2.0",
            id: body.id,
            result: {
              protocolVersion: "2024-11-05",
              capabilities: {
                tools: {},
                logging: {}
              },
              serverInfo: {
                name: "presentation-content-manager",
                version: "1.0.0"
              }
            }
          }), {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          });
        }

        if (body.method === "initialized") {
          // Notification - no response needed
          return new Response(JSON.stringify({
            jsonrpc: "2.0",
            id: body.id,
            result: {}
          }), {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          });
        }
        
        if (body.method === "tools/list") {
          return new Response(JSON.stringify({
            jsonrpc: "2.0",
            id: body.id,
            result: { tools }
          }), {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          });
        }
        
        if (body.method === "tools/call") {
          const { name, arguments: args } = body.params;
          const result = await executeTool(name, args);
          
          return new Response(JSON.stringify({
            jsonrpc: "2.0",
            id: body.id,
            result
          }), {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          });
        }

        if (body.method === "ping") {
          return new Response(JSON.stringify({
            jsonrpc: "2.0",
            id: body.id,
            result: {}
          }), {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          });
        }

        if (body.method === "resources/list") {
          return new Response(JSON.stringify({
            jsonrpc: "2.0",
            id: body.id,
            result: { resources: [] }
          }), {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          });
        }

        if (body.method === "prompts/list") {
          return new Response(JSON.stringify({
            jsonrpc: "2.0",
            id: body.id,
            result: { prompts: [] }
          }), {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          });
        }
        
        // Unknown method - log it
        console.error("Unknown method:", body.method);
        return new Response(JSON.stringify({
          jsonrpc: "2.0",
          id: body.id || null,
          error: {
            code: -32601,
            message: `Method not found: ${body.method}`
          }
        }), {
          status: 200, // MCP uses 200 even for errors
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        });
      }

      // Default response
      return new Response(
        "Presentation MCP Server\n\nAvailable endpoints:\n- GET /mcp/sse - SSE transport\n- POST /mcp/sse or /mcp - JSON-RPC messages\n\nTools available: 6",
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "text/plain",
          },
        }
      );
    } catch (error) {
      console.error("Error:", error);
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Unknown error",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
  },
};
