import type { SelectCOE } from "@motormetrics/database/schema";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import type { CoePremiumsProps } from "@web/lib/og/cards/coe-premiums";
import type { CoeResultsProps } from "@web/lib/og/cards/coe-results";
import type { FuelMixProps, FuelSlice } from "@web/lib/og/cards/fuel-mix";
import type { MakeProps } from "@web/lib/og/cards/make";
import type { RegistrationsProps } from "@web/lib/og/cards/registrations";
import type { SiteDefaultProps } from "@web/lib/og/cards/site-default";
import { OG_COLOURS } from "@web/lib/og/colours";
import {
  getCarsComparison,
  getCarsData,
  getCarsLatestMonth,
  getMakeDetails,
  getMakeFromSlug,
  getMonthlyRegistrationTotals,
  getTopMakes,
  getYearToDateByFuelType,
} from "@web/queries/cars";
import { getCoeCategoryTrends, getExercisePair } from "@web/queries/coe";
import type { RegistrationStat } from "@web/types/cars";
import { shiftMonth } from "@web/utils/dates/month-arithmetic";

type CardData<Props> = Omit<Props, "height">;

const TREND_POINTS = 8;
const TOP_MAKES = 5;

const formatCount = (value: number) => value.toLocaleString("en-SG");

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

const shortMonth = (month: string) => formatDateToMonthYear(month).slice(0, 3);

const percentChange = (current: number, previous: number | undefined) =>
  previous ? ((current - previous) / previous) * 100 : 0;

const findCategory = (results: SelectCOE[], category: string) =>
  results.find((result) => result.vehicleClass === category);

/** The latest bidding exercise's rows and the one before it, empty when absent. */
const loadLatestExercises = async () => {
  const { current, previous } = await getExercisePair();

  return { latest: current?.rows ?? [], previous: previous?.rows ?? [] };
};

/**
 * Buckets LTA fuel types into the four slices the fuel-mix card draws.
 * Plug-in and conventional hybrids share the hybrid slice.
 */
const toFuelSlices = (
  fuelTypes: RegistrationStat[],
  total: number,
): FuelSlice[] => {
  const counts = { petrol: 0, electric: 0, hybrid: 0, diesel: 0 };

  for (const { name, count } of fuelTypes) {
    if (name === "Electric") {
      counts.electric += count;
    } else if (name.includes("Electric")) {
      counts.hybrid += count;
    } else if (name === "Diesel") {
      counts.diesel += count;
    } else {
      counts.petrol += count;
    }
  }

  const share = (count: number) => (total ? (count / total) * 100 : 0);

  return [
    {
      label: "Petrol",
      share: share(counts.petrol),
      colour: OG_COLOURS.fuel.petrol,
    },
    {
      label: "Electric",
      share: share(counts.electric),
      colour: OG_COLOURS.fuel.electric,
    },
    {
      label: "Hybrid",
      share: share(counts.hybrid),
      colour: OG_COLOURS.fuel.hybrid,
    },
    {
      label: "Diesel",
      share: share(counts.diesel),
      colour: OG_COLOURS.fuel.diesel,
    },
  ];
};

/** 01 · Site default */
export async function loadSiteDefault(): Promise<CardData<SiteDefaultProps>> {
  const [{ latest }, month] = await Promise.all([
    loadLatestExercises(),
    getCarsLatestMonth(),
  ]);
  const registrations = month ? await getCarsData(month) : null;
  const categoryA = findCategory(latest, "Category A");
  const electric = registrations
    ? toFuelSlices(registrations.fuelType, registrations.total).find(
        (slice) => slice.label === "Electric",
      )
    : undefined;

  return {
    coePremium: categoryA ? formatCurrency(categoryA.premium) : "—",
    registrations: registrations ? formatCount(registrations.total) : "—",
    electricShare: electric ? formatPercent(electric.share) : "—",
    monthLabel: month ? formatDateToMonthYear(month) : "",
  };
}

/** 02 · COE bidding results */
export async function loadCoeResults(): Promise<CardData<CoeResultsProps> | null> {
  const { latest, previous } = await loadLatestExercises();
  const categoryA = findCategory(latest, "Category A");
  const categoryB = findCategory(latest, "Category B");

  if (!categoryA) {
    return null;
  }

  return {
    monthLabel: formatDateToMonthYear(categoryA.month),
    headline: categoryB
      ? `Cat A closes at ${formatCurrency(categoryA.premium)}, Cat B at ${formatCurrency(categoryB.premium)}`
      : `Cat A closes at ${formatCurrency(categoryA.premium)}`,
    categories: latest.map((result) => ({
      label: result.vehicleClass.replace("Category", "Cat"),
      premium: formatCurrency(result.premium),
      delta: percentChange(
        result.premium,
        findCategory(previous, result.vehicleClass)?.premium,
      ),
    })),
  };
}

/** 03 · Cat A and Cat B premiums */
export async function loadCoePremiums(): Promise<CardData<CoePremiumsProps> | null> {
  const [{ latest, previous }, trendsA, trendsB] = await Promise.all([
    loadLatestExercises(),
    getCoeCategoryTrends("Category A"),
    getCoeCategoryTrends("Category B"),
  ]);
  const currentA = findCategory(latest, "Category A");
  const currentB = findCategory(latest, "Category B");

  if (!currentA || !currentB) {
    return null;
  }

  const series = (
    current: SelectCOE,
    trends: { month: string; premium: number }[],
  ) => {
    const recent = trends.slice(-TREND_POINTS);

    return {
      label: current.vehicleClass.replace("Category", "Cat"),
      premium: formatCurrency(current.premium),
      delta: percentChange(
        current.premium,
        findCategory(previous, current.vehicleClass)?.premium,
      ),
      trend: recent.map((point) => point.premium),
      fromMonth: recent[0]?.month,
    };
  };
  const [seriesA, seriesB] = [
    series(currentA, trendsA),
    series(currentB, trendsB),
  ];
  const fromMonth = seriesA.fromMonth ?? seriesB.fromMonth;

  return {
    categories: [seriesA, seriesB],
    fromLabel: fromMonth ? formatDateToMonthYear(fromMonth) : "",
    monthLabel: formatDateToMonthYear(currentA.month),
  };
}

/** 04 · New car registrations */
export async function loadRegistrations(): Promise<CardData<RegistrationsProps> | null> {
  const month = await getCarsLatestMonth();

  if (!month) {
    return null;
  }

  const year = Number(month.slice(0, 4));
  const [registrations, comparison, totals, yearToDate] = await Promise.all([
    getCarsData(month),
    getCarsComparison(month),
    getMonthlyRegistrationTotals(TREND_POINTS),
    getYearToDateByFuelType(year),
  ]);

  return {
    monthLabel: formatDateToMonthYear(month),
    total: formatCount(registrations.total),
    delta: percentChange(registrations.total, comparison.previousMonth.total),
    previousMonthLabel: shortMonth(shiftMonth(month, -1)),
    yearToDate: formatCount(
      yearToDate.reduce((sum, fuelType) => sum + fuelType.count, 0),
    ),
    columns: totals.map((point) => ({
      label: shortMonth(point.month),
      total: point.total,
    })),
  };
}

/** 05 · Make page */
export async function loadMake(
  slug: string,
): Promise<CardData<MakeProps> | null> {
  const [make, month] = await Promise.all([
    getMakeFromSlug(slug),
    getCarsLatestMonth(),
  ]);

  if (!make || !month) {
    return null;
  }

  const [topMakes, registrations, details] = await Promise.all([
    getTopMakes(month),
    getCarsData(month),
    getMakeDetails(make, month),
  ]);
  const matches = (candidate: string) =>
    candidate.toLowerCase() === make.toLowerCase();
  const rankIndex = topMakes.findIndex((entry) => matches(entry.make));
  const own = { make, total: details.total };

  const bars = topMakes
    .slice(0, TOP_MAKES)
    .map((entry) => (matches(entry.make) ? own : entry));
  if (!bars.some((entry) => entry.make === make)) {
    bars.splice(TOP_MAKES - 1, 1, own);
  }

  return {
    monthLabel: formatDateToMonthYear(month),
    make,
    rank: rankIndex === -1 ? null : rankIndex + 1,
    total: formatCount(details.total),
    share: formatPercent(
      registrations.total ? (details.total / registrations.total) * 100 : 0,
    ),
    bars,
  };
}

/** 06 · EV and fuel-type share */
export async function loadFuelMix(): Promise<CardData<FuelMixProps> | null> {
  const month = await getCarsLatestMonth();

  if (!month) {
    return null;
  }

  const registrations = await getCarsData(month);
  const slices = toFuelSlices(registrations.fuelType, registrations.total);
  const electric = slices.find((slice) => slice.label === "Electric");

  return {
    monthLabel: formatDateToMonthYear(month),
    electricShare: electric?.share ?? 0,
    slices,
  };
}
