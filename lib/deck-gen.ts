/**
 * deck-gen.ts - Generate self-contained HTML decks (reports + slides)
 * Pure renderer: takes a DeckInput, returns an HTML string.
 *
 * Modes:
 *   "report" (default) - dark GitHub-style scrollable report
 *   "slides" - white paper on gray canvas, per-slide color accents
 */

export type Section = { type: string; [k: string]: any };

export type DeckInput = {
  title?: string;
  subtitle?: string;
  description?: string;
  mode?: "report" | "slides";
  theme?: "dark" | "light";
  accent?: string;
  sections: Section[];
  footer?: string;
  footerLeft?: string;
  footerRight?: string;
};

const DIAGRAMS_URL = "https://diagrams-bheng.vercel.app";

// ---- Helpers ----
const esc = (s: any) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const badge = (text: any, status?: string) => `<span class="badge b-${status || "accent"}">${esc(text)}</span>`;
const colorClass = (c?: string) => c ? `c-${c}` : "";

// ---- Per-slide accent colors (cycle through for variety) ----
const SLIDE_COLORS = [
  { accent: "#ef4444", bg: "#ef4444", light: "#fef2f2" },
  { accent: "#f97316", bg: "#f97316", light: "#fff7ed" },
  { accent: "#f59e0b", bg: "#f59e0b", light: "#fffbeb" },
  { accent: "#84cc16", bg: "#84cc16", light: "#f7fee7" },
  { accent: "#10b981", bg: "#10b981", light: "#ecfdf5" },
  { accent: "#14b8a6", bg: "#14b8a6", light: "#f0fdfa" },
  { accent: "#06b6d4", bg: "#06b6d4", light: "#ecfeff" },
  { accent: "#3b82f6", bg: "#3b82f6", light: "#eff6ff" },
  { accent: "#6366f1", bg: "#6366f1", light: "#eef2ff" },
  { accent: "#8b5cf6", bg: "#8b5cf6", light: "#f5f3ff" },
  { accent: "#ec4899", bg: "#ec4899", light: "#fdf2f8" },
  { accent: "#f43f5e", bg: "#f43f5e", light: "#fff1f2" },
];

function getSlideColor(i: number) {
  return SLIDE_COLORS[i % SLIDE_COLORS.length];
}

// ---- Lucide-style SVG icons (stroke, 24x24) ----
const ICONS: Record<string, string> = {
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  data: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>',
  ai: '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
  sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/>',
  api: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/>',
  code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  monitor: '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/>',
  timer: '<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>',
  wifi: '<path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/>',
  cpu: '<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>',
  workflow: '<rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/>',
  image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  hash: '<line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/>',
  boxes: '<path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42z"/><path d="m7 16.5-4.74-2.85"/><path d="m7 16.5 5-3"/><path d="M7 16.5v5.17"/><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3z"/><path d="m17 16.5-5-3"/><path d="m17 16.5 4.74-2.85"/><path d="M17 16.5v5.17"/><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0z"/><path d="M12 8 7.26 5.15"/><path d="m12 8 4.74-2.85"/><path d="M12 13.5V8"/>',
};

function iconSvg(name: string, size = 48, color = "currentColor") {
  const d = ICONS[name] || ICONS.layers;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
}

// ---- Styles ----
const CSS_DARK = `
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #0d1117; color: #c9d1d9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; padding: 40px; max-width: 1200px; margin: 0 auto; }
h1 { font-size: 32px; font-weight: 800; color: #f0f6fc; margin-bottom: 4px; }
.subtitle { font-size: 18px; color: #8b949e; margin-bottom: 8px; font-weight: 400; }
.desc { font-size: 13px; color: #6e7681; margin-bottom: 32px; }
.section { margin-bottom: 32px; }
.section-title { font-size: 13px; font-weight: 700; color: #8b949e; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; border-bottom: 1px solid #21262d; padding-bottom: 8px; }
.cards { display: flex; gap: 12px; flex-wrap: wrap; }
.card { flex: 1; min-width: 120px; background: #161b22; border: 1px solid #21262d; border-radius: 10px; padding: 16px; text-align: center; }
.card-value { font-size: 32px; font-weight: 700; line-height: 1.2; }
.card-label { font-size: 11px; color: #8b949e; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px; }
.c-pass { color: #3fb950; } .c-fail { color: #f85149; } .c-warn { color: #d29922; } .c-manual { color: #a371f7; } .c-total { color: #58a6ff; }
table { width: 100%; border-collapse: collapse; background: #161b22; border-radius: 10px; overflow: hidden; border: 1px solid #21262d; }
th { background: #1c2128; font-size: 11px; font-weight: 700; color: #8b949e; text-transform: uppercase; padding: 10px 14px; text-align: left; }
td { padding: 10px 14px; font-size: 13px; border-top: 1px solid #21262d; }
tr.row-pass { background: rgba(63,185,80,0.06); } tr.row-fail { background: rgba(248,81,73,0.06); } tr.row-warn { background: rgba(210,153,34,0.06); }
.badge { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.b-pass { background: rgba(63,185,80,0.15); color: #3fb950; border: 1px solid rgba(63,185,80,0.3); }
.b-fail { background: rgba(248,81,73,0.15); color: #f85149; border: 1px solid rgba(248,81,73,0.3); }
.b-warn { background: rgba(210,153,34,0.15); color: #d29922; border: 1px solid rgba(210,153,34,0.3); }
.b-accent { background: rgba(88,166,255,0.15); color: #58a6ff; border: 1px solid rgba(88,166,255,0.3); }
.kv-grid { display: grid; grid-template-columns: 200px 1fr; gap: 1px; background: #21262d; border-radius: 10px; overflow: hidden; border: 1px solid #21262d; }
.kv-key { background: #1c2128; padding: 10px 14px; font-size: 12px; font-weight: 600; color: #8b949e; }
.kv-val { background: #161b22; padding: 10px 14px; font-size: 13px; color: #c9d1d9; }
.badges-wrap { display: flex; gap: 8px; flex-wrap: wrap; }
pre { background: #161b22; border: 1px solid #21262d; border-radius: 10px; padding: 16px; font-size: 13px; line-height: 1.6; overflow-x: auto; color: #c9d1d9; font-family: 'JetBrains Mono', monospace; }
.diagram-wrap { background: #fff; border-radius: 12px; padding: 24px; border: 1px solid #21262d; overflow: hidden; }
.diagram-wrap svg { max-width: 100%; height: auto; }
.diagram-ref { display: flex; align-items: center; gap: 8px; margin-top: 8px; font-size: 11px; color: #8b949e; }
.diagram-ref a { color: #58a6ff; text-decoration: none; }
footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #21262d; display: flex; justify-content: space-between; font-size: 11px; color: #484f58; }
`;

function buildLightCss(accent: string) {
  return `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
* { margin: 0; padding: 0; box-sizing: border-box; }
:root { --accent: ${accent}; --fg: #1a1a2e; --muted: #64748b; --border: #e2e8f0; --surface: #f8fafc; }
body { background: #e8ecf1; color: var(--fg); font-family: 'Inter', -apple-system, sans-serif; overflow: hidden; }

/* White paper on gray canvas - square */
.slide { width: 100vw; height: 100vh; display: none; align-items: center; justify-content: center; background: #e8ecf1; overflow: hidden; }
.slide.active { display: flex; }
.slide-paper { background: #ffffff; width: 1280px; height: 720px; flex-shrink: 0; transform: scale(var(--deck-scale, 1)); transform-origin: center center; border-radius: 0; box-shadow: 0 4px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04); padding: 48px 64px 44px; display: flex; flex-direction: column; position: relative; overflow: hidden; }
.slide-footer { position: absolute; bottom: 16px; left: 56px; right: 56px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #94a3b8; padding-top: 12px; }
.slide-footer .footer-text { color: #6b7280; }
.slide-footer .footer-sep { color: #d1d5db; }
.slide-footer .slide-num { font-variant-numeric: tabular-nums; }
.slide-footer .slide-current { color: var(--slide-accent, #94a3b8); font-weight: 700; }
.slide-footer .slide-total { color: #94a3b8; }
.slide-footer .slide-num { font-variant-numeric: tabular-nums; }
/* Rainbow progress bar at bottom of page */
.rainbow-progress { position: fixed; bottom: 0; left: 0; right: 0; height: 6px; z-index: 100; display: flex; }
.rainbow-progress .rp-seg { height: 100%; transition: opacity 0.3s ease; opacity: 0.15; }
.rainbow-progress .rp-seg.rp-active { opacity: 1; }

/* Report mode */
.report-body { padding: 40px; max-width: 1200px; margin: 0 auto; }
.report-body .section { margin-bottom: 32px; }

h1 { font-size: 52px; font-weight: 900; color: var(--fg); letter-spacing: -0.03em; line-height: 1.05; }
h2 { font-size: 32px; font-weight: 800; color: var(--fg); letter-spacing: -0.02em; margin-bottom: 20px; line-height: 1.1; }
h2.has-subtitle { margin-bottom: 4px; }
.subtitle { font-size: 22px; color: #94a3b8; margin-top: 8px; line-height: 1.4; font-weight: 400; }
.desc { font-size: 14px; color: #b0b8c4; margin-bottom: 32px; }
.section-title { font-size: 32px; font-weight: 800; color: var(--fg); letter-spacing: -0.02em; margin-bottom: 20px; line-height: 1.1; }
.section-title.has-subtitle { margin-bottom: 4px; }
.slide-subtitle { font-size: 16px; color: #94a3b8; margin-bottom: 20px; font-weight: 400; line-height: 1.4; }

/* Cards */
.cards { display: flex; gap: 16px; flex-wrap: wrap; }
.card { flex: 1; min-width: 140px; background: var(--surface); border: 1px solid var(--border); border-radius: 0; padding: 24px; text-align: center; transition: transform 0.2s, box-shadow 0.2s; }
.card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
.card-value { font-size: 40px; font-weight: 900; line-height: 1.1; }
.card-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; margin-top: 6px; font-weight: 600; }
.c-pass, .c-fail, .c-warn, .c-manual, .c-total { color: var(--slide-accent, #3b82f6); }

/* Table */
table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 0; overflow: hidden; border: 1px solid var(--border); }
th { background: #f8fafc; font-size: 10px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; padding: 8px 12px; text-align: left; }
td { padding: 7px 12px; font-size: 13px; border-top: 1px solid var(--border); }
tr.row-pass, tr.row-fail, tr.row-warn { background: color-mix(in srgb, var(--slide-accent, #3b82f6) 4%, transparent); }

.badge { display: inline-block; padding: 3px 12px; border-radius: 0; font-size: 12px; font-weight: 600; }
.b-pass, .b-fail, .b-warn, .b-accent { background: color-mix(in srgb, var(--slide-accent, #3b82f6) 10%, transparent); color: var(--slide-accent, #3b82f6); border: 1px solid color-mix(in srgb, var(--slide-accent, #3b82f6) 20%, transparent); font-size: 11px; padding: 2px 8px; }

.kv-grid { display: grid; grid-template-columns: 200px 1fr; gap: 1px; background: var(--border); border-radius: 0; overflow: hidden; border: 1px solid var(--border); }
.kv-key { background: #f8fafc; padding: 12px 16px; font-size: 13px; font-weight: 600; color: var(--muted); }
.kv-val { background: #fff; padding: 12px 16px; font-size: 14px; }
.badges-wrap { display: flex; gap: 8px; flex-wrap: wrap; }
pre { background: var(--surface); border: 1px solid var(--border); border-radius: 0; padding: 16px 20px; font-size: 12px; line-height: 1.6; overflow-x: auto; font-family: 'JetBrains Mono', monospace; }
.diagram-wrap { background: #fff; border-radius: 0; padding: 24px; border: 1px solid var(--border); overflow: hidden; }
.diagram-wrap svg { max-width: 100%; height: auto; }
.diagram-ref { display: flex; align-items: center; gap: 8px; margin-top: 8px; font-size: 11px; color: var(--muted); }
.diagram-ref a { color: var(--accent); text-decoration: none; }

/* ---- Cover slide ---- */
.cover-content { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.cover-accent-bar { width: 64px; height: 5px; border-radius: 0; margin-bottom: 32px; }
.cover-meta { font-size: 14px; color: var(--muted); margin-top: 20px; font-weight: 500; }
.cover-date { font-size: 13px; color: #cbd5e1; margin-top: 6px; }

/* ---- Feature slide: hero card layout ---- */
.feature-layout { flex: 1; display: flex; gap: 40px; align-items: center; }
.feature-left { flex: 1; }
.feature-right { flex: 1; display: flex; justify-content: center; }
.feature-icon-hero { width: 200px; height: 200px; border-radius: 0; display: flex; align-items: center; justify-content: center; background: var(--slide-accent, #3b82f6) !important; }
.feature-desc { font-size: 17px; color: var(--muted); margin-bottom: 24px; line-height: 1.6; max-width: 500px; }
.feature-bullets { list-style: none; padding: 0; }
.feature-bullets li { padding: 10px 0; font-size: 15px; font-weight: 500; display: flex; align-items: center; gap: 14px; color: var(--fg); }
.feature-bullet-dot { width: 8px; height: 8px; border-radius: 0; flex-shrink: 0; }

/* ---- Stack grid ---- */
.stack-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; flex: 1; align-content: start; }
.stack-group { background: #fff; border: 1px solid var(--border); border-radius: 0; padding: 24px; transition: transform 0.2s; }
.stack-group:hover { transform: translateY(-2px); }
.stack-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; }
.stack-icon { margin-bottom: 8px; }
.stack-item { font-size: 14px; padding: 6px 0; color: var(--fg); border-bottom: 1px solid #f1f5f9; }
.stack-item:last-child { border-bottom: none; }

/* ---- Checklist ---- */
.checklist-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; flex: 1; align-content: start; }
.checklist-col h3 { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 16px; }
.checklist-col.done h3 { color: var(--slide-accent, #10b981); }
.checklist-col.todo h3 { color: var(--slide-accent, #f59e0b); opacity: 0.5; }
.check-item { padding: 10px 0; font-size: 15px; display: flex; align-items: center; gap: 12px; font-weight: 500; }
.check-done-icon { color: var(--slide-accent, #10b981); flex-shrink: 0; }
.check-todo-icon { color: var(--slide-accent, #f59e0b); opacity: 0.4; flex-shrink: 0; }

/* ---- Roadmap ---- */
.roadmap-list { position: relative; padding-left: 32px; flex: 1; }
.roadmap-list::before { content: ''; position: absolute; left: 11px; top: 12px; bottom: 12px; width: 2px; background: var(--border); }
.roadmap-item { position: relative; padding: 16px 0; }
.roadmap-dot { position: absolute; left: -28px; top: 22px; width: 14px; height: 14px; border-radius: 0; border: 3px solid #fff; box-shadow: 0 0 0 2px var(--border); }
.roadmap-label { font-size: 18px; font-weight: 700; }
.roadmap-detail { font-size: 14px; color: var(--muted); margin-top: 3px; }

/* ---- Summary ---- */
.summary-points { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; flex: 1; align-content: center; }
.summary-point { background: #fff; border: 1px solid var(--border); border-radius: 0; padding: 24px 28px; font-size: 17px; font-weight: 600; display: flex; align-items: center; gap: 16px; transition: transform 0.2s; }
.summary-point:hover { transform: translateY(-2px); }
.summary-check { flex-shrink: 0; }

/* ---- Versus (problem vs solution) ---- */
.versus-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; flex: 1; align-content: start; }
.versus-col { background: #fff; border: 1px solid var(--border); border-radius: 0; padding: 32px; display: flex; flex-direction: column; }
.versus-col.versus-problem { border-top: 4px solid #ef4444; }
.versus-col.versus-solution { border-top: 4px solid #10b981; }
.versus-icon-wrap { width: 56px; height: 56px; border-radius: 0; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
.versus-col-title { font-size: 20px; font-weight: 800; margin-bottom: 8px; }
.versus-col-desc { font-size: 14px; color: var(--muted); line-height: 1.6; margin-bottom: 20px; }
.versus-bullets { list-style: none; padding: 0; flex: 1; }
.versus-bullets li { padding: 8px 0; font-size: 14px; font-weight: 500; display: flex; align-items: flex-start; gap: 10px; }
.versus-bullet-icon { flex-shrink: 0; margin-top: 2px; }

/* ---- Timeline (single vertical line, done=filled, todo=open) ---- */
.timeline-wrap { flex: 1; overflow-y: auto; }
.timeline-line { position: relative; padding-left: 40px; max-width: 700px; }
.timeline-line::before { content: ''; position: absolute; left: 15px; top: 0; bottom: 0; width: 2px; background: linear-gradient(to bottom, #e2e8f0 0%, #e2e8f0 var(--split), #10b981 var(--split), #10b981 100%); }
.timeline-divider { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; padding: 12px 0 8px; position: relative; }
.timeline-divider.tl-done-label { color: #10b981; }
.timeline-divider.tl-todo-label { color: #f59e0b; margin-top: 8px; }
.timeline-item { position: relative; padding: 8px 0; }
.timeline-dot { position: absolute; left: -33px; top: 12px; width: 16px; height: 16px; border-radius: 0; display: flex; align-items: center; justify-content: center; }
.timeline-dot.dot-done { background: #10b981; }
.timeline-dot.dot-todo { background: #fff; border: 2.5px solid #d1d5db; }
.timeline-dot svg { width: 10px; height: 10px; }
.timeline-label { font-size: 15px; font-weight: 500; color: var(--fg); }
.timeline-label-todo { color: var(--muted); }

/* ---- Stackcards (stack + stats on one slide) ---- */
.stackcards-layout { flex: 1; display: flex; flex-direction: column; gap: 24px; }
.stackcards-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.stackcards-group { background: #fff; border: 1px solid var(--border); border-radius: 0; padding: 18px; }
.stackcards-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
.stackcards-icon { margin-bottom: 6px; }
.stackcards-item { font-size: 13px; padding: 4px 0; color: var(--fg); border-bottom: 1px solid #f1f5f9; }
.stackcards-item:last-child { border-bottom: none; }
.stackcards-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.stackcards-stat { background: var(--surface); border: 1px solid var(--border); border-radius: 0; padding: 20px; text-align: center; }
.stackcards-stat-value { font-size: 32px; font-weight: 900; line-height: 1.1; }
.stackcards-stat-label { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; margin-top: 4px; font-weight: 600; }
`;
}

// ---- Diagram handler ----
async function renderDiagram(section: Section): Promise<string> {
  const { code, title: diagTitle } = section;
  const API_SECRET = process.env.AI_API_SECRET || "";
  let svgHtml = "";
  let diagramId = "";
  let diagramUrl = "";

  try {
    const postRes = await fetch(`${DIAGRAMS_URL}/api/ai/diagrams`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${API_SECRET}`, "Content-Type": "application/json" },
      body: JSON.stringify({ title: diagTitle || "Deck Diagram", diagramType: "sequence", code }),
    });

    if (postRes.ok) {
      const postData = await postRes.json();
      diagramId = postData.id || "";
      diagramUrl = postData.url || `${DIAGRAMS_URL}/diagrams/${diagramId}`;
    }

    svgHtml = `
      <div class="diagram-wrap">
        <div style="min-height: 200px; display: flex; align-items: center; justify-content: center;">
          <pre class="mermaid">${esc(code)}</pre>
        </div>
      </div>
      ${diagramId ? `<div class="diagram-ref"><span>Source diagram</span> - <a href="${diagramUrl}" target="_blank">${diagramId.substring(0, 8)}... &#8599;</a></div>` : ""}
    `;
  } catch {
    svgHtml = `<div class="diagram-wrap"><pre>${esc(code)}</pre></div>`;
  }

  return svgHtml;
}

// ---- Subtitle helper ----
function subtitleHtml(s: Section) {
  return s.subtitle ? `<div class="slide-subtitle">${esc(s.subtitle)}</div>` : "";
}
function titleHtml(s: Section, fallback?: string) {
  const t = s.title || fallback || "";
  const hasSub = !!s.subtitle;
  return `<h2${hasSub ? ' class="has-subtitle"' : ''}>${esc(t)}</h2>${subtitleHtml(s)}`;
}

// ---- Section renderers ----
function renderCards(s: Section) {
  return `<div class="cards">${(s.cards || []).map((c: any) =>
    `<div class="card"><div class="card-value ${colorClass(c.color)}">${esc(c.value)}</div><div class="card-label">${esc(c.label)}</div></div>`
  ).join("")}</div>`;
}

function renderTable(s: Section) {
  const cols = s.columns || [];
  const head = `<tr>${cols.map((c: any) => `<th>${esc(c)}</th>`).join("")}</tr>`;
  const rows = (s.rows || []).map((r: any) => {
    if (Array.isArray(r)) return `<tr>${r.map((c: any) => `<td>${esc(c)}</td>`).join("")}</tr>`;
    const cls = r.status ? ` class="row-${r.status}"` : "";
    const cells = [...r.cells];
    if (r.status) cells[0] = badge(cells[0] || r.status, r.status);
    return `<tr${cls}>${cells.map((c: any, i: number) => `<td>${i === 0 && r.status ? c : esc(c)}</td>`).join("")}</tr>`;
  }).join("");
  return `<table><thead>${head}</thead><tbody>${rows}</tbody></table>`;
}

function renderKv(s: Section) {
  return `<div class="kv-grid">${(s.pairs || []).map((p: any) =>
    `<div class="kv-key">${esc(p.key)}</div><div class="kv-val">${p.status ? badge(p.value, p.status) : esc(p.value)}</div>`
  ).join("")}</div>`;
}

function renderBadges(s: Section) {
  return `<div class="badges-wrap">${(s.items || []).map((b: any) => badge(b.label, b.status)).join("")}</div>`;
}

function renderText(s: Section) {
  return s.pre ? `<pre>${esc(s.content || "")}</pre>` : `<p style="font-size:14px;line-height:1.7;">${esc(s.content || "").replace(/\n/g, "<br>")}</p>`;
}

function renderCover(s: Section, _sc: any) {
  const dots = SLIDE_COLORS.map((c, i) => {
    const sizes = [80, 48, 32, 64, 24, 40, 56, 36, 28, 44, 60, 52];
    const tops = [8, 18, 55, 72, 35, 85, 12, 62, 42, 28, 78, 48];
    const lefts = [65, 82, 90, 72, 58, 78, 94, 68, 86, 76, 60, 92];
    const size = sizes[i % sizes.length];
    const top = tops[i % tops.length];
    const left = lefts[i % lefts.length];
    return `<div style="position:absolute;top:${top}%;left:${left}%;width:${size}px;height:${size}px;border-radius:50%;background:${c.accent};opacity:0.12;"></div>`;
  }).join("");
  return `
    <div style="position:absolute;inset:0;overflow:hidden;pointer-events:none;">${dots}</div>
    <div class="cover-content" style="position:relative;z-index:1;">
      <h1>${esc(s.title || "")}</h1>
      ${s.subtitle ? `<div class="subtitle" style="font-size:22px;margin-top:12px;">${esc(s.subtitle)}</div>` : ""}
      ${s.meta ? `<div class="cover-meta">${esc(s.meta)}</div>` : ""}
      ${s.date ? `<div class="cover-date">${esc(s.date)}</div>` : ""}
    </div>
  `;
}

function renderFeature(s: Section, sc: any) {
  const bullets = (s.bullets || []).map((b: any) =>
    `<li><span class="feature-bullet-dot" style="background: ${sc.accent};"></span>${esc(b)}</li>`
  ).join("");
  return `
    ${titleHtml(s)}
    <div class="feature-layout">
      <div class="feature-left">
        ${s.description ? `<div class="feature-desc">${esc(s.description)}</div>` : ""}
        ${bullets ? `<ul class="feature-bullets">${bullets}</ul>` : ""}
      </div>
      <div class="feature-right">
        <div class="feature-icon-hero" style="background: ${sc.accent};">
          ${iconSvg(s.icon || "layers", 80, "#ffffff")}
        </div>
      </div>
    </div>
  `;
}

const STACK_ICONS: Record<string, string> = {
  frontend: "monitor", backend: "cpu", data: "database", infra: "cloud",
  ai: "sparkles", testing: "scan", security: "shield", devops: "workflow",
  framework: "layers", assertions: "check", infrastructure: "cloud",
  serialization: "hash", api: "api", auth: "lock", tools: "settings",
  deployment: "rocket", monitoring: "eye", messaging: "bell",
  storage: "database", network: "wifi", compute: "cpu", analytics: "chart",
};
const STACK_ICON_FALLBACKS = ["boxes", "layers", "code", "settings", "cpu", "hash", "globe", "workflow"];

function renderStackcards(s: Section, sc: any) {
  const groups = (s.groups || []).map((g: any, gi: number) => {
    const iconName = STACK_ICONS[g.label.toLowerCase()] || STACK_ICON_FALLBACKS[gi % STACK_ICON_FALLBACKS.length];
    return `
    <div class="stackcards-group">
      <div class="stackcards-icon">${iconSvg(iconName, 22, sc.accent)}</div>
      <div class="stackcards-label" style="color: ${sc.accent};">${esc(g.label)}</div>
      ${(g.items || []).map((i: any) => `<div class="stackcards-item">${esc(i)}</div>`).join("")}
    </div>`;
  }).join("");
  const stats = (s.cards || []).map((c: any) => `
    <div class="stackcards-stat">
      <div class="stackcards-stat-value ${colorClass(c.color)}">${esc(c.value)}</div>
      <div class="stackcards-stat-label">${esc(c.label)}</div>
    </div>
  `).join("");
  return `
    ${titleHtml(s, "Tech Stack")}
    <div class="stackcards-layout">
      <div class="stackcards-grid">${groups}</div>
      <div class="stackcards-stats">${stats}</div>
    </div>
  `;
}

function renderTimeline(s: Section) {
  const done = s.done || [];
  const todo = s.todo || [];
  const total = done.length + todo.length;
  const checkSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>`;

  const todoHtml = todo.map((t: any) => `
    <div class="timeline-item">
      <div class="timeline-dot dot-todo"></div>
      <div class="timeline-label timeline-label-todo">${esc(t)}</div>
    </div>
  `).join("");

  const doneHtml = done.map((d: any) => `
    <div class="timeline-item">
      <div class="timeline-dot dot-done">${checkSvg}</div>
      <div class="timeline-label">${esc(d)}</div>
    </div>
  `).join("");

  const todoPct = total > 0 ? Math.round((todo.length / total) * 100) : 50;

  return `
    ${titleHtml(s, "Status & Roadmap")}
    <div class="timeline-wrap">
      <div class="timeline-line" style="--split: ${todoPct}%;">
        <div class="timeline-divider tl-todo-label">Coming Next</div>
        ${todoHtml}
        <div class="timeline-divider tl-done-label">Implemented</div>
        ${doneHtml}
      </div>
    </div>
  `;
}

function renderVersus(s: Section) {
  const xSvg = iconSvg("x", 16, "#ef4444");
  const checkSvg = iconSvg("check", 16, "#10b981");
  const problemBullets = (s.problem?.bullets || []).map((b: any) =>
    `<li><span class="versus-bullet-icon">${xSvg}</span>${esc(b)}</li>`
  ).join("");
  const solutionBullets = (s.solution?.bullets || []).map((b: any) =>
    `<li><span class="versus-bullet-icon">${checkSvg}</span>${esc(b)}</li>`
  ).join("");
  return `
    ${titleHtml(s)}
    <div class="versus-layout">
      <div class="versus-col versus-problem">
        <div class="versus-icon-wrap" style="background: #fef2f2;">
          ${iconSvg(s.problem?.icon || "x", 28, "#ef4444")}
        </div>
        <div class="versus-col-title" style="color: #ef4444;">${esc(s.problem?.title || "Problem")}</div>
        <div class="versus-col-desc">${esc(s.problem?.description || "")}</div>
        <ul class="versus-bullets">${problemBullets}</ul>
      </div>
      <div class="versus-col versus-solution">
        <div class="versus-icon-wrap" style="background: #ecfdf5;">
          ${iconSvg(s.solution?.icon || "check", 28, "#10b981")}
        </div>
        <div class="versus-col-title" style="color: #10b981;">${esc(s.solution?.title || "Solution")}</div>
        <div class="versus-col-desc">${esc(s.solution?.description || "")}</div>
        <ul class="versus-bullets">${solutionBullets}</ul>
      </div>
    </div>
  `;
}

function renderStack(s: Section, sc: any) {
  const groups = (s.groups || []).map((g: any, gi: number) => {
    const iconName = STACK_ICONS[g.label.toLowerCase()] || STACK_ICON_FALLBACKS[gi % STACK_ICON_FALLBACKS.length];
    return `
    <div class="stack-group">
      <div class="stack-icon">${iconSvg(iconName, 28, sc.accent)}</div>
      <div class="stack-label" style="color: ${sc.accent};">${esc(g.label)}</div>
      ${(g.items || []).map((i: any) => `<div class="stack-item">${esc(i)}</div>`).join("")}
    </div>
  `}).join("");
  return `${titleHtml(s, "Tech Stack")}<div class="stack-grid">${groups}</div>`;
}

function renderChecklist(s: Section, sc: any) {
  const checkSvg = iconSvg("check", 18, sc.accent);
  const circleSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${sc.accent}" stroke-width="2" opacity="0.4"><circle cx="12" cy="12" r="10"/></svg>`;
  const done = (s.done || []).map((d: any) => `<div class="check-item"><span class="check-done-icon">${checkSvg}</span>${esc(d)}</div>`).join("");
  const todo = (s.todo || []).map((t: any) => `<div class="check-item"><span class="check-todo-icon">${circleSvg}</span>${esc(t)}</div>`).join("");
  return `
    ${titleHtml(s, "Status")}
    <div class="checklist-cols">
      <div class="checklist-col done"><h3>Implemented</h3>${done}</div>
      <div class="checklist-col todo"><h3>TODO</h3>${todo}</div>
    </div>
  `;
}

function renderRoadmap(s: Section, sc: any) {
  const items = (s.items || []).map((item: any) => {
    return `
    <div class="roadmap-item">
      <div class="roadmap-dot" style="background: ${sc.accent};"></div>
      <div class="roadmap-label">${esc(item.label)}</div>
      ${item.detail ? `<div class="roadmap-detail">${esc(item.detail)}</div>` : ""}
    </div>
  `}).join("");
  return `${titleHtml(s, "Roadmap")}<div class="roadmap-list">${items}</div>`;
}

function renderSummary(s: Section, sc: any) {
  const points = (s.points || []).map((p: any) => {
    return `<div class="summary-point"><span class="summary-check">${iconSvg("check", 22, sc.accent)}</span>${esc(p)}</div>`;
  }).join("");
  return `${titleHtml(s, "Summary")}<div class="summary-points">${points}</div>`;
}

// ---- Build HTML ----
export async function renderDeck(data: DeckInput): Promise<string> {
  const mode = data.mode || "report";
  const theme = data.theme || (mode === "slides" ? "light" : "dark");
  const accent = data.accent || "#58a6ff";
  const footerText = data.footer || "";

  const sections = data.sections || [];
  const isSlides = mode === "slides";
  const css = theme === "light" ? buildLightCss(accent) : CSS_DARK;
  const now = new Date();
  const createdDate = now.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  const createdTime = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const slideFooter = footerText || `<span class="footer-text">${esc(data.title || "Deck")}</span> <span class="footer-sep">|</span> <span class="footer-text">BH</span> <span class="footer-sep">|</span> <span class="footer-text">${createdDate} ${createdTime}</span>`;

  let bodyHtml = "";

  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    const sc = getSlideColor(i);
    let inner = "";

    switch (s.type) {
      case "cards":     inner = renderCards(s); break;
      case "table":     inner = renderTable(s); break;
      case "kv":        inner = renderKv(s); break;
      case "badges":    inner = renderBadges(s); break;
      case "text":      inner = renderText(s); break;
      case "html":      inner = s.content || ""; break;
      case "diagram":   inner = await renderDiagram(s); break;
      case "cover":     inner = renderCover(s, sc); break;
      case "feature":   inner = renderFeature(s, sc); break;
      case "stack":     inner = renderStack(s, sc); break;
      case "checklist": inner = renderChecklist(s, sc); break;
      case "roadmap":   inner = renderRoadmap(s, sc); break;
      case "summary":   inner = renderSummary(s, sc); break;
      case "versus":     inner = renderVersus(s); break;
      case "timeline":   inner = renderTimeline(s); break;
      case "stackcards": inner = renderStackcards(s, sc); break;
      default:          inner = `<p style="color:red;">Unknown section type: ${s.type}</p>`;
    }

    const title = (s.title && !["cover", "feature", "stack", "checklist", "roadmap", "summary", "versus", "timeline", "stackcards"].includes(s.type))
      ? `<div class="section-title${s.subtitle ? " has-subtitle" : ""}">${esc(s.title)}</div>${s.subtitle ? `<div class="slide-subtitle">${esc(s.subtitle)}</div>` : ""}` : "";

    if (isSlides) {
      bodyHtml += `<div class="slide${i === 0 ? " active" : ""}" data-slide="${i}" style="--slide-accent: ${sc.accent}; --slide-bg: ${sc.bg}; --slide-light: ${sc.light};">
        <div class="slide-paper">
          ${title}${inner}
          <div class="slide-footer">
            <span>${slideFooter}</span>
            <span class="slide-num"><span class="slide-current">${i + 1}</span> <span class="slide-total">/ ${sections.length}</span></span>
          </div>
        </div>
      </div>\n`;
    } else {
      bodyHtml += `<div class="section">${title}${inner}</div>\n`;
    }
  }

  const hasDiagram = sections.some(s => s.type === "diagram");
  const mermaidScript = hasDiagram ? `<script type="module">import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';mermaid.initialize({startOnLoad:true,theme:'default',securityLevel:'loose'});</script>` : "";

  const rainbowBarHtml = isSlides ? `<div class="rainbow-progress">${sections.map((_, i) => {
    const c = getSlideColor(i);
    return `<div class="rp-seg" data-seg="${i}" style="flex:1;background:${c.accent};"></div>`;
  }).join("")}</div>` : "";

  const slideNav = isSlides ? `
    <script>
      function setDeckScale() {
        const s = Math.min(window.innerWidth / 1280, window.innerHeight / 720) * 0.94;
        document.documentElement.style.setProperty('--deck-scale', String(s));
      }
      setDeckScale();
      window.addEventListener('resize', setDeckScale);
      const slides = document.querySelectorAll('.slide');
      const segs = document.querySelectorAll('.rp-seg');
      let current = 0;
      function go(n) {
        if (n < 0 || n >= slides.length) return;
        slides[current].classList.remove('active');
        current = n;
        slides[current].classList.add('active');
        segs.forEach((s, i) => {
          s.classList.toggle('rp-active', i <= current);
        });
      }
      document.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); go(current + 1); }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); go(current - 1); }
        if (e.key === 'Home') go(0);
        if (e.key === 'End') go(slides.length - 1);
      });
      let touchX = 0;
      document.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; });
      document.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 50) go(current + (dx < 0 ? 1 : -1));
      });
      go(0);
    </script>
  ` : "";

  const wrapStart = isSlides ? "" : '<div class="report-body">';
  const wrapEnd = isSlides ? "" : "</div>";
  const headerHtml = isSlides ? "" : `<h1>${esc(data.title || "Deck")}</h1>${data.subtitle ? `<div class="subtitle">${esc(data.subtitle)}</div>` : ""}${data.description ? `<div class="desc">${esc(data.description)}</div>` : ""}`;
  const footerHtml = isSlides ? "" : `<footer><span>${esc(data.footerLeft || "")}</span><span>${esc(data.footerRight || "")}</span></footer>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(data.title || "Deck")}</title>
<style>${css}</style>
${mermaidScript}
</head>
<body>
${wrapStart}
${headerHtml}
${bodyHtml}
${footerHtml}
${wrapEnd}
${rainbowBarHtml}
${slideNav}
</body>
</html>`;
}
