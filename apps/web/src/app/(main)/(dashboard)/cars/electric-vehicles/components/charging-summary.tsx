import { Chip, ProgressBar, Typography } from "@heroui/react";
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
            <Chip
              className="rounded-full px-3.5 py-2 font-bold text-accent-strong text-sm tabular-nums"
              color="accent"
              variant="soft"
            >
              <Chip.Label className="px-0">
                {growth.growthPercent >= 0 ? "+" : "−"}
                {Math.abs(growth.growthPercent).toFixed(0)}% on{" "}
                {formatDateToMonthYear(shiftMonth(growth.asOf, -12))}
              </Chip.Label>
            </Chip>
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
        <ProgressBar
          aria-label="Share of the 2030 target installed"
          className="w-full"
          value={Math.min(targetShare, 100)}
        >
          <ProgressBar.Track className="h-3 rounded-full bg-surface-secondary">
            <ProgressBar.Fill className="rounded-full bg-accent" />
          </ProgressBar.Track>
        </ProgressBar>
        <Typography.Paragraph
          className="font-medium text-[13.5px]"
          color="muted"
          size="sm"
        >
          {targetShare.toFixed(0)}% of the 2030 target installed
        </Typography.Paragraph>
      </div>
    </div>
  );
}
