// Styled charts: one renderer whose every part is a setting, so a whole family of looks — a classic
// table, a monochrome app chart, a night sky with discs — is just a set of values. Presets and colour
// schemes are starting points; any value can be changed. Colours that would not read against what is
// behind them are adjusted (and the adjustments named), and every ring has its own room, so labels do
// not run into each other.

import { angleLabels } from './layers/angles.js';
import { aspectLines } from './layers/aspects.js';
import { createChart, type Chart } from './chart.js';
import { spread } from './collision.js';
import { norm360 } from './geometry.js';
import { glyphPath, SIGN_IDS } from './glyphs.js';
import { esc, h } from './svg.js';
import { BODY_STYLES, SIGNS } from './symbols.js';
import type { ChartContext, ChartOptions, Layer, ResolvedBody, WheelBody, WheelData } from './types.js';

type Element = 'fire' | 'earth' | 'air' | 'water';
export type Colour = string;

/** Every setting of a styled chart. Colours are #rrggbb. */
export interface ChartStyle {
  // Background and lettering
  bg: Colour;
  glow: 'off' | 'on';
  bg2: Colour;
  stars: 'none' | 'few' | 'many';
  ink: Colour;
  accent: Colour;
  font: 'serif' | 'sans' | 'mono';
  bold: boolean;
  /** Line weight, 1 = normal. */
  weight: number;
  elements: Record<Element, Colour>;
  // Zodiac ring
  zFill: 'none' | 'element' | 'solid';
  zColor: Colour;
  zLabel: 'glyph' | 'name' | 'none';
  zLabelColor: 'element' | 'ink' | 'accent' | 'bg';
  /** Ring width as a fraction of the radius. */
  zWidth: number;
  ticks: 'none' | '5' | '1';
  rim: boolean;
  zBorder: number;
  zBorderColor: 'ink' | 'accent' | 'faint';
  /** Stroke of the sign symbols. */
  zWeight: number;
  halo: 'none' | 'fill';
  haloColor: Colour;
  // Houses and angles
  hLines: 'none' | 'band' | 'out';
  hNumbers: 'none' | 'arabic' | 'roman';
  hNumberPlace: 'ring' | 'centre';
  hColor: 'ink' | 'accent' | 'faint';
  hDegrees: 'none' | 'angles' | 'all';
  angles: 'none' | 'labels' | 'axes' | 'lines' | 'horizon';
  angleWeight: number;
  axisSpan: 'through' | 'outer';
  // Planets
  symbols: 'drawn' | 'font';
  /** Stroke of the drawn planet symbols. */
  sWeight: number;
  pColor: 'own' | 'ink' | 'accent' | 'custom';
  pCustom: Colour;
  pBack: 'none' | 'outline' | 'fill' | 'gradient';
  pBackColor: Colour;
  pSize: number;
  pPlace: 'band' | 'rim';
  pMarker: 'none' | 'connector' | 'rim' | 'tick';
  degrees: 'none' | 'deg' | 'min' | 'full';
  pLabelLayout: 'below' | 'stack' | 'beside' | 'along';
  // Aspects
  aSet: 'none' | 'major' | 'all';
  aColor: 'type' | 'two' | 'one';
  aHard: Colour;
  aSoft: Colour;
  aOne: Colour;
  aDash: 'solid' | 'dashes';
  aWeight: number;
  aFade: boolean;
  aByOrb: boolean;
  // Centre and band
  centre: 'none' | 'fill';
  centreColor: Colour;
  band: 'none' | 'fill';
  bandColor: Colour;
  // Points
  node: boolean;
  southNode: boolean;
  chiron: boolean;
  ascPoint: boolean;
  anglePoints: boolean;
}

// ─── Colour schemes: every colour at once ───────────────────────────────────────────────

export type SchemeColours = Pick<ChartStyle, 'bg' | 'glow' | 'ink' | 'accent' | 'elements' | 'zColor' | 'centreColor' | 'bandColor' | 'pBackColor' | 'aHard' | 'aSoft' | 'aOne'> & Partial<Pick<ChartStyle, 'bg2' | 'haloColor'>>;
export interface ColourScheme {
  id: string;
  colours: SchemeColours;
}

const scheme = (id: string, colours: SchemeColours): ColourScheme => ({ id, colours });
export const COLOUR_SCHEMES: readonly ColourScheme[] = [
  scheme('parchment', { bg: '#f4efe4', glow: 'off', ink: '#1e1a14', accent: '#b0341f', elements: { fire: '#b0341f', earth: '#5f7d3a', air: '#a07212', water: '#27438f' }, zColor: '#1e1a14', centreColor: '#ece5d6', bandColor: '#faf6ee', pBackColor: '#e6d8bd', aHard: '#b0341f', aSoft: '#27438f', aOne: '#8a8172' }),
  scheme('paper', { bg: '#ffffff', glow: 'off', ink: '#000000', accent: '#000000', elements: { fire: '#d7261e', earth: '#2e8b3a', air: '#c99a06', water: '#1f4fc4' }, zColor: '#111111', centreColor: '#f4f4f4', bandColor: '#ffffff', pBackColor: '#ececec', aHard: '#d0312d', aSoft: '#1f5fbf', aOne: '#8a8a8a' }),
  scheme('fog', { bg: '#f3f3f2', glow: 'off', ink: '#111111', accent: '#111111', elements: { fire: '#555555', earth: '#555555', air: '#555555', water: '#555555' }, zColor: '#111111', centreColor: '#f4f4f4', bandColor: '#ffffff', pBackColor: '#e4e4e2', aHard: '#555555', aSoft: '#999999', aOne: '#8a8a8a' }),
  scheme('sage', { bg: '#eef1e8', glow: 'off', ink: '#22301f', accent: '#5f7d3a', elements: { fire: '#b5552f', earth: '#4f7a34', air: '#a8842a', water: '#3a6a8a' }, zColor: '#22301f', centreColor: '#e3e8da', bandColor: '#f6f8f2', pBackColor: '#d5dfc6', aHard: '#b5552f', aSoft: '#3a6a8a', aOne: '#7d8a72' }),
  scheme('rose', { bg: '#f7ece8', glow: 'off', ink: '#4a2430', accent: '#c0456a', elements: { fire: '#c0456a', earth: '#6f8a52', air: '#c08a3a', water: '#5a6fae' }, zColor: '#4a2430', centreColor: '#f1e0da', bandColor: '#fbf4f1', pBackColor: '#ecc9cf', aHard: '#c0456a', aSoft: '#5a6fae', aOne: '#a08088' }),
  scheme('lilac', { bg: '#ffffff', glow: 'off', ink: '#1a1a1a', accent: '#8e2c8a', elements: { fire: '#e3007d', earth: '#6aa31f', air: '#f39200', water: '#1b9ad6' }, zColor: '#8e2c8a', centreColor: '#f2e9f2', bandColor: '#ffffff', haloColor: '#f2e9f2', pBackColor: '#f2e9f2', aHard: '#ff4f73', aSoft: '#35a7de', aOne: '#9a8a9a' }),
  scheme('chalk', { bg: '#f3f3f3', glow: 'off', ink: '#1b1b1b', accent: '#1b1b1b', elements: { fire: '#555555', earth: '#555555', air: '#555555', water: '#555555' }, zColor: '#ffffff', centreColor: '#ffffff', bandColor: '#ffffff', haloColor: '#ffffff', pBackColor: '#ffffff', aHard: '#8a8a8a', aSoft: '#8a8a8a', aOne: '#9a9a9a' }),
  scheme('ink', { bg: '#0c0c0c', glow: 'off', ink: '#f1efe8', accent: '#f1efe8', elements: { fire: '#ff8a6b', earth: '#a8c98a', air: '#f0d27a', water: '#8ab4f0' }, zColor: '#f1efe8', centreColor: '#161616', bandColor: '#0c0c0c', pBackColor: '#2c2c2c', aHard: '#ff7a66', aSoft: '#8ab4f0', aOne: '#a8a6a0' }),
  scheme('night', { bg: '#1d3a48', glow: 'on', bg2: '#2f4b84', ink: '#b9a46e', accent: '#b9a46e', elements: { fire: '#e8795a', earth: '#9dbb72', air: '#e2c96f', water: '#6aa6e0' }, zColor: '#1b2a36', centreColor: '#0f1820', bandColor: '#16252f', pBackColor: '#e9c3a0', aHard: '#c0595a', aSoft: '#2a9f93', aOne: '#7c8a96' }),
  scheme('midnight', { bg: '#0b1020', glow: 'on', bg2: '#1c2b55', ink: '#dfe5f2', accent: '#e8c26a', elements: { fire: '#e8795a', earth: '#9dbb72', air: '#e2c96f', water: '#6aa6e0' }, zColor: '#151c33', centreColor: '#0e1428', bandColor: '#0b1020', pBackColor: '#e8c26a', aHard: '#ff5f7e', aSoft: '#6aa6e0', aOne: '#8792ab' }),
];

/** A scheme's colours, to spread over a style: `{ ...style, ...schemeColours('night') }`. */
export function schemeColours(id: string): SchemeColours {
  const s = COLOUR_SCHEMES.find((x) => x.id === id);
  if (!s) throw new Error(`skywheel: no colour scheme "${id}"`);
  return structuredClone(s.colours);
}

// ─── Presets: a scheme and a set of values ──────────────────────────────────────────────

export const DEFAULT_STYLE: Readonly<ChartStyle> = {
  ...schemeColours('parchment'), bg2: '#2f4b84', haloColor: '#ebe3d2', stars: 'none', font: 'serif', bold: false, weight: 1,
  zFill: 'element', zLabel: 'glyph', zLabelColor: 'element', zWidth: 0.13, ticks: '1', rim: false, zBorder: 1, zBorderColor: 'ink', zWeight: 1.6, halo: 'none',
  hLines: 'band', hNumbers: 'arabic', hNumberPlace: 'ring', hColor: 'ink', hDegrees: 'none', angles: 'axes', angleWeight: 1.5, axisSpan: 'through',
  symbols: 'drawn', sWeight: 1.6, pColor: 'own', pCustom: '#26323d', pBack: 'none', pSize: 1, pPlace: 'band', pMarker: 'connector', degrees: 'deg', pLabelLayout: 'below',
  aSet: 'major', aColor: 'type', aDash: 'solid', aWeight: 1, aFade: true, aByOrb: false,
  centre: 'none', band: 'none', node: true, southNode: false, chiron: false, ascPoint: false, anglePoints: false,
};

const D = DEFAULT_STYLE;
export interface StylePreset {
  id: string;
  /** The scheme it starts from. */
  scheme: string;
  style: ChartStyle;
}
const preset = (id: string, schemeId: string, over: Partial<ChartStyle>): StylePreset => ({ id, scheme: schemeId, style: { ...D, ...schemeColours(schemeId), ...over } });

/** Ready-made styles. Several follow well-known looks: a classic table, an app's monochrome chart, a night sky. */
export const STYLE_PRESETS: readonly StylePreset[] = [
  preset('astrologer', 'parchment', {}),
  preset('table', 'paper', { accent: '#000000', elements: { fire: '#e8231f', earth: '#3aa835', air: '#f08c00', water: '#2148e0' }, font: 'sans',
    zFill: 'solid', zColor: '#fdfbe2', zWidth: 0.13, ticks: 'none', zWeight: 1.4, halo: 'fill', haloColor: '#d8f4fb', band: 'fill', bandColor: '#e8f7fc', centre: 'fill', centreColor: '#fdfde9',
    hNumberPlace: 'centre', angleWeight: 3, pColor: 'ink', degrees: 'min', pLabelLayout: 'beside', aSet: 'all', aColor: 'two', aHard: '#e8231f', aSoft: '#2148e0', aFade: false }),
  preset('mono', 'fog', { font: 'mono', weight: 0.8, zFill: 'solid', zLabel: 'name', zLabelColor: 'bg', zWidth: 0.12, ticks: 'none', hNumbers: 'none', angles: 'none',
    sWeight: 1.1, pColor: 'ink', pSize: 1.35, pMarker: 'tick', degrees: 'none', aSet: 'all', aColor: 'one', aDash: 'dashes', aFade: false, centre: 'fill', band: 'fill', southNode: true, ascPoint: true }),
  preset('night', 'night', { stars: 'many', font: 'sans', weight: 1.1, zFill: 'solid', zLabelColor: 'accent', ticks: 'none', hLines: 'out', hNumbers: 'roman', angles: 'none',
    sWeight: 1.9, pColor: 'custom', pCustom: '#26323d', pBack: 'gradient', pSize: 1.8, pPlace: 'rim', pMarker: 'none', degrees: 'none', aColor: 'two', aWeight: 2.2, aFade: false, centre: 'fill', node: false, chiron: true }),
  preset('lilac', 'lilac', { font: 'sans', bold: true, zFill: 'none', zWidth: 0.12, ticks: 'none', zBorder: 3.2, zBorderColor: 'accent', zWeight: 2.5, halo: 'fill', hColor: 'accent', hDegrees: 'all', hNumberPlace: 'centre',
    angles: 'lines', angleWeight: 1, pColor: 'ink', pMarker: 'none', degrees: 'full', pLabelLayout: 'beside', sWeight: 1.7, pSize: 1.1, aColor: 'two', aWeight: 0.9, aFade: false, centre: 'fill', node: false }),
  preset('print', 'paper', { elements: { fire: '#e8212b', earth: '#4fa12b', air: '#f29d1d', water: '#1f3fd1' }, font: 'sans', zFill: 'none', zWidth: 0.15, zWeight: 2, hDegrees: 'angles', angles: 'lines', angleWeight: 2.4, axisSpan: 'outer',
    pColor: 'ink', sWeight: 1.9, pSize: 1.25, pMarker: 'tick', degrees: 'full', pLabelLayout: 'stack', aColor: 'two', aHard: '#e8212b', aSoft: '#1f3fd1', aByOrb: true, aFade: false, chiron: true }),
  preset('chalk', 'chalk', { font: 'mono', zFill: 'solid', zLabel: 'name', zLabelColor: 'ink', zWidth: 0.14, ticks: 'none', zBorderColor: 'faint', hNumberPlace: 'centre', hColor: 'faint', angles: 'horizon',
    pColor: 'ink', sWeight: 1.1, pSize: 0.95, pMarker: 'rim', aSet: 'none', centre: 'fill', band: 'fill', southNode: true, chiron: true, anglePoints: true }),
  preset('ink', 'ink', { weight: 0.6, zFill: 'none', zLabelColor: 'ink', zWidth: 0.11, ticks: 'none', sWeight: 1.1, pColor: 'ink', pMarker: 'tick', degrees: 'none', aColor: 'one', aWeight: 0.6, node: false }),
];

// ─── Colour arithmetic, for the legibility guards ─────────────────────────────────────

const rgb = (c: Colour) => { const n = parseInt(c.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const hex = (a: number[]) => '#' + a.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
const rgba = (c: Colour, a: number) => { const [r, g, b] = rgb(c); return `rgb(${r} ${g} ${b} / ${a})`; };
const lum = (c: Colour) => { const [r, g, b] = rgb(c).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
/** WCAG contrast ratio between two colours. */
export const contrast = (a: Colour, b: Colour) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const mix = (a: Colour, b: Colour, t: number) => hex(rgb(a).map((v, i) => v + (rgb(b)[i] - v) * t));
const isDark = (c: Colour) => lum(c) < 0.2;
/** The colour itself if it reads on `ground`, else moved toward black or white until it does. */
function readable(colour: Colour, ground: Colour, min = 2.6): Colour {
  if (contrast(colour, ground) >= min) return colour;
  const to = isDark(ground) ? '#ffffff' : '#000000';
  for (let t = 0.1; t <= 1; t += 0.1) { const c = mix(colour, to, t); if (contrast(c, ground) >= min) return c; }
  return to;
}

const ELEMENT_OF: Element[] = ['fire', 'earth', 'air', 'water'];
/** Planets' own colours: one set for light grounds, one for dark. */
const OWN: Record<'light' | 'dark', Record<string, Colour>> = {
  light: { sun: '#b07a00', moon: '#5f6a80', mercury: '#2a7f69', venus: '#b8407a', mars: '#c8361f', jupiter: '#a85d0e', saturn: '#76632b', uranus: '#14808f', neptune: '#3a4fbf', pluto: '#74479e', node: '#56617a', 'south-node': '#56617a', chiron: '#467f30' },
  dark: { sun: '#ffcf5a', moon: '#dfe6f0', mercury: '#9ad8c6', venus: '#f7bfd6', mars: '#ff7a66', jupiter: '#f2b36d', saturn: '#d8c592', uranus: '#86dcec', neptune: '#8ea2ff', pluto: '#c3a3d9', node: '#b9c3d9', 'south-node': '#b9c3d9', chiron: '#a5d68f' },
};

/** What the legibility guards adjusted. */
export type Adjustment = 'lines' | 'sign-colours' | 'sign-labels' | 'planet-symbols' | 'aspect-lines';

interface Drawn extends ChartStyle {
  own: Record<string, Colour>;
  zLabelFix?: Colour;
  pColorFix?: Colour;
}

/** The style as drawn: colours that would not read are adjusted, and the adjustments listed. */
export function legible(style: ChartStyle): { style: Drawn; adjusted: Adjustment[] } {
  const s = style;
  const out: Drawn = { ...structuredClone(s), own: {} };
  const adjusted = new Set<Adjustment>();
  const ink = readable(s.ink, s.bg, 3);
  if (ink !== s.ink) { out.ink = ink; adjusted.add('lines'); }
  const ringGround = s.zFill === 'solid' ? s.zColor : s.bg;
  if (s.zLabel !== 'none') {
    if (s.zLabelColor === 'element') {
      for (const e of ELEMENT_OF) { const c = readable(out.elements[e], ringGround); if (c !== out.elements[e]) { out.elements[e] = c; adjusted.add('sign-colours'); } }
    } else {
      const c = readable(out[({ ink: 'ink', accent: 'accent', bg: 'bg' } as const)[s.zLabelColor]], ringGround);
      if (c !== out[({ ink: 'ink', accent: 'accent', bg: 'bg' } as const)[s.zLabelColor]]) { out.zLabelFix = c; adjusted.add('sign-labels'); }
    }
  }
  const planetGround = s.pBack === 'fill' || s.pBack === 'gradient' ? s.pBackColor : s.band === 'fill' ? s.bandColor : s.bg;
  out.own = Object.fromEntries(Object.entries(OWN[isDark(planetGround) ? 'dark' : 'light']).map(([k, v]) => [k, readable(v, planetGround, 2.4)]));
  if (s.pColor !== 'own') {
    const key = ({ ink: 'ink', accent: 'accent', custom: 'pCustom' } as const)[s.pColor];
    const c = readable(out[key], planetGround, 2.6);
    if (c !== out[key]) { out.pColorFix = c; adjusted.add('planet-symbols'); }
  }
  if (s.aColor === 'one') {
    const c = readable(s.aOne, s.centre === 'fill' ? s.centreColor : s.bg, 1.6);
    if (c !== s.aOne) { out.aOne = c; adjusted.add('aspect-lines'); }
  }
  return { style: out, adjusted: [...adjusted] };
}

// ─── Geometry: every ring has its own room, so labels cannot run into each other ──────

interface Geometry {
  R: number;
  zIn: number;
  gs: number;
  back: number;
  gR: number;
  degR: number;
  step: number;
  bandIn: number;
  numbersIn: boolean;
  hub: number;
  centre: number;
}

function geometry(s: ChartStyle, R: number): Geometry {
  const zIn = R * (1 - s.zWidth);
  const gs = R * 0.066 * s.pSize;
  const back = s.pBack === 'none' ? 0 : gs * 0.66;
  const half = back || gs * 0.5;
  const gR = s.pPlace === 'rim' ? zIn : zIn - half - R * (s.pMarker === 'connector' ? 0.06 : s.pMarker === 'rim' ? 0.045 : 0.025);
  const degR = gR - half - R * 0.04;
  const rows = s.degrees === 'none' ? 0 : s.pLabelLayout === 'stack' ? (s.degrees === 'full' ? 3 : s.degrees === 'min' ? 2 : 1) : 1;
  const step = R * 0.058;
  const labelIn = s.pLabelLayout === 'beside' ? gR - half - R * 0.17 : s.pLabelLayout === 'along' ? gR - half - R * 0.03 : degR - (rows - 1) * step - R * 0.03;
  const bandIn = (s.degrees === 'none' ? gR - half : labelIn) - R * 0.015;
  const numbersIn = s.hNumbers !== 'none' && s.hLines !== 'out' && s.hNumberPlace !== 'centre';
  const hub = s.hNumbers !== 'none' && s.hLines !== 'out' && s.hNumberPlace === 'centre' ? R * 0.085 : 0;
  const centre = Math.max(R * 0.3, numbersIn ? bandIn - R * 0.075 : bandIn);
  return { R, zIn, gs, back, gR, degR, step, bandIn, numbersIn, hub, centre };
}

// ─── Options ────────────────────────────────────────────────────────────────────────────

export interface StyledOptions extends Omit<ChartOptions, 'radius' | 'layout' | 'className'> {
  /** Font stacks for the three lettering choices. */
  fonts?: Partial<Record<ChartStyle['font'], string>>;
  /** Words drawn on the chart, for other languages. */
  labels?: {
    /** ASC, DSC, MC, IC beside the wheel. */
    angles?: Partial<Record<'asc' | 'dsc' | 'mc' | 'ic', string>>;
    /** The angles as points among the planets. */
    points?: Partial<Record<'dc' | 'mc' | 'ic', string>>;
    /** The 1st and 7th house numbers when Roman numerals run outside the ring. */
    roman?: { first?: string; seventh?: string };
    /** Names of the extra points, for their tooltips. */
    names?: Partial<Record<'south-node' | 'rising' | 'sunrise' | 'dc' | 'mc' | 'ic', string>>;
  };
}

const DEFAULT_FONTS: Record<ChartStyle['font'], string> = { serif: "Georgia, 'Times New Roman', serif", sans: 'system-ui, sans-serif', mono: 'ui-monospace, Menlo, monospace' };
const SYMBOL_FONT = "'Noto Sans Symbols', 'Noto Sans Symbols 2', 'Apple Symbols', 'Segoe UI Symbol', sans-serif";
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const MAJOR = ['sextile', 'square', 'trine', 'opposition'];
const MINOR = ['semisextile', 'semisquare', 'sesquiquadrate', 'quincunx', 'quintile'];
const upright = (c: ChartContext, lon: number) => { const x = norm360(lon + c.rotation); return x > 0 && x < 180 ? 90 - x : 270 - x; };

// ─── The parts ──────────────────────────────────────────────────────────────────────────

interface Ctx {
  s: Drawn;
  g: Geometry;
  font: string;
  o: StyledOptions;
}

function symbol(x: Ctx, id: string, cx: number, cy: number, size: number, colour: Colour, weight = x.s.sWeight): string {
  const points = { dc: 'DC', mc: 'MC', ic: 'IC', ...x.o.labels?.points } as Record<string, string>;
  if (id in points && ['dc', 'mc', 'ic'].includes(id))
    return h('text', { x: cx, y: cy, fill: colour, 'font-size': (size * 0.62).toFixed(1), 'font-weight': 300, 'letter-spacing': '-0.02em', 'font-family': x.font, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, esc(points[id]));
  const drawn = x.s.symbols === 'drawn' ? glyphPath(id, cx, cy, size, colour, weight) : '';
  if (drawn) return drawn;
  const fallback = BODY_STYLES[id]?.glyph ?? SIGNS[(SIGN_IDS as readonly string[]).indexOf(id)]?.glyph ?? { 'south-node': '☋', rising: '↑', sunrise: '↑' }[id] ?? id.slice(0, 2);
  return h('text', { x: cx, y: cy, fill: colour, 'font-size': (size * 0.95).toFixed(1), 'font-family': SYMBOL_FONT, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, esc(fallback));
}

const background = ({ s }: Ctx): Layer => ({
  name: 'background',
  render: (c) => {
    const half = c.size / 2;
    let out = '';
    if (s.glow === 'on') {
      const id = `${c.uid}-bg`;
      out += h('defs', {}, h('radialGradient', { id, cx: 0.4, cy: 0.18, r: 0.95 }, h('stop', { offset: 0, 'stop-color': s.bg2 }), h('stop', { offset: 0.5, 'stop-color': s.bg }), h('stop', { offset: 1, 'stop-color': s.bg })));
      out += h('rect', { x: -half, y: -half, width: c.size, height: c.size, fill: `url(#${id})` });
    } else out += h('rect', { x: -half, y: -half, width: c.size, height: c.size, fill: s.bg });
    if (s.stars !== 'none') {
      let seed = 11;
      const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      const dot = isDark(s.bg) ? '#ffffff' : s.ink;
      for (let i = 0; i < (s.stars === 'many' ? 60 : 22); i++) out += h('circle', { cx: (rnd() - 0.5) * c.size, cy: (rnd() - 0.5) * c.size, r: 0.6 + rnd() * 1.3, fill: dot, opacity: 0.2 + rnd() * 0.45 });
      if (s.stars === 'many') {
        const id = `${c.uid}-bloom`;
        out += h('defs', {}, h('filter', { id, x: -2, y: -2, width: 5, height: 5 }, h('feGaussianBlur', { stdDeviation: 3 })));
        for (let i = 0; i < 5; i++) out += h('circle', { cx: (rnd() - 0.5) * c.size, cy: (rnd() - 0.5) * c.size, r: 4.5, fill: i % 2 ? '#3ff2d0' : '#c99bff', filter: `url(#${id})` });
      }
    }
    return out;
  },
});

const fills = ({ s, g }: Ctx): Layer => ({
  name: 'fills',
  render: () =>
    (s.halo === 'fill' ? h('circle', { r: g.R * 1.2, fill: s.haloColor }) + h('circle', { r: g.R, fill: s.bg }) : '') +
    (s.band === 'fill' ? h('circle', { r: g.zIn, fill: s.bandColor }) : '') +
    (s.centre === 'fill' ? h('circle', { r: g.numbersIn ? g.bandIn : g.centre, fill: s.centreColor }) : '') +
    h('circle', { r: g.centre, fill: 'none', stroke: rgba(s.ink, s.hColor === 'faint' ? 0.22 : 0.3), 'stroke-width': s.weight }) +
    (g.numbersIn ? h('circle', { r: g.bandIn, fill: 'none', stroke: rgba(s.ink, 0.22), 'stroke-width': s.weight }) : ''),
});

const zodiac = (x: Ctx): Layer => ({
  name: 'zodiac',
  render: (c) => {
    const { s, g } = x;
    const { R, zIn } = g;
    const start = c.data.ayanamsa ?? 0;
    const w = s.weight;
    const ring = R - zIn;
    const darkFill = s.zFill === 'solid' && contrast(s.zColor, s.bg) > 3;
    let out = '';
    SIGNS.forEach((sg, k) => {
      const a = start + k * 30;
      const el = s.elements[ELEMENT_OF[k % 4]];
      const fill = s.zFill === 'element' ? rgba(el, 0.14) : s.zFill === 'solid' ? s.zColor : 'none';
      out += h('path', { d: c.sector(zIn, R, a, a + 30), fill });
      const [x1, y1] = c.point(zIn, a), [x2, y2] = c.point(R, a);
      out += h('line', { x1, y1, x2, y2, stroke: darkFill ? rgba(s.bg, 0.9) : rgba(s.ink, 0.35), 'stroke-width': w });
      if (s.zLabel === 'none') return;
      const col = s.zLabelFix ?? { element: el, ink: s.ink, accent: s.accent, bg: s.bg }[s.zLabelColor];
      const name = c.words.signs?.[k] ?? sg.name;
      const [cx, cy] = c.point((zIn + R) / 2, a + 15);
      if (s.zLabel === 'glyph') out += h('g', {}, h('title', {}, esc(name)), symbol(x, SIGN_IDS[k], cx, cy, ring * 0.42, col, s.zWeight));
      else out += h('text', { x: cx, y: cy, fill: col, 'font-size': Math.min(ring * 0.36, 15).toFixed(1), 'font-family': x.font, 'font-weight': s.bold ? 600 : 400, 'letter-spacing': '0.14em', 'text-anchor': 'middle', 'dominant-baseline': 'central', transform: `rotate(${upright(c, a + 15).toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)})` }, esc(name.toUpperCase()));
    });
    if (s.ticks !== 'none') {
      let d = '';
      for (let deg = 0; deg < 360; deg += s.ticks === '5' ? 5 : 1) {
        const len = (deg % 10 === 0 ? 0.035 : deg % 5 === 0 ? 0.025 : 0.013) * R;
        const [x0, y0] = c.point(zIn, start + deg), [x1, y1] = c.point(zIn + len, start + deg);
        d += `M${x0.toFixed(1)},${y0.toFixed(1)}L${x1.toFixed(1)},${y1.toFixed(1)}`;
      }
      out += h('path', { d, stroke: darkFill ? rgba(s.bg, 0.6) : rgba(s.ink, 0.45), 'stroke-width': w * 0.7 });
    }
    const rimColour = s.zBorderColor === 'accent' ? s.accent : rgba(s.ink, s.zBorderColor === 'faint' ? 0.22 : 0.75);
    const circle = (r: number, k = 1) => h('circle', { r, fill: 'none', stroke: rimColour, 'stroke-width': w * k });
    out += circle(R, s.zBorder) + circle(zIn, s.zBorder) + (s.rim ? circle(R + 4) + circle(zIn - 4) : '');
    return out;
  },
});

const houses = (x: Ctx): Layer => ({
  name: 'houses',
  render: (c) => {
    const { s, g } = x;
    const cusps = c.data.cusps;
    if (!cusps || cusps.length !== 12) return '';
    const { R, zIn, centre, bandIn, numbersIn, hub } = g;
    const out = s.hLines === 'out';
    const tone = s.hColor === 'accent' ? s.accent : s.ink;
    const lineAlpha = s.hColor === 'accent' ? 0.7 : s.hColor === 'faint' ? 0.22 : hub ? 0.75 : 0.3;
    const text = (cx: number, cy: number, body: string, size: number, fill: string, extra: Record<string, string | number> = {}) =>
      h('text', { x: cx, y: cy, fill, 'font-size': size, 'font-family': x.font, 'text-anchor': 'middle', 'dominant-baseline': 'central', ...extra }, esc(body));
    let svg = '';
    cusps.forEach((cusp, i) => {
      if (s.hLines !== 'none') {
        const [x1, y1] = c.point(hub || centre, cusp), [x2, y2] = c.point(zIn, cusp);
        svg += h('line', { x1, y1, x2, y2, stroke: rgba(tone, lineAlpha), 'stroke-width': s.weight * 0.8 });
      }
      // The cusp's degree outside the ring, minutes under it.
      if (s.hDegrees === 'all' || (s.hDegrees === 'angles' && i % 3 === 0)) {
        const z = norm360(cusp) % 30, d = Math.floor(z), m = Math.floor((z - d) * 60);
        const r = R * (out ? 1.4 : 1.075);
        const [cx, cy] = c.point(r, cusp), [mx, my] = c.point(r + 13, cusp);
        svg += text(cx, cy, `${d}°`, 12, rgba(s.ink, 0.7), { 'font-weight': s.bold ? 600 : 400 }) + text(mx, my, `${String(m).padStart(2, '0')}′`, 8.5, rgba(s.ink, 0.5));
      }
      if (out) {
        const [x1, y1] = c.point(R, cusp), [x2, y2] = c.point(R * 1.25, cusp);
        svg += h('line', { x1, y1, x2, y2, stroke: rgba(s.ink, 0.6), 'stroke-width': s.weight * 0.8 });
      }
      if (s.hNumbers === 'none') return;
      const label = s.hNumbers === 'roman' ? ROMAN[i] : String(i + 1);
      const mid = cusp + norm360(cusps[(i + 1) % 12] - cusp) / 2;
      if (out) {
        const [cx, cy] = c.point(R * 1.31, cusp + 2.4);
        const name = s.hNumbers === 'roman' && i === 0 ? (x.o.labels?.roman?.first ?? 'Asc') : s.hNumbers === 'roman' && i === 6 ? (x.o.labels?.roman?.seventh ?? 'Dsc') : label;
        svg += text(cx, cy, name, 13, rgba(s.ink, 0.85), { transform: `rotate(${upright(c, cusp).toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)})` });
      } else if (hub) {
        const [cx, cy] = c.point(hub * 1.75, mid);
        svg += text(cx, cy, label, 12, rgba(tone, 0.85), { 'font-weight': s.bold ? 700 : 400 });
      } else if (numbersIn) {
        // In their own ring between the centre and the planets.
        const [cx, cy] = c.point((centre + bandIn) / 2, mid);
        svg += text(cx, cy, label, Number(Math.min(11, (bandIn - centre) * 0.55).toFixed(1)), rgba(tone, s.hColor === 'accent' ? 0.9 : 0.55), { 'font-weight': s.bold ? 700 : 400 });
      }
    });
    if (hub) svg += h('circle', { r: hub, fill: s.centre === 'fill' ? s.centreColor : s.bg, stroke: rgba(s.ink, s.hColor === 'faint' ? 0.22 : 0.8), 'stroke-width': s.weight });
    return svg;
  },
});

const axes = ({ s, g }: Ctx): Layer => ({
  name: 'axes',
  render: (c) => {
    const { asc, mc } = c.data;
    if (asc === undefined) return '';
    const end = g.R * 1.02;
    if (s.angles === 'horizon') {
      const [x1, y1] = c.point(g.bandIn, asc), [x2, y2] = c.point(g.bandIn, asc + 180);
      return h('line', { x1, y1, x2, y2, stroke: s.ink, 'stroke-width': s.weight, 'stroke-dasharray': '6 4' });
    }
    const line = (cls: string, a: number) => {
      if (s.axisSpan === 'through') {
        const [x1, y1] = c.point(end, a), [x2, y2] = c.point(end, a + 180);
        return h('line', { class: cls, x1, y1, x2, y2 });
      }
      // From the house ring out through the zodiac, on each of the four angles.
      return [a, a + 180].map((l) => { const [x1, y1] = c.point(g.bandIn, l), [x2, y2] = c.point(end, l); return h('line', { class: cls, x1, y1, x2, y2 }); }).join('');
    };
    return (mc !== undefined ? line('aw-meridian', mc) : '') + line('aw-horizon', asc);
  },
});

/** Where a planet is: its degree, and its sign and minutes if asked, under it, stacked inward, beside it or along the ring. */
function position(x: Ctx, c: ChartContext, b: ResolvedBody, display: number, gx: number, gy: number, half: number): string {
  const { s, g } = x;
  const z = norm360(b.lon) % 30, d = Math.floor(z), m = String(Math.floor((z - d) * 60)).padStart(2, '0');
  const sign = Math.floor(norm360(b.lon) / 30);
  const signColour = s.elements[ELEMENT_OF[sign % 4]];
  const weight = s.bold ? 600 : 400;
  const t = (tx: number, ty: number, body: string, size: number, fill: string, anchor = 'middle') =>
    h('text', { x: tx, y: ty, fill, 'font-size': size, 'font-weight': weight, 'font-family': x.font, 'text-anchor': anchor, 'dominant-baseline': 'central' }, body);
  const px = s.pLabelLayout === 'beside' ? 12.5 : 11;
  const deg = `${d}°`;
  const ink = rgba(s.ink, 0.85);
  // ℞ right after the numbers, small.
  const r = b.retrograde ? h('tspan', { 'font-size': (px * 0.75).toFixed(1), dx: 1.5, fill: s.accent }, '℞') : '';
  if (s.pLabelLayout === 'stack') {
    const [x1, y1] = c.point(g.degR, display);
    let out = t(x1, y1, deg + r, 12, ink);
    if (s.degrees === 'full') { const [x2, y2] = c.point(g.degR - g.step, display); out += symbol(x, SIGN_IDS[sign], x2, y2, 12, signColour, s.zWeight); }
    if (s.degrees !== 'deg') { const [x3, y3] = c.point(g.degR - g.step * (s.degrees === 'full' ? 2 : 1), display); out += t(x3, y3, `${m}′`, 11, rgba(s.ink, 0.75)); }
    return out;
  }
  if (s.pLabelLayout === 'along') {
    // Next to the symbol, at the same distance from the centre.
    const text = deg + (s.degrees === 'min' || s.degrees === 'full' ? `${m}′` : '');
    const w = (text.length + (b.retrograde ? 1 : 0)) * px * 0.6;
    const off = ((half + 4 + w / 2) / g.gR) * (180 / Math.PI);
    const [lx, ly] = c.point(g.gR, display - off);
    return t(lx, ly, text + r, px, ink);
  }
  // Beside the symbol only at the sides of the wheel; above and below, the label goes under it.
  if (s.pLabelLayout === 'beside' && Math.abs(gx) > Math.abs(gy) * 0.9) {
    const dir = gx < 0 ? 1 : -1;
    const wDeg = deg.length * px * 0.6, wSign = s.degrees === 'full' ? 13 : 0, wMin = s.degrees === 'deg' ? 0 : 15, wRet = b.retrograde ? 7 : 0;
    const width = wDeg + wSign + wMin + wRet;
    let lx = dir > 0 ? gx + half + 5 : gx - half - 5 - width;
    let out = t(lx, gy, deg, px, ink, 'start');
    lx += wDeg;
    if (wSign) { out += symbol(x, SIGN_IDS[sign], lx + 6, gy + 1, 10, signColour, s.zWeight); lx += wSign; }
    if (wMin) { out += t(lx + 1, gy - 4, m, 8.5, rgba(s.ink, 0.6), 'start'); lx += wMin; }
    if (wRet) out += t(lx, gy + 3, '℞', 8, s.accent, 'start');
    return out;
  }
  const [dx, dy] = c.point(g.degR, display);
  if (s.degrees !== 'full') return t(dx, dy, deg + (s.degrees === 'min' ? `${m}′` : '') + r, px, ink);
  return t(dx - 9, dy, deg, px, ink, 'end') + symbol(x, SIGN_IDS[sign], dx, dy, 9, signColour, s.zWeight) + t(dx + 9, dy, `${m}′` + r, 9.5, rgba(s.ink, 0.65), 'start');
}

const planets = (x: Ctx): Layer => ({
  name: 'planets',
  render: (c) => {
    const { s, g } = x;
    const { R, zIn, gs, back, gR, degR, bandIn } = g;
    const bodies = c.bodies;
    const gid = `${c.uid}-back`;
    const defs = s.pBack === 'gradient'
      ? h('defs', {}, h('radialGradient', { id: gid, cx: 0.35, cy: 0.3, r: 0.8 }, h('stop', { offset: 0, 'stop-color': '#ffffff', 'stop-opacity': 0.85 }), h('stop', { offset: 0.35, 'stop-color': s.pBackColor }), h('stop', { offset: 1, 'stop-color': s.pBackColor, 'stop-opacity': 0.92 })))
      : '';
    // Symbols spread far enough apart for themselves and their labels.
    const label = s.degrees === 'none' ? 0 : s.pLabelLayout === 'stack' ? 24 : { deg: 24, min: 38, full: 50 }[s.degrees];
    const size = back ? back * 2 : gs;
    const gap = s.pLabelLayout === 'along' && label
      ? ((size + label + 10) / gR) * (180 / Math.PI)
      : Math.max(5, ((size * 1.08) / gR) * (180 / Math.PI), label ? (label / degR) * (180 / Math.PI) : 0);
    return defs + spread(bodies, gap).map(({ item: b, display }) => {
      const crowded = back && bodies.some((o) => o !== b && Math.abs(((o.lon - b.lon + 540) % 360) - 180) < gap);
      const k = crowded ? 0.78 : 1;
      const [px, py] = c.point(gR, display);
      const colour = s.pColorFix ?? { own: s.own[b.id] ?? s.ink, ink: s.ink, accent: s.accent, custom: s.pCustom }[s.pColor];
      let out = '';
      if (s.pMarker === 'rim') {
        const [t1x, t1y] = c.point(zIn, b.lon), [t2x, t2y] = c.point(zIn - R * 0.028, b.lon);
        out += h('line', { x1: t1x, y1: t1y, x2: t2x, y2: t2y, stroke: s.ink, 'stroke-width': s.weight * 1.4 });
      } else if (s.pMarker !== 'none') {
        const tick = s.pMarker === 'tick';
        const [t1x, t1y] = c.point(tick ? bandIn : zIn, b.lon);
        const [t2x, t2y] = c.point(tick ? bandIn + R * 0.03 : zIn - R * 0.03, b.lon);
        out += h('line', { x1: t1x, y1: t1y, x2: t2x, y2: t2y, stroke: colour, 'stroke-width': s.weight * 1.6 });
        if (!tick) {
          const [ex, ey] = c.point(gR + (back || gs * 0.5) * k + 2, display);
          out += h('line', { x1: t2x, y1: t2y, x2: ex, y2: ey, stroke: rgba(s.ink, 0.3), 'stroke-width': s.weight * 0.7 });
        }
      }
      if (back) {
        const fill = s.pBack === 'outline' ? s.bg : s.pBack === 'gradient' ? `url(#${gid})` : s.pBackColor;
        out += h('circle', { cx: px, cy: py, r: back * k, fill, stroke: s.pBack === 'outline' ? s.pBackColor : rgba('#000000', 0.22), 'stroke-width': s.pBack === 'outline' ? s.weight * 1.2 : 0.8 });
      }
      out += symbol(x, b.id, px, py, gs * k * (back ? 0.78 : 1), colour);
      if (s.degrees !== 'none') out += position(x, c, b, display, px, py, back || gs * 0.5);
      return h('g', { class: `aw-body aw-body-${b.id}`, 'data-focus': b.id }, h('title', {}, esc(b.name)), out);
    }).join('');
  },
});

function css(cls: string, s: Drawn, font: string): string {
  const X = `.aw-chart.${cls}`;
  const by = { type: { hard: '#d0312d', soft: '#1f5fbf', conj: '#a07212', minor: '#2f9a3f' }, two: { hard: s.aHard, soft: s.aSoft, conj: s.aHard, minor: rgba(s.ink, 0.45) }, one: { hard: s.aOne, soft: s.aOne, conj: s.aOne, minor: s.aOne } }[s.aColor];
  if (s.aColor === 'type' && isDark(s.bg)) Object.assign(by, { hard: '#ff6b6b', soft: '#7aaaf0', conj: '#e8c26a', minor: '#7ed39a' });
  return `${X} { --aw-square: ${by.hard}; --aw-opposition: ${by.hard}; --aw-trine: ${by.soft}; --aw-sextile: ${by.soft}; --aw-conjunction: ${by.conj}; --aw-minor: ${by.minor};
  --aw-accent: ${s.accent}; --aw-accent-text: ${s.accent}; --aw-meridian: ${s.accent}; --aw-meridian-text: ${s.accent}; --aw-font: ${font}; }
${X} .aw-aspect { ${s.aByOrb ? '' : `stroke-width: ${s.aWeight * 1.1};`} ${s.aFade || s.aByOrb ? '' : 'stroke-opacity: 0.9;'} }
${s.aDash === 'dashes' ? `${X} .aw-aspect-trine, ${X} .aw-aspect-sextile { stroke-dasharray: 7 5; } ${X} .aw-aspect-square { stroke-dasharray: 12 4; } ${X} .aw-aspect-minor { stroke-dasharray: 1.5 3.5; }` : `${X} .aw-aspect-minor { stroke-dasharray: 4 3; }`}
${X} .aw-horizon { stroke: ${s.angles === 'lines' ? s.ink : s.accent}; stroke-width: ${s.weight * s.angleWeight}; }
${X} .aw-meridian { stroke-width: ${s.weight * (s.angles === 'lines' ? s.angleWeight : 1)}; ${s.angles === 'lines' ? `stroke: ${s.ink}; stroke-dasharray: none;` : ''} }`;
}

/** Aspect lines thicker the closer to exact: the width follows the fade the layer gives each line. */
const byOrb = (svg: string, weight: number) =>
  svg.replace(/(<g class="aw-aspect[^"]*"[^>]*?) stroke-opacity="([\d.]+)"/g, (_, head: string, o: string) => {
    const t = Math.max(0, (Number(o) - 0.35) / 0.65);
    return `${head} stroke-width="${(weight * (0.6 + 3.2 * t ** 2)).toFixed(2)}" stroke-opacity="0.95"`;
  });

let instances = 0;

export interface StyledChart {
  chart: Chart;
  /** The style's own CSS (scoped to this chart): embed it with toSVG({ css }), or add it to the page. */
  css: string;
  /** What the legibility guards changed. */
  adjusted: Adjustment[];
  /** The chart as a standalone SVG, with the theme and the style's CSS. */
  toSVG(opts?: { embedStyles?: boolean; width?: number | string; height?: number | string }): string;
}

/**
 * A chart drawn in a style. The data's `bodies` are drawn as given (leave out those you do not want);
 * the style adds the South Node, the Ascendant arrow and the four angles as points when asked.
 */
export function styledChart(data: WheelData, style: ChartStyle, options: StyledOptions = {}): StyledChart {
  const { style: s, adjusted } = legible(style);
  const size = options.size ?? 680;
  const outside = s.halo === 'fill' || s.hDegrees !== 'none';
  const labelled = s.angles === 'labels' || s.angles === 'axes';
  const R = size * (s.hLines === 'out' ? 0.31 : outside ? (labelled ? 0.36 : 0.39) : labelled ? 0.42 : 0.46);
  const g = geometry(s, R);
  const font = { ...DEFAULT_FONTS, ...options.fonts }[s.font];
  const x: Ctx = { s, g, font, o: options };
  const names = options.labels?.names ?? {};
  const node = data.bodies.find((b) => b.id === 'node');
  const hasAngles = data.asc !== undefined && data.mc !== undefined;
  const bodies: WheelBody[] = [
    ...data.bodies.filter((b) => (b.id !== 'node' || s.node) && (b.id !== 'chiron' || s.chiron)),
    ...(s.southNode && node ? [{ id: 'south-node', lon: norm360(node.lon + 180), name: names['south-node'] ?? 'South Node', glyph: '☋' }] : []),
    ...(s.ascPoint && data.asc !== undefined ? [{ id: 'rising', lon: data.asc, name: names.rising ?? 'Ascendant', glyph: '↑' }] : []),
    ...(s.anglePoints && hasAngles
      ? [
          { id: 'sunrise', lon: data.asc!, name: names.sunrise ?? 'Ascendant', glyph: '↑' },
          { id: 'dc', lon: norm360(data.asc! + 180), name: names.dc ?? 'Descendant', glyph: 'DC' },
          { id: 'mc', lon: data.mc!, name: names.mc ?? 'Midheaven', glyph: 'MC' },
          { id: 'ic', lon: norm360(data.mc! + 180), name: names.ic ?? 'Imum Coeli', glyph: 'IC' },
        ]
      : []),
  ];
  const cls = `aw-styled-${options.id ?? ++instances}`;
  const types = s.aSet === 'all' ? [...MAJOR, ...MINOR] : MAJOR;
  const { fonts: _f, labels: _l, ...chartOptions } = options;
  const chart = createChart({ ...data, bodies, aspects: undefined }, { ...chartOptions, size, radius: R, className: cls }).use(
    background(x),
    fills(x),
    zodiac(x),
    houses(x),
    ...(s.aSet !== 'none' ? [aspectLines({ types, radius: g.centre })] : []),
    ...(['axes', 'lines', 'horizon'].includes(s.angles) ? [axes(x)] : []),
    ...(labelled ? [angleLabels({ radius: s.hLines === 'out' ? R * 1.46 : outside ? R * 1.29 : R * 1.075, labels: options.labels?.angles })] : []),
    planets(x),
  );
  // Aspects thicker when exact: the layer's markup is post-processed, in render and in export alike.
  if (s.aByOrb) {
    const render = chart.render.bind(chart);
    chart.render = () => byOrb(render(), s.aWeight);
  }
  const styleCss = css(cls, s, font);
  return {
    chart,
    css: styleCss,
    adjusted,
    toSVG: (opts = {}) => chart.toSVG({ ...opts, css: styleCss }),
  };
}
