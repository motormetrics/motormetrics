import {
  type CoeExercise,
  groupByExercise,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/coe/search-params";
import { getCoeResultsByPeriod } from "@web/queries/coe";
import type { COECategory } from "@web/types";
import type { SearchParams } from "nuqs/server";

export const premiumOf = (exercise: CoeExercise, category: COECategory) =>
  exercise.results[category]?.premium;

export interface RegionProps {
  searchParams: Promise<SearchParams>;
}

/**
 * The read every results region shares.
 *
 * Each region awaits this itself rather than taking the data as a prop, so the
 * regions sit behind their own Suspense boundaries and stream independently —
 * the page never waits on the slowest of them. It is not one query per region:
 * `getCoeResultsByPeriod` is `'use cache'`, so the first call populates and the
 * rest read it.
 */
export async function loadExercises(searchParams: Promise<SearchParams>) {
  const { categories: selected, period } = await loadSearchParams(searchParams);

  return {
    exercises: groupByExercise(await getCoeResultsByPeriod(period)),
    selected,
  };
}
