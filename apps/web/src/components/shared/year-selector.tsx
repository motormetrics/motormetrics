"use client";

import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { addToast } from "@heroui/toast";
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
      addToast({
        title: `Latest data is ${latestYear}`,
        variant: "bordered",
      });
    }
  }, [wasAdjusted, latestYear]);

  // Sort years in descending order (newest first)
  const sortedYears = [...years].sort((a, b) => b - a);

  return (
    <Autocomplete
      selectedKey={year?.toString()}
      onSelectionChange={(key) => setYear(key ? Number(key) : null)}
      aria-label="Year"
      placeholder="Select Year"
      startContent={<Calendar className="size-4" />}
      variant="underlined"
    >
      {sortedYears.map((year) => (
        <AutocompleteItem key={year.toString()} textValue={year.toString()}>
          {year}
        </AutocompleteItem>
      ))}
    </Autocomplete>
  );
}
