// How bright the sky is for a given Sun altitude, used to tint the above-the-horizon half of the wheel.

type Rgb = [number, number, number];

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** 0 = full night, 1 = full day. */
export const dayFactor = (sunAltitude: number) => smoothstep(-12, 6, sunAltitude);

export function parseColor(hex: string): Rgb {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex.trim());
  if (!m) throw new Error(`skywheel: expected a #rrggbb colour, got "${hex}"`);
  return [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255];
}

export function mixColor(a: Rgb, b: Rgb, t: number): string {
  const c = a.map((v, i) => Math.round((v + (b[i] - v) * t) * 255));
  return `rgb(${c.join(',')})`;
}

export const NIGHT_SKY = '#03050b';
export const DAY_SKY = '#336bc7';
