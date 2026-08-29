"use client";

import { cn } from "@heroui/react";
import {
  CATEGORY_KEYS,
  type CategoryKey,
} from "@web/app/(main)/(dashboard)/coe/components/search-params";
import {
  PREMIUM_RANGES,
  premiumsSearchParams,
} from "@web/app/(main)/(dashboard)/coe/premiums/search-params";
import { useQueryState } from "nuqs";
import { useTransition } from "react";

/**
 * The tail of each category name, short enough to sit inside a pill. The full
 * descriptions live in `coe/components/coe-exercise-utils.ts` and carry the
 * headline; these are the same categories abbreviated for the filter bar.
 */
export const CATEGORY_SHORT_NAMES: Record<CategoryKey, string> = {
  A: "up to 1,600cc",
  B: "above 1,600cc",
  C: "Goods and buses",
  D: "Motorcycles",
  E: "Open",
};

/*
 * Both controls write to the URL with `shallow: false`, so the server
 * re-renders every block against the new selection and no COE data crosses
 * into the client bundle. Same approach as `cars/registrations`.
 */
/** The A–E pills the comp runs down the left of the filter bar. */
export function CategoryTabs() {
  const [isPending, startTransition] = useTransition();
  const [category, setCategory] = useQueryState(
    "category",
    premiumsSearchParams.category.withOptions({
      shallow: false,
      startTransition,
    }),
  );

  return (
    <fieldset
      className={cn(
        "m-0 flex flex-wrap gap-2 border-none p-0",
        isPending && "opacity-70",
      )}
    >
      <legend className="sr-only">COE category</legend>
      {CATEGORY_KEYS.map((key) => {
        const isActive = key === category;
        return (
          <button
            aria-pressed={isActive}
            className={cn(
              "cursor-pointer whitespace-nowrap rounded-full px-[18px] py-2.5 text-sm transition-colors",
              isActive
                ? "bg-accent font-bold text-accent-foreground"
                : "bg-surface font-semibold text-muted hover:text-foreground",
            )}
            key={key}
            onClick={() => setCategory(key)}
            type="button"
          >
            {key} · {CATEGORY_SHORT_NAMES[key]}
          </button>
        );
      })}
    </fieldset>
  );
}

/** How far back the premium chart reaches. */
export function RangeTabs() {
  const [isPending, startTransition] = useTransition();
  const [range, setRange] = useQueryState(
    "range",
    premiumsSearchParams.range.withOptions({ shallow: false, startTransition }),
  );

  return (
    <fieldset
      className={cn(
        "m-0 flex gap-1 rounded-full border-none bg-surface-secondary p-1",
        isPending && "opacity-70",
      )}
    >
      <legend className="sr-only">Chart range</legend>
      {PREMIUM_RANGES.map((option) => {
        const isActive = option === range;
        return (
          <button
            aria-pressed={isActive}
            className={cn(
              "cursor-pointer rounded-full px-4 py-[7px] text-sm transition-colors",
              isActive
                ? "bg-surface font-extrabold text-foreground shadow-surface"
                : "font-semibold text-muted hover:text-foreground",
            )}
            key={option}
            onClick={() => setRange(option)}
            type="button"
          >
            {option}
          </button>
        );
      })}
    </fieldset>
  );
}
