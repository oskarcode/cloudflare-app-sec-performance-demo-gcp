/**
 * Cloudflare Workers Script: Admin Portal Protection
 * 
 * Purpose: Redirect suspicious admin portal access attempts after 3 consecutive requests
 * Demonstrates: Advanced bot protection, rate limiting, and security monitoring
 * 
 * Author: Cloudflare Security Demo
 * Deploy: Zone ID ce1a9880ae2ffdcad159a40283e838a8
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Only handle requests to /admin-portal/
    if (!url.pathname.startsWith('/admin-portal/')) {
      // Pass through all other requests to origin
      return fetch(request);
    }

    // Get client IP for tracking
    const clientIP = request.headers.get('CF-Connecting-IP') || 
                     request.headers.get('X-Forwarded-For') || 
                     'unknown';
    
    // Create unique key for this IP and path
    const cacheKey = `admin_attempts_${clientIP}`;
    
    try {
      // Get current attempt count from KV storage (if available) or use in-memory fallback
      let attempts = 0;
      let lastAttemptTime = 0;
      
      // Try to get from KV storage first (if bound)
      if (env.ADMIN_PROTECTION_KV) {
        const stored = await env.ADMIN_PROTECTION_KV.get(cacheKey, 'json');
        if (stored) {
          attempts = stored.attempts || 0;
          lastAttemptTime = stored.lastAttemptTime || 0;
        }
      }
      
      const currentTime = Date.now();
      const timeDifference = currentTime - lastAttemptTime;
      
      // Reset counter if more than 5 minutes have passed
      if (timeDifference > 300000) { // 5 minutes
        attempts = 0;
      }
      
      // Increment attempt counter
      attempts++;
      
      // Store updated attempts (with fallback if KV not available)
      if (env.ADMIN_PROTECTION_KV) {
        await env.ADMIN_PROTECTION_KV.put(cacheKey, JSON.stringify({
          attempts: attempts,
          lastAttemptTime: currentTime,
          userAgent: request.headers.get('User-Agent') || 'unknown'
        }), { expirationTtl: 3600 }); // 1 hour TTL
      }
      
      // Log security event for monitoring
      console.log(`Admin Portal Access: IP=${clientIP}, Attempts=${attempts}, UA=${request.headers.get('User-Agent')}`);
      
      // After 3 attempts, redirect to home page
      if (attempts >= 3) {
        console.log(`SECURITY: Redirecting suspicious admin access from IP ${clientIP} after ${attempts} attempts`);
        
        // Create redirect response with security headers
        const redirectResponse = new Response(null, {
          status: 302,
          headers: {
            'Location': 'https://demo.oskarcode.com/',
            'X-Security-Action': 'Admin-Access-Blocked',
            'X-Attempt-Count': attempts.toString(),
            'X-Client-IP': clientIP,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        return redirectResponse;
      }
      
      // For first 2 attempts, show warning but allow access
      if (attempts <= 2) {
        // Fetch the original response from origin
        const originResponse = await fetch(request);
        
        // Clone the response to modify headers
        const modifiedResponse = new Response(originResponse.body, {
          status: originResponse.status,
          statusText: originResponse.statusText,
          headers: originResponse.headers
        });
        
        // Add security warning headers
        modifiedResponse.headers.set('X-Security-Warning', 'Admin-Access-Monitored');
        modifiedResponse.headers.set('X-Attempt-Count', attempts.toString());
        modifiedResponse.headers.set('X-Remaining-Attempts', (3 - attempts).toString());
        
        return modifiedResponse;
      }
      
    } catch (error) {
      // If there's any error with the security logic, log it but don't break the request
      console.error('Admin Protection Error:', error.message);
      
      // Fallback: allow the request but add error header
      const originResponse = await fetch(request);
      const fallbackResponse = new Response(originResponse.body, {
        status: originResponse.status,
        statusText: originResponse.statusText,
        headers: originResponse.headers
      });
      
      fallbackResponse.headers.set('X-Security-Error', 'Protection-Fallback');
      return fallbackResponse;
    }
  }
};

// Optional: Add scheduled handler for cleanup (if needed)
export const scheduled = {
  async fetch(event, env, ctx) {
    // This could be used to clean up old entries from KV storage
    console.log('Scheduled cleanup triggered at', new Date().toISOString());
    
    // Add cleanup logic here if using KV storage
    return new Response('Cleanup completed');
  }
};