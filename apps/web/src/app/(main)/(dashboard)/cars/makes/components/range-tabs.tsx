"use client";

import { cn } from "@heroui/react";
import { Segment } from "@heroui-pro/react";
import {
  isRange,
  RANGE_LABELS,
  RANGES,
} from "@web/app/(main)/(dashboard)/cars/makes/search-params";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import posthog from "posthog-js";
import { useTransition } from "react";

/**
 * The period switch in the page head: the three ranges as a segmented
 * control, as the comp draws it.
 *
 * Writes the `range` search param with `shallow: false` so every section
 * re-renders on the server against the new period; no registration data
 * crosses into the client bundle.
 */
export function RangeTabs() {
  const [isPending, startTransition] = useTransition();
  const [range, setRange] = useQueryState(
    "range",
    parseAsStringLiteral(RANGES)
      .withDefault("ytd")
      .withOptions({ shallow: false, startTransition }),
  );

  return (
    <Segment
      aria-label="Registration period"
      className={cn("max-md:w-full", isPending && "opacity-70")}
      onSelectionChange={(key) => {
        const next = String(key);
        if (!isRange(next)) {
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
        <Segment.Item
          className="max-md:flex-1 max-md:px-2"
          id={option}
          key={option}
        >
          {RANGE_LABELS[option]}
        </Segment.Item>
      ))}
    </Segment>
  );
}
