"use client";

import { cn } from "@heroui/react";
import { Segment } from "@heroui-pro/react";
import type { PQPCategoryKey } from "@web/app/(main)/(dashboard)/coe/pqp/search-params";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import posthog from "posthog-js";
import { useTransition } from "react";

/**
 * The two switches at the head of the page: which category it reports on, and
 * which renewal term its figures are quoted for.
 *
 * `shallow: false` throughout, so the server re-renders the report against the
 * new selection and no rate data crosses into the client bundle.
 *
 * The parsers are restated here rather than imported from `search-params.ts`
 * because a `"use client"` module cannot hand plain values back to a server
 * component.
 */
const TERMS = ["5", "10"] as const;

/** On phones each switch spans the row and its items share the width. */
const SEGMENT_CLASS = "max-md:w-full";
const SEGMENT_ITEM_CLASS = "max-md:flex-1 max-md:px-2";

/** The category switch and every selectable row read and write one value. */
export function usePQPCategory(categories: readonly PQPCategoryKey[]) {
  const [isPending, startTransition] = useTransition();
  const [category, setCategory] = useQueryState(
    "category",
    parseAsStringLiteral(categories)
      .withDefault(categories[0])
      .withOptions({ shallow: false, startTransition }),
  );

  const selectCategory = (option: PQPCategoryKey) => {
    posthog.capture("dashboard_filter_changed", {
      filter: "category",
      value: option,
    });
    setCategory(option);
  };

  return { category, isPending, selectCategory };
}

/**
 * Which category the headline, the chart and the stat cells report on.
 *
 * The list is a prop rather than a constant here: it is owned by
 * `PQP_REPORTED_CATEGORIES` in the query, and a `"use client"` module cannot
 * import it without pulling the database client into the browser bundle.
 */
export function CategoryTabs({
  categories,
}: {
  categories: readonly PQPCategoryKey[];
}) {
  const { category, isPending, selectCategory } = usePQPCategory(categories);

  return (
    <Segment
      aria-label="COE category"
      className={cn(SEGMENT_CLASS, isPending && "opacity-70")}
      onSelectionChange={(key) => selectCategory(key as PQPCategoryKey)}
      selectedKey={category}
      size="md"
      variant="ghost"
    >
      {categories.map((option) => (
        <Segment.Item className={SEGMENT_ITEM_CLASS} id={option} key={option}>
          Cat {option}
        </Segment.Item>
      ))}
    </Segment>
  );
}

/**
 * Whether the figures are quoted for a five- or ten-year renewal.
 *
 * A ten-year renewal costs the full PQP and a five-year renewal half of it, so
 * this scales every money figure on the page rather than filtering anything.
 */
export function TermTabs() {
  const [isPending, startTransition] = useTransition();
  const [term, setTerm] = useQueryState(
    "term",
    parseAsStringLiteral(TERMS)
      .withDefault("10")
      .withOptions({ shallow: false, startTransition }),
  );

  return (
    <Segment
      aria-label="Renewal term"
      className={cn(SEGMENT_CLASS, isPending && "opacity-70")}
      onSelectionChange={(key) => {
        posthog.capture("dashboard_filter_changed", {
          filter: "term",
          value: key,
        });
        setTerm(key as (typeof TERMS)[number]);
      }}
      selectedKey={term}
      size="md"
      variant="ghost"
    >
      {TERMS.map((option) => (
        <Segment.Item className={SEGMENT_ITEM_CLASS} id={option} key={option}>
          {option}-year renewal
        </Segment.Item>
      ))}
    </Segment>
  );
}
