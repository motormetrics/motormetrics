import { asc, db, desc, pqp } from "@motormetrics/database";
import type { Pqp } from "@web/types/coe";
import { cacheLife, cacheTag } from "next/cache";

export async function getPqpRates(): Promise<Record<string, Pqp.Rates>> {
  "use cache";
  cacheLife("max");
  cacheTag("coe:pqp");

  const results = await db
    .select()
    .from(pqp)
    .orderBy(desc(pqp.month), asc(pqp.vehicleClass));

  return results.reduce<Record<string, Pqp.Rates>>(
    (groupedByMonth, { month, vehicleClass, pqp }) => {
      if (!groupedByMonth[month]) {
        groupedByMonth[month] = {} as Pqp.Rates;
      }
      groupedByMonth[month][vehicleClass as keyof Pqp.Rates] = pqp ?? 0;
      return groupedByMonth;
    },
    {},
  );
}
