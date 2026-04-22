// Creative Mode canvas renderer — bold, thumbnail-energy layouts.
// Uses AI-generated bg image + aggressive typography.

const CREATIVE_STYLES = [
  { id: 'neon',     label: 'Neon Cyber',    accent: '#00FFE5', overlay: 'rgba(0,10,20,0.55)' },
  { id: 'bold',     label: 'Bold Flat',     accent: '#2DB5A8', overlay: 'rgba(8,12,14,0.52)' },
  { id: 'drama',    label: 'Cinematic',     accent: '#2DB5A8', overlay: 'rgba(5,8,10,0.60)' },
  { id: 'glass',    label: '3D Tech Glass', accent: '#4ECDC4', overlay: 'rgba(6,12,18,0.50)' },
  { id: 'thumb',    label: 'YT Bomb',       accent: '#FFE93D', overlay: 'rgba(6,10,12,0.48)' },
  { id: 'editorial',label: 'Editorial',     accent: '#2DB5A8', overlay: 'rgba(4,7,9,0.65)' },
];

function hexToRgbC(hex) {
  const m = (hex || '#2DB5A8').replace('#','').match(/.{2}/g);
  return m ? { r: parseInt(m[0],16), g: parseInt(m[1],16), b: parseInt(m[2],16) } : { r: 45, g: 181, b: 168 };
}

function drawRoundRectC(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r, y); ctx.lineTo(x+w-r, y);
  ctx.quadraticCurveTo(x+w, y, x+w, y+r);
  ctx.lineTo(x+w, y+h-r);
  ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
  ctx.lineTo(x+r, y+h);
  ctx.quadraticCurveTo(x, y+h, x, y+h-r);
  ctx.lineTo(x, y+r);
  ctx.quadraticCurveTo(x, y, x+r, y);
  ctx.closePath();
}

function wrapTextC(ctx, text, maxWidth) {
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
}

const renderCreative_creative = (canvas, variant, settings, images, sizeOrFormat) => {
  let W, H;
  if (typeof sizeOrFormat === 'object' && sizeOrFormat.w) {
    W = sizeOrFormat.w; H = sizeOrFormat.h;
  } else {
    W = 1080; H = sizeOrFormat === '9:16' ? 1920 : 1080;
  }
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const isTall = H > W;

  const styleId = settings.creativeStyle || 'bold';
  const styleDef = CREATIVE_STYLES.find(s => s.id === styleId) || CREATIVE_STYLES[1];
  const accent = styleDef.accent;
  const accentRGB = hexToRgbC(accent);

  // ---- Base dark bg ----
  ctx.fillStyle = '#060A0D';
  ctx.fillRect(0, 0, W, H);

  // ---- AI-generated background image ----
  if (images.creative) {
    const scale = Math.max(W / images.creative.width, H / images.creative.height);
    const sw = images.creative.width * scale;
    const sh = images.creative.height * scale;
    ctx.drawImage(images.creative, (W - sw) / 2, (H - sh) / 2, sw, sh);
  }

  // ---- Style-specific overlay treatment ----
  if (styleId === 'neon') {
    // Vignette + neon glow
    const vig = ctx.createRadialGradient(W/2, H/2, H*0.2, W/2, H/2, H*0.85);
    vig.addColorStop(0, 'rgba(0,10,20,0.0)');
    vig.addColorStop(1, 'rgba(0,5,12,0.85)');
    ctx.fillStyle = vig;
    ctx.fillRect(0,0,W,H);
    // bottom solid fade
    const botFade = ctx.createLinearGradient(0, H*0.55, 0, H);
    botFade.addColorStop(0, 'rgba(0,8,16,0)');
    botFade.addColorStop(1, 'rgba(0,8,16,0.95)');
    ctx.fillStyle = botFade;
    ctx.fillRect(0, H*0.55, W, H*0.45);
    // neon scan line
    ctx.strokeStyle = `rgba(${accentRGB.r},${accentRGB.g},${accentRGB.b},0.15)`;
    ctx.lineWidth = 1;
    for (let y = 0; y < H; y += 6) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  } else if (styleId === 'thumb') {
    // Strong diagonal split
    const splitX = W * 0.52;
    const leftFade = ctx.createLinearGradient(0, 0, splitX + 100, 0);
    leftFade.addColorStop(0, 'rgba(6,10,12,0.88)');
    leftFade.addColorStop(0.6, 'rgba(6,10,12,0.4)');
    leftFade.addColorStop(1, 'rgba(6,10,12,0)');
    ctx.fillStyle = leftFade;
    ctx.fillRect(0, 0, splitX + 100, H);
    const botFade = ctx.createLinearGradient(0, H*0.6, 0, H);
    botFade.addColorStop(0, 'rgba(6,10,12,0)');
    botFade.addColorStop(1, 'rgba(6,10,12,0.92)');
    ctx.fillStyle = botFade;
    ctx.fillRect(0, H*0.6, W, H*0.4);
  } else {
    // Standard overlay + bottom fade for all other styles
    ctx.fillStyle = styleDef.overlay;
    ctx.fillRect(0, 0, W, H);
    const botFade = ctx.createLinearGradient(0, H * (isTall ? 0.52 : 0.4), 0, H);
    botFade.addColorStop(0, 'rgba(6,10,12,0)');
    botFade.addColorStop(1, 'rgba(6,10,12,0.97)');
    ctx.fillStyle = botFade;
    ctx.fillRect(0, H * (isTall ? 0.52 : 0.4), W, H);
    // Top fade for badge contrast
    const topFade = ctx.createLinearGradient(0, 0, 0, isTall ? 240 : 180);
    topFade.addColorStop(0, 'rgba(6,10,12,0.7)');
    topFade.addColorStop(1, 'rgba(6,10,12,0)');
    ctx.fillStyle = topFade;
    ctx.fillRect(0, 0, W, isTall ? 240 : 180);
  }

  // ---- Style-specific graphic elements ----
  if (styleId === 'editorial') {
    // Thin accent lines
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.4;
    ctx.beginPath(); ctx.moveTo(60, H * 0.46); ctx.lineTo(W - 60, H * 0.46); ctx.stroke();
    ctx.globalAlpha = 1;
  } else if (styleId === 'glass') {
    // Floating translucent panel behind text area
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#FFFFFF';
    drawRoundRectC(ctx, 50, H * 0.55, W - 100, H * 0.38, 12);
    ctx.fill();
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1;
    drawRoundRectC(ctx, 50, H * 0.55, W - 100, H * 0.38, 12);
    ctx.stroke();
    ctx.restore();
  } else if (styleId === 'neon') {
    // Neon horizontal bar
    ctx.save();
    ctx.globalAlpha = 0.7;
    const neonBar = ctx.createLinearGradient(0, 0, W, 0);
    neonBar.addColorStop(0, 'transparent');
    neonBar.addColorStop(0.3, accent);
    neonBar.addColorStop(0.7, accent);
    neonBar.addColorStop(1, 'transparent');
    ctx.fillStyle = neonBar;
    ctx.fillRect(0, H * 0.6 - 1, W, 2);
    ctx.restore();
  }

  // ---- Badge pill ----
  const sideP = isTall ? 60 : 50;
  if (settings.showBadge !== false) {
    const pillY = isTall ? 64 : 52;
    const pillH = isTall ? 56 : 50;
    ctx.font = `700 ${isTall ? 25 : 23}px "Plus Jakarta Sans", sans-serif`;
    const badgeText = styleId === 'thumb' ? '🔥 INGYENES WEBINÁR' : 'INGYENES WEBINÁR';
    const textW = ctx.measureText(badgeText).width;
    const padX = 22;
    const pillW = textW + padX * 2;

    if (styleId === 'neon') {
      // glowing pill
      ctx.save();
      ctx.shadowColor = accent;
      ctx.shadowBlur = 20;
      ctx.fillStyle = 'rgba(0,255,229,0.12)';
      drawRoundRectC(ctx, sideP, pillY, pillW, pillH, 4);
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.5;
      drawRoundRectC(ctx, sideP, pillY, pillW, pillH, 4);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();
      ctx.fillStyle = accent;
    } else {
      ctx.fillStyle = accent;
      drawRoundRectC(ctx, sideP, pillY, pillW, pillH, 4);
      ctx.fill();
      ctx.fillStyle = styleId === 'thumb' ? '#0A0A0A' : '#060A0D';
    }
    ctx.font = `700 ${isTall ? 25 : 23}px "Plus Jakarta Sans", sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    if (styleId === 'neon') ctx.fillStyle = accent;
    ctx.fillText(badgeText, sideP + padX, pillY + pillH / 2 + 1);
  }

  // Date
  if (settings.dateText?.trim()) {
    const dY = (isTall ? 64 : 52) + (isTall ? 56 : 50) + 18;
    ctx.font = `500 ${isTall ? 22 : 20}px "DM Sans", sans-serif`;
    ctx.fillStyle = accent;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('◆ ' + settings.dateText.trim(), sideP, dY);
  }

  // ---- Headline (bold, big) ----
  const maxTW = styleId === 'thumb' && !isTall ? W * 0.54 : W - sideP * 2;
  const hSize = isTall
    ? (styleId === 'thumb' ? 110 : 100)
    : (styleId === 'thumb' ? 72 : 80);
  const hLineH = hSize * 1.02;

  ctx.font = `800 ${hSize}px "Plus Jakarta Sans", sans-serif`;
  const hLines = wrapTextC(ctx, variant.headline, maxTW);

  const sSize = isTall ? 42 : 34;
  const sLineH = sSize * 1.18;
  let sLines = [];
  if (variant.subline) {
    ctx.font = `600 ${sSize}px "DM Sans", sans-serif`;
    sLines = wrapTextC(ctx, variant.subline, maxTW);
  }

  const labSize = isTall ? 27 : 22;
  const labLineH = labSize * 1.35;
  ctx.font = `500 ${labSize}px "DM Sans", sans-serif`;
  const labLines = wrapTextC(ctx, variant.label, maxTW);

  const ctaSize = isTall ? 44 : 36;
  const gapHS = 20, gapSLab = 28, ruleH = 3, gapRule = 20, gapCta = 24;

  const blockH =
    hLines.length * hLineH +
    (sLines.length ? gapHS + sLines.length * sLineH : 0) +
    gapSLab + labLines.length * labLineH +
    gapRule + ruleH + gapCta + ctaSize * 1.1;

  const bottomSafe = isTall ? 110 : 90;
  let cy = H - bottomSafe - blockH;

  // Headline with style-specific treatment
  ctx.font = `800 ${hSize}px "Plus Jakarta Sans", sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  if (styleId === 'neon') {
    ctx.save();
    ctx.shadowColor = accent;
    ctx.shadowBlur = 24;
    ctx.fillStyle = '#FFFFFF';
    for (const line of hLines) { ctx.fillText(line, sideP, cy); cy += hLineH; }
    ctx.restore();
  } else if (styleId === 'thumb') {
    // White text with heavy black shadow (YouTube style)
    ctx.save();
    ctx.strokeStyle = 'rgba(0,0,0,0.9)';
    ctx.lineWidth = hSize * 0.12;
    ctx.lineJoin = 'round';
    for (const line of hLines) {
      ctx.strokeText(line, sideP, cy);
      cy += hLineH;
    }
    cy -= hLines.length * hLineH;
    ctx.fillStyle = '#FFFFFF';
    for (const line of hLines) { ctx.fillText(line, sideP, cy); cy += hLineH; }
    ctx.restore();
  } else {
    ctx.fillStyle = '#FFFFFF';
    if (images.creative) { ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 18; }
    for (const line of hLines) { ctx.fillText(line, sideP, cy); cy += hLineH; }
    ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
  }

  // Subline
  if (sLines.length) {
    cy += gapHS - hLineH * 0.1;
    ctx.font = `600 ${sSize}px "DM Sans", sans-serif`;
    ctx.fillStyle = accent;
    if (styleId === 'neon') { ctx.save(); ctx.shadowColor = accent; ctx.shadowBlur = 12; }
    for (const line of sLines) { ctx.fillText(line, sideP, cy); cy += sLineH; }
    if (styleId === 'neon') ctx.restore();
  }

  // Label
  cy += gapSLab - (sLines.length ? sLineH * 0.1 : hLineH * 0.1);
  ctx.font = `500 ${labSize}px "DM Sans", sans-serif`;
  ctx.fillStyle = styleId === 'neon' ? 'rgba(200,230,230,0.75)' : '#B8C2C6';
  for (const line of labLines) { ctx.fillText(line, sideP, cy); cy += labLineH; }

  // Rule
  cy += gapRule - labLineH * 0.1;
  if (styleId === 'neon') { ctx.save(); ctx.shadowColor = accent; ctx.shadowBlur = 10; }
  ctx.fillStyle = accent;
  ctx.fillRect(sideP, cy, isTall ? 100 : 84, ruleH);
  if (styleId === 'neon') ctx.restore();
  cy += ruleH + gapCta;

  // CTA
  ctx.font = `700 ${ctaSize}px "Plus Jakarta Sans", sans-serif`;
  if (styleId === 'neon') { ctx.save(); ctx.shadowColor = accent; ctx.shadowBlur = 16; }
  ctx.fillStyle = accent;
  ctx.fillText(settings.cta || 'Regisztrálj fel rá!', sideP, cy);
  if (styleId === 'neon') ctx.restore();

  // Logo
  if (images.logo) {
    const lMaxW = isTall ? 240 : 180;
    const lMaxH = isTall ? 80 : 64;
    const asp = images.logo.width / images.logo.height;
    let lw = lMaxW, lh = lMaxW / asp;
    if (lh > lMaxH) { lh = lMaxH; lw = lMaxH * asp; }
    const lx = W - sideP - lw;
    const ly = H - bottomSafe - lh + 4;
    ctx.globalAlpha = 0.9;
    ctx.drawImage(images.logo, lx, ly, lw, lh);
    ctx.globalAlpha = 1;
  }

  // Legal (required by Hungarian regulation — bottom-left, small, with dark pill for legibility)
  const legalFS = Math.max(11, Math.round(14 * Math.max(W, H) / 1080));
  ctx.font = `500 ${legalFS}px "DM Sans", sans-serif`;
  const legalText = 'B/2021/000560, E/2022/000028';
  const lw = ctx.measureText(legalText).width;
  const lpad = Math.round(legalFS * 0.55);
  const lbx = sideP;
  const lby = H - Math.round(bottomSafe * 0.55) - legalFS - lpad;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  drawRoundRectC(ctx, lbx, lby, lw + lpad * 2, legalFS + lpad * 1.4, 3);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText(legalText, lbx + lpad, lby + lpad * 0.6);
};

Object.assign(window, { CREATIVE_STYLES, renderCreative_creative });
