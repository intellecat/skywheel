import { angleDiff } from './geometry.js';
import type { Aspect, AspectType, MajorAspectType, MinorAspectType } from './types.js';

export interface AspectDef {
  type: AspectType;
  angle: number;
  /** Default orb in degrees. */
  orb: number;
  /** Symbol drawn on the line with aspectLines({ glyphs }); none for most minor aspects. */
  glyph?: string;
}

export const ASPECTS: readonly (AspectDef & { type: MajorAspectType; glyph: string })[] = [
  { type: 'conjunction', angle: 0, orb: 8, glyph: '☌' },
  { type: 'sextile', angle: 60, orb: 5, glyph: '⚹' },
  { type: 'square', angle: 90, orb: 7, glyph: '□' },
  { type: 'trine', angle: 120, orb: 7, glyph: '△' },
  { type: 'opposition', angle: 180, orb: 8, glyph: '☍' },
];

/**
 * Minor aspects, by angle. Not computed unless asked for (computeAspects(bodies, { types: [...] })),
 * and drawn as dashed lines. Glyphs only where Unicode has one.
 */
export const MINOR_ASPECTS: readonly (AspectDef & { type: MinorAspectType })[] = [
  { type: 'semisextile', angle: 30, orb: 2, glyph: '⚺' },
  { type: 'decile', angle: 36, orb: 1 },
  { type: 'novile', angle: 40, orb: 1 },
  { type: 'semisquare', angle: 45, orb: 2, glyph: '∠' },
  { type: 'septile', angle: 360 / 7, orb: 1 },
  { type: 'quintile', angle: 72, orb: 1.5 },
  { type: 'binovile', angle: 80, orb: 1 },
  { type: 'biseptile', angle: 720 / 7, orb: 1 },
  { type: 'tredecile', angle: 108, orb: 1 },
  { type: 'sesquiquadrate', angle: 135, orb: 2, glyph: '⚼' },
  { type: 'biquintile', angle: 144, orb: 1.5 },
  { type: 'quincunx', angle: 150, orb: 3, glyph: '⚻' },
  { type: 'triseptile', angle: 1080 / 7, orb: 1 },
  { type: 'quadnovile', angle: 160, orb: 1 },
  { type: 'quindecile', angle: 165, orb: 1 },
];

const ALL: readonly AspectDef[] = [...ASPECTS, ...MINOR_ASPECTS];

/** The definition of a known aspect (major or minor), or undefined for a name skywheel doesn't know. */
export const aspectDef = (type: AspectType): AspectDef | undefined => ALL.find((d) => d.type === type);

/** Whether an aspect is one of the five majors (drawn solid, in its own colour). */
export const isMajor = (type: AspectType) => ASPECTS.some((d) => d.type === type);

export interface AspectOptions {
  /** Which aspects to look for. Default the five majors; minor ones by name. */
  types?: AspectType[];
  orbs?: Partial<Record<AspectType, number>>;
  /** Your own aspect definitions (any name and angle), looked for as well as `types`. */
  defs?: AspectDef[];
}

function defsFor(opts: AspectOptions): AspectDef[] {
  const known = opts.types ? ALL.filter((d) => opts.types!.includes(d.type)) : [...ASPECTS];
  return [...known, ...(opts.defs ?? [])];
}

function match(sep: number, defs: AspectDef[], opts: AspectOptions): { type: AspectType; orb: number; maxOrb: number } | null {
  let best: { type: AspectType; orb: number; maxOrb: number } | null = null;
  for (const d of defs) {
    const orb = Math.abs(sep - d.angle);
    const maxOrb = opts.orbs?.[d.type] ?? d.orb;
    // With minor aspects the orbs can overlap: keep the tightest.
    if (orb <= maxOrb && (!best || orb < best.orb)) best = { type: d.type, orb, maxOrb };
  }
  return best;
}

/** Aspects between every pair of bodies (the five majors unless `types` says otherwise), tightest first. */
export function computeAspects(bodies: readonly { id: string; lon: number }[], opts: AspectOptions = {}): Aspect[] {
  const defs = defsFor(opts);
  const out: Aspect[] = [];
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const m = match(Math.abs(angleDiff(bodies[i].lon, bodies[j].lon)), defs, opts);
      if (m) out.push({ a: bodies[i].id, b: bodies[j].id, ...m });
    }
  }
  return out.sort((p, q) => p.orb - q.orb);
}

/** Aspects from each body in `outer` to each body in `inner` (bi-wheels), tightest first. */
export function computeCrossAspects(
  outer: readonly { id: string; lon: number }[],
  inner: readonly { id: string; lon: number }[],
  opts: AspectOptions = {},
): Aspect[] {
  const defs = defsFor(opts);
  const out: Aspect[] = [];
  for (const o of outer) {
    for (const i of inner) {
      const m = match(Math.abs(angleDiff(o.lon, i.lon)), defs, opts);
      if (m) out.push({ a: o.id, b: i.id, ...m });
    }
  }
  return out.sort((p, q) => p.orb - q.orb);
}
