import { Chip, ProgressBar, Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import type { ReactNode } from "react";

/** Where a figure sits in the range of the window it closes. */
export interface RangeSummary {
  current: number;
  high: number;
  low: number;
  /** "Highest in 12 months", "Lowest in 20 years" or "8.4% below the high". */
  where: string;
}

const formatCount = (value: number) => value.toLocaleString("en-SG");

/**
 * Places `current` in the range of `values`, which should include it. `span`
 * names the window for the extremes, e.g. "12 months".
 */
export function rangeSummary(
  values: readonly number[],
  current: number,
  span: string,
): RangeSummary | null {
  if (values.length === 0) {
    return null;
  }

  const low = Math.min(...values, current);
  const high = Math.max(...values, current);

  let where = `${(((high - current) / high) * 100).toFixed(1)}% below the high`;
  if (current === high) {
    where = `Highest in ${span}`;
  } else if (current === low) {
    where = `Lowest in ${span}`;
  }

  return { current, high, low, where };
}

/** "+3.2% · +140 vs July", with true minus signs. */
export function changeLabel(
  current: number,
  previous: number,
  against: string,
) {
  const difference = current - previous;
  const sign = difference < 0 ? "−" : "+";
  const percent =
    previous > 0
      ? `${sign}${Math.abs((difference / previous) * 100).toFixed(1)}%`
      : "—";

  return `${percent} · ${sign}${formatCount(Math.abs(difference))} vs ${against}`;
}

/**
 * Direction D's "range" hero: the figure the page answers with, its change as
 * a neutral pill, and a bar placing it between the low and high of the window
 * it closes. Sized as a KPI rather than a giant headline number.
 */
export function RangeHero({
  change,
  context,
  label,
  period,
  range,
  span,
}: {
  change?: string;
  /** A muted line under the bar. */
  context?: ReactNode;
  label: string;
  period: string;
  range: RangeSummary;
  /** "12-month", "24-month", "20-year": the adjective for the low. */
  span: string;
}) {
  return (
    <div className="flex max-w-xl flex-col gap-2.5 border-border border-t pt-4">
      <Typography.Paragraph color="muted" size="sm">
        <span className="font-semibold text-foreground">{label}</span> ·{" "}
        {period}
      </Typography.Paragraph>
      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
        <span className="font-extrabold text-4xl tabular-nums leading-none tracking-tight">
          <NumberValue
            locale="en-SG"
            maximumFractionDigits={0}
            value={range.current}
          />
        </span>
        {change ? (
          <Chip className="tabular-nums" color="accent" variant="soft">
            {change}
          </Chip>
        ) : null}
      </div>
      <ProgressBar
        aria-label={`Against the ${span} range: low ${formatCount(range.low)}, high ${formatCount(range.high)}, now ${formatCount(range.current)}. ${range.where}.`}
        className="gap-2"
        maxValue={range.high}
        minValue={range.low}
        size="sm"
        value={range.current}
      >
        <ProgressBar.Track className="col-span-full">
          <ProgressBar.Fill />
        </ProgressBar.Track>
        <span className="col-span-full flex justify-between gap-3 text-muted text-xs tabular-nums">
          <span>
            {span} low {formatCount(range.low)}
          </span>
          <span className="font-semibold text-foreground">{range.where}</span>
          <span>High {formatCount(range.high)}</span>
        </span>
      </ProgressBar>
      {context ? (
        <Typography.Paragraph className="tabular-nums" color="muted" size="sm">
          {context}
        </Typography.Paragraph>
      ) : null}
    </div>
  );
}
