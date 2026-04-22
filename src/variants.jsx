// Copy variants + CTA options + rendering config

const VARIANTS = [
  {
    id: "V1",
    headline: "7 szakma, ami eltűnik –\n7 új karrier, ami most születik",
    subline: null,
    label: "AI és karrierváltás: hogyan csináld okosan? előadás"
  },
  {
    id: "V2",
    headline: "Az AI nem elveszi a munkád.",
    subline: "Valaki más fogja elvenni, aki használja.",
    label: "AI és karrierváltás: hogyan csináld okosan? előadás"
  },
  {
    id: "V3",
    headline: "1000 ember pályázik ugyanarra az állásra.",
    subline: "Te mit tudsz, amit ők nem?",
    label: "Karrierváltás az AI korszakában: mit tanulj 2026-ban? előadás"
  },
  {
    id: "V4",
    headline: "Nem az AI veszélyes.",
    subline: "Hanem az, ha kimaradsz belőle.",
    label: "Karrierváltás az AI korszakában: mit tanulj 2026-ban? előadás"
  },
  {
    id: "V5",
    headline: "Az irodai állások csendben tűnnek el –\nvagy átalakulnak?",
    subline: null,
    label: "Karrierváltás az AI korszakában: mit tanulj 2026-ban? előadás"
  },
  {
    id: "V6",
    headline: "Ugyanaz a munka. 2× fizetés. AI.",
    subline: null,
    label: "AI és karrierváltás: hogyan csináld okosan? előadás"
  },
  {
    id: "V7",
    headline: "Megérkezett az AI a munkaerőpiacra –",
    subline: "és már most átalakítja az állásokat",
    label: "Karrierváltás az AI korszakában: mit tanulj 2026-ban? előadás"
  },
  {
    id: "V8",
    headline: "Miért MOST a legjobb idő karriert váltani?",
    subline: null,
    label: "Karrierváltás az AI korszakában: mit tanulj 2026-ban? előadás"
  },
  {
    id: "V9",
    headline: "Miért keresnek többet azok, akik értenek az AI-hoz?",
    subline: null,
    label: "AI és karrierváltás: hogyan csináld okosan? előadás"
  }
];

const CTA_OPTIONS = [
  "Regisztrálj fel rá!",
  "Ne maradj le róla!",
  "Mit tanulj 2026-ban?",
  "Érdekel →"
];

const LAYOUT_OPTIONS = [
  { id: "hero",       label: "Hero portré" },
  { id: "full-bleed", label: "Teljes háttér" },
  { id: "circle",     label: "Kör jelvény" },
];

const AD_FORMATS = [
  // Facebook (longer text allowed: headline + subline + CTA)
  { id: 'fb_square',   label: 'FB Square 1200×1200', group: 'Facebook', platform: 'fb', w: 1200, h: 1200, icon: '■' },
  { id: 'fb_link',     label: 'FB Link 1200×628',    group: 'Facebook', platform: 'fb', w: 1200, h: 628,  icon: '▭' },
  // Google Ads (short & BIG text: headline + CTA only, no subline)
  { id: 'ads_square',   label: 'Ads Square 1200×1200', group: 'Google Ads', platform: 'ads', w: 1200, h: 1200, icon: '■' },
  { id: 'ads_link',     label: 'Ads Link 1200×628',    group: 'Google Ads', platform: 'ads', w: 1200, h: 628,  icon: '▭' },
  { id: 'ads_portrait', label: 'Ads Portrait 960×1200', group: 'Google Ads', platform: 'ads', w: 960,  h: 1200, icon: '▬' },
  { id: 'ads_story',    label: 'Ads Story 1080×1920',  group: 'Google Ads', platform: 'ads', w: 1080, h: 1920, icon: '▯' },
  // Google Display Network (banners)
  { id: 'gdn_medium',      label: 'Medium Rect 300×250',  group: 'GDN Banner', platform: 'banner', w: 300,  h: 250, icon: '◻' },
  { id: 'gdn_large',       label: 'Large Rect 336×280',   group: 'GDN Banner', platform: 'banner', w: 336,  h: 280, icon: '◻' },
  { id: 'gdn_leaderboard', label: 'Leaderboard 728×90',   group: 'GDN Banner', platform: 'banner', w: 728,  h: 90,  icon: '▬' },
  { id: 'gdn_mobile',      label: 'Mobile Banner 320×50', group: 'GDN Banner', platform: 'banner', w: 320,  h: 50,  icon: '▬' },
  { id: 'gdn_skyscraper',  label: 'Skyscraper 160×600',   group: 'GDN Banner', platform: 'banner', w: 160,  h: 600, icon: '▯' },
  { id: 'gdn_half',        label: 'Half Page 300×600',    group: 'GDN Banner', platform: 'banner', w: 300,  h: 600, icon: '▯' },
  { id: 'gdn_billboard',   label: 'Billboard 970×250',    group: 'GDN Banner', platform: 'banner', w: 970,  h: 250, icon: '▬' },
];

const LEGAL_TEXT = 'B/2021/000560, E/2022/000028';

// Build a creative prompt from variant + style
function buildCreativePrompt(variant, style, customPrompt) {
  if (customPrompt && customPrompt.trim()) return customPrompt.trim();

  const headline = variant.headline.replace(/\n/g, ' ');

  const stylePrompts = {
    neon: `Dark cyberpunk background with electric neon teal (#2DB5A8) and magenta glows, dramatic light rays, futuristic grid lines, bokeh particles. Context: "${headline}". Dark atmospheric tech aesthetic, no text, no people, ultra detailed.`,
    bold: `Bold flat graphic design background, high contrast geometric shapes, strong teal (#2DB5A8) and charcoal color blocks, abstract arrows and dynamic diagonal lines suggesting growth and transformation. No text, no faces. For a webinar ad: "${headline}".`,
    drama: `Cinematic photorealistic dark dramatic scene, professional speaker on stage spotlight, conference hall silhouette, ultra-wide dramatic lighting, deep shadows, teal accent light. No visible text. Ad concept: career transformation.`,
    glass: `3D glassmorphism technology background, floating translucent panels, chrome spheres, soft teal gradient light, depth of field blur, premium corporate tech aesthetic. Subtle data visualization in background. No text.`,
    thumb: `YouTube thumbnail style background, bold high energy composition, dramatic split lighting, vibrant teal and dark slate, strong directional light rays, dynamic energy lines. Eye-catching click-bait energy. No text, no faces.`,
    editorial: `Magazine editorial background, luxury dark matte texture, minimal geometric accent lines in teal, premium print aesthetic, subtle paper grain, sophisticated dark layout with negative space. Corporate B2B feel.`,
  };

  return stylePrompts[style] || stylePrompts.bold;
}

// Build a STUDIO AI prompt — text is baked in by Nano Banana Pro
function buildStudioAIPrompt(variant, settings, format, customPrompt) {
  if (customPrompt && customPrompt.trim()) return customPrompt.trim();

  const headline = variant.headline.replace(/\n/g, ' ');
  const subline = variant.subline || '';
  const cta = settings.cta || 'Regisztrálj fel rá!';
  const label = variant.label;
  const platform = settings.platform || 'fb';
  const isAds = platform === 'ads';
  const isBanner = platform === 'banner';

  // Detect shape from size
  const w = format?.w || 1080, h = format?.h || 1080;
  const isTall = h > w * 1.3;
  const isWide = w > h * 1.5;
  const isUltra = w > h * 3;

  // Background-only prompt: atmospheric visual, no text or overlays baked into the image
  const atmosphereByTheme = label.toLowerCase().includes('ai') || label.toLowerCase().includes('career')
    ? 'Modern tech atmosphere: abstract geometric shapes, digital particles, flowing data streams, or subtle futuristic elements'
    : label.toLowerCase().includes('business')
    ? 'Professional corporate environment: office space, architectural lines, sophisticated lighting, business dynamics'
    : label.toLowerCase().includes('growth') || label.toLowerCase().includes('transform')
    ? 'Dynamic upward motion: ascending lines, growth curves, light rays suggesting progress and transformation'
    : 'Modern editorial: abstract forms, sophisticated shapes, artistic color blocking';

  const colorContext = settings.accent && settings.accent !== '#2DB5A8'
    ? `accent light in color ${settings.accent}`
    : 'accent light in teal (#2DB5A8)';

  const compositionalGuide = isUltra
    ? 'Ultra-wide horizontal: photo fills entire width, subtle horizontal flow of visual elements'
    : isTall
    ? 'Vertical tall: rich atmospheric top 70%, gradually fading to darker bottom area for text overlay'
    : isWide
    ? 'Horizontal landscape: visual elements distributed across, stronger on right side, darkens to left for text'
    : 'Square balanced: atmospheric elements centered-to-right, left side darker for text overlay';

  return `Atmospheric BACKGROUND IMAGE ONLY for professional webinar ad. NO TEXT, NO BADGES, NO LOGOS, NO CTA — background only.

Theme: Hungarian tech/career webinar about AI and professional development.
Visual mood: ${atmosphereByTheme}
Color palette: Dark professional base (#0B1013–#1C2529 gradient) with ${colorContext}
Photography/illustration style: Editorial, sophisticated, artistic lighting and composition
Composition: ${compositionalGuide}

Design notes:
• BACKGROUND IMAGE ONLY — absolutely no text, headlines, badges, logos, CTA buttons, or UI elements in the image
• Premium, trustworthy, professional B2B aesthetic
• Strong visual depth and atmospheric quality suitable for tech/career industry
• High contrast areas where white text will overlay (preserve darker zones for text legibility)
• Works as backdrop for layered text and UI elements on top

Format: ${w}×${h}px`;
}

Object.assign(window, { VARIANTS, CTA_OPTIONS, LAYOUT_OPTIONS, AD_FORMATS, LEGAL_TEXT, buildCreativePrompt, buildStudioAIPrompt });
