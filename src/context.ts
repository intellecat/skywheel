import { angleDiff, norm360, polar, sectorPath, slicePath } from './geometry.js';
import { BODY_STYLES } from './symbols.js';
import type { Aspect, ChartContext, ChartOptions, Layout, ResolvedBody, ResolvedRing, WheelBody, WheelData } from './types.js';

export const DEFAULT_LAYOUT: Readonly<Layout> = {
  outer: 1,
  zodiacInner: 0.86,
  planet: 0.72,
  degree: 0.627,
  houseInner: 0.453,
};

/** Characters as a reader sees them: variation selectors and combining marks don't count. */
const visibleLength = (s: string) => [...s.replace(/[\uFE00-\uFE0F\u0300-\u036F\u200D]/g, '')].length;

/** A label sized for one symbol is too big for two or three: shrink it to about the same width. */
export const autoGlyphScale = (glyph: string) => {
  const n = visibleLength(glyph);
  return n <= 1 ? 1 : n === 2 ? 0.68 : 0.52;
};

export function resolveBody(b: WheelBody): ResolvedBody {
  const style = BODY_STYLES[b.id];
  const glyph = b.glyph ?? style?.glyph ?? b.id.slice(0, 2);
  return {
    ...b,
    name: b.name ?? style?.name ?? b.id,
    glyph,
    glyphScale: b.glyphScale ?? autoGlyphScale(glyph),
    // Built-in colours stay themeable through CSS variables named after the body.
    color: b.color ?? (style ? `var(--aw-${b.id}, ${style.color})` : 'var(--aw-body, #d8deea)'),
    retrograde: (b.speed ?? 0) < 0,
  };
}

/** Builds the shared context every layer renders from (react-chart's ChartContext, minus React). */
export function createContext(data: WheelData, options: ChartOptions, uid: string): ChartContext {
  const size = options.size ?? 680;
  const radius = options.radius ?? Math.round(size * 0.441);
  const layout = { ...DEFAULT_LAYOUT, ...options.layout };
  const r = Object.fromEntries(Object.entries(layout).map(([k, v]) => [k, v * radius])) as unknown as Layout;
  // Without an Ascendant, 0° Aries goes on the left.
  const rotation = options.rotation ?? 180 - (data.asc ?? 0);
  const ring = (list: WheelBody[], k: number, extra: { asc?: number; mc?: number; aspects?: Aspect[] }): ResolvedRing => {
    const bodies = list.map(resolveBody);
    const byId = new Map(bodies.map((b) => [b.id, b]));
    return { ...extra, bodies, prefix: k === 0 ? '' : k === 1 ? 'o:' : `o${k}:`, body: (id) => byId.get(id) };
  };
  const rings: ResolvedRing[] = [ring(data.bodies, 0, { asc: data.asc, mc: data.mc, aspects: data.aspects })];
  if (data.outer) rings.push(ring(data.outer, 1, { asc: data.outerAsc, mc: data.outerMc, aspects: data.crossAspects }));
  for (const r of data.rings ?? []) rings.push(ring(r.bodies, rings.length, r));
  const bodies = rings[0].bodies;
  const outerBodies = rings[1]?.bodies ?? [];
  const ayanamsa = data.ayanamsa ?? 0;
  const lens = options.lens && options.lens.zoom !== 1 ? options.lens : undefined;
  // Under a lens, a longitude's screen angle is its distance from the centre times the zoom.
  const look = (lon: number) => (lens ? lens.center + angleDiff(lon, lens.center) * lens.zoom : lon);
  const half = lens ? 180 / lens.zoom : 180;
  const arcOf = (a: number, b: number): [number, number] => {
    if (!lens) return [a, b];
    const a2 = look(a);
    return [a2, a2 + Math.min(359.99, norm360(b - a) * lens.zoom)];
  };

  return {
    data,
    uid,
    words: options.words ?? {},
    size,
    radius,
    r,
    rotation,
    bodies,
    outerBodies,
    rings,
    horizonAngle: norm360((data.asc ?? 0) + rotation),
    lens,
    span: lens ? [lens.center - half, lens.center + half] : [0, 360],
    visible: (lon) => !lens || Math.abs(angleDiff(lon, lens.center)) <= half,
    point: (rad, lon) => polar(rad, look(lon), rotation),
    sector: (inner, outer, a, b) => sectorPath(inner, outer, ...arcOf(a, b), rotation),
    slice: (rad, a, b) => slicePath(rad, ...arcOf(a, b), rotation),
    zodiacLon: (lon) => norm360(lon - ayanamsa),
    // From the Descendant anticlockwise through the Midheaven to the Ascendant is above the horizon.
    isAboveHorizon: (lon) => data.asc === undefined || norm360(lon - data.asc) > 180,
    body: rings[0].body,
    outerBody: (id) => rings[1]?.body(id),
  };
}
