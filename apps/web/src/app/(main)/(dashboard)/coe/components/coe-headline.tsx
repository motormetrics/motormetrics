import { groupByExercise } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  CoeHeadlineSelected,
  CoeHeadlineView,
} from "@web/app/(main)/(dashboard)/coe/components/coe-headline-view";
import { coeOverviewSearchParams } from "@web/app/(main)/(dashboard)/coe/components/search-params";
import { getCoeResults, getPqpRates } from "@web/queries/coe";
import { Suspense } from "react";

/**
 * The opening block of /coe. The figures for every category are shaped here,
 * in the static shell; the client view picks the one in the URL, and the
 * fallback draws the default category so the shell holds real figures.
 */
export async function CoeHeadline() {
  const [results, pqpRates] = await Promise.all([
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

  return (
    <Suspense
      fallback={
        <CoeHeadlineView
          {...data}
          categoryKey={coeOverviewSearchParams.category.defaultValue}
        />
      }
    >
      <CoeHeadlineSelected {...data} />
    </Suspense>
  );
}
