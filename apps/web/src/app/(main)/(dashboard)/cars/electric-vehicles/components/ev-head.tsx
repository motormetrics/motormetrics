import { Skeleton } from "@heroui/react";
import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
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
  KeyNumberGrid,
  KeyNumberItem,
  KeysAside,
} from "@web/components/shared/key-numbers";
import { RangeBar } from "@web/components/shared/range-bar";
import { RangeFigure, RangeHero } from "@web/components/shared/range-hero";
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
  { href: "#ev-trend", label: "Registrations by month" },
  { href: "#ev-mix", label: "New cars by fuel type" },
  { href: "#ev-makes", label: "Leading electric makes" },
  { href: "#ev-road", label: "On the road" },
  { href: "#ev-share", label: "Electric share by month" },
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
      <RangeFigure
        change={
          previousMonth && previousShare !== undefined
            ? `${formatPoints(share - previousShare)} vs ${formatMonthName(previousMonth)}`
            : undefined
        }
        value={`${share.toFixed(1)}%`}
      />
      {range ? (
        <RangeBar
          ariaLabel={`Electric share over the ${range.count} months to ${formatMonthLabel(month)}: low ${range.low.toFixed(1)}%, high ${range.high.toFixed(1)}%, now ${range.latest.toFixed(1)}%. ${range.where}.`}
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
 * The range hero: the electric share of the month's new
 * cars, its change on the month before, and where it sits in the trailing
 * year. The label is in the static shell; the figures wait on the month.
 */
export function EvHero({ selection }: SelectionProps) {
  return (
    <RangeHero
      label={
        <>
          <span className="font-semibold text-foreground">
            Electric share of new cars
          </span>{" "}
          ·{" "}
          <Suspense fallback=" ">
            <SelectedMonthName selection={selection} />
          </Suspense>
        </>
      }
    >
      <Suspense fallback={<Skeleton className="h-20 w-full" />}>
        <HeroFigures selection={selection} />
      </Suspense>
    </RangeHero>
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

/** Electric vehicles of every type on the road at the latest year end. */
async function loadElectricOnTheRoad() {
  const [byFuelType, totals] = await Promise.all([
    getVehiclePopulationByYearAndFuelType(),
    getVehiclePopulationYearlyTotals(),
  ]);
  // Yearly totals come back newest year first.
  const year = totals.at(0)?.year;

  const total = byFuelType
    .filter(
      (row) =>
        row.year === year && row.fuelType === ELECTRIC_POPULATION_FUEL_TYPE,
    )
    .reduce((sum, row) => sum + row.total, 0);

  return { total, year };
}

async function EvKeyNumberItems({ selection }: SelectionProps) {
  const { month } = await selection;
  const [data, onTheRoad, network, monthly] = await Promise.all([
    loadEvMonth(month),
    loadElectricOnTheRoad(),
    getEvChargingNetworkSummary(),
    getEvChargingRegistrationsByMonth(),
  ]);
  const growth = deriveChargingNetworkGrowth(monthly);
  const monthLabel = data ? formatMonthLabel(data.point.month) : "";

  const keyNumbers = [
    ...(data
      ? [
          {
            label: `Share of new cars, ${monthLabel}`,
            note:
              data.previousMonth && data.previousShare !== undefined
                ? `${formatPoints(data.share - data.previousShare)} on ${formatMonthName(data.previousMonth)}`
                : undefined,
            value: `${data.share.toFixed(1)}%`,
          },
          {
            label: `New electric cars, ${monthLabel}`,
            note: `of ${formatCount(data.total)} new cars`,
            value: formatCount(data.point.BEV),
          },
          {
            label: `Electric, petrol-electric and diesel-electric share, ${monthLabel}`,
            note:
              data.previousMonth && data.previousElectrifiedShare !== undefined
                ? `${formatPoints(data.electrifiedShare - data.previousElectrifiedShare)} on ${formatMonthName(data.previousMonth)}`
                : undefined,
            value: `${data.electrifiedShare.toFixed(1)}%`,
          },
        ]
      : []),
    ...(onTheRoad.total > 0
      ? [
          {
            label: "Electric vehicles on the road",
            note: `All vehicle types, 31 December ${onTheRoad.year}`,
            value: formatCount(onTheRoad.total),
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

  return keyNumbers.map((keyNumber) => (
    <KeyNumberItem key={keyNumber.label} {...keyNumber} />
  ));
}

/**
 * The key numbers in the right sidebar, under the filters, then links to
 * each figure.
 */
export function EvKeyNumbers({ selection }: SelectionProps) {
  return (
    <KeysAside
      eyebrow="Electric cars"
      jump={JUMP_LINKS}
      label="Key numbers"
      source="Source: LTA via DataMall; charging points from LTA."
    >
      <KeyNumberGrid besideHead={4}>
        <Suspense
          fallback={<Skeleton className="col-span-full my-4 h-16 w-full" />}
        >
          <EvKeyNumberItems selection={selection} />
        </Suspense>
      </KeyNumberGrid>
    </KeysAside>
  );
}
