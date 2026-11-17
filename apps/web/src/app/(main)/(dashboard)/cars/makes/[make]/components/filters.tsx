import {
  type MakeSearchParams,
  RANGE_LABELS,
  RANGES,
  serialize,
} from "@web/app/(main)/(dashboard)/cars/makes/[make]/search-params";
import { FilterTabs } from "@web/app/(main)/(dashboard)/cars/makes/components/filter-tabs";

/**
 * How much of the make's history the page is read over. Each period is a
 * plain link built on the server with the page's nuqs serializer; every other
 * param, the selected month included, carries over.
 */
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
