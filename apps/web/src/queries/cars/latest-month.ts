import { cars, db, desc } from "@motormetrics/database";
import { cacheLife, cacheTag } from "next/cache";

/**
 * Get the latest month with car registration data
 */
export async function getCarsLatestMonth(): Promise<string | null> {
  "use cache";
  cacheLife("max");
  cacheTag("cars:months");

  const result = await db.query.cars.findFirst({
    columns: { month: true },
    orderBy: desc(cars.month),
  });

  return result?.month ?? null;
}
