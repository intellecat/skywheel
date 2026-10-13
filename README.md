# Skywheel

A composable, framework-agnostic SVG chart wheel for astrology, with astro-map's look: the chart as the sky flattened onto the zodiac.

**[See every chart and the code that draws it →](https://intellecat.github.io/skywheel/)**

- **Plain TypeScript, no framework.** It renders to an SVG string, so it runs in any framework and on a server.
- **Composable.** A chart is a list of layers, the way react-chart composes components.
- **Data in, SVG out.** It does no astronomy: give it longitudes from any ephemeris.

```ts
import { horizonChart } from 'skywheel';

horizonChart(data).mount(document.querySelector('#chart'));
```

## Design

The structure follows `@astrologer/react-chart`, without React:

| react-chart | skywheel |
|---|---|
| `<AstroChart>` context: centre, radius, rotation | `createChart(data, options)` builds a `ChartContext` with geometry helpers |
| Components: `<ZodiacWheel />`, `<PlanetRing />` … | Layers: `zodiacRing()`, `planetRing()` … added with `.use()` |
| Preset charts: `<NatalChart />` | Presets: `horizonChart()`, `classicChart()`, each just a list of layers |
| `MarkerRenderer` for planet ticks | `planetRing({ marker })` with `lineMarker` / `radialMarker` or your own |
| CSS variables and theme files | CSS variables on `.aw-chart`, plus a built-in `.aw-light` theme |

Default layout: the Ascendant is fixed on the left, so the horizontal line through the centre *is* the horizon. Everything above it is above the observer's horizon, and everything below it is under the Earth.

## Data

```ts
interface WheelData {
  bodies: { id: string; lon: number; speed?: number; alt?: number; name?: string; glyph?: string; color?: string; glyphScale?: number }[];
  asc?: number;             // tropical longitudes, degrees; leave out both for an unknown birth time
  mc?: number;
  cusps?: number[];         // 12 house cusps; omit for no houses
  ayanamsa?: number;        // sidereal zodiacs: tropical − sidereal
  sunAltitude?: number;     // tints the sky, decides day or night chart
  ascRange?: [number, number]; // Ascendant uncertainty band (e.g. ΔT for ancient charts)
  aspects?: Aspect[];       // otherwise computed: { a, b, type, orb, maxOrb? }
  outer?: WheelBody[];      // bi-wheel: transits or a partner's chart
  outerAsc?: number;        // …and its angles, if its time is known
  outerMc?: number;
  crossAspects?: Aspect[];  // outer (a) to inner (b); otherwise computed
  rings?: { bodies: WheelBody[]; asc?: number; mc?: number; aspects?: Aspect[] }[]; // tri- and quad-wheels
}
```

- **Unknown birth time:** leave out `asc` and `mc`. The axes, angle labels and sky/earth halves are skipped, nothing is marked as below the horizon, and 0° Aries sits on the left.
- **Labels:** a glyph is sized for one symbol. Labels of two or more characters ('☿☊', 'Cu', 'Eri') are shrunk automatically; `glyphScale` sets a body's own size.
- **Aspects:** any `type` works. The five majors are solid and coloured; the minor ones (`MINOR_ASPECTS`: semisextile to quindecile) and names skywheel doesn't know are dashed, with a glyph where Unicode has one. A line fades as `orb` nears `maxOrb` (default: that aspect's default orb), so your own orbs, such as separate applying and separating orbs, carry through.

Built-in ids (`sun`, `moon`, `mercury` … `pluto`, `node`, `chiron`) get names, glyphs and colours. Any other id works if you pass `name`, `glyph` and `color`. A negative `speed` marks a body as retrograde.

## Presets

```ts
horizonChart(data)                  // sky/earth halves, horizon + meridian, day/night, ASC band
horizonChart(data, { aspects: true }) // with aspect lines instead of the captions
classicChart(data)                  // backdrop, zodiac, houses, aspect lines, planets with minutes
biWheelChart(data)                  // `bodies` inside, `outer` outside, aspects between them
multiWheelChart(data, { aspects: 2 }) // tri- or quad-wheel: bodies, outer, then each of `rings`; aspects from ring 2
```

Every preset is a few lines in [`src/presets.ts`](src/presets.ts). To make your own, copy one and change its layers.

## Composing

```ts
import { createChart, backdrop, zodiacRing, houseCusps, aspectLines, planetRing, radialMarker } from 'skywheel';

const chart = createChart(data, { layout: { planet: 0.68 } }).use(
  backdrop(),
  zodiacRing({ tint: false }),
  houseCusps({ numbers: false }),
  aspectLines({ glyphs: true, types: ['square', 'trine', 'opposition'] }),
  planetRing({ marker: radialMarker, minutes: true, exclude: ['pluto'] }),
);
```

Layers draw in order, later on top.

| Layer | What it draws |
|---|---|
| `backdrop()` | a plain disc |
| `skyEarth({ night, day })` | the half of the zodiac above the horizon tinted like the sky (from `sunAltitude`), the lower half in earth tones |
| `zodiacRing({ glyphs, ticks, tint })` | the twelve signs, rotated by `ayanamsa` for sidereal zodiacs |
| `houseCusps({ numbers })` | cusp lines, the inner circle, house numbers |
| `horizonAxes({ meridian, captions })` | the ASC–DSC and MC–IC lines, and optional captions (you can supply your own text) |
| `angleLabels({ labels, include })` | ASC / DSC / MC / IC with degree and sign |
| `sectLabel()` | "Day chart" or "Night chart", placed in the Sun's half |
| `ascUncertainty()` | a band covering `ascRange` |
| `planetRing({ gap, degrees, minutes, retrograde, marker, include, exclude })` | glyphs spread clear of each other, with ticks at the exact degree |
| `aspectLines({ types, orbs, defs, glyphs, include })` | coloured aspect lines that fade as the orb widens |
| `crossAspectLines({ ring, types, orbs, glyphs })` | aspects from an outer ring (1 = `outer`, 2, 3 …) to the inner chart |
| `dignityRing({ table, inner, outer })` | decans (`'decans'`, Chaldean faces), Egyptian terms (`'terms'`) or your own table, as a ring with each ruler's glyph |

`planetRing({ source })` draws ring 0 (`'inner'`), 1 (`'outer'`) or a further ring; their bodies are focused as `id`, `o:id`, `o2:id` …. `angleLabels({ rings: [0, 1] })` labels the outer chart's angles too, with a pointer to the exact degree, and spreads labels that crowd.

Minor aspects are computed only when asked for: `computeAspects(bodies, { types: ['quincunx', 'semisquare'] })`, or `{ defs: [{ type: 'my-aspect', angle: 24, orb: 1 }] }` for your own.

### Custom layers

A layer is `{ name, render(ctx) }` returning SVG markup. The context supplies the geometry:

```ts
import { h, type Layer } from 'skywheel';

const hourMarker: Layer = {
  name: 'hour-marker',
  render: (c) => {
    const [x, y] = c.point(c.r.outer + 26, c.data.asc);
    return h('text', { x, y, transform: `rotate(-90 ${x} ${y})` }, 'hōroskopos');
  },
};
```

`ChartContext` provides:
- `data`, `bodies` (with defaults filled in), `radius`, `r` (the standard ring radii) and `rotation`
- `point(r, lon)`, `sector(inner, outer, a, b)`, `slice(r, a, b)`, `zodiacLon(lon)`, `isAboveHorizon(lon)` and `body(id)`

`h(tag, attrs, ...children)` builds elements. Attribute values are escaped automatically. Children are inserted as-is, so wrap any text that comes from data in `esc()`.

## Live charts and export

```ts
const chart = horizonChart(data).mount(el, {
  onHover: (id) => chart.highlight(id), // id of a body or 'asc' | 'dsc' | 'mc' | 'ic', or null
  onSelect: (id) => console.log(id),
});

chart.setData(next);   // re-renders; cheap enough for every animation frame
chart.highlight('mars'); // no re-render: emphasises Mars and its aspect lines, dims the rest
chart.toSVG();         // standalone SVG string, styles embedded (e.g. for download or server rendering)
chart.toSVG({ css });  // …plus your own CSS: overrides and custom layers' styles, which the page gives a mounted chart
chart.unmount();
```

Zoom and pan are left to the page: the wheel is drawn in a `viewBox`, so scaling its element (CSS `transform`) keeps it sharp.

`highlight()` makes it easy to link a chart to another view, as astro-map links its sky and its wheel.

## Theming

`mount()` injects the default stylesheet once; turn that off with `mount(el, { injectStyles: false })` and supply your own, or use `THEME_CSS`. Everything is a CSS variable on `.aw-chart`:

```css
.aw-chart { --aw-accent: #e8c26a; --aw-mars: tomato; --aw-font: 'IBM Plex Sans'; }
```

Add the class `aw-light` (`createChart(data, { className: 'aw-light' })`) for the light palette.

## Development

```bash
npm install
npm run dev        # demo at http://localhost:5180 (imports the library from source)
npm test           # builds, then runs the tests with node --test
npm run build      # ES modules + type declarations in dist/
npm run docs       # rebuilds docs/index.html (the GitHub Pages site) from docs/build.mjs
```

The tests check:
- the chart geometry (ASC on the left, upper half = above the horizon)
- glyph spreading, including 500 random crowded charts
- aspects against an independent Swiss Ephemeris chart; minor and unknown aspects, per-aspect orbs
- Ptolemy's totals for the Egyptian terms (Jupiter 79, Venus 82, Mercury 76, Mars 66, Saturn 57)
- charts without a time, outer-chart angles, tri- and quad-wheels
- layer ordering, sidereal rotation, SVG export and escaping

## Status

- **Extracted from [astro-map](../astro-map).** astro-map doesn't use this library yet; its wheel still lives in `astro-map/src/wheel/WheelView.ts`.
- **Better glyph spreading:** the library replaces the wheel's pairwise nudging with a cluster layout. The old method could leave crowded glyphs too close together (seen in testing with a cluster around 0° Aries).
- **Licence:** marked `private` and unlicensed until you choose one.
