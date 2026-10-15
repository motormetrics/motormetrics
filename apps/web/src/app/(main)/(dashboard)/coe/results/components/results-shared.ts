import {
  COE_CATEGORIES,
  type CoeExercise,
  groupByExercise,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/coe/search-params";
import { getCoeResultsByPeriod } from "@web/queries/coe";
import type { COECategory } from "@web/types";
import type { SearchParams } from "nuqs/server";

export const premiumOf = (exercise: CoeExercise, category: COECategory) =>
  exercise.results[category]?.premium;

/** Sum one figure across every category in an exercise. */
export function totalFor(
  exercise: CoeExercise,
  figure: "bidsReceived" | "bidsSuccess" | "quota",
): number {
  return COE_CATEGORIES.reduce(
    (total, category) => total + (exercise.results[category]?.[figure] ?? 0),
    0,
  );
}

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

/** Shared by the column header and every row, so the columns line up. */
export const EXERCISE_ROW =
  "flex items-center gap-3 border-separator border-b px-3 py-2.5 max-md:px-1.5";
export const EXERCISE_CELL =
  "flex w-28 shrink-0 flex-col items-end gap-px max-lg:w-24 max-md:w-16";
export const BIDS_CELL = "w-24 shrink-0 text-right max-xl:hidden";
/** The yearly list's phone fold: a narrow year, the cells sharing the rest. */
export const YEAR_LABEL = "max-md:w-10 max-md:flex-none";
export const YEAR_CELL = "max-md:w-auto max-md:min-w-0 max-md:flex-1";
/** Categories C and D are dropped on phones, leaving the car categories. */
export const PHONE_HIDDEN: COECategory[] = ["Category C", "Category D"];
