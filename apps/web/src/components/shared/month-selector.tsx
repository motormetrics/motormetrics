"use client";

import {
  Autocomplete,
  AutocompleteItem,
  AutocompleteSection,
} from "@heroui/react";
import { addToast } from "@heroui/toast";
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
      addToast({
        title: `Latest data is ${formatDateToMonthYear(latestMonth)}`,
        variant: "bordered",
      });
    }
  }, [wasAdjusted, latestMonth]);

  const memoisedGroupByYear = useMemo(() => groupByYear, []);
  const sortedMonths = useMemo(
    () => Object.entries(memoisedGroupByYear(months)).slice().reverse(),
    [memoisedGroupByYear, months],
  );

  return (
    <Autocomplete
      selectedKey={month}
      onSelectionChange={(key) => setMonth(key as string)}
      aria-label="Month"
      placeholder="Select Month"
      startContent={<Calendar className="size-4" />}
      variant="underlined"
    >
      {sortedMonths.map(([year, months]) => (
        <AutocompleteSection key={year} title={year}>
          {months.map((month) => {
            const date = `${year}-${month}`;
            return (
              <AutocompleteItem
                key={date}
                textValue={formatDateToMonthYear(date)}
              >
                {formatDateToMonthYear(date)}
              </AutocompleteItem>
            );
          })}
        </AutocompleteSection>
      ))}
    </Autocomplete>
  );
}
