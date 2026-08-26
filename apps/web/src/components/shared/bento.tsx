import { cn } from "@heroui/react";
import type { ReactNode } from "react";

/**
 * The v2 Overview bento: a 430 / fluid / 400 three-column grid in the comps.
 *
 * Reproduced as one column on small screens, two from `xl` (the rail drops
 * full-width beneath the data columns) and three from `2xl`. The comps are
 * drawn at 1560px, so three columns only fit once the viewport is close to it.
 */
export function Bento({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 items-start gap-6 xl:grid-cols-2 2xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)_minmax(0,380px)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** A stacked column within the bento. */
export function BentoColumn({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-col gap-6", className)}>{children}</div>;
}

/** White bento card — the default surface for a data block. */
export function SurfaceCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 rounded-4xl bg-surface p-8 shadow-surface",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Warm sand well holding the right-hand rail. Spans both data columns at `xl`,
 * where there is no third column to sit in.
 *
 * Exported as a class string as well, for the places where the rail has to be
 * an existing wrapper — the dashboard rail is an `AnimatedGrid`, which owns the
 * stagger context and so cannot be nested inside another element.
 */
export const RAIL_CLASS =
  "flex flex-col gap-6 rounded-4xl bg-default p-6 shadow-surface xl:col-span-2 xl:p-8 2xl:col-span-1";

export function Rail({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn(RAIL_CLASS, className)}>{children}</div>;
}

/** Dark feature panel — one per page, always the rail's closing block. */
export function InkPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-4xl bg-foreground p-7",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Gradient hero card leading the left column. The gradient is a token rather
 * than a utility because Tailwind cannot express the comp's radial stop list.
 */
export function HeroCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-4xl p-8 text-accent-foreground shadow-surface",
        className,
      )}
      style={{ background: "var(--accent-gradient)" }}
    >
      {children}
    </div>
  );
}
