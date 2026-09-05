import { cn, Typography } from "@heroui/react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The v3 overview layout — the editorial rework of the bento in
 * `shared/bento.tsx`, and the overview-tier counterpart of `shared/report.tsx`.
 *
 * The v3 comps drop the cards altogether: every overview page is one column
 * of sections on the page background, ruled apart by hairlines, with each
 * section opening on the same eyebrow / heading / caption block and, where it
 * summarises a deeper page, an "All …" link hard right.
 *
 * Like `Report`, this owns the rhythm and not the width — every page shares
 * one measure, set on the shell in `(main)/layout.tsx`.
 */
export function OverviewPage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex w-full flex-col gap-14", className)}>
      {children}
    </div>
  );
}

/**
 * The two-up grid the comps use for paired sections. The 72px gutter is what
 * lets two 520-wide sparklines sit side by side without reading as one chart.
 */
export function OverviewGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 items-start gap-14 lg:grid-cols-2 lg:gap-x-[72px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** The hairline that separates one section from the next. */
export function Hairline({ className }: { className?: string }) {
  return <hr className={cn("h-px w-full border-0 bg-separator", className)} />;
}

/**
 * The block every section opens with: a small eyebrow naming the dataset, the
 * heading, a muted caption qualifying the figures, and an optional link out to
 * the page that carries the full data.
 *
 * `size` follows the comps: the page's main sections run the heading at 30px,
 * the paired half-width ones at 26px.
 */
export function SectionHead({
  caption,
  className,
  eyebrow,
  link,
  size = "md",
  title,
  trailing,
}: {
  caption?: ReactNode;
  className?: string;
  eyebrow: string;
  /** "All COE results", "All makes" — the text link to the full dataset. */
  link?: { href: string; label: string };
  size?: "md" | "lg";
  title: ReactNode;
  /** A control instead of a link — range pills, dimension tabs. */
  trailing?: ReactNode;
}) {
  return (
    <div className={cn("flex flex-wrap items-end gap-4", className)}>
      <div className="flex min-w-0 flex-col gap-1.5">
        <Typography.Paragraph className="font-semibold" color="muted" size="sm">
          {eyebrow}
        </Typography.Paragraph>
        <Typography.Heading
          className={cn(
            "font-bold tracking-tight",
            size === "lg" ? "text-[30px]" : "text-[26px]",
          )}
          level={2}
        >
          {title}
        </Typography.Heading>
        {caption ? (
          <Typography.Paragraph
            className="font-medium text-[15px]"
            color="muted"
            size="sm"
          >
            {caption}
          </Typography.Paragraph>
        ) : null}
      </div>
      {link ? <SectionLink href={link.href}>{link.label}</SectionLink> : null}
      {trailing ? (
        <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2 sm:ml-auto">
          {trailing}
        </div>
      ) : null}
    </div>
  );
}

/** The "All … ↗" text link, on its own where a block has no `SectionHead`. */
export function SectionLink({
  children,
  className,
  href,
}: {
  children: ReactNode;
  className?: string;
  href: string;
}) {
  return (
    <Link
      className={cn(
        "ml-auto inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap font-bold text-[15px] text-accent-strong no-underline transition-colors hover:text-accent-deep",
        className,
      )}
      href={href}
    >
      {children}
      <ArrowUpRight aria-hidden className="size-4" strokeWidth={2.25} />
    </Link>
  );
}

/**
 * The 72px headline figure with its change pill and the caption beneath —
 * the top of every v3 page. `label` sits above the figure at 20px, which is
 * what distinguishes it from `ReportHeadline`'s 16px label.
 */
export function Headline({
  caption,
  className,
  delta,
  label,
  size = "lg",
  value,
}: {
  caption?: ReactNode;
  className?: string;
  /** `DeltaChip`, or `CostTrendChip` where a rise is bad news. */
  delta?: ReactNode;
  label?: ReactNode;
  /** `lg` is the 72px page headline; `md` the 52–60px section figure. */
  size?: "lg" | "md";
  value: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {label ? (
        <Typography.Paragraph className="font-semibold text-muted-strong text-xl">
          {label}
        </Typography.Paragraph>
      ) : null}
      <div className="flex flex-wrap items-center gap-4">
        <span
          className={cn(
            "font-extrabold tabular-nums leading-none tracking-tight",
            size === "lg" ? "text-6xl lg:text-7xl" : "text-5xl lg:text-[52px]",
          )}
        >
          {value}
        </span>
        {delta}
      </div>
      {caption ? (
        <Typography.Paragraph className="text-pretty font-medium" color="muted">
          {caption}
        </Typography.Paragraph>
      ) : null}
    </div>
  );
}
