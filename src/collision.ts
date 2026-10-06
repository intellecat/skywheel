import { norm360 } from './geometry.js';

export interface Spread<T> {
  item: T;
  /** Where to draw the glyph, nudged clear of its neighbours. */
  display: number;
}

interface Cluster {
  /** Indexes into the sorted list, consecutive. */
  first: number;
  count: number;
  /** Mean true longitude (unwrapped); the cluster is laid out evenly around it. */
  center: number;
}

/**
 * Spreads glyphs so neighbours are at least `gap` degrees apart, keeping their order around the circle
 * and each group as close as possible to its true positions.
 *
 * Items that crowd each other are grouped and laid out evenly around the group's mean longitude;
 * groups that then collide are merged, until none overlap. Starting from the largest empty stretch of
 * the circle means no group straddles the seam. If the circle is too full, the gap shrinks to fit.
 */
export function spread<T extends { lon: number }>(items: readonly T[], gap: number): Spread<T>[] {
  const n = items.length;
  if (n === 0) return [];
  const sorted = [...items].sort((a, b) => norm360(a.lon) - norm360(b.lon));
  if (n === 1) return [{ item: sorted[0], display: sorted[0].lon }];
  const g = Math.min(gap, (360 / n) * 0.98);

  // Start just after the widest empty stretch, and unwrap so longitudes increase.
  let widest = 0;
  let widestAt = 0;
  for (let i = 0; i < n; i++) {
    const d = norm360(norm360(sorted[(i + 1) % n].lon) - norm360(sorted[i].lon));
    if (d > widest) {
      widest = d;
      widestAt = (i + 1) % n;
    }
  }
  const order = [...sorted.slice(widestAt), ...sorted.slice(0, widestAt)];
  const x: number[] = [];
  for (let i = 0; i < n; i++) x.push(i === 0 ? norm360(order[0].lon) : x[i - 1] + norm360(norm360(order[i].lon) - norm360(order[i - 1].lon)));

  const start = (c: Cluster) => c.center - ((c.count - 1) / 2) * g;
  const end = (c: Cluster) => c.center + ((c.count - 1) / 2) * g;
  let clusters: Cluster[] = x.map((v, i) => ({ first: i, count: 1, center: v }));

  const mergeAll = () => {
    for (let pass = 0; pass < n; pass++) {
      const merged: Cluster[] = [];
      let changed = false;
      for (const c of clusters) {
        const prev = merged[merged.length - 1];
        if (prev && start(c) - end(prev) < g - 1e-9) {
          const count = prev.count + c.count;
          // Each center is the mean of its items' longitudes, so this is the mean of all of them.
          merged[merged.length - 1] = { first: prev.first, count, center: (prev.center * prev.count + c.center * c.count) / count };
          changed = true;
        } else {
          merged.push(c);
        }
      }
      clusters = merged;
      if (!changed) return;
    }
  };

  mergeAll();
  // A crowded circle can still collide across the seam: carry the last group round to the front
  // (one turn back) so it merges with the first, and settle again.
  for (let round = 0; round < n && clusters.length > 1; round++) {
    const first = clusters[0];
    const last = clusters[clusters.length - 1];
    if (start(first) + 360 - end(last) >= g - 1e-9) break;
    order.unshift(...order.splice(last.first, last.count));
    clusters = [{ first: 0, count: last.count, center: last.center - 360 }, ...clusters.slice(0, -1).map((c) => ({ ...c, first: c.first + last.count }))];
    mergeAll();
  }

  const out: Spread<T>[] = [];
  for (const c of clusters) {
    for (let k = 0; k < c.count; k++) out.push({ item: order[c.first + k], display: start(c) + k * g });
  }
  return out;
}
