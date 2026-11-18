"use client";

import { Typography } from "@heroui/react";
import { NativeSelect } from "@heroui-pro/react";
import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import type { Month } from "@web/types";
import { groupByYear } from "@web/utils/group-by-year";
import { parseAsString, useQueryStates } from "nuqs";
import posthog from "posthog-js";
import { useMemo, useTransition } from "react";

/** URL state for the two compared months; a change re-renders the section. */
const compareParams = {
  compareA: parseAsString,
  compareB: parseAsString,
};

/**
 * The two month selects in the "Compare two months" header. Until a month is
 * picked each select shows its default, which follows the page's month.
 */
export function TrendsComparison({
  defaultMonthA,
  defaultMonthB,
  months,
}: {
  defaultMonthA: string;
  defaultMonthB: string;
  months: Month[];
}) {
  const [isPending, startTransition] = useTransition();
  const [{ compareA, compareB }, setCompare] = useQueryStates(compareParams, {
    shallow: false,
    startTransition,
  });

  const years = useMemo(
    () => Object.entries(groupByYear(months)).reverse(),
    [months],
  );

  const renderMonthSelect = (
    label: string,
    filter: "compare_a" | "compare_b",
    value: string,
    onChange: (month: string) => void,
  ) => (
    <div className="flex min-w-0 items-center gap-2">
      <Typography.Paragraph color="muted" size="xs" weight="semibold">
        {label}
      </Typography.Paragraph>
      <NativeSelect>
        <NativeSelect.Trigger
          aria-busy={isPending}
          aria-label={
            filter === "compare_a"
              ? "Month to compare"
              : "Month to compare against"
          }
          onChange={(event) => {
            posthog.capture("dashboard_filter_changed", {
              filter,
              value: event.target.value,
            });
            onChange(event.target.value);
          }}
          value={value}
        >
          {years.map(([year, monthsOfYear]) => (
            <NativeSelect.OptGroup key={year} label={year}>
              {monthsOfYear.map((monthOfYear) => {
                const month = `${year}-${monthOfYear}`;

                return (
                  <NativeSelect.Option key={month} value={month}>
                    {formatDateToMonthYear(month)}
                  </NativeSelect.Option>
                );
              })}
            </NativeSelect.OptGroup>
          ))}
          <NativeSelect.Indicator />
        </NativeSelect.Trigger>
      </NativeSelect>
    </div>
  );

  return (
    <>
      {renderMonthSelect(
        "Month",
        "compare_a",
        compareA && months.includes(compareA) ? compareA : defaultMonthA,
        (month) => setCompare({ compareA: month }),
      )}
      {renderMonthSelect(
        "Against",
        "compare_b",
        compareB && months.includes(compareB) ? compareB : defaultMonthB,
        (month) => setCompare({ compareB: month }),
      )}
    </>
  );
}
