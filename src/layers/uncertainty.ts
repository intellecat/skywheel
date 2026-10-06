import { norm360 } from '../geometry.js';
import { h } from '../svg.js';
import type { Layer } from '../types.js';

export interface AscUncertaintyOptions {
  inner?: number;
  outer?: number;
  /** Show "±1.4°" next to the Ascendant. Default true. */
  label?: boolean;
}

/**
 * A band over the zodiac ring covering the data's `ascRange`, e.g. the uncertainty that ΔT puts on
 * an ancient chart's Ascendant. Renders nothing without a range.
 */
export function ascUncertainty(opts: AscUncertaintyOptions = {}): Layer {
  return {
    name: 'asc-uncertainty',
    render: (c) => {
      const range = c.data.ascRange;
      if (!range) return '';
      const [a, b] = range;
      const half = (norm360(b - a) / 2).toFixed(1);
      const outer = opts.outer ?? c.r.outer + c.radius * 0.04;
      let out = h('path', { class: 'aw-asc-band', d: c.sector(opts.inner ?? c.r.zodiacInner, outer, a, b) }, h('title', {}, `Ascendant uncertain by ±${half}°`));
      if (opts.label !== false) {
        const [x, y] = c.point(c.r.outer + c.radius * 0.073, c.data.asc);
        out += h('text', { class: 'aw-asc-band-label', x, y: y + 22 }, `±${half}°`);
      }
      return out;
    },
  };
}
