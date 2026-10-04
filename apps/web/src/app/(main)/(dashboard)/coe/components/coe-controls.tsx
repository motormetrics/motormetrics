"use client";

import { Button, cn } from "@heroui/react";
import { Segment } from "@heroui-pro/react";
import {
  CATEGORY_KEYS,
  type CategoryKey,
  coeOverviewSearchParams,
  EXERCISE_RANGES,
  type ExerciseRange,
  RANGE_LABELS,
} from "@web/app/(main)/(dashboard)/coe/components/search-params";
import { useQueryState } from "nuqs";
import posthog from "posthog-js";
import { type ReactNode, useTransition } from "react";

/*
 * The radius comes from HeroUI's Segment. The overrides are layout: at 720px
 * and below the switch spans the row and its items share the width. The items
 * also drop to 8px side padding there, because Segment items never wrap or
 * shrink below their label: at HeroUI's 16px the five "Cat X" items (about
 * 340px) and the three "N exercises" items (about 333px) overflow the 288px
 * content column of a 320px phone. 720px is the COE page's shared phone
 * breakpoint (page.tsx, pqp-rate-row.tsx), which no Tailwind step matches.
 */
const SEGMENT_CLASS = "max-[720px]:w-full";
const SEGMENT_ITEM_CLASS = "max-[720px]:flex-1 max-[720px]:px-2";

/**
 * Every control on the COE overview writes to the URL with `shallow: false`,
 * so the server re-renders the page with the new slice and the page itself
 * stays a server component. `startTransition` keeps the outgoing view on
 * screen while that round-trip is in flight.
 */
export function useCoeCategory() {
  const [isPending, startTransition] = useTransition();
  const [, setCategory] = useQueryState(
    "category",
    coeOverviewSearchParams.category.withOptions({
      shallow: false,
      startTransition,
    }),
  );

  const selectCategory = (category: CategoryKey) => {
    posthog.capture("dashboard_filter_changed", {
      filter: "category",
      value: category,
    });
    setCategory(category);
  };

  return { isPending, selectCategory };
}

/** The A–E switch at the head of the page. */
export function CategoryTabs({ selected }: { selected: CategoryKey }) {
  const { isPending, selectCategory } = useCoeCategory();

  return (
    <Segment
      aria-label="COE category"
      className={cn(SEGMENT_CLASS, isPending && "opacity-70")}
      onSelectionChange={(key) => selectCategory(key as CategoryKey)}
      selectedKey={selected}
      size="md"
      variant="ghost"
    >
      {CATEGORY_KEYS.map((key) => (
        <Segment.Item className={SEGMENT_ITEM_CLASS} id={key} key={key}>
          Cat {key}
        </Segment.Item>
      ))}
    </Segment>
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
  const { selectCategory } = useCoeCategory();

  return (
    <Button
      aria-label={label}
      aria-pressed={isActive}
      className={cn(
        "h-auto w-full justify-start rounded-none bg-transparent p-0 text-left font-[inherit] text-[length:inherit] text-inherit hover:bg-transparent data-[pressed=true]:scale-100",
        className,
      )}
      onPress={() => selectCategory(category)}
      variant="ghost"
    >
      {children}
    </Button>
  );
}

/** The range switch beside the "Premiums by exercise" heading. */
export function RangeTabs() {
  const [isPending, startTransition] = useTransition();
  const [range, setRange] = useQueryState(
    "range",
    coeOverviewSearchParams.range.withOptions({
      shallow: false,
      startTransition,
    }),
  );

  return (
    <Segment
      aria-label="Exercise range"
      className={cn(SEGMENT_CLASS, isPending && "opacity-70")}
      onSelectionChange={(option) => {
        posthog.capture("dashboard_filter_changed", {
          filter: "range",
          value: option,
        });
        setRange(option as ExerciseRange);
      }}
      selectedKey={range}
      size="md"
      variant="ghost"
    >
      {EXERCISE_RANGES.map((option) => (
        <Segment.Item className={SEGMENT_ITEM_CLASS} id={option} key={option}>
          {RANGE_LABELS[option]}
        </Segment.Item>
      ))}
    </Segment>
  );
}
