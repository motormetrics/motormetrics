"use client";

import {
  Drawer,
  Header,
  Label,
  ListBox,
  Select,
  Separator,
  Typography,
} from "@heroui/react";
import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import { ComparisonBarChart } from "@web/app/(main)/(dashboard)/cars/registrations/components/comparison-bar-chart";
import { ComparisonSummary } from "@web/app/(main)/(dashboard)/cars/registrations/components/comparison-summary";
import type { ComparisonData } from "@web/queries/cars/compare";
import type { Month } from "@web/types";
import { groupByYear } from "@web/utils/group-by-year";
import { format, subMonths } from "date-fns";
import { Calendar } from "lucide-react";
import { parseAsString, useQueryStates } from "nuqs";
import posthog from "posthog-js";
import { useMemo } from "react";

interface TrendsComparisonProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentMonth: string;
  months: Month[];
  comparisonData: ComparisonData | false;
}

/** URL state for the two compared months; a change re-renders the page's data. */
export const compareParams = {
  compareA: parseAsString,
  compareB: parseAsString,
};

export function getDefaultMonthB(
  currentMonth: string,
  months: Month[],
): string {
  const previousMonthStr = format(
    subMonths(new Date(`${currentMonth}-01`), 1),
    "yyyy-MM",
  );
  if (months.includes(previousMonthStr)) {
    return previousMonthStr;
  }
  return months[1] ?? months[0] ?? currentMonth;
}

export function TrendsComparison({
  isOpen,
  onOpenChange,
  currentMonth,
  months,
  comparisonData,
}: TrendsComparisonProps) {
  const [{ compareA, compareB }, setCompare] = useQueryStates(compareParams, {
    shallow: false,
  });

  const monthA = compareA ?? currentMonth;
  const monthB = compareB ?? getDefaultMonthB(currentMonth, months);

  const years = useMemo(
    () => Object.entries(groupByYear(months)).reverse(),
    [months],
  );

  const renderMonthPicker = (
    label: string,
    filter: "compare_a" | "compare_b",
    value: string,
    onChange: (val: string) => void,
  ) => (
    <Select
      placeholder={label}
      value={value}
      onChange={(key) => {
        if (!key) return;
        posthog.capture("dashboard_filter_changed", {
          filter,
          value: key,
        });
        onChange(String(key));
      }}
    >
      <Label>{label}</Label>
      <Select.Trigger className="gap-2">
        <Calendar aria-hidden className="size-4 shrink-0 text-muted" />
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {years.map(([year, yearMonths], index) => (
            <ListBox.Section key={year}>
              {index > 0 && <Separator />}
              <Header>{year}</Header>
              {yearMonths.map((yearMonth) => {
                const date = `${year}-${yearMonth}`;
                const monthLabel = formatDateToMonthYear(date);
                return (
                  <ListBox.Item key={date} id={date} textValue={monthLabel}>
                    {monthLabel}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                );
              })}
            </ListBox.Section>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );

  return (
    <Drawer.Backdrop isOpen={isOpen} onOpenChange={onOpenChange} variant="blur">
      <Drawer.Content placement="bottom">
        <Drawer.Dialog>
          <Drawer.Header className="items-center gap-4 pb-2">
            <div className="h-1 w-12 rounded-full bg-default" />
            <div className="flex w-full flex-col gap-4 text-center">
              <Typography.Heading level={2}>
                Trends Comparison
              </Typography.Heading>
              <Typography.Paragraph color="muted" size="sm">
                Compare data across different periods
              </Typography.Paragraph>
            </div>
          </Drawer.Header>
          <Drawer.Body className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              {renderMonthPicker("Month A", "compare_a", monthA, (month) =>
                setCompare({ compareA: month }),
              )}
              {renderMonthPicker("Month B", "compare_b", monthB, (month) =>
                setCompare({ compareB: month }),
              )}
            </div>
            {!comparisonData && (
              <div className="flex justify-center py-8">
                <span className="text-muted">Loading comparison data…</span>
              </div>
            )}
            {comparisonData && (
              <div className="flex flex-col gap-4">
                <ComparisonSummary
                  monthA={comparisonData.monthA}
                  monthB={comparisonData.monthB}
                />
                <ComparisonBarChart
                  monthA={comparisonData.monthA}
                  monthB={comparisonData.monthB}
                  type="fuelType"
                  title="Fuel Type Breakdown"
                />
                <ComparisonBarChart
                  monthA={comparisonData.monthA}
                  monthB={comparisonData.monthB}
                  type="vehicleType"
                  title="Vehicle Type Breakdown"
                />
              </div>
            )}
          </Drawer.Body>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  );
}
