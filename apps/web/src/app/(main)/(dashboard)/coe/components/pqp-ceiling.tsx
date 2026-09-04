import { NumberValue } from "@heroui-pro/react";
import {
  CATEGORY_DESCRIPTIONS,
  changeRatio,
  toCategoryKey,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { CostTrendChip } from "@web/app/(main)/(dashboard)/components/cost-trend-chip";
import { SectionHead } from "@web/components/shared/overview";
import { getPqpRates } from "@web/queries/coe";
import type { COECategory } from "@web/types";

/** The renewal rates for the coming exercise, one hairline row per category. */
export async function PqpCeiling() {
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
    <div className="flex flex-col gap-6">
      <SectionHead
        caption="Three-month moving average · used to renew a COE"
        eyebrow="Next exercise"
        link={{ href: "/coe/pqp", label: "PQP rates" }}
        title="PQP ceiling"
      />

      <div className="flex flex-col">
        {rows.map((row) => (
          <div
            className="flex items-center gap-3.5 border-separator border-b py-3.5"
            key={row.category}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft font-extrabold text-[17px] text-accent-strong">
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
              <span className="truncate font-medium text-[13.5px] text-muted">
                {CATEGORY_DESCRIPTIONS[row.category]}
              </span>
            </div>
            <div className="ml-auto shrink-0">
              <CostTrendChip changeRatio={row.changeRatio} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
