import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import { deriveChargingNetworkGrowth } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/charging-network";
import {
  loadEvMonth,
  type SelectionProps,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-report";
import { CHARGING_POINT_TARGET_2030 } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/constants";
import { type KpiTile, KpiTiles } from "@web/components/shared/kpi-tiles";
import {
  getEvChargingNetworkSummary,
  getEvChargingRegistrationsByMonth,
} from "@web/queries/ev-charging";
import {
  formatMonthLabel,
  formatMonthName,
} from "@web/utils/dates/format-month";
import { shiftMonth } from "@web/utils/dates/month-arithmetic";
import { getLatestMonth } from "@web/utils/dates/months";

/** Months each tile's sparkline covers. */
const TREND_MONTHS = 12;

/**
 * The numbers the EV page leads with, for the selected month: the
 * battery-electric share, the electrified share, and the public charging
 * network, which links to the charging page.
 */
export async function EvKpis({ selection }: SelectionProps) {
  const { month } = await selection;
  const [data, network, monthly] = await Promise.all([
    loadEvMonth(month),
    getEvChargingNetworkSummary(),
    getEvChargingRegistrationsByMonth(),
  ]);

  const tiles: KpiTile[] = [];

  if (data) {
    const start = Math.max(0, data.index - TREND_MONTHS + 1);
    const label = data.previousMonth
      ? `vs ${formatMonthName(data.previousMonth)}`
      : undefined;

    tiles.push(
      {
        change:
          data.previousShare !== undefined
            ? { label, value: data.share - data.previousShare }
            : undefined,
        format: "percent",
        note: `of new cars, ${formatMonthLabel(data.point.month)}`,
        title: "Battery-electric share",
        trend: data.shares.slice(start, data.index + 1),
        value: data.share,
      },
      {
        change:
          data.previousElectrifiedShare !== undefined
            ? {
                label,
                value: data.electrifiedShare - data.previousElectrifiedShare,
              }
            : undefined,
        format: "percent",
        note: "Battery-electric, plug-in and hybrid",
        title: "Electrified share",
        value: data.electrifiedShare,
      },
    );
  }

  if (network.connectors > 0) {
    const growth = deriveChargingNetworkGrowth(monthly);
    tiles.push({
      change:
        growth?.growthPercent != null
          ? {
              label: `vs ${formatDateToMonthYear(shiftMonth(growth.asOf, -12))}`,
              value: growth.growthPercent,
            }
          : undefined,
      format: "count",
      href: "/cars/electric-vehicles/charging",
      note: `${((network.connectors / CHARGING_POINT_TARGET_2030) * 100).toFixed(0)}% of the 2030 target`,
      title: "Public charging points",
      value: network.connectors,
    });
  }

  return <KpiTiles tiles={tiles} />;
}

/** "LTA data to October 2026". Cached only, so part of the static shell. */
export async function EvAsOf() {
  const month = await getLatestMonth("cars");

  return <>LTA data to {formatMonthLabel(month)}</>;
}
