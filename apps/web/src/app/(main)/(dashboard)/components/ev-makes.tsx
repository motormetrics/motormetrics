import { cn, Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { slugify } from "@motormetrics/utils/slugify";
import {
  batteryElectricMakes,
  resolveMonthIndex,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-series";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import { SectionHead, SectionLink } from "@web/components/shared/overview";
import { getEvMonthlyTrend } from "@web/queries/cars";
import { getTopMakesByFuelType } from "@web/queries/cars/market-insights";
import { getEvChargingNetworkSummary } from "@web/queries/ev-charging";
import { getCarLogoMap } from "@web/queries/logos";
import { formatMonthLabel } from "@web/utils/dates/format-month";
import { getLatestMonth } from "@web/utils/dates/months";

const TOP_MAKES = 3;

const ROW_GRID =
  "grid grid-cols-[20px_minmax(0,1fr)_64px_56px] items-center gap-3";

/**
 * The month's three biggest battery-electric makes, then the size of the
 * public charging network. The live connector state and per-kWh rates stay
 * on the charging pages: they refresh hourly, and the homepage carries
 * nothing that would regenerate its shell that often.
 */
export async function EvMakes() {
  const month = await getLatestMonth("cars");
  const [trend, fuelTypes, logoUrlBySlug, network] = await Promise.all([
    getEvMonthlyTrend(),
    getTopMakesByFuelType(month),
    getCarLogoMap(),
    getEvChargingNetworkSummary(),
  ]);

  const point =
    trend[
      resolveMonthIndex(
        trend.map((entry) => entry.month),
        month,
      )
    ];
  const makes = batteryElectricMakes(fuelTypes).slice(0, TOP_MAKES);
  const monthTotal = point?.BEV || 1;

  return (
    <section className="flex min-w-0 flex-col gap-[18px]">
      <SectionHead
        caption={`${formatMonthLabel(point?.month ?? month)} · battery-electric registrations`}
        eyebrow="Electric vehicles"
        title="Top EV makes"
      />

      {makes.length > 0 ? (
        <div className="flex flex-col">
          <div
            className={cn(
              ROW_GRID,
              "border-border border-b pb-2 font-semibold text-muted text-xs",
            )}
          >
            <span>#</span>
            <span>Make</span>
            <span className="text-right">Cars</span>
            <span className="text-right">Share</span>
          </div>
          <ol className="flex flex-col">
            {makes.map((item, rank) => (
              <li
                className={cn(ROW_GRID, "border-separator border-b py-2.5")}
                key={item.make}
              >
                <span className="text-muted text-sm tabular-nums">
                  {rank + 1}
                </span>
                <span className="flex min-w-0 items-center gap-2.5">
                  <MakeAvatar
                    logoUrl={logoUrlBySlug[slugify(item.make)] ?? null}
                    make={item.make}
                    size="sm"
                  />
                  <span className="truncate font-medium text-sm">
                    {item.make}
                  </span>
                </span>
                <span className="text-right font-semibold text-sm tabular-nums">
                  <NumberValue
                    locale="en-SG"
                    maximumFractionDigits={0}
                    value={item.count}
                  />
                </span>
                <span className="text-right text-muted-strong text-sm tabular-nums">
                  {((item.count / monthTotal) * 100).toFixed(1)}%
                </span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {network.connectors > 0 ? (
        <div className="flex flex-col items-start gap-1 pt-1.5">
          <Typography.Paragraph weight="semibold" color="muted" size="xs">
            Public charging
          </Typography.Paragraph>
          <Typography.Paragraph className="tabular-nums">
            <span className="font-extrabold text-[1.625rem] tracking-[-0.02em]">
              <NumberValue
                locale="en-SG"
                maximumFractionDigits={0}
                value={network.connectors}
              />
            </span>{" "}
            connectors at{" "}
            <span className="font-semibold">
              <NumberValue
                locale="en-SG"
                maximumFractionDigits={0}
                value={network.sites}
              />
            </span>{" "}
            locations
          </Typography.Paragraph>
          <SectionLink className="ml-0" href="/cars/electric-vehicles/charging">
            Live availability and rates
          </SectionLink>
        </div>
      ) : null}
    </section>
  );
}
