"use client";

import { cn } from "@heroui/react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import posthog from "posthog-js";
import { useTransition } from "react";
import { RANGE_LABELS, RANGES } from "../search-params";

/**
 * Range tabs in the page head.
 *
 * URL state with `shallow: false` so the server re-renders every bento block
 * against the new period — the blocks stay server components and no registration
 * data crosses into the client bundle.
 */
export function MakesHeaderMeta() {
  const [, startTransition] = useTransition();
  const [range, setRange] = useQueryState(
    "range",
    parseAsStringLiteral(RANGES)
      .withDefault("ytd")
      .withOptions({ shallow: false, startTransition }),
  );

  return (
    <fieldset className="m-0 flex flex-wrap gap-1.5 rounded-full border-none bg-default p-1.5">
      <legend className="sr-only">Registration period</legend>
      {RANGES.map((option) => {
        const isActive = option === range;
        return (
          <button
            aria-pressed={isActive}
            className={cn(
              "cursor-pointer whitespace-nowrap rounded-full px-4 py-2.5 text-sm transition-colors",
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
            {RANGE_LABELS[option]}
          </button>
        );
      })}
    </fieldset>
  );
}
