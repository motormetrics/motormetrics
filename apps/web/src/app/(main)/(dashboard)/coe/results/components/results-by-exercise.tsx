import {
  COE_CATEGORIES,
  formatMonth,
  toCategoryKey,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  loadExercises,
  premiumOf,
  type RegionProps,
} from "@web/app/(main)/(dashboard)/coe/results/components/results-shared";
import {
  type ResultsRow,
  ResultsTable,
} from "@web/app/(main)/(dashboard)/coe/results/components/results-table";

/** Every exercise in the period, most recent first. */
export async function ResultsByExercise({ searchParams }: RegionProps) {
  const { exercises } = await loadExercises(searchParams);

  const rows: ResultsRow[] = exercises
    .map((exercise) => ({
      bidding: exercise.biddingNo === 1 ? "1st" : "2nd",
      key: exercise.key,
      month: formatMonth(exercise.month, "short"),
      premiums: Object.fromEntries(
        COE_CATEGORIES.flatMap((category) => {
          const premium = premiumOf(exercise, category);
          return premium === undefined
            ? []
            : [[toCategoryKey(category), premium]];
        }),
      ),
    }))
    .reverse();

  return <ResultsTable rows={rows} />;
}
