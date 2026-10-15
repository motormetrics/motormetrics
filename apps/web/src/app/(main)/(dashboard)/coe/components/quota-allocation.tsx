import { groupByExercise } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { QuotaAllocationView } from "@web/app/(main)/(dashboard)/coe/components/quota-allocation-view";
import { loadCoeOverviewSearchParams } from "@web/app/(main)/(dashboard)/coe/components/search-params";
import { getCoeResults } from "@web/queries/coe";
import type { SearchParams } from "nuqs/server";

/**
 * Bids against quota for the latest exercise; the accented bar follows the
 * category in the URL.
 */
export async function QuotaAllocation({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [{ category }, results] = await Promise.all([
    loadCoeOverviewSearchParams(searchParams),
    getCoeResults(),
  ]);
  const latest = groupByExercise(results).at(-1);

  if (!latest) {
    return null;
  }

  return <QuotaAllocationView categoryKey={category} latest={latest} />;
}
