import { cn } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  COE_CATEGORIES,
  changeRatio,
  formatMonth,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { CategoryHeader } from "@web/app/(main)/(dashboard)/coe/results/components/category-header";
import {
  BIDS_CELL,
  EXERCISE_CELL,
  EXERCISE_ROW,
  loadExercises,
  PHONE_HIDDEN,
  premiumOf,
  type RegionProps,
  totalFor,
} from "@web/app/(main)/(dashboard)/coe/results/components/results-shared";
import { ShowMoreRows } from "@web/app/(main)/(dashboard)/coe/results/components/show-more-rows";
import { CostTrendChip } from "@web/components/shared/cost-trend-chip";

/**
 * Every exercise in the period, most recent first, with each category's
 * change on the exercise before. The first twelve show until expanded.
 */
export async function ResultsByExercise({ searchParams }: RegionProps) {
  const { exercises } = await loadExercises(searchParams);

  const latest = exercises.at(-1);

  if (!latest) {
    return null;
  }

  const rows = exercises
    .map((exercise, index) => ({ exercise, previous: exercises[index - 1] }))
    .reverse()
    .map(({ exercise, previous: earlier }) => (
      <li
        className={cn(
          EXERCISE_ROW,
          exercise.key === latest.key && "bg-surface-secondary",
        )}
        key={exercise.key}
      >
        <span className="flex min-w-0 flex-1 flex-col gap-px">
          <span className="whitespace-nowrap font-semibold text-sm">
            <span className="max-md:hidden">{formatMonth(exercise.month)}</span>
            <span className="md:hidden">
              {formatMonth(exercise.month, "short")}
            </span>
          </span>
          <span className="text-muted text-xs">
            {exercise.biddingNo === 1 ? "1st" : "2nd"}
            <span className="max-md:hidden"> bidding exercise</span>
          </span>
        </span>
        {COE_CATEGORIES.map((category) => {
          const premium = premiumOf(exercise, category);
          const earlierPremium = earlier && premiumOf(earlier, category);
          return (
            <span
              className={cn(
                EXERCISE_CELL,
                PHONE_HIDDEN.includes(category) && "max-md:hidden",
              )}
              key={category}
            >
              <span className="font-semibold text-base tabular-nums max-md:text-sm">
                {premium === undefined ? "—" : formatCurrency(premium)}
              </span>
              <span className="text-muted text-xs tabular-nums">
                {premium !== undefined && earlierPremium ? (
                  <CostTrendChip
                    changeRatio={changeRatio(premium, earlierPremium)}
                  />
                ) : (
                  "—"
                )}
              </span>
            </span>
          );
        })}
        <span
          className={cn(BIDS_CELL, "text-muted-strong text-sm tabular-nums")}
        >
          {totalFor(exercise, "bidsReceived").toLocaleString("en-SG")}
        </span>
      </li>
    ));

  return (
    <ShowMoreRows
      header={<CategoryHeader label="Exercise" trailing="Total bids" />}
      initial={12}
      lessLabel="Show 12 exercises"
      moreLabel={`Show all ${rows.length} exercises`}
      noun="exercises"
      rows={rows}
    >
      <span className="md:hidden">
        Categories C and D appear on wider screens.
      </span>
    </ShowMoreRows>
  );
}
