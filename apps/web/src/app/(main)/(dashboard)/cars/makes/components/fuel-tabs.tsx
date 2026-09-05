"use client";

import { ToggleButton, ToggleButtonGroup } from "@heroui/react";
import { parseAsString, useQueryState } from "nuqs";
import posthog from "posthog-js";
import { useTransition } from "react";
import { FUEL_FILTERS, type FuelFilter } from "./make-rows";

/** Group key for the "All" pill, which clears the `fuel` param. */
const ALL = "all";

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

  const options: { key: string; label: string }[] = [
    { key: ALL, label: "All" },
    ...FUEL_FILTERS.map((filter) => ({ key: filter, label: filter })),
  ];

  return (
    <ToggleButtonGroup
      aria-label="Powertrain"
      className="flex min-w-0 flex-wrap gap-2"
      disallowEmptySelection
      isDetached
      onSelectionChange={(keys) => {
        const [key] = [...keys];
        if (key === undefined) {
          return;
        }
        const label = key === ALL ? "All" : String(key);
        posthog.capture("dashboard_filter_changed", {
          filter: "fuel",
          value: label,
        });
        setFuel(key === ALL ? null : String(key));
      }}
      selectedKeys={[fuel ?? ALL]}
      selectionMode="single"
    >
      {options.map((option) => (
        <ToggleButton
          className="h-auto whitespace-nowrap rounded-full bg-default px-[18px] py-2.5 font-semibold text-foreground/75 text-sm transition-colors hover:bg-default hover:text-foreground data-[selected=true]:bg-accent data-[selected=true]:font-extrabold data-[selected=true]:text-accent-foreground"
          id={option.key}
          key={option.key}
        >
          {option.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
