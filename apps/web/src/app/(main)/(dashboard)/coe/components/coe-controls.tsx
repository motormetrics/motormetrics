"use client";

import { cn } from "@heroui/react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { type ReactNode, useTransition } from "react";
import {
  CATEGORY_KEYS,
  type CategoryKey,
  EXERCISE_RANGES,
  RANGE_LABELS,
} from "./search-params";

/**
 * Every control on the COE overview writes to the URL with `shallow: false`,
 * so the server re-renders the bento with the new slice and the page itself
 * stays a server component. `startTransition` keeps the outgoing view on
 * screen while that round-trip is in flight.
 */
function useCoeCategory() {
  const [isPending, startTransition] = useTransition();
  const [category, setCategory] = useQueryState(
    "category",
    parseAsStringLiteral(CATEGORY_KEYS)
      .withDefault("A")
      .withOptions({ shallow: false, startTransition }),
  );

  return { category, isPending, setCategory };
}

/** The A–E circles on the gradient hero. */
export function CategoryTabs({ selected }: { selected: CategoryKey }) {
  const { isPending, setCategory } = useCoeCategory();

  return (
    <fieldset className={cn("flex gap-1.5", isPending && "opacity-70")}>
      <legend className="sr-only">COE category</legend>
      {CATEGORY_KEYS.map((key) => {
        const isActive = key === selected;
        return (
          <button
            aria-label={`Category ${key}`}
            aria-pressed={isActive}
            className={cn(
              "size-[38px] shrink-0 rounded-full font-extrabold text-[15px] transition-colors",
              isActive
                ? "bg-accent-foreground text-accent"
                : "bg-accent-foreground/20 text-accent-foreground hover:bg-accent-foreground/30",
            )}
            key={key}
            onClick={() => setCategory(key)}
            type="button"
          >
            {key}
          </button>
        );
      })}
    </fieldset>
  );
}

/**
 * Any server-rendered block that should select a category on click — the quota
 * allocation bars, the rows of the "All categories" table.
 */
export function CategorySelect({
  category,
  children,
  className,
  isActive,
  label,
}: {
  category: CategoryKey;
  children: ReactNode;
  className?: string;
  isActive: boolean;
  label: string;
}) {
  const { setCategory } = useCoeCategory();

  return (
    <button
      aria-label={label}
      aria-pressed={isActive}
      className={cn("w-full cursor-pointer text-left", className)}
      onClick={() => setCategory(category)}
      type="button"
    >
      {children}
    </button>
  );
}

/** The range pills beside the page title. */
export function RangeTabs() {
  const [isPending, startTransition] = useTransition();
  const [range, setRange] = useQueryState(
    "range",
    parseAsStringLiteral(EXERCISE_RANGES)
      .withDefault("12")
      .withOptions({ shallow: false, startTransition }),
  );

  return (
    <fieldset
      className={cn(
        "flex gap-1.5 rounded-full bg-default p-[5px]",
        isPending && "opacity-70",
      )}
    >
      <legend className="sr-only">Exercise range</legend>
      {EXERCISE_RANGES.map((option) => {
        const isActive = option === range;
        return (
          <button
            aria-pressed={isActive}
            className={cn(
              "whitespace-nowrap rounded-full px-[18px] py-2.5 text-sm transition-colors",
              isActive
                ? "bg-surface font-extrabold text-foreground shadow-surface"
                : "font-semibold text-muted hover:text-foreground",
            )}
            key={option}
            onClick={() => setRange(option)}
            type="button"
          >
            {RANGE_LABELS[option]}
          </button>
        );
      })}
    </fieldset>
  );
}
