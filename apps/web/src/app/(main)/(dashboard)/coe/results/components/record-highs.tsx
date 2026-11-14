import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  CATEGORY_DESCRIPTIONS,
  COE_CATEGORIES,
  formatExercise,
  formatMonth,
  groupByExercise,
  recordHighs,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { recordsCaption } from "@web/app/(main)/(dashboard)/coe/results/components/results-captions";
import { premiumOf } from "@web/app/(main)/(dashboard)/coe/results/components/results-shared";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { getCoeResults } from "@web/queries/coe";

/**
 * The highest closing premium each category has ever reached, one ruled tile
 * per category. Reads the whole cached history, so it is in the static shell.
 */
export async function RecordHighs() {
  const exercises = groupByExercise(await getCoeResults());
  const highs = recordHighs(exercises);
  const first = exercises[0];
  const latest = exercises.at(-1);

  return (
    <div className="@container flex flex-col gap-4">
      <SectionHead
        caption={
          latest ? recordsCaption(highs, latest.month.slice(0, 4)) : undefined
        }
        eyebrow={
          first
            ? `Records · every exercise since ${formatMonth(first.month)}`
            : "Records"
        }
        title="Highest closing premium by category"
      />
      <ul className="grid @3xl:grid-cols-5 @md:grid-cols-2 grid-cols-1 border-separator border-t">
        {COE_CATEGORIES.map((category) => {
          const exercise = highs[category];
          return (
            <li
              className="flex flex-col gap-1 border-separator border-b py-3.5 pr-4"
              key={category}
            >
              <span className="font-semibold text-muted text-xs">
                {category} · {CATEGORY_DESCRIPTIONS[category]}
              </span>
              <span className="font-semibold text-xl tabular-nums">
                {exercise
                  ? formatCurrency(premiumOf(exercise, category) ?? 0)
                  : "—"}
              </span>
              <span className="text-muted-strong text-xs">
                {exercise ? formatExercise(exercise) : "—"}
              </span>
            </li>
          );
        })}
      </ul>
      <SourceNote>
        Quota premium at the close of the exercise in which each record was set.
      </SourceNote>
    </div>
  );
}
