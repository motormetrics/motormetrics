/**
 * Display date for posts and guides: `3 Oct 2025`, or `3 Oct` with `"short"`.
 */
export const formatDate = (
  date: Date,
  format: "short" | "full" = "full",
): string => {
  const options: Intl.DateTimeFormatOptions =
    format === "full"
      ? { year: "numeric", month: "short", day: "numeric" }
      : { month: "short", day: "numeric" };

  return new Date(date).toLocaleDateString("en-SG", options);
};
