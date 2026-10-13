import { esc, h } from '../svg.js';
import type { ChartContext, Layer } from '../types.js';

export interface HorizonCaptions {
  above: string;
  below: string;
  east: string;
  west: string;
}

export interface HorizonAxesOptions {
  /** How far past the zodiac ring the axes reach. Default ~1.3% of the radius. */
  overhang?: number;
  /** Dashed MC–IC line. Default true. */
  meridian?: boolean;
  /** Captions naming the two halves and the two ends of the horizon; false to hide, or your own text. */
  captions?: boolean | Partial<HorizonCaptions>;
}

const CAPTIONS: HorizonCaptions = {
  above: 'ABOVE THE HORIZON',
  below: 'BELOW THE HORIZON',
  east: 'EAST · RISING',
  west: 'WEST · SETTING',
};

/** Rotates content drawn for an Ascendant-on-the-left chart to follow the actual horizon. */
export const alongHorizon = (c: ChartContext, content: string) =>
  c.horizonAngle === 180 ? content : h('g', { transform: `rotate(${180 - c.horizonAngle})` }, content);

/**
 * The chart's horizon (Ascendant–Descendant) and meridian (MC–IC) lines. On a wheel with the
 * Ascendant on the left the horizon is horizontal: everything above it is above the observer's horizon.
 * Draws nothing for an angle the data doesn't have (an unknown birth time).
 */
export function horizonAxes(opts: HorizonAxesOptions = {}): Layer {
  return {
    name: 'axes',
    render: (c) => {
      const r = c.r.outer + (opts.overhang ?? c.radius * 0.013);
      const { asc, mc } = c.data;
      const line = (cls: string, a: number, b: number) => {
        const [x1, y1] = c.point(r, a);
        const [x2, y2] = c.point(r, b);
        return h('line', { class: cls, x1, y1, x2, y2 });
      };
      if (asc === undefined) return opts.meridian !== false && mc !== undefined ? line('aw-meridian', mc, mc + 180) : '';
      let out = (opts.meridian !== false && mc !== undefined ? line('aw-meridian', mc, mc + 180) : '') + line('aw-horizon', asc, asc + 180);

      if (opts.captions !== false) {
        const t = { ...CAPTIONS, ...(typeof opts.captions === 'object' ? opts.captions : {}) };
        const R = c.radius;
        const inner = c.r.houseInner;
        out += alongHorizon(
          c,
          h('text', { class: 'aw-caption', x: 0, y: -0.28 * R }, esc(t.above)) +
            h('text', { class: 'aw-caption', x: 0, y: 0.32 * R }, esc(t.below)) +
            h('text', { class: 'aw-caption aw-caption-dir', x: -inner + 10, y: -8, 'text-anchor': 'start' }, esc(t.east)) +
            h('text', { class: 'aw-caption aw-caption-dir', x: inner - 10, y: -8, 'text-anchor': 'end' }, esc(t.west)),
        );
      }
      return out;
    },
  };
}
