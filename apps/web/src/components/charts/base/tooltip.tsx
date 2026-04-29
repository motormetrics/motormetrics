"use client";

import { CHART_CURSOR, type ChartCursor } from "@motormetrics/theme/charts";
import {
  ChartTooltip,
  ChartTooltipContent,
} from "@motormetrics/ui/components/chart";
import type { ComponentProps } from "react";

type ChartTooltipContentProps = ComponentProps<typeof ChartTooltipContent>;

interface StandardTooltipProps {
  /** Cursor variant - "highlight" for bar/area charts, "none" for line charts */
  cursorVariant?: ChartCursor;
  /** Pass through props to ChartTooltipContent */
  contentProps?: ChartTooltipContentProps;
}

/**
 * Standardized Tooltip component with design system cursor presets.
 *
 * @example
 * // Highlight cursor for bar/area charts (default)
 * <StandardTooltip />
 *
 * @example
 * // No cursor for line charts
 * <StandardTooltip cursorVariant="none" />
 *
 * @example
 * // With custom content props
 * <StandardTooltip contentProps={{ hideLabel: true }} />
 */
export function StandardTooltip({
  cursorVariant = "highlight",
  contentProps,
}: StandardTooltipProps) {
  return (
    <ChartTooltip
      cursor={CHART_CURSOR[cursorVariant]}
      content={<ChartTooltipContent {...contentProps} />}
    />
  );
}
