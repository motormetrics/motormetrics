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
 *
 * `eyebrow` and `sub` are the Hybrid comps' framing: a small uppercase label
 * naming the dataset above the title, and a muted line under it for the date
 * and source. `sub` takes a node so a page can stream it in its own Suspense.
 */
export function PageHead({
  badge,
  controls,
  description,
  eyebrow,
  sub,
  title,
}: {
  /** Status chip rendered beside the title, e.g. a "Beta" marker. */
  badge?: ReactNode;
  controls?: ReactNode;
  /** Lede paragraph. Report-family pages set it; bento-family pages omit it. */
  description?: string;
  /** Uppercase label above the title, e.g. "Certificate of Entitlement". */
  eyebrow?: string;
  /** Muted line under the title, usually the period and the source. */
  sub?: ReactNode;
  title: string;
}) {
  return (
    <div className="flex flex-wrap items-end gap-6">
      <div className={cn("flex flex-col gap-2", description && "max-w-prose")}>
        {eyebrow ? (
          <Typography.Paragraph
            className="text-xs uppercase tracking-[0.06em]"
            weight="semibold"
            color="muted"
          >
            {eyebrow}
          </Typography.Paragraph>
        ) : null}
        <div className="flex flex-wrap items-center gap-4">
          <Typography.Heading level={1}>{title}</Typography.Heading>
          {badge}
        </div>
        {/* A div, not a paragraph: a streamed `sub` may fall back to a block
            skeleton. */}
        {sub ? <div className="text-[13.5px] text-muted">{sub}</div> : null}
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
