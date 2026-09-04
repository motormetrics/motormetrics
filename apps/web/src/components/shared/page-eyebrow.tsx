import { cn } from "@heroui/react";
import { SharePill } from "@web/components/shared/share-pill";
import type { ReactNode } from "react";

/**
 * The opening row of every v3 overview: "Singapore car market ·" followed by
 * the page's control — a month menu, or a bold value where there is nothing
 * to choose — and the share pill hard right.
 *
 * The comps carry no visible title; `title` renders as a visually hidden `h1`
 * so the outline, the tab and the share text still name the page.
 */
export function PageEyebrow({
  className,
  control,
  section,
  title,
}: {
  className?: string;
  /** `MonthMenu`, or `EyebrowValue` for a fixed label. */
  control?: ReactNode;
  /** The dataset the page belongs to — "Singapore car market", "Cars · Makes". */
  section: string;
  title: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <h1 className="sr-only">{title}</h1>
      <span className="font-semibold text-base text-muted">{section} ·</span>
      {control}
      <div className="ml-auto">
        <SharePill title={title} />
      </div>
    </div>
  );
}

/** The bold accent value beside the section label, where no control is needed. */
export function EyebrowValue({ children }: { children: ReactNode }) {
  return (
    <span className="font-bold text-accent-strong text-base">{children}</span>
  );
}
