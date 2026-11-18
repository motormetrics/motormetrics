"use client";

import { NativeSelect } from "@heroui-pro/react";
import { coeSearchParams } from "@web/app/(main)/(dashboard)/coe/search-params";
import { type Period, periods } from "@web/types/coe";
import { useQueryState } from "nuqs";
import posthog from "posthog-js";
import { useTransition } from "react";

const PERIOD_LABELS: Record<Period, string> = {
  "12m": "Last 12 months",
  "5y": "5 years",
  "10y": "10 years",
  ytd: "Year to date",
  all: "All",
};

/**
 * The period the premium history covers, in the page head beside Share.
 *
 * Writes the `period` search param with `shallow: false`, so the server
 * re-renders the chart and the exercises against the new period.
 */
export function PeriodSelect() {
  const [isPending, startTransition] = useTransition();
  const [period, setPeriod] = useQueryState(
    "period",
    coeSearchParams.period.withOptions({ shallow: false, startTransition }),
  );

  return (
    <NativeSelect className="max-md:w-full">
      <NativeSelect.Trigger
        aria-busy={isPending}
        aria-label="Period"
        onChange={(event) => {
          posthog.capture("dashboard_filter_changed", {
            filter: "period",
            value: event.target.value,
          });
          setPeriod(event.target.value as Period);
        }}
        value={period}
        wrapperClassName="max-md:w-full"
      >
        {periods.map((option) => (
          <NativeSelect.Option key={option} value={option}>
            {PERIOD_LABELS[option]}
          </NativeSelect.Option>
        ))}
        <NativeSelect.Indicator />
      </NativeSelect.Trigger>
    </NativeSelect>
  );
}
