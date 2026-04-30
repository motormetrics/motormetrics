"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Tooltip } from "@heroui/tooltip";
import { CategoryInfo } from "@web/app/(main)/(explore)/cars/registrations/components/category-info";
import Typography from "@web/components/typography";
import type { COECategory } from "@web/types";
import {
  Bike,
  Car,
  CircleDollarSign,
  HelpCircleIcon,
  Truck,
} from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { useCallback, useMemo } from "react";

const defaultCategories = ["Category A", "Category B", "Category E"];
const coreCategories = ["Category A", "Category B", "Category E"];

export function CoeCategories() {
  const [selectedCategories, setSelectedCategories] = useQueryState(
    "categories",
    parseAsArrayOf(parseAsString).withDefault(defaultCategories),
  );

  const activeCategories = useMemo(() => {
    return [...new Set([...coreCategories, ...selectedCategories])];
  }, [selectedCategories]);

  const toggleCategory = useCallback(
    (category: COECategory) => {
      setSelectedCategories((prev) => {
        if (prev.includes(category)) {
          if (coreCategories.includes(category)) {
            return prev;
          }
          return prev.filter((c) => c !== category);
        }
        return [...prev, category];
      });
    },
    [setSelectedCategories],
  );

  return (
    <Card className="p-3">
      <CardHeader className="flex flex-col items-start gap-2">
        <Typography.H4>COE Categories</Typography.H4>
        <Typography.TextSm className="inline-flex items-center gap-2">
          <span>Filter based on Category</span>
          <Tooltip content="You can only filter Categories C & D">
            <span className="cursor-help">
              <HelpCircleIcon className="size-4" aria-hidden="true" />
            </span>
          </Tooltip>
        </Typography.TextSm>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-1 gap-4">
          <CategoryInfo
            icon={Car}
            category="Category A"
            description="Cars up to 1600cc & 97kW"
            canFilter={false}
            isSelected={activeCategories.includes("Category A")}
            onToggle={toggleCategory}
          />
          <CategoryInfo
            icon={Car}
            category="Category B"
            description="Cars above 1600cc or 97kW"
            canFilter={false}
            isSelected={activeCategories.includes("Category B")}
            onToggle={toggleCategory}
          />
          <CategoryInfo
            icon={Truck}
            category="Category C"
            description="Goods vehicles & buses"
            isSelected={activeCategories.includes("Category C")}
            onToggle={toggleCategory}
          />
          <CategoryInfo
            icon={Bike}
            category="Category D"
            description="Motorcycles"
            isSelected={activeCategories.includes("Category D")}
            onToggle={toggleCategory}
          />
          <CategoryInfo
            icon={CircleDollarSign}
            category="Category E"
            description="Open Category"
            canFilter={false}
            isSelected={activeCategories.includes("Category E")}
            onToggle={toggleCategory}
          />
        </div>
      </CardBody>
    </Card>
  );
}
