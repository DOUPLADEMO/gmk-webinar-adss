// Canvas rendering — portrait-as-hero aesthetic with smart gradient fades.
// Three layouts: "hero" (big portrait + gradient fade), "full-bleed", "circle badge".

const wrapText = (ctx, text, maxWidth) => {
  const paragraphs = text.split('\n');
  const allLines = [];
  for (const para of paragraphs) {
    const words = para.split(' ');
    let line = '';
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        allLines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) allLines.push(line);
  }
  return allLines;
};

const drawRoundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

// cover-fit with optional focal point (0..1, 0..1). Default center top bias for portraits.
const drawCoverImage = (ctx, img, dx, dy, dw, dh, focalX = 0.5, focalY = 0.35) => {
  if (!img) return;
  const scale = Math.max(dw / img.width, dh / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  const x = dx + (dw - w) * focalX;
  const y = dy + (dh - h) * focalY;
  ctx.drawImage(img, x, y, w, h);
};

const renderCreative = (canvas, variant, settings, images, size) => {
  const W = 1080;
  const H = size === '1:1' ? 1080 : 1920;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const isTall = H > W;
  const accent = settings.accent || '#2DB5A8';
  const layout = settings.layout || 'hero';
  const bgSlateTop = '#1C2529';
  const bgSlateBottom = '#0B1013';
  const focalY = settings.focalY ?? 0.3; // portrait faces tend to be upper-third

  // ---------- Base slate background ----------
  const baseGrad = ctx.createLinearGradient(0, 0, 0, H);
  baseGrad.addColorStop(0, bgSlateTop);
  baseGrad.addColorStop(1, bgSlateBottom);
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, W, H);

  // ---------- Layout-specific portrait placement ----------
  if (images.bg && layout === 'hero') {
    if (isTall) {
      // 9:16 — portrait fills top ~62%, smooth fade into slate at bottom for text
      const photoH = Math.round(H * 0.72);
      ctx.save();
      drawCoverImage(ctx, images.bg, 0, 0, W, photoH, 0.5, focalY);
      ctx.restore();

      // Bottom vignette fade covering lower third
      const fadeStart = photoH * 0.45;
      const fadeEnd = photoH;
      const fade = ctx.createLinearGradient(0, fadeStart, 0, fadeEnd);
      fade.addColorStop(0, 'rgba(11,16,19,0)');
      fade.addColorStop(0.5, 'rgba(11,16,19,0.6)');
      fade.addColorStop(1, 'rgba(11,16,19,1)');
      ctx.fillStyle = fade;
      ctx.fillRect(0, fadeStart, W, fadeEnd - fadeStart + 1);

      // Solid below photo
      ctx.fillStyle = bgSlateBottom;
      ctx.fillRect(0, photoH, W, H - photoH);

      // Subtle top vignette for pill contrast
      const topV = ctx.createLinearGradient(0, 0, 0, 180);
      topV.addColorStop(0, 'rgba(11,16,19,0.55)');
      topV.addColorStop(1, 'rgba(11,16,19,0)');
      ctx.fillStyle = topV;
      ctx.fillRect(0, 0, W, 180);
    } else {
      // 1:1 — portrait on right 58%, fade to slate on left
      const photoX = Math.round(W * 0.42);
      const photoW = W - photoX;
      ctx.save();
      drawCoverImage(ctx, images.bg, photoX, 0, photoW, H, 0.5, focalY);
      ctx.restore();

      // Horizontal fade across left edge of photo
      const fadeStart = photoX - 60;
      const fadeWidth = 360;
      const fade = ctx.createLinearGradient(fadeStart, 0, fadeStart + fadeWidth, 0);
      fade.addColorStop(0, bgSlateBottom);
      fade.addColorStop(0.5, 'rgba(11,16,19,0.7)');
      fade.addColorStop(1, 'rgba(11,16,19,0)');
      ctx.fillStyle = fade;
      ctx.fillRect(fadeStart, 0, fadeWidth, H);

      // Solid left panel under fade
      ctx.fillStyle = bgSlateBottom;
      ctx.fillRect(0, 0, fadeStart, H);

      // Bottom shadow for CTA legibility even over photo area
      const bot = ctx.createLinearGradient(0, H - 240, 0, H);
      bot.addColorStop(0, 'rgba(11,16,19,0)');
      bot.addColorStop(1, 'rgba(11,16,19,0.75)');
      ctx.fillStyle = bot;
      ctx.fillRect(0, H - 240, W, 240);
    }
  } else if (images.bg && layout === 'full-bleed') {
    // Full photo with heavy bottom gradient
    drawCoverImage(ctx, images.bg, 0, 0, W, H, 0.5, focalY);
    const overlay = ctx.createLinearGradient(0, 0, 0, H);
    overlay.addColorStop(0, 'rgba(11,16,19,0.35)');
    overlay.addColorStop(0.35, 'rgba(11,16,19,0.45)');
    overlay.addColorStop(0.7, 'rgba(11,16,19,0.88)');
    overlay.addColorStop(1, 'rgba(11,16,19,0.98)');
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, W, H);
  } else if (images.bg && layout === 'circle') {
    // Circle badge top-right
    const margin = isTall ? 70 : 60;
    const r = isTall ? 230 : 190;
    const cx = W - margin - r;
    const cy = isTall ? 320 : 250;

    // soft glow disk
    const glowG = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r * 1.7);
    glowG.addColorStop(0, 'rgba(45,181,168,0.28)');
    glowG.addColorStop(1, 'rgba(45,181,168,0)');
    ctx.fillStyle = glowG;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    drawCoverImage(ctx, images.bg, cx - r, cy - r, r * 2, r * 2, 0.5, 0.3);
    ctx.restore();

    // turquoise ring
    ctx.strokeStyle = accent;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 3, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Subtle turquoise accent glow in text area
  if (!(layout === 'full-bleed' && images.bg)) {
    const accentRGB = hexToRgb(accent);
    const glow = ctx.createRadialGradient(
      isTall ? W * 0.2 : W * 0.15,
      isTall ? H * 0.85 : H * 0.72,
      0,
      isTall ? W * 0.2 : W * 0.15,
      isTall ? H * 0.85 : H * 0.72,
      W * 0.5
    );
    glow.addColorStop(0, `rgba(${accentRGB.r},${accentRGB.g},${accentRGB.b},0.13)`);
    glow.addColorStop(1, `rgba(${accentRGB.r},${accentRGB.g},${accentRGB.b},0)`);
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
  }

  // ---------- Badge pill top-left ----------
  if (settings.showBadge !== false) {
    const pillX = isTall ? 60 : 50;
    const pillY = isTall ? 60 : 50;
    const pillH = isTall ? 54 : 48;
    ctx.font = `700 ${isTall ? 24 : 22}px "Plus Jakarta Sans", sans-serif`;
    const pillText = 'INGYENES WEBINÁR';
    const textW = ctx.measureText(pillText).width;
    const padX = isTall ? 24 : 20;
    const pillW = textW + padX * 2;
    ctx.fillStyle = accent;
    drawRoundRect(ctx, pillX, pillY, pillW, pillH, 4);
    ctx.fill();
    ctx.fillStyle = '#0B1013';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(pillText, pillX + padX, pillY + pillH / 2 + 1);
  }

  // Date stamp
  if (settings.dateText && settings.dateText.trim()) {
    const dX = isTall ? 60 : 50;
    const dY = (isTall ? 60 : 50) + (isTall ? 54 : 48) + 18;
    ctx.font = `500 ${isTall ? 22 : 20}px "DM Sans", sans-serif`;
    ctx.fillStyle = accent;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('◆ ' + settings.dateText.trim(), dX, dY);
  }

  // ---------- Text block ----------
  const sideP = isTall ? 70 : 60;
  const maxTextW = (layout === 'hero' && !isTall && images.bg)
    ? W * 0.42 - sideP * 1.5  // left column on 1:1 hero
    : W - sideP * 2;
  const bottomSafe = isTall ? 100 : 80;

  // Headline
  const hSize = isTall ? 88 : (layout === 'hero' && !isTall && images.bg ? 58 : 74);
  ctx.font = `800 ${hSize}px "Plus Jakarta Sans", sans-serif`;
  const hLines = wrapText(ctx, variant.headline, maxTextW);
  const hLineH = hSize * 1.05;

  // Subline
  let sLines = [];
  const sSize = isTall ? 40 : (layout === 'hero' && !isTall && images.bg ? 28 : 34);
  const sLineH = sSize * 1.2;
  if (variant.subline) {
    ctx.font = `500 ${sSize}px "DM Sans", sans-serif`;
    sLines = wrapText(ctx, variant.subline, maxTextW);
  }

  // Label
  const labSize = isTall ? 26 : (layout === 'hero' && !isTall && images.bg ? 18 : 22);
  ctx.font = `500 ${labSize}px "DM Sans", sans-serif`;
  const labLines = wrapText(ctx, variant.label, maxTextW);
  const labLineH = labSize * 1.35;

  // CTA
  const ctaSize = isTall ? 40 : (layout === 'hero' && !isTall && images.bg ? 26 : 34);

  const gapHS = 22;
  const gapSLab = 30;
  const ruleH = 3;
  const gapRule = 20;
  const gapRuleCta = 22;

  const blockH =
    hLines.length * hLineH +
    (sLines.length ? gapHS + sLines.length * sLineH : 0) +
    gapSLab + labLines.length * labLineH +
    gapRule + ruleH + gapRuleCta + ctaSize * 1.1;

  let cursorY = H - bottomSafe - blockH;

  // Headline
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `800 ${hSize}px "Plus Jakarta Sans", sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  // soft shadow for legibility over photo
  if (layout === 'full-bleed' || (layout === 'hero' && !isTall && images.bg)) {
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 20;
  }
  for (const line of hLines) {
    ctx.fillText(line, sideP, cursorY);
    cursorY += hLineH;
  }
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  if (sLines.length) {
    cursorY += gapHS - hLineH * 0.12;
    ctx.fillStyle = accent;
    ctx.font = `500 ${sSize}px "DM Sans", sans-serif`;
    for (const line of sLines) {
      ctx.fillText(line, sideP, cursorY);
      cursorY += sLineH;
    }
  }

  cursorY += gapSLab - (sLines.length ? sLineH * 0.15 : hLineH * 0.15);
  ctx.fillStyle = '#B8C2C6';
  ctx.font = `500 ${labSize}px "DM Sans", sans-serif`;
  for (const line of labLines) {
    ctx.fillText(line, sideP, cursorY);
    cursorY += labLineH;
  }

  cursorY += gapRule - labLineH * 0.15;
  ctx.fillStyle = accent;
  ctx.fillRect(sideP, cursorY, isTall ? 96 : 80, ruleH);
  cursorY += ruleH + gapRuleCta;

  ctx.fillStyle = accent;
  ctx.font = `700 ${ctaSize}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillText(settings.cta || 'Regisztrálj fel rá!', sideP, cursorY);

  // Logo bottom-right
  if (images.logo) {
    const lMaxW = isTall ? 240 : 180;
    const lMaxH = isTall ? 80 : 64;
    const aspect = images.logo.width / images.logo.height;
    let lw = lMaxW, lh = lMaxW / aspect;
    if (lh > lMaxH) { lh = lMaxH; lw = lMaxH * aspect; }
    const lx = W - sideP - lw;
    const ly = H - bottomSafe - lh + 4;
    ctx.globalAlpha = 0.95;
    ctx.drawImage(images.logo, lx, ly, lw, lh);
    ctx.globalAlpha = 1;
  }

  // Film grain
  if (settings.grain !== false) {
    ctx.save();
    ctx.globalAlpha = 0.035;
    ctx.fillStyle = '#FFFFFF';
    const N = Math.floor((W * H) / 5000);
    for (let i = 0; i < N; i++) {
      ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
    }
    ctx.restore();
  }
};

function hexToRgb(hex) {
  const m = hex.replace('#', '').match(/.{2}/g);
  if (!m) return { r: 45, g: 181, b: 168 };
  return { r: parseInt(m[0], 16), g: parseInt(m[1], 16), b: parseInt(m[2], 16) };
}

Object.assign(window, { renderCreative, wrapText });
