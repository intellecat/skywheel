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
    withHouses(angleLabels()),
    planetRing({ source: 'outer', radius: 0.765 * R, degreeRadius: 0.7 * R, gap: 8 }),
    planetRing({ tickRadius: sep, gap: 9 }),
  );
}
