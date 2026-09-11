import type { Registration } from "@web/types/cars";
import { cacheLife, cacheTag } from "next/cache";
import { getCarsData } from "./monthly-registrations";

export interface ComparisonData {
  monthA: Registration;
  monthB: Registration;
}

export async function getComparisonData(
  monthA: string,
  monthB: string,
): Promise<ComparisonData> {
  "use cache";
  cacheLife("max");
  cacheTag(`cars:month:${monthA}`, `cars:month:${monthB}`);

  const [dataA, dataB] = await Promise.all([
    getCarsData(monthA),
    getCarsData(monthB),
  ]);

  return { monthA: dataA, monthB: dataB };
}
