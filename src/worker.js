// Cloudflare Worker: CORS proxy for Krea API
// Forwards requests to https://api.krea.ai with proper CORS headers

const KREA_API_BASE = 'https://api.krea.ai';

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const url = new URL(request.url);
    const targetPath = url.pathname.replace(/^\//, '');
    const targetUrl = new URL(targetPath, KREA_API_BASE);

    // Copy query parameters
    targetUrl.search = url.search;

    try {
      // Forward the request to Krea API
      const kreaRequest = new Request(targetUrl, {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
          // Forward Authorization header if present
          ...(request.headers.get('Authorization')
            ? { 'Authorization': request.headers.get('Authorization') }
            : {}),
        },
        body: request.method !== 'GET' ? await request.text() : undefined,
      });

      const response = await fetch(kreaRequest);
      const responseBody = await response.text();

      // Return response with CORS headers
      return new Response(responseBody, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Cache-Control': 'no-cache',
        },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message || 'Proxy error' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  },
};
