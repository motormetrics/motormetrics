import { db } from "@motormetrics/database/client";
import { coe, coeInterimResults } from "@motormetrics/database/schema";
import { and, eq, exists } from "drizzle-orm";

/**
 * Deletes the same-day results in `coe_interim_results` for every exercise the
 * DataMall CSV has now put in `coe`. Exercises the CSV has not delivered yet
 * stay, so a late CSV leaves the interim results serving. Returns the number
 * of rows deleted.
 */
export const evictInterimResults = async (): Promise<number> => {
  const { rowCount } = await db.delete(coeInterimResults).where(
    exists(
      db
        .select({ id: coe.id })
        .from(coe)
        .where(
          and(
            eq(coe.month, coeInterimResults.month),
            eq(coe.biddingNo, coeInterimResults.biddingNo),
          ),
        ),
    ),
  );
  return rowCount;
};
