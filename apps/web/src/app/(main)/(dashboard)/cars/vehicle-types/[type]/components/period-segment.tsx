"use client";

import { cn } from "@heroui/react";
import { Segment } from "@heroui-pro/react";
import { parseAsString, useQueryState } from "nuqs";
import posthog from "posthog-js";
import { useTransition } from "react";

/**
 * The window the headline, makes and comparison lists aggregate over.
 *
 * Options come in from the server, beside the loader that validates them, so
 * only the labels cross into the bundle. `shallow: false` so the server
 * re-renders every block against the new window.
 */
export function PeriodSegment({
  defaultKey,
  options,
}: {
  /** The window used when the URL carries no `period`, so one item reads selected. */
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
  // An unknown `?period=` falls back to the default on the server, so select it here too.
  const selectedKey = options.some(({ key }) => key === period)
    ? period
    : defaultKey;

  return (
    <Segment
      aria-label="Period"
      className={cn("max-md:w-full", isPending && "opacity-70")}
      onSelectionChange={(key) => {
        const next = String(key);
        posthog.capture("dashboard_filter_changed", {
          filter: "period",
          value: next,
        });
        setPeriod(next);
      }}
      selectedKey={selectedKey}
      size="sm"
      variant="ghost"
    >
      {options.map(({ key, label }) => (
        <Segment.Item className="max-md:flex-1 max-md:px-2" id={key} key={key}>
          {label}
        </Segment.Item>
      ))}
    </Segment>
  );
}
