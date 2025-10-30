// Presentation MCP Server using Cloudflare Agent SDK
import { McpAgent } from "agents/mcp";
import { z } from "zod";

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

// Define our MCP agent for presentation content management
export class PresentationMCP extends McpAgent {
    name = "presentation-content-manager";
    version = "1.0.0";

    async init() {
        // Tool: Get all presentation sections
        this.server.tool(
            "get_all_sections",
            {},
            async () => {
                try {
                    const data = await callDjangoAPI("/api/presentation/sections/");
                    
                    return {
                        content: [
                            {
                                type: "text",
                                text: `📊 **All Presentation Sections**\n\n${JSON.stringify(data, null, 2)}`,
                            },
                        ],
                    };
                } catch (error) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `❌ Failed to get sections: ${error instanceof Error ? error.message : String(error)}`,
                            },
                        ],
                    };
                }
            },
        );

        // Tool: Get specific section
        this.server.tool(
            "get_presentation_section",
            {
                section_type: z.enum(["case_background", "architecture", "how_cloudflare_help", "business_value"])
                    .describe("The type of section to retrieve"),
            },
            async (params) => {
                try {
                    const data = await callDjangoAPI(`/api/presentation/sections/${params.section_type}/`);
                    
                    return {
                        content: [
                            {
                                type: "text",
                                text: `📄 **${params.section_type}**\n\n${JSON.stringify(data.content, null, 2)}`,
                            },
                        ],
                    };
                } catch (error) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `❌ Failed to get section: ${error instanceof Error ? error.message : String(error)}`,
                            },
                        ],
                    };
                }
            },
        );

        // Tool: Update section
        this.server.tool(
            "update_presentation_section",
            {
                section_type: z.enum(["case_background", "architecture", "how_cloudflare_help", "business_value"])
                    .describe("The type of section to update"),
                content: z.record(z.any()).describe("The new content for the section"),
            },
            async (params) => {
                try {
                    const data = await callDjangoAPI(
                        `/api/presentation/sections/${params.section_type}/update/`,
                        "PUT",
                        { content: params.content }
                    );
                    
                    return {
                        content: [
                            {
                                type: "text",
                                text: `✅ **Updated ${params.section_type}**\n\nVersion: ${data.version}\nLast Modified: ${data.last_modified}`,
                            },
                        ],
                    };
                } catch (error) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `❌ Failed to update section: ${error instanceof Error ? error.message : String(error)}`,
                            },
                        ],
                    };
                }
            },
        );
    }
}

// CORS headers helper
function addCorsHeaders(response: Response, request: Request): Response {
    const origin = request.headers.get("Origin");
    
    // Allow all Cloudflare domains
    const isCloudflareOrigin = origin && origin.includes(".cloudflare.com");
    const corsOrigin = isCloudflareOrigin ? origin : "*";

    const newHeaders = new Headers(response.headers);
    newHeaders.set("Access-Control-Allow-Origin", corsOrigin);
    newHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    newHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    newHeaders.set("Access-Control-Allow-Credentials", "true");
    newHeaders.set("Access-Control-Max-Age", "86400");

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
    });
}

export default {
    async fetch(request: Request, env: any, ctx: any) {
        const url = new URL(request.url);

        // Handle preflight OPTIONS requests
        if (request.method === "OPTIONS") {
            return addCorsHeaders(
                new Response(null, { status: 200 }),
                request
            );
        }

        let response: Response;

        // Handle SSE transport (GET requests to /sse or /mcp/sse)
        if ((url.pathname === "/sse" || url.pathname === "/mcp/sse") && request.method === "GET") {
            response = await PresentationMCP.serveSSE("/mcp/sse").fetch(request, env, ctx);
        }
        // Handle HTTP transport (POST requests)
        else if ((url.pathname === "/sse" || url.pathname === "/mcp/sse" || url.pathname === "/mcp") && request.method === "POST") {
            response = await PresentationMCP.serve("/mcp/sse").fetch(request, env, ctx);
        }
        // Handle message endpoint
        else if (url.pathname === "/mcp/sse/message" || url.pathname === "/sse/message") {
            response = await PresentationMCP.serveSSE("/mcp/sse").fetch(request, env, ctx);
        }
        // Default response
        else {
            response = new Response("Presentation MCP Server - Available endpoints: /mcp/sse (GET/POST)", { 
                status: 200,
                headers: { "Content-Type": "text/plain" }
            });
        }

        // Add CORS headers to all responses
        return addCorsHeaders(response, request);
    },
};
