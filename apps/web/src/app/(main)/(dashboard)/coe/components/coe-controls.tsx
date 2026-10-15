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

const captureFilter = (filter: "category" | "range", value: string) =>
  posthog.capture("dashboard_filter_changed", { filter, value });

/**
 * The COE overview's category and range. The controls write with
 * `shallow: false`, so the server re-renders the page with the new selection
 * and the sections stay server components. `startTransition` keeps the
 * outgoing view on screen while that round-trip is in flight.
 */
export function useCoeOverview() {
  const [, startTransition] = useTransition();
  const [category, setCategory] = useQueryState(
    "category",
    coeOverviewSearchParams.category.withOptions({
      shallow: false,
      startTransition,
    }),
  );
  const [range, setRange] = useQueryState(
    "range",
    coeOverviewSearchParams.range.withOptions({
      shallow: false,
      startTransition,
    }),
  );

  const selectCategory = (key: CategoryKey) => {
    captureFilter("category", key);
    setCategory(key);
  };

  const selectRange = (option: ExerciseRange) => {
    captureFilter("range", option);
    setRange(option);
  };

  return { category, range, selectCategory, selectRange };
}

/**
 * The category switch on `/coe/premiums`, which writes with `shallow: false`
 * so the server re-renders that page with the new slice. `startTransition`
 * keeps the outgoing view on screen while that round-trip is in flight.
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
    captureFilter("category", category);
    setCategory(category);
  };

  return { isPending, selectCategory };
}

/** The A–E switch on `/coe/premiums`, wired to the URL. */
export function CategoryTabs({ selected }: { selected: CategoryKey }) {
  const { isPending, selectCategory } = useCoeCategory();

  return (
    <CategorySegment
      className={cn(isPending && "opacity-70")}
      onSelect={selectCategory}
      selected={selected}
    />
  );
}

/**
 * The A–E switch itself. The selection and handler come in as props, so the
 * overview's sections can draw it from the selection they are given.
 */
export function CategorySegment({
  className,
  onSelect,
  selected,
}: {
  className?: string;
  onSelect?: (category: CategoryKey) => void;
  selected: CategoryKey;
}) {
  return (
    <Segment
      aria-label="COE category"
      className={cn(SEGMENT_CLASS, className)}
      onSelectionChange={(key) => onSelect?.(key as CategoryKey)}
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
      className={cn("h-auto w-full justify-start p-0 text-left", className)}
      onPress={() => selectCategory(category)}
      variant="ghost"
    >
      {children}
    </Button>
  );
}

/** The range switch beside the "Premiums by exercise" heading. */
export function RangeTabs({
  onSelect,
  selected,
}: {
  onSelect?: (range: ExerciseRange) => void;
  selected: ExerciseRange;
}) {
  return (
    <Segment
      aria-label="Exercise range"
      className={SEGMENT_CLASS}
      onSelectionChange={(option) => onSelect?.(option as ExerciseRange)}
      selectedKey={selected}
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
