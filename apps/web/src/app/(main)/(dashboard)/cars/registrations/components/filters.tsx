"use client";

import { Button, cn, Dropdown, Label } from "@heroui/react";
import { Segment } from "@heroui-pro/react";
import { RANGES } from "@web/app/(main)/(dashboard)/cars/registrations/search-params";
import { ChevronDown } from "lucide-react";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import posthog from "posthog-js";
import { useTransition } from "react";

/*
 * URL state with `shallow: false` throughout, so the server re-renders every
 * block against the new selection — the sections stay server components and no
 * registration data crosses into the client bundle. Same approach as
 * `cars/makes/components/range-menu.tsx`.
 */

/** Menu keys cannot be null, so the unfiltered view takes its own key. */
const ALL_FUEL_TYPES = "all";

/**
 * The fuel type filter in the toolbar, styled as the month menu beside it.
 * Fuel types are LTA's, passed in from the server rather than listed here, so
 * a new value in a DataMall drop appears on its own.
 */
export function FuelTypeMenu({ fuelTypes }: { fuelTypes: string[] }) {
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useQueryState(
    "fuelType",
    parseAsString.withOptions({ shallow: false, startTransition }),
  );

  return (
    <Dropdown>
      <Button aria-label="Fuel type" isPending={isPending} variant="ghost">
        {selected ?? "All fuel types"}
        <ChevronDown aria-hidden className="size-4" strokeWidth={2.25} />
      </Button>
      <Dropdown.Popover className="max-h-96">
        <Dropdown.Menu
          onAction={(key) => {
            const next = key === ALL_FUEL_TYPES ? null : String(key);
            posthog.capture("dashboard_filter_changed", {
              filter: "fuel_type",
              value: next,
            });
            setSelected(next);
          }}
          selectedKeys={[selected ?? ALL_FUEL_TYPES]}
          selectionMode="single"
        >
          {[ALL_FUEL_TYPES, ...fuelTypes].map((fuelType) => {
            const label =
              fuelType === ALL_FUEL_TYPES ? "All fuel types" : fuelType;
            return (
              <Dropdown.Item id={fuelType} key={fuelType} textValue={label}>
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
      className={cn(isPending && "opacity-70")}
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
        <Segment.Item id={option} key={option}>
          {option}
        </Segment.Item>
      ))}
    </Segment>
  );
}
