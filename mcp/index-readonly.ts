// Read-Only MCP Server - Only GET operations
import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
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

// Define our READ-ONLY MCP agent
export class PresentationMCPReadOnly extends McpAgent {
	server = new McpServer({
		name: "presentation-content-viewer",
		version: "1.0.0",
	});

	async init() {
		// Tool 1: Get all presentation sections (READ ONLY)
		this.server.tool(
			"get_all_sections",
			"Get all presentation sections at once (Read-Only)",
			{},
			async () => {
				try {
					const data = await callDjangoAPI("/api/presentation/sections/");
					
					return {
						content: [
							{
								type: "text",
								text: `📊 **All Presentation Sections** (Read-Only)\n\n${JSON.stringify(data, null, 2)}`,
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

		// Tool 2: Get specific section (READ ONLY)
		this.server.tool(
			"get_presentation_section",
			"Get the current content of a specific presentation section (Read-Only)",
			{
				section_type: z.enum(["case_background", "architecture", "how_cloudflare_help", "business_value"])
					.describe("The type of section to retrieve"),
			},
			async ({ section_type }: { section_type: string }) => {
				try {
					const data = await callDjangoAPI(`/api/presentation/sections/${section_type}/`);
					
					return {
						content: [
							{
								type: "text",
								text: `📄 **${section_type}** (Read-Only)\n\n${JSON.stringify(data.content, null, 2)}`,
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

		// Note: NO UPDATE TOOLS - Read-Only Access Only
	}
}

// CORS headers helper function
function addCorsHeaders(response: Response, request: Request): Response {
	const origin = request.headers.get("Origin");
	
	// Allow all Cloudflare domains
	const isCloudflareOrigin = origin && origin.includes(".cloudflare.com");
	const corsOrigin = isCloudflareOrigin ? origin : "*";

	const newHeaders = new Headers(response.headers);
	newHeaders.set("Access-Control-Allow-Origin", corsOrigin);
	newHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
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

		// Handle SSE transport (GET requests to /sse or /mcpr/sse)
		if ((url.pathname === "/mcpr/sse" || url.pathname === "/sse") && request.method === "GET") {
			response = await PresentationMCPReadOnly.serveSSE("/mcpr/sse").fetch(request, env, ctx);
		}
		// Handle HTTP transport (POST requests)
		else if ((url.pathname === "/mcpr/sse" || url.pathname === "/mcpr" || url.pathname === "/sse") && request.method === "POST") {
			response = await PresentationMCPReadOnly.serve("/mcpr/sse").fetch(request, env, ctx);
		}
		// Handle message endpoint
		else if (url.pathname === "/mcpr/sse/message" || url.pathname === "/sse/message") {
			response = await PresentationMCPReadOnly.serveSSE("/mcpr/sse").fetch(request, env, ctx);
		}
		// Default response
		else {
			response = new Response(
				JSON.stringify({
					name: "Presentation MCP Server - Read Only",
					version: "1.0.0",
					access: "read_only",
					tools: ["get_all_sections", "get_presentation_section"],
					endpoints: "/mcpr/sse (GET/POST)",
				}),
				{ 
					status: 200,
					headers: { "Content-Type": "application/json" }
				}
			);
		}

		// Add CORS headers to all responses
		return addCorsHeaders(response, request);
	},
};
