// Krea.ai API helpers — async job lifecycle

// Default Cloudflare Worker proxy URL for CORS
const KREA_WORKER_URL = 'https://gmk-krea-proxy.workers.dev';
const KREA_BASE = 'https://api.krea.ai';

// Get the proxy URL: window.KREA_PROXY > localStorage > Cloudflare Worker > direct API
function getKreaBase() {
  if (typeof window !== 'undefined' && window.KREA_BASE) return window.KREA_BASE;
  const stored = localStorage.getItem('gmk_krea_base');
  if (stored) return stored;
  // Try worker if available, otherwise fall back to direct API
  return KREA_WORKER_URL;
}

// Optional CORS proxy prefix — set window.KREA_PROXY to override
// e.g. 'https://corsproxy.io/?' or your own proxy
function getProxy() {
  return (typeof window !== 'undefined' && window.KREA_PROXY) || localStorage.getItem('gmk_krea_proxy') || '';
}

function proxied(url) {
  const p = getProxy();
  return p ? p + encodeURIComponent(url) : url;
}

// Submit a text-to-image job — tries with and without /v1 prefix
async function kreaGenerateImage({ apiKey, model = 'nano-banana-pro', prompt, width = 1080, height = 1080, steps = 28 }) {
  const base = getKreaBase();
  // Try primary endpoint first, then v1 prefix
  const endpoints = [
    proxied(`${base}/generate/image/${model}`),
    proxied(`${base}/v1/generate/image/${model}`),
  ];

  let lastErr = null;
  for (const url of endpoints) {
    try {
      const body = url.includes('/v1/images/generate')
        ? JSON.stringify({ model, prompt, width, height, steps })
        : JSON.stringify({ prompt, width, height, steps });

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body,
      });

      if (res.status === 404) { lastErr = new Error(`404 – endpoint nem található: ${url}`); continue; }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      // attach which endpoint worked for polling
      data._endpoint_base = base;
      return data;
    } catch (e) {
      if (e.message.startsWith('404')) { lastErr = e; continue; }
      throw e; // CORS / network error — rethrow immediately
    }
  }
  throw lastErr || new Error('Minden endpoint 404-et adott vissza.');
}

// Poll a job until completed or failed. onProgress(status) called each tick.
async function kreaWaitForJob({ apiKey, jobId, endpointBase, onProgress, maxWaitMs = 120000, intervalMs = 2500 }) {
  const base = endpointBase || getKreaBase();
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const res = await fetch(proxied(`${base}/jobs/${jobId}`), {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
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
    endpointBase: job._endpoint_base,
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
