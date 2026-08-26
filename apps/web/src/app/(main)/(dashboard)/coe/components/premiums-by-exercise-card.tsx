import { getCoeResults } from "@web/queries/coe";
import type { SearchParams } from "nuqs/server";
import {
  changeRatio,
  formatExerciseTick,
  groupByExercise,
  toCategory,
} from "./coe-exercise-utils";
import { type PremiumColumn, PremiumsChart } from "./premiums-chart";
import { loadCoeOverviewSearchParams, RANGE_LABELS } from "./search-params";

export async function PremiumsByExerciseCard({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [{ category: categoryKey, range }, results] = await Promise.all([
    loadCoeOverviewSearchParams(searchParams),
    getCoeResults(),
  ]);

  const category = toCategory(categoryKey);
  const exercises = groupByExercise(results).filter(
    (exercise) => exercise.results[category] !== undefined,
  );
  // One extra exercise so the first visible column still has a baseline to
  // measure its change against.
  const visible = exercises.slice(-(Number(range) + 1));

  const columns: PremiumColumn[] = visible
    .map((exercise, index) => ({
      changeRatio: changeRatio(
        exercise.results[category]?.premium ?? 0,
        visible[index - 1]?.results[category]?.premium ?? 0,
      ),
      key: exercise.key,
      label: formatExerciseTick(exercise),
      premium: exercise.results[category]?.premium ?? 0,
    }))
    .slice(-Number(range));

  if (columns.length === 0) {
    return null;
  }

  return (
    <PremiumsChart
      category={category}
      columns={columns}
      periodLabel={RANGE_LABELS[range]}
    />
  );
}
