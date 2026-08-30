"use client";

import { cn } from "@heroui/react";
import { DIMENSION_LABELS } from "@web/app/(main)/(dashboard)/cars/annual/population-series";
import {
  searchParams,
  VIEWS,
} from "@web/app/(main)/(dashboard)/cars/annual/search-params";
import { useQueryStates } from "nuqs";
import posthog from "posthog-js";
import { useTransition } from "react";

/**
 * The dimension pills beside the page title: which annual dataset the page is
 * reading, and so which entity its table lists.
 *
 * Writes with `shallow: false` because the two views come from different
 * tables; `startTransition` keeps the outgoing view on screen while the server
 * fetches the other one. Changing view also clears the focused row, which
 * belongs to the dimension being left behind.
 */
export function AnnualViewTabs() {
  const [isPending, startTransition] = useTransition();
  const [{ view }, setSearchParams] = useQueryStates(searchParams, {
    shallow: false,
    startTransition,
  });

  return (
    <fieldset
      className={cn(
        "flex gap-1.5 rounded-full bg-default p-[5px]",
        isPending && "opacity-70",
      )}
    >
      <legend className="sr-only">Population dimension</legend>
      {VIEWS.map((option) => {
        const isActive = option === view;
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
            onClick={() => {
              posthog.capture("annual_view_tab_changed", { view: option });
              setSearchParams({ focus: null, view: option });
            }}
            type="button"
          >
            {DIMENSION_LABELS[option].tab}
          </button>
        );
      })}
    </fieldset>
  );
}
