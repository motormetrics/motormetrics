import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  formatSignedCurrency,
  formatSignedPercent,
  rangePosition,
} from "@web/app/(main)/(dashboard)/coe/components/premiums-shared";
import { RangeBar } from "@web/components/shared/range-bar";
import { RangeFigure, RangeHero } from "@web/components/shared/range-hero";
import type { ReactNode } from "react";

/**
 * Direction D's "range" hero, under the page title: what the figure is for,
 * the figure with its change, a bar placing it between its window's low and
 * high, and what the change is measured against. Also used by `/coe/pqp`.
 */
export function HeadAnswer({
  context,
  high,
  label,
  low,
  previous,
  unit,
  value,
  count,
}: {
  /** "Against the 1st exercise of September 2026 at $X." */
  context: ReactNode;
  /** The window's high and low, which the bar runs between. */
  high: number;
  /** "Category A · Cars up to 1,600cc and 130bhp". */
  label: ReactNode;
  low: number;
  /** The figure the change is measured from; none for the first. */
  previous: number | undefined;
  /** What the window counts: 24 exercises, 12 months. */
  unit: "exercise" | "month";
  value: number;
  /** How many of `unit` the window reaches back. */
  count: number;
}) {
  const span = `${count} ${unit}s`;
  const position = rangePosition(low, high, value, span);

  return (
    <RangeHero label={label}>
      <RangeFigure
        change={
          previous
            ? `${formatSignedPercent((value - previous) / previous)} · ${formatSignedCurrency(value - previous)}`
            : undefined
        }
        value={
          <NumberValue
            currency="SGD"
            locale="en-SG"
            maximumFractionDigits={0}
            style="currency"
            value={value}
          />
        }
      />
      <RangeBar
        ariaLabel={`Against the last ${span}: low ${formatCurrency(low)}, high ${formatCurrency(high)}, now ${formatCurrency(value)}. ${position}.`}
        high={high}
        highLabel={`High ${formatCurrency(high)}`}
        low={low}
        lowLabel={`${count}-${unit} low ${formatCurrency(low)}`}
        value={value}
        where={position}
      />
      <Typography.Paragraph className="tabular-nums" size="sm">
        {context}
      </Typography.Paragraph>
    </RangeHero>
  );
}
