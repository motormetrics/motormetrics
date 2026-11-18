"use client";

import { cn, Radio, RadioGroup } from "@heroui/react";
import { Segment } from "@heroui-pro/react";
import {
  FUEL_FILTERS,
  type FuelFilter,
  makesSearchParams,
  RANGE_LABELS,
  RANGES,
  type Range,
  SORTS,
  type Sort,
} from "@web/app/(main)/(dashboard)/cars/makes/search-params";
import { useQueryState } from "nuqs";
import posthog from "posthog-js";
import { useTransition } from "react";

/*
 * The Makes controls. Each one writes its search param from the browser with
 * nuqs: none of them is a link, so no filtered view of the page is a URL for
 * a crawler to follow. `shallow: false` has the server re-render the page for
 * the new selection.
 */

const trackFilter = (filter: string, value: string) =>
  posthog.capture("dashboard_filter_changed", { filter, value });

/**
 * The period the page reports on, in the page head. The make page reads the
 * same `range` param, so it uses this switch too.
 */
export function PeriodSwitch() {
  const [isPending, startTransition] = useTransition();
  const [range, setRange] = useQueryState(
    "range",
    makesSearchParams.range.withOptions({ shallow: false, startTransition }),
  );

  return (
    <Segment
      aria-label="Period"
      className={cn("max-md:w-full", isPending && "opacity-70")}
      onSelectionChange={(key) => {
        trackFilter("range", String(key));
        setRange(key as Range);
      }}
      selectedKey={range}
      size="md"
      variant="ghost"
    >
      {RANGES.map((option) => (
        <Segment.Item
          className="whitespace-nowrap max-md:flex-1 max-md:px-2"
          id={option}
          key={option}
        >
          {RANGE_LABELS[option]}
        </Segment.Item>
      ))}
    </Segment>
  );
}

/** Radio value for "All", which clears `?fuel=`. */
const ALL_FUEL = "all";

/** The fuel type the page is narrowed to, as a list in the filters panel. */
export function FuelTypeRadios() {
  const [isPending, startTransition] = useTransition();
  const [fuel, setFuel] = useQueryState(
    "fuel",
    makesSearchParams.fuel.withOptions({ shallow: false, startTransition }),
  );

  return (
    <RadioGroup
      aria-label="Fuel type"
      className={cn(isPending && "opacity-70")}
      onChange={(value) => {
        trackFilter("fuel", value);
        setFuel(value === ALL_FUEL ? null : (value as FuelFilter));
      }}
      value={fuel ?? ALL_FUEL}
    >
      {[ALL_FUEL, ...FUEL_FILTERS].map((option) => (
        <Radio key={option} value={option}>
          <Radio.Content>
            <Radio.Control>
              <Radio.Indicator />
            </Radio.Control>
            {option === ALL_FUEL ? "All" : option}
          </Radio.Content>
        </Radio>
      ))}
    </RadioGroup>
  );
}

const SORT_LABELS: Record<Sort, string> = {
  count: "Registrations",
  make: "Make",
};

/** The ranked list's order: most cars first, or A to Z. */
export function SortSwitch() {
  const [isPending, startTransition] = useTransition();
  const [sort, setSort] = useQueryState(
    "sort",
    makesSearchParams.sort.withOptions({ shallow: false, startTransition }),
  );

  return (
    <Segment
      aria-label="Sort by"
      className={cn(isPending && "opacity-70")}
      onSelectionChange={(key) => {
        trackFilter("sort", String(key));
        setSort(key as Sort);
      }}
      selectedKey={sort}
      size="md"
      variant="ghost"
    >
      {SORTS.map((option) => (
        <Segment.Item id={option} key={option}>
          {SORT_LABELS[option]}
        </Segment.Item>
      ))}
    </Segment>
  );
}
