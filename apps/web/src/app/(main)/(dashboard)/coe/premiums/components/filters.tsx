"use client";

import { cn } from "@heroui/react";
import {
  PREMIUM_RANGES,
  premiumsSearchParams,
} from "@web/app/(main)/(dashboard)/coe/premiums/search-params";
import { useQueryState } from "nuqs";
import posthog from "posthog-js";
import { useTransition } from "react";

/*
 * Writes to the URL with `shallow: false`, so the server re-renders every
 * block against the new selection and no COE data crosses into the client
 * bundle. The category switch is the overview's own, from `coe-controls`.
 */
/** How far back the premium chart reaches. */
export function RangeTabs() {
  const [isPending, startTransition] = useTransition();
  const [range, setRange] = useQueryState(
    "range",
    premiumsSearchParams.range.withOptions({ shallow: false, startTransition }),
  );

  return (
    <fieldset
      className={cn(
        "m-0 flex gap-1 rounded-full border-none bg-surface-secondary p-1",
        isPending && "opacity-70",
      )}
    >
      <legend className="sr-only">Chart range</legend>
      {PREMIUM_RANGES.map((option) => {
        const isActive = option === range;
        return (
          <button
            aria-pressed={isActive}
            className={cn(
              "cursor-pointer rounded-full px-4 py-[7px] text-sm transition-colors",
              isActive
                ? "bg-surface font-extrabold text-foreground shadow-surface"
                : "font-semibold text-muted hover:text-foreground",
            )}
            key={option}
            onClick={() => {
              posthog.capture("dashboard_filter_changed", {
                filter: "range",
                value: option,
              });
              setRange(option);
            }}
            type="button"
          >
            {option}
          </button>
        );
      })}
    </fieldset>
  );
}
