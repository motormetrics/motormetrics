"use client";

import { Checkbox, CheckboxGroup, cn } from "@heroui/react";
import { COE_CATEGORIES } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
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
 * The Categories checklist in the sidebar, which adds and removes series from
 * the premium trend. At least one stays on.
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

  const onChange = (values: string[]) => {
    const next = COE_CATEGORIES.filter((category) => values.includes(category));
    // The chart needs a series, so unticking the last one is ignored.
    if (next.length === 0) {
      return;
    }
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
    <CheckboxGroup
      aria-label="Categories plotted"
      className={cn(isPending && "opacity-70")}
      onChange={onChange}
      value={selected}
    >
      {COE_CATEGORIES.map((category) => (
        <Checkbox key={category} value={category}>
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            {category}
          </Checkbox.Content>
        </Checkbox>
      ))}
    </CheckboxGroup>
  );
}
