"use client";

import { toast } from "@heroui/react";
import { NativeSelect } from "@heroui-pro/react";
import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import type { Month } from "@web/types";
import { groupByYear } from "@web/utils/group-by-year";
import { parseAsString, useQueryState } from "nuqs";
import posthog from "posthog-js";
import { useEffect, useMemo, useRef, useTransition } from "react";

/**
 * The month a page reports on, as a native select grouped by year. It sits in
 * the page head beside Share.
 *
 * Writes the `month` search param with `shallow: false` so the server
 * re-renders the page for the new month.
 */
export function MonthSelect({
  fullWidth = false,
  latestMonth,
  months,
  wasAdjusted,
}: {
  /** Fill the row at every width, as in the filters panel. */
  fullWidth?: boolean;
  latestMonth: Month;
  months: Month[];
  wasAdjusted?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [month, setMonth] = useQueryState(
    "month",
    parseAsString
      .withDefault(latestMonth)
      .withOptions({ shallow: false, startTransition }),
  );
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (wasAdjusted && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.info(`Latest data is ${formatDateToMonthYear(latestMonth)}`);
    }
  }, [wasAdjusted, latestMonth]);

  const years = useMemo(
    () => Object.entries(groupByYear(months)).reverse(),
    [months],
  );

  return (
    <NativeSelect className="max-md:w-full" fullWidth={fullWidth}>
      <NativeSelect.Trigger
        aria-busy={isPending}
        aria-label="Month"
        onChange={(event) => {
          posthog.capture("dashboard_filter_changed", {
            filter: "month",
            value: event.target.value,
          });
          setMonth(event.target.value);
        }}
        value={month}
        wrapperClassName="max-md:w-full"
      >
        {years.map(([year, monthsOfYear]) => (
          <NativeSelect.OptGroup key={year} label={year}>
            {monthsOfYear.map((monthOfYear) => {
              const value = `${year}-${monthOfYear}`;

              return (
                <NativeSelect.Option key={value} value={value}>
                  {formatDateToMonthYear(value)}
                </NativeSelect.Option>
              );
            })}
          </NativeSelect.OptGroup>
        ))}
        <NativeSelect.Indicator />
      </NativeSelect.Trigger>
    </NativeSelect>
  );
}
