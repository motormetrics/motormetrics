import {
  biddingOrdinal,
  formatMonth,
  groupByExercise,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { getCoeResults } from "@web/queries/coe";

/**
 * The first and latest exercises on record. The head names the whole span
 * whatever period the page shows, so it reads the cached history rather than
 * the search params, and stays in the static shell.
 */
async function loadSpan() {
  const exercises = groupByExercise(await getCoeResults());
  return { first: exercises[0], latest: exercises.at(-1) };
}

/** "January 2010 to the first bidding, November 2026", under the title. */
export async function ResultsSpan() {
  const { first, latest } = await loadSpan();

  return first && latest
    ? `${formatMonth(first.month)} to the ${biddingOrdinal(latest.biddingNo)} bidding, ${formatMonth(latest.month)}`
    : null;
}
