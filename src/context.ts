import { angleDiff, norm360, polar, sectorPath, slicePath } from './geometry.js';
import { BODY_STYLES } from './symbols.js';
import type { ChartContext, ChartOptions, Layout, ResolvedBody, WheelBody, WheelData } from './types.js';

export const DEFAULT_LAYOUT: Readonly<Layout> = {
  outer: 1,
  zodiacInner: 0.86,
  planet: 0.72,
  degree: 0.627,
  houseInner: 0.453,
};

export function resolveBody(b: WheelBody): ResolvedBody {
  const style = BODY_STYLES[b.id];
  return {
    ...b,
    name: b.name ?? style?.name ?? b.id,
    glyph: b.glyph ?? style?.glyph ?? b.id.slice(0, 2),
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
  const rotation = options.rotation ?? 180 - data.asc;
  const bodies = data.bodies.map(resolveBody);
  const byId = new Map(bodies.map((b) => [b.id, b]));
  const outerBodies = (data.outer ?? []).map(resolveBody);
  const outerById = new Map(outerBodies.map((b) => [b.id, b]));
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
    horizonAngle: norm360(data.asc + rotation),
    lens,
    span: lens ? [lens.center - half, lens.center + half] : [0, 360],
    visible: (lon) => !lens || Math.abs(angleDiff(lon, lens.center)) <= half,
    point: (rad, lon) => polar(rad, look(lon), rotation),
    sector: (inner, outer, a, b) => sectorPath(inner, outer, ...arcOf(a, b), rotation),
    slice: (rad, a, b) => slicePath(rad, ...arcOf(a, b), rotation),
    zodiacLon: (lon) => norm360(lon - ayanamsa),
    // From the Descendant anticlockwise through the Midheaven to the Ascendant is above the horizon.
    isAboveHorizon: (lon) => norm360(lon - data.asc) > 180,
    body: (id) => byId.get(id),
    outerBody: (id) => outerById.get(id),
  };
}
