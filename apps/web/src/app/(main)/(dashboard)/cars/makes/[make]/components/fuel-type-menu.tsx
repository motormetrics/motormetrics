"use client";

import { Button, Dropdown, Label } from "@heroui/react";
import { makeSearchParams } from "@web/app/(main)/(dashboard)/cars/makes/[make]/search-params";
import { ChevronDown } from "lucide-react";
import { useQueryState } from "nuqs";
import posthog from "posthog-js";
import { useTransition } from "react";

/** Menu id for the unfiltered view, which clears `?fuelType=`. */
const ALL_FUEL_TYPES = "all";

/**
 * The fuel type picker, beside the month picker and in the same shape: a
 * ghost button opening a menu. Writes `?fuelType=` with `shallow: false` so
 * the server re-renders the page. A menu rather than link tabs, so the
 * fuel types this make registers do not each become a crawlable URL.
 */
export function FuelTypeMenu({ fuelTypes }: { fuelTypes: string[] }) {
  const [isPending, startTransition] = useTransition();
  const [fuelType, setFuelType] = useQueryState(
    "fuelType",
    makeSearchParams.fuelType.withOptions({ shallow: false, startTransition }),
  );

  return (
    <Dropdown>
      <Button aria-label="Fuel type" isPending={isPending} variant="ghost">
        {fuelType ?? "All fuel types"}
        <ChevronDown aria-hidden className="size-4" strokeWidth={2.25} />
      </Button>
      <Dropdown.Popover>
        <Dropdown.Menu
          onAction={(key) => {
            const value = String(key);
            posthog.capture("dashboard_filter_changed", {
              filter: "fuel_type",
              value,
            });
            setFuelType(value === ALL_FUEL_TYPES ? null : value);
          }}
          selectedKeys={[fuelType ?? ALL_FUEL_TYPES]}
          selectionMode="single"
        >
          {[ALL_FUEL_TYPES, ...fuelTypes].map((option) => {
            const label = option === ALL_FUEL_TYPES ? "All fuel types" : option;
            return (
              <Dropdown.Item id={option} key={option} textValue={label}>
                <Dropdown.ItemIndicator />
                <Label>{label}</Label>
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
