// Data in, SVG out. The library does no astronomy: feed it longitudes from any ephemeris.

/** A planet or point on the wheel. */
export interface WheelBody {
  /** 'sun', 'moon', 'mercury', … pick up built-in names, glyphs and colours; any other id works too. */
  id: string;
  /** Tropical ecliptic longitude in degrees. */
  lon: number;
  /** Longitude speed in degrees/day; negative means retrograde. */
  speed?: number;
  /** Altitude above the observer's horizon, if known. Otherwise the ecliptic half of the wheel is used. */
  alt?: number;
  name?: string;
  glyph?: string;
  color?: string;
  /**
   * Size of the glyph relative to a single symbol (1). Labels of two or more characters ('☿☊', 'Cu')
   * are shrunk automatically; set this to override.
   */
  glyphScale?: number;
}

export type MajorAspectType = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
export type MinorAspectType =
  | 'semisextile'
  | 'decile'
  | 'novile'
  | 'semisquare'
  | 'septile'
  | 'quintile'
  | 'binovile'
  | 'biseptile'
  | 'tredecile'
  | 'sesquiquadrate'
  | 'biquintile'
  | 'quincunx'
  | 'triseptile'
  | 'quadnovile'
  | 'quindecile';
/** The major and minor aspects skywheel knows, or any other name (drawn as a plain dashed line). */
export type AspectType = MajorAspectType | MinorAspectType | (string & {});

export interface Aspect {
  a: string;
  b: string;
  type: AspectType;
  /** Distance from exact, in degrees. */
  orb: number;
  /** The orb this aspect was allowed (e.g. an applying orb): its line fades towards it. Default: the aspect's default orb. */
  maxOrb?: number;
}

/** One ring of bodies beyond the chart's own: transits, progressions, a partner's chart. */
export interface WheelRing {
  bodies: WheelBody[];
  /** This ring's own Ascendant and Midheaven, if it has them (drawn by angleLabels({ rings })). */
  asc?: number;
  mc?: number;
  /** Precomputed aspects from this ring's bodies (a) to the chart's `bodies` (b); otherwise computed. */
  aspects?: Aspect[];
}

export interface WheelData {
  bodies: WheelBody[];
  /**
   * Ascendant and Midheaven, tropical longitude. Leave them out when the time is unknown: the axes,
   * angle labels and sky/earth halves are then not drawn, and 0° Aries sits on the left.
   */
  asc?: number;
  mc?: number;
  /** Twelve house cusps (tropical), index 0 = 1st house. Omit for a chart without houses. */
  cusps?: number[];
  /** Subtracted from tropical longitudes for sidereal zodiacs. Default 0 (tropical). */
  ayanamsa?: number;
  /** The Sun's altitude in degrees; tints the sky and decides day or night chart. */
  sunAltitude?: number;
  /** Ascendant at the low and high end of its uncertainty (e.g. from ΔT in ancient charts). */
  ascRange?: [number, number];
  /** Precomputed aspects; otherwise aspect layers compute them. */
  aspects?: Aspect[];
  /**
   * A second set of bodies for a bi-wheel: transits around a natal chart, or a partner's planets in
   * synastry. Drawn by planetRing({ source: 'outer' }); aspects to `bodies` by crossAspectLines().
   */
  outer?: WheelBody[];
  /** Precomputed aspects from `outer` bodies (a) to `bodies` (b); otherwise computed. */
  crossAspects?: Aspect[];
  /** The outer chart's Ascendant and Midheaven (a transit or partner chart with a known time). */
  outerAsc?: number;
  outerMc?: number;
  /**
   * More rings, outward after `outer`: a tri-wheel is natal + `outer` + one ring here (or, without
   * `outer`, two rings here). Ring n's bodies are focused as 'o<n>:' + id ('o:' for the first).
   */
  rings?: WheelRing[];
}

/** Ring radii as fractions of the chart radius; every layer defaults to these. */
export interface Layout {
  /** Outer edge of the zodiac ring. */
  outer: number;
  /** Inner edge of the zodiac ring; planet ticks start here. */
  zodiacInner: number;
  /** Planet glyphs. */
  planet: number;
  /** Planet degree labels. */
  degree: number;
  /** Inner circle: house cusps start here, aspect lines are drawn inside it. */
  houseInner: number;
}

export interface ChartOptions {
  /** Width and height of the SVG coordinate system; the chart is centred on 0,0. Default 680. */
  size?: number;
  /** Radius of the zodiac ring's outer edge. Default 300 (leaves room for angle labels). */
  radius?: number;
  layout?: Partial<Layout>;
  /** Degrees added to a longitude to get its screen angle. Default 180 − ASC: Ascendant on the left. */
  rotation?: number;
  /** Extra class names on the <svg>, e.g. 'aw-light'. */
  className?: string;
  /**
   * Magnify the zodiac around one longitude: angles from `center` are multiplied by `zoom`, so a
   * narrow stretch (a retrograde's loop) spreads across the wheel. Layers draw only what stays
   * within half a turn of the centre; crop the SVG to the fan you want to show.
   */
  lens?: { center: number; zoom: number };
  /** Accessible title. */
  title?: string;
  /**
   * A fixed id for the chart's internal SVG ids (gradients, filters), so the same chart renders the
   * same markup on a server and in the browser. Default: counted per page.
   */
  id?: string;
  /** Words shown in tooltips, for another language: the twelve sign names, and an aspect's title. English by default. */
  words?: ChartWords;
}

export interface ChartWords {
  /** Aries to Pisces. */
  signs?: readonly string[];
  /** "Venus square Mars (orb 1.2°)": the title of an aspect line, from the two bodies' names. */
  // A method, so a function written for the five major aspects alone is still accepted.
  aspect?(a: string, b: string, type: AspectType, orb: number): string;
}

export interface ResolvedRing {
  bodies: readonly ResolvedBody[];
  asc?: number;
  mc?: number;
  aspects?: Aspect[];
  /** '' for the chart's own ring, 'o:' for the first outer ring, then 'o2:', 'o3:' … */
  prefix: string;
  body(id: string): ResolvedBody | undefined;
}

/** A body with its display defaults filled in. */
export interface ResolvedBody extends WheelBody {
  name: string;
  glyph: string;
  color: string;
  retrograde: boolean;
  /** Glyph size relative to a single symbol (from glyphScale, or shrunk for long labels). */
  glyphScale: number;
}

export type Point = [number, number];

/** Everything a layer needs, like react-chart's ChartContext. */
export interface ChartContext {
  readonly data: WheelData;
  /** Unique per chart instance, for SVG ids (gradients etc.). */
  readonly uid: string;
  readonly size: number;
  readonly radius: number;
  /** Absolute ring radii (layout × radius). */
  readonly r: Readonly<Layout>;
  readonly rotation: number;
  readonly bodies: readonly ResolvedBody[];
  /** The bi-wheel's second set of bodies (empty for a single chart). */
  readonly outerBodies: readonly ResolvedBody[];
  /**
   * Every ring, from the chart's own (0) outward: `bodies`, then `outer`, then `rings`. Each has its
   * resolved bodies, its angles if known, and the prefix of its focus ids ('', 'o:', 'o2:' …).
   */
  readonly rings: readonly ResolvedRing[];
  /** Screen position at radius r and ecliptic longitude lon. */
  point(r: number, lon: number): Point;
  /** Annular sector from longitude a anticlockwise to b. */
  sector(inner: number, outer: number, a: number, b: number): string;
  /** Pie slice from longitude a anticlockwise to b. */
  slice(r: number, a: number, b: number): string;
  /** Longitude in the chart's zodiac (tropical minus ayanamsa). */
  zodiacLon(lon: number): number;
  /** The lens, if the chart is magnified. */
  readonly lens?: { center: number; zoom: number };
  /** Whether a longitude is drawn at all (always, without a lens). */
  visible(lon: number): boolean;
  /** Visible longitudes as [from, to] (anticlockwise); the whole circle without a lens. */
  readonly span: [number, number];
  /** Whether an ecliptic longitude is in the half of the zodiac above the horizon (always true without an Ascendant). */
  isAboveHorizon(lon: number): boolean;
  /** Screen angle of the horizon line, in degrees (180 when the Ascendant is on the left). */
  readonly horizonAngle: number;
  body(id: string): ResolvedBody | undefined;
  outerBody(id: string): ResolvedBody | undefined;
  /** The chart's words (ChartOptions.words). */
  readonly words: ChartWords;
}

/** A composable piece of the chart. Layers render in the order they are added. */
export interface Layer {
  name: string;
  render(ctx: ChartContext): string;
}
