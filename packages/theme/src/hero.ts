import { heroui } from "@heroui/react";

/**
 * Professional colour scheme for automotive data visualisation (Issue #406)
 *
 * Primary: Navy Blue (#191970) - Headers, footers, primary buttons, key accents
 * Secondary: Slate Gray (#708090) - Card containers, borders, secondary buttons
 * Accent: Steel Blue (#4A6AAE) - Links, highlights, interactive elements
 * Success: Green (#22C55E) - Positive trends, confirmations
 * Foreground: Dark Slate Gray (#2F4F4F) - Body text, icons
 */
export default heroui({
  themes: {
    light: {
      colors: {
        background: "#F0F4F8", // Light blue-gray (matches preview design)
        foreground: "#2F4F4F", // Dark Slate Gray
        divider: "#E2E8F0",
        focus: "#191970", // Navy Blue
        content1: "#FFFFFF", // Cards, panels
        content2: "#F8FAFC",
        content3: "#F1F5F9",
        content4: "#E2E8F0",
        default: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
          foreground: "#2F4F4F",
          DEFAULT: "#E2E8F0",
        },
        primary: {
          50: "#E8E8F4",
          100: "#D1D1E9",
          200: "#A3A3D3",
          300: "#7575BD",
          400: "#4747A7",
          500: "#191970", // Navy Blue
          600: "#14145A",
          700: "#0F0F43",
          800: "#0A0A2D",
          900: "#050516",
          foreground: "#FFFFFF",
          DEFAULT: "#191970",
        },
        secondary: {
          50: "#F1F5F9",
          100: "#E2E8F0",
          200: "#CBD5E1",
          300: "#94A3B8",
          400: "#708090", // Slate Gray
          500: "#708090",
          600: "#5A6A7A",
          700: "#475569",
          800: "#334155",
          900: "#1E293B",
          foreground: "#FFFFFF",
          DEFAULT: "#708090",
        },
        success: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          300: "#86EFAC",
          400: "#4ADE80",
          500: "#22C55E", // Green
          600: "#16A34A",
          700: "#15803D",
          800: "#166534",
          900: "#14532D",
          foreground: "#FFFFFF",
          DEFAULT: "#22C55E",
        },
        warning: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
          foreground: "#FFFFFF",
          DEFAULT: "#F59E0B",
        },
        danger: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          300: "#FCA5A5",
          400: "#F87171",
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C",
          800: "#991B1B",
          900: "#7F1D1D",
          foreground: "#FFFFFF",
          DEFAULT: "#DC2626",
        },
      },
    },
  },
});
