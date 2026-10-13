import { spread } from '../collision.js';
import { esc, h } from '../svg.js';
import { SIGNS } from '../symbols.js';
import type { Layer } from '../types.js';
import { alongHorizon } from './axes.js';

export type AngleId = 'asc' | 'dsc' | 'mc' | 'ic';

export interface AngleLabelsOptions {
  /** Where the labels sit. Default just outside the zodiac ring. */
  radius?: number;
  labels?: Partial<Record<AngleId, string>>;
  /** Which angles to label. Default all four. */
  include?: AngleId[];
  /**
   * Whose angles: ring 0 is the chart's own (asc, mc), 1 the outer chart's (outerAsc, outerMc, focused
   * as 'o:asc' …), 2 and on the further rings'. Default [0]. Labels that crowd are spread apart.
   */
  rings?: number[];
  /** Minimum gap between labels, in degrees. Default 8. */
  gap?: number;
}

const LABELS: Record<AngleId, string> = { asc: 'ASC', dsc: 'DSC', mc: 'MC', ic: 'IC' };

/**
 * ASC, DSC, MC and IC labels with their degree and sign, outside the ring. Each is hoverable
 * (data-focus). Angles the data doesn't have (no asc or mc: an unknown birth time) are left out.
 */
export function angleLabels(opts: AngleLabelsOptions = {}): Layer {
  const include = opts.include ?? (['asc', 'dsc', 'mc', 'ic'] as AngleId[]);
  return {
    name: 'angles',
    render: (c) => {
      const r = opts.radius ?? c.r.outer + c.radius * 0.073;
      const items: { id: AngleId; lon: number; k: number; prefix: string }[] = [];
      for (const k of opts.rings ?? [0]) {
        const ring = c.rings[k];
        if (!ring) continue;
        const lons: Partial<Record<AngleId, number>> =
          { ...(ring.asc !== undefined && { asc: ring.asc, dsc: ring.asc + 180 }), ...(ring.mc !== undefined && { mc: ring.mc, ic: ring.mc + 180 }) };
        for (const id of include) if (lons[id] !== undefined) items.push({ id, lon: lons[id]!, k, prefix: ring.prefix });
      }
      return spread(items, opts.gap ?? 8)
        .map(({ item: { id, lon, k, prefix }, display }) => {
          const [x, y] = c.point(r, display);
          const z = c.zodiacLon(lon);
          const label = opts.labels?.[id] ?? LABELS[id];
          // A label moved off its degree, or another chart's angle, gets a pointer to the exact place.
          let pointer = '';
          if (k > 0 || Math.abs(display - lon) > 0.5) {
            const [x1, y1] = c.point(c.r.outer, lon);
            const [x2, y2] = c.point(r - c.radius * 0.045, display);
            pointer = h('line', { class: 'aw-angle-pointer', x1, y1, x2, y2 });
          }
          return h(
            'g',
            { class: `aw-angle aw-angle-${id}${k > 0 ? ` aw-outer aw-r${k}` : ''}`, 'data-focus': prefix + id },
            pointer,
            h('circle', { class: 'aw-hit', cx: x, cy: y, r: 20 }),
            h('text', { class: 'aw-angle-name', x, y: y - 5 }, esc(label)),
            h('text', { class: 'aw-angle-degree', x, y: y + 9 }, `${Math.floor(z % 30)}°${SIGNS[Math.floor(z / 30)].glyph}`),
          );
        })
        .join('');
    },
  };
}

export interface SectLabelOptions {
  labels?: { day?: string; night?: string };
}

/**
 * "Day chart" or "Night chart", written in the half of the wheel the Sun is in. Uses the Sun's
 * altitude when the data has it, otherwise which half of the zodiac the Sun is in.
 */
export function sectLabel(opts: SectLabelOptions = {}): Layer {
  return {
    name: 'sect',
    render: (c) => {
      const sun = c.body('sun');
      if (!sun || (c.data.sunAltitude === undefined && c.data.asc === undefined)) return '';
      const up = c.data.sunAltitude !== undefined ? c.data.sunAltitude > -0.833 : c.isAboveHorizon(sun.lon);
      const text = up ? (opts.labels?.day ?? 'Day chart') : (opts.labels?.night ?? 'Night chart');
      const y = up ? -0.18 * c.radius : 0.22 * c.radius;
      return alongHorizon(c, h('g', { class: 'aw-sect', 'data-focus': 'sun' }, h('text', { x: 0, y }, esc(`${sun.glyph} ${text}`))));
    },
  };
}
