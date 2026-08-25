import Typography from "@web/components/typography";
import type { ReactNode } from "react";

/**
 * Eyebrow + oversized title, with an optional slot for the controls the comps
 * park on the right (month picker, range tabs, share). Every v2 Overview page
 * opens with this exact block.
 */
export function PageHead({
  controls,
  eyebrow,
  title,
}: {
  controls?: ReactNode;
  eyebrow: ReactNode;
  title: string;
}) {
  return (
    <div className="flex flex-wrap items-end gap-6">
      <div className="flex flex-col gap-2">
        <span className="font-semibold text-[var(--subtle)] text-sm">
          {eyebrow}
        </span>
        <Typography.H1 className="font-bold text-[2.75rem] leading-[1.05] tracking-[-0.02em] lg:text-[3.25rem]">
          {title}
        </Typography.H1>
      </div>
      {controls ? (
        <div className="ml-auto flex flex-wrap items-center gap-3">
          {controls}
        </div>
      ) : null}
    </div>
  );
}
