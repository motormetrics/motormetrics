"use client";

import { Segment } from "@heroui-pro/react";
import {
  FUEL_FILTERS,
  type FuelFilter,
} from "@web/app/(main)/(dashboard)/cars/makes/search-params";
import { parseAsString, useQueryState } from "nuqs";
import posthog from "posthog-js";
import { useTransition } from "react";

/** Segment key for the "All" item, which clears the `fuel` param. */
const ALL = "all";

/**
 * The powertrain switch beside the "All makes" heading.
 *
 * Writes the `fuel` search param — cleared for "All", so the default URL stays
 * clean — with `shallow: false`, because the tab changes what the server has
 * to aggregate. The active item is taken from the server-resolved `fuel` prop
 * rather than the hook so the first paint agrees with what was rendered.
 */
export function FuelTabs({ fuel }: { fuel: FuelFilter | null }) {
  const [, startTransition] = useTransition();
  const [, setFuel] = useQueryState(
    "fuel",
    parseAsString.withOptions({ shallow: false, startTransition }),
  );

  const options: { key: string; label: string }[] = [
    { key: ALL, label: "All" },
    ...FUEL_FILTERS.map((filter) => ({ key: filter, label: filter })),
  ];

  return (
    <Segment
      aria-label="Powertrain"
      onSelectionChange={(key) => {
        const label = key === ALL ? "All" : String(key);
        posthog.capture("dashboard_filter_changed", {
          filter: "fuel",
          value: label,
        });
        setFuel(key === ALL ? null : String(key));
      }}
      selectedKey={fuel ?? ALL}
      size="md"
      variant="ghost"
    >
      {options.map((option) => (
        <Segment.Item id={option.key} key={option.key}>
          {option.label}
        </Segment.Item>
      ))}
    </Segment>
  );
}
