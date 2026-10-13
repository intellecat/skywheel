// Builds docs/index.html, the GitHub Pages site: every example's code is run against the built
// library and its chart is drawn beside it, so the page can't show code that draws something else.
//   npm run docs

import { readFileSync, writeFileSync } from 'node:fs';
import * as lib from '../dist/index.js';

const here = new URL('.', import.meta.url);
const samples = JSON.parse(readFileSync(new URL('samples.json', here), 'utf8'));
const { natal, transits, partner } = samples;
const progressed = samples.progressed;
const mercury = samples.mercury;
const scope = { ...lib, natal, transits, progressed, partner, mercury };

// ─── The examples ────────────────────────────────────────────────────────────────────────────

/** @type {{ id: string; title: string; intro: string; sections: { id: string; title: string; text?: string; examples: { title: string; text: string; code: string; css?: string; wide?: boolean }[] }[] }} */
const PAGE = {
  sections: [
    {
      id: 'presets',
      title: 'Ready-made charts',
      text: 'Each preset is a few lines of layers in <code>src/presets.ts</code>. Start from one, or copy it and change the layers.',
      examples: [
        {
          title: 'The horizon chart',
          text: 'The sky flattened onto the zodiac. The Ascendant is fixed on the left, so the line through the centre is the horizon: the upper half is tinted like the sky at that moment, and the lower half is under the earth.',
          code: `horizonChart(natal)`,
        },
        {
          title: 'With aspect lines',
          text: 'The captions move out of the way and the aspects are drawn inside the inner circle, fading as their orb widens.',
          code: `horizonChart(natal, { aspects: true })`,
        },
        {
          title: 'The classic wheel',
          text: 'Zodiac, houses, aspects and planets with their degrees and minutes.',
          code: `classicChart(natal)`,
        },
        {
          title: 'The light theme',
          text: 'Add the class <code>aw-light</code> for the light palette.',
          code: `classicChart(natal, { className: 'aw-light' })`,
        },
      ],
    },
    {
      id: 'two-charts',
      title: 'Two charts on one wheel',
      text: 'Give the data an <code>outer</code> set of bodies. Its bodies are focused as <code>o:</code> + id, so both rings can hold a Mars.',
      examples: [
        {
          title: 'Transits around a natal chart',
          text: 'The transit chart has a known time and place, so its Ascendant and MC are drawn too, dimmed, with a pointer to their degree. The lines are the aspects from the transits to the natal planets.',
          code: `biWheelChart({
  ...natal,
  outer: transits.bodies,
  outerAsc: transits.asc,
  outerMc: transits.mc,
})`,
        },
        {
          title: 'Synastry, with your own orbs',
          text: 'Pass the aspects yourself to choose the orbs (the five major aspects unless you name others). Each line fades against its own maximum.',
          code: `const { bodies } = partner;
const crossAspects = computeCrossAspects(bodies, natal.bodies, {
  orbs: {
    conjunction: 5, opposition: 5,
    square: 4, trine: 4, sextile: 3,
  },
});

biWheelChart({
  ...natal,
  outer: bodies,
  crossAspects,
})`,
        },
      ],
    },
    {
      id: 'more-charts',
      title: 'Three or four charts',
      text: 'Further rings go in <code>rings</code>, outward after <code>outer</code>, and are focused as <code>o2:</code>, <code>o3:</code> … Each ring gets an equal band, and the glyphs shrink as the bands narrow.',
      examples: [
        {
          title: 'Tri-wheel: natal, progressed, transits',
          text: 'Aspect lines can come from any ring: here, from the transits (ring 2) to the natal chart.',
          code: `multiWheelChart({
  ...natal,
  // ring 1: secondary progressions at age 30
  outer: progressed,
  // ring 2: transits (bodies, asc and mc)
  rings: [transits],
}, { aspects: 2 })`,
        },
        {
          title: 'Quad-wheel',
          text: 'One more ring: a partner’s chart around all three.',
          code: `multiWheelChart({
  ...natal,
  outer: progressed,
  rings: [
    { bodies: transits.bodies },
    { bodies: partner.bodies },
  ],
}, { aspects: 'none' })`,
        },
      ],
    },
    {
      id: 'composing',
      title: 'Composing your own',
      text: 'A chart is a list of layers, drawn in order, later ones on top. Every preset above is built this way.',
      examples: [
        {
          title: 'Choose the layers',
          text: 'A sparer wheel: untinted signs, aspect symbols on the lines, and radial ticks instead of connectors.',
          code: `const layout = { planet: 0.68, degree: 0.6 };

createChart(natal, { layout }).use(
  backdrop(),
  zodiacRing({ tint: false }),
  aspectLines({ glyphs: true }),
  planetRing({ marker: radialMarker, minutes: true }),
)`,
        },
        {
          title: 'Decans and terms',
          text: 'Rings of the Chaldean faces and the Egyptian terms, with each ruler’s glyph. A smaller radius makes room for them outside the zodiac.',
          code: `createChart(natal, { radius: 250 }).use(
  backdrop(),
  zodiacRing(),
  dignityRing({ table: 'decans' }),
  dignityRing({ table: 'terms', inner: 264, outer: 279 }),
  houseCusps(),
  aspectLines(),
  horizonAxes({ captions: false }),
  angleLabels({ radius: 304 }),
  planetRing(),
)`,
        },
        {
          title: 'Minor aspects',
          text: 'Ask for them by name. The majors stay solid and coloured; the minor ones are dashed, with a symbol where Unicode has one. Any other name works too, as a plain dashed line.',
          code: `const aspects = computeAspects(natal.bodies, {
  types: [
    'sextile', 'square', 'trine', 'opposition',
    'semisextile', 'semisquare', 'sesquiquadrate',
    'quincunx', 'quintile',
  ],
});

createChart({ ...natal, aspects }).use(
  backdrop(),
  zodiacRing(),
  houseCusps(),
  aspectLines({ glyphs: true }),
  planetRing(),
)`,
        },
        {
          title: 'Points of your own',
          text: 'Any id works with a <code>name</code>, <code>glyph</code> and <code>color</code>. Labels longer than one symbol are shrunk to fit; <code>glyphScale</code> sets a size yourself.',
          code: `createChart({
  ...natal,
  bodies: [
    ...natal.bodies,
    { id: 'pof', lon: 45.98, glyph: '⊗', name: 'Fortune' },
    { id: 'eris', lon: 25.2, glyph: 'Eri', name: 'Eris' },
    { id: 'mid', lon: 211.02, glyph: '☿♀', name: 'Midpoint' },
  ],
}).use(
  backdrop(),
  zodiacRing(),
  houseCusps(),
  horizonAxes({ captions: false }),
  planetRing({ minutes: true }),
)`,
        },
        {
          title: 'A layer of your own',
          text: 'A layer is a name and a <code>render(ctx)</code> that returns SVG markup. The context gives the geometry: <code>point(r, lon)</code>, the ring radii in <code>r</code>, the data and the bodies.',
          code: `const hourMarker = {
  name: 'hour-marker',
  render: (c) => {
    const asc = c.data.asc;
    const R = c.r.outer;
    const tip = c.point(R + 4, asc);
    const left = c.point(R + 16, asc - 2.2);
    const right = c.point(R + 16, asc + 2.2);
    const [x, y] = c.point(R + 28, asc);
    return (
      h('path', {
        class: 'note-arrow',
        d: \`M\${tip} L\${left} L\${right} Z\`,
      }) +
      h('text', {
        class: 'note', x, y,
        transform: \`rotate(-90 \${x} \${y})\`,
      }, 'hōroskopos')
    );
  },
};

createChart(natal).use(
  backdrop(),
  zodiacRing(),
  houseCusps(),
  planetRing(),
  hourMarker,
)`,
          css: `.note {
  fill: var(--aw-accent-text);
  font: italic 13px Georgia, serif;
}
.note-arrow { fill: var(--aw-accent); }`,
        },
      ],
    },
    {
      id: 'special',
      title: 'Special charts',
      examples: [
        {
          title: 'Unknown birth time',
          text: 'Leave out <code>asc</code> and <code>mc</code>. Nothing that depends on the time is drawn — no houses, axes or angles — and 0° Aries sits on the left.',
          code: `const { asc, mc, cusps, ...noTime } = natal;

classicChart(noTime)`,
        },
        {
          title: 'Sidereal zodiac',
          text: 'Give the ayanamsa and the signs turn under the planets (here Lahiri, about 24.2° in 2026).',
          code: `classicChart({ ...natal, ayanamsa: 24.22 })`,
        },
        {
          title: 'An uncertain Ascendant',
          text: 'A band over the range the Ascendant could be in — for an ancient chart, where ΔT blurs the time, or a birth time known to a few minutes.',
          code: `horizonChart({
  ...natal,
  ascRange: [natal.asc - 1.4, natal.asc + 1.4],
})`,
        },
        {
          title: 'A retrograde under a lens',
          text: 'The lens magnifies a stretch of the zodiac. Here Mercury’s path from 1 October to 19 December 2026, spiralling outward day by day, with its two stations.',
          code: `// Mercury on each of 80 days; time runs outward.
const r = (i) => 90 + i * 1.95;
const back = (i) => mercury[i] < mercury[i - 1];
const turn = mercury.findIndex((_, i) => back(i)) - 1;
const end = mercury.findIndex((_, i) => i > turn && !back(i)) - 1;
const lens = { center: 235, zoom: 4 };
const station = (i, title) =>
  dot({ lon: mercury[i], radius: r(i), r: 5, title });

const rotation = 90 - lens.center; // the centre at the top

createChart({ bodies: [] }, { rotation, lens }).use(
  backdrop(),
  zodiacRing({ labelEvery: 2 }),
  track({ lons: mercury, radius: r, className: 'mercury' }),
  station(turn, 'Stations retrograde'),
  station(end, 'Stations direct'),
  glyphMark({ id: 'mercury', lon: mercury[0], radius: 70 }),
)`,
          css: `.aw-track.mercury {
  stroke: var(--aw-mercury, #9ad8c6);
  stroke-width: 2;
}
.aw-dot { fill: var(--aw-accent); }`,
        },
        {
          title: 'Figures for teaching',
          text: 'The marks — polygons, arcs, glyphs and words anywhere on the wheel — make small explanatory charts: here a grand trine in fire.',
          code: `const planet = (id, lon) =>
  glyphMark({ id, lon, radius: 200, knockout: 17 });

createChart({ bodies: [] }, { rotation: 90 }).use(
  backdrop(),
  zodiacRing({ emphasize: [0, 4, 8] }), // the fire signs
  polygon({ start: 15, count: 3, radius: 200,
    className: 'trine' }),
  angleArc({ a: 15, b: 135, radius: 60, label: '120°' }),
  planet('mars', 15),
  planet('sun', 135),
  planet('jupiter', 255),
)`,
          css: `.aw-polygon.trine {
  stroke: var(--aw-trine);
  stroke-width: 1.5;
}`,
        },
        {
          title: 'Your own colours',
          text: 'Everything is a CSS variable on <code>.aw-chart</code>: the palette, each planet, each element and each aspect.',
          code: `classicChart(natal, { className: 'aw-light ink' })`,
          css: `.aw-chart.ink {
  --aw-backdrop: #f3ecdc;
  --aw-ring: #5b4a32;
  --aw-sign-opacity: 0;
  --aw-accent: #8c2f1b;
  --aw-accent-text: #8c2f1b;
  --aw-meridian: #5b4a32;
  --aw-meridian-text: #5b4a32;
  --aw-font: Georgia, serif;
}
.aw-chart.ink .aw-glyph { fill: #2b2116; }`,
        },
      ],
    },
  ],
};

// ─── Running the code ────────────────────────────────────────────────────────────────────────

/** Runs an example: its last top-level statement is the chart. */
function run(code) {
  const lines = code.split('\n');
  let last = lines.length - 1;
  while (last > 0 && !/^[A-Za-z_$]/.test(lines[last])) last--;
  lines[last] = 'return ' + lines[last];
  const fn = new Function(...Object.keys(scope), lines.join('\n'));
  const chart = fn(...Object.values(scope));
  if (!(chart instanceof lib.Chart)) throw new Error(`Example did not return a chart:\n${code}`);
  return chart;
}

const svgOf = (chart) => chart.toSVG({ embedStyles: false }).replace(/ width="\d+" height="\d+"/, '');

// ─── Highlighting the code (a small tokenizer: enough for these examples) ────────────────────

const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
const KEYWORDS = new Set(['const', 'let', 'return', 'import', 'from', 'new', 'true', 'false', 'null', 'undefined', 'function', 'export']);
function highlight(code, lang = 'js') {
  if (lang === 'sh') return esc(code);
  const re =
    lang === 'css'
      ? /(\/\*[\s\S]*?\*\/)|(--[\w-]+)|(#[0-9a-fA-F]{3,8}\b)|(\.[\w-]+)|(\d+(?:\.\d+)?(?:px|em|%)?)/g
      : /(\/\/[^\n]*)|('(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_$][\w$]*)(?=\s*\()|(\b[A-Za-z_$][\w$]*\b)(?=\??\s*:(?!:))|(\b[A-Za-z_$][\w$]*\b)/g;
  let out = '';
  let at = 0;
  for (const m of code.matchAll(re)) {
    out += esc(code.slice(at, m.index));
    at = m.index + m[0].length;
    const t = esc(m[0]);
    if (lang === 'css') {
      const cls = m[1] ? 'c' : m[2] ? 'p' : m[3] ? 's' : m[4] ? 'f' : 'n';
      out += `<span class="t-${cls}">${t}</span>`;
    } else if (m[1]) out += `<span class="t-c">${t}</span>`;
    else if (m[2]) out += `<span class="t-s">${t}</span>`;
    else if (m[3]) out += `<span class="t-n">${t}</span>`;
    else if (m[4]) out += KEYWORDS.has(m[0]) ? `<span class="t-k">${t}</span>` : `<span class="t-f">${t}</span>`;
    else if (m[5]) out += `<span class="t-p">${t}</span>`;
    else out += KEYWORDS.has(m[0]) ? `<span class="t-k">${t}</span>` : t;
  }
  return out + esc(code.slice(at));
}

const codeBlock = (code, lang = 'js', label = lang === 'css' ? 'CSS' : lang === 'sh' ? 'Shell' : 'JavaScript') =>
  `<div class="code"><div class="code-bar"><span>${label}</span><button class="copy" type="button" aria-label="Copy code">Copy</button></div><pre><code>${highlight(code, lang)}</code></pre></div>`;

// ─── The page ────────────────────────────────────────────────────────────────────────────────

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const extraCss = [];
const sectionsHtml = PAGE.sections
  .map((s) => {
    const examples = s.examples
      .map((e) => {
        if (e.css) extraCss.push(e.css);
        const id = slug(e.title);
        return `
      <article class="example" id="${id}">
        <figure class="chart">${svgOf(run(e.code))}</figure>
        <div class="explain">
          <h3><a href="#${id}">${e.title}</a></h3>
          <p>${e.text}</p>
          ${codeBlock(e.code)}
          ${e.css ? codeBlock(e.css, 'css') : ''}
        </div>
      </article>`;
      })
      .join('');
    return `
    <section id="${s.id}">
      <h2>${s.title}</h2>
      ${s.text ? `<p class="lead">${s.text}</p>` : ''}
      ${examples}
    </section>`;
  })
  .join('');

const hero = svgOf(lib.horizonChart(natal, { title: 'London, 26 September 2026, 11:21' }));

const nav = PAGE.sections
  .map((s) => `<li><a href="#${s.id}">${s.title}</a><ul>${s.examples.map((e) => `<li><a href="#${slug(e.title)}">${e.title}</a></li>`).join('')}</ul></li>`)
  .join('');

const DATA_SHAPE = `interface WheelData {
  bodies: { id: string; lon: number; speed?: number; name?: string; glyph?: string; color?: string }[];
  asc?: number;             // tropical longitudes, in degrees
  mc?: number;              // leave out both for an unknown birth time
  cusps?: number[];         // 12 house cusps; leave out for no houses
  sunAltitude?: number;     // tints the sky, decides day or night
  ayanamsa?: number;        // sidereal zodiacs
  ascRange?: [number, number];
  aspects?: Aspect[];       // otherwise computed: { a, b, type, orb, maxOrb? }
  outer?: WheelBody[];      // a second chart: transits, a partner
  outerAsc?: number;
  outerMc?: number;
  crossAspects?: Aspect[];
  rings?: { bodies: WheelBody[]; asc?: number; mc?: number; aspects?: Aspect[] }[];
}`;

const LIVE = `const chart = horizonChart(data).mount(document.querySelector('#chart'), {
  onHover: (id) => chart.highlight(id),   // a body's id, 'asc' | 'dsc' | 'mc' | 'ic', 'o:mars' … or null
  onSelect: (id) => console.log(id),
});

chart.setData(next);        // re-renders; cheap enough for every animation frame
chart.highlight('mars');    // emphasises Mars and its aspect lines, without re-rendering
chart.unmount();`;

const EXPORT = `// A standalone SVG file, with the theme embedded, plus any CSS of your own
const svg = chart.toSVG({ css: myStyles });

// On a server: no DOM needed
const markup = classicChart(data).toSVG();`;

const LAYERS = [
  ['backdrop()', 'a plain disc'],
  ['skyEarth()', 'the sky above the horizon, tinted by the Sun’s altitude; earth below'],
  ['zodiacRing({ glyphs, ticks, tint, emphasize, labelEvery })', 'the twelve signs, turned by the ayanamsa'],
  ['dignityRing({ table, inner, outer })', 'decans, Egyptian terms, or a table of your own'],
  ['houseCusps({ numbers })', 'cusp lines, the inner circle, house numbers'],
  ['horizonAxes({ meridian, captions })', 'the ASC–DSC and MC–IC lines'],
  ['angleLabels({ rings, labels, include })', 'ASC, DSC, MC and IC with degree and sign, for any ring'],
  ['sectLabel()', '“Day chart” or “Night chart”'],
  ['ascUncertainty()', 'a band over ascRange'],
  ['aspectLines({ types, orbs, defs, glyphs, include })', 'aspects within the chart'],
  ['crossAspectLines({ ring, types, orbs, glyphs })', 'aspects from an outer ring to the inner chart'],
  ['planetRing({ source, marker, gap, minutes, glyphScale })', 'glyphs spread clear of each other, ticks at the exact degree'],
  ['arcBand, radialLine, angleArc, polygon, chord', 'shapes on the wheel'],
  ['glyphMark, textMark, track, dot, group', 'symbols, words, paths and groups'],
];

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Skywheel</title>
<meta name="description" content="A composable, framework-agnostic SVG chart wheel for astrology: natal charts, bi-wheels, tri-wheels and more, from plain data.">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='14' fill='%230b1020' stroke='%23e8c26a' stroke-width='2'/%3E%3Cpath d='M2 16h28' stroke='%23e8c26a' stroke-width='2'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+Symbols&family=Noto+Sans+Symbols+2&family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap" rel="stylesheet">
<style>${lib.THEME_CSS}</style>
<style>${readFileSync(new URL('site.css', here), 'utf8')}</style>
<style>${extraCss.join('\n')}</style>
</head>
<body>
<header class="hero">
  <div class="hero-text">
    <p class="eyebrow">SVG chart wheels for astrology</p>
    <h1>Skywheel</h1>
    <p class="tagline">Natal charts, bi-wheels, tri-wheels and teaching figures, from plain data. Plain TypeScript, no framework: it renders to an SVG string, so it runs in any framework and on a server.</p>
    <ul class="points">
      <li><b>Composable.</b> A chart is a list of layers. Use a preset, or pick your own.</li>
      <li><b>Data in, SVG out.</b> It does no astronomy: give it longitudes from any ephemeris.</li>
      <li><b>Live or static.</b> Hover, select and highlight in the page, or export a standalone SVG.</li>
    </ul>
    <div class="cta">
      <a class="button" href="#presets">See the charts</a>
      <a class="button ghost" href="https://github.com/intellecat/skywheel">GitHub</a>
    </div>
  </div>
  <figure class="hero-chart">${hero}<figcaption>London, 26 September 2026, 11:21. Hover a planet.</figcaption></figure>
</header>

<div class="layout">
  <nav class="toc" aria-label="Contents">
    <ul>
      <li><a href="#start">Getting started</a></li>
      ${nav}
      <li><a href="#live">Live charts and export</a></li>
      <li><a href="#reference">Layers</a></li>
    </ul>
  </nav>

  <main>
    <section id="start">
      <h2>Getting started</h2>
      <p class="lead">Install it from GitHub, give it a chart’s longitudes, and pick a chart.</p>
      ${codeBlock('npm install github:intellecat/skywheel', 'sh', 'Shell')}
      ${codeBlock(`import { classicChart } from 'skywheel';

classicChart(data).mount(document.querySelector('#chart'));`)}
      <p>The data is a chart’s longitudes and, when the time is known, its angles and house cusps:</p>
      ${codeBlock(DATA_SHAPE, 'js', 'TypeScript')}
      <p class="note-text">Every chart on this page is drawn from the code beside it, with positions from the Swiss Ephemeris: <code>natal</code> is London, 26 September 2026 at 11:21; <code>transits</code> the same place in 2056; <code>progressed</code> the secondary progressions for age 30; <code>partner</code> Paris, 4 May 1998.</p>
    </section>
    ${sectionsHtml}
    <section id="live">
      <h2>Live charts and export</h2>
      <p class="lead">Mount a chart to make it interactive. Every chart on this page links its planets and aspects the same way: hover one.</p>
      ${codeBlock(LIVE)}
      ${codeBlock(EXPORT)}
    </section>
    <section id="reference">
      <h2>Layers</h2>
      <p class="lead">Every layer takes its radius and options; the defaults follow the chart’s layout.</p>
      <table class="layers">
        <thead><tr><th>Layer</th><th>Draws</th></tr></thead>
        <tbody>${LAYERS.map(([a, b]) => `<tr><td><code>${esc(a)}</code></td><td>${b}</td></tr>`).join('')}</tbody>
      </table>
      <p>The full reference is in the <a href="https://github.com/intellecat/skywheel#readme">README</a>.</p>
    </section>
  </main>
</div>

<footer>Skywheel · <a href="https://github.com/intellecat/skywheel">github.com/intellecat/skywheel</a></footer>

<script>
// What chart.highlight() does, for the static charts on this page.
for (const svg of document.querySelectorAll('svg.aw-chart')) {
  const set = (id) => {
    svg.classList.toggle('aw-has-hl', id !== null);
    for (const n of svg.querySelectorAll('[data-focus], [data-bodies]'))
      n.classList.toggle('aw-hl', id !== null && (n.dataset.focus === id || (n.dataset.bodies || '').split(' ').includes(id)));
  };
  svg.addEventListener('pointerover', (e) => set(e.target.closest('[data-focus]')?.dataset.focus ?? null));
  svg.addEventListener('pointerleave', () => set(null));
}
for (const b of document.querySelectorAll('.copy'))
  b.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(b.closest('.code').querySelector('code').textContent);
      b.textContent = 'Copied';
    } catch { b.textContent = 'Select and copy'; }
    setTimeout(() => (b.textContent = 'Copy'), 1500);
  });
// The contents follow the reader.
const links = new Map([...document.querySelectorAll('.toc a')].map((a) => [a.getAttribute('href').slice(1), a]));
const seen = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) {
    for (const a of links.values()) a.classList.remove('on');
    links.get(e.target.id)?.classList.add('on');
  }
}, { rootMargin: '-30% 0px -60% 0px' });
for (const id of links.keys()) { const el = document.getElementById(id); if (el) seen.observe(el); }
</script>
</body>
</html>
`;

writeFileSync(new URL('index.html', here), html);
console.log(`docs/index.html: ${PAGE.sections.reduce((n, s) => n + s.examples.length, 0)} examples, ${(html.length / 1024).toFixed(0)} KB`);
