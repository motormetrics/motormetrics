import { db } from "@motormetrics/database/client";
import { coeRevalidation } from "@motormetrics/database/schema";
import { max } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

/**
 * Get the latest month available in COE revalidation data
 */
export async function getCoeRevalidationLatestMonth() {
  "use cache";
  cacheLife("max");
  cacheTag("coe:revalidation:months");

  const [result] = await db
    .select({ month: max(coeRevalidation.month) })
    .from(coeRevalidation);

  return result;
}
