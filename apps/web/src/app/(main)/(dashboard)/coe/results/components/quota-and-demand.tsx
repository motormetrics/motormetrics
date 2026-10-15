import { cn } from "@heroui/react";
import {
  CATEGORY_DESCRIPTIONS,
  COE_CATEGORIES,
  formatExercise,
  successRate,
  toCategoryKey,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { SuccessRateCell } from "@web/app/(main)/(dashboard)/coe/components/success-rate-cell";
import {
  loadExercises,
  type RegionProps,
} from "@web/app/(main)/(dashboard)/coe/results/components/results-shared";
import { SectionHead, SourceNote } from "@web/components/shared/overview";

/** Shared by the quota header and rows. */
const QUOTA_ROW =
  "flex items-center gap-3.5 border-separator border-b py-3 max-md:gap-2.5";
const QUOTA_CELL = "w-16 shrink-0 text-right";

/**
 * Quota against bids for the latest exercise. The heading names that
 * exercise, so unlike the tables above it the whole section is data-derived
 * and stays behind the boundary.
 */
export async function QuotaAndDemand({ searchParams }: RegionProps) {
  const { exercises } = await loadExercises(searchParams);

  const latest = exercises.at(-1);

  if (!latest) {
    return null;
  }

  return (
    <section className="flex min-w-0 flex-col gap-4">
      <SectionHead
        caption="Bids received against quota, by category"
        eyebrow="Quota and demand"
        title={formatExercise(latest)}
      />
      <div className="flex flex-col">
        <div
          className={cn(
            QUOTA_ROW,
            "border-border pt-0 pb-2 font-semibold text-muted text-xs",
          )}
        >
          <span className="w-14 shrink-0 max-md:w-8">Cat</span>
          <span className="min-w-0 flex-1">
            <span className="max-md:hidden">Description</span>
          </span>
          <span className={QUOTA_CELL}>Quota</span>
          <span className={QUOTA_CELL}>Bids</span>
          <span className="w-44 shrink-0 max-md:hidden">Success rate</span>
        </div>
        <ol className="flex flex-col">
          {COE_CATEGORIES.map((category) => {
            const figures = latest.results[category];
            const rate = successRate(
              figures?.bidsSuccess ?? 0,
              figures?.bidsReceived ?? 0,
            );

            return (
              <li className={QUOTA_ROW} key={category}>
                <span className="w-14 shrink-0 font-semibold text-sm max-md:w-8">
                  {toCategoryKey(category)}
                </span>
                <span className="flex min-w-0 flex-1 flex-col text-muted-strong text-sm">
                  <span className="truncate max-md:whitespace-normal">
                    {CATEGORY_DESCRIPTIONS[category]}
                  </span>
                  <span className="text-muted text-xs tabular-nums md:hidden">
                    {rate.toFixed(0)}% success
                  </span>
                </span>
                <span
                  className={cn(
                    QUOTA_CELL,
                    "font-semibold text-sm tabular-nums",
                  )}
                >
                  {(figures?.quota ?? 0).toLocaleString("en-SG")}
                </span>
                <span
                  className={cn(
                    QUOTA_CELL,
                    "text-muted-strong text-sm tabular-nums",
                  )}
                >
                  {(figures?.bidsReceived ?? 0).toLocaleString("en-SG")}
                </span>
                <span className="w-44 shrink-0 max-md:hidden">
                  <SuccessRateCell rate={rate} />
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <SourceNote>
        Success rate is successful bids as a share of bids received.
      </SourceNote>
    </section>
  );
}
