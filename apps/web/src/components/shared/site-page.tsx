import { cn } from "@heroui/react";
import type { ReactNode } from "react";

/**
 * The `(site)` pages — About, Advertise, Learn and the Learn guides.
 *
 * Spacing, not width: every page shares one measure, set on the shell in
 * `(main)/layout.tsx`. What this owns is the rhythm, which the comps set far
 * more loosely on these pages than on the dashboard — 56–72px between blocks
 * against 32px.
 */
export function SitePage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex w-full flex-col gap-16", className)}>
      {children}
    </div>
  );
}
