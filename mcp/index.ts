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

// Define our MCP agent for presentation content management
export class PresentationMCP extends McpAgent {
	server = new McpServer({
		name: "presentation-content-manager",
		version: "1.0.0",
	});

	async init() {
		// Tool: Get all presentation sections
		this.server.tool(
			"get_all_sections",
			"Get all presentation sections at once",
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
			"Get the current content of a specific presentation section",
			{
				section_type: z.enum(["case_background", "architecture", "how_cloudflare_help", "business_value"])
					.describe("The type of section to retrieve"),
			},
			async ({ section_type }) => {
				try {
					const data = await callDjangoAPI(`/api/presentation/sections/${section_type}/`);
					
					return {
						content: [
							{
								type: "text",
								text: `📄 **${section_type}**\n\n${JSON.stringify(data.content, null, 2)}`,
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

		// Tool: Update case background
		this.server.tool(
			"update_case_background",
			"Update the case background section with business context, current solution, and pain points",
			{
				content: z.record(z.any()).describe("JSON content for case background section"),
			},
			async ({ content }) => {
				try {
					const data = await callDjangoAPI(
						"/api/presentation/sections/case_background/update/",
						"PUT",
						{ content }
					);
					
					return {
						content: [
							{
								type: "text",
								text: `✅ **Updated case_background**\n\nVersion: ${data.version}\nLast Modified: ${data.last_modified}`,
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

		// Tool: Update architecture
		this.server.tool(
			"update_architecture",
			"Update the architecture section with problems mapping and traffic flow",
			{
				content: z.record(z.any()).describe("JSON content for architecture section"),
			},
			async ({ content }) => {
				try {
					const data = await callDjangoAPI(
						"/api/presentation/sections/architecture/update/",
						"PUT",
						{ content }
					);
					
					return {
						content: [
							{
								type: "text",
								text: `✅ **Updated architecture**\n\nVersion: ${data.version}\nLast Modified: ${data.last_modified}`,
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

		// Tool: Update how_cloudflare_help
		this.server.tool(
			"update_how_cloudflare_help",
			"Update how Cloudflare helps section with solutions and network advantages",
			{
				content: z.record(z.any()).describe("JSON content for how Cloudflare helps section"),
			},
			async ({ content }) => {
				try {
					const data = await callDjangoAPI(
						"/api/presentation/sections/how_cloudflare_help/update/",
						"PUT",
						{ content }
					);
					
					return {
						content: [
							{
								type: "text",
								text: `✅ **Updated how_cloudflare_help**\n\nVersion: ${data.version}\nLast Modified: ${data.last_modified}`,
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

		// Tool: Update business_value
		this.server.tool(
			"update_business_value",
			"Update business value section with value propositions and ROI summary",
			{
				content: z.record(z.any()).describe("JSON content for business value section"),
			},
			async ({ content }) => {
				try {
					const data = await callDjangoAPI(
						"/api/presentation/sections/business_value/update/",
						"PUT",
						{ content }
					);
					
					return {
						content: [
							{
								type: "text",
								text: `✅ **Updated business_value**\n\nVersion: ${data.version}\nLast Modified: ${data.last_modified}`,
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

// CORS headers helper function
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

		// Handle SSE transport (GET requests to /mcp/sse or /sse)
		if ((url.pathname === "/mcp/sse" || url.pathname === "/sse") && request.method === "GET") {
			response = await PresentationMCP.serveSSE("/mcp/sse").fetch(request, env, ctx);
		}
		// Handle HTTP transport (POST requests)
		else if ((url.pathname === "/mcp/sse" || url.pathname === "/mcp" || url.pathname === "/sse") && request.method === "POST") {
			response = await PresentationMCP.serve("/mcp/sse").fetch(request, env, ctx);
		}
		// Handle message endpoint
		else if (url.pathname === "/mcp/sse/message" || url.pathname === "/sse/message") {
			response = await PresentationMCP.serveSSE("/mcp/sse").fetch(request, env, ctx);
		}
		// Default response
		else {
			response = new Response(
				JSON.stringify({
					name: "Presentation MCP Server - Unified",
					version: "1.0.0",
					access: "full",
					tools: ["get_all_sections", "get_presentation_section", "update_case_background", "update_architecture", "update_how_cloudflare_help", "update_business_value"],
					endpoints: "/mcp/sse (GET/POST)",
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
