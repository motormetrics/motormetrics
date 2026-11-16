"use client";

import { Button, Dropdown, Header, Label, toast } from "@heroui/react";
import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import type { Month } from "@web/types";
import { groupByYear } from "@web/utils/group-by-year";
import { ChevronDown } from "lucide-react";
import { createSerializer, parseAsString } from "nuqs";
import posthog from "posthog-js";
import { useEffect, useMemo, useRef } from "react";

/**
 * The month picker the v3 comps put in the page eyebrow: the selected month
 * as a ghost button with a chevron, opening a menu of months grouped by year.
 *
 * Each month is a link to `?month=`, built from `pathname` and the page's
 * other `query` params, so the picker needs no client URL state: the page
 * resolves the month on the server and passes it in. The latest month drops
 * out of the query string, so the default view stays on the clean URL.
 */
export function MonthMenu({
  latestMonth,
  month,
  months,
  pathname,
  query = {},
  wasAdjusted,
}: {
  latestMonth: Month;
  /** The month the page resolved and is showing. */
  month: Month;
  months: Month[];
  pathname: string;
  /** The page's other search params, kept on every month link. */
  query?: Record<string, string | string[] | undefined>;
  wasAdjusted?: boolean;
}) {
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

  const hrefFor = useMemo(() => {
    const serialize = createSerializer({
      month: parseAsString.withDefault(latestMonth),
    });
    const base = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (key === "month" || value === undefined) {
        continue;
      }
      for (const item of Array.isArray(value) ? value : [value]) {
        base.append(key, item);
      }
    }
    const baseHref = base.size > 0 ? `${pathname}?${base}` : pathname;

    return (value: Month) => serialize(baseHref, { month: value });
  }, [latestMonth, pathname, query]);

  return (
    <Dropdown>
      <Button aria-label="Month" variant="ghost">
        {formatDateToMonthYear(month)}
        <ChevronDown aria-hidden className="size-4" strokeWidth={2.25} />
      </Button>
      <Dropdown.Popover className="max-h-96">
        <Dropdown.Menu
          onAction={(key) => {
            posthog.capture("dashboard_filter_changed", {
              filter: "month",
              value: key,
            });
          }}
          selectedKeys={[month]}
          selectionMode="single"
        >
          {years.map(([year, monthsOfYear]) => (
            <Dropdown.Section key={year}>
              <Header>{year}</Header>
              {monthsOfYear.map((monthOfYear) => {
                const value = `${year}-${monthOfYear}`;
                const label = formatDateToMonthYear(value);

                return (
                  <Dropdown.Item
                    href={hrefFor(value)}
                    id={value}
                    key={value}
                    textValue={label}
                  >
                    <Dropdown.ItemIndicator />
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
