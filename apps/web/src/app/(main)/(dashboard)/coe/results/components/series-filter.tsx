"use client";

import { cn } from "@heroui/react";
import { COE_CATEGORIES } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { coeSearchParams } from "@web/app/(main)/(dashboard)/coe/search-params";
import type { COECategory } from "@web/types";
import { useQueryState } from "nuqs";
import posthog from "posthog-js";
import { useTransition } from "react";

/**
 * One chart colour per category, in the order LTA lists them. Index-based
 * rather than hand-picked, per the colour rules in `apps/web/CLAUDE.md`.
 */
export const CATEGORY_COLOURS: Record<COECategory, string> = Object.fromEntries(
  COE_CATEGORIES.map((category, index) => [
    category,
    `var(--chart-${index + 1})`,
  ]),
) as Record<COECategory, string>;

/**
 * The category pills that add and remove series from the chart.
 *
 * Writes to the URL with `shallow: false` so the chart stays server-rendered —
 * the premiums never reach the client bundle, only the series that are on.
 */
export function SeriesFilter() {
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useQueryState(
    "categories",
    coeSearchParams.categories.withOptions({ shallow: false, startTransition }),
  );

  const toggle = (category: COECategory) => {
    posthog.capture("dashboard_filter_changed", {
      filter: "series",
      value: category,
    });
    setSelected(
      selected.includes(category)
        ? selected.filter((entry) => entry !== category)
        : [...selected, category],
    );
  };

  return (
    <fieldset
      className={cn(
        "m-0 flex flex-wrap gap-2 border-none p-0",
        isPending && "opacity-70",
      )}
    >
      <legend className="sr-only">Categories plotted</legend>
      {COE_CATEGORIES.map((category) => {
        const isActive = selected.includes(category);
        return (
          <button
            aria-pressed={isActive}
            className={cn(
              "inline-flex cursor-pointer items-center gap-2.5 whitespace-nowrap rounded-full px-[18px] py-2.5 text-sm transition-colors",
              isActive
                ? "bg-surface font-bold text-foreground shadow-surface"
                : "bg-surface-secondary font-semibold text-muted hover:text-foreground",
            )}
            key={category}
            onClick={() => toggle(category)}
            type="button"
          >
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{
                background: isActive
                  ? CATEGORY_COLOURS[category]
                  : "var(--border)",
              }}
            />
            {category}
          </button>
        );
      })}
    </fieldset>
  );
}
