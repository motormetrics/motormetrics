import { toCategory } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  loadSearchParams,
  type PQPCategoryKey,
} from "@web/app/(main)/(dashboard)/coe/pqp/search-params";
import { getPQPOverview } from "@web/queries/coe";
import type { Pqp } from "@web/types/coe";
import type { SearchParams } from "nuqs/server";
import { cache, Suspense } from "react";

export interface PQPPageProps {
  searchParams: Promise<SearchParams>;
}

/** `A` → `Category A`, the key the query and the types use. */
export const categoryName = (key: PQPCategoryKey) =>
  toCategory(key) as keyof Pqp.Rates;

/**
 * The published rates, which read no search params. Everything here is
 * cached, so parts built only on it need no boundary.
 */
export const loadPqpData = cache(async () => {
  const overview = await getPQPOverview();
  // The query returns the months newest first; the page reads oldest first.
  const ascending = [...overview.trendData].sort((a, b) =>
    a.month.localeCompare(b.month),
  );

  return { ...overview, ascending };
});

/**
 * The cached data with the selection in the URL applied. A ten-year renewal
 * costs the full PQP and a five-year renewal half of it, so the term scales
 * the rates rather than selecting different figures.
 */
export const loadPqpView = cache(
  async (searchParams: Promise<SearchParams>) => {
    const [{ category, term }, data] = await Promise.all([
      loadSearchParams(searchParams),
      loadPqpData(),
    ]);
    const factor = term === "5" ? 0.5 : 1;

    return { ...data, category, factor, term };
  },
);

/**
 * "Category A, 10-year", for labels that name the selection. The fallback is
 * the default selection, so the static shell reads as the default view.
 */
export function SelectedLabel({
  part,
  searchParams,
}: PQPPageProps & { part: "category" | "term" | "both" }) {
  const fallback = {
    both: "Category A, 10-year",
    category: "Category A",
    term: "10-year",
  }[part];

  return (
    <Suspense fallback={fallback}>
      <Label part={part} searchParams={searchParams} />
    </Suspense>
  );
}

async function Label({
  part,
  searchParams,
}: PQPPageProps & { part: "category" | "term" | "both" }) {
  const { category, term } = await loadSearchParams(searchParams);
  const labels = {
    both: `Category ${category}, ${term}-year`,
    category: `Category ${category}`,
    term: `${term}-year`,
  };
  return labels[part];
}
