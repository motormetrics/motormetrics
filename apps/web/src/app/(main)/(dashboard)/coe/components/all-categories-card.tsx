import { getCoeResults } from "@web/queries/coe";
import type { SearchParams } from "nuqs/server";
import { AllCategoriesTable, type CategoryRow } from "./all-categories-table";
import {
  CATEGORY_DESCRIPTIONS,
  COE_CATEGORIES,
  changeRatio,
  formatExercise,
  groupByExercise,
  toCategoryKey,
} from "./coe-exercise-utils";
import { loadCoeOverviewSearchParams } from "./search-params";

export async function AllCategoriesCard({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [{ category: selected }, results] = await Promise.all([
    loadCoeOverviewSearchParams(searchParams),
    getCoeResults(),
  ]);

  const exercises = groupByExercise(results);
  const latest = exercises.at(-1);
  const previous = exercises.at(-2);

  if (!latest) {
    return null;
  }

  const rows: CategoryRow[] = COE_CATEGORIES.map((category) => {
    const premium = latest.results[category]?.premium ?? 0;
    return {
      category,
      categoryKey: toCategoryKey(category),
      changeRatio: changeRatio(
        premium,
        previous?.results[category]?.premium ?? 0,
      ),
      description: CATEGORY_DESCRIPTIONS[category],
      premium,
      quota: latest.results[category]?.quota ?? 0,
    };
  });

  return (
    <AllCategoriesTable
      exercise={formatExercise(latest)}
      rows={rows}
      selected={selected}
    />
  );
}
