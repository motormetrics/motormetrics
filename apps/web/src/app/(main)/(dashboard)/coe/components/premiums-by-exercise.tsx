import { groupByExercise } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  PremiumsByExerciseSelected,
  PremiumsByExerciseView,
} from "@web/app/(main)/(dashboard)/coe/components/premiums-by-exercise-view";
import {
  coeOverviewSearchParams,
  EXERCISE_RANGES,
} from "@web/app/(main)/(dashboard)/coe/components/search-params";
import { getCoeResults } from "@web/queries/coe";
import { Suspense } from "react";

/**
 * The longest range plus one baseline exercise, so its first point still has
 * a previous exercise to measure its change against.
 */
const RECENT_EXERCISES = Math.max(...EXERCISE_RANGES.map(Number)) + 1;

/**
 * The /coe bidding history. Only the recent exercises reach the client, for
 * every category; the view picks the category and range in the URL.
 */
export async function PremiumsByExercise() {
  const exercises = groupByExercise(await getCoeResults()).slice(
    -RECENT_EXERCISES,
  );
  const { category, range } = coeOverviewSearchParams;

  return (
    <Suspense
      fallback={
        <PremiumsByExerciseView
          categoryKey={category.defaultValue}
          exercises={exercises}
          range={range.defaultValue}
        />
      }
    >
      <PremiumsByExerciseSelected exercises={exercises} />
    </Suspense>
  );
}
