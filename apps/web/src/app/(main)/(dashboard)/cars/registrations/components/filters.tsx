"use client";

import { cn } from "@heroui/react";
import { Segment } from "@heroui-pro/react";
import { RANGES } from "@web/app/(main)/(dashboard)/cars/registrations/search-params";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import posthog from "posthog-js";
import { useTransition } from "react";

/*
 * URL state with `shallow: false` throughout, so the server re-renders every
 * block against the new selection — the sections stay server components and no
 * registration data crosses into the client bundle. Same approach as
 * `cars/makes/components/range-menu.tsx`.
 */

/** Segment keys cannot be null, so the unfiltered view takes its own key. */
const ALL_FUEL_TYPES = "all";

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

  return (
    // The comp scrolls the fuel types sideways on a phone rather than letting
    // six labels squeeze into one row.
    <div className="max-w-full overflow-x-auto">
      <Segment
        aria-label="Fuel type"
        className={cn(isPending && "opacity-70")}
        onSelectionChange={(key) => {
          const next = key === ALL_FUEL_TYPES ? null : String(key);
          posthog.capture("dashboard_filter_changed", {
            filter: "fuel_type",
            value: next,
          });
          setSelected(next);
        }}
        selectedKey={selected ?? ALL_FUEL_TYPES}
        size="sm"
        variant="ghost"
      >
        <Segment.Item id={ALL_FUEL_TYPES}>All fuel types</Segment.Item>
        {fuelTypes.map((fuelType) => (
          <Segment.Item id={fuelType} key={fuelType}>
            {fuelType}
          </Segment.Item>
        ))}
      </Segment>
    </div>
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
    <Segment
      aria-label="Chart range"
      className={cn("max-md:w-full", isPending && "opacity-70")}
      onSelectionChange={(key) => {
        const next = RANGES.find((option) => option === key);
        if (!next) {
          return;
        }
        posthog.capture("dashboard_filter_changed", {
          filter: "range",
          value: next,
        });
        setRange(next);
      }}
      selectedKey={range}
      size="sm"
      variant="ghost"
    >
      {RANGES.map((option) => (
        <Segment.Item
          className="max-md:flex-1 max-md:px-2"
          id={option}
          key={option}
        >
          {option}
        </Segment.Item>
      ))}
    </Segment>
  );
}
