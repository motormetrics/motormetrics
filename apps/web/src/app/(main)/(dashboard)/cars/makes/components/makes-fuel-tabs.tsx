"use client";

import { cn } from "@heroui/react";
import { parseAsString, useQueryState } from "nuqs";
import { useTransition } from "react";

/**
 * Fuel-type filter above the table. Like the range tabs this is URL state with
 * `shallow: false`, because switching fuel changes which rows the server has to
 * aggregate, not just which of them are visible.
 */
export function MakesFuelTabs({ fuelTypes }: { fuelTypes: string[] }) {
  const [, startTransition] = useTransition();
  const [fuel, setFuel] = useQueryState(
    "fuel",
    parseAsString.withOptions({ shallow: false, startTransition }),
  );

  const options: { label: string; value: string | null }[] = [
    { label: "All", value: null },
    ...fuelTypes.map((fuelType) => ({ label: fuelType, value: fuelType })),
  ];

  return (
    <fieldset className="m-0 flex flex-wrap gap-1.5 rounded-field border-none bg-default p-1.5">
      <legend className="sr-only">Fuel type</legend>
      {options.map((option) => {
        const isActive = option.value === fuel;
        return (
          <button
            aria-pressed={isActive}
            className={cn(
              "cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors",
              isActive
                ? "bg-surface font-extrabold text-foreground shadow-surface"
                : "font-semibold text-muted hover:text-foreground",
            )}
            key={option.label}
            onClick={() => setFuel(option.value)}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </fieldset>
  );
}
