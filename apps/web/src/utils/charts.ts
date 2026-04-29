import {
  formatCount,
  formatCurrency,
  formatGrowthRate,
  formatNumber,
  formatPercent,
  formatPercentage,
} from "@motormetrics/utils";

export {
  formatCount,
  formatGrowthRate,
  formatNumber,
  formatPercent,
  formatPercentage,
};

export const createDataFormatter = (
  formatType: "number" | "percentage" | "currency" | "count" | "growth",
) => {
  return (value: number) => {
    switch (formatType) {
      case "number":
        return formatNumber(value);
      case "percentage":
        return formatPercentage(value);
      case "currency":
        return formatCurrency(value);
      case "count":
        return formatCount(value);
      case "growth":
        return formatGrowthRate(value);
      default:
        return value.toString();
    }
  };
};

export const customTooltipFormatter = (
  value: number,
  name: string,
  formatType:
    | "number"
    | "percentage"
    | "currency"
    | "count"
    | "growth" = "number",
) => {
  const formatter = createDataFormatter(formatType);
  return [formatter(value), name];
};
