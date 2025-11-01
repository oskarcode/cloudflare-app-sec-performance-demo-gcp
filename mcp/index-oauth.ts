// OAuth-Protected MCP Server
import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import AuthHandler, { verifyAccessToken, Env } from "./auth-handler";

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
			async ({ section_type }: { section_type: string }) => {
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
			async ({ content }: { content: Record<string, any> }) => {
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
			async ({ content }: { content: Record<string, any> }) => {
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
			async ({ content }: { content: Record<string, any> }) => {
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
			async ({ content }: { content: Record<string, any> }) => {
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
	async fetch(request: Request, env: Env, ctx: any) {
		const url = new URL(request.url);

		// Handle preflight OPTIONS requests
		if (request.method === "OPTIONS") {
			return addCorsHeaders(
				new Response(null, { status: 200 }),
				request
			);
		}

		// OAuth endpoints - handled by AuthHandler
		if (
			url.pathname === "/authorize" ||
			url.pathname === "/token" ||
			url.pathname === "/callback"
		) {
			const response = await AuthHandler.fetch(request, env);
			return addCorsHeaders(response, request);
		}

		// MCP endpoints - require authentication
		if (url.pathname === "/mcp/sse" || url.pathname === "/mcp" || url.pathname === "/sse") {
			// Verify OAuth token for MCP requests
			const authResult = await verifyAccessToken(request, env);
			
			if (!authResult.valid) {
				// Return 401 with OAuth challenge
				return addCorsHeaders(
					new Response(
						JSON.stringify({
							error: "unauthorized",
							error_description: "Valid access token required",
							authorization_url: `${url.origin}/authorize`,
						}),
						{
							status: 401,
							headers: {
								"Content-Type": "application/json",
								"WWW-Authenticate": `Bearer realm="MCP Server", authorization_url="${url.origin}/authorize"`,
							},
						}
					),
					request
				);
			}

			// Token is valid, process MCP request
			let response: Response;

			if (request.method === "GET") {
				response = await PresentationMCP.serveSSE("/mcp/sse").fetch(request, env, ctx);
			} else if (request.method === "POST") {
				response = await PresentationMCP.serve("/mcp/sse").fetch(request, env, ctx);
			} else {
				response = new Response("Method not allowed", { status: 405 });
			}

			return addCorsHeaders(response, request);
		}

		// Default response
		const response = new Response(
			JSON.stringify({
				name: "Presentation MCP Server",
				version: "1.0.0",
				oauth_enabled: true,
				endpoints: {
					authorization: `${url.origin}/authorize`,
					token: `${url.origin}/token`,
					mcp: `${url.origin}/mcp/sse`,
				},
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			}
		);

		return addCorsHeaders(response, request);
	},
};
