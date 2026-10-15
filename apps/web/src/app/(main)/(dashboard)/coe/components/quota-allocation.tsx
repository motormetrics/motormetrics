import { groupByExercise } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  QuotaAllocationSelected,
  QuotaAllocationView,
} from "@web/app/(main)/(dashboard)/coe/components/quota-allocation-view";
import { coeOverviewSearchParams } from "@web/app/(main)/(dashboard)/coe/components/search-params";
import { getCoeResults } from "@web/queries/coe";
import { Suspense } from "react";

/**
 * Bids against quota for the latest exercise, in the static shell; only the
 * accented bar follows the category in the URL.
 */
export async function QuotaAllocation() {
  const latest = groupByExercise(await getCoeResults()).at(-1);

  if (!latest) {
    return null;
  }

  return (
    <Suspense
      fallback={
        <QuotaAllocationView
          categoryKey={coeOverviewSearchParams.category.defaultValue}
          latest={latest}
        />
      }
    >
      <QuotaAllocationSelected latest={latest} />
    </Suspense>
  );
}
