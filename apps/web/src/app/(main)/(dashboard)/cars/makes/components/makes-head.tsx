import { getCarsLatestMonth } from "@web/queries/cars";
import { formatMonthLabel } from "@web/utils/dates/format-month";

/** "LTA data to October 2026". */
export async function MakesAsOf() {
  const month = await getCarsLatestMonth();

  return month ? <>LTA data to {formatMonthLabel(month)}</> : null;
}
