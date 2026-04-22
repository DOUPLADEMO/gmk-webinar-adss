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

function getTheme(settings) {
  const isLight = settings.theme === 'light';
  return {
    isLight,
    textPrimary: isLight ? '#0B1013' : '#FFFFFF',
    textSecondary: isLight ? '#4B5458' : '#B8C2C6',
    textSubline: '#2DB5A8',
    bgGradientTop: isLight ? '#FFFFFF' : '#1C2529',
    bgGradientBottom: isLight ? '#E8ECEE' : '#0B1013',
    bgSolid: isLight ? '#F5F7F8' : '#0B1013',
    overlayGradient: isLight ? [
      { pos: 0, color: 'rgba(255,255,255,0.15)' },
      { pos: 0.5, color: 'rgba(255,255,255,0.35)' },
      { pos: 1, color: 'rgba(255,255,255,0.55)' }
    ] : [
      { pos: 0, color: 'rgba(11,16,19,0.2)' },
      { pos: 0.5, color: 'rgba(11,16,19,0.5)' },
      { pos: 1, color: 'rgba(11,16,19,0.8)' }
    ],
    overlayFull: isLight ? [
      { pos: 0, color: 'rgba(255,255,255,0.1)' },
      { pos: 0.5, color: 'rgba(255,255,255,0.3)' },
      { pos: 1, color: 'rgba(255,255,255,0.5)' }
    ] : [
      { pos: 0, color: 'rgba(11,16,19,0.3)' },
      { pos: 0.5, color: 'rgba(11,16,19,0.6)' },
      { pos: 1, color: 'rgba(11,16,19,0.9)' }
    ],
    overlayBottomFade: isLight ? [
      { pos: 0, color: 'rgba(255,255,255,0)' },
      { pos: 0.4, color: 'rgba(255,255,255,0.2)' },
      { pos: 1, color: 'rgba(255,255,255,0.5)' }
    ] : [
      { pos: 0, color: 'rgba(11,16,19,0)' },
      { pos: 0.4, color: 'rgba(11,16,19,0.3)' },
      { pos: 1, color: 'rgba(11,16,19,0.9)' }
    ],
    overlaySideFade: isLight ? [
      { pos: 0, color: 'rgba(255,255,255,0.3)' },
      { pos: 1, color: 'rgba(255,255,255,0)' }
    ] : [
      { pos: 0, color: 'rgba(11,16,19,0.8)' },
      { pos: 1, color: 'rgba(11,16,19,0)' }
    ],
    overlayBottomShadow: isLight ? [
      { pos: 0, color: 'rgba(255,255,255,0)' },
      { pos: 1, color: 'rgba(255,255,255,0.7)' }
    ] : [
      { pos: 0, color: 'rgba(11,16,19,0)' },
      { pos: 1, color: 'rgba(11,16,19,0.95)' }
    ],
    overlayTopVignette: isLight ? [
      { pos: 0, color: 'rgba(255,255,255,0.4)' },
      { pos: 1, color: 'rgba(255,255,255,0)' }
    ] : [
      { pos: 0, color: 'rgba(11,16,19,0.5)' },
      { pos: 1, color: 'rgba(11,16,19,0)' }
    ],
    solidSide: isLight ? '#FFFFFF' : '#0B1013',
    ctaBg: isLight ? '#0B1013' : '#2DB5A8',
    ctaText: isLight ? '#FFFFFF' : '#0B1013',
    badgeBg: '#2DB5A8',
    badgeText: isLight ? '#FFFFFF' : '#0B1013',
    legalBackingFill: isLight ? 'rgba(255,255,255,0.7)' : 'rgba(11,16,19,0.55)',
    legalText: isLight ? 'rgba(11,16,19,0.85)' : 'rgba(255,255,255,0.85)',
    grainColor: isLight ? '#000' : '#FFF',
    textShadow: isLight ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
    logoAlpha: isLight ? 0.95 : 0.85,
  };
}

function applyGradientStops(gradient, stops, opacityPercent = 100) {
  const opacityMult = Math.max(0, Math.min(100, opacityPercent)) / 100;
  for (const stop of stops) {
    const color = stop.color;
    const rgba = color.match(/rgba?\(([^)]+)\)/);
    if (rgba && color.startsWith('rgba')) {
      const parts = rgba[1].split(',').map((v, i) => i < 3 ? v.trim() : parseFloat(v.trim()) * opacityMult);
      const newColor = `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${parts[3]})`;
      gradient.addColorStop(stop.pos, newColor);
    } else {
      gradient.addColorStop(stop.pos, color);
    }
  }
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
      applyGradientStops(ov, theme.overlayFull, settings.overlayOpacity);
      ctx.fillStyle = ov; ctx.fillRect(0,0,W,H);
    } else if (layout === 'hero') {
      if (isTall) {
        // Photo top 72%, fade to solid
        const photoH = Math.round(H * 0.72);
        drawCoverImage(ctx, images.bg, 0, 0, W, photoH, 0.5, focalY);
        const fade = ctx.createLinearGradient(0, photoH*0.45, 0, photoH);
        applyGradientStops(fade, theme.overlayBottomFade, settings.overlayOpacity);
        ctx.fillStyle = fade; ctx.fillRect(0, photoH*0.45, W, photoH*0.55+1);
        ctx.fillStyle = theme.solidSide; ctx.fillRect(0, photoH, W, H-photoH);
        // top vignette
        const topV = ctx.createLinearGradient(0,0,0,H*0.18);
        applyGradientStops(topV, theme.overlayTopVignette, settings.overlayOpacity);
        ctx.fillStyle = topV; ctx.fillRect(0,0,W,H*0.18);
      } else {
        // Shape-aware split: square → photo 52%, landscape → photo 55%
        const photoFrac = shape === 'square' ? 0.52 : 0.55;
        const photoX = Math.round(W * (1 - photoFrac));
        drawCoverImage(ctx, images.bg, photoX, 0, W-photoX, H, 0.5, focalY);
        const fade = ctx.createLinearGradient(photoX-60, 0, photoX+300, 0);
        applyGradientStops(fade, theme.overlaySideFade, settings.overlayOpacity);
        ctx.fillStyle = fade; ctx.fillRect(photoX-60, 0, 360, H);
        ctx.fillStyle = theme.solidSide; ctx.fillRect(0, 0, photoX-60, H);
        // Bottom shadow
        const bot = ctx.createLinearGradient(0, H-H*0.22, 0, H);
        applyGradientStops(bot, theme.overlayBottomShadow, settings.overlayOpacity);
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
    ctx.shadowColor = theme.textShadow; ctx.shadowBlur=18;
  }
  for (const line of hLines) { ctx.fillText(line, sideP, cy); cy+=hLineH; }
  ctx.shadowBlur=0; ctx.shadowColor='transparent';

  // Subline (FB only)
  if (sLines.length) {
    cy += g1 - hLineH*0.1;
    ctx.font = `500 ${sSize}px "DM Sans", sans-serif`;
    ctx.fillStyle = accent;
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
  // Subtle teal glow
  ctx.save();
  ctx.shadowColor = `rgba(${accentRGB.r},${accentRGB.g},${accentRGB.b},0.35)`;
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

  // Unified scaling: all dimensions scale proportionally to banner height
  // Base height: 250px (reference for small rects, billboards)
  const bannerScale = H / 250;

  // Background — use portrait/AI image if available, otherwise gradient
  if (images.bg) {
    // Draw background image with focal point
    const focalY = settings.focalY ?? 0.35;
    drawCoverImage(ctx, images.bg, 0, 0, W, H, 0.5, focalY);
    // Add overlay for text readability (theme-aware)
    const ov = ctx.createLinearGradient(0, 0, 0, H);
    applyGradientStops(ov, theme.overlayFull, settings.overlayOpacity);
    ctx.fillStyle = ov; ctx.fillRect(0,0,W,H);
  } else {
    // Fallback: theme gradient background
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, theme.bgGradientTop);
    bg.addColorStop(1, theme.bgGradientBottom);
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  }

  // Subtle teal accent glow corner
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
    // Base sizes (reference: typical leaderboard at 90px tall)
    const basePad = 4;
    const baseHeadlineFS = 16;
    const baseDotRadius = 3;
    const baseCtaPadX = 6;
    const baseCtaPadY = 3;

    const pad = Math.round(basePad * bannerScale);
    const midY = H / 2;
    const fs = Math.round(baseHeadlineFS * bannerScale);
    const dotRadius = Math.round(baseDotRadius * bannerScale);
    let x = pad;

    // Logo left (if present)
    if (images.logo) {
      const lH = Math.round(H * 0.55);
      const asp = images.logo.width / images.logo.height;
      const lW = lH * asp;
      ctx.globalAlpha = theme.logoAlpha;
      if (theme.isLight) ctx.filter = 'invert(1)';
      ctx.drawImage(images.logo, x, (H - lH) / 2, lW, lH);
      ctx.filter = 'none';
      ctx.globalAlpha = 1;
      x += lW + Math.round(H * 0.25);
    } else {
      // Teal dot marker
      ctx.fillStyle = accent;
      ctx.beginPath(); ctx.arc(x + dotRadius * 1.5, midY, dotRadius, 0, Math.PI * 2); ctx.fill();
      x += dotRadius * 5;
    }

    // CTA pill right with responsive sizing
    const ctaFontSize = Math.round(fs * 0.85);
    const ctaPadX = Math.round(baseCtaPadX * bannerScale);
    const ctaPadY = Math.round(baseCtaPadY * bannerScale);
    ctx.font = `700 ${ctaFontSize}px "Plus Jakarta Sans", sans-serif`;
    const ctaTW = ctx.measureText(ctaText).width;
    const ctaBtnW = ctaTW + ctaPadX * 2;
    const ctaBtnH = ctaFontSize + ctaPadY * 2;
    const ctaX = Math.max(x + pad * 5, W - pad - ctaBtnW);
    const ctaY = (H - ctaBtnH) / 2;
    ctx.fillStyle = theme.ctaBg;
    drawRoundRect(ctx, ctaX, ctaY, ctaBtnW, ctaBtnH, Math.round(ctaBtnH * 0.4));
    ctx.fill();
    ctx.fillStyle = theme.ctaText;
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.fillText(ctaText, ctaX + ctaPadX, ctaY + ctaBtnH / 2 + 1);

    // Headline (no truncation, just display as much as fits naturally)
    const headlineMaxW = Math.max(20, ctaX - x - pad);
    ctx.font = `700 ${fs}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = theme.textPrimary;
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.fillText(shortHeadline, x, midY);
    return;
  }

  // ===== BILLBOARD (970×250, wide rect): horizontal split =====
  if (isBillboard) {
    const basePad = 30;
    const baseHeadlineFS = 60;
    const baseBadgeFS = 15;
    const baseCtaFS = 35;
    const baseLegalFS = 20;
    const baseLogoH = 40;

    const pad = Math.round(basePad * bannerScale);

    // Logo top-left small
    if (images.logo) {
      const lH = Math.round(baseLogoH * bannerScale);
      const asp = images.logo.width / images.logo.height;
      const lW = lH * asp;
      ctx.globalAlpha = theme.logoAlpha;
      if (theme.isLight) ctx.filter = 'invert(1)';
      ctx.drawImage(images.logo, pad, pad, lW, lH);
      ctx.filter = 'none';
      ctx.globalAlpha = 1;
    }

    // Badge below logo
    const badgeFS = Math.round(baseBadgeFS * bannerScale);
    ctx.font = `700 ${badgeFS}px "Plus Jakarta Sans", sans-serif`;
    const badgeText = 'INGYENES WEBINÁR';
    const badgeTW = ctx.measureText(badgeText).width;
    const badgeH = Math.round(badgeFS * 1.8);
    const badgeY = pad + (images.logo ? Math.round(baseLogoH * bannerScale) + Math.round(10 * bannerScale) : 0);
    const badgeX = pad;
    ctx.fillStyle = theme.badgeBg;
    drawRoundRect(ctx, badgeX, badgeY, badgeTW + Math.round(18 * bannerScale), badgeH, Math.round(3 * bannerScale));
    ctx.fill();
    ctx.fillStyle = theme.badgeText;
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.fillText(badgeText, badgeX + Math.round(9 * bannerScale), badgeY + badgeH / 2 + 1);

    // Headline
    const hFS = Math.round(baseHeadlineFS * bannerScale);
    ctx.font = `800 ${hFS}px "Plus Jakarta Sans", sans-serif`;
    const headlineMaxW = W * 0.55 - pad * 1.5;
    const hLines = wrapText(ctx, shortHeadline, headlineMaxW).slice(0, 2);
    const hBlockH = hLines.length * hFS * 1.08;
    let hy = (H - hBlockH) / 2;
    ctx.fillStyle = theme.textPrimary; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    for (const line of hLines) { ctx.fillText(line, pad, hy); hy += hFS * 1.08; }

    // CTA pill right
    const ctaFS = Math.round(baseCtaFS * bannerScale);
    const ctaPadX = Math.round(ctaFS * 0.8);
    const ctaPadY = Math.round(ctaFS * 0.4);
    ctx.font = `700 ${ctaFS}px "Plus Jakarta Sans", sans-serif`;
    const ctaTW = ctx.measureText(ctaText).width;
    const ctaBtnW = ctaTW + ctaPadX * 2;
    const ctaBtnH = ctaFS + ctaPadY * 2;
    const ctaX = W - pad - ctaBtnW;
    const ctaY = (H - ctaBtnH) / 2;
    ctx.fillStyle = theme.ctaBg;
    drawRoundRect(ctx, ctaX, ctaY, ctaBtnW, ctaBtnH, Math.round(ctaBtnH * 0.4));
    ctx.fill();
    ctx.fillStyle = theme.ctaText;
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.fillText(ctaText, ctaX + ctaPadX, ctaY + ctaBtnH / 2 + 1);

    // Legal
    const legalFS = Math.round(baseLegalFS * bannerScale);
    ctx.font = `500 ${legalFS}px "DM Sans", sans-serif`;
    ctx.fillStyle = theme.textSecondary;
    ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
    ctx.fillText(legal, W - pad, H - pad * 0.5);
    ctx.textAlign = 'left';
    return;
  }

  // ===== SKYSCRAPER (160×600, 300×600): vertical stack =====
  if (isTall) {
    const basePad = 30;
    const baseLogoW = 195;
    const baseBadgeFS = 20;
    const baseHeadlineFS = 36;
    const baseCtaFS = 30;
    const baseLegalFS = 18;
    const baseGap = 10;

    const pad = Math.round(basePad * bannerScale);
    const safeTop = pad;
    const safeBottom = H - pad;

    // Logo top
    let yCursor = safeTop;
    if (images.logo) {
      const lW = Math.round(baseLogoW * bannerScale);
      const asp = images.logo.width / images.logo.height;
      const lH = Math.round(lW / asp);
      ctx.globalAlpha = theme.logoAlpha;
      if (theme.isLight) ctx.filter = 'invert(1)';
      ctx.drawImage(images.logo, (W - lW) / 2, yCursor, lW, lH);
      ctx.filter = 'none';
      ctx.globalAlpha = 1;
      yCursor += lH + Math.round(10 * bannerScale);
    }

    // Badge
    const badgeFS = Math.round(baseBadgeFS * bannerScale);
    const badgePadX = Math.round(14 * bannerScale);
    const badgeH = Math.round(badgeFS * 1.8);
    ctx.font = `700 ${badgeFS}px "Plus Jakarta Sans", sans-serif`;
    const badgeText = 'INGYENES WEBINÁR';
    const badgeTW = ctx.measureText(badgeText).width;
    ctx.fillStyle = theme.badgeBg;
    drawRoundRect(ctx, (W - badgeTW - badgePadX * 2) / 2, yCursor, badgeTW + badgePadX * 2, badgeH, Math.round(3 * bannerScale));
    ctx.fill();
    ctx.fillStyle = theme.badgeText;
    ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    ctx.fillText(badgeText, W / 2, yCursor + badgeH / 2 + 1);
    yCursor += badgeH + Math.round(baseGap * bannerScale);

    // CTA button sizing
    const ctaFS = Math.round(baseCtaFS * bannerScale);
    const ctaPadX = Math.round(ctaFS * 0.65);
    const ctaPadY = Math.round(ctaFS * 0.35);
    ctx.font = `700 ${ctaFS}px "Plus Jakarta Sans", sans-serif`;
    const ctaTW = ctx.measureText(ctaText).width;
    const ctaBtnW = ctaTW + ctaPadX * 2;
    const ctaBtnH = ctaFS + ctaPadY * 2;

    // Legal and CTA spacing
    const legalFS = Math.round(baseLegalFS * bannerScale);
    const legalSpace = legalFS + Math.round(16 * bannerScale);
    const ctaY = safeBottom - ctaBtnH - legalSpace;

    // Headline — fits in available space
    const headlineAreaTop = yCursor;
    const headlineAreaBottom = ctaY - Math.round(10 * bannerScale);
    const headlineAreaH = Math.max(0, headlineAreaBottom - headlineAreaTop);

    const hFS = Math.round(baseHeadlineFS * bannerScale);
    ctx.font = `800 ${hFS}px "Plus Jakarta Sans", sans-serif`;
    const hLines = wrapText(ctx, shortHeadline, W - pad * 2);
    const hBlockH = hLines.length * hFS * 1.08;
    let hy = headlineAreaTop + Math.max(0, (headlineAreaH - hBlockH) / 2);
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
    ctx.fillStyle = theme.textSecondary;
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText(legal, W / 2, safeBottom);
    ctx.textAlign = 'left';
    return;
  }

  // ===== SMALL RECT (300×250, 336×280): compact centered =====
  {
    const basePad = 20;
    const baseLogoH = 25;
    const baseBadgeFS = 20;
    const baseHeadlineFS = 42;
    const baseCtaFS = 28;
    const baseLegalFS = 16;

    const pad = Math.round(basePad * bannerScale);
    const safeTop = pad;
    const safeBottom = H - pad;

    // Logo top-left
    let logoBottomY = safeTop;
    if (images.logo) {
      const lH = Math.round(baseLogoH * bannerScale);
      const asp = images.logo.width / images.logo.height;
      const lW = lH * asp;
      ctx.globalAlpha = theme.logoAlpha;
      if (theme.isLight) ctx.filter = 'invert(1)';
      ctx.drawImage(images.logo, pad, safeTop, lW, lH);
      ctx.filter = 'none';
      ctx.globalAlpha = 1;
      logoBottomY = safeTop + lH;
    }

    // Badge top-right
    const badgeFS = Math.round(baseBadgeFS * bannerScale);
    const badgePadX = Math.round(12 * bannerScale);
    const badgeH = Math.round(badgeFS * 1.8);
    const badgeY = safeTop;
    ctx.font = `700 ${badgeFS}px "Plus Jakarta Sans", sans-serif`;
    const badgeText = 'INGYENES WEBINÁR';
    const badgeTW = ctx.measureText(badgeText).width;
    ctx.fillStyle = theme.badgeBg;
    drawRoundRect(ctx, W - pad - badgeTW - badgePadX * 2, badgeY, badgeTW + badgePadX * 2, badgeH, Math.round(3 * bannerScale));
    ctx.fill();
    ctx.fillStyle = theme.badgeText;
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.fillText(badgeText, W - pad - badgeTW - badgePadX, badgeY + badgeH / 2 + 1);

    // CTA and legal sizing
    const ctaFS = Math.round(baseCtaFS * bannerScale);
    const ctaPadX = Math.round(ctaFS * 0.7);
    const ctaPadY = Math.round(ctaFS * 0.35);
    ctx.font = `700 ${ctaFS}px "Plus Jakarta Sans", sans-serif`;
    const ctaTW = ctx.measureText(ctaText).width;
    const ctaBtnW = ctaTW + ctaPadX * 2;
    const ctaBtnH = ctaFS + ctaPadY * 2;
    const legalFS = Math.round(baseLegalFS * bannerScale);
    const legalSpace = legalFS + Math.round(12 * bannerScale);
    const ctaY = safeBottom - ctaBtnH - legalSpace;

    // Headline centered
    const headlineTop = Math.max(logoBottomY, badgeY + badgeH) + Math.round(14 * bannerScale);
    const headlineBottom = ctaY - Math.round(8 * bannerScale);
    const headlineAreaH = Math.max(0, headlineBottom - headlineTop);

    const hFS = Math.round(baseHeadlineFS * bannerScale);
    ctx.font = `800 ${hFS}px "Plus Jakarta Sans", sans-serif`;
    const hLines = wrapText(ctx, shortHeadline, W - pad * 2);
    const hBlockH = hLines.length * hFS * 1.08;
    let hy = headlineTop + Math.max(0, (headlineAreaH - hBlockH) / 2);
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

    // Legal
    ctx.font = `500 ${legalFS}px "DM Sans", sans-serif`;
    ctx.fillStyle = theme.textSecondary;
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
  ctx.globalAlpha = theme ? theme.logoAlpha : 0.85;
  // Invert logo in light mode for visibility
  if (theme?.isLight) ctx.filter = 'invert(1)';
  // Place top-left with proper margin
  ctx.drawImage(logo, sideP, bottomSafe, lw, lh);
  ctx.filter = 'none';
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
  ctx.fillStyle = theme ? theme.legalBackingFill : 'rgba(11,16,19,0.55)';
  const bx = W - pad - tw - 8;
  const by = H - pad - fs - 4;
  drawRoundRect(ctx, bx, by, tw + 16, fs + 8, 4);
  ctx.fill();
  ctx.fillStyle = theme ? theme.legalText : 'rgba(255,255,255,0.85)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText(text, W - pad, H - pad);
  ctx.textAlign = 'left';
}

// Renders AI-generated full creative — just image + logo
const renderCreative_studioAI = (canvas, variant, settings, images, sizeOrFormat) => {
  // SAME LAYOUT AS renderCreative, but background = AI-generated image (images.studioAI)
  // This ensures pixel-identical composition — only the background changes.
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

  // ---------- BASE BACKGROUND (use AI image instead of gradient) ----------
  if (images.studioAI) {
    // Fill entire canvas with AI image (full-bleed style)
    drawCoverImage(ctx, images.studioAI, 0, 0, W, H, 0.5, focalY);
    // Add overlay for text readability
    const ov = ctx.createLinearGradient(0, 0, 0, H);
    applyGradientStops(ov, theme.overlayFull, settings.overlayOpacity);
    ctx.fillStyle = ov; ctx.fillRect(0,0,W,H);
  } else {
    // Fallback: gradient background if no AI image
    const baseGrad = ctx.createLinearGradient(0, 0, W * (isWide ? 1 : 0), H);
    baseGrad.addColorStop(0, theme.bgGradientTop);
    baseGrad.addColorStop(1, theme.bgGradientBottom);
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, W, H);
  }

  // ---------- GDN BANNER LAYOUT (all sizes) ----------
  if (settings.platform === 'banner' || isUltrawide) {
    renderBannerLayout(ctx, canvas, variant, settings, { ...images, bg: images.studioAI }, W, H, accent, S, LS);
    return;
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
  if (layout === 'hero' && !isTall && images.studioAI) {
    const textFrac = shape === 'square' ? 0.48 : 0.45;
    maxTW = W * textFrac - sideP * 1.4;
  } else {
    maxTW = W - sideP * 2;
  }

  // Sizes scaled to canvas. For landscape formats, use long-side scale (LS)
  const TS = isWide ? LS * 0.72 : S;  // text-scale
  const hSize  = Math.round(Math.max(22, (isTall ? 88 : 74) * TS));
  const sSize  = Math.round(Math.max(14, (isTall ? 40 : 34) * TS));
  const labSize = Math.round(Math.max(10, (isTall ? 26 : 22) * TS));
  const ctaSize = Math.round(Math.max(14, (isTall ? 40 : 34) * TS));
  const pillH  = Math.round(Math.max(22, (isTall ? 54 : 48) * TS));
  const pillFS = Math.round(Math.max(10, (isTall ? 24 : 22) * TS));
  const ruleH  = Math.max(2, Math.round(3 * S));

  // Logo top-left (small, discrete)
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

  // Date — positioned relative to badge
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

  // Platform: 'fb' = allow subline/label, 'ads' = headline + CTA only
  const platform = settings.platform || 'fb';
  const isAds = platform === 'ads';
  renderLogo(ctx, images.logo, W, H, sideP, logoBottomSafe, S, theme);

  // Headline size: MUCH bigger on 'ads'
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

  // Pill button adds padding
  const _ctaSizeForH = isAds
    ? Math.round(Math.max(18, (isTall ? 54 : 46) * TS))
    : ctaSize;
  const _ctaBtnH = _ctaSizeForH + Math.round(_ctaSizeForH * 0.55) * 2;

  const blockH = hLines.length*hLineH
    + (sLines.length ? g1 + sLines.length*sLineH : 0)
    + (labLines.length ? g2 + labLines.length*labLineH : 0)
    + g3 + ruleH + g4 + _ctaBtnH;

  // Reserve space at bottom for legal text
  const legalSpace = Math.round(18 * S);
  let cy = H - bottomSafe - legalSpace - blockH;

  // Headline
  ctx.font = `800 ${hSizeFinal}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillStyle = theme.textPrimary; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  if (images.studioAI && (layout==='full-bleed'||(!isTall&&layout==='hero'))) {
    ctx.shadowColor = theme.textShadow; ctx.shadowBlur=18;
  }
  for (const line of hLines) { ctx.fillText(line, sideP, cy); cy+=hLineH; }
  ctx.shadowBlur=0; ctx.shadowColor='transparent';

  // Subline (FB only)
  if (sLines.length) {
    cy += g1 - hLineH*0.1;
    ctx.font = `500 ${sSize}px "DM Sans", sans-serif`;
    ctx.fillStyle = accent;
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
  // Subtle teal glow
  ctx.save();
  ctx.shadowColor = `rgba(${accentRGB.r},${accentRGB.g},${accentRGB.b},0.35)`;
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

Object.assign(window, { renderCreative, wrapText, renderCreative_studioAI });
