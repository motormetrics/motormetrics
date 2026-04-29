import { asc, carCosts, db, desc, eq, max } from "@motormetrics/database";
import { cacheLife, cacheTag } from "next/cache";

export async function getLatestCarCosts() {
  "use cache";
  cacheLife("max");
  cacheTag("cars:costs:latest");

  const latestMonth = db.select({ month: max(carCosts.month) }).from(carCosts);

  return db
    .select()
    .from(carCosts)
    .where(eq(carCosts.month, latestMonth))
    .orderBy(asc(carCosts.make), asc(carCosts.model));
}
