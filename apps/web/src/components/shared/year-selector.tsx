"use client";

import { ComboBox, Input, Label, ListBox, toast } from "@heroui/react";

import { Calendar } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect, useRef } from "react";

interface YearSelectorProps {
  years: number[];
  latestYear: number;
  wasAdjusted?: boolean;
}

export function YearSelector({
  years,
  latestYear,
  wasAdjusted,
}: YearSelectorProps) {
  const [year, setYear] = useQueryState(
    "year",
    parseAsInteger.withDefault(latestYear).withOptions({ shallow: false }),
  );
  const hasShownToast = useRef(false);

  // Show toast if server adjusted the year
  useEffect(() => {
    if (wasAdjusted && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.info(`Latest data is ${latestYear}`);
    }
  }, [wasAdjusted, latestYear]);

  // Sort years in descending order (newest first)
  const sortedYears = [...years].sort((a, b) => b - a);

  return (
    <ComboBox
      selectedKey={year?.toString()}
      onSelectionChange={(key) => setYear(key ? Number(key) : null)}
    >
      <Label className="sr-only">Year</Label>
      <ComboBox.InputGroup>
        <Calendar className="ml-3 size-4 text-muted" />
        <Input placeholder="Select Year" />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox>
          {sortedYears.map((year) => (
            <ListBox.Item
              key={year}
              id={year.toString()}
              textValue={year.toString()}
            >
              {year}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
}
