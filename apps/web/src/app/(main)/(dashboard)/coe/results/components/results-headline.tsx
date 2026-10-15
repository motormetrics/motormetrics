import { Typography } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import { changeRatio } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  loadExercises,
  premiumOf,
  type RegionProps,
  totalFor,
} from "@web/app/(main)/(dashboard)/coe/results/components/results-shared";
import { StatCell } from "@web/components/shared/overview";
import type { COECategory } from "@web/types";

/** The three categories the comp calls out beside the headline. */
const HIGHLIGHT_CATEGORIES: COECategory[] = [
  "Category A",
  "Category B",
  "Category E",
];

/** "−1.2% on the previous exercise", or a note that there is no baseline. */
function movementNote(current: number, previous?: number): string {
  if (!previous) {
    return "no earlier exercise";
  }

  const percent = changeRatio(current, previous) * 100;
  const sign = percent > 0 ? "+" : percent < 0 ? "−" : "";

  return `${sign}${Math.abs(percent).toFixed(1)}% on the previous exercise`;
}

/**
 * The opening block: bids per quota across every category in the latest
 * exercise, and a ruled grid of the car premiums and the quota beside it.
 * Stacks into one column below lg.
 */
export async function ResultsHeadline({ searchParams }: RegionProps) {
  const { exercises } = await loadExercises(searchParams);

  const latest = exercises.at(-1);
  const previous = exercises.at(-2);

  if (!latest) {
    return null;
  }

  const totalQuota = totalFor(latest, "quota");
  const totalBids = totalFor(latest, "bidsReceived");
  const bidsPerQuota = totalQuota > 0 ? totalBids / totalQuota : 0;

  return (
    <div className="grid gap-5 lg:grid-cols-2 lg:items-end lg:gap-14">
      <div className="flex min-w-0 flex-col gap-3">
        <Typography.Paragraph className="text-muted-strong">
          <span className="font-semibold text-accent-strong">
            Bids per quota
          </span>{" "}
          · all five categories
        </Typography.Paragraph>
        <span className="font-extrabold text-5xl tabular-nums leading-none tracking-tight md:text-6xl">
          {bidsPerQuota.toFixed(2)}×
        </span>
        <Typography.Paragraph className="tabular-nums" color="muted">
          <span className="font-semibold text-foreground">
            {totalBids.toLocaleString("en-SG")}
          </span>{" "}
          bids against a quota of{" "}
          <span className="font-semibold text-foreground">
            {totalQuota.toLocaleString("en-SG")}
          </span>
        </Typography.Paragraph>
      </div>

      <div className="grid grid-cols-2 border-separator border-t">
        {HIGHLIGHT_CATEGORIES.map((category) => {
          const premium = premiumOf(latest, category) ?? 0;
          return (
            <StatCell
              key={category}
              label={`${category} premium`}
              note={movementNote(
                premium,
                previous && premiumOf(previous, category),
              )}
              value={formatCurrency(premium)}
            />
          );
        })}
        <StatCell
          label="Quota"
          note="this exercise"
          value={totalQuota.toLocaleString("en-SG")}
        />
      </div>
    </div>
  );
}
