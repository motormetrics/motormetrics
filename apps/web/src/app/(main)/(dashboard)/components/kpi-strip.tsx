import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  batteryElectricShares,
  resolveMonthIndex,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-series";
import { biddingOrdinal } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { KpiSparkline } from "@web/app/(main)/(dashboard)/components/kpi-sparkline";
import {
  sumByMonth,
  summariseMonth,
  windowEndingAt,
} from "@web/app/(main)/(dashboard)/components/overview-series";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { SourceNote } from "@web/components/shared/overview";
import {
  getEvMarketShare,
  getEvMonthlyTrend,
  getMonthlyRegistrationTotals,
} from "@web/queries/cars";
import { getAllCoeCategoryTrends } from "@web/queries/coe";
import { getDeregistrations } from "@web/queries/deregistrations";
import { getVehiclePopulationYearlyTotals } from "@web/queries/vehicle-population";
import { changeRatio } from "@web/utils/change-ratio";
import {
  formatMonthLabel,
  formatMonthName,
} from "@web/utils/dates/format-month";
import { getLatestMonth } from "@web/utils/dates/months";
import type { ReactNode } from "react";

/** Deep enough to cover the year to date and a 12-month sparkline. */
const HISTORY_LIMIT = 24;
const SPARK_MONTHS = 12;
/** The deregistration feed is shorter, so its sparkline is too. */
const DEREGISTRATION_MONTHS = 8;

interface KpiProps {
  label: string;
  value: ReactNode;
  /** `DeltaChip` for the change on the previous month. */
  change: ReactNode;
  /** "vs July". */
  versus: string;
  spark: { label: string; value: number }[];
  sparkFormat?: Intl.NumberFormatOptions;
  note: ReactNode;
}

/**
 * One cell of the strip: label, figure, change on the previous month, a
 * 12-month sparkline and a muted note. Four across from lg, two-by-two
 * below; the rules between cells follow the layout.
 */
function Kpi({
  change,
  label,
  note,
  spark,
  sparkFormat,
  value,
  versus,
}: KpiProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 border-separator px-3 pt-3.5 pb-3 first:pl-0 max-lg:nth-3:border-t max-lg:nth-4:border-t max-lg:even:border-l max-lg:odd:pl-0 md:px-5 md:pt-4 md:pb-4 lg:not-first:border-l">
      <Typography.Paragraph weight="semibold" color="muted" size="xs">
        {label}
      </Typography.Paragraph>
      <span className="font-extrabold text-3xl tabular-nums leading-none tracking-tight md:text-4xl">
        {value}
      </span>
      <Typography.Paragraph className="tabular-nums" color="muted" size="sm">
        {change} {versus}
      </Typography.Paragraph>
      <KpiSparkline data={spark} format={sparkFormat} label={label} />
      <SourceNote className="tabular-nums">{note}</SourceNote>
    </div>
  );
}

const CHANGE_CLASS = "font-semibold text-foreground";

/**
 * The four figures that answer "what happened this month": new car
 * registrations, deregistrations, the Category A premium and the EV share.
 * Change is against the previous month in grey, never coloured.
 */
export async function KpiStrip() {
  const month = await getLatestMonth("cars");
  const year = month.slice(0, 4);
  const [
    monthlyTotals,
    populationTotals,
    deregistrationRows,
    coeTrends,
    evTrend,
    evMarketShare,
  ] = await Promise.all([
    getMonthlyRegistrationTotals(HISTORY_LIMIT),
    getVehiclePopulationYearlyTotals(),
    getDeregistrations(),
    getAllCoeCategoryTrends(),
    getEvMonthlyTrend(),
    getEvMarketShare(),
  ]);

  const kpis: KpiProps[] = [];

  const registrations = windowEndingAt(monthlyTotals, month, SPARK_MONTHS);
  const registration = registrations.at(-1);
  const previousRegistration = registrations.at(-2);
  if (registration) {
    const yearToDate = monthlyTotals
      .filter((row) => row.month.startsWith(year) && row.month <= month)
      .reduce((total, row) => total + row.total, 0);
    kpis.push({
      change: (
        <DeltaChip
          className={CHANGE_CLASS}
          value={
            changeRatio(registration.total, previousRegistration?.total) * 100
          }
        />
      ),
      label: "New car registrations",
      note: (
        <>
          <NumberValue
            locale="en-SG"
            maximumFractionDigits={0}
            value={yearToDate}
          />{" "}
          so far in {year}
        </>
      ),
      spark: registrations.map((row) => ({
        label: formatMonthLabel(row.month),
        value: row.total,
      })),
      value: (
        <NumberValue
          locale="en-SG"
          maximumFractionDigits={0}
          value={registration.total}
        />
      ),
      versus: versusMonth(previousRegistration?.month),
    });
  }

  const deregistrations = windowEndingAt(
    sumByMonth(deregistrationRows),
    month,
    DEREGISTRATION_MONTHS,
  );
  const deregistration = deregistrations.at(-1);
  const previousDeregistration = deregistrations.at(-2);
  // The population series is yearly and newest first; quote the latest year
  // that is not after the selected one.
  const fleet =
    populationTotals.find((row) => row.year <= year) ?? populationTotals[0];
  if (deregistration) {
    kpis.push({
      change: (
        <DeltaChip
          className={CHANGE_CLASS}
          value={
            changeRatio(deregistration.total, previousDeregistration?.total) *
            100
          }
        />
      ),
      label: "Vehicle deregistrations",
      note: fleet ? (
        <>
          <NumberValue
            locale="en-SG"
            maximumFractionDigits={0}
            value={fleet.total}
          />{" "}
          vehicles on the road
        </>
      ) : (
        formatMonthLabel(deregistration.month)
      ),
      spark: deregistrations.map((row) => ({
        label: formatMonthLabel(row.month),
        value: row.total,
      })),
      value: (
        <NumberValue
          locale="en-SG"
          maximumFractionDigits={0}
          value={deregistration.total}
        />
      ),
      // The deregistration feed can trail registrations, so a trailing month
      // is named rather than passed off as the page's month.
      versus:
        deregistration.month === month
          ? versusMonth(previousDeregistration?.month)
          : `in ${formatMonthName(deregistration.month)}, ${versusMonth(previousDeregistration?.month)}`,
    });
  }

  const premiums = windowEndingAt(
    coeTrends["Category A"] ?? [],
    month,
    SPARK_MONTHS,
  );
  const premium = premiums.at(-1);
  const previousPremium = premiums.at(-2);
  if (premium) {
    kpis.push({
      change: (
        <DeltaChip
          className={CHANGE_CLASS}
          value={changeRatio(premium.premium, previousPremium?.premium) * 100}
        />
      ),
      label: "COE, Category A",
      note: `Latest exercise, ${formatMonthName(premium.month)}`,
      spark: premiums.map((point) => ({
        label: formatMonthLabel(point.month),
        value: point.premium,
      })),
      sparkFormat: { currency: "SGD", style: "currency" },
      value: (
        <NumberValue
          currency="SGD"
          locale="en-SG"
          maximumFractionDigits={0}
          style="currency"
          value={premium.premium}
        />
      ),
      versus: versusMonth(previousPremium?.month),
    });
  }

  const evIndex = resolveMonthIndex(
    evTrend.map((point) => point.month),
    month,
  );
  if (evIndex >= 0) {
    const shares = batteryElectricShares(evTrend, evMarketShare);
    const share = shares[evIndex] ?? 0;
    const previousShare = evIndex > 0 ? shares[evIndex - 1] : undefined;
    const start = Math.max(0, evIndex - SPARK_MONTHS + 1);
    kpis.push({
      change: (
        <DeltaChip
          className={CHANGE_CLASS}
          unit="pp"
          value={share - (previousShare ?? share)}
        />
      ),
      label: "EV share of new cars",
      note: "Battery-electric only",
      spark: evTrend.slice(start, evIndex + 1).map((point, offset) => ({
        label: formatMonthLabel(point.month),
        value: Number((shares[start + offset] ?? 0).toFixed(1)),
      })),
      sparkFormat: { maximumFractionDigits: 1, style: "unit", unit: "percent" },
      value: `${share.toFixed(1)}%`,
      versus: versusMonth(evTrend[evIndex - 1]?.month),
    });
  }

  if (kpis.length === 0) {
    return null;
  }

  const summary = summariseMonth(
    registrations,
    month,
    "new cars registered",
    premium
      ? `Category A COE closed at ${formatCurrency(premium.premium)} in the ${biddingOrdinal(premium.biddingNo)} bidding of ${formatMonthName(premium.month)}`
      : undefined,
  );

  return (
    <div className="flex flex-col gap-2.5">
      <div className="grid grid-cols-2 border-separator border-y lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Kpi key={kpi.label} {...kpi} />
        ))}
      </div>
      {summary ? (
        <Typography.Paragraph className="tabular-nums" color="muted" size="sm">
          {summary}
        </Typography.Paragraph>
      ) : null}
      <SourceNote>
        Change is against the previous month; colour is not used for direction.
        Sparklines show the last {SPARK_MONTHS} months ({DEREGISTRATION_MONTHS}{" "}
        for deregistrations).
      </SourceNote>
    </div>
  );
}

/** "vs July"; "vs the previous month" when there is none on record. */
function versusMonth(month: string | undefined): string {
  return month ? `vs ${formatMonthName(month)}` : "vs the previous month";
}
