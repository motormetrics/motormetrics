"use client";

import { cn, ScrollShadow } from "@heroui/react";
import { Segment } from "@heroui-pro/react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import posthog from "posthog-js";
import { type ReactNode, useTransition } from "react";
import {
  CATEGORY_KEYS,
  type CategoryKey,
  EXERCISE_RANGES,
  type ExerciseRange,
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
              "size-[38px] shrink-0 rounded-full font-extrabold text-sm transition-colors",
              isActive
                ? "bg-accent-foreground text-accent-strong"
                : "bg-accent-foreground/20 text-accent-foreground hover:bg-accent-foreground/30",
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
 * The range pills beside the page title.
 *
 * The three labels run to 452px laid out in full, which is wider than a phone,
 * and a segmented control cannot wrap without breaking its track — so the
 * `Segment` rides in a horizontal `ScrollShadow` and scrolls within its own
 * width rather than pushing the page sideways.
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
    <ScrollShadow
      className="max-w-full"
      hideScrollBar
      orientation="horizontal"
      size={24}
    >
      <Segment
        aria-label="Exercise range"
        className={cn(isPending && "opacity-70")}
        onSelectionChange={(key) => {
          posthog.capture("dashboard_filter_changed", {
            filter: "range",
            value: key,
          });
          setRange(key as ExerciseRange);
        }}
        selectedKey={range}
      >
        {EXERCISE_RANGES.map((option) => (
          <Segment.Item id={option} key={option}>
            {RANGE_LABELS[option]}
          </Segment.Item>
        ))}
      </Segment>
    </ScrollShadow>
  );
}
