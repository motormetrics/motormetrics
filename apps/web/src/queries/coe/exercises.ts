import { db } from "@motormetrics/database/client";
import {
  coeResults,
  type SelectCoeResult,
} from "@motormetrics/database/schema";
import type { COECategory } from "@web/types";
import { and, asc, desc, eq, lte, or } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

/** One bidding exercise — `(month, biddingNo)` — with a row per category. */
export interface ExerciseRows {
  biddingNo: number;
  month: string;
  rows: SelectCoeResult[];
}

/**
 * The most recent bidding exercise at or before `month`, plus the one before
 * it.
 *
 * "The one before" cannot be derived arithmetically: it is the first round of
 * the same month for a second-round exercise, but the *last* round of the
 * preceding month otherwise, and months with a single round do occur. So the
 * two exercises are read off the data itself rather than calculated.
 */
export async function getExercisePair(month?: string): Promise<{
  current: ExerciseRows | null;
  previous: ExerciseRows | null;
}> {
  "use cache";
  cacheLife("max");
  cacheTag("coe:exercises", month ? `coe:month:${month}` : "coe:latest");

  const recent = await db
    .selectDistinct({
      biddingNo: coeResults.biddingNo,
      month: coeResults.month,
    })
    .from(coeResults)
    .where(month ? lte(coeResults.month, month) : undefined)
    .orderBy(desc(coeResults.month), desc(coeResults.biddingNo))
    .limit(2);

  if (recent.length === 0) {
    return { current: null, previous: null };
  }

  const rows = await db
    .select()
    .from(coeResults)
    .where(
      or(
        ...recent.map((exercise) =>
          and(
            eq(coeResults.month, exercise.month),
            eq(coeResults.biddingNo, exercise.biddingNo),
          ),
        ),
      ),
    )
    .orderBy(asc(coeResults.vehicleClass));

  const exerciseAt = (index: number): ExerciseRows | null => {
    const exercise = recent[index];

    if (!exercise) {
      return null;
    }

    return {
      biddingNo: exercise.biddingNo,
      month: exercise.month,
      rows: rows.filter(
        (row) =>
          row.month === exercise.month && row.biddingNo === exercise.biddingNo,
      ),
    };
  };

  return { current: exerciseAt(0), previous: exerciseAt(1) };
}

export interface CategoryExercise {
  biddingNo: number;
  bidsReceived: number;
  bidsSuccess: number;
  month: string;
  premium: number;
  quota: number;
}

/**
 * Every exercise ever run for one category, oldest first.
 *
 * The premiums page windows this in memory rather than in SQL: the same series
 * answers the chart, the year-to-date figures and the all-time premium range,
 * and one category is only a few hundred rows.
 */
export async function getCategoryExercises(
  category: COECategory,
): Promise<CategoryExercise[]> {
  "use cache";
  cacheLife("max");
  cacheTag(`coe:category:${category}`, "coe:results");

  return db
    .select({
      biddingNo: coeResults.biddingNo,
      bidsReceived: coeResults.bidsReceived,
      bidsSuccess: coeResults.bidsSuccess,
      month: coeResults.month,
      premium: coeResults.premium,
      quota: coeResults.quota,
    })
    .from(coeResults)
    .where(eq(coeResults.vehicleClass, category))
    .orderBy(asc(coeResults.month), asc(coeResults.biddingNo));
}
