import { ASPECTS, computeAspects, computeCrossAspects, type AspectOptions } from '../aspects.js';
import { esc, h } from '../svg.js';
import type { AspectType, Layer } from '../types.js';

export interface AspectLinesOptions extends AspectOptions {
  /** Radius the lines are drawn between. Default: the inner circle. */
  radius?: number;
  /** Draw the aspect symbol at the middle of each line. Default false. */
  glyphs?: boolean;
  /** Only between these body ids. */
  include?: string[];
}

const DEFAULT_TYPES: AspectType[] = ['sextile', 'square', 'trine', 'opposition'];

/**
 * Lines between bodies in aspect, coloured by type and fading with a wider orb. Uses the data's
 * aspects when given, otherwise computes the major ones (conjunctions are left out by default,
 * since their line would have no length).
 */
export function aspectLines(opts: AspectLinesOptions = {}): Layer {
  const types = opts.types ?? DEFAULT_TYPES;
  return {
    name: 'aspects',
    render: (c) => {
      const r = opts.radius ?? c.r.houseInner;
      const bodies = c.bodies.filter((b) => !opts.include || opts.include.includes(b.id));
      const ids = new Set(bodies.map((b) => b.id));
      const aspects = (c.data.aspects ?? computeAspects(bodies, { ...opts, types })).filter(
        (a) => types.includes(a.type) && ids.has(a.a) && ids.has(a.b),
      );
      return aspects
        .map((a) => {
          const def = ASPECTS.find((d) => d.type === a.type)!;
          const maxOrb = opts.orbs?.[a.type] ?? def.orb;
          const A = c.body(a.a)!;
          const B = c.body(a.b)!;
          const [x1, y1] = c.point(r, A.lon);
          const [x2, y2] = c.point(r, B.lon);
          const glyph = opts.glyphs
            ? h('text', { class: 'aw-aspect-glyph', x: (x1 + x2) / 2, y: (y1 + y2) / 2, style: `fill:var(--aw-${a.type})` }, def.glyph)
            : '';
          return h(
            'g',
            { class: `aw-aspect aw-aspect-${a.type}`, 'data-bodies': `${a.a} ${a.b}`, 'stroke-opacity': 1 - 0.65 * Math.min(1, a.orb / maxOrb) },
            h('title', {}, esc(c.words.aspect?.(A.name, B.name, a.type, a.orb) ?? `${A.name} ${a.type} ${B.name} (orb ${a.orb.toFixed(1)}°)`)),
            h('line', { x1, y1, x2, y2 }),
            glyph,
          );
        })
        .join('');
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
}

/**
 * Bi-wheels: lines from each outer body (transit or partner) to the inner bodies it aspects. Uses
 * the data's `crossAspects` when given (a = outer id, b = inner id), otherwise computes them.
 * Highlighting 'o:mars' or 'venus' emphasises the lines that touch it.
 */
export function crossAspectLines(opts: CrossAspectLinesOptions = {}): Layer {
  const types = opts.types ?? ['conjunction', ...DEFAULT_TYPES];
  return {
    name: 'cross-aspects',
    render: (c) => {
      const r = opts.radius ?? c.r.houseInner;
      const outer = c.outerBodies.filter((b) => !opts.includeOuter || opts.includeOuter.includes(b.id));
      const inner = c.bodies.filter((b) => !opts.includeInner || opts.includeInner.includes(b.id));
      const oIds = new Set(outer.map((b) => b.id));
      const iIds = new Set(inner.map((b) => b.id));
      const aspects = (c.data.crossAspects ?? computeCrossAspects(outer, inner, { ...opts, types })).filter(
        (a) => types.includes(a.type) && oIds.has(a.a) && iIds.has(a.b),
      );
      return aspects
        .map((a) => {
          const def = ASPECTS.find((d) => d.type === a.type)!;
          const maxOrb = opts.orbs?.[a.type] ?? def.orb;
          const A = c.outerBody(a.a)!;
          const B = c.body(a.b)!;
          const [x1, y1] = c.point(r, A.lon);
          const [x2, y2] = c.point(r, B.lon);
          const glyph = opts.glyphs
            ? h('text', { class: 'aw-aspect-glyph', x: (x1 + x2) / 2, y: (y1 + y2) / 2, style: `fill:var(--aw-${a.type})` }, def.glyph)
            : '';
          // A conjunction's line has no length: mark it with a dot instead.
          const mark =
            Math.hypot(x2 - x1, y2 - y1) < 3
              ? h('circle', { class: 'aw-aspect-dot', cx: x1, cy: y1, r: 3.2 })
              : h('line', { x1, y1, x2, y2 });
          return h(
            'g',
            { class: `aw-aspect aw-cross aw-aspect-${a.type}`, 'data-bodies': `o:${a.a} ${a.b}`, 'stroke-opacity': 1 - 0.65 * Math.min(1, a.orb / maxOrb) },
            h('title', {}, esc(c.words.aspect?.(A.name, B.name, a.type, a.orb) ?? `${A.name} ${a.type} ${B.name} (orb ${a.orb.toFixed(1)}°)`)),
            mark,
            glyph,
          );
        })
        .join('');
    },
  };
}
