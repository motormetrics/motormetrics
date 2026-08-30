import { Typography } from "@heroui/react";

interface TrafficStats {
  uniqueVisitors: number;
  pageViews: number;
  pagesPerVisitor: number;
}

/**
 * The comp shows four audience figures under hairline rules. Only three of them
 * exist as measured numbers — the fourth in the comp is invented — so this runs
 * the three PostHog reports and leaves it there.
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
    <section className="grid scroll-mt-24 gap-6 sm:grid-cols-3" id="stats">
      {items.map(({ label, value }) => (
        <div
          className="flex flex-col gap-1.5 border-border border-t-2 pt-7"
          key={label}
        >
          <span className="font-extrabold text-4xl text-foreground tabular-nums leading-none tracking-tight lg:text-5xl">
            {value}
          </span>
          <Typography.Paragraph color="muted" size="sm">
            {label}
          </Typography.Paragraph>
        </div>
      ))}
    </section>
  );
}
