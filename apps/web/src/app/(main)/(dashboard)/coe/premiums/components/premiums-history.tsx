import { cn } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  changeRatio,
  formatExercise,
  successRate,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { SuccessRateCell } from "@web/app/(main)/(dashboard)/coe/components/success-rate-cell";
import { exerciseStamp } from "@web/app/(main)/(dashboard)/coe/premiums/components/premiums-shared";
import { CostTrendChip } from "@web/components/shared/cost-trend-chip";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import type { CategoryExercise, ExerciseRows } from "@web/queries/coe";
import type { COECategory } from "@web/types";

/** The comp lists a year of exercises under the chart. */
const HISTORY_ROWS = 12;

/** Shared by the history header and rows, so the columns line up. */
const HISTORY_ROW =
  "flex items-center gap-4 border-separator border-b px-3 py-2.5 max-md:flex-wrap max-md:gap-y-1 max-md:px-2.5";
const HISTORY_PREMIUM = "w-32 shrink-0 text-right max-lg:w-28";
const HISTORY_CHANGE = "w-24 shrink-0 text-right max-lg:w-20";
const HISTORY_FIGURE = "w-20 shrink-0 text-right max-md:hidden";
const HISTORY_RATE = "w-48 shrink-0 max-lg:w-36 max-md:hidden";

/** The category's last year of exercises, most recent first. */
export function PremiumsHistory({
  category,
  current,
  history,
}: {
  category: COECategory;
  current: ExerciseRows;
  /** Every exercise up to and including the selected one, oldest first. */
  history: CategoryExercise[];
}) {
  const historyRows = history
    .map((exercise, index) => ({
      exercise,
      ratio:
        index > 0
          ? changeRatio(exercise.premium, history[index - 1].premium)
          : null,
    }))
    .slice(-HISTORY_ROWS)
    .reverse();

  return (
    <section className="flex flex-col gap-4">
      <SectionHead
        caption={`To ${formatExercise(current)} · most recent first`}
        eyebrow="Bidding history"
        title={`${category}, last ${historyRows.length} exercises`}
      />
      <div className="flex flex-col">
        <div
          className={cn(
            HISTORY_ROW,
            "items-end border-border pt-0 pb-2.5 font-semibold text-muted text-xs max-md:hidden",
          )}
        >
          <span className="min-w-0 flex-1">Exercise</span>
          <span className={HISTORY_PREMIUM}>Premium</span>
          <span className={HISTORY_CHANGE}>Change</span>
          <span className={HISTORY_FIGURE}>Quota</span>
          <span className={HISTORY_FIGURE}>Bids</span>
          <span className={HISTORY_RATE}>Success rate</span>
        </div>
        <span className="border-border border-b pb-2 font-semibold text-muted text-xs uppercase tracking-wide md:hidden">
          Exercise · premium
        </span>
        <ol className="flex flex-col">
          {historyRows.map(({ exercise, ratio }, index) => {
            const rate = successRate(
              exercise.bidsSuccess,
              exercise.bidsReceived,
            );

            return (
              <li
                className={cn(
                  HISTORY_ROW,
                  index === 0 && "bg-surface-secondary",
                )}
                key={`${exercise.month}:${exercise.biddingNo}`}
              >
                <span className="min-w-0 flex-1 font-medium text-sm">
                  {exerciseStamp(exercise)}
                </span>
                <span className="flex shrink-0 flex-col items-end gap-0.5 md:contents">
                  <span
                    className={cn(
                      HISTORY_PREMIUM,
                      "font-semibold text-base tabular-nums max-md:w-auto",
                    )}
                  >
                    {formatCurrency(exercise.premium)}
                  </span>
                  <span
                    className={cn(
                      HISTORY_CHANGE,
                      "text-sm tabular-nums max-md:w-auto",
                    )}
                  >
                    {ratio === null || ratio === 0 ? (
                      <span className="text-muted">—</span>
                    ) : (
                      <CostTrendChip changeRatio={ratio} />
                    )}
                  </span>
                </span>
                <span
                  className={cn(
                    HISTORY_FIGURE,
                    "text-muted-strong text-sm tabular-nums",
                  )}
                >
                  {exercise.quota.toLocaleString("en-SG")}
                </span>
                <span
                  className={cn(
                    HISTORY_FIGURE,
                    "text-muted-strong text-sm tabular-nums",
                  )}
                >
                  {exercise.bidsReceived.toLocaleString("en-SG")}
                </span>
                <span className={HISTORY_RATE}>
                  <SuccessRateCell rate={rate} />
                </span>
                <span className="w-full text-muted text-sm tabular-nums md:hidden">
                  {exercise.quota.toLocaleString("en-SG")} quota ·{" "}
                  {exercise.bidsReceived.toLocaleString("en-SG")} bids ·{" "}
                  {rate.toFixed(0)}% success
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <SourceNote>
        Success rate is successful bids as a share of bids received. Change is
        against the previous exercise.
      </SourceNote>
    </section>
  );
}
