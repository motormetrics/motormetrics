import { db } from "@motormetrics/database/client";
import { coeRevalidation } from "@motormetrics/database/schema";
import { asc, inArray } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

// Car categories only: C (goods vehicles and buses) and D (motorcycles) are out
// of scope, and A and B are always shown together.
const CAR_CATEGORIES = ["Category A", "Category B"];

/**
 * Monthly COE revalidations for Categories A and B, oldest first, one row per
 * month, term ("5 Year" or "10 Year") and category.
 */
export async function getCarCoeRevalidations() {
  "use cache";
  cacheLife("max");
  cacheTag("coe-revalidation:months");

  return db
    .select({
      month: coeRevalidation.month,
      type: coeRevalidation.type,
      category: coeRevalidation.category,
      number: coeRevalidation.number,
    })
    .from(coeRevalidation)
    .where(inArray(coeRevalidation.category, CAR_CATEGORIES))
    .orderBy(
      asc(coeRevalidation.month),
      asc(coeRevalidation.category),
      asc(coeRevalidation.type),
    );
}
