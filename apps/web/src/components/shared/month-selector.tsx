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

import { formatDateToMonthYear } from "@motormetrics/utils";
import type { Month } from "@web/types";
import { groupByYear } from "@web/utils/group-by-year";
import { Calendar } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
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

  const memoisedGroupByYear = useMemo(() => groupByYear, []);
  const sortedMonths = useMemo(
    () => Object.entries(memoisedGroupByYear(months)).slice().reverse(),
    [memoisedGroupByYear, months],
  );

  return (
    <ComboBox
      selectedKey={month}
      onSelectionChange={(key) => setMonth(key as string)}
    >
      <Label className="sr-only">Month</Label>
      <ComboBox.InputGroup>
        <Calendar className="ml-3 size-4 text-default-500" />
        <Input placeholder="Select Month" />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox>
          {sortedMonths.map(([year, months], index) => (
            <ListBox.Section key={year}>
              {index > 0 && <Separator />}
              <Header>{year}</Header>
              {months.map((month) => {
                const date = `${year}-${month}`;
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
      </ComboBox.Popover>
    </ComboBox>
  );
}
