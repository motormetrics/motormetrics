import {
  ComparisonTable,
  getDefaultMonthB,
} from "@web/app/(main)/(dashboard)/cars/components/comparison-table";
import { TrendsComparison } from "@web/app/(main)/(dashboard)/cars/components/trends-comparison";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/search-params";
import { getComparisonData } from "@web/queries/cars/compare";
import { fetchMonthsForCars, getMonthOrLatest } from "@web/utils/dates/months";
import type { SearchParams } from "nuqs/server";
import { cache } from "react";

interface CompareProps {
  searchParams: Promise<SearchParams>;
}

/**
 * The two months being compared. Unset or unknown, the first follows the
 * page's month and the second is the month before it.
 */
const loadComparedMonths = cache(
  async (searchParams: Promise<SearchParams>) => {
    const {
      compareA,
      compareB,
      month: parsedMonth,
    } = await loadSearchParams(searchParams);
    const [months, { month }] = await Promise.all([
      fetchMonthsForCars(),
      getMonthOrLatest(parsedMonth, "cars"),
    ]);
    const defaultMonthA = month;
    const defaultMonthB = getDefaultMonthB(month, months);

    return {
      defaultMonthA,
      defaultMonthB,
      monthA: compareA && months.includes(compareA) ? compareA : defaultMonthA,
      monthB: compareB && months.includes(compareB) ? compareB : defaultMonthB,
      months,
    };
  },
);

/** The two month selects, for the section's header. */
export async function CompareMonthSelects({ searchParams }: CompareProps) {
  const { defaultMonthA, defaultMonthB, months } =
    await loadComparedMonths(searchParams);

  return (
    <TrendsComparison
      defaultMonthA={defaultMonthA}
      defaultMonthB={defaultMonthB}
      months={months}
    />
  );
}

/** The two months by fuel type, then by vehicle type. */
export async function CompareTables({ searchParams }: CompareProps) {
  const { monthA, monthB } = await loadComparedMonths(searchParams);
  const comparison = await getComparisonData(monthA, monthB);

  return (
    <div className="flex flex-col gap-8">
      <ComparisonTable
        column="Fuel type"
        monthA={comparison.monthA}
        monthB={comparison.monthB}
        totalLabel="All fuel types"
        type="fuelType"
      />
      <ComparisonTable
        column="Vehicle type"
        monthA={comparison.monthA}
        monthB={comparison.monthB}
        totalLabel="All vehicle types"
        type="vehicleType"
      />
    </div>
  );
}
