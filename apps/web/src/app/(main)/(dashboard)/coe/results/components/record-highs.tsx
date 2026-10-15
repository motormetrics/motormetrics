import { cn } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  CATEGORY_DESCRIPTIONS,
  COE_CATEGORIES,
  formatExercise,
  groupByExercise,
  recordHighs,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { premiumOf } from "@web/app/(main)/(dashboard)/coe/results/components/results-shared";
import { getCoeResults } from "@web/queries/coe";

/** Shared by the records header and rows. */
const RECORD_ROW =
  "flex items-baseline gap-4 border-separator border-b px-3 py-3 max-md:flex-wrap max-md:gap-x-3 max-md:gap-y-0.5 max-md:px-1.5";

/** The highest closing premium each category has ever reached. */
export async function RecordHighs() {
  const highs = recordHighs(groupByExercise(await getCoeResults()));

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          RECORD_ROW,
          "items-end border-border pt-0 font-semibold text-muted text-xs max-md:hidden",
        )}
      >
        <span className="w-24 shrink-0">Category</span>
        <span className="min-w-0 flex-1">Description</span>
        <span className="w-32 shrink-0 text-right">Record</span>
        <span className="w-60 shrink-0 text-right">Exercise</span>
      </div>
      <ol className="flex flex-col">
        {COE_CATEGORIES.map((category) => {
          const exercise = highs[category];
          return (
            <li className={RECORD_ROW} key={category}>
              <span className="w-24 shrink-0 whitespace-nowrap font-semibold text-sm max-md:w-auto max-md:flex-1">
                {category}
              </span>
              <span className="min-w-0 flex-1 truncate text-muted text-sm max-md:hidden">
                {CATEGORY_DESCRIPTIONS[category]}
              </span>
              <span className="w-32 shrink-0 text-right font-semibold text-base tabular-nums max-md:w-auto">
                {exercise
                  ? formatCurrency(premiumOf(exercise, category) ?? 0)
                  : "—"}
              </span>
              <span className="w-60 shrink-0 text-right text-muted-strong text-sm max-md:w-full max-md:text-left max-md:text-xs">
                {exercise ? formatExercise(exercise) : "—"}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
