import { FilterTabs } from "@web/app/(main)/(dashboard)/cars/makes/components/filter-tabs";
import {
  FUEL_FILTERS,
  isFuelFilter,
  type MakesSearchParams,
  makesHref,
} from "@web/app/(main)/(dashboard)/cars/makes/search-params";

/** Tab id for "All", which clears `?fuel=`. */
const ALL = "all";

/**
 * The powertrain switch beside the "All makes" heading. Each powertrain is a
 * link to the page with `?fuel=` changed, built on the server; "All" drops the
 * param so the default URL stays clean.
 */
export function FuelTabs({ params }: { params: MakesSearchParams }) {
  const selected = isFuelFilter(params.fuel) ? params.fuel : ALL;

  return (
    <FilterTabs
      aria-label="Powertrain"
      filter="fuel"
      selectedKey={selected}
      tabs={[
        { href: makesHref(params, { fuel: null }), id: ALL, label: "All" },
        ...FUEL_FILTERS.map((fuel) => ({
          href: makesHref(params, { fuel }),
          id: fuel,
          label: fuel,
        })),
      ]}
    />
  );
}
