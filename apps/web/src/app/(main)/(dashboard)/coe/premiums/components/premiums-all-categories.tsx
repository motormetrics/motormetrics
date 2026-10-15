import {
  CATEGORY_DESCRIPTIONS,
  COE_CATEGORIES,
  changeRatio,
  formatExercise,
  toCategoryKey,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import type { CategoryKey } from "@web/app/(main)/(dashboard)/coe/components/search-params";
import { PremiumsCategoryTable } from "@web/app/(main)/(dashboard)/coe/premiums/components/categories-table";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import type { ExerciseRows } from "@web/queries/coe";

/** Every category's quota, bids and premium in the selected exercise. */
export function PremiumsAllCategories({
  categoryKey,
  current,
  previous,
}: {
  categoryKey: CategoryKey;
  current: ExerciseRows;
  previous: ExerciseRows | null;
}) {
  const currentRows = new Map(
    current.rows.map((row) => [row.vehicleClass, row]),
  );
  const previousRows = new Map(
    (previous?.rows ?? []).map((row) => [row.vehicleClass, row]),
  );

  return (
    <section className="flex flex-col gap-4">
      <SectionHead
        caption="Quota, bids and closing premium · select a row to chart it"
        eyebrow="All categories"
        title={formatExercise(current)}
      />
      <PremiumsCategoryTable
        rows={COE_CATEGORIES.map((entry) => {
          const row = currentRows.get(entry);
          const previousRow = previousRows.get(entry);
          return {
            bidsReceived: row?.bidsReceived ?? 0,
            changeRatio:
              row && previousRow
                ? changeRatio(row.premium, previousRow.premium)
                : null,
            description: CATEGORY_DESCRIPTIONS[entry],
            key: toCategoryKey(entry),
            premium: row?.premium ?? 0,
            quota: row?.quota ?? 0,
          };
        })}
        selected={categoryKey}
      />
      <SourceNote>
        Quota premium at the close of the exercise. Change is against the
        previous exercise; colour is not used for direction.
      </SourceNote>
    </section>
  );
}
