/**
 * Compact y-axis tick labels for the report charts, so a tick reads "6k"
 * rather than "6,100". Tooltips keep the full figure.
 */

/** Counts: `6100` → `6.1k`, `6000` → `6k`, `950` → `950`. */
export function compactCount(value: number): string {
  if (value < 1000) {
    return String(value);
  }

  const thousands = value / 1000;

  return `${thousands.toFixed(thousands % 1 === 0 ? 0 : 1)}k`;
}

/** Premiums: `100000` → `$100k`, `102500` → `$102.5k`. */
export function compactCurrency(value: number): string {
  if (Math.abs(value) < 1000) {
    return `$${Math.round(value)}`;
  }

  const thousands = value / 1000;

  return `$${thousands.toFixed(thousands % 1 === 0 ? 0 : 1)}k`;
}

/** Whole thousands only, as the PQP charts label them: `95400` → `$95k`. */
export function compactWholeCurrency(value: number): string {
  return `$${Math.round(value / 1000)}k`;
}
