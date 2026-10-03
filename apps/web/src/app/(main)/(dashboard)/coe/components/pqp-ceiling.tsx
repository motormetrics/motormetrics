import { cn } from "@heroui/react";
import {
  CATEGORY_DESCRIPTIONS,
  changeRatio,
  formatExercise,
  formatMonth,
  groupByExercise,
  nextExercise,
  toCategoryKey,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  PQP_ROW_GRID,
  PqpRateRow,
} from "@web/app/(main)/(dashboard)/coe/components/pqp-rate-row";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { getCoeResults, getPqpRates } from "@web/queries/coe";
import type { COECategory } from "@web/types";
import { formatMonthShortName } from "@web/utils/dates/format-month";

/** The prevailing quota premium for each category, one hairline row apiece. */
export async function PqpCeiling() {
  const [rates, results] = await Promise.all([getPqpRates(), getCoeResults()]);
  const [latestMonth, previousMonth] = Object.keys(rates).sort().reverse();

  if (!latestMonth) {
    return null;
  }

  const latest = rates[latestMonth];
  const previous = previousMonth ? rates[previousMonth] : undefined;
  const latestExercise = groupByExercise(results).at(-1);

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
    <div className="flex flex-col gap-[18px]">
      <SectionHead
        caption={`${formatMonth(latestMonth)} · three-month moving average`}
        eyebrow="Renewal"
        link={{ href: "/coe/pqp", label: "PQP rates" }}
        title="Prevailing quota premium"
      />

      <div className="flex flex-col">
        <div
          className={cn(
            PQP_ROW_GRID,
            "border-border border-b pb-2 font-semibold text-muted text-xs",
          )}
        >
          <span>Category</span>
          <span className="text-right">PQP</span>
          <span className="text-right">
            {previousMonth ? `vs ${formatMonthShortName(previousMonth)}` : ""}
          </span>
        </div>
        <ul className="flex flex-col">
          {rows.map((row) => (
            <PqpRateRow
              changeRatio={row.changeRatio}
              description={CATEGORY_DESCRIPTIONS[row.category]}
              key={row.category}
              letter={toCategoryKey(row.category)}
              value={row.rate}
            />
          ))}
        </ul>
      </div>

      <SourceNote>
        No PQP for Category E.
        {latestExercise
          ? ` Next exercise: ${formatExercise(nextExercise(latestExercise))} · closes 16:00.`
          : null}
      </SourceNote>
    </div>
  );
}
