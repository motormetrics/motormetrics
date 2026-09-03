"use client";

import { cn } from "@heroui/react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import posthog from "posthog-js";
import { useTransition } from "react";

/**
 * The two controls the comp puts in the filter bar.
 *
 * `shallow: false` throughout, so the server re-renders every block against the
 * new selection and no registration data crosses into the client bundle — the
 * same arrangement `cars/registrations/components/filters.tsx` uses.
 *
 * The parsers are declared here and again in `category-report.tsx` rather than
 * in a shared `search-params.ts`: extracting one for this folder is deliberately
 * deferred, and a "use client" module cannot hand plain values to a server
 * component.
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

/** Whether the figures cover the selected month or the year up to it. */
export function PeriodTabs() {
  const [isPending, startTransition] = useTransition();
  const [period, setPeriod] = useQueryState(
    "period",
    parseAsStringLiteral(PERIODS)
      .withDefault("month")
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
      {PERIODS.map((option) => {
        const isActive = option === period;
        return (
          <button
            aria-pressed={isActive}
            className={cn(
              "cursor-pointer whitespace-nowrap rounded-full px-[18px] py-2.5 text-sm transition-colors",
              isActive
                ? "bg-accent font-bold text-accent-foreground"
                : "bg-surface font-semibold text-muted hover:text-foreground",
            )}
            key={option}
            onClick={() => {
              posthog.capture("dashboard_filter_changed", {
                filter: "period",
                value: option,
              });
              setPeriod(option);
            }}
            type="button"
          >
            {PERIOD_LABELS[option]}
          </button>
        );
      })}
    </fieldset>
  );
}

/** Whether the chart plots each type's share of the month or its raw count. */
export function MeasureTabs() {
  const [isPending, startTransition] = useTransition();
  const [measure, setMeasure] = useQueryState(
    "measure",
    parseAsStringLiteral(MEASURES)
      .withDefault("share")
      .withOptions({ shallow: false, startTransition }),
  );

  return (
    <fieldset
      className={cn(
        "m-0 flex gap-1 rounded-full border-none bg-surface-secondary p-1",
        isPending && "opacity-70",
      )}
    >
      <legend className="sr-only">Chart measure</legend>
      {MEASURES.map((option) => {
        const isActive = option === measure;
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
                filter: "measure",
                value: option,
              });
              setMeasure(option);
            }}
            type="button"
          >
            {MEASURE_LABELS[option]}
          </button>
        );
      })}
    </fieldset>
  );
}
