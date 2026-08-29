"use client";

import { cn } from "@heroui/react";
import type { PQPCategoryKey } from "@web/app/(main)/(dashboard)/coe/pqp/search-params";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useTransition } from "react";

/**
 * The two controls the comp puts in the filter bar: which category the page
 * reports on, and which renewal term its figures are quoted for.
 *
 * `shallow: false` throughout, so the server re-renders the report against the
 * new selection and no rate data crosses into the client bundle.
 *
 * The parsers are restated here rather than imported from `search-params.ts`
 * because a `"use client"` module cannot hand plain values back to a server
 * component — the same split `cars/components/category/category-filters.tsx`
 * uses.
 */
const TERMS = ["5", "10"] as const;

const TERM_LABELS: Record<(typeof TERMS)[number], string> = {
  "5": "5 years",
  "10": "10 years",
};

/**
 * Which category the headline, the charts and the stat cells report on.
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
  const [isPending, startTransition] = useTransition();
  const [category, setCategory] = useQueryState(
    "category",
    parseAsStringLiteral(categories)
      .withDefault(categories[0])
      .withOptions({ shallow: false, startTransition }),
  );

  return (
    <fieldset
      className={cn(
        "m-0 flex flex-wrap gap-2 border-none p-0",
        isPending && "opacity-70",
      )}
    >
      <legend className="sr-only">Category</legend>
      {categories.map((option) => {
        const isActive = option === category;
        return (
          <button
            aria-pressed={isActive}
            className={cn(
              "cursor-pointer whitespace-nowrap rounded-full px-[18px] py-2.5 text-[0.90625rem] transition-colors",
              isActive
                ? "bg-accent font-bold text-accent-foreground"
                : "bg-surface font-semibold text-muted hover:text-foreground",
            )}
            key={option}
            onClick={() => setCategory(option)}
            type="button"
          >
            Cat {option}
          </button>
        );
      })}
    </fieldset>
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
    <fieldset
      className={cn(
        "m-0 flex gap-1 rounded-full border-none bg-surface-secondary p-1",
        isPending && "opacity-70",
      )}
    >
      <legend className="sr-only">Renewal term</legend>
      {TERMS.map((option) => {
        const isActive = option === term;
        return (
          <button
            aria-pressed={isActive}
            className={cn(
              "cursor-pointer rounded-full px-4 py-[7px] text-[0.84375rem] transition-colors",
              isActive
                ? "bg-surface font-extrabold text-foreground shadow-surface"
                : "font-semibold text-muted hover:text-foreground",
            )}
            key={option}
            onClick={() => setTerm(option)}
            type="button"
          >
            {TERM_LABELS[option]}
          </button>
        );
      })}
    </fieldset>
  );
}
