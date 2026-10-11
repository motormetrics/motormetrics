"use client";

import { cn } from "@heroui/react";
import { Segment } from "@heroui-pro/react";
import {
  isRange,
  RANGE_LABELS,
  RANGES,
} from "@web/app/(main)/(dashboard)/cars/makes/[make]/search-params";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import posthog from "posthog-js";
import { useTransition } from "react";

/** Segment keys must be strings, so the unfiltered view gets one of its own. */
const ALL_FUEL_TYPES = "all";

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
    <Segment
      aria-label="Period"
      className={cn("max-md:w-full", isPending && "opacity-70")}
      onSelectionChange={(key) => {
        const next = String(key);
        if (!isRange(next)) {
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
          {RANGE_LABELS[option]}
        </Segment.Item>
      ))}
    </Segment>
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

  return (
    // Five fuel types run wider than a phone, so the switch scrolls in its own
    // row rather than stretching the page.
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
        <Segment.Item id={ALL_FUEL_TYPES}>All</Segment.Item>
        {fuelTypes.map((fuelType) => (
          <Segment.Item id={fuelType} key={fuelType}>
            {fuelType}
          </Segment.Item>
        ))}
      </Segment>
    </div>
  );
}
