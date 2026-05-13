"use client";

import { Card, Text } from "@heroui/react";

import { CategoryInfo } from "@web/app/(main)/(dashboard)/cars/registrations/components/category-info";
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
    <Card>
      <Card.Header className="flex flex-col items-start gap-2">
        <Text type="h4">COE Categories</Text>
        <Text
          type="body-sm"
          color="muted"
          className="inline-flex items-center gap-2"
        >
          <span>Filter based on Category</span>
          <span
            className="cursor-help"
            title="You can only filter Categories C & D"
          >
            <HelpCircleIcon className="size-4" aria-hidden="true" />
          </span>
        </Text>
      </Card.Header>
      <Card.Content>
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
      </Card.Content>
    </Card>
  );
}
