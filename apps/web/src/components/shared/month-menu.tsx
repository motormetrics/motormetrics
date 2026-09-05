"use client";

import { Button, Dropdown, Header, Label, toast } from "@heroui/react";
import { formatDateToMonthYear } from "@motormetrics/utils";
import type { Month } from "@web/types";
import { groupByYear } from "@web/utils/group-by-year";
import { ChevronDown } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import posthog from "posthog-js";
import { useEffect, useMemo, useRef, useTransition } from "react";

/**
 * The month picker the v3 comps put in the page eyebrow: the selected month
 * as a bold accent label with a chevron, opening a menu of months grouped by
 * year.
 *
 * Writes the same `month` search param as `MonthSelector`, with
 * `shallow: false` so the server re-renders the page for the new month. The
 * combo box stays on the report pages, where the comps still draw a field.
 */
export function MonthMenu({
  latestMonth,
  months,
  wasAdjusted,
}: {
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
    <Dropdown>
      <Button
        aria-label="Month"
        className={
          "h-auto gap-2 rounded-full bg-transparent p-0 font-bold text-accent-strong text-base transition-colors hover:bg-transparent hover:text-accent-deep data-[pressed]:bg-transparent"
        }
        isPending={isPending}
        variant="tertiary"
      >
        {formatDateToMonthYear(month)}
        <ChevronDown aria-hidden className="size-4" strokeWidth={2.25} />
      </Button>
      <Dropdown.Popover className="max-h-96 min-w-52 overflow-y-auto">
        <Dropdown.Menu
          onAction={(key) => {
            posthog.capture("dashboard_filter_changed", {
              filter: "month",
              value: key,
            });
            setMonth(String(key));
          }}
        >
          {years.map(([year, monthsOfYear]) => (
            <Dropdown.Section key={year}>
              <Header>{year}</Header>
              {monthsOfYear.map((monthOfYear) => {
                const value = `${year}-${monthOfYear}`;
                const label = formatDateToMonthYear(value);
                const isActive = value === month;

                return (
                  <Dropdown.Item
                    className={
                      isActive
                        ? "bg-accent-soft-2 font-bold text-accent-deep"
                        : undefined
                    }
                    id={value}
                    key={value}
                    textValue={label}
                  >
                    <Label>{label}</Label>
                  </Dropdown.Item>
                );
              })}
            </Dropdown.Section>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
