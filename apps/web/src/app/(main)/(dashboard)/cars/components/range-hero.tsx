import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { RangeBar } from "@web/components/shared/range-bar";
import { RangeFigure, RangeHero } from "@web/components/shared/range-hero";
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
 * Direction D's "range" hero for a count: the figure the page answers with,
 * its change as a neutral pill, and a bar placing it between the low and high
 * of the window it closes.
 */
export function CountRangeHero({
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
    <RangeHero
      label={
        <>
          <span className="font-semibold text-foreground">{label}</span> ·{" "}
          {period}
        </>
      }
    >
      <RangeFigure
        change={change}
        value={
          <NumberValue
            locale="en-SG"
            maximumFractionDigits={0}
            value={range.current}
          />
        }
      />
      <RangeBar
        ariaLabel={`Against the ${span} range: low ${formatCount(range.low)}, high ${formatCount(range.high)}, now ${formatCount(range.current)}. ${range.where}.`}
        high={range.high}
        highLabel={`High ${formatCount(range.high)}`}
        low={range.low}
        lowLabel={`${span} low ${formatCount(range.low)}`}
        value={range.current}
        where={range.where}
      />
      {context ? (
        <Typography.Paragraph className="tabular-nums" color="muted" size="sm">
          {context}
        </Typography.Paragraph>
      ) : null}
    </RangeHero>
  );
}
