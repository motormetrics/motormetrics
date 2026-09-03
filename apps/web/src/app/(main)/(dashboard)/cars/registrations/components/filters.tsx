"use client";

import { cn } from "@heroui/react";
import { RANGES } from "@web/app/(main)/(dashboard)/cars/registrations/search-params";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import posthog from "posthog-js";
import { useTransition } from "react";

/*
 * URL state with `shallow: false` throughout, so the server re-renders every
 * block against the new selection — the sections stay server components and no
 * registration data crosses into the client bundle. Same approach as
 * `cars/makes/components/makes-header-meta.tsx`.
 */
/**
 * Fuel types as LTA records them, passed in from the server rather than listed
 * here — a new value in a DataMall drop should appear on its own.
 */
export function FuelTypeTabs({ fuelTypes }: { fuelTypes: string[] }) {
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useQueryState(
    "fuelType",
    parseAsString.withOptions({ shallow: false, startTransition }),
  );

  const options: { key: string | null; label: string }[] = [
    { key: null, label: "All fuel types" },
    ...fuelTypes.map((fuelType) => ({ key: fuelType, label: fuelType })),
  ];

  return (
    <fieldset
      className={cn(
        "m-0 flex flex-wrap gap-2 border-none p-0",
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
              "cursor-pointer whitespace-nowrap rounded-full px-[18px] py-2.5 text-sm transition-colors",
              isActive
                ? "bg-accent font-bold text-accent-foreground"
                : "bg-surface font-semibold text-muted hover:text-foreground",
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

/** How far back the monthly chart reaches. */
export function RangeTabs() {
  const [isPending, startTransition] = useTransition();
  const [range, setRange] = useQueryState(
    "range",
    parseAsStringLiteral(RANGES)
      .withDefault("1Y")
      .withOptions({ shallow: false, startTransition }),
  );

  return (
    <fieldset
      className={cn(
        "m-0 flex gap-1 rounded-full border-none bg-surface-secondary p-1",
        isPending && "opacity-70",
      )}
    >
      <legend className="sr-only">Chart range</legend>
      {RANGES.map((option) => {
        const isActive = option === range;
        return (
          <button
            aria-pressed={isActive}
            className={cn(
              "cursor-pointer rounded-full px-4 py-[7px] text-sm transition-colors",
              isActive
                ? "bg-surface font-extrabold text-foreground shadow-surface"
                : "font-semibold text-muted hover:text-foreground",
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
            {option}
          </button>
        );
      })}
    </fieldset>
  );
}
