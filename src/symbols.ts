// Names, glyphs and default colours. U+FE0E asks for text (not emoji) presentation of the symbols.

const t = (s: string) => s + '︎';

export type Element = 'fire' | 'earth' | 'air' | 'water';

export interface Sign {
  name: string;
  glyph: string;
  element: Element;
}

export const SIGNS: readonly Sign[] = [
  { name: 'Aries', glyph: t('♈'), element: 'fire' },
  { name: 'Taurus', glyph: t('♉'), element: 'earth' },
  { name: 'Gemini', glyph: t('♊'), element: 'air' },
  { name: 'Cancer', glyph: t('♋'), element: 'water' },
  { name: 'Leo', glyph: t('♌'), element: 'fire' },
  { name: 'Virgo', glyph: t('♍'), element: 'earth' },
  { name: 'Libra', glyph: t('♎'), element: 'air' },
  { name: 'Scorpio', glyph: t('♏'), element: 'water' },
  { name: 'Sagittarius', glyph: t('♐'), element: 'fire' },
  { name: 'Capricorn', glyph: t('♑'), element: 'earth' },
  { name: 'Aquarius', glyph: t('♒'), element: 'air' },
  { name: 'Pisces', glyph: t('♓'), element: 'water' },
];

export interface BodyStyle {
  name: string;
  glyph: string;
  color: string;
}

/** Built-in bodies. Colours can be themed with CSS variables of the same name, e.g. --aw-mars. */
export const BODY_STYLES: Readonly<Record<string, BodyStyle>> = {
  sun: { name: 'Sun', glyph: t('☉'), color: '#ffcf5a' },
  moon: { name: 'Moon', glyph: t('☽'), color: '#dfe6f0' },
  mercury: { name: 'Mercury', glyph: t('☿'), color: '#9ad8c6' },
  venus: { name: 'Venus', glyph: t('♀'), color: '#f7bfd6' },
  mars: { name: 'Mars', glyph: t('♂'), color: '#ff7a66' },
  jupiter: { name: 'Jupiter', glyph: t('♃'), color: '#f2b36d' },
  saturn: { name: 'Saturn', glyph: t('♄'), color: '#d8c592' },
  uranus: { name: 'Uranus', glyph: t('♅'), color: '#86dcec' },
  neptune: { name: 'Neptune', glyph: t('♆'), color: '#8ea2ff' },
  pluto: { name: 'Pluto', glyph: t('♇'), color: '#c3a3d9' },
  node: { name: 'North Node', glyph: t('☊'), color: '#b9c3d9' },
  chiron: { name: 'Chiron', glyph: '⚷', color: '#a5d68f' },
};

/** "14°22′ Leo", or with the glyph: "14°22′ ♌ Leo". */
export function formatZodiac(lon: number, glyph = false): string {
  const l = ((lon % 360) + 360) % 360;
  const sign = SIGNS[Math.floor(l / 30)];
  const inSign = l % 30;
  const d = Math.floor(inSign);
  const m = Math.floor((inSign - d) * 60);
  return `${d}°${String(m).padStart(2, '0')}′ ${glyph ? sign.glyph + ' ' : ''}${sign.name}`;
}
