import { db } from "@motormetrics/database/client";
import { coe, coeInterimResults } from "@motormetrics/database/schema";
import type { COEResult } from "@web/types";
import { and, eq } from "drizzle-orm";

const isExerciseIn = async (
  table: typeof coe | typeof coeInterimResults,
  month: string,
  biddingNo: number,
): Promise<boolean> => {
  const [row] = await db
    .select({ id: table.id })
    .from(table)
    .where(and(eq(table.month, month), eq(table.biddingNo, biddingNo)))
    .limit(1);
  return row !== undefined;
};

/**
 * Inserts an exercise's closing results into `coe_interim_results`, unless the
 * exercise is already there or the DataMall CSV has already put it in `coe`.
 * Returns the number of rows inserted, so 0 means nothing changed.
 */
export const storeInterimResults = async (
  month: string,
  biddingNo: number,
  results: COEResult[],
): Promise<number> => {
  const [inCoe, inInterim] = await Promise.all([
    isExerciseIn(coe, month, biddingNo),
    isExerciseIn(coeInterimResults, month, biddingNo),
  ]);
  if (inCoe || inInterim) {
    return 0;
  }

  const { rowCount } = await db
    .insert(coeInterimResults)
    .values(results)
    .onConflictDoNothing();
  return rowCount;
};
