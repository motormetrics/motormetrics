import { loadCoeOverview } from "@web/app/(main)/(dashboard)/coe/components/overview-loader";
import {
  PremiumsByExerciseSelected,
  PremiumsByExerciseView,
} from "@web/app/(main)/(dashboard)/coe/components/premiums-by-exercise-view";
import { coeOverviewSearchParams } from "@web/app/(main)/(dashboard)/coe/components/search-params";
import { Suspense } from "react";

/**
 * The /coe bidding history, in the static shell: the fallback draws the
 * default category, and the client view swaps in the category in the URL.
 */
export async function PremiumsByExercise() {
  const data = await loadCoeOverview();

  if (!data) {
    return null;
  }

  return (
    <Suspense
      fallback={
        <PremiumsByExerciseView
          categoryKey={coeOverviewSearchParams.category.defaultValue}
          data={data}
        />
      }
    >
      <PremiumsByExerciseSelected data={data} />
    </Suspense>
  );
}
