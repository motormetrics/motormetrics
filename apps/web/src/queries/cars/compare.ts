import { getCarsData } from "@web/queries/cars/monthly-registrations";
import type { Registration } from "@web/types/cars";

export interface ComparisonData {
  monthA: Registration;
  monthB: Registration;
}

export async function getComparisonData(
  monthA: string,
  monthB: string,
): Promise<ComparisonData> {
  const [dataA, dataB] = await Promise.all([
    getCarsData(monthA),
    getCarsData(monthB),
  ]);

  return { monthA: dataA, monthB: dataB };
}
