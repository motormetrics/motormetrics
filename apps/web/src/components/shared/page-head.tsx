import { cn } from "@heroui/react";
import { Breadcrumbs } from "@web/components/shared/breadcrumbs";
import { SharePill } from "@web/components/shared/share-pill";
import Typography from "@web/components/typography";
import type { ReactNode } from "react";

/**
 * Breadcrumb + oversized title, with an optional slot for the controls the
 * comps park on the right (month picker, range tabs). Every v2 page opens with
 * this exact block.
 *
 * The breadcrumb derives its trail from the pathname and the share pill from
 * the title, so neither needs threading through the call sites.
 *
 * `description` is the lede the report-family comps carry under the title and
 * the bento-family ones do not — passing it is what distinguishes the two
 * openings. The comps set the title two pixels apart between families (50 vs
 * 52); that is below the threshold worth a variant, so both use one scale.
 */
export function PageHead({
  controls,
  description,
  title,
}: {
  controls?: ReactNode;
  /** Lede paragraph. Report-family pages set it; bento-family pages omit it. */
  description?: string;
  title: string;
}) {
  return (
    <div className="flex flex-wrap items-end gap-6">
      <div
        className={cn("flex flex-col gap-2", description && "max-w-[41rem]")}
      >
        <Breadcrumbs />
        <Typography.H1 className="font-bold text-[2.75rem] leading-[1.05] tracking-[-0.02em] lg:text-[3.25rem]">
          {title}
        </Typography.H1>
        {description ? (
          <Typography.TextLg className="font-medium text-[1.0625rem] text-muted leading-normal">
            {description}
          </Typography.TextLg>
        ) : null}
      </div>
      <div className="ml-auto flex flex-wrap items-center gap-3">
        {controls}
        <SharePill title={title} />
      </div>
    </div>
  );
}
