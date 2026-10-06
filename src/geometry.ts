import type { Point } from './types.js';

// Chart geometry. Longitudes run anticlockwise; SVG y points down, so y = −r·sin(θ).
// A rotation of 180 − ASC puts the Ascendant at 9 o'clock, as on a conventional chart.

export const DEG = Math.PI / 180;

export const norm360 = (x: number) => ((x % 360) + 360) % 360;

/** Signed difference a − b wrapped into (−180, 180]. */
export function angleDiff(a: number, b: number): number {
  const d = norm360(a - b);
  return d > 180 ? d - 360 : d;
}

/** Screen position of longitude `lon` at radius `r`, for a chart rotated by `rotation` degrees. */
export function polar(r: number, lon: number, rotation: number): Point {
  const a = (lon + rotation) * DEG;
  return [r * Math.cos(a), -r * Math.sin(a)];
}

/** Rounds coordinates for compact, stable SVG output. */
export const fmt = (n: number) => String(Math.round(n * 100) / 100);

const pt = (p: Point) => `${fmt(p[0])},${fmt(p[1])}`;

/** Annular sector from longitude a anticlockwise to b. */
export function sectorPath(inner: number, outer: number, a: number, b: number, rotation: number): string {
  const large = norm360(b - a) > 180 ? 1 : 0;
  return (
    `M${pt(polar(outer, a, rotation))} A${fmt(outer)},${fmt(outer)} 0 ${large} 0 ${pt(polar(outer, b, rotation))} ` +
    `L${pt(polar(inner, b, rotation))} A${fmt(inner)},${fmt(inner)} 0 ${large} 1 ${pt(polar(inner, a, rotation))} Z`
  );
}

/** Pie slice from longitude a anticlockwise to b. */
export function slicePath(r: number, a: number, b: number, rotation: number): string {
  const large = norm360(b - a) > 180 ? 1 : 0;
  return `M${pt(polar(r, a, rotation))} A${fmt(r)},${fmt(r)} 0 ${large} 0 ${pt(polar(r, b, rotation))} L0,0 Z`;
}
