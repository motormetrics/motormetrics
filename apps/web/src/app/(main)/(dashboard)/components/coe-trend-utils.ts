export type Trend = "up" | "down" | "neutral";

export const calculateTrend = (current: number, previous: number): Trend => {
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "neutral";
};

export const calculateChangePercent = (
  current: number,
  previous: number,
): string => {
  if (previous === 0) return "0.0%";
  const change = ((current - previous) / previous) * 100;
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
};
