import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { formatMonthLabel } from "@web/utils/dates/format-month";

interface HeadlineStat {
  label: string;
  note: string;
  value: number;
}

const formatCount = (value: number): string => value.toLocaleString("en-SG");

/**
 * The month's total with its change on the month before, beside the four COE
 * categories as a ruled two-by-two grid, as the Hybrid comp draws it.
 *
 * Adapted from the registrations page's headline, which is the same block.
 */
export function DeregistrationsHeadline({
  label,
  previousMonth,
  previousValue,
  stats,
  sub,
  value,
}: {
  label: string;
  /** `YYYY-MM` of the month the change is measured against. */
  previousMonth: string;
  previousValue: number;
  stats: HeadlineStat[];
  sub: string;
  value: number;
}) {
  const difference = value - previousValue;
  const sign = difference < 0 ? "−" : "+";

  return (
    <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-11 lg:gap-14">
      <div className="flex min-w-0 flex-col gap-3 lg:col-span-6">
        <span className="font-semibold text-muted text-xs">{label}</span>
        <span className="font-extrabold text-5xl tabular-nums leading-none tracking-tight md:text-6xl">
          <NumberValue locale="en-SG" maximumFractionDigits={0} value={value} />
        </span>
        {previousValue > 0 ? (
          <Typography.Paragraph className="text-muted-strong tabular-nums">
            <span className="font-semibold text-foreground">
              {`${sign}${Math.abs((difference / previousValue) * 100).toFixed(1)}%`}
            </span>{" "}
            ({sign}
            {formatCount(Math.abs(difference))}) vs{" "}
            {formatMonthLabel(previousMonth)} at {formatCount(previousValue)}
          </Typography.Paragraph>
        ) : null}
        <Typography.Paragraph className="tabular-nums" color="muted" size="sm">
          {sub}
        </Typography.Paragraph>
      </div>
      <dl className="grid grid-cols-2 border-border border-t lg:col-span-5">
        {stats.map((stat) => (
          <div
            className="flex flex-col gap-1 border-border border-b py-3.5 pr-4 even:border-l even:pl-4"
            key={stat.label}
          >
            <dt className="font-semibold text-muted text-xs">{stat.label}</dt>
            <dd className="font-semibold text-2xl tabular-nums tracking-tight">
              {formatCount(stat.value)}
            </dd>
            <dd className="text-muted text-xs tabular-nums">{stat.note}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
