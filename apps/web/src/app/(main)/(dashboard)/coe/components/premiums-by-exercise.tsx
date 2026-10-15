import { groupByExercise } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { PremiumsByExerciseSelected } from "@web/app/(main)/(dashboard)/coe/components/premiums-by-exercise-view";
import {
  EXERCISE_RANGES,
  loadCoeOverviewSearchParams,
} from "@web/app/(main)/(dashboard)/coe/components/search-params";
import { getCoeResults } from "@web/queries/coe";
import type { SearchParams } from "nuqs/server";

/**
 * The longest range plus one baseline exercise, so its first point still has
 * a previous exercise to measure its change against.
 */
const RECENT_EXERCISES = Math.max(...EXERCISE_RANGES.map(Number)) + 1;

/**
 * The /coe bidding history. Only the recent exercises reach the client, for
 * every category; the view draws the category and range in the URL.
 */
export async function PremiumsByExercise({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [{ category, range }, results] = await Promise.all([
    loadCoeOverviewSearchParams(searchParams),
    getCoeResults(),
  ]);
  const exercises = groupByExercise(results).slice(-RECENT_EXERCISES);

  return (
    <PremiumsByExerciseSelected
      categoryKey={category}
      exercises={exercises}
      range={range}
    />
  );
}
