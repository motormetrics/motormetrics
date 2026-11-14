import { toCategory } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/coe/premiums/search-params";
import { getCategoryExercises, getExercisePair } from "@web/queries/coe";
import type { SearchParams } from "nuqs/server";
import { cache, Suspense } from "react";

export interface PremiumsPageProps {
  searchParams: Promise<SearchParams>;
}

/**
 * Everything the page's dynamic parts derive from: the selection in the URL,
 * the selected exercise, and the category's series truncated to it. Cached per
 * request so each part that awaits the URL shares one load.
 */
export const loadPremiumsView = cache(
  async (searchParams: Promise<SearchParams>) => {
    const {
      category: categoryKey,
      month,
      range,
    } = await loadSearchParams(searchParams);
    const category = toCategory(categoryKey);

    const [{ current, previous }, allExercises] = await Promise.all([
      getExercisePair(month ?? undefined),
      getCategoryExercises(category),
    ]);
    if (!current) {
      return null;
    }

    // The selected exercise can sit mid-history when a month is picked, so the
    // series is truncated to it before anything is derived.
    const currentIndex = allExercises.findIndex(
      ({ biddingNo, month: exerciseMonth }) =>
        exerciseMonth === current.month && biddingNo === current.biddingNo,
    );
    const history =
      currentIndex >= 0
        ? allExercises.slice(0, currentIndex + 1)
        : allExercises;
    const latest = history.at(-1);
    if (!latest) {
      return null;
    }

    return {
      allExercises,
      category,
      categoryKey,
      current,
      history,
      latest,
      previous,
      range,
      year: Number(latest.month.slice(0, 4)),
    };
  },
);

/**
 * "Category B", for headings that name the selection. The fallback is the
 * default category, so the static shell reads the same as the default view.
 */
export function SelectedCategory({ searchParams }: PremiumsPageProps) {
  return (
    <Suspense fallback="Category A">
      <CategoryName searchParams={searchParams} />
    </Suspense>
  );
}

async function CategoryName({ searchParams }: PremiumsPageProps) {
  const { category } = await loadSearchParams(searchParams);
  return toCategory(category);
}
