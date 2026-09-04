"use client";

import { cn } from "@heroui/react";
import { parseAsString, useQueryState } from "nuqs";
import posthog from "posthog-js";
import { useTransition } from "react";
import { FUEL_FILTERS, type FuelFilter } from "./make-rows";

/**
 * The powertrain pills beside the "All makes" heading.
 *
 * Writes the `fuel` search param — cleared for "All", so the default URL stays
 * clean — with `shallow: false`, because the tab changes what the server has
 * to aggregate. The active pill is taken from the server-resolved `fuel` prop
 * rather than the hook so the first paint agrees with what was rendered.
 */
export function FuelTabs({ fuel }: { fuel: FuelFilter | null }) {
  const [, startTransition] = useTransition();
  const [, setFuel] = useQueryState(
    "fuel",
    parseAsString.withOptions({ shallow: false, startTransition }),
  );

  const options: { key: FuelFilter | null; label: string }[] = [
    { key: null, label: "All" },
    ...FUEL_FILTERS.map((filter) => ({ key: filter, label: filter })),
  ];

  return (
    <fieldset className="m-0 flex min-w-0 flex-wrap gap-2 border-none p-0">
      <legend className="sr-only">Powertrain</legend>
      {options.map((option) => {
        const isActive = option.key === fuel;

        return (
          <button
            aria-pressed={isActive}
            className={cn(
              "cursor-pointer whitespace-nowrap rounded-full px-[18px] py-2.5 text-sm transition-colors",
              isActive
                ? "bg-accent font-extrabold text-accent-foreground"
                : "bg-default font-semibold text-foreground/75 hover:text-foreground",
            )}
            key={option.label}
            onClick={() => {
              posthog.capture("dashboard_filter_changed", {
                filter: "fuel",
                value: option.label,
              });
              setFuel(option.key);
            }}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </fieldset>
  );
}
