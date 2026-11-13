import { FilterTabs } from "@web/app/(main)/(dashboard)/cars/makes/components/filter-tabs";
import {
  loadSearchParams,
  RANGE_LABELS,
  RANGES,
  serialize,
} from "@web/app/(main)/(dashboard)/cars/makes/search-params";
import type { SearchParams } from "nuqs/server";

/**
 * The period switch in the page head. Each range is a link to the page with
 * `?range=` changed and every other filter kept, built on the server.
 */
export async function RangeTabs({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await loadSearchParams(searchParams);

  return (
    <FilterTabs
      aria-label="Registration period"
      filter="range"
      selectedKey={params.range}
      tabs={RANGES.map((range) => ({
        href: serialize("/cars/makes", { ...params, range }),
        id: range,
        label: RANGE_LABELS[range],
      }))}
    />
  );
}
