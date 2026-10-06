import { angleDiff, fmt, norm360 } from '../geometry.js';
import { esc, h } from '../svg.js';
import { BODY_STYLES } from '../symbols.js';
import type { ChartContext, Layer, Point } from '../types.js';

// Small marks for abstract, single-purpose charts: a stretch of zodiac, a line along a longitude,
// an angle, an inscribed figure, a glyph or a word anywhere on the wheel. Radii are absolute
// (use c.r.* or c.radius inside a function) and longitudes are ecliptic degrees.

type R = number | ((c: ChartContext) => number);
const rad = (c: ChartContext, r: R) => (typeof r === 'function' ? r(c) : r);

export interface ArcBandOptions {
  /** From longitude `from` anticlockwise to `to`. */
  from: number;
  to: number;
  inner: R;
  outer: R;
  className?: string;
  title?: string;
}

/** A highlighted stretch of the zodiac: a sign, an orb, a shadow, an eclipse limit. */
export function arcBand(opts: ArcBandOptions): Layer {
  return {
    name: 'arc-band',
    render: (c) =>
      h('path', { class: `aw-band ${opts.className ?? ''}`, d: c.sector(rad(c, opts.inner), rad(c, opts.outer), opts.from, opts.to) }, opts.title && h('title', {}, esc(opts.title))),
  };
}

export interface RadialLineOptions {
  lon: number;
  /** Start and end radius. A negative radius continues through the centre to the opposite side. */
  from: R;
  to: R;
  className?: string;
}

/** A line along one longitude: a sign boundary, a sightline from the centre, an axis. */
export function radialLine(opts: RadialLineOptions): Layer {
  return {
    name: 'radial',
    render: (c) => {
      const [x1, y1] = c.point(rad(c, opts.from), opts.lon);
      const [x2, y2] = c.point(rad(c, opts.to), opts.lon);
      return h('line', { class: `aw-radial ${opts.className ?? ''}`, x1, y1, x2, y2 });
    },
  };
}

export interface AngleArcOptions {
  /** The two longitudes; the arc takes the shorter way between them. */
  a: number;
  b: number;
  radius: R;
  className?: string;
  /** Text at the arc's middle, e.g. "120°". */
  label?: string;
  labelRadius?: R;
}

/** The angle between two longitudes, drawn as an arc near the centre. */
export function angleArc(opts: AngleArcOptions): Layer {
  return {
    name: 'angle-arc',
    render: (c) => {
      const r = rad(c, opts.radius);
      const d = angleDiff(opts.b, opts.a);
      const from = d >= 0 ? opts.a : opts.b;
      const span = Math.abs(d);
      const [x0, y0] = c.point(r, from);
      const [x1, y1] = c.point(r, from + span);
      const path = `M${fmt(x0)},${fmt(y0)} A${fmt(r)},${fmt(r)} 0 ${span > 180 ? 1 : 0} 0 ${fmt(x1)},${fmt(y1)}`;
      let out = h('path', { class: `aw-angle-arc ${opts.className ?? ''}`, d: path });
      if (opts.label) {
        const [lx, ly] = c.point(rad(c, opts.labelRadius ?? r * 1.45), from + span / 2);
        out += h('text', { class: `aw-angle-label ${opts.className ?? ''}`, x: lx, y: ly }, esc(opts.label));
      }
      return out;
    },
  };
}

export interface PolygonOptions {
  /** Longitude of the first vertex; the others follow every 360/count degrees. */
  start: number;
  count: number;
  radius: R;
  className?: string;
  /** Also join every vertex to every other (a sextile's hexagram, a square's cross). */
  star?: boolean;
}

/** A regular figure inscribed in the circle: an aspect's whole family of angles. */
export function polygon(opts: PolygonOptions): Layer {
  return {
    name: 'polygon',
    render: (c) => {
      const r = rad(c, opts.radius);
      const pts = Array.from({ length: opts.count }, (_, i) => c.point(r, opts.start + (i * 360) / opts.count));
      let d = `M${pts.map((p) => `${fmt(p[0])},${fmt(p[1])}`).join('L')}Z`;
      if (opts.star)
        for (let i = 0; i < pts.length; i++)
          for (let j = i + 2; j < pts.length; j++) if (!(i === 0 && j === pts.length - 1)) d += `M${fmt(pts[i][0])},${fmt(pts[i][1])}L${fmt(pts[j][0])},${fmt(pts[j][1])}`;
      return h('path', { class: `aw-polygon ${opts.className ?? ''}`, d });
    },
  };
}

export interface ChordOptions {
  a: number;
  b: number;
  radius: R;
  /** Radius at b, if different. */
  radiusB?: R;
  className?: string;
}

/** A straight line between two points of the wheel. */
export function chord(opts: ChordOptions): Layer {
  return {
    name: 'chord',
    render: (c) => {
      const [x1, y1] = c.point(rad(c, opts.radius), opts.a);
      const [x2, y2] = c.point(rad(c, opts.radiusB ?? opts.radius), opts.b);
      return h('line', { class: `aw-chord ${opts.className ?? ''}`, x1, y1, x2, y2 });
    },
  };
}

export interface GlyphMarkOptions {
  lon: number;
  radius: R;
  /** A built-in body id picks up its glyph, name and colour. */
  id?: string;
  glyph?: string;
  title?: string;
  className?: string;
  /** Draw a disc in the background colour behind the glyph, so lines pass behind it. */
  knockout?: number;
  /** Font size in px. */
  size?: number;
}

/** One glyph anywhere on the wheel, e.g. a planet at the moment that matters. */
export function glyphMark(opts: GlyphMarkOptions): Layer {
  return {
    name: 'glyph-mark',
    render: (c) => {
      const [x, y] = c.point(rad(c, opts.radius), opts.lon);
      const style = opts.id ? BODY_STYLES[opts.id] : undefined;
      const glyph = opts.glyph ?? style?.glyph ?? opts.id ?? '';
      const color = opts.id && style ? `var(--aw-${opts.id}, ${style.color})` : undefined;
      return (
        (opts.knockout ? h('circle', { class: 'aw-knockout', cx: x, cy: y, r: opts.knockout }) : '') +
        h(
          'text',
          { class: `aw-mark-glyph ${opts.className ?? ''}`, x, y, style: [color && `fill:${color}`, opts.size && `font-size:${opts.size}px`].filter(Boolean).join(';') || undefined },
          h('title', {}, esc(opts.title ?? style?.name ?? '')),
          esc(glyph),
        )
      );
    },
  };
}

export interface TextMarkOptions {
  lon: number;
  radius: R;
  text: string;
  className?: string;
  /** Turn the text to run along the circle (tangentially), keeping it upright. */
  along?: boolean;
}

/** A word or number anywhere on the wheel. */
export function textMark(opts: TextMarkOptions): Layer {
  return {
    name: 'text-mark',
    render: (c) => {
      const [x, y] = c.point(rad(c, opts.radius), opts.lon);
      let transform: string | undefined;
      if (opts.along) {
        const screen = norm360(opts.lon + c.rotation);
        const rot = screen > 0 && screen < 180 ? 90 - screen : 270 - screen;
        transform = `rotate(${fmt(rot)} ${fmt(x)} ${fmt(y)})`;
      }
      return h('text', { class: `aw-mark-text ${opts.className ?? ''}`, x, y, transform }, esc(opts.text));
    },
  };
}

export interface TrackOptions {
  /** Longitudes in time order; `radius` gives each sample's distance from the centre. */
  lons: number[];
  /** A fixed radius, or one per sample (a spiral, when time runs outward). */
  radius: number | ((i: number, c: ChartContext) => number);
  className?: string;
}

/** A body's path over time, as a polyline around the wheel (constant radius, or a spiral). */
export function track(opts: TrackOptions): Layer {
  return {
    name: 'track',
    render: (c) => {
      const { radius } = opts;
      const r = (i: number) => (typeof radius === 'function' ? radius(i, c) : radius);
      const pts: Point[] = opts.lons.map((l, i) => c.point(r(i), l));
      return h('path', { class: `aw-track ${opts.className ?? ''}`, d: `M${pts.map((p) => `${fmt(p[0])},${fmt(p[1])}`).join('L')}` });
    },
  };
}

/** A dot at a longitude and radius. */
export function dot(opts: { lon: number; radius: R; r?: number; className?: string; title?: string }): Layer {
  return {
    name: 'dot',
    render: (c) => {
      const [cx, cy] = c.point(rad(c, opts.radius), opts.lon);
      return h('circle', { class: `aw-dot ${opts.className ?? ''}`, cx, cy, r: opts.r ?? 3 }, opts.title && h('title', {}, esc(opts.title)));
    },
  };
}

/** Wraps other layers in a group with a class, e.g. to dim or colour them together. */
export function group(className: string, ...layers: Layer[]): Layer {
  return {
    name: 'group',
    render: (c) => h('g', { class: className }, layers.map((l) => l.render(c)).join('')),
  };
}
