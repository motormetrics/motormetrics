"use client";

import { NativeSelect } from "@heroui-pro/react";
import { parseAsString, useQueryState } from "nuqs";
import posthog from "posthog-js";
import { useTransition } from "react";

/** Option value for the unfiltered view, which clears `?fuelType=`. */
const ALL_FUEL_TYPES = "all";

/**
 * The fuel type the make page is narrowed to, as a native select in the
 * filters panel. It writes `?fuelType=` from the browser with `shallow: false`
 * so the server re-renders the report; no option is a link.
 *
 * The fuel types are LTA's, passed in from the server rather than listed
 * here: only the ones this make registers in the period are offered, so a
 * make with no diesel never shows an option that would empty the page.
 */
export function FuelTypeSelect({ fuelTypes }: { fuelTypes: string[] }) {
  const [isPending, startTransition] = useTransition();
  const [fuelType, setFuelType] = useQueryState(
    "fuelType",
    parseAsString.withOptions({ shallow: false, startTransition }),
  );

  return (
    <NativeSelect className="w-full">
      <NativeSelect.Trigger
        aria-busy={isPending}
        aria-label="Fuel type"
        onChange={(event) => {
          const { value } = event.target;
          posthog.capture("dashboard_filter_changed", {
            filter: "fuel_type",
            value,
          });
          setFuelType(value === ALL_FUEL_TYPES ? null : value);
        }}
        value={fuelType ?? ALL_FUEL_TYPES}
        wrapperClassName="w-full"
      >
        <NativeSelect.Option value={ALL_FUEL_TYPES}>
          All fuel types
        </NativeSelect.Option>
        {fuelTypes.map((option) => (
          <NativeSelect.Option key={option} value={option}>
            {option}
          </NativeSelect.Option>
        ))}
        <NativeSelect.Indicator />
      </NativeSelect.Trigger>
    </NativeSelect>
  );
}
