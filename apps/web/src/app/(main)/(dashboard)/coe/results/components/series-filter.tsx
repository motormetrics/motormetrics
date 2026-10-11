"use client";

import { cn, type Key, ToggleButton, ToggleButtonGroup } from "@heroui/react";
import {
  COE_CATEGORIES,
  toCategoryKey,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { coeSearchParams } from "@web/app/(main)/(dashboard)/coe/search-params";
import type { COECategory } from "@web/types";
import { useQueryState } from "nuqs";
import posthog from "posthog-js";
import { useTransition } from "react";

/**
 * One chart colour per category, in the order LTA lists them. Index-based
 * rather than hand-picked, per the colour rules in `apps/web/AGENTS.md`.
 */
export const CATEGORY_COLOURS: Record<COECategory, string> = Object.fromEntries(
  COE_CATEGORIES.map((category, index) => [
    category,
    `var(--chart-${index + 1})`,
  ]),
) as Record<COECategory, string>;

/**
 * The category toggles that add and remove series from the chart. At least
 * one stays on.
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

  const onSelectionChange = (keys: Set<Key>) => {
    const next = COE_CATEGORIES.filter((category) => keys.has(category));
    const toggled = COE_CATEGORIES.find(
      (category) => selected.includes(category) !== next.includes(category),
    );
    posthog.capture("dashboard_filter_changed", {
      filter: "series",
      value: toggled,
    });
    setSelected(next);
  };

  return (
    <ToggleButtonGroup
      aria-label="Categories plotted"
      className={cn("max-md:w-full", isPending && "opacity-70")}
      disallowEmptySelection
      onSelectionChange={onSelectionChange}
      selectedKeys={selected}
      selectionMode="multiple"
      size="sm"
    >
      {COE_CATEGORIES.map((category, index) => (
        <ToggleButton
          className="max-md:flex-1 max-md:px-1"
          id={category}
          key={category}
        >
          {index > 0 ? <ToggleButtonGroup.Separator /> : null}
          <span
            aria-hidden
            className="size-2.5 shrink-0 rounded-xs"
            style={{
              background: selected.includes(category)
                ? CATEGORY_COLOURS[category]
                : "var(--border)",
            }}
          />
          Cat {toCategoryKey(category)}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
