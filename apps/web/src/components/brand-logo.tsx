import { cn } from "@heroui/react";
import type { SVGProps } from "react";

/* The brand mark is drawn in fixed colours rather than theme tokens: the
   sheet documents the mark as it must appear, so it must not shift with the
   colour scheme the way the page chrome around it does. */
export const MARK_INK = "#16323F";
export const MARK_ACCENT = "#4E7C9B";
export const MARK_ACCENT_ON_DARK = "#9CC4DA";

const FIRST_ARCH = "M8 50 V30 a12 12 0 0 1 24 0 V50";
const SECOND_ARCH = "M32 50 V30 a12 12 0 0 1 24 0 V50";

type LogoMarkProps = Omit<SVGProps<SVGSVGElement>, "viewBox" | "fill"> & {
  size: number;
  first?: string;
  second?: string;
  strokeWidth?: number;
};

/**
 * A lowercase m drawn as two arches. One arch per word; the second takes the
 * accent. `first`/`second` exist for the on-dark, mono and "don't" variants.
 */
export function LogoMark({
  size,
  first = MARK_INK,
  second = MARK_ACCENT,
  strokeWidth = 7,
  ...props
}: LogoMarkProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 64 64"
      width={size}
      {...props}
    >
      <path
        d={FIRST_ARCH}
        stroke={first}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
      <path
        d={SECOND_ARCH}
        stroke={second}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

/**
 * The mark in its house squircle — the same shape the icon files carry,
 * drawn in code rather than loaded so the arches can take ink or white as
 * the theme requires. The nav and footer sit on the page ground, which the
 * tile also uses, so a separator-width edge holds the silhouette; the file
 * needs no edge, since it only ever lands on a surface that is not cream.
 * Radius is 23% of the frame and the arches 69% of it — 12px and 36px at
 * 52px, 7px and 21px at 30px, 15px and 44px at the 64px share-card size.
 */
export function LogoTile({
  size,
  strokeWidth,
}: {
  size: number;
  strokeWidth?: number;
}) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center border border-separator bg-background"
      style={{
        borderRadius: Math.round(size * 0.23),
        height: size,
        width: size,
      }}
    >
      <LogoMark
        first="currentColor"
        second="var(--accent)"
        size={Math.round(size * 0.69)}
        strokeWidth={strokeWidth}
      />
    </span>
  );
}

/**
 * The wordmark is a graphic: always lowercase, Urbanist 800, tracking
 * -0.03em, with "metrics" in the accent. Colours are fixed for the same
 * reason as the mark; `mono` drops the split for accent grounds.
 */
export function Wordmark({
  className,
  first = MARK_INK,
  second = MARK_ACCENT,
  mono = false,
}: {
  className?: string;
  first?: string;
  second?: string;
  mono?: boolean;
}) {
  return (
    <span
      className={cn(
        "font-extrabold leading-none tracking-[-0.03em]",
        className,
      )}
      style={{ color: first }}
    >
      motor
      <span style={{ color: mono ? first : second }}>metrics</span>
    </span>
  );
}
