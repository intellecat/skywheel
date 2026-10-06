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
}

const LABELS: Record<AngleId, string> = { asc: 'ASC', dsc: 'DSC', mc: 'MC', ic: 'IC' };

/** ASC, DSC, MC and IC labels with their degree and sign, outside the ring. Each is hoverable (data-focus). */
export function angleLabels(opts: AngleLabelsOptions = {}): Layer {
  return {
    name: 'angles',
    render: (c) => {
      const r = opts.radius ?? c.r.outer + c.radius * 0.073;
      const { asc, mc } = c.data;
      const lons: Record<AngleId, number> = { asc, dsc: asc + 180, mc, ic: mc + 180 };
      return (opts.include ?? (['asc', 'dsc', 'mc', 'ic'] as AngleId[]))
        .map((id) => {
          const [x, y] = c.point(r, lons[id]);
          const z = c.zodiacLon(lons[id]);
          const label = opts.labels?.[id] ?? LABELS[id];
          return h(
            'g',
            { class: `aw-angle aw-angle-${id}`, 'data-focus': id },
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
      if (!sun) return '';
      const up = c.data.sunAltitude !== undefined ? c.data.sunAltitude > -0.833 : c.isAboveHorizon(sun.lon);
      const text = up ? (opts.labels?.day ?? 'Day chart') : (opts.labels?.night ?? 'Night chart');
      const y = up ? -0.18 * c.radius : 0.22 * c.radius;
      return alongHorizon(c, h('g', { class: 'aw-sect', 'data-focus': 'sun' }, h('text', { x: 0, y }, esc(`${sun.glyph} ${text}`))));
    },
  };
}
