/**
 * Month arithmetic on `YYYY-MM` strings.
 *
 * Deliberately does not go through `Date`: Cache Components rejects reading the
 * current time anywhere in the prerender path, and plain arithmetic keeps this
 * provably clock-free.
 */

/** `2025-10`, -12 → `2024-10`, with the year rolling over as needed. */
export function shiftMonth(month: string, delta: number): string {
  const [year, monthPart] = month.split("-").map(Number);
  const index = year * 12 + (monthPart - 1) + delta;
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}`;
}

/** The `length` months ending at `month`, oldest first. */
export function trailingMonths(month: string, length: number): string[] {
  return Array.from({ length }, (_, index) =>
    shiftMonth(month, index - (length - 1)),
  );
}
