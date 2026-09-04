"use client";

import { cn } from "@heroui/react";
import {
  CATEGORY_KEYS,
  type CategoryKey,
  EXERCISE_RANGES,
  type ExerciseRange,
  RANGE_LABELS,
} from "@web/app/(main)/(dashboard)/coe/components/search-params";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import posthog from "posthog-js";
import { type ReactNode, useTransition } from "react";

/**
 * Every control on the COE overview writes to the URL with `shallow: false`,
 * so the server re-renders the page with the new slice and the page itself
 * stays a server component. `startTransition` keeps the outgoing view on
 * screen while that round-trip is in flight.
 */
export function useCoeCategory() {
  const [isPending, startTransition] = useTransition();
  const [category, setCategory] = useQueryState(
    "category",
    parseAsStringLiteral(CATEGORY_KEYS)
      .withDefault("A")
      .withOptions({ shallow: false, startTransition }),
  );

  return { category, isPending, setCategory };
}

/** The A–E circles at the head of the page. */
export function CategoryTabs({ selected }: { selected: CategoryKey }) {
  const { isPending, setCategory } = useCoeCategory();

  return (
    <fieldset className={cn("flex flex-wrap gap-2", isPending && "opacity-70")}>
      <legend className="sr-only">COE category</legend>
      {CATEGORY_KEYS.map((key) => {
        const isActive = key === selected;
        return (
          <button
            aria-label={`Category ${key}`}
            aria-pressed={isActive}
            className={cn(
              "size-11 shrink-0 rounded-full font-extrabold text-base transition-[filter] hover:brightness-105",
              isActive
                ? "bg-accent text-accent-foreground"
                : "bg-default text-muted-strong",
            )}
            key={key}
            onClick={() => {
              posthog.capture("dashboard_filter_changed", {
                filter: "category",
                value: key,
              });
              setCategory(key);
            }}
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
      onClick={() => {
        posthog.capture("dashboard_filter_changed", {
          filter: "category",
          value: category,
        });
        setCategory(category);
      }}
      type="button"
    >
      {children}
    </button>
  );
}

/**
 * The range pills beside the "Premiums by exercise" heading.
 *
 * The three labels run wider than a phone laid out in a row, so the pills
 * wrap onto a second line rather than pushing the page sideways.
 */
export function RangeTabs() {
  const [isPending, startTransition] = useTransition();
  const [range, setRange] = useQueryState(
    "range",
    parseAsStringLiteral(EXERCISE_RANGES)
      .withDefault("12")
      .withOptions({ shallow: false, startTransition }),
  );

  return (
    <fieldset className={cn("flex flex-wrap gap-2", isPending && "opacity-70")}>
      <legend className="sr-only">Exercise range</legend>
      {EXERCISE_RANGES.map((option) => {
        const isActive = option === range;
        return (
          <button
            aria-pressed={isActive}
            className={cn(
              "whitespace-nowrap rounded-full px-[18px] py-2.5 text-sm transition-[filter] hover:brightness-105",
              isActive
                ? "bg-accent font-extrabold text-accent-foreground"
                : "bg-default font-semibold text-foreground/75",
            )}
            key={option}
            onClick={() => {
              posthog.capture("dashboard_filter_changed", {
                filter: "range",
                value: option,
              });
              setRange(option as ExerciseRange);
            }}
            type="button"
          >
            {RANGE_LABELS[option]}
          </button>
        );
      })}
    </fieldset>
  );
}
