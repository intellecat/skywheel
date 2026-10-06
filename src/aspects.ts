import { angleDiff } from './geometry.js';
import type { Aspect, AspectType } from './types.js';

export interface AspectDef {
  type: AspectType;
  angle: number;
  /** Default orb in degrees. */
  orb: number;
  glyph: string;
}

export const ASPECTS: readonly AspectDef[] = [
  { type: 'conjunction', angle: 0, orb: 8, glyph: '☌' },
  { type: 'sextile', angle: 60, orb: 5, glyph: '⚹' },
  { type: 'square', angle: 90, orb: 7, glyph: '□' },
  { type: 'trine', angle: 120, orb: 7, glyph: '△' },
  { type: 'opposition', angle: 180, orb: 8, glyph: '☍' },
];

export interface AspectOptions {
  types?: AspectType[];
  orbs?: Partial<Record<AspectType, number>>;
}

/** Major aspects between every pair of bodies, tightest first. */
export function computeAspects(bodies: readonly { id: string; lon: number }[], opts: AspectOptions = {}): Aspect[] {
  const defs = ASPECTS.filter((d) => !opts.types || opts.types.includes(d.type));
  const out: Aspect[] = [];
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const sep = Math.abs(angleDiff(bodies[i].lon, bodies[j].lon));
      for (const d of defs) {
        const orb = Math.abs(sep - d.angle);
        if (orb <= (opts.orbs?.[d.type] ?? d.orb)) {
          out.push({ a: bodies[i].id, b: bodies[j].id, type: d.type, orb });
          break;
        }
      }
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
  const defs = ASPECTS.filter((d) => !opts.types || opts.types.includes(d.type));
  const out: Aspect[] = [];
  for (const o of outer) {
    for (const i of inner) {
      const sep = Math.abs(angleDiff(o.lon, i.lon));
      for (const d of defs) {
        const orb = Math.abs(sep - d.angle);
        if (orb <= (opts.orbs?.[d.type] ?? d.orb)) {
          out.push({ a: o.id, b: i.id, type: d.type, orb });
          break;
        }
      }
    }
  }
  return out.sort((p, q) => p.orb - q.orb);
}
