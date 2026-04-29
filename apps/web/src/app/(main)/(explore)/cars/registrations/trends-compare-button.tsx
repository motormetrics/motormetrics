"use client";

import { Button } from "@heroui/button";
import { useDisclosure } from "@heroui/modal";
import { TrendsComparison } from "@web/components/trends-comparison";
import type { ComparisonData } from "@web/queries/cars/compare";
import type { Month } from "@web/types";
import { TrendingUp } from "lucide-react";

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
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <div className="flex justify-end">
        <Button
          color="primary"
          variant="shadow"
          startContent={<TrendingUp className="size-4" />}
          onPress={onOpen}
        >
          Compare Trends
        </Button>
      </div>

      <TrendsComparison
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        currentMonth={currentMonth}
        months={months}
        comparisonData={comparisonData}
      />
    </>
  );
}
