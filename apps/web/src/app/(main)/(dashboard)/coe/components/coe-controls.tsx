"use client";

import { Button, cn, ToggleButton, ToggleButtonGroup } from "@heroui/react";
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
    <ToggleButtonGroup
      aria-label="COE category"
      className={cn("flex flex-wrap gap-2", isPending && "opacity-70")}
      disallowEmptySelection
      isDetached
      onSelectionChange={(keys) => {
        const [key] = [...keys];
        if (key === undefined) {
          return;
        }
        posthog.capture("dashboard_filter_changed", {
          filter: "category",
          value: key,
        });
        setCategory(key as CategoryKey);
      }}
      selectedKeys={[selected]}
      selectionMode="single"
    >
      {CATEGORY_KEYS.map((key) => (
        <ToggleButton
          aria-label={`Category ${key}`}
          className="size-11 shrink-0 rounded-full bg-default p-0 font-extrabold text-base text-muted-strong transition-[filter] hover:bg-default hover:brightness-105 data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
          id={key}
          key={key}
        >
          {key}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
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
    <Button
      aria-label={label}
      aria-pressed={isActive}
      className={cn(
        "h-auto w-full justify-start rounded-none bg-transparent p-0 text-left font-[inherit] text-[length:inherit] text-inherit hover:bg-transparent data-[pressed=true]:scale-100",
        className,
      )}
      onPress={() => {
        posthog.capture("dashboard_filter_changed", {
          filter: "category",
          value: category,
        });
        setCategory(category);
      }}
      variant="ghost"
    >
      {children}
    </Button>
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
    <ToggleButtonGroup
      aria-label="Exercise range"
      className={cn("flex flex-wrap gap-2", isPending && "opacity-70")}
      disallowEmptySelection
      isDetached
      onSelectionChange={(keys) => {
        const [option] = [...keys];
        if (option === undefined) {
          return;
        }
        posthog.capture("dashboard_filter_changed", {
          filter: "range",
          value: option,
        });
        setRange(option as ExerciseRange);
      }}
      selectedKeys={[range]}
      selectionMode="single"
    >
      {EXERCISE_RANGES.map((option) => (
        <ToggleButton
          className="h-auto whitespace-nowrap rounded-full bg-default px-[18px] py-2.5 font-semibold text-foreground/75 text-sm transition-[filter] hover:bg-default hover:brightness-105 data-[selected=true]:bg-accent data-[selected=true]:font-extrabold data-[selected=true]:text-accent-foreground"
          id={option}
          key={option}
        >
          {RANGE_LABELS[option]}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
