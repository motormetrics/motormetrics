import {
  axisTicks,
  type MonthTotal,
  sumByMonth,
  windowEndingAt,
} from "@web/app/(main)/(dashboard)/components/overview-series";
import {
  VolumeChart,
  type VolumePoint,
} from "@web/app/(main)/(dashboard)/components/volume-chart";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { getMonthlyRegistrationTotals } from "@web/queries/cars";
import { getDeregistrations } from "@web/queries/deregistrations";
import {
  formatChartMonth,
  formatMonthLabel,
} from "@web/utils/dates/format-month";
import { getLatestMonth } from "@web/utils/dates/months";

const REGISTRATION_MONTHS = 12;
/** The deregistration feed is shorter, so its window is too. */
const DEREGISTRATION_MONTHS = 8;
/** Matches the KPI strip's query, so both read one cache entry. */
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
    <section className="flex min-w-0 flex-col gap-4.5">
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

/**
 * Vehicles deregistered over the last eight months. The feed can trail
 * registrations, so the window ends at the newest month on record and the
 * caption names its span.
 */
export async function DeregistrationsByMonth() {
  const month = await getLatestMonth("cars");
  const series = windowEndingAt(
    sumByMonth(await getDeregistrations()),
    month,
    DEREGISTRATION_MONTHS,
  );

  const first = series[0];
  const last = series.at(-1);
  if (!first || !last) {
    return null;
  }

  return (
    <section className="flex min-w-0 flex-col gap-4.5">
      <SectionHead
        className="lg:flex-nowrap"
        caption={`${formatMonthLabel(first.month)} to ${formatMonthLabel(last.month)}`}
        eyebrow="Deregistrations"
        link={{ href: "/cars/deregistrations", label: "All deregistrations" }}
        title="Vehicles taken off the road"
      />
      <VolumeChart
        data={toPoints(series)}
        ticks={axisTicks(
          series.map((row) => row.total),
          { zero: true },
        )}
        unit="vehicles"
      />
      <SourceNote>
        All vehicle types, not only cars, so not directly comparable with
        registrations.
      </SourceNote>
    </section>
  );
}
