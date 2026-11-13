import {
  type MakeSearchParams,
  RANGE_LABELS,
  RANGES,
  serialize,
} from "@web/app/(main)/(dashboard)/cars/makes/[make]/search-params";
import { FilterTabs } from "@web/app/(main)/(dashboard)/cars/makes/components/filter-tabs";

/** Tab id for the unfiltered view, which clears `?fuelType=`. */
const ALL_FUEL_TYPES = "all";

/*
 * Both switches are plain links built on the server with the page's nuqs
 * serializer, so each period and fuel type is a crawlable URL and switching is
 * an ordinary navigation that re-renders the report. Every other param, the
 * selected month included, carries over.
 */

/** How much of the make's history the page is read over. */
export function PeriodTabs({
  params,
  path,
}: {
  params: MakeSearchParams;
  /** The make page's own path, e.g. `/cars/makes/bmw`. */
  path: string;
}) {
  return (
    <FilterTabs
      aria-label="Period"
      filter="range"
      selectedKey={params.range}
      tabs={RANGES.map((range) => ({
        href: serialize(path, { ...params, range }),
        id: range,
        label: RANGE_LABELS[range],
      }))}
    />
  );
}

/**
 * Fuel types as LTA records them, passed in from the server rather than listed
 * here — only the ones this make actually registers are offered, so a make with
 * no diesel never shows a tab that would empty the page.
 */
export function FuelTypeTabs({
  fuelTypes,
  params,
  path,
}: {
  fuelTypes: string[];
  params: MakeSearchParams;
  path: string;
}) {
  return (
    <FilterTabs
      aria-label="Fuel type"
      filter="fuel_type"
      selectedKey={params.fuelType ?? ALL_FUEL_TYPES}
      tabs={[
        {
          href: serialize(path, { ...params, fuelType: null }),
          id: ALL_FUEL_TYPES,
          label: "All",
        },
        ...fuelTypes.map((fuelType) => ({
          href: serialize(path, { ...params, fuelType }),
          id: fuelType,
          label: fuelType,
        })),
      ]}
    />
  );
}
