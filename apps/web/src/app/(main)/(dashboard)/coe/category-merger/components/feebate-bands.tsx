import { cn, Typography } from "@heroui/react";
import {
  type FeebateBand,
  formatAdjustment,
} from "@web/app/(main)/(dashboard)/coe/category-merger/utils/proposal";
import {
  ReportCell,
  ReportRow,
  ReportTable,
} from "@web/components/shared/report-table";

/** Green for a rebate, red for a surcharge; the full $15,000 gets the solid tone. */
const bandTone = (adjustment: number): string => {
  if (adjustment === 0) {
    return "bg-default text-foreground";
  }
  const isFull = Math.abs(adjustment) >= 15_000;
  if (adjustment < 0) {
    return isFull
      ? "bg-success text-success-foreground"
      : "bg-success-soft text-success-soft-foreground";
  }
  return isFull
    ? "bg-danger text-danger-foreground"
    : "bg-danger-soft text-danger-soft-foreground";
};

const shareWhere = (
  bands: FeebateBand[],
  match: (adjustment: number) => boolean,
) =>
  bands
    .filter(({ adjustment }) => match(adjustment))
    .reduce((total, { share }) => total + share, 0);

/** "+$15k", "−$7.5k", "$0": short enough to sit on the narrowest band. */
const formatShortAdjustment = (adjustment: number): string => {
  if (adjustment === 0) {
    return "$0";
  }
  const sign = adjustment < 0 ? "−" : "+";
  return `${sign}$${Math.abs(adjustment) / 1000}k`;
};

/** The neutral band still needs a sliver of bar to read as a band. */
const NEUTRAL_HEIGHT = 4;

/**
 * Every band drawn on one zero line: its width is the share of 2025's
 * registrations it covers, and its height the rebate (below) or surcharge
 * (above), so how many buyers get what reads off a single shape.
 */
function BandShare({ bands }: { bands: FeebateBand[] }) {
  const rebate = shareWhere(bands, (adjustment) => adjustment < 0);
  const neutral = shareWhere(bands, (adjustment) => adjustment === 0);
  const surcharge = shareWhere(bands, (adjustment) => adjustment > 0);
  const summary = `${rebate}% of 2025 registrations would get a rebate, ${neutral}% no adjustment and ${surcharge}% a surcharge.`;
  const largest = Math.max(
    ...bands.map(({ adjustment }) => Math.abs(adjustment)),
    1,
  );

  return (
    <div className="flex flex-col gap-2">
      <div aria-label={summary} className="flex h-56 w-full gap-0.5" role="img">
        {bands.map(({ adjustment, band, share }) => {
          const height =
            adjustment === 0
              ? NEUTRAL_HEIGHT
              : (Math.abs(adjustment) / largest) * 100;
          const bar = (
            <div
              className={cn(
                "flex w-full items-center justify-center font-bold text-xs tabular-nums",
                adjustment < 0 ? "rounded-b-md" : "rounded-t-md",
                // The table's neutral tone vanishes against the page as a
                // 4% sliver, so the zero band gets a darker one here.
                adjustment === 0 ? "bg-muted/50" : bandTone(adjustment),
              )}
              style={{ height: `${height}%` }}
            >
              {/* A 10% band is about 34px on a phone, too narrow for the
                  figure; the table below still carries it. */}
              {adjustment === 0 ? null : (
                <span className={share < 15 ? "hidden sm:inline" : undefined}>
                  {formatShortAdjustment(adjustment)}
                </span>
              )}
            </div>
          );
          const label = (
            <div className="flex flex-col items-center gap-0.5 px-1 py-2 text-center text-xs tabular-nums">
              <span className="font-bold">{share}%</span>
              <span className="hidden text-muted sm:inline">Band {band}</span>
              {adjustment === 0 ? <span className="text-muted">$0</span> : null}
            </div>
          );

          // Labels sit across the zero line from their bar, so the bar keeps
          // its full height for the figure.
          return (
            <div
              className="flex min-w-0 flex-col"
              key={band}
              style={{ width: `${share}%` }}
            >
              <div className="flex h-1/2 flex-col justify-end border-border border-b">
                {adjustment > 0 ? bar : adjustment < 0 ? label : null}
                {adjustment === 0 ? bar : null}
              </div>
              <div className="flex h-1/2 flex-col justify-start">
                {adjustment < 0 ? bar : label}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-muted text-xs">
        <span>Lower-value models</span>
        <span>Higher-value models</span>
      </div>
      <Typography.Paragraph color="muted" size="sm">
        {summary}
      </Typography.Paragraph>
    </div>
  );
}

/** One of LTA's two band options, as the paper tabulates it. */
export function FeebateBands({
  bands,
  title,
}: {
  bands: FeebateBand[];
  title: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Typography.Heading level={3}>{title}</Typography.Heading>
      <BandShare bands={bands} />
      <ReportTable
        columns={[
          { label: "Band" },
          { label: "Adjustment" },
          { label: "OMV percentile" },
          { label: "Typical models (LTA, non-exhaustive)" },
        ]}
      >
        {bands.map(({ adjustment, band, models, percentile }) => (
          <ReportRow key={band}>
            <ReportCell className="font-semibold">{band}</ReportCell>
            <ReportCell className="whitespace-nowrap font-semibold">
              {formatAdjustment(adjustment)}
            </ReportCell>
            <ReportCell className="whitespace-nowrap text-muted">
              {percentile}
            </ReportCell>
            {/* Wraps rather than widening the scroll: a dozen model names on
                one line would push the table past 1,000px. */}
            <ReportCell className="min-w-72 max-w-xl whitespace-normal text-muted">
              {models.join(", ")}
            </ReportCell>
          </ReportRow>
        ))}
      </ReportTable>
    </div>
  );
}
