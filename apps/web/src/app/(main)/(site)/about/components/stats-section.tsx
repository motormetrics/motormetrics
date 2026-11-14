import { Typography } from "@heroui/react";

const stats = [
  { label: "Years of COE and registration history", value: "10+" },
  { label: "Car makes tracked every month", value: "50+" },
  { label: "COE bidding exercises analysed", value: "390+" },
  { label: "Monthly data points across every dataset", value: "10,000+" },
];

const sections = [
  { href: "#what-we-do", label: "What we do" },
  { href: "#what-we-track", label: "What we track" },
  { href: "#data-source", label: "Where the data comes from" },
  { href: "#faq", label: "Common questions" },
];

/**
 * The key numbers beside the page head, with the jump links to each section
 * under them. They sit in their own column of the head grid, so on a wide
 * page they start level with the title.
 */
export function StatsSection() {
  return (
    <aside aria-label="Key numbers" className="flex flex-col gap-3">
      <Typography.Paragraph
        className="uppercase"
        color="muted"
        size="xs"
        weight="semibold"
      >
        Key numbers
      </Typography.Paragraph>
      {/* Four across, under the head or in its right half. */}
      <dl className="grid @3xl:grid-cols-4 grid-cols-2 gap-x-6 border-separator border-t">
        {stats.map(({ label, value }) => (
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
        Approximate counts across every dataset.
      </Typography.Paragraph>
    </aside>
  );
}
