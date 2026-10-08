# Skywheel

A composable, framework-agnostic SVG chart wheel for astrology, with astro-map's look: the chart as the sky flattened onto the zodiac.

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
  bodies: { id: string; lon: number; speed?: number; alt?: number; name?: string; glyph?: string; color?: string }[];
  asc: number;              // tropical longitudes, degrees
  mc: number;
  cusps?: number[];         // 12 house cusps; omit for no houses
  ayanamsa?: number;        // sidereal zodiacs: tropical − sidereal
  sunAltitude?: number;     // tints the sky, decides day or night chart
  ascRange?: [number, number]; // Ascendant uncertainty band (e.g. ΔT for ancient charts)
  aspects?: Aspect[];       // otherwise computed
}
```

Built-in ids (`sun`, `moon`, `mercury` … `pluto`, `node`, `chiron`) get names, glyphs and colours. Any other id works if you pass `name`, `glyph` and `color`. A negative `speed` marks a body as retrograde.

## Presets

```ts
horizonChart(data)                  // sky/earth halves, horizon + meridian, day/night, ASC band
horizonChart(data, { aspects: true }) // with aspect lines instead of the captions
classicChart(data)                  // backdrop, zodiac, houses, aspect lines, planets with minutes
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
| `aspectLines({ types, orbs, glyphs, include })` | coloured aspect lines that fade as the orb widens |

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
chart.unmount();
```

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
```

The tests check:
- the chart geometry (ASC on the left, upper half = above the horizon)
- glyph spreading, including 500 random crowded charts
- aspects against an independent Swiss Ephemeris chart
- layer ordering, sidereal rotation, SVG export and escaping

## Status

- **Extracted from [astro-map](../astro-map).** astro-map doesn't use this library yet; its wheel still lives in `astro-map/src/wheel/WheelView.ts`.
- **Better glyph spreading:** the library replaces the wheel's pairwise nudging with a cluster layout. The old method could leave crowded glyphs too close together (seen in testing with a cluster around 0° Aries).
- **Licence:** marked `private` and unlicensed until you choose one.
