import { ProgressBar, Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  batteryElectricMakes,
  resolveMonthIndex,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-series";
import { sumByMonth } from "@web/app/(main)/(dashboard)/components/overview-series";
import { DeltaChip } from "@web/components/shared/delta-chip";
import {
  getEvMonthlyTrend,
  getTopMakesByYear,
  getYearToDateByFuelType,
} from "@web/queries/cars";
import { getTopMakesByFuelType } from "@web/queries/cars/market-insights";
import { getPqpRates } from "@web/queries/coe";
import { getDeregistrations } from "@web/queries/deregistrations";
import { getEvChargingNetworkSummary } from "@web/queries/ev-charging";
import { changeRatio } from "@web/utils/change-ratio";
import {
  formatMonthLabel,
  formatMonthShortName,
} from "@web/utils/dates/format-month";
import { getLatestMonth } from "@web/utils/dates/months";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

/** The leader plus the two makes the runners-up line names. */
const TOP_MAKES = 3;

/**
 * The powertrains the fuel bar groups into. LTA records hybrids as
 * `Petrol-Electric`, `Diesel-Electric` and their plug-in variants, so anything
 * with an `-Electric` suffix folds into one hybrid segment.
 */
const POWERTRAINS = [
  {
    color: "var(--chart-1)",
    label: "Electric",
    match: (name: string) => name === "Electric",
  },
  {
    color: "var(--chart-3)",
    label: "Hybrid",
    match: (name: string) => name.includes("-Electric"),
  },
  {
    color: "var(--chart-sand)",
    label: "Petrol",
    match: (name: string) => name === "Petrol",
  },
  {
    color: "var(--muted)",
    label: "Diesel",
    match: (name: string) => name === "Diesel",
  },
];

const OTHER = { color: "var(--chart-5)", label: "Other" };

const percent = (part: number, whole: number) =>
  `${((part / whole) * 100).toFixed(1)}%`;

/** "Then BMW 12.1%, Toyota 9.8%" for the makes behind the leader. */
const runnersUp = (
  makes: { make: string; count: number }[],
  total: number,
): string | null =>
  makes.length > 0
    ? `Then ${makes.map((item) => `${item.make} ${percent(item.count, total)}`).join(", ")}`
    : null;

/**
 * "Across the market": one white tile per corner of the market, each a link
 * to its page with a single figure and a bar or a muted line beneath.
 *
 * The feeds run on their own clocks — deregistrations trail registrations and
 * PQP is published for the coming month — so each tile names its own period.
 * A tile whose data is missing drops out rather than showing an empty frame.
 */
export async function MarketTiles() {
  const month = await getLatestMonth("cars");
  const year = Number(month.slice(0, 4));
  const [
    topMakes,
    fuelTypes,
    pqpRates,
    deregistrations,
    evTrend,
    evFuelTypes,
    network,
  ] = await Promise.all([
    getTopMakesByYear(year, TOP_MAKES),
    getYearToDateByFuelType(year),
    getPqpRates(),
    getDeregistrations(),
    getEvMonthlyTrend(),
    getTopMakesByFuelType(month),
    getEvChargingNetworkSummary(),
  ]);

  const yearTotal = fuelTypes.reduce((sum, item) => sum + item.count, 0);
  const [leader, ...chasers] = topMakes;

  const slices = POWERTRAINS.map((powertrain) => ({
    color: powertrain.color,
    label: powertrain.label,
    value: fuelTypes
      .filter((item) => powertrain.match(item.name))
      .reduce((sum, item) => sum + item.count, 0),
  }));
  const accounted = slices.reduce((sum, slice) => sum + slice.value, 0);
  if (yearTotal > accounted) {
    slices.push({ ...OTHER, value: yearTotal - accounted });
  }
  const powertrains = slices
    .filter((slice) => slice.value > 0)
    .sort((left, right) => right.value - left.value);
  const [largestPowertrain, ...otherPowertrains] = powertrains;

  const [pqpMonth, previousPqpMonth] = Object.keys(pqpRates).sort().reverse();
  const pqp = pqpMonth ? pqpRates[pqpMonth]?.["Category A"] : undefined;
  const previousPqp = previousPqpMonth
    ? pqpRates[previousPqpMonth]?.["Category A"]
    : undefined;

  const deregistrationTotals = sumByMonth(deregistrations);
  const deregistration = deregistrationTotals.at(-1);
  const previousDeregistration = deregistrationTotals.at(-2);

  const evPoint =
    evTrend[
      resolveMonthIndex(
        evTrend.map((point) => point.month),
        month,
      )
    ];
  const [evLeader, ...evChasers] = batteryElectricMakes(evFuelTypes).slice(
    0,
    TOP_MAKES,
  );
  const evTotal = evPoint?.BEV ?? 0;

  return (
    <section className="flex flex-col gap-4">
      <Typography.Heading level={2}>Across the market</Typography.Heading>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
        {leader && yearTotal > 0 ? (
          <MarketTile
            figure={leader.make}
            href="/cars/makes"
            label={`Top make · ${year} to date`}
            note={runnersUp(
              chasers.map((item) => ({ make: item.make, count: item.value })),
              yearTotal,
            )}
          >
            <ProgressBar
              aria-label={`${leader.make} share of new cars this year`}
              className="gap-1.5"
              size="sm"
              value={(leader.value / yearTotal) * 100}
            >
              <span className="col-span-full text-muted-strong text-xs tabular-nums">
                {percent(leader.value, yearTotal)} of new cars
              </span>
              <ProgressBar.Track className="col-span-full">
                <ProgressBar.Fill />
              </ProgressBar.Track>
            </ProgressBar>
          </MarketTile>
        ) : null}

        {largestPowertrain ? (
          <MarketTile
            figure={largestPowertrain.label}
            href="/cars/fuel-types"
            label={`Fuel mix · ${year} to date`}
            note={otherPowertrains
              .slice(0, 2)
              .map(
                (slice) => `${slice.label} ${percent(slice.value, yearTotal)}`,
              )
              .join(", ")}
          >
            <div className="flex flex-col gap-1.5">
              <span className="text-muted-strong text-xs tabular-nums">
                {percent(largestPowertrain.value, yearTotal)} of new cars
              </span>
              <div
                aria-label={powertrains
                  .map(
                    (slice) =>
                      `${slice.label} ${percent(slice.value, yearTotal)}`,
                  )
                  .join(", ")}
                className="flex h-2 gap-0.5"
                role="img"
              >
                {powertrains.map((slice) => (
                  <span
                    className="block h-full"
                    key={slice.label}
                    style={{
                      background: slice.color,
                      width: percent(slice.value, yearTotal),
                    }}
                  />
                ))}
              </div>
            </div>
          </MarketTile>
        ) : null}

        {pqpMonth && pqp !== undefined ? (
          <MarketTile
            figure={formatCurrency(pqp)}
            href="/coe/pqp"
            label={`PQP, Category A · ${formatMonthLabel(pqpMonth)}`}
            note={
              previousPqpMonth && previousPqp !== undefined ? (
                <>
                  <DeltaChip value={changeRatio(pqp, previousPqp) * 100} /> vs{" "}
                  {formatMonthShortName(previousPqpMonth)}
                </>
              ) : null
            }
          />
        ) : null}

        {deregistration ? (
          <MarketTile
            figure={
              <NumberValue
                locale="en-SG"
                maximumFractionDigits={0}
                value={deregistration.total}
              />
            }
            href="/cars/deregistrations"
            label={`Deregistrations · ${formatMonthLabel(deregistration.month)}`}
            note={
              previousDeregistration ? (
                <>
                  <DeltaChip
                    value={
                      changeRatio(
                        deregistration.total,
                        previousDeregistration.total,
                      ) * 100
                    }
                  />{" "}
                  vs {formatMonthShortName(previousDeregistration.month)}
                </>
              ) : null
            }
          />
        ) : null}

        {/* The makes are read for `month`; a trend point from a fallback
            month would divide them by the wrong total. */}
        {evLeader && evPoint?.month === month && evTotal > 0 ? (
          <MarketTile
            figure={evLeader.make}
            href="/cars/electric-vehicles"
            label={`Top EV make · ${formatMonthLabel(evPoint.month)}`}
            note={runnersUp(evChasers, evTotal)}
          >
            <ProgressBar
              aria-label={`${evLeader.make} share of battery-electric registrations`}
              className="gap-1.5"
              size="sm"
              value={(evLeader.count / evTotal) * 100}
            >
              <span className="col-span-full text-muted-strong text-xs tabular-nums">
                {percent(evLeader.count, evTotal)} of battery-electric cars
              </span>
              <ProgressBar.Track className="col-span-full">
                <ProgressBar.Fill />
              </ProgressBar.Track>
            </ProgressBar>
          </MarketTile>
        ) : null}

        {network.connectors > 0 ? (
          <MarketTile
            figure={
              <NumberValue
                locale="en-SG"
                maximumFractionDigits={0}
                value={network.connectors}
              />
            }
            href="/cars/electric-vehicles/charging"
            label="Public charging"
            note={
              <>
                connectors at{" "}
                <NumberValue
                  locale="en-SG"
                  maximumFractionDigits={0}
                  value={network.sites}
                />{" "}
                locations
              </>
            }
          />
        ) : null}
      </div>
    </section>
  );
}

/**
 * One tile: a whole-tile link with its label and arrow on top, the figure,
 * then an optional bar and a muted line. Phone tiles are narrow, so the
 * figure steps down a size there and long make names wrap onto a second line
 * rather than being cut off.
 */
function MarketTile({
  children,
  figure,
  href,
  label,
  note,
}: {
  children?: ReactNode;
  figure: ReactNode;
  href: string;
  label: string;
  note?: ReactNode;
}) {
  return (
    <Link
      className="group flex min-w-0 flex-col gap-3 rounded-3xl border border-separator bg-surface p-4 text-foreground no-underline md:p-5"
      href={href}
    >
      <span className="flex items-start justify-between gap-2 font-semibold text-muted text-xs">
        {label}
        <ArrowRight
          aria-hidden
          className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
          strokeWidth={2.25}
        />
      </span>
      <span className="line-clamp-2 break-words font-extrabold text-xl tabular-nums leading-tight tracking-tight md:text-2xl">
        {figure}
      </span>
      {children}
      {note ? (
        <span className="mt-auto text-muted text-xs tabular-nums">{note}</span>
      ) : null}
    </Link>
  );
}
