import { fmt, norm360 } from '../geometry.js';
import { h } from '../svg.js';
import { SIGNS, type Element } from '../symbols.js';
import type { Layer } from '../types.js';

export const ELEMENT_CLASS: Record<Element, string> = { fire: 'aw-fire', earth: 'aw-earth-el', air: 'aw-air', water: 'aw-water' };

export interface ZodiacRingOptions {
  outer?: number;
  inner?: number;
  /** Sign glyphs in the ring. Default true. */
  glyphs?: boolean;
  /** Degree ticks along the inner edge (every 1°, longer at 5° and 10°). Default true. */
  ticks?: boolean;
  /** Tint each sign with its element colour. Default true. */
  tint?: boolean;
  /** Only these signs (0 = Aries) are tinted and drawn at full strength; the rest recede. */
  emphasize?: number[];
  /** Number the degrees within each sign every n degrees, inside the ring (useful under a lens). */
  labelEvery?: number;
}

/** The ring of twelve 30° signs. Sidereal zodiacs are rotated by the data's ayanamsa. */
export function zodiacRing(opts: ZodiacRingOptions = {}): Layer {
  return {
    name: 'zodiac',
    render: (c) => {
      const outer = opts.outer ?? c.r.outer;
      const inner = opts.inner ?? c.r.zodiacInner;
      const start = c.data.ayanamsa ?? 0;
      const out: string[] = [];

      const [v0, v1] = c.span;
      SIGNS.forEach((sign, k) => {
        let a = start + k * 30;
        let b = a + 30;
        // Under a lens, draw only the part of the sign that is in view.
        if (c.lens) {
          const from = v0 + norm360(a - v0);
          const to = from + 30;
          const lo = Math.max(from, v0), hi = Math.min(to, v1);
          const lo2 = Math.max(from - 360, v0), hi2 = Math.min(to - 360, v1);
          if (hi > lo) [a, b] = [lo, hi];
          else if (hi2 > lo2) [a, b] = [lo2, hi2];
          else return;
        }
        const el = ELEMENT_CLASS[sign.element];
        const dim = opts.emphasize && !opts.emphasize.includes(k);
        out.push(h('path', { class: `aw-sign ${opts.tint === false || dim ? 'aw-untinted' : el}${dim ? ' aw-dim' : ''}`, d: c.sector(inner, outer, a, b) }));
        const mid = c.lens ? (c.visible(start + k * 30 + 15) ? start + k * 30 + 15 : (a + b) / 2) : a + 15;
        if (opts.glyphs !== false && (!c.lens || c.lens.zoom * (b - a) > 14)) {
          const [x, y] = c.point((outer + inner) / 2, mid);
          out.push(h('text', { class: `aw-sign-glyph ${el}${dim ? ' aw-dim' : ''}`, x, y }, h('title', {}, c.words.signs?.[k] ?? sign.name), sign.glyph));
        }
      });

      if (opts.ticks !== false) {
        const k = (outer - inner) / 42; // tick lengths scale with the ring width
        let d = '';
        for (let deg = 0; deg < 360; deg++) {
          if (!c.visible(start + deg)) continue;
          const len = (deg % 10 === 0 ? 9 : deg % 5 === 0 ? 6 : 3) * k;
          const [x0, y0] = c.point(inner, start + deg);
          const [x1, y1] = c.point(inner + len, start + deg);
          d += `M${fmt(x0)},${fmt(y0)}L${fmt(x1)},${fmt(y1)}`;
        }
        out.push(h('path', { class: 'aw-ticks', d }));
      }

      if (opts.labelEvery) {
        for (let deg = 0; deg < 360; deg += opts.labelEvery) {
          if (!c.visible(start + deg)) continue;
          const [x, y] = c.point(inner - 12, start + deg);
          out.push(h('text', { class: 'aw-degree-label', x, y }, `${deg % 30}°`));
        }
      }
      if (c.lens) {
        // Arcs rather than full circles: only the visible stretch.
        const arc = (r: number) => {
          const [x0, y0] = c.point(r, v0 + 0.001), [x1, y1] = c.point(r, v1 - 0.001);
          return `M${fmt(x0)},${fmt(y0)} A${fmt(r)},${fmt(r)} 0 ${norm360((v1 - v0) * c.lens!.zoom) > 180 || (v1 - v0) * c.lens!.zoom >= 359 ? 1 : 0} 0 ${fmt(x1)},${fmt(y1)}`;
        };
        out.push(h('path', { class: 'aw-ring', d: arc(outer), fill: 'none' }), h('path', { class: 'aw-ring', d: arc(inner), fill: 'none' }));
      } else out.push(h('circle', { class: 'aw-ring', r: outer }), h('circle', { class: 'aw-ring', r: inner }));
      return out.join('');
    },
  };
}
