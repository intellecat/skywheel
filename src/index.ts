// skywheel: a composable, framework-agnostic SVG chart wheel.

export { Chart, createChart, type MountHandlers, type MountOptions, type SvgOptions } from './chart.js';
export { horizonChart, classicChart, biWheelChart, multiWheelChart, type HorizonChartOptions, type BiWheelOptions, type MultiWheelOptions } from './presets.js';

// Layers
export { backdrop, ring, skyEarth, type SkyEarthOptions } from './layers/background.js';
export { zodiacRing, type ZodiacRingOptions } from './layers/zodiac.js';
export { houseCusps, type HouseCuspsOptions } from './layers/houses.js';
export { horizonAxes, alongHorizon, type HorizonAxesOptions, type HorizonCaptions } from './layers/axes.js';
export { angleLabels, sectLabel, type AngleId, type AngleLabelsOptions, type SectLabelOptions } from './layers/angles.js';
export { ascUncertainty, type AscUncertaintyOptions } from './layers/uncertainty.js';
export { planetRing, type PlanetRingOptions } from './layers/planets.js';
export { lineMarker, radialMarker, type MarkerRenderer, type MarkerPlacement } from './layers/markers.js';
export { dignityRing, CHALDEAN_DECANS, EGYPTIAN_TERMS, type DignityRingOptions, type DignitySegment } from './layers/dignities.js';
export { aspectLines, crossAspectLines, type AspectLinesOptions, type CrossAspectLinesOptions } from './layers/aspects.js';
export {
  arcBand,
  radialLine,
  angleArc,
  polygon,
  chord,
  glyphMark,
  textMark,
  track,
  dot,
  group,
  type ArcBandOptions,
  type RadialLineOptions,
  type AngleArcOptions,
  type PolygonOptions,
  type ChordOptions,
  type GlyphMarkOptions,
  type TextMarkOptions,
  type TrackOptions,
} from './layers/marks.js';

// Building blocks for custom layers
export { h, esc, type Attrs } from './svg.js';
export { DEG, norm360, angleDiff, polar, sectorPath, slicePath, fmt } from './geometry.js';
export { spread, type Spread } from './collision.js';
export { ASPECTS, MINOR_ASPECTS, aspectDef, isMajor, computeAspects, computeCrossAspects, type AspectDef, type AspectOptions } from './aspects.js';
export { SIGNS, BODY_STYLES, formatZodiac, type Sign, type BodyStyle, type Element } from './symbols.js';
export { DEFAULT_LAYOUT, createContext, resolveBody, autoGlyphScale } from './context.js';
export { dayFactor } from './sky.js';
export { THEME_CSS, injectTheme } from './theme.js';

export type {
  WheelData,
  WheelBody,
  ResolvedBody,
  WheelRing,
  ResolvedRing,
  Aspect,
  AspectType,
  MajorAspectType,
  MinorAspectType,
  Layout,
  ChartOptions,
  ChartWords,
  ChartContext,
  Layer,
  Point,
} from './types.js';
