import {
  CATEGORY_DESCRIPTIONS,
  changeRatio,
  toCategoryKey,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { PqpRateRow } from "@web/app/(main)/(dashboard)/coe/components/pqp-rate-row";
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

      <ul className="flex flex-col">
        {rows.map((row) => (
          <PqpRateRow
            changeRatio={row.changeRatio}
            description={CATEGORY_DESCRIPTIONS[row.category]}
            descriptionClassName="text-[13.5px]"
            key={row.category}
            letter={toCategoryKey(row.category)}
            value={row.rate}
          />
        ))}
      </ul>
    </div>
  );
}
