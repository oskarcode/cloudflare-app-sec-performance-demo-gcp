/**
 * Cloudflare Workers Script: Flash Sale Rate Limiter
 * 
 * Purpose: Protect flash sale pages from bot attacks during high-demand events
 * Business Case: Ensure real customers can access Black Friday/Cyber Monday deals
 * Demo Value: Shows immediate e-commerce protection with simple, testable logic
 * 
 * Author: Cloudflare E-commerce Demo
 * Deploy: Zone ID ce1a9880ae2ffdcad159a40283e838a8
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Only apply rate limiting to flash sale pages
    if (!url.pathname.startsWith('/flash-sale')) {
      // Pass through all other requests to origin
      return fetch(request);
    }

    // Get client IP for rate limiting
    const clientIP = request.headers.get('CF-Connecting-IP') || 
                     request.headers.get('X-Forwarded-For') || 
                     'unknown';
    
    // Create cache key for this IP with version prefix to bust stale cache
    const CACHE_VERSION = 'v3'; // increment this to clear all cached entries
    const cacheKey = `${CACHE_VERSION}_flash_sale_${clientIP}`;
    
    // Get configured rate limit window and request threshold
    const rateLimitSeconds = parseInt(env?.RATE_LIMIT_SECONDS || '10', 10);
    const maxRequests = parseInt(env?.MAX_REQUESTS_PER_PERIOD || '1', 10);
    
    try {
      // Check if this IP has accessed flash sale recently
      const cache = caches.default;
      const cacheUrl = new URL(`https://flash-sale-cache.example.com/${cacheKey}`);
      const cachedResponse = await cache.match(cacheUrl);
      
      let requestCount = 0;
      
      if (cachedResponse) {
        // Read current request count from cache
        const cacheData = await cachedResponse.text();
        try {
          const data = JSON.parse(cacheData);
          requestCount = data.count || 0;
        } catch (e) {
          requestCount = 1; // fallback for old cache format
        }
        
        // Increment the count
        requestCount++;
        
        // Check if exceeded limit
        if (requestCount > maxRequests) {
          // IP is rate limited - show "please wait" message
          console.log(`FLASH SALE RATE LIMITED: IP ${clientIP} - ${requestCount} requests - limit is ${maxRequests}`);
        
        return new Response(`
<!DOCTYPE html>
<html>
<head>
    <title>High Demand - Please Wait</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f8f9fa; }
        .container { position: relative; z-index: 9999; max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .emoji { font-size: 48px; margin-bottom: 20px; }
        h1 { color: #dc3545; margin-bottom: 20px; }
        p { color: #6c757d; font-size: 18px; line-height: 1.6; }
        .timer { background: #ffc107; color: #212529; padding: 10px 20px; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .btn { background: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 5px; text-decoration: none; display: inline-block; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="emoji">🔥</div>
        <h1>Flash Sale - High Demand!</h1>
        <p>Our flash sale is experiencing extremely high traffic. To ensure fair access for all customers, we're limiting requests.</p>
        <p><strong>You've made ${requestCount} requests.</strong> Limit is ${maxRequests} requests per ${rateLimitSeconds} seconds.</p>
        <div class="timer">⏰ Please wait ${rateLimitSeconds} seconds before trying again</div>
        <p><strong>Why this helps:</strong><br>
        • Prevents bots from buying all deals instantly<br>
        • Ensures real customers get fair access<br>
        • Keeps our site fast and responsive</p>
        <a href="/" class="btn">← Back to Home</a>
        <p style="margin-top: 30px; font-size: 14px; color: #999;">
            Protected by Cloudflare Workers • Your IP: ${clientIP}
        </p>
    </div>
    <script>
        // Live countdown based on configured retry window and auto-retry with buffer to avoid TTL drift
        var btn = document.querySelector('.btn');
        var timerEl = document.querySelector('.timer');
        var retryAfter = ${rateLimitSeconds};
        var bufferSec = 2; // extra seconds to avoid re-hitting TTL
        var start = Date.now();
        var remaining = retryAfter;

        // Keep the message visible
        window.scrollTo(0, 0);

        var intId = setInterval(function() {
            var elapsed = Math.floor((Date.now() - start) / 1000);
            remaining = Math.max(0, retryAfter - elapsed);
            timerEl.textContent = '⏰ Please wait ' + remaining + 's before trying again';
            if (remaining === 0) {
                clearInterval(intId);
                timerEl.textContent = '⏰ You can try again now!';
                btn.textContent = '🔄 Try Flash Sale Again';
                btn.href = window.location.href; // use full URL, keep query/hash
                // brief message before retry to ensure TTL expired at the edge
                setTimeout(function() {
                    timerEl.textContent = '⏳ Trying again...';
                    location.replace(window.location.href);
                }, bufferSec * 1000);
            }
        }, 1000);
    </script>
</body>
</html>`, {
          status: 429,
          headers: {
            'Content-Type': 'text/html',
            'X-Rate-Limited': 'true',
            'X-Rate-Limit-Reset': String(rateLimitSeconds),
            'X-Rate-Limit': String(maxRequests),
            'X-Request-Count': String(requestCount),
            'X-Protected-By': 'Cloudflare-Workers',
            'X-Cache-Status': 'HIT',
            'X-Cache-Key': cacheKey,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Retry-After': String(rateLimitSeconds)
          }
        });
        }
      }
      
      // Still under the limit - allow access and update count
      console.log(`FLASH SALE ACCESS: IP ${clientIP} - request ${requestCount} of ${maxRequests} allowed`);
      
      // Store updated count in cache for configured seconds
      const cacheData = JSON.stringify({ count: requestCount, timestamp: Date.now() });
      const rateLimitResponse = new Response(cacheData, {
        headers: {
          'Cache-Control': `max-age=${rateLimitSeconds}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Cache the rate limit for this IP
      ctx.waitUntil(cache.put(cacheUrl, rateLimitResponse));
      
      // Fetch the actual flash sale page
      const originalResponse = await fetch(request);
      
      // Add headers to show protection is active
      const protectedResponse = new Response(originalResponse.body, {
        status: originalResponse.status,
        statusText: originalResponse.statusText,
        headers: originalResponse.headers
      });
      
      // Add security headers
      protectedResponse.headers.set('X-Flash-Sale-Protected', 'true');
      protectedResponse.headers.set('X-Rate-Limit', String(maxRequests));
      protectedResponse.headers.set('X-Request-Count', String(requestCount));
      protectedResponse.headers.set('X-Rate-Limit-Remaining', String(Math.max(0, maxRequests - requestCount)));
      protectedResponse.headers.set('X-Cache-Status', requestCount === 0 ? 'MISS' : 'HIT');
      protectedResponse.headers.set('X-Cache-Key', cacheKey);
      protectedResponse.headers.set('X-Client-IP', clientIP);
      
      return protectedResponse;
      
    } catch (error) {
      // If anything fails, allow the request but log the error
      console.error('Flash Sale Protection Error:', error.message);
      
      const fallbackResponse = await fetch(request);
      const errorResponse = new Response(fallbackResponse.body, {
        status: fallbackResponse.status,
        statusText: fallbackResponse.statusText,
        headers: fallbackResponse.headers
      });
      
      errorResponse.headers.set('X-Protection-Error', 'Fallback-Mode');
      return errorResponse;
    }
  }
};