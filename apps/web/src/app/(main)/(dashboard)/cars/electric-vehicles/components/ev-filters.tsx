"use client";

import { cn, Radio, RadioGroup } from "@heroui/react";
import { Segment } from "@heroui-pro/react";
import {
  POWERTRAIN_TABS,
  RANGE_LABELS,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/constants";
import type {
  Powertrain,
  Range,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/search-params";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import posthog from "posthog-js";
import { useTransition } from "react";

/**
 * The page's two filters: which fuel type the registration trend plots, and
 * how far back it reaches.
 *
 * `shallow: false` throughout, so the server re-renders the trend against the
 * new selection and no series crosses into the client bundle.
 *
 * The option lists are restated here rather than imported from
 * `search-params.ts`, which builds its loader with `nuqs/server`.
 */
const POWERTRAINS = [
  "all",
  "bev",
  "phev",
  "hybrid",
] as const satisfies readonly Powertrain[];
const RANGES = ["1Y", "3Y", "All"] as const satisfies readonly Range[];

/** Every fuel type stays visible, so the choice is a list, not a menu. */
export function FuelTypeFilter() {
  const [isPending, startTransition] = useTransition();
  const [powertrain, setPowertrain] = useQueryState(
    "powertrain",
    parseAsStringLiteral(POWERTRAINS)
      .withDefault("all")
      .withOptions({ shallow: false, startTransition }),
  );

  return (
    <RadioGroup
      aria-label="Fuel type"
      className={cn(isPending && "opacity-70")}
      onChange={(value) => {
        posthog.capture("dashboard_filter_changed", {
          filter: "powertrain",
          value,
        });
        setPowertrain(value as Powertrain);
      }}
      value={powertrain}
    >
      {POWERTRAIN_TABS.map(({ key, label }) => (
        <Radio key={key} value={key}>
          <Radio.Content>
            <Radio.Control>
              <Radio.Indicator />
            </Radio.Control>
            {label}
          </Radio.Content>
        </Radio>
      ))}
    </RadioGroup>
  );
}

/** How far back the registration trend reaches from the selected month. */
export function TrendRangeFilter() {
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
        posthog.capture("dashboard_filter_changed", {
          filter: "range",
          value: key,
        });
        setRange(key as Range);
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
