// Runs against the built library: npm test (builds first).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createChart, horizonChart, classicChart, computeAspects, spread, zodiacRing, planetRing, houseCusps, norm360,
} from '../dist/index.js';

// London, 26 Sep 2026 10:21 UT (Swiss Ephemeris), the same chart the demo uses.
const DATA = {
  asc: 229.3564,
  mc: 158.7498,
  cusps: [229.3564, 259.7128, 298.9502, 338.7498, 9.5489, 32.0386, 49.3564, 79.7128, 118.9502, 158.7498, 189.5489, 212.0386],
  sunAltitude: 33.8,
  bodies: [
    { id: 'sun', lon: 183.3557 }, { id: 'moon', lon: 359.9801 }, { id: 'mercury', lon: 204.4219 },
    { id: 'venus', lon: 217.6142 }, { id: 'mars', lon: 119.0053 }, { id: 'jupiter', lon: 138.7591 },
    { id: 'saturn', lon: 11.9341, speed: -0.07 }, { id: 'uranus', lon: 65.5938, speed: -0.02 },
    { id: 'neptune', lon: 2.9886, speed: -0.02 }, { id: 'pluto', lon: 303.159, speed: -0.01 },
  ],
};

const close = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);

test('the Ascendant is on the left and the Descendant on the right', () => {
  const c = createChart(DATA).context;
  const [ax, ay] = c.point(100, DATA.asc);
  const [dx, dy] = c.point(100, DATA.asc + 180);
  close(ax, -100); close(ay, 0); close(dx, 100); close(dy, 0);
});

test('the upper half of the wheel is the zodiac above the horizon', () => {
  const c = createChart(DATA).context;
  for (let lon = 0; lon < 360; lon += 7) {
    const [, y] = c.point(100, lon);
    if (Math.abs(y) > 1e-6) assert.equal(c.isAboveHorizon(lon), y < 0, `lon ${lon}`);
  }
});

test('glyph spreading keeps neighbours at least the gap apart', () => {
  const items = [{ lon: 10 }, { lon: 11 }, { lon: 12 }, { lon: 358 }, { lon: 200 }];
  const out = spread(items, 9).map((p) => norm360(p.display)).sort((a, b) => a - b);
  for (let i = 0; i < out.length; i++) {
    const gap = norm360(out[(i + 1) % out.length] - out[i]);
    assert.ok(gap >= 9 - 1e-6, `gap ${gap}`);
  }
});

test('aspects match an independent Swiss Ephemeris chart', () => {
  const found = computeAspects(DATA.bodies);
  const has = (a, b, type, orb) => {
    const x = found.find((f) => ((f.a === a && f.b === b) || (f.a === b && f.b === a)) && f.type === type);
    assert.ok(x, `${a} ${type} ${b} missing`);
    close(x.orb, orb, 0.01);
  };
  has('sun', 'neptune', 'opposition', 0.37);
  has('sun', 'pluto', 'trine', 0.2);
  has('neptune', 'pluto', 'sextile', 0.17);
  has('moon', 'mars', 'trine', 0.97);
  assert.equal(found[0].orb, Math.min(...found.map((f) => f.orb)), 'sorted tightest first');
});

test('layers render in order, one group each', () => {
  const svg = createChart(DATA).use(zodiacRing(), houseCusps(), planetRing()).render();
  const order = [...svg.matchAll(/aw-layer-([a-z-]+)/g)].map((m) => m[1]);
  assert.deepEqual(order, ['zodiac', 'houses', 'planets']);
  assert.equal((svg.match(/data-focus="/g) ?? []).length, 10);
});

test('sidereal zodiacs rotate the sign ring by the ayanamsa', () => {
  const ring = (ayanamsa) => createChart({ ...DATA, ayanamsa }).use(zodiacRing({ ticks: false, glyphs: false })).render();
  assert.notEqual(ring(0), ring(24.23));
  const c = createChart({ ...DATA, ayanamsa: 24.23 }).context;
  close(c.zodiacLon(24.23), 0);
});

test('presets produce standalone SVG with embedded styles', () => {
  for (const chart of [horizonChart(DATA), classicChart(DATA)]) {
    const svg = chart.toSVG();
    assert.match(svg, /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
    assert.match(svg, /<style>/);
    assert.ok(!chart.toSVG({ embedStyles: false }).includes('<style>'));
  }
  assert.match(horizonChart(DATA).render(), /Day chart/);
  assert.match(horizonChart({ ...DATA, sunAltitude: -20 }).render(), /Night chart/);
});

test('data is escaped', () => {
  const svg = createChart({ ...DATA, bodies: [{ id: 'x', lon: 10, name: '<b>"x"</b>', glyph: '&' }] }).use(planetRing()).render();
  assert.ok(!svg.includes('<b>'));
  assert.match(svg, /&lt;b&gt;&quot;x&quot;/);
  assert.match(svg, />&amp;</);
});

test('charts without houses or an Ascendant range simply skip those layers', () => {
  const { cusps, ...noHouses } = DATA;
  assert.equal(createChart(noHouses).use(houseCusps()).render(), '<g class="aw-layer aw-layer-houses"></g>');
  assert.ok(!horizonChart(DATA).render().includes('aw-asc-band'));
  assert.ok(horizonChart({ ...DATA, ascRange: [228, 230.7] }).render().includes('aw-asc-band'));
});

test('glyph spreading holds up on random crowded charts', () => {
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let trial = 0; trial < 500; trial++) {
    const n = 2 + Math.floor(rand() * 14);
    const base = rand() * 360;
    const items = Array.from({ length: n }, () => ({ lon: norm360(base + (rand() - 0.5) * (rand() < 0.5 ? 40 : 360)) }));
    const gap = 9;
    const g = Math.min(gap, (360 / n) * 0.98);
    const out = spread(items, gap);
    assert.equal(out.length, n);
    const pos = out.map((p) => norm360(p.display)).sort((a, b) => a - b);
    for (let i = 0; i < n; i++) {
      const d = norm360(pos[(i + 1) % n] - pos[i]);
      assert.ok(d >= g - 1e-6, `trial ${trial}: gap ${d.toFixed(3)} < ${g.toFixed(3)} (n=${n})`);
    }
    // Nobody is pushed further than the whole group could need.
    for (const p of out) assert.ok(Math.abs(((p.display - p.item.lon + 540) % 360) - 180) <= n * g, 'moved too far');
  }
});

// Bi-wheels: transits (outer ring) around a natal chart (inner ring).
import { biWheelChart, computeCrossAspects } from '../dist/index.js';

const TRANSITS = [
  { id: 'sun', lon: 3.3 }, { id: 'mars', lon: 229.9 }, { id: 'saturn', lon: 11.2, speed: -0.05 },
];

test('bi-wheel draws both rings with distinct focus ids', () => {
  const svg = biWheelChart({ ...DATA, outer: TRANSITS }).toSVG();
  assert.match(svg, /data-focus="o:sun"/);
  assert.match(svg, /data-focus="sun"/);
  assert.match(svg, /aw-outer/);
  assert.match(svg, /aw-ring-sep/);
});

test('cross aspects run from the outer ring to the inner ring', () => {
  const found = computeCrossAspects(TRANSITS, DATA.bodies);
  // Transiting Sun at 3.3° opposes natal Sun at 183.4°; transiting Mars conjoins the Ascendant's degree region, not a body.
  const sunOpp = found.find((f) => f.a === 'sun' && f.b === 'sun');
  assert.equal(sunOpp?.type, 'opposition');
  close(sunOpp.orb, 0.06, 0.01);
  const svg = biWheelChart({ ...DATA, outer: TRANSITS }).toSVG();
  assert.match(svg, /data-bodies="o:sun sun"/);
});

test('bi-wheel without houses leaves out the angles', () => {
  const { cusps, ...noHouses } = DATA;
  const svg = biWheelChart({ ...noHouses, outer: TRANSITS }).toSVG({ embedStyles: false });
  assert.doesNotMatch(svg, /aw-angle-asc/);
  assert.doesNotMatch(svg, /aw-horizon/);
});

import { arcBand, radialLine, angleArc, polygon, chord, glyphMark, textMark, track, dot, group } from '../dist/index.js';

test('marks compose into an abstract chart', () => {
  const chart = createChart({ bodies: [], asc: 0, mc: 270 }, { rotation: 90 }).use(
    zodiacRing({ emphasize: [0] }),
    arcBand({ from: 350, to: 10, inner: 200, outer: 260, className: 'orb' }),
    radialLine({ lon: 0, from: -250, to: 250 }),
    polygon({ start: 0, count: 3, radius: 200 }),
    chord({ a: 0, b: 120, radius: 200, className: 'hit' }),
    angleArc({ a: 0, b: 120, radius: 60, label: '120°' }),
    glyphMark({ id: 'mars', lon: 0, radius: 220, knockout: 14 }),
    textMark({ lon: 0, radius: 280, text: '2026', along: true }),
    group('later', track({ lons: [0, 5, 3, 8], radius: (i) => 100 + i * 10 }), dot({ lon: 8, radius: 130 })),
  );
  const svg = chart.toSVG({ embedStyles: false });
  // Only Aries keeps its tint; the other eleven recede.
  assert.equal((svg.match(/aw-sign aw-untinted aw-dim/g) ?? []).length, 11);
  assert.match(svg, /class="aw-band orb"/);
  assert.match(svg, />120°</);
  assert.match(svg, /fill:var\(--aw-mars/);
  assert.match(svg, /<g class="later"><path class="aw-track/);
  // Longitude 0 sits at the top with rotation 90: the radial line runs vertically through the centre.
  const [x1, y1] = createChart({ bodies: [], asc: 0, mc: 270 }, { rotation: 90 }).context.point(250, 0);
  close(x1, 0); close(y1, -250);
});

test('a lens magnifies the zodiac around its centre and draws only what is in view', () => {
  const opts = { rotation: 90 - 215, lens: { center: 215, zoom: 4 } };
  const c = createChart({ bodies: [], asc: 0, mc: 270 }, opts).context;
  // 10° from the centre lands 40° round the wheel from the top.
  const [x, y] = c.point(100, 225);
  close(x, -100 * Math.sin(40 * Math.PI / 180)); close(y, -100 * Math.cos(40 * Math.PI / 180));
  assert.equal(c.visible(215 + 44), true);
  assert.equal(c.visible(215 + 46), false);
  const svg = createChart({ bodies: [], asc: 0, mc: 270 }, opts).use(zodiacRing({ labelEvery: 5 })).toSVG({ embedStyles: false });
  // Scorpio (the centre) and its neighbours only.
  assert.match(svg, /<title>Scorpio<\/title>/);
  assert.doesNotMatch(svg, /<title>Aries<\/title>/);
  assert.match(svg, /aw-degree-label/);
});
