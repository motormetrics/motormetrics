import { NumberValue } from "@heroui-pro/react";
import { formatDateToMonthYear } from "@motormetrics/utils";
import { deriveChargingNetworkGrowth } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/charging-network";
import { CHARGING_POINT_TARGET_2030 } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/constants";
import { shiftMonth } from "@web/app/(main)/(dashboard)/cars/makes/components/make-rows";
import { Headline, SectionHead } from "@web/components/shared/overview";
import {
  getEvChargingNetworkSummary,
  getEvChargingRegistrationsByMonth,
} from "@web/queries/ev-charging";

/**
 * Size of the public charging network against the 2030 target.
 *
 * Sourced from LTA DataMall's quarterly charging point registry; the section
 * is omitted until that registry has been ingested rather than showing an
 * invented figure.
 */
export async function ChargingSummary() {
  const [network, monthly] = await Promise.all([
    getEvChargingNetworkSummary(),
    getEvChargingRegistrationsByMonth(),
  ]);

  if (network.connectors <= 0) {
    return null;
  }

  const growth = deriveChargingNetworkGrowth(monthly);
  const targetShare = Math.min(
    (network.connectors / CHARGING_POINT_TARGET_2030) * 100,
    100,
  );

  return (
    <div className="flex flex-col gap-6">
      <SectionHead
        caption="Public charging points nationwide"
        eyebrow="Infrastructure"
        link={{
          href: "/cars/electric-vehicles/charging",
          label: "All charging data",
        }}
        title="Charging network"
      />

      <Headline
        caption={
          <>
            national target of{" "}
            <NumberValue
              locale="en-SG"
              maximumFractionDigits={0}
              value={CHARGING_POINT_TARGET_2030}
            />{" "}
            by 2030
          </>
        }
        delta={
          growth?.growthPercent != null ? (
            <span className="inline-flex items-center rounded-full bg-accent-soft px-3.5 py-2 font-bold text-accent-strong text-sm tabular-nums">
              {growth.growthPercent >= 0 ? "+" : "−"}
              {Math.abs(growth.growthPercent).toFixed(0)}% on{" "}
              {formatDateToMonthYear(shiftMonth(growth.asOf, -12))}
            </span>
          ) : undefined
        }
        size="md"
        value={
          <NumberValue
            locale="en-SG"
            maximumFractionDigits={0}
            value={network.connectors}
          />
        }
      />

      <div className="flex flex-col gap-3">
        <span
          aria-label={`${targetShare.toFixed(0)}% of the 2030 target installed`}
          className="block h-3 overflow-hidden rounded-full bg-surface-secondary"
          role="img"
        >
          <span
            className="block h-full rounded-full bg-accent"
            style={{ width: `${targetShare.toFixed(1)}%` }}
          />
        </span>
        <span className="font-medium text-[13.5px] text-muted">
          {targetShare.toFixed(0)}% of the 2030 target installed
        </span>
      </div>
    </div>
  );
}
