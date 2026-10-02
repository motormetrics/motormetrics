import { Typography } from "@heroui/react";
import type { CategoryRow } from "@web/app/(main)/(dashboard)/coe/components/all-categories-sort";
import { AllCategoriesTable } from "@web/app/(main)/(dashboard)/coe/components/all-categories-table";
import {
  CATEGORY_DESCRIPTIONS,
  COE_CATEGORIES,
  changeRatio,
  groupByExercise,
  toCategoryKey,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { loadCoeOverviewSearchParams } from "@web/app/(main)/(dashboard)/coe/components/search-params";
import { SectionLink } from "@web/components/shared/overview";
import { getCoeResults } from "@web/queries/coe";
import type { SearchParams } from "nuqs/server";

/**
 * Every category's latest result side by side. The rows are shaped here, in
 * category order; the client table sorts them and selects a category on click.
 *
 * The table carries no visible title on desktop, where it sits straight under
 * the headline; below 720px an "All categories" eyebrow names the list.
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
    const figures = latest.results[category];
    const premium = figures?.premium ?? 0;
    return {
      bidsReceived: figures?.bidsReceived ?? 0,
      category,
      categoryKey: toCategoryKey(category),
      changeRatio: changeRatio(
        premium,
        previous?.results[category]?.premium ?? 0,
      ),
      description: CATEGORY_DESCRIPTIONS[category],
      premium,
      quota: figures?.quota ?? 0,
    };
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-4">
        <Typography.Heading
          className="font-semibold text-muted text-xs uppercase tracking-[0.06em] min-[721px]:sr-only"
          level={2}
        >
          All categories
        </Typography.Heading>
        <SectionLink href="/coe/results">All COE results</SectionLink>
      </div>
      <AllCategoriesTable rows={rows} selected={selected} />
    </div>
  );
}
