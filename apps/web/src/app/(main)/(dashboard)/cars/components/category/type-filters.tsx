"use client";

import { cn } from "@heroui/react";
import { parseAsString, useQueryState } from "nuqs";
import posthog from "posthog-js";
import { useTransition } from "react";

/**
 * The window the headline, stat cells, make table and peer bars aggregate over,
 * anchored on the month the header's month selector picks.
 *
 * Options are passed in rather than listed here, the way `FuelTypeTabs` takes
 * its fuel types: the vocabulary and its parser live on the server, beside the
 * loader that validates the value, and only the labels cross into the bundle.
 *
 * `shallow: false` so the server re-renders every block against the new window
 * — the sections stay server components and no registration data reaches the
 * client.
 */
export function PeriodTabs({
  defaultKey,
  options,
}: {
  /** The window used when the URL carries no `period`, so one tab reads active. */
  defaultKey: string;
  options: { key: string; label: string }[];
}) {
  const [isPending, startTransition] = useTransition();
  const [period, setPeriod] = useQueryState(
    "period",
    parseAsString
      .withDefault(defaultKey)
      .withOptions({ shallow: false, startTransition }),
  );

  return (
    <fieldset
      className={cn(
        "m-0 flex flex-wrap gap-2 border-none p-0",
        isPending && "opacity-70",
      )}
    >
      <legend className="sr-only">Period</legend>
      {options.map(({ key, label }) => {
        const isActive = key === period;
        return (
          <button
            aria-pressed={isActive}
            className={cn(
              "cursor-pointer whitespace-nowrap rounded-full px-[18px] py-2.5 text-sm transition-colors",
              isActive
                ? "bg-accent font-bold text-accent-foreground"
                : "bg-surface font-semibold text-muted hover:text-foreground",
            )}
            key={key}
            onClick={() => {
              posthog.capture("dashboard_filter_changed", {
                filter: "period",
                value: key,
              });
              setPeriod(key);
            }}
            type="button"
          >
            {label}
          </button>
        );
      })}
    </fieldset>
  );
}
