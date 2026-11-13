import {
  TwoShadeTrendChart,
  type TwoShadeTrendPoint,
} from "@web/app/(main)/(dashboard)/cars/components/two-shade-trend-chart";
import {
  loadMakeRows,
  periodLabel,
  rollingMonths,
} from "@web/app/(main)/(dashboard)/cars/makes/components/make-rows";
import {
  loadSearchParams,
  RANGE_LABELS,
} from "@web/app/(main)/(dashboard)/cars/makes/search-params";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import {
  formatChartMonth,
  formatMonthLabel,
} from "@web/utils/dates/format-month";
import type { SearchParams } from "nuqs/server";

/**
 * The leading make's last twelve months as columns. Its count, change and
 * share lead the page head instead (MakesAnswer).
 */
export async function LeadingMakeCard({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { fuel, range } = await loadSearchParams(searchParams);
  const { latestMonth, rows } = await loadMakeRows(range, fuel);
  const leader = rows[0];

  if (!leader || !latestMonth) {
    return null;
  }

  const fuelWord = fuel?.toLowerCase() ?? null;
  const months = rollingMonths(latestMonth);
  const data: TwoShadeTrendPoint[] = leader.trend.map((count, index) => {
    const month = months[index];
    const isLatest = index === leader.trend.length - 1;
    return {
      count,
      earlier: isLatest ? 0 : count,
      label: formatChartMonth(month),
      latest: isLatest ? count : 0,
      title: formatMonthLabel(month),
      year: index === 0 || month.endsWith("-01") ? month.slice(0, 4) : "",
    };
  });

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <SectionHead
        caption={`${leader.make} leads ${fuelWord ? `${fuelWord} registrations` : "the market"} · ${RANGE_LABELS[range]}`}
        eyebrow="Leading make"
        title={`${leader.make}${fuelWord ? ` ${fuelWord}` : ""} registrations by month`}
      />
      <div>
        <TwoShadeTrendChart
          data={data}
          height={210}
          maxBarSize={30}
          ticks={axisTicks(leader.trend, { zero: true })}
          tooltipLabel="Registrations"
        />
      </div>
      <SourceNote>
        {leader.make}
        {fuelWord ? ` ${fuelWord}` : ""} registrations by month,{" "}
        {periodLabel(latestMonth, "12m")}.
      </SourceNote>
    </div>
  );
}
