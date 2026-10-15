import { Typography } from "@heroui/react";
import { SourceNote } from "@web/components/shared/overview";
import type { TrafficStats } from "@web/lib/posthog";

/**
 * The comp shows four audience figures under hairline rules. Only three of them
 * exist as measured numbers — the fourth in the comp is invented — so this runs
 * the three PostHog reports and leaves it there, as a ruled strip: three
 * across from md, stacked on phones.
 */
export function StatsSection({ stats }: { stats: TrafficStats }) {
  const items = [
    {
      label: "Page views in the last 30 days",
      value: stats.pageViews.toLocaleString("en-SG", {
        maximumFractionDigits: 0,
      }),
    },
    {
      label: "Unique readers, no account required",
      value: stats.uniqueVisitors.toLocaleString("en-SG", {
        maximumFractionDigits: 0,
      }),
    },
    {
      label: "Pages read per visitor, on average",
      value: stats.pagesPerVisitor.toLocaleString("en-SG", {
        maximumFractionDigits: 1,
      }),
    },
  ];

  return (
    <section className="flex scroll-mt-24 flex-col gap-2.5" id="stats">
      <div className="grid grid-cols-1 border-border border-t border-b border-b-separator md:grid-cols-3">
        {items.map(({ label, value }) => (
          <div
            className="flex min-w-0 flex-col gap-1.5 border-separator py-3 max-md:not-first:border-t md:not-first:border-l md:px-5 md:pt-4 md:pb-3.5 md:first:pl-0"
            key={label}
          >
            <span className="font-extrabold text-3xl tabular-nums leading-none tracking-tight md:text-4xl">
              {value}
            </span>
            <Typography.Paragraph
              className="text-muted-strong leading-snug"
              size="sm"
            >
              {label}
            </Typography.Paragraph>
          </div>
        ))}
      </div>
      <SourceNote>Source: site analytics, last 30 days.</SourceNote>
    </section>
  );
}
