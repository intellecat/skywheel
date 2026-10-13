import { h } from '../svg.js';
import { DAY_SKY, NIGHT_SKY, dayFactor, mixColor, parseColor } from '../sky.js';
import type { Layer } from '../types.js';

/** A plain disc behind the wheel. */
export function backdrop(opts: { radius?: number } = {}): Layer {
  return {
    name: 'backdrop',
    render: (c) => h('circle', { class: 'aw-backdrop', r: opts.radius ?? c.r.outer }),
  };
}

export interface SkyEarthOptions {
  /** Radius of the two halves. Default: the inner edge of the zodiac ring. */
  radius?: number;
  /** Sky colours at full night and full day (#rrggbb); the Sun's altitude blends between them. */
  night?: string;
  day?: string;
}

/**
 * The half of the zodiac above the horizon, tinted with the colour of the sky, and the half below it
 * in earth tones. With the Ascendant on the left this is simply the top and bottom of the wheel.
 * Without an Ascendant there is no horizon: it draws a plain backdrop instead.
 */
export function skyEarth(opts: SkyEarthOptions = {}): Layer {
  const night = parseColor(opts.night ?? NIGHT_SKY);
  const dayColor = parseColor(opts.day ?? DAY_SKY);
  return {
    name: 'sky-earth',
    render: (c) => {
      const r = opts.radius ?? c.r.zodiacInner;
      const { asc, sunAltitude } = c.data;
      if (asc === undefined) return h('circle', { class: 'aw-backdrop', r: c.r.outer });
      const day = sunAltitude === undefined ? 0 : dayFactor(sunAltitude);
      const id = `${c.uid}-sky`;
      return (
        h(
          'defs',
          {},
          h(
            'linearGradient',
            { id, x1: 0, y1: 0, x2: 0, y2: 1 },
            h('stop', { offset: 0, 'stop-color': mixColor(night, dayColor, day), 'stop-opacity': 0.9 }),
            h('stop', { offset: 1, 'stop-color': mixColor(night, dayColor, Math.min(1, day + 0.15)), 'stop-opacity': 0.55 }),
          ),
        ) +
        h('path', { class: 'aw-sky', d: c.slice(r, asc + 180, asc + 360), fill: `url(#${id})` }) +
        h('path', { class: 'aw-earth', d: c.slice(r, asc, asc + 180) })
      );
    },
  };
}

/** A plain circle, e.g. to separate the two rings of a bi-wheel. */
export function ring(opts: { radius: number; className?: string }): Layer {
  return {
    name: 'ring',
    render: () => h('circle', { class: `aw-ring ${opts.className ?? 'aw-ring-inner'}`, r: opts.radius }),
  };
}
