import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { percentage } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/percentage";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { percentageChange } from "@web/utils/change-ratio";

/** The make's registrations for the period, with the two-by-two stat grid beside them. */
export function MakeHeadline({
  fuelType,
  make,
  makeTotal,
  marketTotal,
  previousTotal,
  rangeLabel,
  stats,
  total,
}: {
  fuelType: string | null;
  make: string;
  makeTotal: number;
  marketTotal: number;
  previousTotal: number;
  rangeLabel: string;
  stats: { label: string; note: string; value: string }[];
  total: number;
}) {
  return (
    <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-2 lg:gap-14">
      <div className="flex min-w-0 flex-col gap-3">
        <span className="font-semibold text-muted text-xs">
          {fuelType ? `${fuelType} ` : ""}
          {make} registrations
        </span>
        <span className="font-extrabold text-5xl tabular-nums leading-none tracking-tight md:text-6xl">
          <NumberValue locale="en-SG" maximumFractionDigits={0} value={total} />
        </span>
        <Typography.Paragraph color="muted">
          <DeltaChip
            className="font-semibold text-foreground"
            value={percentageChange(total, previousTotal)}
          />{" "}
          against the same period a year earlier
        </Typography.Paragraph>
        <Typography.Paragraph className="tabular-nums" color="muted" size="sm">
          {fuelType
            ? `${rangeLabel} · ${percentage(total, makeTotal)} of ${make} registrations`
            : `${rangeLabel} · ${percentage(total, marketTotal)} of all registrations`}
        </Typography.Paragraph>
      </div>
      <div className="grid grid-cols-2 border-border border-t">
        {stats.map((stat) => (
          <div
            className="flex min-w-0 flex-col gap-1 border-separator border-b py-3.5 pr-4 even:border-l even:pl-4"
            key={stat.label}
          >
            <span className="truncate font-semibold text-muted text-xs">
              {stat.label}
            </span>
            <span className="font-semibold text-xl tabular-nums tracking-tight md:text-2xl">
              {stat.value}
            </span>
            <span className="truncate text-muted text-xs">{stat.note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
