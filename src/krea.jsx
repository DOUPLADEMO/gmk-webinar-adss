// Krea.ai API helpers — async job lifecycle

const KREA_BASE = 'https://api.krea.ai';
const CORSPROXY_URL = 'https://proxy.cors.sh/';
const CORSPROXY_API_KEY = '4509bcba'; // corsproxy.io API key for authenticated requests

// Get proxy settings from localStorage or environment
function getProxyConfig() {
  return {
    url: localStorage.getItem('gmk_proxy_url') || CORSPROXY_URL,
    apiKey: localStorage.getItem('gmk_proxy_key') || CORSPROXY_API_KEY,
  };
}

// Build fetch headers with CORS proxy authentication if needed
function getProxyHeaders(proxyConfig) {
  if (!proxyConfig.url || proxyConfig.url === KREA_BASE) return {};
  return proxyConfig.apiKey ? { 'x-cors-api-key': proxyConfig.apiKey } : {};
}

// Build the final URL, proxying through corsproxy.io if configured
function buildProxiedUrl(path, proxyConfig) {
  const config = proxyConfig || getProxyConfig();
  if (!config.url || config.url === KREA_BASE) return `${KREA_BASE}${path}`;
  // corsproxy.io format: https://proxy.cors.sh/{target-url}
  const targetUrl = `${KREA_BASE}${path}`;
  return `${config.url}${targetUrl}`;
}

// Submit a text-to-image job — tries with and without /v1 prefix
async function kreaGenerateImage({ apiKey, model = 'nano-banana-pro', prompt, width = 1080, height = 1080, steps = 28 }) {
  const proxyConfig = getProxyConfig();
  const endpoints = [
    { path: `/generate/image/${model}` },
    { path: `/v1/generate/image/${model}` },
  ];

  let lastErr = null;
  for (const endpoint of endpoints) {
    try {
      const url = buildProxiedUrl(endpoint.path, proxyConfig);
      const body = endpoint.path.includes('/v1/images/generate')
        ? JSON.stringify({ model, prompt, width, height, steps })
        : JSON.stringify({ prompt, width, height, steps });

      const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...getProxyHeaders(proxyConfig),
      };

      const res = await fetch(url, { method: 'POST', headers, body });

      if (res.status === 404) { lastErr = new Error(`404 – endpoint nem található`); continue; }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      data._endpoint_path = endpoint.path;
      return data;
    } catch (e) {
      if (e.message.startsWith('404')) { lastErr = e; continue; }
      throw e;
    }
  }
  throw lastErr || new Error('Minden endpoint 404-et adott vissza.');
}

// Poll a job until completed or failed. onProgress(status) called each tick.
async function kreaWaitForJob({ apiKey, jobId, endpointPath, onProgress, maxWaitMs = 120000, intervalMs = 2500 }) {
  const proxyConfig = getProxyConfig();
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const url = buildProxiedUrl(`/jobs/${jobId}`, proxyConfig);
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      ...getProxyHeaders(proxyConfig),
    };
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Poll HTTP ${res.status}`);
    const job = await res.json();
    onProgress && onProgress(job.status);
    if (job.completed_at) {
      if (job.status === 'completed') {
        return job.result?.urls?.[0] || null;
      } else {
        throw new Error(`Job ${job.status}: ${job.error || 'ismeretlen hiba'}`);
      }
    }
    await new Promise(r => setTimeout(r, intervalMs));
  }
  throw new Error('Timeout: generálás túl sokáig tartott.');
}

// Full pipeline: submit + poll → returns image URL
async function kreaGenerate(opts, onStatus) {
  const job = await kreaGenerateImage(opts);
  const url = await kreaWaitForJob({
    apiKey: opts.apiKey,
    jobId: job.job_id,
    endpointPath: job._endpoint_path,
    onProgress: onStatus,
    intervalMs: 2500
  });
  return url;
}

// Build a creative prompt from variant + style
function buildCreativePrompt(variant, style, customPrompt) {
  if (customPrompt && customPrompt.trim()) return customPrompt.trim();

  const headline = variant.headline.replace(/\n/g, ' ');
  const label = variant.label;

  const stylePrompts = {
    neon: `Dark cyberpunk background with electric neon teal and magenta glows, dramatic light rays, futuristic grid lines, bokeh particles. Context: "${headline}". Dark atmospheric tech aesthetic, no text, no people, ultra detailed.`,
    bold: `Bold flat graphic design background, high contrast geometric shapes, strong teal and charcoal color blocks, abstract arrows and dynamic diagonal lines suggesting growth and transformation. No text, no faces. For a webinar ad: "${headline}".`,
    drama: `Cinematic photorealistic dark dramatic scene, professional speaker on stage spotlight, conference hall silhouette, ultra-wide dramatic lighting, deep shadows, teal accent light. No visible text. Ad concept: career transformation.`,
    glass: `3D glassmorphism technology background, floating translucent panels, chrome spheres, soft teal gradient light, depth of field blur, premium corporate tech aesthetic. Subtle data visualization in background. No text.`,
    thumb: `YouTube thumbnail style background, bold high energy composition, dramatic split lighting, vibrant teal and dark slate, strong directional light rays, dynamic energy lines. Eye-catching click-bait energy. No text, no faces.`,
    editorial: `Magazine editorial background, luxury dark matte texture, minimal geometric accent lines in teal, premium print aesthetic, subtle paper grain, sophisticated dark layout with negative space. Corporate B2B feel.`,
  };

  return stylePrompts[style] || stylePrompts.bold;
}

Object.assign(window, { kreaGenerate, buildCreativePrompt });
