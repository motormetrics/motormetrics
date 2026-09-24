import { cn } from "@heroui/react";
import type { ReactNode } from "react";

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
