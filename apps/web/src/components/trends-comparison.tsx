"use client";

import {
  ComboBox,
  Drawer,
  Header,
  Input,
  Label,
  ListBox,
  Separator,
} from "@heroui/react";

import { formatDateToMonthYear } from "@motormetrics/utils";
import { ComparisonBarChart } from "@web/app/[locale]/(main)/(dashboard)/cars/registrations/components/comparison-bar-chart";
import { ComparisonSummary } from "@web/app/[locale]/(main)/(dashboard)/cars/registrations/components/comparison-summary";
import type { ComparisonData } from "@web/queries/cars/compare";
import type { Month } from "@web/types";
import { groupByYear } from "@web/utils/group-by-year";
import { format, subMonths } from "date-fns";
import { Calendar } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useMemo } from "react";

interface TrendsComparisonProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentMonth: string;
  months: Month[];
  comparisonData: ComparisonData | false;
}

function getDefaultMonthB(currentMonth: string, months: Month[]): string {
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
  const [compareA, setCompareA] = useQueryState(
    "compareA",
    parseAsString.withOptions({ shallow: false }),
  );
  const [compareB, setCompareB] = useQueryState(
    "compareB",
    parseAsString.withOptions({ shallow: false }),
  );

  const monthA = compareA ?? currentMonth;
  const monthB = compareB ?? getDefaultMonthB(currentMonth, months);

  // Set default params when drawer opens for the first time
  useEffect(() => {
    if (isOpen && !compareA && !compareB) {
      setCompareA(currentMonth);
      setCompareB(getDefaultMonthB(currentMonth, months));
    }
  }, [
    isOpen,
    compareA,
    compareB,
    currentMonth,
    months,
    setCompareA,
    setCompareB,
  ]);

  // Clean up params when drawer closes
  useEffect(() => {
    if (!isOpen && (compareA || compareB)) {
      setCompareA(null);
      setCompareB(null);
    }
  }, [isOpen, compareA, compareB, setCompareA, setCompareB]);

  const sortedMonths = useMemo(
    () => Object.entries(groupByYear(months)).slice().reverse(),
    [months],
  );

  const renderMonthPicker = (
    label: string,
    value: string,
    onChange: (val: string) => void,
  ) => (
    <ComboBox
      selectedKey={value}
      onSelectionChange={(key) => key && onChange(key as string)}
    >
      <Label>{label}</Label>
      <ComboBox.InputGroup>
        <Calendar className="ml-3 size-4 text-muted" />
        <Input placeholder={label} />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox>
          {sortedMonths.map(([year, yearMonths], index) => (
            <ListBox.Section key={year}>
              {index > 0 && <Separator />}
              <Header>{year}</Header>
              {yearMonths.map((m) => {
                const date = `${year}-${m}`;
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
      </ComboBox.Popover>
    </ComboBox>
  );

  return (
    <Drawer.Backdrop isOpen={isOpen} onOpenChange={onOpenChange} variant="blur">
      <Drawer.Content placement="bottom">
        <Drawer.Dialog>
          <Drawer.Header className="flex flex-col items-center pb-2">
            <div className="mb-4 h-1 w-12 rounded-full bg-gray-300" />
            <div className="flex w-full flex-col gap-4 text-center">
              <h2 className="font-bold text-xl">Trends Comparison</h2>
              <p className="text-gray-600 text-sm">
                Compare data across different periods
              </p>
            </div>
          </Drawer.Header>
          <Drawer.Body className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              {renderMonthPicker("Month A", monthA, setCompareA)}
              {renderMonthPicker("Month B", monthB, setCompareB)}
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
