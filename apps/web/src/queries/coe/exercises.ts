import {
  and,
  asc,
  coe,
  db,
  desc,
  eq,
  lte,
  or,
  type SelectCOE,
} from "@motormetrics/database";
import type { COECategory } from "@web/types";
import { cacheLife, cacheTag } from "next/cache";

/** One bidding exercise — `(month, biddingNo)` — with a row per category. */
export interface ExerciseRows {
  biddingNo: number;
  month: string;
  rows: SelectCOE[];
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
    .selectDistinct({ biddingNo: coe.biddingNo, month: coe.month })
    .from(coe)
    .where(month ? lte(coe.month, month) : undefined)
    .orderBy(desc(coe.month), desc(coe.biddingNo))
    .limit(2);

  if (recent.length === 0) {
    return { current: null, previous: null };
  }

  const rows = await db
    .select()
    .from(coe)
    .where(
      or(
        ...recent.map((exercise) =>
          and(
            eq(coe.month, exercise.month),
            eq(coe.biddingNo, exercise.biddingNo),
          ),
        ),
      ),
    )
    .orderBy(asc(coe.vehicleClass));

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
  cacheTag(`coe:category:${category}`);

  return db
    .select({
      biddingNo: coe.biddingNo,
      bidsReceived: coe.bidsReceived,
      bidsSuccess: coe.bidsSuccess,
      month: coe.month,
      premium: coe.premium,
      quota: coe.quota,
    })
    .from(coe)
    .where(eq(coe.vehicleClass, category))
    .orderBy(asc(coe.month), asc(coe.biddingNo));
}
