import Typography from "@web/components/typography";
import { Breadcrumbs } from "@web/components/v2/breadcrumbs";
import { SharePill } from "@web/components/v2/share-pill";
import type { ReactNode } from "react";

/**
 * Breadcrumb + eyebrow + oversized title, with an optional slot for the
 * controls the comps park on the right (month picker, range tabs). Every v2
 * Overview page opens with this exact block.
 *
 * The breadcrumb derives its trail from the pathname and the share pill from
 * the title, so neither needs threading through the eighteen call sites.
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
        <Breadcrumbs />
        <span className="font-semibold text-[var(--subtle)] text-sm">
          {eyebrow}
        </span>
        <Typography.H1 className="font-bold text-[2.75rem] leading-[1.05] tracking-[-0.02em] lg:text-[3.25rem]">
          {title}
        </Typography.H1>
      </div>
      <div className="ml-auto flex flex-wrap items-center gap-3">
        {controls}
        <SharePill title={title} />
      </div>
    </div>
  );
}
