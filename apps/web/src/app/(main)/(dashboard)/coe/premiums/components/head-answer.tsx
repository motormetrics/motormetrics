import { Chip, ProgressBar, Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  formatSignedCurrency,
  formatSignedPercent,
  rangePosition,
} from "@web/app/(main)/(dashboard)/coe/premiums/components/premiums-shared";
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
    <div className="flex max-w-xl flex-col gap-2.5 border-separator border-t pt-4">
      <Typography.Paragraph className="text-muted-strong" size="sm">
        {label}
      </Typography.Paragraph>
      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
        <span className="font-extrabold text-4xl tabular-nums leading-none tracking-tight">
          <NumberValue
            currency="SGD"
            locale="en-SG"
            maximumFractionDigits={0}
            style="currency"
            value={value}
          />
        </span>
        {previous ? (
          // Colour does not carry the direction; the sign does.
          <Chip className="tabular-nums" color="accent" variant="soft">
            {`${formatSignedPercent((value - previous) / previous)} · ${formatSignedCurrency(value - previous)}`}
          </Chip>
        ) : null}
      </div>
      <ProgressBar
        aria-label={`Against the last ${span}: low ${formatCurrency(low)}, high ${formatCurrency(high)}, now ${formatCurrency(value)}. ${position}.`}
        className="gap-2"
        maxValue={Math.max(high, low + 1)}
        minValue={low}
        size="sm"
        value={value}
      >
        <ProgressBar.Track className="col-span-full">
          <ProgressBar.Fill />
        </ProgressBar.Track>
        <span className="col-span-full flex justify-between gap-3 text-muted text-xs tabular-nums">
          <span>
            {count}-{unit} low {formatCurrency(low)}
          </span>
          <span className="font-semibold text-foreground">{position}</span>
          <span>High {formatCurrency(high)}</span>
        </span>
      </ProgressBar>
      <Typography.Paragraph
        className="text-muted-strong tabular-nums"
        size="sm"
      >
        {context}
      </Typography.Paragraph>
    </div>
  );
}

export interface KeyNumber {
  label: string;
  note: string;
  value: string;
}

/**
 * The key numbers beside the head: four across under it, or two across in its
 * right half, as on the Makes page.
 */
export function KeyNumberList({ items }: { items: KeyNumber[] }) {
  return (
    <dl className="grid @3xl:grid-cols-4 grid-cols-2 gap-x-6 border-separator border-t">
      {items.map(({ label, note, value }) => (
        <div
          className="flex flex-col gap-0.5 border-separator border-b py-3"
          key={label}
        >
          <dt className="font-semibold text-muted text-xs">{label}</dt>
          <dd className="font-semibold text-xl tabular-nums">{value}</dd>
          <dd className="text-muted text-xs tabular-nums">{note}</dd>
        </div>
      ))}
    </dl>
  );
}
