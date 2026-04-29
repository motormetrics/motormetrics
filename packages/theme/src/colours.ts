/**
 * Brand Colour Constants
 *
 * Programmatic access to the Navy Blue professional colour scheme.
 * For CSS variable usage, import light.css or dark.css instead.
 */

export const COLOURS = {
  primary: "hsl(240 63% 27%)", // Navy Blue #191970
  primaryForeground: "hsl(0 0% 100%)",
  secondary: "hsl(210 13% 50%)", // Slate Gray #708090
  secondaryForeground: "hsl(0 0% 100%)",
  accent: "hsl(220 40% 49%)", // Steel Blue #4A6AAE
  accentForeground: "hsl(0 0% 100%)",
  background: "hsl(213 32% 95%)", // Light blue-gray #F0F4F8
  foreground: "hsl(220 15% 20%)",
  destructive: "hsl(0 72% 51%)", // #DC2626
  success: "hsl(142 71% 45%)", // #22C55E
  border: "hsl(214 32% 91%)", // #E2E8F0
} as const;

export const SURFACE = {
  surface1: "hsl(0 0% 100%)",
  surface2: "hsl(213 32% 97%)",
  surface3: "hsl(213 32% 95%)",
} as const;
