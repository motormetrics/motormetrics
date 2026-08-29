import { cn } from "@heroui/react";
import Typography from "@web/components/typography";
import type { ReactNode } from "react";

/**
 * The v2 report layout — the editorial counterpart to `shared/bento.tsx`.
 *
 * The comps draw two distinct page families. Overview-tier pages use the bento:
 * a three-column grid of rounded cards. Every detail page instead uses a plain
 * column with no cards at all, where hairline rules do the work the card edges
 * do in the bento. This module is that second family.
 *
 * It owns the column's rhythm, not its width — every page shares one measure,
 * set on the shell in `(main)/layout.tsx`.
 */
export function Report({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex w-full flex-col gap-8", className)}>
      {children}
    </div>
  );
}

/**
 * The controls strip beneath the page head, ruled top and bottom.
 *
 * The comps put the primary dimension on the left as bare pills and a secondary
 * one on the right as a segmented group on sand. Both are passed in rather than
 * built here — every page filters on something different, and the tab controls
 * are already client components bound to their own search params.
 */
export function ReportFilterBar({
  children,
  className,
  label,
  trailing,
  trailingLabel,
}: {
  children: ReactNode;
  className?: string;
  /** Uppercase label naming what the left-hand control filters on. */
  label: string;
  /** Optional right-aligned control — a range or measure switch in the comps. */
  trailing?: ReactNode;
  trailingLabel?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-4 border-border border-y py-4",
        className,
      )}
    >
      <ReportEyebrow>{label}</ReportEyebrow>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
      {trailing ? (
        <div className="ml-auto flex flex-wrap items-center gap-3">
          {trailingLabel ? (
            <ReportEyebrow>{trailingLabel}</ReportEyebrow>
          ) : null}
          {trailing}
        </div>
      ) : null}
    </div>
  );
}

/**
 * The small caps label the comps use to name a control or a column group.
 * Exported because the filter bar is not the only place they appear.
 */
export function ReportEyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-bold text-muted text-xs uppercase tracking-wider",
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * The headline figure and the stat cells beside it.
 *
 * Unlike the bento hero, which is a card, this sits directly on the page
 * background — the figure is the only emphasis, which is why it runs to 72px
 * with no surface behind it.
 */
export function ReportHeadline({
  className,
  delta,
  label,
  stats,
  sub,
  value,
}: {
  className?: string;
  /** Signed-change pill — pass `DeltaChip`, or `CostTrendChip` where a rise is bad news. */
  delta?: ReactNode;
  label: string;
  /** `ReportStat` cells, rendered hard right. */
  stats?: ReactNode;
  sub?: string;
  value: ReactNode;
}) {
  return (
    <div className={cn("flex flex-wrap items-end gap-12", className)}>
      <div className="flex flex-col gap-2">
        <Typography.Text className="text-muted-strong">{label}</Typography.Text>
        <div className="flex items-center gap-4">
          <span className="font-extrabold text-6xl tabular-nums leading-none tracking-tight lg:text-7xl">
            {value}
          </span>
          {delta}
        </div>
        {sub ? <Typography.TextSm>{sub}</Typography.TextSm> : null}
      </div>
      {stats ? <div className="ml-auto flex flex-wrap">{stats}</div> : null}
    </div>
  );
}

/** One rule-divided cell in a `ReportHeadline`'s stat group. */
export function ReportStat({
  label,
  note,
  value,
}: {
  label: string;
  note?: string;
  value: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 border-border border-l px-6">
      <span className="font-semibold text-muted text-sm">{label}</span>
      <span className="font-extrabold text-2xl tabular-nums tracking-tight">
        {value}
      </span>
      {note ? (
        <span className="font-medium text-muted text-xs">{note}</span>
      ) : null}
    </div>
  );
}

/**
 * A titled block — the comps run several down each detail page, each opening
 * with a heading and a muted caption qualifying the figures beneath it.
 */
export function ReportSection({
  caption,
  children,
  className,
  title,
}: {
  caption?: string;
  children: ReactNode;
  className?: string;
  title: string;
}) {
  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-wrap items-baseline gap-4">
        <Typography.H2>{title}</Typography.H2>
        {caption ? <Typography.Text>{caption}</Typography.Text> : null}
      </div>
      {children}
    </section>
  );
}
