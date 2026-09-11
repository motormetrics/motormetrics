import { db } from "@motormetrics/database/client";
import { deregistrations } from "@motormetrics/database/schema";
import { desc } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

/**
 * Get available months in descending order (for dropdowns/selectors)
 */
export async function getDeregistrationsMonths() {
  "use cache";
  cacheLife("max");
  cacheTag("deregistrations:months");

  return db
    .selectDistinct({ month: deregistrations.month })
    .from(deregistrations)
    .orderBy(desc(deregistrations.month));
}
