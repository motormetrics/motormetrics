import {
  axisTicks,
  type MonthTotal,
  windowEndingAt,
} from "@web/app/(main)/(dashboard)/components/overview-series";
import {
  VolumeChart,
  type VolumePoint,
} from "@web/app/(main)/(dashboard)/components/volume-chart";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { getMonthlyRegistrationTotals } from "@web/queries/cars";
import {
  formatChartMonth,
  formatMonthLabel,
} from "@web/utils/dates/format-month";
import { getLatestMonth } from "@web/utils/dates/months";

const REGISTRATION_MONTHS = 12;
/** Matches the lead band's query, so both read one cache entry. */
const HISTORY_LIMIT = 24;

/** Chart points, with the year under the first month and every January. */
function toPoints(series: MonthTotal[]): VolumePoint[] {
  return series.map((row, index) => ({
    label: formatChartMonth(row.month),
    title: formatMonthLabel(row.month),
    value: row.total,
    year: index === 0 || row.month.endsWith("-01") ? row.month.slice(0, 4) : "",
  }));
}

/** New car registrations for the last 12 months, the latest darker. */
export async function RegistrationsByMonth() {
  const month = await getLatestMonth("cars");
  const series = windowEndingAt(
    await getMonthlyRegistrationTotals(HISTORY_LIMIT),
    month,
    REGISTRATION_MONTHS,
  );

  if (series.length === 0) {
    return null;
  }

  return (
    <section className="flex min-w-0 flex-col gap-4">
      <SectionHead
        className="lg:flex-nowrap"
        caption={`Last ${series.length} months`}
        eyebrow="Registrations"
        link={{ href: "/cars", label: "All registrations" }}
        title="New cars by month"
      />
      <VolumeChart
        data={toPoints(series)}
        ticks={axisTicks(
          series.map((row) => row.total),
          { zero: true },
        )}
        unit="new cars"
      />
      <SourceNote>New car registrations, all makes and fuel types.</SourceNote>
    </section>
  );
}
