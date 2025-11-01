// Cloudflare Access OAuth Handler for MCP Server

export interface Env {
	// OAuth secrets
	ACCESS_CLIENT_ID: string;
	ACCESS_CLIENT_SECRET: string;
	ACCESS_TOKEN_URL: string;
	ACCESS_AUTHORIZATION_URL: string;
	ACCESS_JWKS_URL: string;
	COOKIE_ENCRYPTION_KEY: string;
	
	// KV for session storage
	OAUTH_KV: KVNamespace;
	
	// MCP bindings
	MCP_OBJECT: DurableObjectNamespace;
	DJANGO_API_URL: string;
	MCP_VERSION: string;
}

/**
 * Cloudflare Access OAuth Handler
 * Handles authentication flow with Cloudflare Access as the identity provider
 */
export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		// Handle authorization endpoint
		if (url.pathname === "/authorize") {
			return handleAuthorize(request, env);
		}

		// Handle token endpoint
		if (url.pathname === "/token") {
			return handleToken(request, env);
		}

		// Handle callback from Cloudflare Access
		if (url.pathname === "/callback") {
			return handleCallback(request, env);
		}

		// Default: redirect to login
		return new Response("Unauthorized", { status: 401 });
	},
};

/**
 * Handle /authorize - Start OAuth flow with Cloudflare Access
 */
async function handleAuthorize(request: Request, env: Env): Promise<Response> {
	const url = new URL(request.url);
	
	// Get OAuth parameters from query
	const clientId = url.searchParams.get("client_id");
	const redirectUri = url.searchParams.get("redirect_uri");
	const state = url.searchParams.get("state");
	const codeChallenge = url.searchParams.get("code_challenge");
	const codeChallengeMethod = url.searchParams.get("code_challenge_method");
	const scope = url.searchParams.get("scope") || "openid profile email";

	if (!clientId || !redirectUri || !state) {
		return new Response("Missing required parameters", { status: 400 });
	}

	// Store the original OAuth request parameters in KV
	const requestKey = `oauth_request:${state}`;
	await env.OAUTH_KV.put(
		requestKey,
		JSON.stringify({
			client_id: clientId,
			redirect_uri: redirectUri,
			state,
			code_challenge: codeChallenge,
			code_challenge_method: codeChallengeMethod,
			scope,
			timestamp: Date.now(),
		}),
		{ expirationTtl: 600 } // 10 minutes
	);

	// Build Cloudflare Access authorization URL
	const accessAuthUrl = new URL(env.ACCESS_AUTHORIZATION_URL);
	accessAuthUrl.searchParams.set("client_id", env.ACCESS_CLIENT_ID);
	accessAuthUrl.searchParams.set("redirect_uri", `${url.origin}/callback`);
	accessAuthUrl.searchParams.set("response_type", "code");
	accessAuthUrl.searchParams.set("scope", scope);
	accessAuthUrl.searchParams.set("state", state);

	// Redirect to Cloudflare Access login
	return Response.redirect(accessAuthUrl.toString(), 302);
}

/**
 * Handle /callback - Receive authorization code from Cloudflare Access
 */
async function handleCallback(request: Request, env: Env): Promise<Response> {
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");

	if (!code || !state) {
		return new Response("Missing code or state", { status: 400 });
	}

	// Retrieve the original OAuth request
	const requestKey = `oauth_request:${state}`;
	const requestData = await env.OAUTH_KV.get(requestKey);
	
	if (!requestData) {
		return new Response("Invalid or expired state", { status: 400 });
	}

	const oauthRequest = JSON.parse(requestData);

	// Exchange authorization code for access token from Cloudflare Access
	const tokenResponse = await fetch(env.ACCESS_TOKEN_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			client_id: env.ACCESS_CLIENT_ID,
			client_secret: env.ACCESS_CLIENT_SECRET,
			code,
			redirect_uri: `${url.origin}/callback`,
			grant_type: "authorization_code",
		}),
	});

	if (!tokenResponse.ok) {
		const error = await tokenResponse.text();
		console.error("Token exchange failed:", error);
		return new Response(`Token exchange failed: ${error}`, { status: 500 });
	}

	const tokens = await tokenResponse.json<{
		access_token: string;
		id_token?: string;
		refresh_token?: string;
		expires_in?: number;
	}>();

	// Generate an authorization code for the MCP client
	const mcpAuthCode = crypto.randomUUID();

	// Store the Access token associated with the MCP auth code
	await env.OAUTH_KV.put(
		`auth_code:${mcpAuthCode}`,
		JSON.stringify({
			access_token: tokens.access_token,
			id_token: tokens.id_token,
			refresh_token: tokens.refresh_token,
			client_id: oauthRequest.client_id,
			redirect_uri: oauthRequest.redirect_uri,
			code_challenge: oauthRequest.code_challenge,
			code_challenge_method: oauthRequest.code_challenge_method,
			scope: oauthRequest.scope,
			timestamp: Date.now(),
		}),
		{ expirationTtl: 300 } // 5 minutes
	);

	// Clean up the request data
	await env.OAUTH_KV.delete(requestKey);

	// Redirect back to the MCP client with the authorization code
	const redirectUrl = new URL(oauthRequest.redirect_uri);
	redirectUrl.searchParams.set("code", mcpAuthCode);
	redirectUrl.searchParams.set("state", state);

	return Response.redirect(redirectUrl.toString(), 302);
}

/**
 * Handle /token - Exchange authorization code for MCP access token
 */
async function handleToken(request: Request, env: Env): Promise<Response> {
	if (request.method !== "POST") {
		return new Response("Method not allowed", { status: 405 });
	}

	const body = await request.text();
	const params = new URLSearchParams(body);

	const grantType = params.get("grant_type");
	const code = params.get("code");
	const redirectUri = params.get("redirect_uri");
	const codeVerifier = params.get("code_verifier");
	const clientId = params.get("client_id");

	if (grantType === "authorization_code") {
		if (!code || !redirectUri) {
			return new Response(
				JSON.stringify({ error: "invalid_request", error_description: "Missing code or redirect_uri" }),
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}

		// Retrieve the authorization code data
		const authCodeKey = `auth_code:${code}`;
		const authCodeData = await env.OAUTH_KV.get(authCodeKey);

		if (!authCodeData) {
			return new Response(
				JSON.stringify({ error: "invalid_grant", error_description: "Invalid or expired authorization code" }),
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}

		const authData = JSON.parse(authCodeData);

		// Verify PKCE challenge if present
		if (authData.code_challenge && codeVerifier) {
			const encoder = new TextEncoder();
			const data = encoder.encode(codeVerifier);
			const hash = await crypto.subtle.digest("SHA-256", data);
			const base64url = btoa(String.fromCharCode(...new Uint8Array(hash)))
				.replace(/\+/g, "-")
				.replace(/\//g, "_")
				.replace(/=/g, "");

			if (base64url !== authData.code_challenge) {
				return new Response(
					JSON.stringify({ error: "invalid_grant", error_description: "Invalid code verifier" }),
					{ status: 400, headers: { "Content-Type": "application/json" } }
				);
			}
		}

		// Generate MCP access token
		const accessToken = crypto.randomUUID();
		
		// Store the access token with the Cloudflare Access token
		await env.OAUTH_KV.put(
			`access_token:${accessToken}`,
			JSON.stringify({
				cf_access_token: authData.access_token,
				id_token: authData.id_token,
				scope: authData.scope,
				client_id: authData.client_id,
				timestamp: Date.now(),
			}),
			{ expirationTtl: 3600 } // 1 hour
		);

		// Clean up the authorization code
		await env.OAUTH_KV.delete(authCodeKey);

		// Return the MCP access token
		return new Response(
			JSON.stringify({
				access_token: accessToken,
				token_type: "Bearer",
				expires_in: 3600,
				refresh_token: authData.refresh_token,
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			}
		);
	}

	// Handle refresh token flow if needed
	if (grantType === "refresh_token") {
		const refreshToken = params.get("refresh_token");
		if (!refreshToken) {
			return new Response(
				JSON.stringify({ error: "invalid_request", error_description: "Missing refresh_token" }),
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}

		// Exchange refresh token with Cloudflare Access
		const tokenResponse = await fetch(env.ACCESS_TOKEN_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: new URLSearchParams({
				client_id: env.ACCESS_CLIENT_ID,
				client_secret: env.ACCESS_CLIENT_SECRET,
				refresh_token: refreshToken,
				grant_type: "refresh_token",
			}),
		});

		if (!tokenResponse.ok) {
			return new Response(
				JSON.stringify({ error: "invalid_grant", error_description: "Invalid refresh token" }),
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}

		const tokens = await tokenResponse.json<{
			access_token: string;
			id_token?: string;
			refresh_token?: string;
			expires_in?: number;
		}>();

		// Generate new MCP access token
		const accessToken = crypto.randomUUID();

		// Store the new access token
		await env.OAUTH_KV.put(
			`access_token:${accessToken}`,
			JSON.stringify({
				cf_access_token: tokens.access_token,
				id_token: tokens.id_token,
				scope: "openid profile email",
				client_id: clientId,
				timestamp: Date.now(),
			}),
			{ expirationTtl: 3600 }
		);

		return new Response(
			JSON.stringify({
				access_token: accessToken,
				token_type: "Bearer",
				expires_in: 3600,
				refresh_token: tokens.refresh_token,
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			}
		);
	}

	return new Response(
		JSON.stringify({ error: "unsupported_grant_type" }),
		{ status: 400, headers: { "Content-Type": "application/json" } }
	);
}

/**
 * Verify access token from incoming MCP requests
 */
export async function verifyAccessToken(
	request: Request,
	env: Env
): Promise<{ valid: boolean; user?: any; cf_access_token?: string }> {
	const authHeader = request.headers.get("Authorization");
	
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return { valid: false };
	}

	const token = authHeader.substring(7);

	// Retrieve token data from KV
	const tokenData = await env.OAUTH_KV.get(`access_token:${token}`);
	
	if (!tokenData) {
		return { valid: false };
	}

	const data = JSON.parse(tokenData);

	// Optionally verify the Cloudflare Access token with JWKS
	// For now, we trust that the token in KV is valid

	return {
		valid: true,
		cf_access_token: data.cf_access_token,
		user: {
			id_token: data.id_token,
			scope: data.scope,
		},
	};
}
