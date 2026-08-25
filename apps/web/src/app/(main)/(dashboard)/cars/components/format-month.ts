/**
 * Month label helpers for the Cars overview blocks.
 *
 * Every date here is built from a `YYYY-MM` string that came out of the
 * database. Nothing reads the current time, which Cache Components rejects
 * anywhere in the prerender path — including module scope.
 */

const toDate = (month: string) => {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(year, monthNumber - 1);
};

/** `2025-10` → `October 2025`. */
export function formatMonthLabel(month: string): string {
  return toDate(month).toLocaleString("en-SG", {
    month: "long",
    year: "numeric",
  });
}

/** `2025-10` → `October`, for labels that carry the year elsewhere. */
export function formatMonthName(month: string): string {
  return toDate(month).toLocaleString("en-SG", { month: "long" });
}
