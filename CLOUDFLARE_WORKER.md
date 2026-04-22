# Cloudflare Worker Setup for Krea API CORS Proxy

This project includes a Cloudflare Worker that acts as a CORS proxy for the Krea API, allowing the frontend to call `api.krea.ai` from browsers without CORS issues.

## Deployment

### Prerequisites
- Cloudflare account (free tier works fine)
- Node.js and npm installed
- Wrangler CLI installed: `npm install -g wrangler`

### Steps

1. **Install Wrangler (if not already installed):**
   ```bash
   npm install -g wrangler
   ```

2. **Authenticate with Cloudflare:**
   ```bash
   wrangler login
   ```
   This will open a browser window to authorize Wrangler with your Cloudflare account.

3. **Deploy the worker:**
   ```bash
   wrangler deploy
   ```
   This will deploy `src/worker.js` to your Cloudflare Workers account.

4. **Note your worker URL:**
   The deployment output will show your worker URL, typically something like:
   ```
   https://gmk-krea-proxy.<YOUR_ACCOUNT>.workers.dev
   ```

### Configuration

Update `src/krea.jsx` to use your worker URL:

In `src/krea.jsx`, replace the `KREA_API_BASE` constant:

```javascript
// Before
const KREA_API_BASE = 'https://api.krea.ai';

// After
const KREA_API_BASE = 'https://gmk-krea-proxy.<YOUR_ACCOUNT>.workers.dev';
```

Or set it as an environment variable if using a build process.

## How It Works

1. Frontend makes a request to the Cloudflare Worker
2. Worker forwards the request to `https://api.krea.ai`
3. Worker adds `Authorization: Bearer YOUR_API_KEY` header
4. Worker returns the response with CORS headers (`Access-Control-Allow-Origin: *`)
5. Browser accepts the response and the frontend receives the data

## CORS Headers

The worker adds these CORS headers to all responses:
- `Access-Control-Allow-Origin: *` (allow all origins)
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`
- `Access-Control-Max-Age: 86400` (cache preflight for 24 hours)

## Security Notes

- The API key is sent from the frontend to the worker in the `Authorization` header
- The worker forwards it to Krea API with the same header
- Anyone who knows your worker URL can use it (it's publicly accessible)
- Consider rate-limiting in Cloudflare dashboard if needed
- For production, consider implementing authentication/rate-limiting in the worker

## Testing

Test the worker locally:
```bash
wrangler dev
```

Then make requests to `http://localhost:8787/generate/image/bfl/flux-1-dev` with proper headers.

## Troubleshooting

**Worker deploys but returns 500 errors:**
- Check that your Krea API key is correct
- Check browser console for the actual error message
- Verify the Authorization header is being sent correctly

**CORS still not working:**
- Ensure you're using the worker URL, not the direct `api.krea.ai` URL
- Check browser Network tab to see if CORS headers are present in response
- Clear browser cache and reload
