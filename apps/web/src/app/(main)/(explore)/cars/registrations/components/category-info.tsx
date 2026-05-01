"use client";

import { cn } from "@heroui/react";

import Typography from "@web/components/typography";
import type { COECategory } from "@web/types";
import type { LucideIcon } from "lucide-react";

interface CategoryInfoProps {
  icon: LucideIcon;
  category: COECategory;
  description: string;
  canFilter?: boolean;
  isSelected: boolean;
  onToggle: (category: COECategory) => void;
}

export function CategoryInfo({
  icon: Icon,
  category,
  description,
  canFilter = true,
  isSelected,
  onToggle,
}: CategoryInfoProps) {
  const handleFilterCategories = () => {
    if (canFilter) {
      onToggle(category);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleFilterCategories();
    }
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: TODO: To be removed
    <div
      className={cn(
        "pointer-events-none flex cursor-not-allowed items-center gap-2 rounded-xl border-2 border-transparent p-2 hover:bg-gray-100",
        {
          "pointer-events-auto cursor-pointer": canFilter,
          "border-primary": isSelected,
        },
      )}
      onClick={handleFilterCategories}
      onKeyDown={handleKeyDown}
      tabIndex={canFilter ? 0 : -1}
      role="button"
      aria-pressed={isSelected}
    >
      <Icon className="size-6" />
      <div>
        <Typography.H4>{category}</Typography.H4>
        <Typography.TextSm>{description}</Typography.TextSm>
      </div>
    </div>
  );
}
