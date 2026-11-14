import { FilterTabs } from "@web/app/(main)/(dashboard)/cars/makes/components/filter-tabs";
import {
  type MakesSearchParams,
  RANGES,
  type Range,
  serialize,
} from "@web/app/(main)/(dashboard)/cars/makes/search-params";
import { formatMonthName } from "@web/utils/dates/format-month";

/** Direction D's period labels: "October", "2026 to date", "12 months". */
export function rangeTabLabel(range: Range, latestMonth: string): string {
  if (range === "month") {
    return formatMonthName(latestMonth);
  }
  if (range === "ytd") {
    return `${latestMonth.slice(0, 4)} to date`;
  }
  return "12 months";
}

/**
 * The index's period switch. Each range is a link to the page with `?range=`
 * changed and every other param kept, built on the server.
 */
export function RangeTabs({
  latestMonth,
  params,
}: {
  latestMonth: string;
  params: MakesSearchParams;
}) {
  return (
    <FilterTabs
      aria-label="Period"
      filter="range"
      selectedKey={params.range}
      tabs={RANGES.map((range) => ({
        href: serialize("/cars/makes", { ...params, range }),
        id: range,
        label: rangeTabLabel(range, latestMonth),
      }))}
    />
  );
}
