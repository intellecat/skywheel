// Planet, point and sign symbols drawn as monoline paths in a 20 × 20 box centred on 0,0, so they
// look the same on every device and in saved images, and their weight is just the stroke width.

export const GLYPHS: Readonly<Record<string, string>> = {
  // Planets and points
  sun: 'M8,0A8,8 0 1 1 -8,0A8,8 0 1 1 8,0Z M1.2,0A1.2,1.2 0 1 1 -1.2,0A1.2,1.2 0 1 1 1.2,0Z',
  moon: 'M-3,-8.6 A9,9 0 1 1 -3,8.6 A9.4,9.4 0 0 0 -3,-8.6Z',
  mercury: 'M4.2,-0.8A4.2,4.2 0 1 1 -4.2,-0.8A4.2,4.2 0 1 1 4.2,-0.8Z M-4.2,-9.2 A4.2,4.2 0 0 0 4.2,-9.2 M0,3.4 V9.8 M-3,6.6 H3',
  venus: 'M5,-3.6A5,5 0 1 1 -5,-3.6A5,5 0 1 1 5,-3.6Z M0,1.4 V10 M-3.6,6.4 H3.6',
  mars: 'M2.6,3A5.4,5.4 0 1 1 -8.2,3A5.4,5.4 0 1 1 2.6,3Z M1,-1 L8.4,-8.4 M3,-8.4 H8.4 V-3',
  jupiter: 'M-6.4,-6.4 C-5.6,-9.6 0.6,-10.4 1,-6.2 C1.3,-3 -2.6,-0.6 -6.6,3.6 H7.6 M3.6,-9.6 V9.6',
  saturn: 'M-3.6,-10 V6.4 M-7,-6.4 H-0.2 M-3.6,-0.4 C-1.2,-4.2 5.8,-4.2 5.6,1 C5.4,4.6 1.6,5.6 2.4,8.4 C2.9,10 5,10.2 6.2,9.2',
  uranus: 'M-6,-9 V1.4 M6,-9 V1.4 M-6,-3.8 H6 M0,-9 V3.8 M2.6,6.6A2.6,2.6 0 1 1 -2.6,6.6A2.6,2.6 0 1 1 2.6,6.6Z',
  neptune: 'M-6.6,-9 V-4.4 A6.6,6.6 0 0 0 6.6,-4.4 V-9 M0,-10 V10 M-3.6,6.2 H3.6 M-8.2,-7.2 L-6.6,-9.4 L-5,-7.2 M5,-7.2 L6.6,-9.4 L8.2,-7.2 M-1.6,-8 L0,-10.2 L1.6,-8',
  pluto: 'M-6.6,-7.4 A6.6,6.6 0 0 0 6.6,-7.4 M2.6,-6.8A2.6,2.6 0 1 1 -2.6,-6.8A2.6,2.6 0 1 1 2.6,-6.8Z M0,-0.8 V10 M-3.6,5.8 H3.6',
  node: 'M-3.2,4.2 C-7.6,0.6 -7.4,-8 0,-8 C7.4,-8 7.6,0.6 3.2,4.2 M-1.2,6.4A2.3,2.3 0 1 1 -5.8,6.4A2.3,2.3 0 1 1 -1.2,6.4Z M5.8,6.4A2.3,2.3 0 1 1 1.2,6.4A2.3,2.3 0 1 1 5.8,6.4Z',
  'south-node': 'M-3.2,-4.2 C-7.6,-0.6 -7.4,8 0,8 C7.4,8 7.6,-0.6 3.2,-4.2 M-1.2,-6.4A2.3,2.3 0 1 1 -5.8,-6.4A2.3,2.3 0 1 1 -1.2,-6.4Z M5.8,-6.4A2.3,2.3 0 1 1 1.2,-6.4A2.3,2.3 0 1 1 5.8,-6.4Z',
  chiron: 'M3.4,6.4A3.4,3.4 0 1 1 -3.4,6.4A3.4,3.4 0 1 1 3.4,6.4Z M0,3 V-10 M0,-4.4 L5.4,-9.6 M0,-4.4 L5.4,0.6',
  rising: 'M0,9.6 V-9.4 M-4.6,-4.8 L0,-9.4 L4.6,-4.8',
  sunrise: 'M-9,4.4 H9 M-5.4,4.4 A5.4,5.4 0 0 1 5.4,4.4 M0,-7.4 V-4.4 M-6.2,-4.2 L-4.4,-2.4 M6.2,-4.2 L4.4,-2.4 M-9.4,0 L-7.2,0.8 M9.4,0 L7.2,0.8',
  // Signs, Aries to Pisces
  aries: 'M0,9.4 V-1.6 C0,-7 -2,-9.6 -5,-9.6 C-7.6,-9.6 -9,-7.6 -9,-5.4 C-9,-3 -7.6,-1.6 -6,-1.6 M0,-1.6 C0,-7 2,-9.6 5,-9.6 C7.6,-9.6 9,-7.6 9,-5.4 C9,-3 7.6,-1.6 6,-1.6',
  taurus: 'M5.6,3.6A5.6,5.6 0 1 1 -5.6,3.6A5.6,5.6 0 1 1 5.6,3.6Z M-8.6,-9.6 C-7.6,-4.2 -3.6,-2 0,-2 C3.6,-2 7.6,-4.2 8.6,-9.6',
  gemini: 'M-7.4,-8.8 Q0,-6.2 7.4,-8.8 M-7.4,8.8 Q0,6.2 7.4,8.8 M-3.2,-7.4 V7.4 M3.2,-7.4 V7.4',
  cancer: 'M-1.6,-3.8 A2.8,2.8 0 1 1 -7.2,-3.8 A2.8,2.8 0 1 1 -1.6,-3.8Z M-4.4,-6.6 C0,-9.2 6.4,-8.2 9,-3.4 M7.2,3.8 A2.8,2.8 0 1 1 1.6,3.8 A2.8,2.8 0 1 1 7.2,3.8Z M4.4,6.6 C0,9.2 -6.4,8.2 -9,3.4',
  leo: 'M-1.2,3.6 A3.4,3.4 0 1 1 -8,3.6 A3.4,3.4 0 1 1 -1.2,3.6Z M-1.6,2.6 C-2.8,-1.2 -3,-4.4 -1,-7.2 C1,-9.8 6,-9.8 6.6,-5.6 C7.2,-1.6 3,1.2 3.6,5.6 C4,8.6 6.6,9.6 8.8,8',
  virgo: 'M-9,-6.2 C-8,-7.4 -6.4,-7.2 -6.4,-5.2 V7.6 M-6.4,-4 C-6.4,-8.4 -1.8,-8.4 -1.8,-4 V7.6 M-1.8,-4 C-1.8,-8.4 2.8,-8.4 2.8,-4 V2.8 C2.8,7.6 7.2,7.4 7.6,3.4 C8,-0.6 3.4,-0.6 1,9.6',
  libra: 'M-9.2,8.2 H9.2 M-9.2,3.2 H-3.6 C-5.6,1.6 -6.6,-0.8 -6.2,-3.4 C-5.4,-7.4 -2.6,-9.2 0,-9.2 C2.6,-9.2 5.4,-7.4 6.2,-3.4 C6.6,-0.8 5.6,1.6 3.6,3.2 H9.2',
  scorpio: 'M-9.2,-6.2 C-8.2,-7.4 -6.6,-7.2 -6.6,-5.2 V7 M-6.6,-4 C-6.6,-8.4 -2,-8.4 -2,-4 V7 M-2,-4 C-2,-8.4 2.6,-8.4 2.6,-4 V4.4 C2.6,6.8 4,8 6.2,8 H9.2 M7,5.8 L9.4,8 L7,10.2',
  sagittarius: 'M-8.6,8.6 L8.6,-8.6 M1.6,-8.6 H8.6 V-1.6 M-6.6,-1.6 L1.6,6.6',
  capricorn: 'M-9.2,-7.2 C-8.2,-8.4 -6.6,-7.8 -6.2,-6.2 L-3,5 L0.4,-6.2 C1.4,-9.4 3.6,-9.2 3.6,-5.2 V2 C3.6,6.4 5,8.8 7.2,8.8 C9.2,8.8 9.8,6.4 9.2,4.6 C8.6,2.6 6,2.2 4.6,3.8 C3.2,5.4 2,8.4 -0.4,9.8',
  aquarius: 'M-9.2,-2.4 L-5.6,-6 L-2,-2.4 L1.6,-6 L5.2,-2.4 L8.8,-6 M-9.2,5.6 L-5.6,2 L-2,5.6 L1.6,2 L5.2,5.6 L8.8,2',
  pisces: 'M-7.2,-9.4 C-2,-5.2 -2,5.2 -7.2,9.4 M7.2,-9.4 C2,-5.2 2,5.2 7.2,9.4 M-4.8,0 H4.8',
};

export const SIGN_IDS = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'] as const;

// Optical sizes: a symbol that fills its box (the Sun's circle, Jupiter) looks bigger than a narrow
// one (Mercury, Venus) at the same size, so each is scaled to look as large as the others.
const OPTICAL: Readonly<Record<string, number>> = { sun: 0.84, moon: 0.92, mercury: 1.04, venus: 1.04, mars: 0.94, jupiter: 0.86, saturn: 0.94, uranus: 0.94, neptune: 0.9, pluto: 0.98, node: 0.9, 'south-node': 0.9, chiron: 0.98, sunrise: 1.25 };

/**
 * A drawn symbol at x, y, `size` px across, in `colour`, with a stroke of `weight` (in the 20-unit
 * box; the same visual weight whatever the symbol's optical scale). Empty for an unknown id.
 */
export function glyphPath(id: string, x: number, y: number, size: number, colour: string, weight = 1.6): string {
  const d = GLYPHS[id];
  if (!d) return '';
  const o = OPTICAL[id] ?? 1;
  const k = (size * o) / 20;
  return `<path d="${d}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${k.toFixed(3)})" fill="none" stroke="${colour}" stroke-width="${(weight / o).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`;
}
