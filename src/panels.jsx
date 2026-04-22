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

      <Row label="Felirat szín">
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={settings.headlineColor || '#FFFFFF'}
            onChange={e => setSettings(s => ({ ...s, headlineColor: e.target.value }))}
            className="w-10 h-8 bg-transparent border border-[#1C262A] cursor-pointer"
          />
          <div className="flex gap-1">
            <button
              onClick={() => setSettings(s => ({ ...s, headlineColor: '' }))}
              className="px-2 h-6 text-[10px] border"
              style={{
                fontFamily: '"DM Sans", sans-serif',
                background: !settings.headlineColor ? '#2DB5A8' : '#0E1417',
                color: !settings.headlineColor ? '#0B0F10' : '#B8C2C6',
                borderColor: !settings.headlineColor ? '#2DB5A8' : '#1C262A',
              }}
              title="Téma alapértelmezett"
            >AUTO</button>
            {['#FFFFFF', '#0B1013', '#2DB5A8', '#E8F1F0'].map(c => (
              <button key={c} onClick={() => setSettings(s => ({ ...s, headlineColor: c }))}
                className="w-6 h-6 border"
                style={{ background: c, borderColor: settings.headlineColor === c ? '#FFFFFF' : '#1C262A' }}
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

// --------- Krea AI image generator ---------
const KREA_MODELS = [
  { id: 'flux-1-dev',    label: 'Flux 1 Dev',     path: 'bfl/flux-1-dev' },
  { id: 'imagen-4',      label: 'Imagen 4',       path: 'google/imagen-4' },
  { id: 'ideogram-3-0',  label: 'Ideogram 3.0',   path: 'ideogram/ideogram-3-0' },
];

function extractImageUrl(payload) {
  if (!payload) return null;
  const candidates = [
    payload.image_url,
    payload.url,
    payload.result?.image_url,
    payload.result?.url,
    payload.result?.images?.[0]?.url,
    payload.result?.images?.[0],
    payload.output?.image_url,
    payload.output?.url,
    payload.output?.images?.[0]?.url,
    payload.output?.images?.[0],
    Array.isArray(payload.output) ? payload.output[0] : null,
    payload.images?.[0]?.url,
    payload.images?.[0],
    payload.data?.[0]?.url,
  ];
  for (const c of candidates) if (typeof c === 'string' && c.startsWith('http')) return c;
  return null;
}

function KreaGenerator({ onGenerated, format }) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gmk_krea_key') || '');
  const [showKey, setShowKey] = useState(false);
  const [prompt, setPrompt] = useState(
    'Modern, minimalista, homályos irodai háttér lágy teal és kék fényekkel, filmic, shallow depth of field, fotórealisztikus'
  );
  const [model, setModel] = useState('flux-1-dev');
  const [status, setStatus] = useState(null); // {state, message}
  const [busy, setBusy] = useState(false);

  useEffect(() => { localStorage.setItem('gmk_krea_key', apiKey); }, [apiKey]);

  const generate = async () => {
    if (!apiKey.trim()) { setStatus({ state: 'error', message: 'Add meg az API kulcsot.' }); return; }
    if (!prompt.trim()) { setStatus({ state: 'error', message: 'Írj be egy promptot.' }); return; }

    const m = KREA_MODELS.find(x => x.id === model) || KREA_MODELS[0];
    const dims = format === '9:16' ? { width: 768, height: 1344 } : { width: 1024, height: 1024 };

    setBusy(true);
    setStatus({ state: 'queued', message: 'Munka beküldve...' });
    try {
      const submit = await fetch(`https://api.krea.ai/generate/image/${m.path}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, ...dims }),
      });
      if (!submit.ok) {
        const t = await submit.text();
        throw new Error(`API ${submit.status}: ${t.slice(0, 200)}`);
      }
      const job = await submit.json();
      const jobId = job.job_id || job.id;
      if (!jobId) {
        // Some endpoints may return the image synchronously.
        const direct = extractImageUrl(job);
        if (direct) {
          await downloadAndSave(direct, m.id);
          return;
        }
        throw new Error('Nincs job_id a válaszban.');
      }

      setStatus({ state: 'polling', message: 'Generálás fut... (10–60 mp)' });
      const start = Date.now();
      let imageUrl = null;
      while (Date.now() - start < 180000) {
        await new Promise(r => setTimeout(r, 2000));
        const pr = await fetch(`https://api.krea.ai/jobs/${jobId}`, {
          headers: { 'Authorization': `Bearer ${apiKey.trim()}` },
        });
        if (!pr.ok) continue;
        const pj = await pr.json();
        const s = (pj.status || '').toLowerCase();
        if (s === 'completed' || s === 'succeeded' || s === 'done' || s === 'success') {
          imageUrl = extractImageUrl(pj);
          break;
        }
        if (s === 'failed' || s === 'error' || s === 'canceled' || s === 'cancelled') {
          throw new Error(pj.error || pj.message || 'Generálás sikertelen');
        }
        setStatus({ state: 'polling', message: `Állapot: ${s || 'futás'}...` });
      }
      if (!imageUrl) throw new Error('Időtúllépés vagy hiányzó kép URL.');
      await downloadAndSave(imageUrl, m.id);
    } catch (e) {
      console.error('Krea error:', e);
      const msg = e.message && e.message !== 'Failed to fetch'
        ? e.message
        : 'Hálózati / CORS hiba. A Krea API-t böngészőből közvetlenül elérni CORS miatt általában nem lehet — lehet, hogy proxyra van szükséged.';
      setStatus({ state: 'error', message: msg });
    } finally {
      setBusy(false);
    }
  };

  const downloadAndSave = async (imageUrl, modelId) => {
    setStatus({ state: 'downloading', message: 'Kép letöltése...' });
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) throw new Error(`Kép letöltés ${imgRes.status}`);
    const blob = await imgRes.blob();
    const name = `krea-${modelId}-${Date.now()}.png`;
    await onGenerated(blob, name);
    setStatus({ state: 'done', message: 'Kész! Háttérként beállítva.' });
    setTimeout(() => setStatus(null), 3500);
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="text-[10.5px] uppercase tracking-[0.12em] text-[#6B777C] mb-1.5 font-medium flex items-center justify-between"
          style={{ fontFamily: '"DM Sans", sans-serif' }}>
          <span>Krea API kulcs</span>
          {apiKey && (
            <button onClick={() => setShowKey(s => !s)} className="text-[#2DB5A8] normal-case tracking-normal">
              {showKey ? 'elrejt' : 'mutat'}
            </button>
          )}
        </div>
        <input
          type={showKey ? 'text' : 'password'}
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          placeholder="krea_..."
          className="w-full text-[12px] text-white bg-[#0E1417] border border-[#1C262A] px-2.5 py-2 outline-none focus:border-[#2DB5A8] placeholder:text-[#4B5458]"
          style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
        />
        <div className="text-[10px] text-[#4B5458] mt-1 leading-relaxed">
          A kulcs csak ebben a böngészőben (localStorage) tárolódik. Szerezhető itt: krea.ai/settings/api-tokens
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1">
        {KREA_MODELS.map(m => (
          <button key={m.id}
            onClick={() => setModel(m.id)}
            className="text-[10.5px] py-2 px-1 transition-colors"
            style={{
              fontFamily: '"DM Sans", sans-serif',
              background: model === m.id ? '#2DB5A8' : '#0E1417',
              color: model === m.id ? '#0B0F10' : '#B8C2C6',
              border: '1px solid ' + (model === m.id ? '#2DB5A8' : '#1C262A'),
              fontWeight: 500,
            }}>
            {m.label}
          </button>
        ))}
      </div>

      <div>
        <div className="text-[10.5px] uppercase tracking-[0.12em] text-[#6B777C] mb-1.5 font-medium"
          style={{ fontFamily: '"DM Sans", sans-serif' }}>Prompt</div>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={3}
          className="w-full text-[11.5px] text-white bg-[#0E1417] border border-[#1C262A] p-2.5 outline-none focus:border-[#2DB5A8] resize-none leading-snug"
          style={{ fontFamily: '"DM Sans", sans-serif' }}
        />
        <div className="text-[10px] text-[#4B5458] mt-1">
          Méret: {format === '9:16' ? '768×1344 (story)' : '1024×1024 (feed)'}
        </div>
      </div>

      <button
        onClick={generate}
        disabled={busy}
        className="w-full py-2.5 text-[12px] font-bold tracking-wider transition-colors flex items-center justify-center gap-2"
        style={{
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          background: busy ? '#1F8B82' : '#2DB5A8',
          color: '#0B0F10',
          letterSpacing: '0.06em',
          cursor: busy ? 'not-allowed' : 'pointer',
        }}
      >
        {busy ? (
          <>
            <span className="inline-block w-3 h-3 border-2 border-[#0B0F10] border-t-transparent rounded-full animate-spin" />
            GENERÁLÁS...
          </>
        ) : 'GENERÁLJ HÁTTERET'}
      </button>

      {status && (
        <div className="text-[11px] leading-snug p-2 border"
          style={{
            color: status.state === 'error' ? '#FF6B6B' : status.state === 'done' ? '#2DB5A8' : '#B8C2C6',
            borderColor: status.state === 'error' ? 'rgba(255,107,107,0.4)' : '#1C262A',
            background: status.state === 'error' ? 'rgba(255,107,107,0.08)' : '#0E1417',
          }}>
          {status.message}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { VariantList, SettingsPanel, AIAssistant, KreaGenerator, Toggle });
