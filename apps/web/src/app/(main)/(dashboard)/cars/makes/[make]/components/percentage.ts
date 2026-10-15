/** `part` as a share of `whole`, to one decimal place: "12.3%". */
export function percentage(part: number, whole: number): string {
  return `${((part / (whole || 1)) * 100).toFixed(1)}%`;
}
