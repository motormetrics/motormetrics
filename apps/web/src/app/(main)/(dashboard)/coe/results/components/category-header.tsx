import { cn } from "@heroui/react";
import {
  COE_CATEGORIES,
  toCategoryKey,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  BIDS_CELL,
  EXERCISE_CELL,
  EXERCISE_ROW,
  PHONE_HIDDEN,
  YEAR_CELL,
  YEAR_LABEL,
} from "@web/app/(main)/(dashboard)/coe/results/components/results-shared";

/** The column header for the category-by-column lists. */
export function CategoryHeader({
  isYear = false,
  label,
  trailing,
}: {
  /** Folds like the yearly rows on phones. */
  isYear?: boolean;
  label: string;
  trailing?: string;
}) {
  return (
    <div
      className={cn(
        EXERCISE_ROW,
        "items-end border-border pt-0 font-semibold text-muted text-xs",
      )}
    >
      <span className={cn("min-w-0 flex-1", isYear && YEAR_LABEL)}>
        {label}
      </span>
      {COE_CATEGORIES.map((category) => (
        <span
          className={cn(
            EXERCISE_CELL,
            isYear && YEAR_CELL,
            PHONE_HIDDEN.includes(category) && "max-md:hidden",
          )}
          key={category}
        >
          Cat {toCategoryKey(category)}
        </span>
      ))}
      {trailing ? <span className={BIDS_CELL}>{trailing}</span> : null}
    </div>
  );
}
