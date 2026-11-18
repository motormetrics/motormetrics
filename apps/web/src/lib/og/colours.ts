/**
 * Share-card colour tokens (Satori-compatible hex values).
 *
 * Satori (the library behind next/og) doesn't support CSS variables, so the
 * values from the "Social Images" design comp are written out directly.
 */
export const OG_COLOURS = {
  /** Card background */
  background: "#F5F5F5",

  /** Primary ink */
  ink: "#18181B",

  /** Body copy */
  muted: "#52525B",

  /** Labels and captions */
  subtle: "#71717A",

  /** Axis labels and hairline text */
  faint: "#A1A1AA",

  /** Fuel mix legend labels */
  label: "#3F3F46",

  /** Wordmark ink and the outer bars of the mark */
  inkDeep: "#062F5C",

  /** Deep Blue accent */
  accent: "#0961BB",

  /** Ink on an accent fill */
  onAccent: "#FFFFFF",

  /** Accent at 9%, for decorative washes */
  accentWash: "rgba(9,97,187,0.09)",

  /** Soft accent pill background */
  accentSoft: "#E3EEFA",

  /** Soft accent pill text */
  accentDeep: "#074A8F",

  /** Secondary bar fill */
  accentMuted: "#B5D2F1",

  /** Dividers and bar tracks */
  rule: "#E4E4E7",

  /** White tiles */
  surface: "#FFFFFF",

  /** Tile shadow */
  tileShadow: "0 3px 12px rgba(0,0,0,0.06)",

  /** Delta chip, value went up */
  upBackground: "#FBEBD3",
  upForeground: "#96601C",

  /** Delta chip, value went down */
  downBackground: "#DFF1DF",
  downForeground: "#2F6B3A",

  /** Fuel mix series: petrol, electric, hybrid, diesel */
  fuel: {
    petrol: "#D4D4D8",
    electric: "#0961BB",
    hybrid: "#5E9BDC",
    diesel: "#062F5C",
  },
} as const;
