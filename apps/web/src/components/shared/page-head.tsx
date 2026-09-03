import { cn, Typography } from "@heroui/react";
import { SharePill } from "@web/components/shared/share-pill";
import type { ReactNode } from "react";

/**
 * Oversized title, with an optional slot for the controls the comps park on
 * the right (month picker, range tabs). Every v2 page opens with this exact
 * block.
 *
 * The share pill derives its text from the title, so it needs no threading
 * through the call sites.
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
      <div className={cn("flex flex-col gap-2", description && "max-w-prose")}>
        <Typography.Heading level={1}>{title}</Typography.Heading>
        {description ? (
          <Typography.Paragraph color="muted">
            {description}
          </Typography.Paragraph>
        ) : null}
      </div>
      {/* `min-w-0` so a control wider than the phone — the COE range tabs run
          to 452px — clips into its own scroll area instead of stretching the
          page. */}
      <div className="flex min-w-0 max-w-full flex-wrap items-center gap-3 sm:ml-auto">
        {controls}
        <SharePill title={title} />
      </div>
    </div>
  );
}
