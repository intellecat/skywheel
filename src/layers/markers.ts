import { h } from '../svg.js';
import type { ChartContext, ResolvedBody } from '../types.js';

export interface MarkerPlacement {
  /** True longitude, where the tick belongs. */
  lon: number;
  /** Longitude the glyph was nudged to, clear of its neighbours. */
  display: number;
  /** Radius where the tick starts (inner edge of the zodiac ring). */
  tickRadius: number;
  /** Radius of the glyph. */
  glyphRadius: number;
}

/** Draws what links a glyph to its exact position on the ring. Swap it in with planetRing({ marker }). */
export type MarkerRenderer = (c: ChartContext, body: ResolvedBody, at: MarkerPlacement) => string;

/** A coloured tick at the exact degree, plus a thin connector to the (possibly nudged) glyph. */
export const lineMarker: MarkerRenderer = (c, body, at) => {
  const len = c.radius * 0.03;
  const [x1, y1] = c.point(at.tickRadius, at.lon);
  const [x2, y2] = c.point(at.tickRadius - len, at.lon);
  const [x3, y3] = c.point(at.glyphRadius + c.radius * 0.05, at.display);
  return (
    h('line', { class: 'aw-tick', x1, y1, x2, y2, style: `--aw-c:${body.color}` }) +
    h('line', { class: 'aw-connector', x1: x2, y1: y2, x2: x3, y2: y3 })
  );
};

/** Just the coloured tick, pointing at the centre. */
export const radialMarker: MarkerRenderer = (c, body, at) => {
  const [x1, y1] = c.point(at.tickRadius, at.lon);
  const [x2, y2] = c.point(at.tickRadius - c.radius * 0.03, at.lon);
  return h('line', { class: 'aw-tick', x1, y1, x2, y2, style: `--aw-c:${body.color}` });
};
