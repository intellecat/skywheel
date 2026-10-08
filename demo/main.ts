import {
  aspectLines,
  backdrop,
  classicChart,
  createChart,
  formatZodiac,
  h,
  horizonChart,
  planetRing,
  radialMarker,
  zodiacRing,
  type Chart,
  type Layer,
  type WheelData,
} from 'skywheel';
import { LONDON_2026 } from './sample';

const $ = (id: string) => document.getElementById(id)!;

// A custom layer: mark the Ascendant with its Greek name, the "hour-marker".
const hourMarker: Layer = {
  name: 'hour-marker',
  render: (c) => {
    const tip = c.point(c.r.outer + 4, c.data.asc);
    const [x, y] = c.point(c.r.outer + 26, c.data.asc);
    const [bx1, by1] = c.point(c.r.outer + 16, c.data.asc - 2.2);
    const [bx2, by2] = c.point(c.r.outer + 16, c.data.asc + 2.2);
    return (
      h('path', { class: 'demo-arrow', d: `M${tip[0]},${tip[1]} L${bx1},${by1} L${bx2},${by2} Z` }) +
      h('text', { class: 'demo-note', x, y, transform: `rotate(-90 ${x} ${y})` }, 'hōroskopos')
    );
  },
};

const customSource = `createChart(data, { layout: { planet: 0.68, degree: 0.6 } }).use(
  backdrop(),
  zodiacRing({ tint: false }),
  aspectLines({ glyphs: true }),
  planetRing({ marker: radialMarker, minutes: true }),
  hourMarker, // { name: 'hour-marker', render: (c) => h('text', …) }
)`;
$('code').textContent = customSource;

let data: WheelData = LONDON_2026;

const charts: Chart[] = [
  horizonChart(data, { title: 'London, 26 September 2026' }),
  classicChart(data, { className: 'aw-light' }),
  createChart(data, { layout: { planet: 0.68, degree: 0.6 } }).use(
    backdrop(),
    zodiacRing({ tint: false }),
    aspectLines({ glyphs: true }),
    planetRing({ marker: radialMarker, minutes: true }),
    hourMarker,
  ),
];

// Link the charts: hovering or selecting in one highlights in all, like astro-map's sky and wheel.
let selected: string | null = null;
let shown: string | null = null;
const describe = (id: string | null) => {
  if (!id) return 'Hover a planet or angle: the charts are linked with <code>chart.highlight(id)</code>.';
  const body = charts[0].context.body(id);
  if (body) return `<b>${body.name}</b> · ${formatZodiac(charts[0].context.zodiacLon(body.lon), true)}${body.retrograde ? ' · ℞ retrograde' : ''}`;
  const lon = { asc: data.asc, dsc: data.asc + 180, mc: data.mc, ic: data.mc + 180 }[id];
  return lon === undefined ? id : `<b>${id.toUpperCase()}</b> · ${formatZodiac(charts[0].context.zodiacLon(lon), true)}`;
};
const show = (id: string | null) => {
  shown = id;
  for (const c of charts) c.highlight(id);
  $('status').innerHTML = describe(id);
};
const handlers = {
  onHover: (id: string | null) => show(id ?? selected),
  onSelect: (id: string | null) => show((selected = id)),
};
charts[0].mount($('horizon'), handlers);
charts[1].mount($('classic'), handlers);
charts[2].mount($('custom'), handlers);

// Changing the data re-renders every chart.
const update = () => {
  data = {
    ...LONDON_2026,
    ayanamsa: ($('sidereal') as HTMLInputElement).checked ? 24.23 : 0,
    ascRange: ($('uncertain') as HTMLInputElement).checked ? [LONDON_2026.asc - 1.4, LONDON_2026.asc + 1.4] : undefined,
  };
  for (const c of charts) c.setData(data);
  show(shown);
};
$('sidereal').addEventListener('change', update);
$('uncertain').addEventListener('change', update);

// Export: the same chart as a standalone SVG file, styles embedded.
$('download').addEventListener('click', () => {
  const blob = new Blob([charts[0].toSVG()], { type: 'image/svg+xml' });
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'horizon-chart.svg' });
  a.click();
  URL.revokeObjectURL(a.href);
});

if (import.meta.env.DEV) Object.assign(window, { __charts: charts });
