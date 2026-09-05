/**
 * Arc geometry for the gapped-segment ring the fuel mix draws. Copied from
 * `shared/donut-gauge.tsx`, which centres the ring and stacks its legend
 * beneath; the v3 comp wants the legend beside it, so the maths lives here
 * and the layout is composed locally.
 */

export const RING_RADIUS = 74;
export const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
/** Arc length removed from each segment so the rounded caps read as separate. */
const SEGMENT_GAP = 16;

export interface DonutSegment {
  color: string;
  label: string;
  value: number;
}

export interface DonutArc {
  color: string;
  dashArray: string;
  dashOffset: string;
  key: string;
}

/**
 * Segments as dash offsets on a single circle rather than arc paths, which is
 * what keeps the rounded caps consistent at any share.
 */
export function donutArcs(segments: DonutSegment[]): DonutArc[] {
  const total = segments.reduce((sum, item) => sum + item.value, 0) || 1;

  let consumed = 0;
  return segments.map((segment) => {
    const full = (segment.value / total) * RING_CIRCUMFERENCE;
    // Floor at 2px so a rounding-to-zero share still shows as a tick rather
    // than vanishing, which would silently drop it from the ring.
    const dash = Math.max(2, full - SEGMENT_GAP);
    const arc = {
      color: segment.color,
      dashArray: `${dash.toFixed(2)} ${(RING_CIRCUMFERENCE - dash).toFixed(2)}`,
      dashOffset: (-(consumed + SEGMENT_GAP / 2)).toFixed(2),
      key: segment.label,
    };
    consumed += full;
    return arc;
  });
}
