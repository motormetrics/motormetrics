"use client";

import {
  ComboBox,
  Header,
  Input,
  Label,
  ListBox,
  Separator,
  toast,
} from "@heroui/react";

import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import type { Month } from "@web/types";
import { groupByYear } from "@web/utils/group-by-year";
import { Calendar } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import posthog from "posthog-js";
import { useEffect, useMemo, useRef } from "react";

interface MonthSelectorProps {
  months: Month[];
  latestMonth: Month;
  wasAdjusted?: boolean;
}

export function MonthSelector({
  months,
  latestMonth,
  wasAdjusted,
}: MonthSelectorProps) {
  const [month, setMonth] = useQueryState(
    "month",
    parseAsString.withDefault(latestMonth).withOptions({ shallow: false }),
  );
  const hasShownToast = useRef(false);

  // Show toast if server adjusted the month
  useEffect(() => {
    if (wasAdjusted && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.info(`Latest data is ${formatDateToMonthYear(latestMonth)}`);
    }
  }, [wasAdjusted, latestMonth]);

  return (
    <ComboBox
      selectedKey={month}
      onSelectionChange={(key) => {
        posthog.capture("dashboard_filter_changed", {
          filter: "month",
          value: key,
        });
        setMonth(key as string);
      }}
    >
      <Label className="sr-only">Month</Label>
      <ComboBox.InputGroup className="relative">
        <Calendar
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2 text-muted"
        />
        <Input className="pl-10" placeholder="Select Month" />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <MonthListBox months={months} />
      </ComboBox.Popover>
    </ComboBox>
  );
}

/**
 * The combo box list of months, newest year first, one section per year.
 * Shared by `MonthSelector` and the trends comparison pickers.
 */
export function MonthListBox({ months }: { months: Month[] }) {
  const years = useMemo(
    () => Object.entries(groupByYear(months)).reverse(),
    [months],
  );

  return (
    <ListBox>
      {years.map(([year, yearMonths], index) => (
        <ListBox.Section key={year}>
          {index > 0 && <Separator />}
          <Header>{year}</Header>
          {yearMonths.map((yearMonth) => {
            const date = `${year}-${yearMonth}`;
            const label = formatDateToMonthYear(date);
            return (
              <ListBox.Item key={date} id={date} textValue={label}>
                {label}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            );
          })}
        </ListBox.Section>
      ))}
    </ListBox>
  );
}
