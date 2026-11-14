import { Chip, Skeleton, Typography } from "@heroui/react";
import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import { RangeBar } from "@web/app/(main)/(dashboard)/cars/deregistrations/components/range-bar";
import { deriveChargingNetworkGrowth } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/charging-network";
import {
  loadEvMonth,
  type SelectionProps,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-report";
import {
  evLeadSentence,
  formatPoints,
  shareRange,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-summary";
import {
  CHARGING_POINT_TARGET_2030,
  ELECTRIC_POPULATION_FUEL_TYPE,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/constants";
import {
  getEvChargingNetworkSummary,
  getEvChargingRegistrationsByMonth,
} from "@web/queries/ev-charging";
import {
  getVehiclePopulationByYearAndFuelType,
  getVehiclePopulationYearlyTotals,
} from "@web/queries/vehicle-population";
import {
  formatMonthLabel,
  formatMonthName,
} from "@web/utils/dates/format-month";
import { shiftMonth } from "@web/utils/dates/month-arithmetic";
import { Suspense } from "react";

/** Months the range bar under the headline share spans. */
const RANGE_MONTHS = 12;

const formatCount = (value: number) => value.toLocaleString("en-SG");

/** The links the comp lists under the key numbers, to each figure below. */
const JUMP_LINKS = [
  { href: "#ev-mix", label: "Electrified mix" },
  { href: "#ev-trend", label: "Registrations trend" },
  { href: "#ev-makes", label: "Makes and adoption" },
  { href: "#ev-charging", label: "Charging and incentives" },
];

/** "August 2026", wherever a label names the selected month. */
export async function SelectedMonth({ selection }: SelectionProps) {
  const { month } = await selection;

  return formatMonthLabel(month);
}

/** "August", for labels that carry the year elsewhere. */
export async function SelectedMonthName({ selection }: SelectionProps) {
  const { month } = await selection;

  return formatMonthName(month);
}

async function HeroFigures({ selection }: SelectionProps) {
  const { month } = await selection;
  const data = await loadEvMonth(month);
  if (!data) {
    return null;
  }

  const { index, previousMonth, previousShare, share, shares } = data;
  const range = shareRange(shares, index, RANGE_MONTHS);

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
        <span className="font-extrabold text-4xl tabular-nums leading-none tracking-tight">
          {share.toFixed(1)}%
        </span>
        {previousMonth && previousShare !== undefined ? (
          <Chip className="tabular-nums" color="accent" variant="soft">
            {`${formatPoints(share - previousShare)} vs ${formatMonthName(previousMonth)}`}
          </Chip>
        ) : null}
      </div>
      {range ? (
        <RangeBar
          ariaLabel={`EV share over the ${range.count} months to ${formatMonthLabel(month)}: low ${range.low.toFixed(1)}%, high ${range.high.toFixed(1)}%, now ${range.latest.toFixed(1)}%. ${range.where}.`}
          high={range.high}
          highLabel={`High ${range.high.toFixed(1)}%`}
          low={range.low}
          lowLabel={`${range.count}-month low ${range.low.toFixed(1)}%`}
          value={range.latest}
          where={range.where}
        />
      ) : null}
    </>
  );
}

/**
 * Direction D's range hero: the battery-electric share of the month's new
 * cars, its change on the month before, and where it sits in the trailing
 * year. The label is in the static shell; the figures wait on the month.
 */
export function EvHero({ selection }: SelectionProps) {
  return (
    <div className="flex max-w-xl flex-col gap-2.5 border-separator border-t pt-4">
      <Typography.Paragraph color="muted" size="sm">
        <span className="font-semibold text-foreground">
          EV share of new registrations
        </span>{" "}
        ·{" "}
        <Suspense fallback=" ">
          <SelectedMonthName selection={selection} />
        </Suspense>
      </Typography.Paragraph>
      <Suspense fallback={<Skeleton className="h-20 w-full" />}>
        <HeroFigures selection={selection} />
      </Suspense>
    </div>
  );
}

export async function EvLead({ selection }: SelectionProps) {
  const { month } = await selection;
  const data = await loadEvMonth(month);
  if (!data) {
    return null;
  }

  return evLeadSentence({
    batteryElectric: data.point.BEV,
    electrifiedShare: data.electrifiedShare,
    month: data.point.month,
    share: data.share,
    total: data.total,
  });
}

/** Battery-electric vehicles of every class on the road, latest year. */
async function loadElectricFleet() {
  const [byFuelType, totals] = await Promise.all([
    getVehiclePopulationByYearAndFuelType(),
    getVehiclePopulationYearlyTotals(),
  ]);
  // Yearly totals come back newest year first.
  const year = totals.at(0)?.year;

  return byFuelType
    .filter(
      (row) =>
        row.year === year && row.fuelType === ELECTRIC_POPULATION_FUEL_TYPE,
    )
    .reduce((sum, row) => sum + row.total, 0);
}

async function KeyNumberList({ selection }: SelectionProps) {
  const { month } = await selection;
  const [data, fleet, network, monthly] = await Promise.all([
    loadEvMonth(month),
    loadElectricFleet(),
    getEvChargingNetworkSummary(),
    getEvChargingRegistrationsByMonth(),
  ]);
  const growth = deriveChargingNetworkGrowth(monthly);
  const monthName = data ? formatMonthName(data.point.month) : "";

  const keyNumbers = [
    ...(data
      ? [
          {
            label: `Battery-electric cars, ${monthName}`,
            note: `of ${formatCount(data.total)} new cars`,
            value: formatCount(data.point.BEV),
          },
          {
            label: `Electrified share, ${monthName}`,
            note:
              data.previousMonth && data.previousElectrifiedShare !== undefined
                ? `${formatPoints(data.electrifiedShare - data.previousElectrifiedShare)} vs ${formatMonthName(data.previousMonth)}`
                : "Battery-electric and hybrids",
            value: `${data.electrifiedShare.toFixed(1)}%`,
          },
        ]
      : []),
    ...(fleet > 0
      ? [
          {
            label: "EVs on the road",
            note: "The fleet, not new registrations",
            value: formatCount(fleet),
          },
        ]
      : []),
    ...(network.connectors > 0
      ? [
          {
            label: "Public charging points",
            note: [
              growth?.growthPercent != null
                ? `${growth.growthPercent >= 0 ? "+" : "−"}${Math.abs(growth.growthPercent).toFixed(0)}% on ${formatDateToMonthYear(shiftMonth(growth.asOf, -12))}`
                : null,
              `${((network.connectors / CHARGING_POINT_TARGET_2030) * 100).toFixed(1)}% of the 2030 target`,
            ]
              .filter(Boolean)
              .join(" · "),
            value: formatCount(network.connectors),
          },
        ]
      : []),
  ];

  return keyNumbers.map(({ label, note, value }) => (
    <div
      className="flex flex-col gap-0.5 border-separator border-b py-3"
      key={label}
    >
      <dt className="font-semibold text-muted text-xs">{label}</dt>
      <dd className="font-semibold text-xl tabular-nums">{value}</dd>
      <dd className="text-muted text-xs tabular-nums">{note}</dd>
    </div>
  ));
}

/**
 * The key numbers beside the page head, then links to each figure. They sit
 * in their own column of the head grid, so on a wide page they start level
 * with the title.
 */
export function EvKeyNumbers({ selection }: SelectionProps) {
  return (
    <aside aria-label="Key numbers" className="flex flex-col gap-3">
      <Typography.Paragraph
        className="uppercase"
        color="muted"
        size="xs"
        weight="semibold"
      >
        Key numbers
      </Typography.Paragraph>
      {/* Four across, under the head or in its right half. */}
      <dl className="grid @3xl:grid-cols-4 grid-cols-2 gap-x-6 border-separator border-t">
        <Suspense
          fallback={<Skeleton className="col-span-full my-3 h-16 w-full" />}
        >
          <KeyNumberList selection={selection} />
        </Suspense>
      </dl>
      <nav aria-label="On this page">
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
          {JUMP_LINKS.map(({ href, label }) => (
            <li key={href}>
              <a className="text-accent-strong no-underline" href={href}>
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <Typography.Paragraph color="muted" size="xs">
        Source: LTA via DataMall; charging points from LTA.
      </Typography.Paragraph>
    </aside>
  );
}
