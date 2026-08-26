/**
 * Sparkline geometry for a series, normalised into a `width` x `height` box.
 *
 * Returns path data rather than an element so callers keep control of stroke,
 * fill and the `<title>` an SVG needs to stay accessible — the hero cards draw
 * theirs in `currentColor` over a gradient, the panels draw theirs in an accent.
 *
 * Returns `null` for a series too short to draw, which every caller treats as
 * "skip the chart" rather than rendering a degenerate line.
 */
export function sparkline(
  values: number[],
  width: number,
  height: number,
  pad = 8,
) {
  if (values.length < 2) {
    return null;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values.map((value, index) => [
    (index / (values.length - 1)) * (width - pad * 2) + pad,
    height - pad - ((value - min) / span) * (height - pad * 2),
  ]);

  const line = points
    .map(
      ([x, y], index) => `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`,
    )
    .join(" ");
  const [lastX, lastY] = points.at(-1) ?? [0, 0];

  return {
    line,
    area: `${line} L${width - pad} ${height} L${pad} ${height} Z`,
    lastX: lastX.toFixed(1),
    lastY: lastY.toFixed(1),
  };
}
