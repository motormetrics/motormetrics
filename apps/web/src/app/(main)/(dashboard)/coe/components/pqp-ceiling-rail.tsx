import { NumberValue } from "@heroui-pro/react";
import { CostTrendChip } from "@web/app/(main)/(dashboard)/components/cost-trend-chip";
import Typography from "@web/components/typography";
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
        <Typography.TextSm className="font-semibold text-muted">
          Current rates · {formatMonth(latestMonth)}
        </Typography.TextSm>
        <Typography.H3 className="font-bold text-[1.6875rem] tracking-[-0.02em]">
          PQP ceiling
        </Typography.H3>
      </div>

      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <div
            className="flex items-center gap-3.5 rounded-[var(--radius)] bg-surface px-[18px] py-4"
            key={row.category}
          >
            <span className="flex size-[42px] shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] font-extrabold text-[var(--accent-strong)] text-base">
              {toCategoryKey(row.category)}
            </span>
            <div className="flex min-w-0 flex-col gap-px">
              <span className="font-extrabold text-[17px] tabular-nums">
                <NumberValue
                  currency="SGD"
                  locale="en-SG"
                  maximumFractionDigits={0}
                  style="currency"
                  value={row.rate}
                />
              </span>
              <Typography.Caption className="truncate font-medium text-muted">
                {CATEGORY_DESCRIPTIONS[row.category]}
              </Typography.Caption>
            </div>
            <div className="ml-auto shrink-0">
              <CostTrendChip changeRatio={row.changeRatio} />
            </div>
          </div>
        ))}
      </div>

      <Typography.Caption className="font-medium text-[var(--subtle)]">
        Three-month moving average of quota premiums · used to renew a COE
      </Typography.Caption>
    </div>
  );
}
