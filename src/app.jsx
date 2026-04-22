// Main App with portrait library + Creative Mode.

const { useState, useEffect, useRef, useCallback, useMemo } = React;

// ---------- IndexedDB helpers for portrait library ----------
const DB_NAME = 'gmk_studio';
const STORE = 'portraits';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function dbPut(rec) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(rec);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}
async function dbGetAll() {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}
async function dbDelete(id) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function App() {
  const [mode, setMode] = useState('studio'); // Creative mode disabled — always Studio
  useEffect(() => { localStorage.setItem('gmk_mode', mode); }, [mode]);
  const [creativeImgs, setCreativeImgs] = useState({}); // { "V1_1:1": HTMLImageElement } for creative mode
  const [studioAIImgs, setStudioAIImgs] = useState({}); // { "V1_1:1": HTMLImageElement } for studio AI
  const [useStudioAI, setUseStudioAI] = useState(() => localStorage.getItem('gmk_use_studio_ai') === 'true');
  const [activeId, setActiveId] = useState(() => localStorage.getItem('gmk_active') || 'V9');
  const [variants, setVariants] = useState(VARIANTS);
  const [settings, setSettings] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('gmk_settings') || 'null');
      if (saved) return { ...defaultSettings(), ...saved };
    } catch {}
    return defaultSettings();
  });
  const [format, setFormat] = useState(() => {
    const saved = localStorage.getItem('gmk_format');
    return saved || 'fb_square';
  });
  const [fontsReady, setFontsReady] = useState(false);
  const [logoImg, setLogoImg] = useState(null);
  const [portraits, setPortraits] = useState([]); // [{id, name, blob, w, h, img, url}]
  // Per variant+format assignments: { "V1_1:1": "portraitId", ... }
  const [assignments, setAssignments] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gmk_assign') || '{}'); } catch { return {}; }
  });
  const [zipProgress, setZipProgress] = useState(null);
  const [focalY, setFocalY] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gmk_focals') || '{}'); } catch { return {}; }
  });

  const previewRef = useRef(null);

  useEffect(() => { localStorage.setItem('gmk_use_studio_ai', useStudioAI); }, [useStudioAI]);
  useEffect(() => { localStorage.setItem('gmk_active', activeId); }, [activeId]);
  useEffect(() => { localStorage.setItem('gmk_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('gmk_assign', JSON.stringify(assignments)); }, [assignments]);
  useEffect(() => { localStorage.setItem('gmk_focals', JSON.stringify(focalY)); }, [focalY]);

  // Fonts
  useEffect(() => {
    document.fonts.ready.then(() => {
      const c = document.createElement('canvas').getContext('2d');
      c.font = '800 48px "Plus Jakarta Sans"';
      c.measureText('Aa');
      c.font = '500 24px "DM Sans"';
      c.measureText('Aa');
      setTimeout(() => setFontsReady(true), 150);
    });
  }, []);

  // Load logo
  useEffect(() => {
    loadImage('assets/logo-white.png').then(setLogoImg).catch(() => {});
  }, []);

  // Load stored portraits from IDB on mount
  useEffect(() => {
    (async () => {
      try {
        const recs = await dbGetAll();
        const hydrated = [];
        for (const r of recs) {
          const url = URL.createObjectURL(r.blob);
          const img = await loadImage(url);
          hydrated.push({ id: r.id, name: r.name, blob: r.blob, w: img.width, h: img.height, img, url });
        }
        setPortraits(hydrated);
      } catch (e) { console.warn('IDB load failed', e); }
    })();
  }, []);

  const activeVariant = variants.find(v => v.id === activeId) || variants[0];

  // Current format object
  const currentFmt = AD_FORMATS.find(f => f.id === format) || AD_FORMATS[0];
  const fmtSize = { w: currentFmt.w, h: currentFmt.h };

  // Current portrait for this variant+format
  const currentPortrait = useMemo(() => {
    if (portraits.length === 0) return null;
    const key = `${activeId}_${format}`;
    const explicit = assignments[key];
    if (explicit) {
      const p = portraits.find(p => p.id === explicit);
      if (p) return p;
    }
    // Auto-pick: for 1:1 prefer square; for 9:16 prefer landscape (cropped to tall works well)
    const isTall = format === '9:16';
    const sorted = [...portraits].sort((a, b) => {
      const ra = a.w / a.h;
      const rb = b.w / b.h;
      // 1:1 wants ratio ~1, 9:16 wants ratio >1 but with room at top
      const targetA = isTall ? Math.abs(ra - 1.5) : Math.abs(ra - 1.0);
      const targetB = isTall ? Math.abs(rb - 1.5) : Math.abs(rb - 1.0);
      return targetA - targetB;
    });
    return sorted[0];
  }, [portraits, activeId, format, assignments]);

  const activeFocalY = focalY[`${activeId}_${format}`] ?? 0.3;

  // Render
  useEffect(() => {
    if (!fontsReady) return;
    const canvas = previewRef.current;
    if (!canvas) return;
    // GDN banners ALWAYS use the dedicated banner layout — no photo, no AI image
    const isBanner = currentFmt.platform === 'banner';
    if (!isBanner && mode === 'creative') {
      const creativeImg = creativeImgs[`${activeId}_${format}`] || null;
      renderCreative_creative(
        canvas, activeVariant,
        { ...settings, focalY: activeFocalY, platform: currentFmt.platform },
        { logo: logoImg, creative: creativeImg },
        fmtSize
      );
    } else if (!isBanner && mode === 'studio' && useStudioAI) {
      const studioAIImg = studioAIImgs[`${activeId}_${format}`] || null;
      renderCreative_studioAI(
        canvas, activeVariant, { ...settings, focalY: activeFocalY, platform: currentFmt.platform },
        { logo: logoImg, studioAI: studioAIImg },
        fmtSize
      );
    } else {
      renderCreative(
        canvas, activeVariant,
        { ...settings, focalY: activeFocalY, platform: currentFmt.platform },
        { logo: logoImg, bg: isBanner ? null : (currentPortrait?.img || null) },
        fmtSize
      );
    }
  }, [fontsReady, activeVariant, settings, format, logoImg, currentPortrait, activeFocalY, mode, creativeImgs, studioAIImgs, useStudioAI]);

  const onLogoUpload = e => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    loadImage(url).then(setLogoImg);
  };

  const onPortraitUpload = async e => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newOnes = [];
    for (const f of files) {
      const id = 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
      const url = URL.createObjectURL(f);
      const img = await loadImage(url);
      await dbPut({ id, name: f.name, blob: f });
      newOnes.push({ id, name: f.name, blob: f, w: img.width, h: img.height, img, url });
    }
    setPortraits(prev => [...prev, ...newOnes]);
  };

  const removePortrait = async id => {
    await dbDelete(id);
    setPortraits(prev => {
      const p = prev.find(x => x.id === id);
      if (p) URL.revokeObjectURL(p.url);
      return prev.filter(x => x.id !== id);
    });
    // clear any assignments pointing to it
    setAssignments(a => {
      const next = { ...a };
      for (const k of Object.keys(next)) if (next[k] === id) delete next[k];
      return next;
    });
  };

  const assignPortrait = (portraitId) => {
    const key = `${activeId}_${format}`;
    setAssignments(a => ({ ...a, [key]: portraitId }));
  };

  const autoAssignAll = () => {
    if (portraits.length < 2) return;
    // Square-ish ones → 1:1, others → 9:16
    const square = portraits.filter(p => Math.abs(p.w/p.h - 1) < 0.15);
    const landscape = portraits.filter(p => p.w/p.h > 1.2);
    const pickSq = (i) => (square[i % square.length] || portraits[i % portraits.length]).id;
    const pickLs = (i) => (landscape[i % landscape.length] || portraits[i % portraits.length]).id;
    const next = {};
    variants.forEach((v, i) => {
      next[`${v.id}_1:1`] = pickSq(i);
      next[`${v.id}_9:16`] = pickLs(i);
    });
    setAssignments(a => ({ ...a, ...next }));
  };

  const pickAIHeadline = headline => {
    setVariants(vs => vs.map(v => v.id === activeId ? { ...v, headline } : v));
  };

  const onCreativeGenerated = (img, modeType, fallbackUrl) => {
    const key = `${activeId}_${format}`;
    console.log(`[AI] onCreativeGenerated: mode=${modeType}, key=${key}, img=${!!img}, fallbackUrl=${!!fallbackUrl}`);
    if (modeType === 'studio') {
      // Store the image object if loaded, otherwise try to load from fallback URL
      if (img) {
        console.log(`[AI] Image loaded successfully, storing in studioAIImgs[${key}]`);
        setStudioAIImgs(prev => ({ ...prev, [key]: img }));
      } else if (fallbackUrl) {
        console.log(`[AI] Image failed CORS load, trying fallback fetch from: ${fallbackUrl.slice(0, 50)}...`);
        // If Image object failed to load, try fetching as blob and creating image from blob
        fetch(fallbackUrl)
          .then(res => {
            console.log(`[AI] Fetch response: ${res.status}`);
            return res.blob();
          })
          .then(blob => {
            console.log(`[AI] Blob received: ${blob.size} bytes`);
            const blobUrl = URL.createObjectURL(blob);
            const fallImg = new Image();
            fallImg.onload = () => {
              console.log(`[AI] Fallback image loaded from blob, storing in studioAIImgs[${key}]`);
              setStudioAIImgs(prev => ({ ...prev, [key]: fallImg }));
              URL.revokeObjectURL(blobUrl);
            };
            fallImg.onerror = () => {
              console.warn(`[AI] Fallback image failed to load`);
              URL.revokeObjectURL(blobUrl);
            };
            fallImg.src = blobUrl;
          })
          .catch(e => console.warn(`[AI] Fetch fallback failed:`, e));
      } else {
        console.warn(`[AI] No image and no fallback URL`);
      }
    } else {
      if (img) setCreativeImgs(prev => ({ ...prev, [key]: img }));
    }
  };

  const getBgForVariantFormat = (vId, fmt) => {
    const key = `${vId}_${fmt}`;
    const explicit = assignments[key];
    if (explicit) {
      const p = portraits.find(p => p.id === explicit);
      if (p) return p.img;
    }
    // fallback auto-pick (same logic)
    if (!portraits.length) return null;
    const isTall = fmt === '9:16';
    const sorted = [...portraits].sort((a, b) => {
      const ra = a.w / a.h, rb = b.w / b.h;
      return isTall
        ? Math.abs(ra - 1.5) - Math.abs(rb - 1.5)
        : Math.abs(ra - 1.0) - Math.abs(rb - 1.0);
    });
    return sorted[0].img;
  };

  const downloadOne = () => {
    const c = document.createElement('canvas');
    const fY = focalY[`${activeId}_${format}`] ?? 0.3;
    const isBanner = currentFmt.platform === 'banner';
    if (!isBanner && mode === 'creative') {
      const ci = creativeImgs[`${activeId}_${format}`] || null;
      renderCreative_creative(c, activeVariant, { ...settings, focalY: fY, platform: currentFmt.platform },
        { logo: logoImg, creative: ci }, fmtSize);
    } else if (!isBanner && mode === 'studio' && useStudioAI) {
      const si = studioAIImgs[`${activeId}_${format}`] || null;
      renderCreative_studioAI(c, activeVariant, { ...settings, platform: currentFmt.platform },
        { logo: logoImg, studioAI: si }, fmtSize);
    } else {
      renderCreative(c, activeVariant, { ...settings, focalY: fY, platform: currentFmt.platform },
        { logo: logoImg, bg: isBanner ? null : getBgForVariantFormat(activeId, format) }, fmtSize);
    }
    const url = c.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `gmk-${activeVariant.id}-${currentFmt.w}x${currentFmt.h}.png`;
    a.click();
  };

  const downloadAllZip = async () => {
    if (!window.JSZip) return;
    setZipProgress({ done: 0, total: variants.length });
    const zip = new JSZip();
    for (let i = 0; i < variants.length; i++) {
      const c = document.createElement('canvas');
      const fY = focalY[`${variants[i].id}_${format}`] ?? 0.3;
      const isBanner = currentFmt.platform === 'banner';
      if (!isBanner && mode === 'creative') {
        const ci = creativeImgs[`${variants[i].id}_${format}`] || null;
        renderCreative_creative(c, variants[i], { ...settings, focalY: fY, platform: currentFmt.platform },
          { logo: logoImg, creative: ci }, fmtSize);
      } else if (!isBanner && mode === 'studio' && useStudioAI) {
        const si = studioAIImgs[`${variants[i].id}_${format}`] || null;
        renderCreative_studioAI(c, variants[i], { ...settings, platform: currentFmt.platform },
          { logo: logoImg, studioAI: si }, fmtSize);
      } else {
        renderCreative(c, variants[i], { ...settings, focalY: fY, platform: currentFmt.platform },
          { logo: logoImg, bg: isBanner ? null : getBgForVariantFormat(variants[i].id, format) }, fmtSize);
      }
      const blob = await new Promise(res => c.toBlob(res, 'image/png'));
      zip.file(`gmk-${variants[i].id}-${currentFmt.w}x${currentFmt.h}.png`, blob);
      setZipProgress(p => ({ ...p, done: p.done + 1 }));
      await new Promise(r => setTimeout(r, 0));
    }
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gmk-kreativok.zip';
    a.click();
    setTimeout(() => { setZipProgress(null); URL.revokeObjectURL(url); }, 600);
  };

  // Preview sizing — max 460px on longest side
  const PREVIEW_MAX = 460;
  const fmtAspect = currentFmt.w / currentFmt.h;
  const aspectW = fmtAspect >= 1 ? PREVIEW_MAX : Math.round(PREVIEW_MAX * fmtAspect);
  const aspectH = fmtAspect >= 1 ? Math.round(PREVIEW_MAX / fmtAspect) : PREVIEW_MAX;

  return (
    <div className="min-h-screen text-white" style={{ background: '#060809', fontFamily: '"DM Sans", sans-serif' }}>
      {/* Top bar */}
      <div className="border-b border-[#141B1F] px-6 py-3.5 flex items-center justify-between sticky top-0 z-10" style={{ background: 'rgba(6,8,9,0.92)', backdropFilter: 'blur(8px)' }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 flex items-center justify-center" style={{ background: '#2DB5A8' }}>
            <span style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 800, fontSize: 14, color: '#0B0F10' }}>◆</span>
          </div>
          <div>
            <div style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 800, fontSize: 14, letterSpacing: '0.02em' }}>
              Ad Creative Studio
            </div>
            <div className="text-[10.5px] text-[#6B777C] -mt-0.5" style={{ letterSpacing: '0.1em' }}>
              GERILLA MENTOR KLUB · WEBINÁR KAMPÁNY
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[#6B777C]">Kapcsolódva · Claude</span>
          {/* Mode toggle — Creative mode disabled, Studio only */}
        </div>
      </div>

      <div className="grid gap-0" style={{ gridTemplateColumns: '300px 1fr 340px', minHeight: 'calc(100vh - 57px)' }}>
        {/* LEFT */}
        <aside className="border-r border-[#141B1F] p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 57px)' }}>
          <SectionLabel n="01" title="Variánsok" />
          <VariantList variants={variants} activeId={activeId} onSelect={setActiveId} />

          <div className="h-px bg-[#141B1F] my-5" />

          <SectionLabel n="02" title="Beállítások" />
          <SettingsPanel
            settings={settings}
            setSettings={setSettings}
            onLogoUpload={onLogoUpload}
            hasLogo={!!logoImg}
          />
        </aside>

        {/* CENTER */}
        <main className="flex flex-col items-center px-6 py-6 gap-4">
          <FormatPicker format={format} setFormat={setFormat} />

          <div className="relative" style={{ width: aspectW, height: aspectH, boxShadow: '0 30px 80px -20px rgba(0,0,0,0.7), 0 0 0 1px #141B1F' }}>
            <canvas ref={previewRef} style={{ width: '100%', height: '100%', display: 'block' }} />
            {!fontsReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0B0F10]">
                <div className="text-[10.5px] text-[#6B777C] tracking-widest animate-pulse">FONTOK BETÖLTÉSE...</div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-5 text-[10.5px] text-[#6B777C]" style={{ letterSpacing: '0.08em' }}>
            <span>VARIÁNS <span className="text-[#2DB5A8]">{activeVariant.id}</span></span>
            <span>•</span>
            <span>{currentFmt.w}×{currentFmt.h}px</span>
            <span>•</span>
            <span>LAYOUT: {LAYOUT_OPTIONS.find(l => l.id === settings.layout)?.label.toUpperCase()}</span>
            {currentPortrait && <><span>•</span><span className="truncate max-w-[140px]">📷 {currentPortrait.name.replace(/\.[^.]+$/,'')}</span></>}
          </div>

          {/* Focal Y slider */}
          {currentPortrait && (
            <div className="w-full max-w-[520px]">
              <div className="flex items-center justify-between text-[10.5px] uppercase tracking-[0.12em] text-[#6B777C] mb-1.5 font-medium">
                <span>Portré függőleges pozíció</span>
                <span className="text-[#2DB5A8]">{Math.round(activeFocalY * 100)}%</span>
              </div>
              <input type="range" min="0" max="1" step="0.02" value={activeFocalY}
                onChange={e => setFocalY(f => ({ ...f, [`${activeId}_${format}`]: parseFloat(e.target.value) }))}
                className="w-full accent-[#2DB5A8]" />
            </div>
          )}

          <div className="w-full max-w-[520px]">
            <div className="text-[10.5px] uppercase tracking-[0.12em] text-[#6B777C] mb-1.5 font-medium">Headline</div>
            <textarea value={activeVariant.headline}
              onChange={e => setVariants(vs => vs.map(v => v.id === activeId ? { ...v, headline: e.target.value } : v))}
              rows={2}
              className="w-full text-[13px] text-white bg-[#0E1417] border border-[#1C262A] p-2.5 outline-none focus:border-[#2DB5A8] resize-none leading-snug" />
            <div className="text-[10.5px] uppercase tracking-[0.12em] text-[#6B777C] mb-1.5 mt-3 font-medium">Subline (opcionális)</div>
            <input type="text" value={activeVariant.subline || ''}
              onChange={e => setVariants(vs => vs.map(v => v.id === activeId ? { ...v, subline: e.target.value || null } : v))}
              className="w-full text-[13px] text-white bg-[#0E1417] border border-[#1C262A] px-2.5 py-2 outline-none focus:border-[#2DB5A8]" />
          </div>
        </main>

        {/* RIGHT */}
        <aside className="border-l border-[#141B1F] p-4 overflow-y-auto flex flex-col gap-5" style={{ maxHeight: 'calc(100vh - 57px)' }}>
          {mode === 'creative' ? (
            <>
              <div>
                <SectionLabel n="03" title="Creative AI — Krea.ai" />
                <div className="text-[11px] text-[#6B777C] -mt-2 mb-3 leading-snug">
                  AI-generált háttér a kreatívhoz. Válassz stílust, majd kattints a generálásra.
                </div>
                <CreativePanel
                  variant={activeVariant}
                  settings={settings}
                  setSettings={setSettings}
                  format={fmtSize}
                  onGenerated={onCreativeGenerated}
                />
              </div>
              <div className="h-px bg-[#141B1F]" />
              <div>
                <SectionLabel n="04" title="Exportálás" />
                <div className="flex flex-col gap-1.5">
                  <ExportBtn onClick={() => downloadOne()}><span>Letöltés — {currentFmt.w}×{currentFmt.h}</span><span className="text-[10px] text-[#6B777C]">{currentFmt.label.toUpperCase()}</span></ExportBtn>
                  <button onClick={downloadAllZip} disabled={!!zipProgress}
                    className="mt-2 px-3 py-2.5 text-[12px] font-bold transition-colors flex items-center justify-between"
                    style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', background: '#2DB5A8', color: '#060A0D', letterSpacing: '0.04em' }}>
                    <span>{zipProgress ? `Export ${zipProgress.done}/${zipProgress.total}` : 'Mind exportálása (ZIP)'}</span><span>↓</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <SectionLabel n="03" title="Portré könyvtár" />
                <PortraitLibrary
                  portraits={portraits}
                  activeId={activeId}
                  format={format}
                  assignments={assignments}
                  onUpload={onPortraitUpload}
                  onAssign={assignPortrait}
                  onRemove={removePortrait}
                  onAutoAssign={autoAssignAll}
                />
              </div>
              <div className="h-px bg-[#141B1F]" />
              <div>
                {/* Studio AI toggle */}
                <div className="flex items-center justify-between mb-3">
                  <SectionLabel n="04" title="AI Kreativ (Nano Banana)" />
                </div>
                <div className="flex items-center justify-between mb-3 -mt-2">
                  <span className="text-[11px] text-[#B8C2C6]">AI generált kreativ mode</span>
                  <Toggle on={useStudioAI} onChange={setUseStudioAI} />
                </div>
                {useStudioAI ? (
                  <StudioAIPanel
                    variant={activeVariant}
                    settings={settings}
                    setSettings={setSettings}
                    format={fmtSize}
                    onGenerated={onCreativeGenerated}
                  />
                ) : (
                  <div className="text-[11px] text-[#4B5458] leading-snug border border-dashed border-[#1C262A] p-3">
                    Kapcsold be az AI módot: a Nano Banana Pro beleégeti a szöveget, elrendezést és effekteket a képbe. Sokkal kreatívabb eredmény — a stúdió csak a logót rakja rá.
                  </div>
                )}
              </div>
              <div className="h-px bg-[#141B1F]" />
              <div>
                <SectionLabel n="05" title="AI Szövegíró" />
                <div className="text-[11px] text-[#6B777C] -mt-2 mb-3 leading-snug">
                  Új headline variáció az aktív variánshoz ({activeId}).
                </div>
                <AIAssistant onPick={pickAIHeadline} />
              </div>
              <div className="h-px bg-[#141B1F]" />
              <div>
                <SectionLabel n="06" title="Exportálás" />
                <div className="flex flex-col gap-1.5">
                  <ExportBtn onClick={() => downloadOne()}><span>Letöltés — {currentFmt.w}×{currentFmt.h}</span><span className="text-[10px] text-[#6B777C]">{currentFmt.label.toUpperCase()}</span></ExportBtn>
                  <button onClick={downloadAllZip} disabled={!!zipProgress}
                    className="mt-2 px-3 py-2.5 text-[12px] font-bold transition-colors flex items-center justify-between"
                    style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', background: '#2DB5A8', color: '#0B0F10', letterSpacing: '0.04em' }}>
                    <span>{zipProgress ? `Export ${zipProgress.done}/${zipProgress.total}` : 'Mind exportálása (ZIP)'}</span><span>↓</span>
                  </button>
                  {zipProgress && (
                    <div className="h-0.5 bg-[#1C262A] overflow-hidden">
                      <div className="h-full bg-[#2DB5A8] transition-all" style={{ width: `${(zipProgress.done / zipProgress.total) * 100}%` }} />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

function defaultSettings() {
  return {
    cta: CTA_OPTIONS[0],
    layout: 'hero',
    showBadge: true,
    grain: true,
    dateText: '',
    accent: '#2DB5A8',
    theme: 'dark',
  };
}

function SectionLabel({ n, title }) {
  return (
    <div className="flex items-baseline gap-2 mb-3">
      <span className="text-[10px] text-[#2DB5A8]" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700, letterSpacing: '0.1em' }}>{n}</span>
      <span className="text-[11.5px] uppercase tracking-[0.14em] text-white/90 font-medium">{title}</span>
      <span className="flex-1 h-px bg-[#141B1F] ml-1" />
    </div>
  );
}

function ExportBtn({ onClick, children }) {
  return (
    <button onClick={onClick}
      className="px-3 py-2.5 text-[12px] text-white bg-[#0E1417] hover:bg-[#111A1D] border border-[#1C262A] hover:border-[#2DB5A8] transition-colors flex items-center justify-between"
      style={{ fontWeight: 500 }}>
      {children}
    </button>
  );
}

function PortraitLibrary({ portraits, activeId, format, assignments, onUpload, onAssign, onRemove, onAutoAssign }) {
  const inputRef = useRef(null);
  const currentKey = `${activeId}_${format}`;
  const assignedId = assignments[currentKey];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1.5">
        <button onClick={() => inputRef.current?.click()}
          className="flex-1 text-[11.5px] text-white bg-[#0E1417] hover:bg-[#111A1D] border border-[#1C262A] px-2.5 py-2 transition-colors">
          + Portré feltöltés (több is)
        </button>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={onUpload} />
        {portraits.length >= 2 && (
          <button onClick={onAutoAssign}
            className="text-[11px] text-[#2DB5A8] bg-transparent border border-[#2DB5A8] hover:bg-[#2DB5A8]/10 px-2 transition-colors">
            Auto
          </button>
        )}
      </div>

      {portraits.length === 0 && (
        <div className="text-[11px] text-[#6B777C] leading-snug border border-dashed border-[#1C262A] p-3">
          Nincs portré. Tölts fel egyet vagy többet — a stúdió automatikusan a megfelelő méretűt választja a 1:1 és a 9:16 kreatívokhoz.
        </div>
      )}

      {portraits.length > 0 && (
        <>
          <div className="text-[10px] uppercase tracking-[0.12em] text-[#6B777C]">
            {activeId} · {format} → válassz portrét
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {portraits.map(p => {
              const selected = assignedId === p.id;
              return (
                <div key={p.id} className="relative group">
                  <button onClick={() => onAssign(p.id)}
                    className="w-full aspect-square overflow-hidden transition-all"
                    style={{
                      border: '2px solid ' + (selected ? '#2DB5A8' : '#1C262A'),
                      outline: selected ? '1px solid #2DB5A8' : 'none',
                      outlineOffset: 2,
                    }}>
                    <img src={p.url} alt={p.name} className="w-full h-full object-cover" style={{ display: 'block' }} />
                  </button>
                  <button onClick={() => onRemove(p.id)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#0B1013] border border-[#1C262A] text-[#B8C2C6] hover:text-white hover:border-[#2DB5A8] text-[11px] leading-none opacity-0 group-hover:opacity-100 transition-opacity">
                    ×
                  </button>
                  <div className="text-[9px] text-[#6B777C] mt-0.5 text-center">
                    {p.w > p.h * 1.2 ? '▭' : p.h > p.w * 1.2 ? '▯' : '■'} {p.w}×{p.h}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-[10px] text-[#4B5458] leading-relaxed">
            Az Auto gomb minden variánshoz automatikusan beosztja a portrékat formátum szerint: négyzetes képek a Feedhez, fekvő/álló képek a Storyhoz.
          </div>
        </>
      )}
    </div>
  );
}

function FormatPicker({ format, setFormat }) {
  const groups = ['Facebook', 'Google Ads', 'GDN Banner'];
  return (
    <div className="w-full max-w-[520px]">
      {groups.map(group => (
        <div key={group} className="mb-2">
          <div className="text-[9.5px] uppercase tracking-[0.14em] text-[#4B5458] mb-1 font-medium px-1">{group}</div>
          <div className="flex flex-wrap gap-1">
            {AD_FORMATS.filter(f => f.group === group).map(f => (
              <button key={f.id} onClick={() => setFormat(f.id)}
                className="text-[10.5px] px-2 py-1 transition-colors"
                style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontWeight: format === f.id ? 600 : 400,
                  background: format === f.id ? '#2DB5A8' : '#0E1417',
                  color: format === f.id ? '#060A0D' : '#B8C2C6',
                  border: '1px solid ' + (format === f.id ? '#2DB5A8' : '#1C262A'),
                  whiteSpace: 'nowrap',
                }}>
                {f.icon} {f.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
