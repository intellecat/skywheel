// Default theme. Everything is a CSS variable on .aw-chart, so a page can restyle any chart by
// overriding them (e.g. .aw-chart { --aw-accent: tomato }). `.aw-light` switches to a light palette.

export const THEME_CSS = /* css */ `
.aw-chart {
  --aw-font: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --aw-font-symbols: 'Noto Sans Symbols', 'Noto Sans Symbols 2', 'Apple Symbols', 'Segoe UI Symbol', sans-serif;
  --aw-backdrop: #0b1020;
  --aw-ring: rgba(255, 255, 255, 0.22);
  --aw-ring-inner: rgba(255, 255, 255, 0.14);
  --aw-sign-line: rgba(255, 255, 255, 0.12);
  --aw-sign-opacity: 0.1;
  --aw-tick: rgba(255, 255, 255, 0.3);
  --aw-cusp: rgba(255, 255, 255, 0.16);
  --aw-house-number: rgba(200, 212, 235, 0.45);
  --aw-earth: #15110c;
  --aw-earth-opacity: 0.9;
  --aw-accent: #e8c26a;
  --aw-accent-text: #f3d58a;
  --aw-meridian: rgba(181, 138, 214, 0.75);
  --aw-meridian-text: #dcc2f2;
  --aw-caption: rgba(215, 225, 245, 0.45);
  --aw-caption-dir: rgba(232, 194, 106, 0.7);
  --aw-sect: #ffd36b;
  --aw-text: rgba(222, 230, 242, 0.75);
  --aw-connector: rgba(255, 255, 255, 0.2);
  --aw-halo: rgba(255, 255, 255, 0.06);
  --aw-retro: #ff8f7a;
  --aw-fire: #e8795a;
  --aw-earth-element: #9dbb72;
  --aw-air: #e2c96f;
  --aw-water: #6aa6e0;
  --aw-conjunction: #e8c26a;
  --aw-sextile: #6aa6e0;
  --aw-square: #ff7a66;
  --aw-trine: #7ed39a;
  --aw-opposition: #ff5f7e;
  --aw-minor: #a9b4cc;
  overflow: visible;
  font-family: var(--aw-font);
}
.aw-chart.aw-light {
  --aw-backdrop: #fbfaf6;
  --aw-ring: rgba(20, 24, 40, 0.35);
  --aw-ring-inner: rgba(20, 24, 40, 0.22);
  --aw-sign-line: rgba(20, 24, 40, 0.16);
  --aw-sign-opacity: 0.14;
  --aw-tick: rgba(20, 24, 40, 0.4);
  --aw-cusp: rgba(20, 24, 40, 0.22);
  --aw-house-number: rgba(40, 48, 70, 0.55);
  --aw-earth: #d9cdb8;
  --aw-earth-opacity: 0.55;
  --aw-accent: #b8860b;
  --aw-accent-text: #8a6208;
  --aw-meridian: rgba(120, 80, 170, 0.8);
  --aw-meridian-text: #6a3fa0;
  --aw-caption: rgba(40, 48, 70, 0.5);
  --aw-caption-dir: rgba(150, 110, 20, 0.85);
  --aw-sect: #a86b00;
  --aw-text: rgba(30, 36, 52, 0.8);
  --aw-connector: rgba(20, 24, 40, 0.25);
  --aw-halo: rgba(20, 24, 40, 0.06);
  --aw-retro: #c4412c;
  --aw-sun: #d99a00;
  --aw-moon: #7a8599;
  --aw-mercury: #2f9c83;
  --aw-venus: #d0548a;
  --aw-mars: #d8432c;
  --aw-jupiter: #c77a1c;
  --aw-saturn: #8f7a3c;
  --aw-uranus: #1f9fb8;
  --aw-neptune: #4a5fd6;
  --aw-pluto: #8a5bb0;
  --aw-fire: #d9582f;
  --aw-earth-element: #5f8f35;
  --aw-air: #c9a227;
  --aw-water: #2f7fca;
  --aw-minor: #6b7590;
}
.aw-chart text { dominant-baseline: central; text-anchor: middle; }
.aw-backdrop { fill: var(--aw-backdrop); }
.aw-sign { fill-opacity: var(--aw-sign-opacity); stroke: var(--aw-sign-line); stroke-width: 1; }
.aw-sign.aw-untinted { fill: none; }
.aw-fire { fill: var(--aw-fire); }
.aw-earth-el { fill: var(--aw-earth-element); }
.aw-air { fill: var(--aw-air); }
.aw-water { fill: var(--aw-water); }
.aw-sign-glyph { font: 21px var(--aw-font-symbols); }
.aw-ticks { stroke: var(--aw-tick); stroke-width: 0.8; fill: none; }
.aw-ring { fill: none; stroke: var(--aw-ring); stroke-width: 1; }
.aw-ring-inner { stroke: var(--aw-ring-inner); }
.aw-earth { fill: var(--aw-earth); fill-opacity: var(--aw-earth-opacity); }
.aw-cusp { stroke: var(--aw-cusp); stroke-width: 1; }
.aw-house-number { fill: var(--aw-house-number); font: 10px var(--aw-font); }
.aw-horizon { stroke: var(--aw-accent); stroke-width: 2; }
.aw-meridian { stroke: var(--aw-meridian); stroke-width: 1.3; stroke-dasharray: 5 4; }
.aw-caption { fill: var(--aw-caption); font: 600 9px var(--aw-font); letter-spacing: 0.22em; }
.aw-caption-dir { fill: var(--aw-caption-dir); letter-spacing: 0.14em; }
.aw-sect { cursor: pointer; }
.aw-sect text { fill: var(--aw-sect); font: 500 13px var(--aw-font), var(--aw-font-symbols); }
.aw-angle { cursor: pointer; }
.aw-angle-name { fill: var(--aw-accent-text); font: 700 12px var(--aw-font); letter-spacing: 0.08em; }
.aw-angle-degree { fill: var(--aw-accent-text); fill-opacity: 0.85; font: 11px var(--aw-font), var(--aw-font-symbols); }
.aw-angle-mc .aw-angle-name, .aw-angle-ic .aw-angle-name,
.aw-angle-mc .aw-angle-degree, .aw-angle-ic .aw-angle-degree { fill: var(--aw-meridian-text); }
.aw-angle-pointer { stroke: var(--aw-accent); stroke-opacity: 0.5; stroke-width: 1; }
.aw-angle.aw-outer .aw-angle-name { font-size: 10.5px; }
.aw-angle.aw-outer .aw-angle-name, .aw-angle.aw-outer .aw-angle-degree { fill-opacity: 0.7; }
.aw-angle.aw-hl .aw-hit { fill: color-mix(in srgb, var(--aw-accent) 14%, transparent); stroke: var(--aw-accent); stroke-opacity: 0.6; }
.aw-hit { fill: transparent; cursor: pointer; }
.aw-body { cursor: pointer; }
.aw-glyph { font-family: var(--aw-font-symbols); font-size: calc(var(--aw-glyph-size, 23px) * var(--aw-glyph-scale, 1)); fill: var(--aw-c); pointer-events: none; }
.aw-degree { fill: var(--aw-text); font: 10.5px var(--aw-font); pointer-events: none; }
.aw-retro { fill: var(--aw-retro); font-size: 9px; }
.aw-halo { fill: var(--aw-halo); stroke: var(--aw-c); stroke-width: 1.5; opacity: 0; transition: opacity 0.15s; }
.aw-body.aw-hl .aw-halo { opacity: 1; }
.aw-connector { stroke: var(--aw-connector); stroke-width: 0.8; }
.aw-tick { stroke: var(--aw-c); stroke-width: 2.2; }
.aw-aspect { stroke-width: 1.1; transition: opacity 0.15s; }
.aw-aspect-conjunction { stroke: var(--aw-conjunction); }
.aw-aspect-sextile { stroke: var(--aw-sextile); }
.aw-aspect-square { stroke: var(--aw-square); }
.aw-aspect-trine { stroke: var(--aw-trine); }
.aw-aspect-opposition { stroke: var(--aw-opposition); }
.aw-aspect-minor { stroke: var(--aw-minor); stroke-dasharray: 3 3; }
.aw-aspect-dot { stroke: none; fill: var(--aw-minor); }
.aw-aspect-conjunction .aw-aspect-dot { fill: var(--aw-conjunction); }
.aw-aspect-sextile .aw-aspect-dot { fill: var(--aw-sextile); }
.aw-aspect-square .aw-aspect-dot { fill: var(--aw-square); }
.aw-aspect-trine .aw-aspect-dot { fill: var(--aw-trine); }
.aw-aspect-opposition .aw-aspect-dot { fill: var(--aw-opposition); }
.aw-outer { --aw-glyph-size: 20px; }
.aw-outer .aw-degree { font-size: 9.5px; }
.aw-aspect-glyph { stroke: none; font: 11px var(--aw-font-symbols); paint-order: stroke; }
.aw-has-hl .aw-aspect:not(.aw-hl) { opacity: 0.12; }
.aw-asc-band { fill: var(--aw-accent); fill-opacity: 0.35; stroke: var(--aw-accent); stroke-opacity: 0.7; stroke-width: 0.8; }
.aw-asc-band-label { fill: var(--aw-accent-text); font: 600 10px var(--aw-font); }
.aw-sign-glyph.aw-dim { opacity: 0.35; }
.aw-dignity { fill: var(--aw-ring); fill-opacity: 0.05; stroke: var(--aw-sign-line); stroke-width: 0.8; }
.aw-dignity-odd { fill-opacity: 0.12; }
.aw-dignity-glyph { font: 10px var(--aw-font-symbols); pointer-events: none; }
.aw-degree-label { fill: var(--aw-text); font: 10px var(--aw-font); }
.aw-band { fill: var(--aw-accent); fill-opacity: 0.18; stroke: none; }
.aw-radial, .aw-chord { stroke: var(--aw-ring); stroke-width: 1; }
.aw-angle-arc { fill: none; stroke: var(--aw-accent); stroke-width: 1.2; }
.aw-angle-label { fill: var(--aw-accent-text); font: 14px var(--aw-font); }
.aw-polygon { fill: none; stroke: var(--aw-ring-inner); stroke-width: 0.8; }
.aw-track { fill: none; stroke: var(--aw-ring); stroke-width: 1.2; }
.aw-dot { fill: var(--aw-text); }
.aw-knockout { fill: var(--aw-backdrop); }
.aw-mark-glyph { font: 24px var(--aw-font-symbols); fill: var(--aw-text); }
.aw-mark-text { font: 12px var(--aw-font); fill: var(--aw-text); }
`;

const injected = new WeakSet<Document>();

/** Adds the default theme to a document once (mount() does this unless told not to). */
export function injectTheme(doc: Document = document): void {
  if (injected.has(doc)) return;
  injected.add(doc);
  const style = doc.createElement('style');
  style.dataset.skywheel = '';
  style.textContent = THEME_CSS;
  doc.head.appendChild(style);
}
