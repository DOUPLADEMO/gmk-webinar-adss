// Sub-panels: variant list, settings, AI assistant, download.

const { useState, useEffect, useRef, useCallback, useMemo } = React;

// --------- VariantList ---------
function VariantList({ variants, activeId, onSelect, onEdit }) {
  return (
    <div className="flex flex-col gap-1.5">
      {variants.map(v => {
        const active = v.id === activeId;
        return (
          <button
            key={v.id}
            onClick={() => onSelect(v.id)}
            className={`text-left group transition-colors relative ${active ? 'bg-[#111A1D]' : 'bg-[#0E1417] hover:bg-[#111A1D]'}`}
            style={{
              border: '1px solid ' + (active ? '#2DB5A8' : '#1C262A'),
              borderLeftWidth: active ? 3 : 1,
              padding: '10px 12px 10px ' + (active ? '10px' : '12px'),
            }}
          >
            <div className="flex items-start gap-2.5">
              <span
                className="text-[10px] font-bold tracking-wider shrink-0 mt-0.5"
                style={{
                  color: active ? '#0B0F10' : '#2DB5A8',
                  background: active ? '#2DB5A8' : 'transparent',
                  border: active ? 'none' : '1px solid #2DB5A8',
                  padding: '2px 6px',
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                }}
              >
                {v.id}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] leading-snug text-white/90 font-medium"
                  style={{ fontFamily: '"DM Sans", sans-serif' }}>
                  {v.headline.split('\n')[0]}
                </div>
                {v.subline && (
                  <div className="text-[11px] text-[#6B777C] mt-0.5 truncate">{v.subline}</div>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// --------- Settings ---------
function SettingsPanel({ settings, setSettings, onLogoUpload, hasLogo }) {
  const logoInputRef = useRef(null);

  const Row = ({ label, children }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10.5px] uppercase tracking-[0.12em] text-[#6B777C] font-medium"
        style={{ fontFamily: '"DM Sans", sans-serif' }}>{label}</label>
      {children}
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <Row label="Logó (PNG)">
        <button
          onClick={() => logoInputRef.current?.click()}
          className="text-left text-[12px] text-white bg-[#0E1417] hover:bg-[#111A1D] border border-[#1C262A] px-3 py-2 transition-colors flex items-center justify-between"
        >
          <span className="truncate">{hasLogo ? '✓ Logó betöltve' : 'Fájl kiválasztása'}</span>
          <span className="text-[#2DB5A8] text-[11px]">▲</span>
        </button>
        <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={onLogoUpload} />
      </Row>

      <Row label="Layout">
        <div className="grid grid-cols-3 gap-1">
          {LAYOUT_OPTIONS.map(l => (
            <button key={l.id}
              onClick={() => setSettings(s => ({ ...s, layout: l.id }))}
              className="text-[10.5px] py-2 px-1 transition-colors"
              style={{
                fontFamily: '"DM Sans", sans-serif',
                background: settings.layout === l.id ? '#2DB5A8' : '#0E1417',
                color: settings.layout === l.id ? '#0B0F10' : '#B8C2C6',
                border: '1px solid ' + (settings.layout === l.id ? '#2DB5A8' : '#1C262A'),
                fontWeight: 500,
              }}>
              {l.label}
            </button>
          ))}
        </div>
      </Row>

      <Row label="CTA">
        <select
          value={settings.cta}
          onChange={e => setSettings(s => ({ ...s, cta: e.target.value }))}
          className="text-[12px] text-white bg-[#0E1417] border border-[#1C262A] px-3 py-2 outline-none focus:border-[#2DB5A8]"
          style={{ fontFamily: '"DM Sans", sans-serif' }}
        >
          {CTA_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </Row>

      <Row label="Dátum / alcím (opcionális)">
        <input
          type="text"
          value={settings.dateText}
          onChange={e => setSettings(s => ({ ...s, dateText: e.target.value }))}
          placeholder="pl. 2026. május 15. | 18:00"
          className="text-[12px] text-white bg-[#0E1417] border border-[#1C262A] px-3 py-2 outline-none focus:border-[#2DB5A8] placeholder:text-[#4B5458]"
          style={{ fontFamily: '"DM Sans", sans-serif' }}
        />
      </Row>

      <div className="flex items-center justify-between py-1">
        <span className="text-[11.5px] text-[#B8C2C6]" style={{ fontFamily: '"DM Sans", sans-serif' }}>
          "INGYENES WEBINÁR" jelvény
        </span>
        <Toggle on={settings.showBadge} onChange={v => setSettings(s => ({ ...s, showBadge: v }))} />
      </div>

      <div className="flex items-center justify-between py-1">
        <span className="text-[11.5px] text-[#B8C2C6]" style={{ fontFamily: '"DM Sans", sans-serif' }}>
          Film grain textúra
        </span>
        <Toggle on={settings.grain} onChange={v => setSettings(s => ({ ...s, grain: v }))} />
      </div>

      <Row label="Akcent szín">
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={settings.accent}
            onChange={e => setSettings(s => ({ ...s, accent: e.target.value }))}
            className="w-10 h-8 bg-transparent border border-[#1C262A] cursor-pointer"
          />
          <div className="flex gap-1">
            {['#2DB5A8', '#3FCABD', '#1F8B82', '#E8F1F0'].map(c => (
              <button key={c} onClick={() => setSettings(s => ({ ...s, accent: c }))}
                className="w-6 h-6 border"
                style={{ background: c, borderColor: settings.accent === c ? '#FFFFFF' : '#1C262A' }}
              />
            ))}
          </div>
        </div>
      </Row>

      <Row label="Sötét / Világos">
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={() => setSettings(s => ({ ...s, theme: 'dark' }))}
            className="text-[11px] py-2 px-2 transition-colors flex items-center justify-center gap-1.5"
            style={{
              fontFamily: '"DM Sans", sans-serif',
              background: (settings.theme || 'dark') === 'dark' ? '#2DB5A8' : '#0E1417',
              color: (settings.theme || 'dark') === 'dark' ? '#0B0F10' : '#B8C2C6',
              border: '1px solid ' + ((settings.theme || 'dark') === 'dark' ? '#2DB5A8' : '#1C262A'),
              fontWeight: 500,
            }}>
            <span>☾</span> Sötét
          </button>
          <button
            onClick={() => setSettings(s => ({ ...s, theme: 'light' }))}
            className="text-[11px] py-2 px-2 transition-colors flex items-center justify-center gap-1.5"
            style={{
              fontFamily: '"DM Sans", sans-serif',
              background: settings.theme === 'light' ? '#2DB5A8' : '#0E1417',
              color: settings.theme === 'light' ? '#0B0F10' : '#B8C2C6',
              border: '1px solid ' + (settings.theme === 'light' ? '#2DB5A8' : '#1C262A'),
              fontWeight: 500,
            }}>
            <span>☀</span> Világos
          </button>
        </div>
      </Row>
    </div>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="relative transition-colors"
      style={{
        width: 34, height: 18,
        background: on ? '#2DB5A8' : '#1C262A',
        borderRadius: 2,
      }}
    >
      <span
        className="absolute top-0.5 transition-all"
        style={{
          left: on ? 18 : 2,
          width: 14, height: 14,
          background: on ? '#0B0F10' : '#6B777C',
        }}
      />
    </button>
  );
}

// --------- AI Copy Assistant ---------
function AIAssistant({ onPick }) {
  const [prompt, setPrompt] = useState(
    "Webinár célközönség: 30–50 éves, irodai munkát végzők, akik félnek az AI hatásától a karrierjükre. Hangnem: közvetlen, sürgető, de nem riasztó."
  );
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const generate = async () => {
    setLoading(true); setError(null); setResults([]);
    try {
      const text = await window.claude.complete({
        messages: [{
          role: 'user',
          content: `Te egy Facebook hirdetési szövegíró vagy. A célközönség és a kontextus: ${prompt}

Generálj 3 rövid, ütős Facebook hirdetési headline-t erre a webinárra (AI és karrierváltás témában).
Minden headline max 2 sor, közvetlen megszólítás, magyar nyelven. Ha sortörés kell, használj \\n karaktert.
Adj vissza CSAK JSON-t, semmi más, pontosan ebben a formában:
{"headlines": ["...", "...", "..."]}`
        }]
      });
      let jsonText = text.trim();
      const m = jsonText.match(/\{[\s\S]*\}/);
      if (m) jsonText = m[0];
      const parsed = JSON.parse(jsonText);
      setResults(parsed.headlines || []);
    } catch (e) {
      setError('Nem sikerült generálni. Próbáld újra.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="text-[10.5px] uppercase tracking-[0.12em] text-[#6B777C] mb-1.5 font-medium"
          style={{ fontFamily: '"DM Sans", sans-serif' }}>Kontextus</div>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={4}
          className="w-full text-[11.5px] text-white bg-[#0E1417] border border-[#1C262A] p-2.5 outline-none focus:border-[#2DB5A8] resize-none leading-snug"
          style={{ fontFamily: '"DM Sans", sans-serif' }}
        />
      </div>

      <button
        onClick={generate}
        disabled={loading}
        className="w-full py-2.5 text-[12px] font-bold tracking-wider transition-colors flex items-center justify-center gap-2"
        style={{
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          background: loading ? '#1F8B82' : '#2DB5A8',
          color: '#0B0F10',
          letterSpacing: '0.06em',
        }}
      >
        {loading ? (
          <>
            <span className="inline-block w-3 h-3 border-2 border-[#0B0F10] border-t-transparent rounded-full animate-spin" />
            GENERÁLÁS...
          </>
        ) : 'GENERÁLJ 3 HEADLINET'}
      </button>

      {error && (
        <div className="text-[11px] text-[#FF6B6B] border border-[#FF6B6B]/40 bg-[#FF6B6B]/10 p-2">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <div className="text-[10.5px] uppercase tracking-[0.12em] text-[#6B777C] font-medium"
            style={{ fontFamily: '"DM Sans", sans-serif' }}>Javaslatok — kattints egyre</div>
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => onPick(r)}
              className="text-left text-[12.5px] text-white bg-[#0E1417] hover:bg-[#111A1D] border border-[#1C262A] hover:border-[#2DB5A8] p-2.5 transition-colors leading-snug whitespace-pre-line"
              style={{ fontFamily: '"DM Sans", sans-serif' }}
            >
              {r}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// --------- Creative Panel ---------
function CreativePanel({ variant, settings, setSettings, format, onGenerated, onModelChange }) {
  const [apiKey, setApiKey] = React.useState(() => localStorage.getItem('gmk_krea_key') || '');
  const [model, setModel] = React.useState(() => localStorage.getItem('gmk_krea_model') || 'google/nano-banana-pro');
  const [customPrompt, setCustomPrompt] = React.useState('');
  const [status, setStatus] = React.useState(null); // null | 'generating' | 'polling' | 'done' | 'error'
  const [statusMsg, setStatusMsg] = React.useState('');
  const [error, setError] = React.useState(null);
  const [previewUrl, setPreviewUrl] = React.useState(null);

  const [proxyUrl, setProxyUrl] = React.useState(() => localStorage.getItem('gmk_krea_proxy') || '');
  const saveKey = v => { setApiKey(v); localStorage.setItem('gmk_krea_key', v); };
  const saveProxy = v => { setProxyUrl(v); localStorage.setItem('gmk_krea_proxy', v); };
  const saveModel = v => { setModel(v); localStorage.setItem('gmk_krea_model', v); onModelChange && onModelChange(v); };

  const fmtObj = typeof format === 'object' ? format : null;
  const W = fmtObj ? fmtObj.w : 1080;
  const H = fmtObj ? fmtObj.h : (format === '9:16' ? 1920 : 1080);

  const generate = async () => {
    if (!apiKey.trim()) { setError('Add meg az API kulcsot!'); return; }
    setStatus('generating'); setError(null); setStatusMsg('Küldés...');
    try {
      const prompt = buildCreativePrompt(variant, settings.creativeStyle || 'bold', customPrompt);
      const url = await kreaGenerate(
        { apiKey: apiKey.trim(), model, prompt, width: W, height: H, steps: 30 },
        s => setStatusMsg(s === 'processing' ? 'Generálás...' : s)
      );
      if (!url) throw new Error('Nem érkezett vissza kép URL.');
      setPreviewUrl(url);
      // Load as image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => { onGenerated(img); setStatus('done'); setStatusMsg('Kész!'); };
      img.onerror = () => { setStatus('done'); setStatusMsg('Kész — de a kép csak direct URL-ként érhető el.'); onGenerated(null, url); };
      img.src = url;
    } catch (e) {
      const msg = e.message || '';
      let userMsg = msg;
      if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('networkerror') || msg.toLowerCase().includes('cors')) {
        userMsg = 'CORS hiba: a Krea API nem engedi a böngészőből érkező kéréseket. Megoldás: adj hozzá CORS proxy-t, vagy hívd az API-t szerver oldalról.';
      } else if (msg.includes('401') || msg.toLowerCase().includes('unauthorized')) {
        userMsg = 'Érvénytelen API kulcs (401). Ellenőrizd: krea.ai/settings/api-tokens';
      } else if (msg.includes('404')) {
        userMsg = '404 – Endpoint nem található. Lehetséges, hogy a modell neve vagy az API URL megváltozott. Ellenőrizd a Krea docs-ban.';
      } else if (msg.includes('429')) {
        userMsg = 'Rate limit (429) – Túl sok kérés. Várj egy percet, majd próbáld újra.';
      }
      setError(userMsg);
      setStatus('error');
    }
  };

  const MODELS = [
    { id: 'google/nano-banana-pro', label: 'Nano Banana Pro', sub: 'Google · legjobb tipográfia + fotórealizmus' },
    { id: 'bfl/flux-1-dev',         label: 'Flux 1 Dev',       sub: 'Black Forest Labs · gyors és minőségi' },
    { id: 'google/imagen-4-ultra',  label: 'Imagen 4 Ultra',   sub: 'Google · ultra-minőség' },
    { id: 'ideogram/ideogram-3-0',  label: 'Ideogram 3.0',     sub: 'Ideogram · tipográfia és dizájn' },
  ];

  const uploadRef = React.useRef(null);
  const onUpload = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const img = new Image();
    img.onload = () => {
      onGenerated(img);
      setPreviewUrl(URL.createObjectURL(f));
      setStatus('done');
      setStatusMsg('Feltöltve');
      setError(null);
    };
    img.onerror = () => setError('Nem sikerült betölteni a képet.');
    img.src = URL.createObjectURL(f);
    e.target.value = '';
  };

  const autoPrompt = buildCreativePrompt(variant, settings.creativeStyle || 'bold', '');

  return (
    <div className="flex flex-col gap-4">
      {/* Upload background image */}
      <div>
        <div className="text-[10.5px] uppercase tracking-[0.12em] text-[#6B777C] mb-1.5 font-medium flex items-center justify-between">
          <span>Saját háttérkép</span>
          <span className="text-[9px] text-[#4B5458] normal-case tracking-normal">opcionális</span>
        </div>
        <input ref={uploadRef} type="file" accept="image/*" className="hidden" onChange={onUpload} />
        <button
          onClick={() => uploadRef.current?.click()}
          className="w-full text-[11.5px] px-3 py-2.5 border border-dashed text-[#B8C2C6] hover:text-white hover:border-[#2DB5A8] transition-colors flex items-center justify-center gap-2"
          style={{ borderColor: '#2A3438', background: '#0A0E10', fontFamily: '"DM Sans", sans-serif' }}>
          <span className="text-[#2DB5A8]">↑</span>
          Tölts fel háttérképet
        </button>
        <div className="text-[10px] text-[#4B5458] mt-1">Cover-fit az aktuális formátumhoz — nincs API szükséges</div>
      </div>

      <div className="relative py-1">
        <div className="absolute inset-x-0 top-1/2 border-t border-[#1C262A]" />
        <div className="relative flex justify-center">
          <span className="bg-[#0B0F10] px-3 text-[10px] text-[#4B5458] uppercase tracking-[0.18em]">vagy AI</span>
        </div>
      </div>

      {/* API Key */}
      <div>
        <div className="text-[10.5px] uppercase tracking-[0.12em] text-[#6B777C] mb-1.5 font-medium">Krea.ai API kulcs</div>
        <input
          type="password"
          value={apiKey}
          onChange={e => saveKey(e.target.value)}
          placeholder="krea-xxxxxxxxxxxxxxxxx"
          className="w-full text-[12px] text-white bg-[#0E1417] border border-[#1C262A] px-3 py-2 outline-none focus:border-[#2DB5A8] placeholder:text-[#3A4A50]"
          style={{ fontFamily: '"DM Sans", monospace' }}
        />
        <div className="text-[10px] text-[#4B5458] mt-1">krea.ai/settings/api-tokens — localStorage-ban tárolódik</div>
      </div>

      {/* Model */}
      <div>
        <div className="text-[10.5px] uppercase tracking-[0.12em] text-[#6B777C] mb-1.5 font-medium">Model</div>
        <div className="flex flex-col gap-1">
          {MODELS.map(m => (
            <button key={m.id} onClick={() => saveModel(m.id)}
              className="text-left px-3 py-2 transition-colors"
              style={{
                background: model === m.id ? 'rgba(45,181,168,0.1)' : '#0E1417',
                border: '1px solid ' + (model === m.id ? '#2DB5A8' : '#1C262A'),
              }}>
              <div className="text-[12px] text-white font-medium" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>{m.label}</div>
              <div className="text-[10px] text-[#6B777C]">{m.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Style presets */}
      <div>
        <div className="text-[10.5px] uppercase tracking-[0.12em] text-[#6B777C] mb-1.5 font-medium">Vizuális stílus</div>
        <div className="grid grid-cols-2 gap-1">
          {CREATIVE_STYLES.map(s => (
            <button key={s.id}
              onClick={() => setSettings(prev => ({ ...prev, creativeStyle: s.id }))}
              className="text-left px-2.5 py-2 transition-colors text-[11.5px]"
              style={{
                background: settings.creativeStyle === s.id ? 'rgba(45,181,168,0.12)' : '#0E1417',
                border: '1px solid ' + (settings.creativeStyle === s.id ? s.accent : '#1C262A'),
                color: settings.creativeStyle === s.id ? '#FFFFFF' : '#B8C2C6',
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: settings.creativeStyle === s.id ? 600 : 400,
              }}>
              <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ background: s.accent }} />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[10.5px] uppercase tracking-[0.12em] text-[#6B777C] font-medium">Prompt</div>
          {customPrompt && <button onClick={() => setCustomPrompt('')} className="text-[10px] text-[#2DB5A8]">Reset auto</button>}
        </div>
        <textarea
          value={customPrompt || autoPrompt}
          onChange={e => setCustomPrompt(e.target.value === autoPrompt ? '' : e.target.value)}
          rows={4}
          className="w-full text-[11px] text-white bg-[#0E1417] border border-[#1C262A] p-2.5 outline-none focus:border-[#2DB5A8] resize-none leading-snug"
          style={{ fontFamily: '"DM Sans", sans-serif', color: customPrompt ? '#FFFFFF' : '#7A9098' }}
        />
        {!customPrompt && <div className="text-[9.5px] text-[#4B5458] mt-0.5">Auto-prompt a stílusból és a headline-ból. Szerkesztd felül.</div>}
      </div>

      {/* Format info */}
      <div className="text-[10px] text-[#4B5458] flex items-center gap-1.5">
        <span className="text-[#2DB5A8]">◆</span>
        Generál: {W}×{H}px
      </div>

      {/* Generate button */}
      <button
        onClick={generate}
        disabled={status === 'generating' || status === 'polling'}
        className="w-full py-3 text-[13px] font-bold tracking-wide flex items-center justify-center gap-2 transition-all"
        style={{
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          background: (status === 'generating' || status === 'polling') ? '#1F8B82' : '#2DB5A8',
          color: '#060A0D',
          letterSpacing: '0.04em',
          opacity: !apiKey.trim() ? 0.5 : 1,
        }}>
        {(status === 'generating' || status === 'polling') ? (
          <><span className="inline-block w-3.5 h-3.5 border-2 border-[#060A0D] border-t-transparent rounded-full animate-spin" />{statusMsg || 'Generálás...'}</>
        ) : '✦ Generálj hátteret'}
      </button>

      {error && (
        <div className="text-[11px] text-[#FF6B6B] border border-[#FF6B6B]/40 bg-[#FF6B6B]/08 p-2.5 leading-snug">
          {error}
        </div>
      )}

      {status === 'done' && previewUrl && (
        <div>
          <div className="text-[10.5px] uppercase tracking-[0.12em] text-[#6B777C] mb-1.5 font-medium">Utolsó generált</div>
          <img src={previewUrl} alt="generated" className="w-full object-cover" style={{ maxHeight: 160, border: '1px solid #1C262A' }} />
          <a href={previewUrl} target="_blank" rel="noopener" className="text-[10px] text-[#2DB5A8] mt-1 block">Megnyitás teljes méretben ↗</a>
        </div>
      )}
    </div>
  );
}

// --------- Studio AI Panel ---------
function StudioAIPanel({ variant, settings, setSettings, format, onGenerated }) {
  const [apiKey, setApiKey] = React.useState(() => localStorage.getItem('gmk_krea_key') || '');
  const [customPrompt, setCustomPrompt] = React.useState('');
  const [status, setStatus] = React.useState(null);
  const [statusMsg, setStatusMsg] = React.useState('');
  const [error, setError] = React.useState(null);
  const [previewUrl, setPreviewUrl] = React.useState(null);

  const [proxyUrl, setProxyUrl] = React.useState(() => localStorage.getItem('gmk_proxy_url') || 'https://corsproxy.io/');
  const [proxyKey, setProxyKey] = React.useState(() => localStorage.getItem('gmk_proxy_key') || '4509bcba');
  const saveKey = v => { setApiKey(v); localStorage.setItem('gmk_krea_key', v); };
  const saveProxyUrl = v => { setProxyUrl(v); localStorage.setItem('gmk_proxy_url', v); };
  const saveProxyKey = v => { setProxyKey(v); localStorage.setItem('gmk_proxy_key', v); };

  const fmtObjS = typeof format === 'object' ? format : null;
  const W = fmtObjS ? fmtObjS.w : 1080;
  const H = fmtObjS ? fmtObjS.h : (format === '9:16' ? 1920 : 1080);

  const autoPrompt = buildStudioAIPrompt(variant, settings, fmtObjS || { w: W, h: H, platform: settings.platform }, '');

  const generate = async () => {
    if (!apiKey.trim()) { setError('Add meg a Krea.ai API kulcsot!'); return; }
    setStatus('generating'); setError(null); setStatusMsg('Küldés...');
    try {
      const prompt = customPrompt.trim() || autoPrompt;
      const url = await kreaGenerate(
        { apiKey: apiKey.trim(), model: 'google/nano-banana-pro', prompt, width: W, height: H, steps: 35 },
        s => setStatusMsg(s === 'processing' ? 'Nano Banana Pro generál...' : s)
      );
      if (!url) throw new Error('Nem érkezett vissza kép URL.');
      setPreviewUrl(url);
      // Load image for canvas rendering
      const img = new Image();
      img.onload = () => {
        onGenerated(img, 'studio');
        setStatus('done');
        setStatusMsg('Kész!');
      };
      img.onerror = () => {
        // Fallback: still pass null but with the URL so preview works
        onGenerated(null, 'studio', url);
        setStatus('done');
        setStatusMsg('Kész (kép betöltve, canvas előnézet frissítésre vár)');
      };
      img.crossOrigin = 'anonymous';
      img.src = url;
    } catch (e) {
      const msg = e.message || '';
      let userMsg = msg;
      if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('cors')) {
        userMsg = 'CORS hiba: a Krea API böngészőből nem hívható közvetlenül. Szerver-oldali proxy szükséges.';
      } else if (msg.includes('401')) {
        userMsg = 'Érvénytelen API kulcs (401) — ellenőrizd: krea.ai/settings/api-tokens';
      } else if (msg.includes('404')) {
        userMsg = '404 – Endpoint nem található. Ellenőrizd a Krea docs-ban az aktuális modell nevet.';
      } else if (msg.includes('429')) {
        userMsg = 'Rate limit (429) — várj egy percet, majd próbáld újra.';
      }
      setError(userMsg);
      setStatus('error');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* API Key */}
      <div>
        <div className="text-[10.5px] uppercase tracking-[0.12em] text-[#6B777C] mb-1.5 font-medium">Krea.ai API kulcs</div>
        <input type="password" value={apiKey} onChange={e => saveKey(e.target.value)}
          placeholder="krea-xxxxxxxxxxxxxxxxx"
          className="w-full text-[12px] text-white bg-[#0E1417] border border-[#1C262A] px-3 py-2 outline-none focus:border-[#2DB5A8] placeholder:text-[#3A4A50]"
          style={{ fontFamily: 'monospace' }} />
        <div className="text-[10px] text-[#4B5458] mt-1">krea.ai/settings/api-tokens</div>
      </div>

      {/* CORS Proxy URL */}
      <div>
        <div className="text-[10.5px] uppercase tracking-[0.12em] text-[#6B777C] mb-1.5 font-medium">CORS Proxy URL</div>
        <input
          type="text"
          value={proxyUrl}
          onChange={e => saveProxyUrl(e.target.value)}
          placeholder="https://corsproxy.io/"
          className="w-full text-[11px] text-white bg-[#0E1417] border border-[#1C262A] px-3 py-2 outline-none focus:border-[#2DB5A8] placeholder:text-[#3A4A50]"
          style={{ fontFamily: 'monospace' }}
        />
        <div className="text-[9.5px] text-[#4B5458] mt-1">https://corsproxy.io/ (autentikált endpoint)</div>
      </div>

      {/* CORS Proxy API Key */}
      <div>
        <div className="text-[10.5px] uppercase tracking-[0.12em] text-[#6B777C] mb-1.5 font-medium">CORS Proxy API Key</div>
        <input
          type="password"
          value={proxyKey}
          onChange={e => saveProxyKey(e.target.value)}
          placeholder="4509bcba..."
          className="w-full text-[11px] text-white bg-[#0E1417] border border-[#1C262A] px-3 py-2 outline-none focus:border-[#2DB5A8] placeholder:text-[#3A4A50]"
          style={{ fontFamily: 'monospace' }}
        />
        <div className="text-[9.5px] text-[#4B5458] mt-1">x-cors-api-key header — dashboard jobb felső sarka</div>
      </div>

      {/* Prompt */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[10.5px] uppercase tracking-[0.12em] text-[#6B777C] font-medium">Prompt (Nano Banana Pro)</div>
          {customPrompt && <button onClick={() => setCustomPrompt('')} className="text-[10px] text-[#2DB5A8]">Reset auto</button>}
        </div>
        <textarea
          value={customPrompt || autoPrompt}
          onChange={e => setCustomPrompt(e.target.value === autoPrompt ? '' : e.target.value)}
          rows={8}
          className="w-full text-[10.5px] bg-[#0E1417] border border-[#1C262A] p-2.5 outline-none focus:border-[#2DB5A8] resize-none leading-snug"
          style={{
            fontFamily: '"DM Sans", sans-serif',
            color: customPrompt ? '#FFFFFF' : '#7A9098',
          }}
        />
        {!customPrompt && (
          <div className="text-[9.5px] text-[#4B5458] mt-0.5 leading-snug">
            Auto-prompt: tartalmazza a headline szöveget, brand színeket és a layout instrukciót. Nano Banana Pro beleégeti a szöveget a képbe.
          </div>
        )}
      </div>

      {/* Format info */}
      <div className="text-[10px] text-[#4B5458] flex items-center gap-1.5 -mt-1">
        <span className="text-[#2DB5A8]">◆</span>
        {W}×{H}px · nano-banana-pro · steps: 35
      </div>

      {/* Generate */}
      <button onClick={generate}
        disabled={status === 'generating' || status === 'polling'}
        className="w-full py-3 text-[13px] font-bold tracking-wide flex items-center justify-center gap-2 transition-all"
        style={{
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          background: (status === 'generating' || status === 'polling') ? '#1F8B82' : '#2DB5A8',
          color: '#060A0D',
          opacity: !apiKey.trim() ? 0.5 : 1,
        }}>
        {(status === 'generating' || status === 'polling')
          ? <><span className="inline-block w-3.5 h-3.5 border-2 border-[#060A0D] border-t-transparent rounded-full animate-spin" />{statusMsg}</>
          : '✦ Generálj kreatívát'}
      </button>

      {error && (
        <div className="text-[11px] text-[#FF6B6B] border border-[#FF6B6B]/40 bg-[#FF6B6B]/08 p-2.5 leading-snug">{error}</div>
      )}

      {status === 'done' && previewUrl && (
        <div>
          <div className="text-[10.5px] uppercase tracking-[0.12em] text-[#6B777C] mb-1.5 font-medium">Generált kreativ</div>
          <img src={previewUrl} alt="generated" className="w-full object-cover" style={{ maxHeight: 180, border: '1px solid #2DB5A8' }} />
          <div className="flex gap-1.5 mt-2">
            <button
              onClick={() => {
                const a = document.createElement('a');
                a.href = previewUrl;
                a.download = `ai-kreativ-${Date.now()}.png`;
                a.click();
              }}
              className="flex-1 text-[10px] text-white bg-[#0E1417] hover:bg-[#111A1D] border border-[#1C262A] px-2 py-1.5 transition-colors"
            >
              ⬇ Letöltés
            </button>
            <button
              onClick={() => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => onGenerated(img, 'studio');
                img.src = previewUrl;
              }}
              className="flex-1 text-[10px] text-white bg-[#2DB5A8] hover:bg-[#1F9D94] font-bold px-2 py-1.5 transition-colors"
            >
              ◆ Háttér
            </button>
          </div>
          <a href={previewUrl} target="_blank" rel="noopener" className="text-[10px] text-[#6B777C] mt-1 block hover:text-[#2DB5A8]">Teljes méretben ↗</a>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { VariantList, SettingsPanel, AIAssistant, Toggle, CreativePanel, StudioAIPanel });
