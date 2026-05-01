"use client";

import { CHART_GRID, type ChartGrid } from "@web/components/charts/tokens";
import { CartesianGrid as RechartsCartesianGrid } from "recharts";

interface StandardCartesianGridProps {
  variant?: ChartGrid;
}

/**
 * Standardized CartesianGrid component with design system presets.
 *
 * @example
 * // Default grid with horizontal dashed lines
 * <StandardCartesianGrid />
 *
 * @example
 * // Minimal grid with no lines
 * <StandardCartesianGrid variant="minimal" />
 */
export function StandardCartesianGrid({
  variant = "default",
}: StandardCartesianGridProps) {
  const config = CHART_GRID[variant];

  if (variant === "minimal") {
    return null;
  }

  return (
    <RechartsCartesianGrid
      vertical={config.vertical}
      strokeDasharray={config.strokeDasharray}
      className={config.className}
    />
  );
}
