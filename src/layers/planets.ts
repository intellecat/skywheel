import { spread } from '../collision.js';
import { esc, h } from '../svg.js';
import type { Layer, ResolvedBody } from '../types.js';
import { lineMarker, type MarkerRenderer } from './markers.js';

export interface PlanetRingOptions {
  /** Radius of the glyphs. */
  radius?: number;
  /** Radius of the degree labels. */
  degreeRadius?: number;
  /** Where ticks start. Default: inner edge of the zodiac ring. */
  tickRadius?: number;
  /** Minimum angular gap between glyphs, in degrees. Default 9. */
  gap?: number;
  /** Degree labels. Default true. */
  degrees?: boolean;
  /** Add arc-minutes to the degree labels. Default false. */
  minutes?: boolean;
  /** Mark retrograde bodies with ℞. Default true. */
  retrograde?: boolean;
  /** Only these body ids. */
  include?: string[];
  /** Leave out these body ids. */
  exclude?: string[];
  marker?: MarkerRenderer;
  /**
   * Which set to draw: the chart's `bodies` (default) or a bi-wheel's `outer` bodies. Outer bodies
   * are focused and highlighted as 'o:' + id (e.g. 'o:mars'), so both rings can hold a Mars.
   */
  source?: 'inner' | 'outer';
}

/**
 * Planet glyphs at their zodiac positions, nudged apart where they crowd, each with a tick at its
 * exact degree. Every body is hoverable and clickable (data-focus = its id).
 */
export function planetRing(opts: PlanetRingOptions = {}): Layer {
  const marker = opts.marker ?? lineMarker;
  const keep = (b: ResolvedBody) => (!opts.include || opts.include.includes(b.id)) && !opts.exclude?.includes(b.id);

  return {
    name: 'planets',
    render: (c) => {
      const glyphR = opts.radius ?? c.r.planet;
      const degreeR = opts.degreeRadius ?? c.r.degree;
      const tickR = opts.tickRadius ?? c.r.zodiacInner;
      const halo = c.radius * 0.057;

      const outer = opts.source === 'outer';
      const focusId = (id: string) => (outer ? `o:${id}` : id);
      return spread((outer ? c.outerBodies : c.bodies).filter(keep), opts.gap ?? 9)
        .map(({ item: b, display }) => {
          const [gx, gy] = c.point(glyphR, display);
          const [tx, ty] = c.point(degreeR, display);
          const z = c.zodiacLon(b.lon) % 30;
          const deg = Math.floor(z);
          const min = opts.minutes ? `${String(Math.floor((z - deg) * 60)).padStart(2, '0')}′` : '';
          const retro = opts.retrograde !== false && b.retrograde ? h('tspan', { class: 'aw-retro' }, '℞') : '';
          const below = b.alt !== undefined ? b.alt < 0 : !c.isAboveHorizon(b.lon);
          return (
            marker(c, b, { lon: b.lon, display, tickRadius: tickR, glyphRadius: glyphR }) +
            h(
              'g',
              {
                class: `aw-body aw-body-${b.id}${below ? ' aw-below' : ''}${outer ? ' aw-outer' : ''}`,
                'data-focus': focusId(b.id),
                style: `--aw-c:${b.color}`,
              },
              h('title', {}, esc(b.name)),
              h('circle', { class: 'aw-halo', cx: gx, cy: gy, r: halo }),
              h('circle', { class: 'aw-hit', cx: gx, cy: gy, r: halo }),
              h('text', { class: 'aw-glyph', x: gx, y: gy }, esc(b.glyph)),
              opts.degrees !== false && h('text', { class: 'aw-degree', x: tx, y: ty }, `${deg}°${min}${retro}`),
            )
          );
        })
        .join('');
    },
  };
}
