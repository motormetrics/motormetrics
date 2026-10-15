import { ProgressBar, Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import { deriveChargingNetworkGrowth } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/charging-network";
import { CHARGING_POINT_TARGET_2030 } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/constants";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import {
  getEvChargingNetworkSummary,
  getEvChargingRegistrationsByMonth,
} from "@web/queries/ev-charging";
import { shiftMonth } from "@web/utils/dates/month-arithmetic";

/**
 * Size of the public charging network against the 2030 target. The hourly
 * live feed lives on the charging page, so this section never reads it.
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
    <section className="flex min-w-0 flex-col gap-4">
      <SectionHead
        caption="Public charging points nationwide"
        eyebrow="Infrastructure"
        link={{
          href: "/cars/electric-vehicles/charging",
          label: "All charging data",
        }}
        title="Charging network"
      />

      <div className="flex flex-wrap items-baseline gap-3">
        <span className="font-bold text-3xl tabular-nums tracking-tight">
          <NumberValue
            locale="en-SG"
            maximumFractionDigits={0}
            value={network.connectors}
          />
        </span>
        {growth?.growthPercent != null ? (
          <Typography.Paragraph
            className="tabular-nums"
            color="muted"
            size="sm"
          >
            <span className="font-semibold text-foreground">
              {growth.growthPercent >= 0 ? "+" : "−"}
              {Math.abs(growth.growthPercent).toFixed(0)}%
            </span>{" "}
            on {formatDateToMonthYear(shiftMonth(growth.asOf, -12))}
          </Typography.Paragraph>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3 text-muted-strong text-sm">
          <span>
            Progress to the national target of{" "}
            <NumberValue
              locale="en-SG"
              maximumFractionDigits={0}
              value={CHARGING_POINT_TARGET_2030}
            />{" "}
            by 2030
          </span>
          <span className="font-semibold text-foreground tabular-nums">
            {targetShare.toFixed(1)}%
          </span>
        </div>
        <ProgressBar
          aria-label="Share of the 2030 target installed"
          size="lg"
          value={targetShare}
        >
          <ProgressBar.Track>
            <ProgressBar.Fill />
          </ProgressBar.Track>
        </ProgressBar>
      </div>

      <SourceNote>
        Charging points from LTA, with the 2030 target of{" "}
        {CHARGING_POINT_TARGET_2030.toLocaleString("en-SG")}.
      </SourceNote>
    </section>
  );
}
