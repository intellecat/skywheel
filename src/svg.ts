import { fmt } from './geometry.js';

// A tiny string-based SVG builder: no DOM needed, so charts render the same in the browser and on a server.

const ENTITIES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };

/** Escapes text for use in SVG content or attributes. Use it on anything that came from data. */
export const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ENTITIES[c]);

export type Attrs = Record<string, string | number | boolean | null | undefined>;
type Child = string | false | null | undefined;

/**
 * Builds an element: h('circle', { r: 10, class: 'ring' }) → <circle r="10" class="ring"/>.
 * Attribute values are escaped and numbers rounded; children are inserted as-is (escape text with `esc`).
 */
export function h(tag: string, attrs: Attrs = {}, ...children: Child[]): string {
  let a = '';
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    a += v === true ? ` ${k}` : ` ${k}="${typeof v === 'number' ? fmt(v) : esc(v)}"`;
  }
  const body = children.filter(Boolean).join('');
  return body ? `<${tag}${a}>${body}</${tag}>` : `<${tag}${a}/>`;
}
