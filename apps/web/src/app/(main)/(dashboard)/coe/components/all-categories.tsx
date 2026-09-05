import type { CategoryRow } from "@web/app/(main)/(dashboard)/coe/components/all-categories-sort";
import { AllCategoriesTable } from "@web/app/(main)/(dashboard)/coe/components/all-categories-table";
import {
  CATEGORY_DESCRIPTIONS,
  COE_CATEGORIES,
  changeRatio,
  formatExercise,
  groupByExercise,
  toCategoryKey,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { loadCoeOverviewSearchParams } from "@web/app/(main)/(dashboard)/coe/components/search-params";
import { SectionHead } from "@web/components/shared/overview";
import { getCoeResults } from "@web/queries/coe";
import type { SearchParams } from "nuqs/server";

/**
 * Every category's latest result side by side. The rows are shaped here, in
 * category order; the client table sorts them and selects a category on click.
 */
export async function AllCategories({
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
    <div className="flex flex-col gap-6">
      <SectionHead
        caption={`${formatExercise(latest)} · select a category for its bidding history`}
        eyebrow="Latest results"
        link={{ href: "/coe/results", label: "All COE results" }}
        title="All categories"
      />
      <AllCategoriesTable rows={rows} selected={selected} />
    </div>
  );
}
