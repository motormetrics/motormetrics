"use client";

import { cn } from "@heroui/react";
import { NativeSelect, Segment } from "@heroui-pro/react";
import {
  RANGE_LABELS,
  RANGES,
} from "@web/app/(main)/(dashboard)/cars/components/ranges";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import posthog from "posthog-js";
import { useTransition } from "react";

/*
 * URL state with `shallow: false` throughout, so the server re-renders every
 * block against the new selection — the sections stay server components and no
 * registration data crosses into the client bundle.
 */

/** An option cannot carry null, so the unfiltered view takes the empty value. */
const ALL_FUEL_TYPES = "";

/**
 * The fuel type the page is narrowed to. Fuel types are as LTA records them,
 * passed in from the server rather than listed here — a new value in a
 * DataMall drop should appear on its own.
 */
export function FuelTypeSelect({ fuelTypes }: { fuelTypes: string[] }) {
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useQueryState(
    "fuelType",
    parseAsString.withOptions({ shallow: false, startTransition }),
  );

  return (
    <NativeSelect fullWidth>
      <NativeSelect.Trigger
        aria-busy={isPending}
        aria-label="Fuel type"
        onChange={(event) => {
          const next =
            event.target.value === ALL_FUEL_TYPES ? null : event.target.value;
          posthog.capture("dashboard_filter_changed", {
            filter: "fuel_type",
            value: next,
          });
          setSelected(next);
        }}
        value={selected ?? ALL_FUEL_TYPES}
      >
        <NativeSelect.Option value={ALL_FUEL_TYPES}>
          All fuel types
        </NativeSelect.Option>
        {fuelTypes.map((fuelType) => (
          <NativeSelect.Option key={fuelType} value={fuelType}>
            {fuelType}
          </NativeSelect.Option>
        ))}
        <NativeSelect.Indicator />
      </NativeSelect.Trigger>
    </NativeSelect>
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
      aria-label="Trend range"
      className={cn("w-full", isPending && "opacity-70")}
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
      size="md"
      variant="ghost"
    >
      {RANGES.map((option) => (
        <Segment.Item className="flex-1 px-2" id={option} key={option}>
          {RANGE_LABELS[option]}
        </Segment.Item>
      ))}
    </Segment>
  );
}
