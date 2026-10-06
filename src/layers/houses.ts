import { norm360 } from '../geometry.js';
import { h } from '../svg.js';
import type { Layer } from '../types.js';

export interface HouseCuspsOptions {
  /** Where cusp lines start (the inner circle). */
  inner?: number;
  /** Where cusp lines end. Default: inner edge of the zodiac ring. */
  outer?: number;
  /** House numbers inside each house. Default true. */
  numbers?: boolean;
  numberRadius?: number;
}

/** House cusp lines, the inner circle and house numbers. Renders nothing if the data has no cusps. */
export function houseCusps(opts: HouseCuspsOptions = {}): Layer {
  return {
    name: 'houses',
    render: (c) => {
      const cusps = c.data.cusps;
      if (!cusps || cusps.length !== 12) return '';
      const inner = opts.inner ?? c.r.houseInner;
      const outer = opts.outer ?? c.r.zodiacInner;
      const numR = opts.numberRadius ?? inner + c.radius * 0.047;
      const out = [h('circle', { class: 'aw-ring aw-ring-inner', r: inner })];
      cusps.forEach((cusp, i) => {
        const [x1, y1] = c.point(inner, cusp);
        const [x2, y2] = c.point(outer, cusp);
        out.push(h('line', { class: 'aw-cusp', x1, y1, x2, y2 }));
        if (opts.numbers !== false) {
          const mid = cusp + norm360(cusps[(i + 1) % 12] - cusp) / 2;
          const [x, y] = c.point(numR, mid);
          out.push(h('text', { class: 'aw-house-number', x, y }, String(i + 1)));
        }
      });
      return out.join('');
    },
  };
}
