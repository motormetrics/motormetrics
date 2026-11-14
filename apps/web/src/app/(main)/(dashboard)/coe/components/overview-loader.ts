import { groupByExercise } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  type CoeOverviewData,
  HISTORY_EXERCISES,
} from "@web/app/(main)/(dashboard)/coe/components/overview-figures";
import { getCoeResults, getPqpRates } from "@web/queries/coe";

/**
 * The /coe overview's data for every category. Both reads are `'use cache'`,
 * so each section awaits this itself and stays in the static shell; the
 * repeat calls read the cache rather than the database.
 */
export async function loadCoeOverview(): Promise<CoeOverviewData | null> {
  const [results, pqpRates] = await Promise.all([
    getCoeResults(),
    getPqpRates(),
  ]);
  const exercises = groupByExercise(results);
  const latest = exercises.at(-1);

  if (!latest) {
    return null;
  }

  const [month, previousMonth] = Object.keys(pqpRates).sort().reverse();

  return {
    history: exercises.slice(-HISTORY_EXERCISES),
    latest,
    pqp: month
      ? {
          month,
          previousMonth,
          previousRates: previousMonth ? pqpRates[previousMonth] : undefined,
          rates: pqpRates[month],
        }
      : null,
    previous: exercises.at(-2),
  };
}
