"use client";

import { cn } from "@heroui/react";
import { Segment } from "@heroui-pro/react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import posthog from "posthog-js";
import { useTransition } from "react";

/**
 * The page's two switches: the window the headline, table and makes cover,
 * and whether the trend plots share or volume.
 *
 * `shallow: false`, so the server re-renders every block against the new
 * selection and no registration data crosses into the client bundle. The
 * parsers are restated here rather than imported from the report, because a
 * `"use client"` module cannot hand plain values back to a server component.
 */
const PERIODS = ["month", "ytd"] as const;
const MEASURES = ["share", "volume"] as const;

const PERIOD_LABELS: Record<(typeof PERIODS)[number], string> = {
  month: "This month",
  ytd: "Year to date",
};

const MEASURE_LABELS: Record<(typeof MEASURES)[number], string> = {
  share: "Share",
  volume: "Volume",
};

/** On phones each switch spans the row and its items share the width. */
const SEGMENT_CLASS = "max-md:w-full";
const SEGMENT_ITEM_CLASS = "max-md:flex-1 max-md:px-2";

export function PeriodSegment() {
  const [isPending, startTransition] = useTransition();
  const [period, setPeriod] = useQueryState(
    "period",
    parseAsStringLiteral(PERIODS)
      .withDefault("month")
      .withOptions({ shallow: false, startTransition }),
  );

  return (
    <Segment
      aria-label="Period"
      className={cn(SEGMENT_CLASS, isPending && "opacity-70")}
      onSelectionChange={(key) => {
        posthog.capture("dashboard_filter_changed", {
          filter: "period",
          value: key,
        });
        setPeriod(key as (typeof PERIODS)[number]);
      }}
      selectedKey={period}
      size="sm"
      variant="ghost"
    >
      {PERIODS.map((option) => (
        <Segment.Item className={SEGMENT_ITEM_CLASS} id={option} key={option}>
          {PERIOD_LABELS[option]}
        </Segment.Item>
      ))}
    </Segment>
  );
}

export function MeasureSegment() {
  const [isPending, startTransition] = useTransition();
  const [measure, setMeasure] = useQueryState(
    "measure",
    parseAsStringLiteral(MEASURES)
      .withDefault("share")
      .withOptions({ shallow: false, startTransition }),
  );

  return (
    <Segment
      aria-label="Chart measure"
      className={cn(SEGMENT_CLASS, isPending && "opacity-70")}
      onSelectionChange={(key) => {
        posthog.capture("dashboard_filter_changed", {
          filter: "measure",
          value: key,
        });
        setMeasure(key as (typeof MEASURES)[number]);
      }}
      selectedKey={measure}
      size="sm"
      variant="ghost"
    >
      {MEASURES.map((option) => (
        <Segment.Item className={SEGMENT_ITEM_CLASS} id={option} key={option}>
          {MEASURE_LABELS[option]}
        </Segment.Item>
      ))}
    </Segment>
  );
}
