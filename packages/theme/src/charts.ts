/**
 * Chart Design Tokens
 *
 * Centralized chart tokens for consistent data visualisation across the application.
 */

/**
 * Chart height tokens for standardized chart sizing (3-tier system)
 */
export const CHART_HEIGHTS = {
  /** 64px - Sparklines and mini charts */
  sparkline: "h-16",
  /** 300px - Standard dashboard charts (most charts) */
  standard: "h-[300px]",
  /** 400px - Detailed charts with more data */
  tall: "h-[400px]",
} as const;

/**
 * Chart grid presets for consistent CartesianGrid styling
 */
export const CHART_GRID = {
  /** Default grid with horizontal dashed lines */
  default: {
    vertical: false,
    strokeDasharray: "3 3",
    className: "stroke-default-200",
  },
  /** Minimal grid with no lines */
  minimal: {
    vertical: false,
    horizontal: false,
    strokeDasharray: undefined,
    className: undefined,
  },
} as const;

/**
 * Chart tooltip cursor presets
 */
export const CHART_CURSOR = {
  /** Highlight cursor for bar/area charts */
  highlight: { fill: "var(--muted)", opacity: 0.2 },
  /** No cursor for line charts */
  none: false,
} as const;

/**
 * Chart margin presets for consistent chart layouts
 */
export const CHART_MARGINS = {
  /** Default margins for most charts */
  default: { top: 20, right: 20, left: 20, bottom: 20 },
  /** Extended margins for charts with legends */
  withLegend: { top: 20, right: 30, left: 20, bottom: 40 },
  /** Minimal margins for sparklines */
  minimal: { top: 5, right: 5, left: 5, bottom: 5 },
} as const;

/**
 * Chart colour constants for programmatic use
 */
export const CHART_COLOURS = [
  "hsl(240 64% 27%)", // chart-1 - Navy Blue
  "hsl(220 51% 37%)", // chart-2 - Medium Blue
  "hsl(220 41% 49%)", // chart-3 - Light Blue
  "hsl(210 14% 53%)", // chart-4 - Slate Gray
  "hsl(215 23% 65%)", // chart-5 - Light Slate
  "hsl(212 17% 76%)", // chart-6 - Pale Slate
] as const;

/**
 * Type exports for type safety
 */
export type ChartHeight = keyof typeof CHART_HEIGHTS;
export type ChartMargin = keyof typeof CHART_MARGINS;
export type ChartGrid = keyof typeof CHART_GRID;
export type ChartCursor = keyof typeof CHART_CURSOR;
