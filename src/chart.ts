import { createContext } from './context.js';
import { esc, h } from './svg.js';
import { THEME_CSS, injectTheme } from './theme.js';
import type { ChartContext, ChartOptions, Layer, WheelData } from './types.js';

export interface MountHandlers {
  /** Pointer enters a body or chart angle (its id), or leaves it (null). */
  onHover?(id: string | null): void;
  /** A body or angle was clicked (its id), or empty space (null). */
  onSelect?(id: string | null): void;
}

export interface MountOptions extends MountHandlers {
  /** Add the default theme stylesheet to the document once. Default true. */
  injectStyles?: boolean;
}

export interface SvgOptions {
  /** Embed the theme stylesheet so the SVG looks right on its own. Default true. */
  embedStyles?: boolean;
  width?: number | string;
  height?: number | string;
}

let instances = 0;

/**
 * A chart wheel built from layers. Compose it, then either mount it into the page (live, with hover,
 * select and highlight) or export it as an SVG string.
 *
 *   createChart(data).use(zodiacRing(), houseCusps(), planetRing()).mount(el)
 */
export class Chart {
  private layers: Layer[] = [];
  private readonly uid = `aw${++instances}`;
  private svg: SVGSVGElement | null = null;
  private highlighted: string | null = null;
  private detach: (() => void) | null = null;

  constructor(
    private data: WheelData,
    private options: ChartOptions = {},
  ) {}

  /** Adds layers, drawn in order (later layers on top). */
  use(...layers: Layer[]): this {
    this.layers.push(...layers);
    return this.refresh();
  }

  /** Replaces the data and re-renders if mounted. Cheap enough to call every animation frame. */
  setData(data: WheelData): this {
    this.data = data;
    return this.refresh();
  }

  setOptions(patch: ChartOptions): this {
    this.options = { ...this.options, ...patch };
    return this.refresh();
  }

  get context(): ChartContext {
    return createContext(this.data, this.options, this.uid);
  }

  /** The chart's inner SVG markup (everything inside <svg>). */
  render(): string {
    const ctx = this.context;
    return this.layers.map((l) => `<g class="aw-layer aw-layer-${l.name}">${l.render(ctx)}</g>`).join('');
  }

  /** A complete, standalone SVG document. */
  toSVG(opts: SvgOptions = {}): string {
    const size = this.context.size;
    const style = opts.embedStyles === false ? '' : `<style>${THEME_CSS}</style>`;
    const title = this.options.title ? h('title', {}, esc(this.options.title)) : '';
    return h(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        class: this.rootClass(),
        viewBox: `${-size / 2} ${-size / 2} ${size} ${size}`,
        width: opts.width ?? size,
        height: opts.height ?? size,
      },
      style + title + this.render(),
    );
  }

  /** Renders into an element (creating an <svg> inside it) and wires up interaction. */
  mount(target: Element, opts: MountOptions = {}): this {
    this.unmount();
    if (opts.injectStyles !== false) injectTheme(target.ownerDocument);
    const svg =
      target instanceof SVGSVGElement ? target : target.appendChild(target.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'svg'));
    const size = this.context.size;
    svg.setAttribute('viewBox', `${-size / 2} ${-size / 2} ${size} ${size}`);
    svg.setAttribute('class', this.rootClass());
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', this.options.title ?? 'Astrological chart wheel');

    const focusOf = (t: EventTarget | null) =>
      t instanceof Element ? (t.closest<SVGElement>('[data-focus]')?.dataset.focus ?? null) : null;
    const over = (e: Event) => opts.onHover?.(focusOf(e.target));
    const leave = () => opts.onHover?.(null);
    const click = (e: Event) => opts.onSelect?.(focusOf(e.target));
    svg.addEventListener('pointerover', over);
    svg.addEventListener('pointerleave', leave);
    svg.addEventListener('click', click);
    this.detach = () => {
      svg.removeEventListener('pointerover', over);
      svg.removeEventListener('pointerleave', leave);
      svg.removeEventListener('click', click);
      if (svg !== target) svg.remove();
    };
    this.svg = svg;
    return this.refresh();
  }

  unmount(): void {
    this.detach?.();
    this.detach = null;
    this.svg = null;
  }

  /**
   * Emphasises one body or angle (or clears with null) without re-rendering, e.g. to link the chart
   * with another view. Aspect lines touching it are emphasised too; everything else is dimmed.
   */
  highlight(id: string | null): this {
    this.highlighted = id;
    const svg = this.svg;
    if (!svg) return this;
    svg.classList.toggle('aw-has-hl', id !== null);
    for (const n of svg.querySelectorAll<SVGElement>('[data-focus], [data-bodies]')) {
      const on = id !== null && (n.dataset.focus === id || (n.dataset.bodies?.split(' ').includes(id) ?? false));
      n.classList.toggle('aw-hl', on);
    }
    return this;
  }

  private rootClass() {
    return ['aw-chart', this.options.className].filter(Boolean).join(' ');
  }

  private refresh(): this {
    if (this.svg) {
      this.svg.innerHTML = this.render();
      this.highlight(this.highlighted);
    }
    return this;
  }
}

export const createChart = (data: WheelData, options?: ChartOptions) => new Chart(data, options);
