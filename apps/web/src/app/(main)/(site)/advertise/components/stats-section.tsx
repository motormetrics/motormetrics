import { Typography } from "@heroui/react";
import type { TrafficStats } from "@web/lib/posthog";

const sections = [
  { href: "#audience", label: "Who reads this" },
  { href: "#placements", label: "Placements" },
  { href: "#pricing", label: "Packages" },
  { href: "#contact", label: "Book a placement" },
];

/**
 * The key numbers beside the page head, with the jump links to each section
 * under them. The comp's audience figures are placeholders; these are the
 * three measured PostHog reports, so there are three and not four.
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
    <aside aria-label="Key numbers" className="flex flex-col gap-3">
      <Typography.Paragraph
        className="uppercase"
        color="muted"
        size="xs"
        weight="semibold"
      >
        Key numbers · audience
      </Typography.Paragraph>
      <dl className="grid @3xl:grid-cols-3 grid-cols-2 gap-x-6 border-separator border-t">
        {items.map(({ label, value }) => (
          <div
            className="flex flex-col gap-0.5 border-separator border-b py-3"
            key={label}
          >
            <dt className="font-semibold text-muted text-xs">{label}</dt>
            <dd className="font-semibold text-xl tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      <nav aria-label="On this page">
        <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
          {sections.map(({ href, label }) => (
            <li key={href}>
              <a className="font-medium text-accent-strong" href={href}>
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <Typography.Paragraph color="muted" size="xs">
        Source: site analytics, last 30 days.
      </Typography.Paragraph>
    </aside>
  );
}
