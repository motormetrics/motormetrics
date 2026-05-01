import { searchParams } from "@web/app/(main)/(dashboard)/cars/annual/search-params";
import { useQueryStates } from "nuqs";
import { useMemo } from "react";

/**
 * Resolves the effective year from URL search params, falling back to the
 * latest available year when the URL value doesn't exist in the dataset.
 */
export function useEffectiveYear(availableYears: number[]): number {
  const [{ year }] = useQueryStates(searchParams);

  return useMemo(() => {
    if (availableYears.includes(year)) return year;
    return availableYears[0] ?? year;
  }, [year, availableYears]);
}
