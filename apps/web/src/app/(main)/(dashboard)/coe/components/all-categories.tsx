import type { CategoryRow } from "@web/app/(main)/(dashboard)/coe/components/all-categories-sort";
import { AllCategoriesTable } from "@web/app/(main)/(dashboard)/coe/components/all-categories-table";
import {
  CATEGORY_DESCRIPTIONS,
  COE_CATEGORIES,
  changeRatio,
  formatExerciseTick,
  groupByExercise,
  toCategoryKey,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { loadCoeOverviewSearchParams } from "@web/app/(main)/(dashboard)/coe/components/search-params";
import { SectionLink } from "@web/components/shared/overview";
import { Text } from "@web/components/shared/text";
import { getCoeResults } from "@web/queries/coe";
import type { SearchParams } from "nuqs/server";

/** Exercises behind each row's sparkline — a year of twice-monthly bidding. */
const SERIES_LENGTH = 24;

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
  const recent = exercises.slice(-SERIES_LENGTH);

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
      series: recent.flatMap((exercise) => {
        const value = exercise.results[category]?.premium;
        return value === undefined
          ? []
          : [{ label: formatExerciseTick(exercise), value }];
      }),
    };
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-4">
        {/* A paragraph-scale heading: Typography.Heading has no xs size, and
            render needs a client-only function. */}
        <Text.Paragraph
          eyebrow
          role="heading"
          aria-level={2}
          className="min-[721px]:sr-only"
          weight="semibold"
          color="muted"
          size="xs"
        >
          All categories
        </Text.Paragraph>
        <SectionLink href="/coe/results">All COE results</SectionLink>
      </div>
      <AllCategoriesTable rows={rows} selected={selected} />
    </div>
  );
}
