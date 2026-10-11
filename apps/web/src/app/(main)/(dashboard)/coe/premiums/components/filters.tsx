"use client";

import { cn } from "@heroui/react";
import { Segment } from "@heroui-pro/react";
import {
  PREMIUM_RANGES,
  type PremiumRange,
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
const RANGE_LABELS: Record<PremiumRange, string> = {
  "1Y": "1 year",
  "3Y": "3 years",
  All: "Since 2010",
};

/** How far back the premium chart reaches. */
export function RangeTabs() {
  const [isPending, startTransition] = useTransition();
  const [range, setRange] = useQueryState(
    "range",
    premiumsSearchParams.range.withOptions({ shallow: false, startTransition }),
  );

  return (
    <Segment
      aria-label="Chart range"
      className={cn("max-md:w-full", isPending && "opacity-70")}
      onSelectionChange={(key) => {
        posthog.capture("dashboard_filter_changed", {
          filter: "range",
          value: key,
        });
        setRange(key as PremiumRange);
      }}
      selectedKey={range}
      size="sm"
      variant="ghost"
    >
      {PREMIUM_RANGES.map((option) => (
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
