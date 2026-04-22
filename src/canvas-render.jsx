// Canvas rendering — works for any W×H ad format.
// Scales all sizes relative to the smaller canvas dimension.

const wrapText = (ctx, text, maxWidth) => {
  const paragraphs = text.split('\n');
  const lines = [];
  for (const para of paragraphs) {
    const words = para.split(' ');
    let line = '';
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word; }
      else line = test;
    }
    if (line) lines.push(line);
  }
  return lines;
};

const drawRoundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x+r, y); ctx.lineTo(x+w-r, y);
  ctx.quadraticCurveTo(x+w, y, x+w, y+r);
  ctx.lineTo(x+w, y+h-r);
  ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
  ctx.lineTo(x+r, y+h); ctx.quadraticCurveTo(x, y+h, x, y+h-r);
  ctx.lineTo(x, y+r); ctx.quadraticCurveTo(x, y, x+r, y);
  ctx.closePath();
};

const drawCoverImage = (ctx, img, dx, dy, dw, dh, focalX=0.5, focalY=0.35) => {
  if (!img) return;
  const scale = Math.max(dw / img.width, dh / img.height);
  const w = img.width * scale, h = img.height * scale;
  ctx.drawImage(img, dx + (dw-w)*focalX, dy + (dh-h)*focalY, w, h);
};

function hexToRgb(hex) {
  const m = (hex||'#2DB5A8').replace('#','').match(/.{2}/g);
  return m ? {r:parseInt(m[0],16),g:parseInt(m[1],16),b:parseInt(m[2],16)} : {r:45,g:181,b:168};
}

// Theme colors — dark (default) or light
function getTheme(settings) {
  const accent = settings.accent || '#2DB5A8';
  const headlineOverride = settings.headlineColor || null;
  if (settings.theme === 'light') {
    return {
      isLight: true,
      // Text colors
      textPrimary: headlineOverride || '#0B1013',       // headline
      textSecondary: '#4B5458',     // label
      textSubline: accent,          // subline (keep accent)
      // Base background (fallback when no image)
      bgGradientTop: '#FFFFFF',
      bgGradientBottom: '#E8ECEE',
      bgSolid: '#F5F7F8',
      // Overlay colors for background images (light, lets image show through)
      overlayGradient: [
        [0,    'rgba(255,255,255,0.3)'],
        [0.35, 'rgba(255,255,255,0.45)'],
        [0.7,  'rgba(255,255,255,0.75)'],
        [1,    'rgba(255,255,255,0.92)'],
      ],
      overlayFull: [
        [0,    'rgba(255,255,255,0.4)'],
        [0.5,  'rgba(255,255,255,0.55)'],
        [1,    'rgba(255,255,255,0.8)'],
      ],
      overlayBottomFade: [
        [0,   'rgba(255,255,255,0)'],
        [0.5, 'rgba(255,255,255,0.6)'],
        [1,   'rgba(255,255,255,1)'],
      ],
      overlaySideFade: [
        [0,   '#FFFFFF'],
        [0.5, 'rgba(255,255,255,0.65)'],
        [1,   'rgba(255,255,255,0)'],
      ],
      overlayBottomShadow: [
        [0, 'rgba(255,255,255,0)'],
        [1, 'rgba(255,255,255,0.7)'],
      ],
      overlayTopVignette: [
        [0, 'rgba(255,255,255,0.55)'],
        [1, 'rgba(255,255,255,0)'],
      ],
      solidSide: '#FFFFFF',
      // CTA
      ctaBg: '#0B1013',
      ctaText: '#FFFFFF',
      // Badge
      badgeBg: accent,
      badgeText: '#FFFFFF',
      // Legal text
      legalBackingFill: 'rgba(255,255,255,0.7)',
      legalText: 'rgba(11,16,19,0.85)',
      // Grain
      grainColor: '#000',
      // Drop shadow for headline over image
      textShadow: 'rgba(255,255,255,0.6)',
      // Logo opacity
      logoAlpha: 0.95,
    };
  }
  // Dark theme (default)
  return {
    isLight: false,
    textPrimary: headlineOverride || '#FFFFFF',
    textSecondary: '#B8C2C6',
    textSubline: accent,
    bgGradientTop: '#1C2529',
    bgGradientBottom: '#0B1013',
    bgSolid: '#0B1013',
    overlayGradient: [
      [0,    'rgba(11,16,19,0.35)'],
      [0.35, 'rgba(11,16,19,0.5)'],
      [0.7,  'rgba(11,16,19,0.88)'],
      [1,    'rgba(11,16,19,0.98)'],
    ],
    overlayFull: [
      [0,   'rgba(11,16,19,0.4)'],
      [0.5, 'rgba(11,16,19,0.65)'],
      [1,   'rgba(11,16,19,0.85)'],
    ],
    overlayBottomFade: [
      [0,   'rgba(11,16,19,0)'],
      [0.5, 'rgba(11,16,19,0.6)'],
      [1,   'rgba(11,16,19,1)'],
    ],
    overlaySideFade: [
      [0,   '#0B1013'],
      [0.5, 'rgba(11,16,19,0.65)'],
      [1,   'rgba(11,16,19,0)'],
    ],
    overlayBottomShadow: [
      [0, 'rgba(11,16,19,0)'],
      [1, 'rgba(11,16,19,0.7)'],
    ],
    overlayTopVignette: [
      [0, 'rgba(11,16,19,0.55)'],
      [1, 'rgba(11,16,19,0)'],
    ],
    solidSide: '#0B1013',
    ctaBg: accent,
    ctaText: '#0B1013',
    badgeBg: accent,
    badgeText: '#0B1013',
    legalBackingFill: 'rgba(11,16,19,0.55)',
    legalText: 'rgba(255,255,255,0.85)',
    grainColor: '#FFF',
    textShadow: 'rgba(0,0,0,0.5)',
    logoAlpha: 0.85,
  };
}

function applyGradientStops(gradient, stops) {
  for (const [pos, color] of stops) gradient.addColorStop(pos, color);
  return gradient;
}

// Classify format shape for layout decisions
function classifyFormat(W, H) {
  const ratio = W / H;
  if (ratio > 5)    return 'ultrawide';   // 728×90, 970×250
  if (ratio > 2)    return 'wide';        // 970×250 borderline
  if (ratio > 1.5)  return 'landscape';   // 1200×628
  if (ratio > 0.9)  return 'square';      // 1080×1080
  if (ratio > 0.55) return 'portrait';    // 1080×1350, 300×600
  return 'tall';                          // 1080×1920, 160×600
}

const renderCreative = (canvas, variant, settings, images, sizeOrFormat) => {
  // Accept either legacy string ('1:1','9:16') or AD_FORMATS entry {w,h}
  let W, H;
  if (typeof sizeOrFormat === 'object' && sizeOrFormat.w) {
    W = sizeOrFormat.w; H = sizeOrFormat.h;
  } else {
    W = 1080; H = sizeOrFormat === '9:16' ? 1920 : 1080;
  }
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  const shape = classifyFormat(W, H);
  const isUltrawide = shape === 'ultrawide';
  const isWide = shape === 'wide' || shape === 'landscape';
  const isTall = shape === 'tall' || shape === 'portrait';

  const accent = settings.accent || '#2DB5A8';
  const accentRGB = hexToRgb(accent);
  const layout = settings.layout || 'hero';
  const focalY = settings.focalY ?? 0.35;
  const theme = getTheme(settings);

  // Scale factor relative to 1080px reference
  const S = Math.min(W, H) / 1080;
  const LS = Math.max(W, H) / 1080; // long-side scale

  // ---------- BASE BACKGROUND ----------
  const baseGrad = ctx.createLinearGradient(0, 0, W * (isWide ? 1 : 0), H);
  baseGrad.addColorStop(0, theme.bgGradientTop);
  baseGrad.addColorStop(1, theme.bgGradientBottom);
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, W, H);

  // ---------- GDN BANNER LAYOUT (all sizes: 300×250, 336×280, 728×90, 320×50, 160×600, 300×600, 970×250) ----------
  if (settings.platform === 'banner' || isUltrawide) {
    renderBannerLayout(ctx, canvas, variant, settings, images, W, H, accent, S, LS);
    return;
  }

  // ---------- PHOTO PLACEMENT ----------
  if (images.bg) {
    if (layout === 'full-bleed') {
      drawCoverImage(ctx, images.bg, 0, 0, W, H, 0.5, focalY);
      const ov = ctx.createLinearGradient(0, 0, 0, H);
      applyGradientStops(ov, theme.overlayGradient);
      ctx.fillStyle = ov; ctx.fillRect(0,0,W,H);
    } else if (layout === 'hero') {
      if (isTall) {
        // Photo top 72%, fade to slate
        const photoH = Math.round(H * 0.72);
        drawCoverImage(ctx, images.bg, 0, 0, W, photoH, 0.5, focalY);
        const fade = ctx.createLinearGradient(0, photoH*0.45, 0, photoH);
        applyGradientStops(fade, theme.overlayBottomFade);
        ctx.fillStyle = fade; ctx.fillRect(0, photoH*0.45, W, photoH*0.55+1);
        ctx.fillStyle = theme.solidSide; ctx.fillRect(0, photoH, W, H-photoH);
        // top vignette
        const topV = ctx.createLinearGradient(0,0,0,H*0.18);
        applyGradientStops(topV, theme.overlayTopVignette);
        ctx.fillStyle = topV; ctx.fillRect(0,0,W,H*0.18);
      } else {
        // Shape-aware split: square → photo 52%, landscape → photo 55%
        const photoFrac = shape === 'square' ? 0.52 : 0.55;
        const photoX = Math.round(W * (1 - photoFrac));
        drawCoverImage(ctx, images.bg, photoX, 0, W-photoX, H, 0.5, focalY);
        const fade = ctx.createLinearGradient(photoX-60, 0, photoX+300, 0);
        applyGradientStops(fade, theme.overlaySideFade);
        ctx.fillStyle = fade; ctx.fillRect(photoX-60, 0, 360, H);
        ctx.fillStyle = theme.solidSide; ctx.fillRect(0, 0, photoX-60, H);
        // Bottom shadow
        const bot = ctx.createLinearGradient(0, H-H*0.22, 0, H);
        applyGradientStops(bot, theme.overlayBottomShadow);
        ctx.fillStyle = bot; ctx.fillRect(0, H-H*0.22, W, H*0.22);
      }
    } else if (layout === 'circle') {
      const r = Math.round(Math.min(W,H) * (isTall ? 0.22 : 0.18));
      const margin = Math.round(W * 0.065);
      const cx = W - margin - r;
      const cy = isTall ? Math.round(H * 0.175) : Math.round(H * 0.245);
      // glow
      const g = ctx.createRadialGradient(cx,cy,r*0.3,cx,cy,r*1.7);
      g.addColorStop(0,`rgba(${accentRGB.r},${accentRGB.g},${accentRGB.b},0.28)`);
      g.addColorStop(1,`rgba(${accentRGB.r},${accentRGB.g},${accentRGB.b},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx,cy,r*1.7,0,Math.PI*2); ctx.fill();
      ctx.save();
      ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.clip();
      drawCoverImage(ctx, images.bg, cx-r, cy-r, r*2, r*2, 0.5, 0.3);
      ctx.restore();
      ctx.strokeStyle = accent; ctx.lineWidth = Math.max(3, 5*S);
      ctx.beginPath(); ctx.arc(cx,cy,r+3,0,Math.PI*2); ctx.stroke();
    }
  }

  // Accent glow in text area
  const glow = ctx.createRadialGradient(W*0.12, H*0.85, 0, W*0.12, H*0.85, W*0.5);
  glow.addColorStop(0,`rgba(${accentRGB.r},${accentRGB.g},${accentRGB.b},0.12)`);
  glow.addColorStop(1,`rgba(${accentRGB.r},${accentRGB.g},${accentRGB.b},0)`);
  ctx.fillStyle = glow; ctx.fillRect(0,0,W,H);

  // ---------- TEXT BLOCK ----------
  const sideP = Math.round(W * 0.065);
  const bottomSafe = Math.round(H * (isTall ? 0.055 : 0.075));
  // Text column width depends on shape
  let maxTW;
  if (layout === 'hero' && !isTall && images.bg) {
    const textFrac = shape === 'square' ? 0.48 : 0.45;
    maxTW = W * textFrac - sideP * 1.4;
  } else {
    maxTW = W - sideP * 2;
  }

  // Sizes scaled to canvas. For landscape formats, use long-side scale (LS) so headlines
  // don't shrink relative to the wider canvas. For square/tall, use S (min side).
  const TS = isWide ? LS * 0.72 : S;  // text-scale
  const hSize  = Math.round(Math.max(22, (isTall ? 88 : 74) * TS));
  const sSize  = Math.round(Math.max(14, (isTall ? 40 : 34) * TS));
  const labSize = Math.round(Math.max(10, (isTall ? 26 : 22) * TS));
  const ctaSize = Math.round(Math.max(14, (isTall ? 40 : 34) * TS));
  const pillH  = Math.round(Math.max(22, (isTall ? 54 : 48) * TS));
  const pillFS = Math.round(Math.max(10, (isTall ? 24 : 22) * TS));
  const ruleH  = Math.max(2, Math.round(3 * S));

  // Logo top-left (small, discrete) — render FIRST so we know its height
  const logoBottomSafe = Math.round(H * 0.05);
  const logoH = renderLogo(ctx, images.logo, W, H, sideP, logoBottomSafe, S, theme);

  // Badge — position BELOW logo if logo present, else use old top position
  if (settings.showBadge !== false) {
    const gap = Math.round(24 * S);
    const pillX = sideP;
    const pillY = images.logo
      ? logoBottomSafe + logoH + gap
      : Math.round(H * 0.055);
    ctx.font = `700 ${pillFS}px "Plus Jakarta Sans", sans-serif`;
    const ptw = ctx.measureText('INGYENES WEBINÁR').width;
    const padX = Math.round(18 * S);
    const pillW = ptw + padX * 2;
    ctx.fillStyle = theme.badgeBg;
    drawRoundRect(ctx, pillX, pillY, pillW, pillH, 4);
    ctx.fill();
    ctx.fillStyle = theme.badgeText;
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.fillText('INGYENES WEBINÁR', pillX+padX, pillY+pillH/2+1);
  }

  // Date — positioned relative to badge (which itself is below logo)
  if (settings.dateText?.trim()) {
    const gap = Math.round(24 * S);
    const pillY = images.logo
      ? logoBottomSafe + logoH + gap
      : Math.round(H * 0.055);
    const dY = pillY + pillH + Math.round(16*S);
    ctx.font = `500 ${Math.round(Math.max(10,(isTall?22:20)*S))}px "DM Sans", sans-serif`;
    ctx.fillStyle = accent; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('◆ '+settings.dateText.trim(), sideP, dY);
  }

  // Platform: 'fb' = allow subline/label, 'ads' = headline + CTA only (big), else 'fb'
  const platform = settings.platform || 'fb';
  const isAds = platform === 'ads';
  renderLogo(ctx, images.logo, W, H, sideP, logoBottomSafe, S, theme);

  // Headline size: MUCH bigger on 'ads' (short text, high impact)
  const hSizeFinal = isAds
    ? Math.round(Math.max(28, (isTall ? 112 : 96) * S))
    : hSize;

  // Compute block
  ctx.font = `800 ${hSizeFinal}px "Plus Jakarta Sans", sans-serif`;
  const hLines = wrapText(ctx, variant.headline, maxTW);
  ctx.font = `500 ${sSize}px "DM Sans", sans-serif`;
  const sLines = (!isAds && variant.subline) ? wrapText(ctx, variant.subline, maxTW) : [];
  ctx.font = `500 ${labSize}px "DM Sans", sans-serif`;
  const labLines = isAds ? [] : wrapText(ctx, variant.label, maxTW);

  const hLineH = hSizeFinal * 1.05, sLineH = sSize * 1.2, labLineH = labSize * 1.35;
  const g1=Math.round(22*S), g2=Math.round(30*S), g3=Math.round(20*S), g4=Math.round(24*S);

  // Pill button adds padding around the ctaSize label
  const _ctaSizeForH = isAds
    ? Math.round(Math.max(18, (isTall ? 54 : 46) * TS))
    : ctaSize;
  const _ctaBtnH = _ctaSizeForH + Math.round(_ctaSizeForH * 0.55) * 2;

  const blockH = hLines.length*hLineH
    + (sLines.length ? g1 + sLines.length*sLineH : 0)
    + (labLines.length ? g2 + labLines.length*labLineH : 0)
    + g3 + ruleH + g4 + _ctaBtnH;

  // Reserve space at bottom for legal text (~20px)
  const legalSpace = Math.round(18 * S);
  let cy = H - bottomSafe - legalSpace - blockH;

  // Headline
  ctx.font = `800 ${hSizeFinal}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillStyle = theme.textPrimary; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  if (images.bg && (layout==='full-bleed'||(!isTall&&layout==='hero'))) {
    ctx.shadowColor = theme.textShadow; ctx.shadowBlur = 18;
  }
  for (const line of hLines) { ctx.fillText(line, sideP, cy); cy+=hLineH; }
  ctx.shadowBlur=0; ctx.shadowColor='transparent';

  // Subline (FB only)
  if (sLines.length) {
    cy += g1 - hLineH*0.1;
    ctx.font = `500 ${sSize}px "DM Sans", sans-serif`;
    ctx.fillStyle = theme.textSubline;
    for (const line of sLines) { ctx.fillText(line, sideP, cy); cy+=sLineH; }
  }

  // Label (FB only)
  if (labLines.length) {
    cy += g2 - (sLines.length?sLineH:hLineH)*0.1;
    ctx.font = `500 ${labSize}px "DM Sans", sans-serif`;
    ctx.fillStyle = theme.textSecondary;
    for (const line of labLines) { ctx.fillText(line, sideP, cy); cy+=labLineH; }
  }

  // Rule
  cy += g3 - (labLines.length?labLineH:(sLines.length?sLineH:hLineH))*0.1;
  ctx.fillStyle = accent;
  ctx.fillRect(sideP, cy, Math.round((isTall?96:80)*S), ruleH);
  cy += ruleH + g4;

  // CTA — filled pill button
  const ctaSizeFinal = isAds
    ? Math.round(Math.max(18, (isTall ? 54 : 46) * TS))
    : ctaSize;
  const ctaText = settings.cta || 'Regisztrálj fel rá!';
  ctx.font = `700 ${ctaSizeFinal}px "Plus Jakarta Sans", sans-serif`;
  const ctaTW = ctx.measureText(ctaText).width;
  const ctaPadX = Math.round(ctaSizeFinal * 0.85);
  const ctaPadY = Math.round(ctaSizeFinal * 0.55);
  const ctaBtnW = ctaTW + ctaPadX * 2;
  const ctaBtnH = ctaSizeFinal + ctaPadY * 2;
  const ctaRadius = Math.round(ctaBtnH * 0.5); // fully rounded pill
  // Subtle glow
  ctx.save();
  const ctaShadowRGB = theme.isLight ? {r:11,g:16,b:19} : accentRGB;
  ctx.shadowColor = `rgba(${ctaShadowRGB.r},${ctaShadowRGB.g},${ctaShadowRGB.b},0.35)`;
  ctx.shadowBlur = Math.round(24 * TS);
  ctx.shadowOffsetY = Math.round(8 * TS);
  ctx.fillStyle = theme.ctaBg;
  drawRoundRect(ctx, sideP, cy, ctaBtnW, ctaBtnH, ctaRadius);
  ctx.fill();
  ctx.restore();
  // Label
  ctx.fillStyle = theme.ctaText;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText(ctaText, sideP + ctaPadX, cy + ctaBtnH / 2 + 1);
  ctx.textBaseline = 'top';

  // Legal text bottom-right (mandatory)
  renderLegalText(ctx, W, H, S, false, theme);

  // Grain
  if (settings.grain !== false && W*H < 3000000) {
    ctx.save(); ctx.globalAlpha = 0.03; ctx.fillStyle = theme.grainColor;
    const N = Math.floor((W*H)/5000);
    for (let i=0;i<N;i++) ctx.fillRect(Math.random()*W, Math.random()*H, 1, 1);
    ctx.restore();
  }
};

// Banner layout for GDN ultrawide/skyscraper formats
// Supports background images (portrait or AI-generated) with text overlay
function renderBannerLayout(ctx, canvas, variant, settings, images, W, H, accent, S, LS) {
  const ratio = W / H;
  const area = W * H;
  // Super-wide leaderboards (320×50, 728×90) — single horizontal line
  const isLeaderboard = ratio >= 6 || (H <= 100 && ratio > 3);
  // Tall skyscrapers (160×600, 300×600) — vertical stack
  const isTall = H > W;
  // Billboard (970×250) — wide but has vertical room
  const isBillboard = !isLeaderboard && !isTall && ratio > 2.5;
  // Everything else here is a small rect (300×250, 336×280)
  const accentRGB = hexToRgb(accent);
  const theme = getTheme(settings);

  // Background — use portrait/AI image if available, otherwise theme gradient
  if (images.bg) {
    // Draw background image with focal point
    const focalY = settings.focalY ?? 0.35;
    drawCoverImage(ctx, images.bg, 0, 0, W, H, 0.5, focalY);
    // Add overlay for text readability (dark or light depending on theme)
    const ov = ctx.createLinearGradient(0, 0, 0, H);
    applyGradientStops(ov, theme.overlayFull);
    ctx.fillStyle = ov; ctx.fillRect(0,0,W,H);
  } else {
    // Fallback: theme gradient background
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, theme.bgGradientTop);
    bg.addColorStop(1, theme.bgGradientBottom);
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  }

  // Subtle accent glow corner
  const glow = ctx.createRadialGradient(W, H, 0, W, H, Math.max(W, H) * 0.6);
  glow.addColorStop(0, `rgba(${accentRGB.r},${accentRGB.g},${accentRGB.b},0.12)`);
  glow.addColorStop(1, `rgba(${accentRGB.r},${accentRGB.g},${accentRGB.b},0)`);
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

  // Pick SHORTEST copy variant for banners
  // Try label first (e.g. "Webinár · 2025.02.15"), fallback to first line of headline
  const shortHeadline = variant.headline.split('\n')[0].replace(/,$/, '').trim();
  const ctaText = settings.cta || 'Regisztrálj →';
  const legal = 'B/2021/000560, E/2022/000028';

  // ===== LEADERBOARDS (320×50, 728×90): single horizontal line =====
  if (isLeaderboard) {
    // Very small: use minimal scale factors
    const smallScale = Math.min(W, H) / 50;
    const pad = Math.max(6, Math.round(H * 0.30));
    const midY = H / 2;
    const fs = Math.max(13, Math.round(H * 0.55));
    let x = pad;

    // Logo left (if present) — constrained height with max width
    if (images.logo) {
      const lH = Math.round(Math.min(H * 0.60, H - 4));
      const asp = images.logo.width / images.logo.height;
      let lW = lH * asp;
      lW = Math.min(lW, W * 0.15);
      ctx.globalAlpha = theme.logoAlpha;
      if (theme.isLight) ctx.filter = 'invert(1)';
      ctx.drawImage(images.logo, x, (H - lH) / 2, lW, lH);
      ctx.filter = 'none';
      ctx.globalAlpha = 1;
      x += lW + Math.round(H * 0.30);
    } else {
      // Accent dot marker
      ctx.fillStyle = accent;
      ctx.beginPath(); ctx.arc(x + 4, midY, 3, 0, Math.PI * 2); ctx.fill();
      x += 12;
    }

    // CTA pill right with responsive sizing
    const ctaFontSize = Math.max(11, Math.round(fs * 0.80));
    ctx.font = `700 ${ctaFontSize}px "Plus Jakarta Sans", sans-serif`;
    const ctaTW = ctx.measureText(ctaText).width;
    const ctaPadX = Math.round(ctaFontSize * 0.70);
    const ctaPadY = Math.round(ctaFontSize * 0.40);
    const ctaBtnW = ctaTW + ctaPadX * 2;
    const ctaBtnH = Math.min(H - 2, ctaFontSize + ctaPadY * 2);
    const ctaX = Math.max(x + 40, W - pad - ctaBtnW);
    const ctaY = (H - ctaBtnH) / 2;
    ctx.fillStyle = theme.ctaBg;
    drawRoundRect(ctx, ctaX, ctaY, ctaBtnW, ctaBtnH, Math.round(ctaBtnH * 0.4));
    ctx.fill();
    ctx.fillStyle = theme.ctaText;
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.fillText(ctaText, ctaX + ctaPadX, ctaY + ctaBtnH / 2 + 1);

    // Headline fills remaining space (truncated to fit)
    const headlineMaxW = Math.max(40, ctaX - x - 10);
    ctx.font = `700 ${fs}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = theme.textPrimary;
    const truncated = truncateToWidth(ctx, shortHeadline, headlineMaxW);
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.fillText(truncated, x, midY);
    return;
  }

  // ===== BILLBOARD (970×250, wide rect): horizontal split =====
  if (isBillboard) {
    // Scale based on smaller dimension
    const bScale = H / 250;
    const pad = Math.round(H * 0.16);

    // Logo top-left — larger for visibility
    if (images.logo) {
      const lH = Math.round(H * 0.28);
      const asp = images.logo.width / images.logo.height;
      const lW = Math.min(lH * asp, W * 0.18);
      ctx.globalAlpha = theme.logoAlpha;
      if (theme.isLight) ctx.filter = 'invert(1)';
      ctx.drawImage(images.logo, pad, (H - lH) / 2, lW, lH);
      ctx.filter = 'none';
      ctx.globalAlpha = 1;
    }

    // Tiny badge below logo
    const badgeFS = Math.max(10, Math.round(H * 0.065));
    ctx.font = `700 ${badgeFS}px "Plus Jakarta Sans", sans-serif`;
    const badgeText = 'INGYENES WEBINÁR';
    const badgeTW = ctx.measureText(badgeText).width;
    const badgeH = Math.round(badgeFS * 1.8);
    const badgeX = pad;
    const badgeY = H - pad - badgeH;
    if (badgeTW + 18 <= W * 0.25) {
      ctx.fillStyle = theme.badgeBg;
      drawRoundRect(ctx, badgeX, badgeY, badgeTW + 18, badgeH, 3);
      ctx.fill();
      ctx.fillStyle = theme.badgeText;
      ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      ctx.fillText(badgeText, badgeX + 9, badgeY + badgeH / 2 + 1);
    }

    // Headline — responsive font size, up to 2 lines
    let hFS = Math.max(18, Math.round(H * 0.18));
    ctx.font = `800 ${hFS}px "Plus Jakarta Sans", sans-serif`;
    let headlineMaxW = W * 0.55 - pad * 1.5;
    let hLines = wrapText(ctx, shortHeadline, headlineMaxW);
    while (hLines.length > 2 && hFS > 14) {
      hFS -= 1;
      ctx.font = `800 ${hFS}px "Plus Jakarta Sans", sans-serif`;
      hLines = wrapText(ctx, shortHeadline, headlineMaxW);
    }
    hLines = hLines.slice(0, 2);
    const hBlockH = hLines.length * hFS * 1.08;
    let hy = (H - hBlockH) / 2;
    ctx.fillStyle = theme.textPrimary; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    for (const line of hLines) { ctx.fillText(line, pad, hy); hy += hFS * 1.08; }

    // CTA pill right
    const ctaFS = Math.max(10, Math.round(H * 0.09));
    ctx.font = `700 ${ctaFS}px "Plus Jakarta Sans", sans-serif`;
    const ctaTW = ctx.measureText(ctaText).width;
    const ctaPadX = Math.round(ctaFS * 0.8);
    const ctaPadY = Math.round(ctaFS * 0.4);
    const ctaBtnW = ctaTW + ctaPadX * 2;
    const ctaBtnH = ctaFS + ctaPadY * 2;
    const ctaX = W - pad - ctaBtnW;
    const ctaY = (H - ctaBtnH) / 2;
    ctx.fillStyle = theme.ctaBg;
    drawRoundRect(ctx, ctaX, ctaY, ctaBtnW, ctaBtnH, Math.round(ctaBtnH * 0.4));
    ctx.fill();
    ctx.fillStyle = theme.ctaText;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(ctaText, ctaX + ctaPadX, ctaY + ctaBtnH / 2 + 1);

    // Legal
    const legalFS = Math.max(8, Math.round(H * 0.05));
    ctx.font = `500 ${legalFS}px "DM Sans", sans-serif`;
    ctx.fillStyle = theme.legalText;
    ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
    ctx.fillText(legal, W - pad, H - pad * 0.5);
    ctx.textAlign = 'left';
    return;
  }

  // ===== SKYSCRAPER (160×600, 300×600): vertical stack =====
  if (isTall) {
    // Scale based on width dimension
    const skScale = W / 300;
    const pad = Math.round(W * 0.1);
    const safeTop = pad;
    const safeBottom = H - pad;

    // Logo top
    let yCursor = safeTop;
    if (images.logo) {
      const lW = Math.round(W * 0.65);
      const asp = images.logo.width / images.logo.height;
      const lH = Math.min(lW / asp, Math.round(H * 0.12));
      ctx.globalAlpha = theme.logoAlpha;
      if (theme.isLight) ctx.filter = 'invert(1)';
      ctx.drawImage(images.logo, (W - lW) / 2, yCursor, lW, lH);
      ctx.filter = 'none';
      ctx.globalAlpha = 1;
      yCursor += lH + Math.round(H * 0.02);
    }

    // Badge
    const badgeFS = Math.max(8, Math.round(W * 0.07));
    ctx.font = `700 ${badgeFS}px "Plus Jakarta Sans", sans-serif`;
    const badgeText = 'INGYENES WEBINÁR';
    const badgeTW = ctx.measureText(badgeText).width;
    const badgeH = Math.round(badgeFS * 1.8);
    if (badgeTW + 14 <= W - pad * 2) {
      ctx.fillStyle = theme.badgeBg;
      drawRoundRect(ctx, (W - badgeTW - 14) / 2, yCursor, badgeTW + 14, badgeH, 3);
      ctx.fill();
      ctx.fillStyle = theme.badgeText;
      ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
      ctx.fillText(badgeText, W / 2, yCursor + badgeH / 2 + 1);
      yCursor += badgeH + Math.round(H * 0.025);
    }

    // CTA at bottom (reserve space)
    const ctaFS = Math.max(10, Math.round(W * 0.11));
    ctx.font = `700 ${ctaFS}px "Plus Jakarta Sans", sans-serif`;
    const ctaTW = ctx.measureText(ctaText).width;
    const ctaPadX = Math.round(ctaFS * 0.65);
    const ctaPadY = Math.round(ctaFS * 0.35);
    const ctaBtnW = Math.min(ctaTW + ctaPadX * 2, W - pad * 2);
    const ctaBtnH = ctaFS + ctaPadY * 2;

    // Legal above CTA at bottom
    const legalFS = Math.max(7, Math.round(W * 0.06));
    const legalSpace = legalFS + 8;
    const ctaY = safeBottom - ctaBtnH - legalSpace;

    // Headline — fills middle area
    const headlineAreaTop = yCursor + 6;
    const headlineAreaBottom = ctaY - Math.round(H * 0.02);
    const headlineAreaH = headlineAreaBottom - headlineAreaTop;

    // Start with reasonable font size and shrink if needed
    let hFS = Math.max(13, Math.round(W * 0.12));
    ctx.font = `800 ${hFS}px "Plus Jakarta Sans", sans-serif`;
    let hLines = wrapText(ctx, shortHeadline, W - pad * 2);

    // Shrink if content doesn't fit
    while ((hLines.length * hFS * 1.08) > headlineAreaH && hFS > 10) {
      hFS -= 1;
      ctx.font = `800 ${hFS}px "Plus Jakarta Sans", sans-serif`;
      hLines = wrapText(ctx, shortHeadline, W - pad * 2);
    }
    hLines = hLines.slice(0, Math.max(2, Math.floor(headlineAreaH / (hFS * 1.08))));
    const hBlockH = hLines.length * hFS * 1.08;
    let hy = headlineAreaTop + (headlineAreaH - hBlockH) / 2;
    ctx.fillStyle = theme.textPrimary; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    for (const line of hLines) { ctx.fillText(line, W / 2, hy); hy += hFS * 1.08; }

    // CTA pill
    ctx.fillStyle = theme.ctaBg;
    drawRoundRect(ctx, (W - ctaBtnW) / 2, ctaY, ctaBtnW, ctaBtnH, Math.round(ctaBtnH * 0.4));
    ctx.fill();
    ctx.fillStyle = theme.ctaText;
    ctx.font = `700 ${ctaFS}px "Plus Jakarta Sans", sans-serif`;
    ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    ctx.fillText(ctaText, W / 2, ctaY + ctaBtnH / 2 + 1);

    // Legal
    ctx.font = `500 ${legalFS}px "DM Sans", sans-serif`;
    ctx.fillStyle = theme.legalText;
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText(legal, W / 2, safeBottom);
    ctx.textAlign = 'left';
    return;
  }

  // ===== SMALL RECT (300×250, 336×280): compact centered =====
  {
    const pad = Math.max(10, Math.round(Math.min(W, H) * 0.08));
    const safeTop = pad;
    const safeBottom = H - pad;

    // Logo top-left — constrained size
    let logoBottomY = safeTop;
    if (images.logo) {
      const lH = Math.round(H * 0.12);
      const asp = images.logo.width / images.logo.height;
      let lW = lH * asp;
      // Cap logo width to 40% of container to prevent breaking layout
      lW = Math.min(lW, (W - pad * 2) * 0.4);
      ctx.globalAlpha = theme.logoAlpha;
      if (theme.isLight) ctx.filter = 'invert(1)';
      ctx.drawImage(images.logo, pad, safeTop, lW, lH);
      ctx.filter = 'none';
      ctx.globalAlpha = 1;
      logoBottomY = safeTop + lH;
    }

    // Badge top-right
    const badgeFS = Math.max(8, Math.round(H * 0.06));
    ctx.font = `700 ${badgeFS}px "Plus Jakarta Sans", sans-serif`;
    const badgeText = 'INGYENES WEBINÁR';
    const badgeTW = ctx.measureText(badgeText).width;
    const badgeH = Math.round(badgeFS * 1.8);
    const badgeY = safeTop;
    if (badgeTW + 12 + (logoBottomY > safeTop ? 60 : 0) < W - pad * 2) {
      ctx.fillStyle = theme.badgeBg;
      drawRoundRect(ctx, W - pad - badgeTW - 12, badgeY, badgeTW + 12, badgeH, 3);
      ctx.fill();
      ctx.fillStyle = theme.badgeText;
      ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      ctx.fillText(badgeText, W - pad - badgeTW - 6, badgeY + badgeH / 2 + 1);
    }

    // CTA at bottom
    const ctaFS = Math.max(10, Math.round(H * 0.09));
    ctx.font = `700 ${ctaFS}px "Plus Jakarta Sans", sans-serif`;
    const ctaTW = ctx.measureText(ctaText).width;
    const ctaPadX = Math.round(ctaFS * 0.7);
    const ctaPadY = Math.round(ctaFS * 0.35);
    const ctaBtnW = ctaTW + ctaPadX * 2;
    const ctaBtnH = ctaFS + ctaPadY * 2;
    const legalFS = Math.max(8, Math.round(H * 0.05));
    const legalSpace = legalFS + 6;
    const ctaY = safeBottom - ctaBtnH - legalSpace;

    // Headline centered in middle area
    const headlineTop = Math.max(logoBottomY, badgeY + badgeH) + Math.round(H * 0.035);
    const headlineBottom = ctaY - Math.round(H * 0.02);
    const headlineAreaH = headlineBottom - headlineTop;

    let hFS = Math.max(13, Math.round(H * 0.14));
    ctx.font = `800 ${hFS}px "Plus Jakarta Sans", sans-serif`;
    let hLines = wrapText(ctx, shortHeadline, W - pad * 2);
    while ((hLines.length * hFS * 1.08) > headlineAreaH && hFS > 11) {
      hFS -= 1;
      ctx.font = `800 ${hFS}px "Plus Jakarta Sans", sans-serif`;
      hLines = wrapText(ctx, shortHeadline, W - pad * 2);
    }
    hLines = hLines.slice(0, Math.max(2, Math.floor(headlineAreaH / (hFS * 1.08))));
    const hBlockH = hLines.length * hFS * 1.08;
    let hy = headlineTop + (headlineAreaH - hBlockH) / 2;
    ctx.fillStyle = theme.textPrimary; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    for (const line of hLines) { ctx.fillText(line, W / 2, hy); hy += hFS * 1.08; }

    // CTA pill
    ctx.fillStyle = theme.ctaBg;
    drawRoundRect(ctx, (W - ctaBtnW) / 2, ctaY, ctaBtnW, ctaBtnH, Math.round(ctaBtnH * 0.4));
    ctx.fill();
    ctx.fillStyle = theme.ctaText;
    ctx.font = `700 ${ctaFS}px "Plus Jakarta Sans", sans-serif`;
    ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    ctx.fillText(ctaText, (W - ctaBtnW) / 2 + ctaBtnW / 2, ctaY + ctaBtnH / 2 + 1);

    // Legal bottom-right
    ctx.font = `500 ${legalFS}px "DM Sans", sans-serif`;
    ctx.fillStyle = theme.legalText;
    ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
    ctx.fillText(legal, W - pad, safeBottom);
    ctx.textAlign = 'left';
  }
}

// Truncate text to fit within maxW by appending '…'
function truncateToWidth(ctx, text, maxW) {
  if (ctx.measureText(text).width <= maxW) return text;
  let s = text;
  while (s.length > 3 && ctx.measureText(s + '…').width > maxW) {
    s = s.slice(0, -1);
  }
  return s + '…';
}

function renderLogo(ctx, logo, W, H, sideP, bottomSafe, S, theme) {
  if (!logo) return 0;
  // Discrete: ~6-7% of canvas width, capped
  const lMaxW = Math.round(Math.min(W * 0.14, Math.max(80, 150*S)));
  const lMaxH = Math.round(Math.min(H * 0.08, Math.max(28, 52*S)));
  const asp = logo.width / logo.height;
  let lw = lMaxW, lh = lMaxW/asp;
  if (lh > lMaxH) { lh = lMaxH; lw = lMaxH*asp; }
  ctx.globalAlpha = theme?.logoAlpha ?? 0.85;
  // Place top-left with proper margin
  ctx.drawImage(logo, sideP, bottomSafe, lw, lh);
  ctx.globalAlpha = 1;
  return lh;
}

function renderLegalText(ctx, W, H, S, isTiny, theme) {
  if (isTiny) return; // skip on tiny banners (320x50, 728x90)
  const LS = Math.max(W, H) / 1080;
  const fs = Math.max(11, Math.round(16 * LS));
  const pad = Math.max(10, Math.round(20 * LS));
  ctx.font = `500 ${fs}px "DM Sans", sans-serif`;
  const text = 'B/2021/000560, E/2022/000028';
  const tw = ctx.measureText(text).width;
  // Subtle backing for legibility on any background (e.g. AI-generated images)
  ctx.fillStyle = theme?.legalBackingFill || 'rgba(11,16,19,0.55)';
  const bx = W - pad - tw - 8;
  const by = H - pad - fs - 4;
  drawRoundRect(ctx, bx, by, tw + 16, fs + 8, 4);
  ctx.fill();
  ctx.fillStyle = theme?.legalText || 'rgba(255,255,255,0.85)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText(text, W - pad, H - pad);
  ctx.textAlign = 'left';
}

// Renders AI-generated full creative — just image + logo
const renderCreative_studioAI = (canvas, variant, settings, images, sizeOrFormat) => {
  let W, H;
  if (typeof sizeOrFormat === 'object' && sizeOrFormat.w) {
    W = sizeOrFormat.w; H = sizeOrFormat.h;
  } else {
    W = 1080; H = sizeOrFormat === '9:16' ? 1920 : 1080;
  }
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const S = Math.min(W,H)/1080;
  const theme = getTheme(settings);
  const accentRGB = hexToRgb(settings.accent || '#2DB5A8');

  ctx.fillStyle = theme.bgSolid; ctx.fillRect(0,0,W,H);

  if (images.studioAI) {
    const scale = Math.max(W/images.studioAI.width, H/images.studioAI.height);
    const sw = images.studioAI.width*scale, sh = images.studioAI.height*scale;
    ctx.drawImage(images.studioAI, (W-sw)/2, (H-sh)/2, sw, sh);
  } else {
    const isTall = H > W;
    const g = ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0, theme.bgGradientTop);
    g.addColorStop(1, theme.bgGradientBottom);
    ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
    ctx.font = `600 ${Math.round(Math.max(18,(isTall?38:32)*S))}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = `rgba(${accentRGB.r},${accentRGB.g},${accentRGB.b},0.45)`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('✦ Generálj AI kreatívát', W/2, H/2);
    ctx.font = `400 ${Math.round(Math.max(13,(isTall?24:20)*S))}px "DM Sans", sans-serif`;
    ctx.fillStyle = theme.isLight ? 'rgba(75,84,88,0.55)' : 'rgba(184,194,198,0.35)';
    ctx.fillText('Nano Banana Pro — szöveg beleégetve', W/2, H/2+(isTall?54:44)*S);
    ctx.textAlign='left';
  }

  const sideP = Math.round(W*0.065);
  const bottomSafe = Math.round(H*0.05);
  renderLogo(ctx, images.logo, W, H, sideP, bottomSafe, S, theme);
  renderLegalText(ctx, W, H, S, false, theme);
};

Object.assign(window, { renderCreative, wrapText, renderCreative_studioAI });
