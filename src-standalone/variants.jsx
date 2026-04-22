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
  { id: "hero", label: "Hero portré" },
  { id: "full-bleed", label: "Teljes háttér" },
  { id: "circle", label: "Kör jelvény" },
];

Object.assign(window, { VARIANTS, CTA_OPTIONS, LAYOUT_OPTIONS });
