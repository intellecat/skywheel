import { aspectDef, computeAspects, computeCrossAspects, isMajor, type AspectOptions } from '../aspects.js';
import { esc, h } from '../svg.js';
import type { Aspect, AspectType, ChartContext, Layer, ResolvedBody } from '../types.js';

export interface AspectLinesOptions extends AspectOptions {
  /** Radius the lines are drawn between. Default: the inner circle. */
  radius?: number;
  /** Draw the aspect symbol at the middle of each line (for aspects that have one). Default false. */
  glyphs?: boolean;
  /** Only between these body ids. */
  include?: string[];
}

const DEFAULT_TYPES: AspectType[] = ['sextile', 'square', 'trine', 'opposition'];

/** Keeps the aspects a layer was asked for: `types` if given, else every aspect but conjunctions. */
const wanted = (types: AspectType[] | undefined) => (a: Aspect) => (types ? types.includes(a.type) : a.type !== 'conjunction');

/**
 * One aspect line. Major aspects are solid and coloured by type; minor and unknown ones are dashed,
 * in --aw-<type> if the theme defines it. The line fades as the orb nears the aspect's maximum.
 */
function aspectLine(c: ChartContext, a: Aspect, A: ResolvedBody, B: ResolvedBody, r: number, focus: string, opts: AspectOptions & { glyphs?: boolean }, extraClass = '') {
  const def = aspectDef(a.type);
  const maxOrb = a.maxOrb ?? opts.orbs?.[a.type] ?? def?.orb;
  const [x1, y1] = c.point(r, A.lon);
  const [x2, y2] = c.point(r, B.lon);
  const type = esc(a.type);
  const glyph =
    opts.glyphs && def?.glyph
      ? h('text', { class: 'aw-aspect-glyph', x: (x1 + x2) / 2, y: (y1 + y2) / 2, style: `fill:var(--aw-${type}, var(--aw-minor))` }, def.glyph)
      : '';
  // A conjunction's line has no length: mark it with a dot instead.
  const mark = Math.hypot(x2 - x1, y2 - y1) < 3 ? h('circle', { class: 'aw-aspect-dot', cx: x1, cy: y1, r: 3.2 }) : h('line', { x1, y1, x2, y2 });
  return h(
    'g',
    {
      class: `aw-aspect${extraClass} aw-aspect-${type}${isMajor(a.type) ? '' : ' aw-aspect-minor'}`,
      'data-bodies': focus,
      'stroke-opacity': maxOrb ? 1 - 0.65 * Math.min(1, a.orb / maxOrb) : 1,
    },
    h('title', {}, esc(c.words.aspect?.(A.name, B.name, a.type, a.orb) ?? `${A.name} ${a.type} ${B.name} (orb ${a.orb.toFixed(1)}°)`)),
    mark,
    glyph,
  );
}

/**
 * Lines between bodies in aspect, coloured by type and fading with a wider orb. Uses the data's
 * aspects when given (any names, minor ones included), otherwise computes the major ones.
 * Conjunctions are left out unless `types` names them, since their line would have no length.
 */
export function aspectLines(opts: AspectLinesOptions = {}): Layer {
  return {
    name: 'aspects',
    render: (c) => {
      const r = opts.radius ?? c.r.houseInner;
      const bodies = c.bodies.filter((b) => !opts.include || opts.include.includes(b.id));
      const ids = new Set(bodies.map((b) => b.id));
      const aspects = (c.data.aspects ?? computeAspects(bodies, { ...opts, types: opts.types ?? DEFAULT_TYPES })).filter(
        (a) => wanted(opts.types)(a) && ids.has(a.a) && ids.has(a.b),
      );
      return aspects.map((a) => aspectLine(c, a, c.body(a.a)!, c.body(a.b)!, r, `${a.a} ${a.b}`, opts)).join('');
    },
  };
}

export interface CrossAspectLinesOptions extends AspectOptions {
  /** Radius the lines are drawn between. Default: the inner circle. */
  radius?: number;
  glyphs?: boolean;
  /** Only these outer body ids. */
  includeOuter?: string[];
  /** Only these inner body ids. */
  includeInner?: string[];
  /** Which ring the aspects come from: 1 (default) is `outer`, 2 the next ring out, and so on. */
  ring?: number;
}

/**
 * Bi-wheels: lines from each outer body (transit or partner) to the inner bodies it aspects. Uses
 * the data's `crossAspects` (or the ring's `aspects`) when given (a = outer id, b = inner id),
 * otherwise computes them. Highlighting 'o:mars' or 'venus' emphasises the lines that touch it.
 */
export function crossAspectLines(opts: CrossAspectLinesOptions = {}): Layer {
  const types = opts.types ?? ['conjunction', ...DEFAULT_TYPES];
  return {
    name: 'cross-aspects',
    render: (c) => {
      const ring = c.rings[opts.ring ?? 1];
      if (!ring) return '';
      const r = opts.radius ?? c.r.houseInner;
      const outer = ring.bodies.filter((b) => !opts.includeOuter || opts.includeOuter.includes(b.id));
      const inner = c.bodies.filter((b) => !opts.includeInner || opts.includeInner.includes(b.id));
      const oIds = new Set(outer.map((b) => b.id));
      const iIds = new Set(inner.map((b) => b.id));
      const given = ring.aspects;
      const aspects = (given ?? computeCrossAspects(outer, inner, { ...opts, types })).filter(
        (a) => (opts.types || !given ? types.includes(a.type) : true) && oIds.has(a.a) && iIds.has(a.b),
      );
      return aspects.map((a) => aspectLine(c, a, ring.body(a.a)!, c.body(a.b)!, r, `${ring.prefix}${a.a} ${a.b}`, opts, ' aw-cross')).join('');
    },
  };
}
