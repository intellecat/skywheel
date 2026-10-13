import { esc, h } from '../svg.js';
import { BODY_STYLES } from '../symbols.js';
import type { Layer } from '../types.js';

/** A stretch of a sign ruled by one planet: [planet id, degree in the sign where it ends]. */
export type DignitySegment = readonly [planet: string, end: number];

const CHALDEAN = ['saturn', 'jupiter', 'mars', 'sun', 'venus', 'mercury', 'moon'];

/** Faces (decans) in the Chaldean order, from Mars in the first ten degrees of Aries: twelve signs × three. */
export const CHALDEAN_DECANS: readonly (readonly DignitySegment[])[] = Array.from({ length: 12 }, (_, sign) =>
  [10, 20, 30].map((end, i) => [CHALDEAN[(2 + sign * 3 + i) % 7], end] as const),
);

/** The Egyptian terms (bounds), as Ptolemy gives them (Tetrabiblos I.20). */
export const EGYPTIAN_TERMS: readonly (readonly DignitySegment[])[] = [
  [['jupiter', 6], ['venus', 12], ['mercury', 20], ['mars', 25], ['saturn', 30]],
  [['venus', 8], ['mercury', 14], ['jupiter', 22], ['saturn', 27], ['mars', 30]],
  [['mercury', 6], ['jupiter', 12], ['venus', 17], ['mars', 24], ['saturn', 30]],
  [['mars', 7], ['venus', 13], ['mercury', 19], ['jupiter', 26], ['saturn', 30]],
  [['jupiter', 6], ['venus', 11], ['saturn', 18], ['mercury', 24], ['mars', 30]],
  [['mercury', 7], ['venus', 17], ['jupiter', 21], ['mars', 28], ['saturn', 30]],
  [['saturn', 6], ['mercury', 14], ['jupiter', 21], ['venus', 28], ['mars', 30]],
  [['mars', 7], ['venus', 11], ['mercury', 19], ['jupiter', 24], ['saturn', 30]],
  [['jupiter', 12], ['venus', 17], ['mercury', 21], ['saturn', 26], ['mars', 30]],
  [['mercury', 7], ['jupiter', 14], ['venus', 22], ['saturn', 26], ['mars', 30]],
  [['mercury', 7], ['venus', 13], ['jupiter', 20], ['mars', 25], ['saturn', 30]],
  [['venus', 12], ['jupiter', 16], ['mercury', 19], ['mars', 28], ['saturn', 30]],
];

export interface DignityRingOptions {
  /** 'decans' (Chaldean faces), 'terms' (Egyptian bounds), or your own table: per sign, segments in order. */
  table?: 'decans' | 'terms' | readonly (readonly DignitySegment[])[];
  /** Inner and outer radius. Default a band just outside the zodiac ring. */
  inner?: number;
  outer?: number;
  /** Draw each segment's ruler. Default true. */
  glyphs?: boolean;
  className?: string;
}

/**
 * A ring of decans or terms around (or inside) the zodiac: each sign divided among its rulers, with
 * the ruler's glyph in each part. Rotated with the signs on sidereal charts. Give it room with the
 * chart's radius, or move angleLabels({ radius }) outward, when it sits outside the zodiac.
 */
export function dignityRing(opts: DignityRingOptions = {}): Layer {
  const table = opts.table === 'terms' ? EGYPTIAN_TERMS : opts.table === 'decans' || !opts.table ? CHALDEAN_DECANS : opts.table;
  return {
    name: 'dignities',
    render: (c) => {
      const inner = opts.inner ?? c.r.outer;
      const outer = opts.outer ?? c.r.outer + c.radius * 0.055;
      const start = c.data.ayanamsa ?? 0;
      const out: string[] = [];
      table.forEach((segments, sign) => {
        let from = 0;
        segments.forEach(([planet, end], i) => {
          const a = start + sign * 30 + from;
          const b = start + sign * 30 + end;
          if (c.visible((a + b) / 2)) {
            const style = BODY_STYLES[planet];
            out.push(h('path', { class: `aw-dignity aw-dignity-${i % 2 ? 'odd' : 'even'}`, d: c.sector(inner, outer, a, b) }, h('title', {}, esc(`${style?.name ?? planet} ${from}°–${end}°`))));
            if (opts.glyphs !== false && style) {
              const [x, y] = c.point((inner + outer) / 2, (a + b) / 2);
              out.push(h('text', { class: 'aw-dignity-glyph', x, y, style: `fill:var(--aw-${planet}, ${style.color})` }, style.glyph));
            }
          }
          from = end;
        });
      });
      return h('g', { class: ['aw-dignities', opts.className].filter(Boolean).join(' ') }, out.join(''));
    },
  };
}
