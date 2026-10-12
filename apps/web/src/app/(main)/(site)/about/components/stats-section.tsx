import { Typography } from "@heroui/react";
import { SourceNote } from "@web/components/shared/overview";

/**
 * Four figures as a ruled strip: four across from lg, two-by-two below, with
 * the rules following the layout.
 */
const stats = [
  { label: "Years of COE and registration history", value: "10+" },
  { label: "Car makes tracked every month", value: "50+" },
  { label: "COE bidding exercises analysed", value: "120+" },
  { label: "Monthly data points across every dataset", value: "10,000+" },
];

export function StatsSection() {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="grid grid-cols-2 border-border border-t border-b border-b-separator lg:grid-cols-4">
        {stats.map(({ label, value }) => (
          <div
            className="flex min-w-0 flex-col gap-1.5 border-separator px-3 pt-3 pb-2.5 first:pl-0 max-lg:nth-3:border-t max-lg:nth-4:border-t max-lg:even:border-l max-lg:odd:pl-0 md:px-5 md:pt-4 md:pb-3.5 lg:not-first:border-l"
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
      <SourceNote>Approximate counts across every dataset.</SourceNote>
    </div>
  );
}
