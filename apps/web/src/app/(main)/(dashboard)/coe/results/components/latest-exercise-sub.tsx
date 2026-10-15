import { formatExercise } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  loadExercises,
  type RegionProps,
} from "@web/app/(main)/(dashboard)/coe/results/components/results-shared";

/** Names the exercise the page leads with, and its source. */
export async function LatestExerciseSub({ searchParams }: RegionProps) {
  const { exercises } = await loadExercises(searchParams);
  const latest = exercises.at(-1);

  return latest ? (
    <>
      Latest:{" "}
      <span className="font-semibold text-foreground">
        {formatExercise(latest)}
      </span>{" "}
      · Source: LTA via DataMall
    </>
  ) : null;
}
