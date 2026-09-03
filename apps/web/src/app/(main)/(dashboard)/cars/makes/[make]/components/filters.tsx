"use client";

import { cn } from "@heroui/react";
import {
  RANGE_LABELS,
  RANGES,
} from "@web/app/(main)/(dashboard)/cars/makes/[make]/search-params";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import posthog from "posthog-js";
import { useTransition } from "react";

/*
 * URL state with `shallow: false` throughout, so the server re-renders the
 * report against the new selection — every section stays a server component and
 * no registration data crosses into the client bundle. Same approach as
 * `cars/registrations/components/filters.tsx`.
 */
/** How much of the make's history the page is read over. */
export function PeriodTabs() {
  const [isPending, startTransition] = useTransition();
  const [range, setRange] = useQueryState(
    "range",
    parseAsStringLiteral(RANGES)
      .withDefault("ytd")
      .withOptions({ shallow: false, startTransition }),
  );

  return (
    <fieldset
      className={cn(
        "m-0 flex flex-wrap gap-2 border-none p-0",
        isPending && "opacity-70",
      )}
    >
      <legend className="sr-only">Period</legend>
      {RANGES.map((option) => {
        const isActive = option === range;
        return (
          <button
            aria-pressed={isActive}
            className={cn(
              "cursor-pointer whitespace-nowrap rounded-full px-[18px] py-2.5 text-sm transition-colors",
              isActive
                ? "bg-accent font-bold text-accent-foreground"
                : "bg-surface font-semibold text-muted hover:text-foreground",
            )}
            key={option}
            onClick={() => {
              posthog.capture("dashboard_filter_changed", {
                filter: "range",
                value: option,
              });
              setRange(option);
            }}
            type="button"
          >
            {RANGE_LABELS[option]}
          </button>
        );
      })}
    </fieldset>
  );
}

/**
 * Fuel types as LTA records them, passed in from the server rather than listed
 * here — only the ones this make actually registers are offered, so a make with
 * no diesel never shows a tab that would empty the page.
 */
export function FuelTypeTabs({ fuelTypes }: { fuelTypes: string[] }) {
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useQueryState(
    "fuelType",
    parseAsString.withOptions({ shallow: false, startTransition }),
  );

  const options: { key: string | null; label: string }[] = [
    { key: null, label: "All" },
    ...fuelTypes.map((fuelType) => ({ key: fuelType, label: fuelType })),
  ];

  return (
    <fieldset
      className={cn(
        "m-0 flex flex-wrap gap-1 rounded-[1.25rem] border-none bg-surface-secondary p-1",
        isPending && "opacity-70",
      )}
    >
      <legend className="sr-only">Fuel type</legend>
      {options.map(({ key, label }) => {
        const isActive = key === selected;
        return (
          <button
            aria-pressed={isActive}
            className={cn(
              "cursor-pointer whitespace-nowrap rounded-full px-4 py-[7px] text-sm transition-colors",
              isActive
                ? "bg-surface font-extrabold text-foreground shadow-surface"
                : "font-semibold text-muted hover:text-foreground",
            )}
            key={label}
            onClick={() => {
              posthog.capture("dashboard_filter_changed", {
                filter: "fuel_type",
                value: key,
              });
              setSelected(key);
            }}
            type="button"
          >
            {label}
          </button>
        );
      })}
    </fieldset>
  );
}
