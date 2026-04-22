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

  const shapeDesc = isUltra
    ? `Ultra-wide banner format ${w}×${h}px. Horizontal composition with logo on left, big headline center, CTA right. Minimal photo.`
    : isTall
    ? `Vertical ${w}×${h}px. Photo top 65%, strong gradient fade to near-black bottom. Text block bottom third.`
    : isWide
    ? `Horizontal ${w}×${h}px. Photo right half, solid dark left panel with text. Split layout.`
    : `Square ${w}×${h}px. Photo right 55%, dark panel left with text. Premium split.`;

  const textBlock = isAds
    ? `EXACT TEXT TO RENDER (pixel-perfect legible, GOOGLE ADS = SHORT + BIG):
• Top-left small: small Mentor Klub logo (leave space)
• Main headline (HUGE, extra bold 800, white, fills most of the canvas): "${headline}"
• CTA text below (bold, teal #2DB5A8): "${cta}"
• Bottom-right tiny legal text (10px, 40% white): "B/2021/000560, E/2022/000028"
NO subline, NO label text, NO badge pill. Keep text minimal and impactful.`
    : isBanner
    ? `EXACT TEXT TO RENDER (banner — ultra compact):
• Left: small Mentor Klub logo
• Center: bold headline "${headline}" (one line if possible)
• Right: teal CTA "${cta}"
• Bottom-right tiny: "B/2021/000560, E/2022/000028"`
    : `EXACT TEXT TO RENDER (FACEBOOK = allows longer text):
• Top-left: small discrete Mentor Klub logo
• Badge pill: "INGYENES WEBINÁR" — white text on solid teal (#2DB5A8) pill
• Main headline (large, extra bold 800, white): "${headline}"
${subline ? `• Subline (medium, teal #2DB5A8): "${subline}"` : ''}
• Small label (gray): "${label}"
• Thin teal horizontal rule (3px)
• CTA (bold, teal #2DB5A8): "${cta}"
• Bottom-right tiny legal text (10px, 40% white): "B/2021/000560, E/2022/000028"`;

  return `Professional ${isAds ? 'Google Ads' : isBanner ? 'Google Display banner' : 'Facebook'} ad creative for a Hungarian webinar. ${shapeDesc}

${textBlock}

TYPOGRAPHY: Plus Jakarta Sans, extra bold 800 headlines. Professional hierarchy.
COLORS: Dark slate background (#0B1013 to #1C2529 gradient), teal accent #2DB5A8, white headlines, gray supporting text.
STYLE: Premium B2B Hungarian webinar ad. Dark, professional, trustworthy. No stock photo clichés.
LEGAL: Always include tiny "B/2021/000560, E/2022/000028" bottom-right corner.
FORMAT: ${w}×${h}px.`;
}

Object.assign(window, { VARIANTS, CTA_OPTIONS, LAYOUT_OPTIONS, AD_FORMATS, LEGAL_TEXT, buildCreativePrompt, buildStudioAIPrompt });
