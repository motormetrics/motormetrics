import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  COE_CATEGORIES,
  formatExercise,
  formatMonth,
  groupByExercise,
  recordHighs,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { RailBlock } from "@web/app/(main)/(dashboard)/coe/components/rail-block";
import { premiumOf } from "@web/app/(main)/(dashboard)/coe/results/components/results-shared";
import { KeyNumberItem } from "@web/components/shared/key-numbers";
import { getCoeResults } from "@web/queries/coe";

/**
 * The highest closing premium each category has ever reached, with the
 * exercise that set it, as the sidebar's key figures. Reads the whole cached
 * history, so it is in the static shell.
 */
export async function RecordHighs() {
  const exercises = groupByExercise(await getCoeResults());
  const highs = recordHighs(exercises);
  const first = exercises[0];

  return (
    <RailBlock
      link={{ href: "/coe", label: "Bidding results" }}
      sub={first ? `since ${formatMonth(first.month)}` : undefined}
      title="Record highs"
    >
      {COE_CATEGORIES.map((category) => {
        const exercise = highs[category];
        return (
          <KeyNumberItem
            key={category}
            label={category}
            note={exercise ? formatExercise(exercise) : undefined}
            value={
              exercise
                ? formatCurrency(premiumOf(exercise, category) ?? 0)
                : "—"
            }
          />
        );
      })}
    </RailBlock>
  );
}
