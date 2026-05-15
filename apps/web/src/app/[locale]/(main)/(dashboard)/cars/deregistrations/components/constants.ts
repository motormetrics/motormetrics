// Category constants
export const DEREGISTRATION_CATEGORIES = [
  "Category A",
  "Category B",
  "Category C",
  "Category D",
  "Vehicles Exempted From VQS",
  "Taxis",
] as const;

export type DeregistrationCategory = (typeof DEREGISTRATION_CATEGORIES)[number];

// Shared interfaces
export interface CategoryWithPercentage {
  category: string;
  total: number;
  percentage: number;
  colour: string;
}

// Shared transformation functions
export const toPercentageDistribution = (
  data: { category: string; total: number }[],
): CategoryWithPercentage[] => {
  const grandTotal = data.reduce((sum, item) => sum + item.total, 0);

  return data.map((item, index) => ({
    ...item,
    percentage: grandTotal > 0 ? (item.total / grandTotal) * 100 : 0,
    colour: `var(--chart-${index + 1})`,
  }));
};
