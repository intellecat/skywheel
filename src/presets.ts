import { createChart, type Chart } from './chart.js';
import { backdrop, ring, skyEarth } from './layers/background.js';
import { zodiacRing } from './layers/zodiac.js';
import { houseCusps } from './layers/houses.js';
import { horizonAxes, type HorizonCaptions } from './layers/axes.js';
import { angleLabels, sectLabel } from './layers/angles.js';
import { ascUncertainty } from './layers/uncertainty.js';
import { aspectLines, crossAspectLines } from './layers/aspects.js';
import { planetRing } from './layers/planets.js';
import type { ChartOptions, Layer, WheelData } from './types.js';

// Ready-made charts, each just a composition of layers (like react-chart's NatalChart).
// Copy one and change the layers to make your own.

export interface HorizonChartOptions extends ChartOptions {
  /** Captions naming the halves of the sky; false to hide. */
  captions?: boolean | Partial<HorizonCaptions>;
  /** Also draw aspect lines (the captions move out of their way). Default false. */
  aspects?: boolean;
}

/**
 * The sky, flattened: the half above the horizon tinted with the sky's colour, horizon and meridian
 * drawn through the centre, day/night chart, and the Ascendant's uncertainty band when given.
 */
export function horizonChart(data: WheelData, opts: HorizonChartOptions = {}): Chart {
  return createChart(data, opts).use(
    skyEarth(),
    zodiacRing(),
    houseCusps(),
    ...(opts.aspects ? [aspectLines()] : []),
    horizonAxes({ captions: opts.aspects ? false : opts.captions }),
    ...(opts.aspects ? [] : [sectLabel()]),
    ascUncertainty(),
    angleLabels(),
    planetRing(),
  );
}

/** A conventional natal wheel: zodiac, houses, aspect lines and planets. */
export function classicChart(data: WheelData, opts: ChartOptions = {}): Chart {
  return createChart(data, opts).use(
    backdrop(),
    zodiacRing(),
    houseCusps(),
    aspectLines(),
    horizonAxes({ captions: false }),
    angleLabels(),
    planetRing({ minutes: true }),
  );
}

export interface BiWheelOptions extends ChartOptions {
  /** Aspect lines inside the inner circle: cross aspects between the rings (default), the inner chart's own, or none. */
  aspects?: 'cross' | 'inner' | 'none';
}

/** Draws a layer only when the chart has houses (a known birth time and place). */
const withHouses = (layer: Layer): Layer => ({ name: layer.name, render: (c) => (c.data.cusps ? layer.render(c) : '') });

/** The angles of every ring that has them; the inner chart's only when it has houses too. */
const ringAngles = (count: number): Layer => ({
  name: 'angles',
  render: (c) => angleLabels({ rings: Array.from({ length: count }, (_, k) => k).filter((k) => k > 0 || !!c.data.cusps) }).render(c),
});

/**
 * Two charts on one wheel: the chart's `bodies` on the inner ring (a natal chart) and `outer` bodies
 * on the outer ring (today's transits, or a partner's planets), with the aspects between them.
 */
export function biWheelChart(data: WheelData, opts: BiWheelOptions = {}): Chart {
  const R = opts.radius ?? Math.round((opts.size ?? 680) * 0.441);
  const sep = 0.665 * R;
  const mode = opts.aspects ?? 'cross';
  return createChart(data, { ...opts, layout: { planet: 0.57, degree: 0.5, houseInner: 0.43, ...opts.layout } }).use(
    backdrop(),
    zodiacRing(),
    houseCusps(),
    ring({ radius: sep, className: 'aw-ring-sep' }),
    ...(mode === 'cross' ? [crossAspectLines()] : mode === 'inner' ? [aspectLines()] : []),
    withHouses(horizonAxes({ captions: false, meridian: true })),
    ringAngles(2),
    planetRing({ source: 'outer', radius: 0.765 * R, degreeRadius: 0.7 * R, gap: 8 }),
    planetRing({ tickRadius: sep, gap: 9 }),
  );
}

export interface MultiWheelOptions extends ChartOptions {
  /** Aspect lines inside the inner circle: from ring n to the inner chart (default 1), the inner chart's own, or none. */
  aspects?: number | 'inner' | 'none';
}

/**
 * Three or four charts on one wheel (a tri-wheel such as natal + progressed + transits): the chart's
 * `bodies` innermost, then `outer`, then each of `rings`, outward. Each ring gets an equal band
 * between the inner circle and the zodiac; glyphs shrink as the bands narrow.
 */
export function multiWheelChart(data: WheelData, opts: MultiWheelOptions = {}): Chart {
  const R = opts.radius ?? Math.round((opts.size ?? 680) * 0.441);
  const n = 1 + (data.outer ? 1 : 0) + (data.rings?.length ?? 0);
  const lo = 0.36;
  const hi = 0.86;
  const w = (hi - lo) / n;
  const scale = Math.min(1, (w / 0.21) ** 0.5);
  const seps = Array.from({ length: n - 1 }, (_, k) => ring({ radius: (lo + (k + 1) * w) * R, className: 'aw-ring-sep' }));
  // Ring k's band runs from lo + k·w to lo + (k+1)·w; its ticks sit on the band's outer edge.
  const rings = Array.from({ length: n }, (_, k) =>
    planetRing({
      source: k,
      radius: (lo + (k + 0.6) * w) * R,
      degreeRadius: (lo + (k + 0.22) * w) * R,
      tickRadius: (lo + (k + 1) * w) * R,
      gap: 9 * scale,
      glyphScale: scale * (k ? 0.9 : 1),
    }),
  ).reverse();
  const mode = opts.aspects ?? 1;
  return createChart(data, { ...opts, layout: { houseInner: lo, ...opts.layout } }).use(
    backdrop(),
    zodiacRing(),
    houseCusps(),
    ...seps,
    ...(mode === 'inner' ? [aspectLines()] : mode === 'none' ? [] : [crossAspectLines({ ring: mode })]),
    withHouses(horizonAxes({ captions: false, meridian: true })),
    ringAngles(n),
    ...rings,
  );
}
