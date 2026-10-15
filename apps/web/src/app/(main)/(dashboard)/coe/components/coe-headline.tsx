import { groupByExercise } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { CoeHeadlineSelected } from "@web/app/(main)/(dashboard)/coe/components/coe-headline-view";
import { loadCoeOverviewSearchParams } from "@web/app/(main)/(dashboard)/coe/components/search-params";
import { getCoeResults, getPqpRates } from "@web/queries/coe";
import type { SearchParams } from "nuqs/server";

/**
 * The opening block of /coe. The figures for every category are shaped here;
 * the view draws the category in the URL.
 */
export async function CoeHeadline({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [{ category }, results, pqpRates] = await Promise.all([
    loadCoeOverviewSearchParams(searchParams),
    getCoeResults(),
    getPqpRates(),
  ]);

  const exercises = groupByExercise(results);
  const latest = exercises.at(-1);

  if (!latest) {
    return null;
  }

  const data = {
    latest,
    pqpRates: Object.fromEntries(
      Object.keys(pqpRates)
        .sort()
        .slice(-2)
        .map((month) => [month, pqpRates[month]]),
    ),
    previous: exercises.at(-2),
  };

  return <CoeHeadlineSelected {...data} categoryKey={category} />;
}
