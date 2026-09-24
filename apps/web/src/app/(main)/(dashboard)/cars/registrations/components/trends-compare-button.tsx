"use client";

import { Button } from "@heroui/react";

import {
  compareParams,
  getDefaultMonthB,
  TrendsComparison,
} from "@web/app/(main)/(dashboard)/cars/registrations/components/trends-comparison";
import type { ComparisonData } from "@web/queries/cars/compare";
import type { Month } from "@web/types";
import { TrendingUp } from "lucide-react";
import { useQueryStates } from "nuqs";
import posthog from "posthog-js";
import { useState } from "react";

interface TrendsCompareButtonProps {
  currentMonth: string;
  months: Month[];
  comparisonData: ComparisonData | false;
}

export function TrendsCompareButton({
  currentMonth,
  months,
  comparisonData,
}: TrendsCompareButtonProps) {
  const [{ compareA, compareB }, setCompare] = useQueryStates(compareParams, {
    shallow: false,
  });
  // A shared link that already names both months opens straight onto them
  const [isOpen, setIsOpen] = useState(Boolean(compareA && compareB));

  const openComparison = () => {
    posthog.capture("trends_compare_opened");
    setIsOpen(true);
    if (!compareA && !compareB) {
      setCompare({
        compareA: currentMonth,
        compareB: getDefaultMonthB(currentMonth, months),
      });
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setCompare({ compareA: null, compareB: null });
    }
  };

  return (
    <>
      <div className="flex justify-end">
        <Button variant="primary" onPress={openComparison}>
          <TrendingUp className="size-4" />
          Compare Trends
        </Button>
      </div>

      <TrendsComparison
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
        currentMonth={currentMonth}
        months={months}
        comparisonData={comparisonData}
      />
    </>
  );
}
