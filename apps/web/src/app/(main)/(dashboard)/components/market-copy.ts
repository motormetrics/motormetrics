/** "+5.3%", "−0.4%": a true minus, never colour, carries the direction. */
export function signed(value: number, unit = "%", digits = 1): string {
  const sign = value < 0 ? "−" : "+";
  return `${sign}${Math.abs(value).toFixed(digits)}${unit}`;
}
