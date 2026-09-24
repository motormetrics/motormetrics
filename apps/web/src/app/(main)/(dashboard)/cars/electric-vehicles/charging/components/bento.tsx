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
