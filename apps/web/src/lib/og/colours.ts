/**
 * Share-card colour tokens (Satori-compatible hex values).
 *
 * Satori (the library behind next/og) doesn't support CSS variables, so the
 * HeroUI Glass light values the site resolves to are written out directly.
 */
export const OG_COLOURS = {
  /** Page background (`--background`) */
  background: "#F4F5F7",

  /** Primary text (`--foreground`) */
  ink: "#18181B",

  /** Secondary text, labels and axis captions (`--muted`) */
  muted: "#71717A",

  /** Wordmark ink — the first arch and "motor" (MARK_INK) */
  inkDeep: "#2B2E31",

  /** Slate highlight for series and the "metrics" wordmark (`--chart-2`) */
  accent: "#57768C",

  /** Text on an accent fill */
  onAccent: "#FFFFFF",

  /** Accent at 9%, for decorative washes */
  accentWash: "rgba(87,118,140,0.09)",

  /** Neutral pill and bar fill (`--default`) */
  accentSoft: "#EBEBEC",

  /** Secondary bar fill (`--chart-5`) */
  accentMuted: "#8CB4D1",

  /** Dividers and bar tracks (`--border`) */
  rule: "#DEDEE0",

  /** White tiles (`--surface`) */
  surface: "#FFFFFF",

  /** Tile shadow */
  tileShadow: "0 3px 12px rgba(24,24,27,0.06)",

  /** Delta chip, value went up (`--warning` / `--warning-foreground`) */
  upBackground: "#F5A524",
  upForeground: "#18181B",

  /** Delta chip, value went down (`--success` / `--success-foreground`) */
  downBackground: "#17C964",
  downForeground: "#18181B",

  /** Fuel mix series, matching the site's fuel-type colours */
  fuel: {
    petrol: "#C9B88F",
    electric: "#6E95B0",
    hybrid: "#41596A",
    diesel: "#71717A",
  },
} as const;
