"use client";

import { Button } from "@heroui/react";

import { TrendsComparison } from "@web/components/trends-comparison";
import type { ComparisonData } from "@web/queries/cars/compare";
import type { Month } from "@web/types";
import { TrendingUp } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="flex justify-end">
        <Button variant="primary" onPress={() => setIsOpen(true)}>
          <TrendingUp className="size-4" />
          Compare Trends
        </Button>
      </div>

      <TrendsComparison
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        currentMonth={currentMonth}
        months={months}
        comparisonData={comparisonData}
      />
    </>
  );
}
