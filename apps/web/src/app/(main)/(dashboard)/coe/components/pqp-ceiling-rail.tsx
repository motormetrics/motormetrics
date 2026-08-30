import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { CostTrendChip } from "@web/app/(main)/(dashboard)/components/cost-trend-chip";
import { getPqpRates } from "@web/queries/coe";
import type { COECategory } from "@web/types";
import {
  CATEGORY_DESCRIPTIONS,
  changeRatio,
  formatMonth,
  toCategoryKey,
} from "./coe-exercise-utils";

export async function PqpCeilingRail() {
  const rates = await getPqpRates();
  const [latestMonth, previousMonth] = Object.keys(rates).sort().reverse();

  if (!latestMonth) {
    return null;
  }

  const latest = rates[latestMonth];
  const previous = previousMonth ? rates[previousMonth] : undefined;

  // The `pqp` table only publishes A–D: an Open category COE cannot be
  // renewed, so there is no Category E rate to show.
  const rows = Object.entries(latest ?? {})
    .map(([category, rate]) => ({
      category: category as COECategory,
      changeRatio: changeRatio(
        rate,
        previous?.[category as keyof typeof previous] ?? 0,
      ),
      rate,
    }))
    .sort((first, second) => first.category.localeCompare(second.category));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <Typography.Paragraph color="muted" size="sm">
          Current rates · {formatMonth(latestMonth)}
        </Typography.Paragraph>
        <Typography.Heading level={3} className="text-3xl">
          PQP ceiling
        </Typography.Heading>
      </div>

      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <div
            className="flex items-center gap-3.5 rounded-field bg-surface px-[18px] py-4"
            key={row.category}
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent/15 font-extrabold text-accent-strong text-lg">
              {toCategoryKey(row.category)}
            </span>
            <div className="flex min-w-0 flex-col gap-px">
              <span className="font-extrabold text-lg tabular-nums">
                <NumberValue
                  currency="SGD"
                  locale="en-SG"
                  maximumFractionDigits={0}
                  style="currency"
                  value={row.rate}
                />
              </span>
              <Typography.Paragraph
                color="muted"
                size="xs"
                className="truncate"
              >
                {CATEGORY_DESCRIPTIONS[row.category]}
              </Typography.Paragraph>
            </div>
            <div className="ml-auto shrink-0">
              <CostTrendChip changeRatio={row.changeRatio} />
            </div>
          </div>
        ))}
      </div>

      <Typography.Paragraph color="muted" size="xs">
        Three-month moving average of quota premiums · used to renew a COE
      </Typography.Paragraph>
    </div>
  );
}
