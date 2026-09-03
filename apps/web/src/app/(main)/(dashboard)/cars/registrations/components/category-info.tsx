"use client";

import { cn, Typography } from "@heroui/react";

import type { COECategory } from "@web/types";
import type { LucideIcon } from "lucide-react";
import posthog from "posthog-js";

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
      posthog.capture("dashboard_filter_changed", {
        filter: "category",
        value: category,
      });
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
        "pointer-events-none flex cursor-not-allowed items-center gap-2 rounded-xl border-2 border-transparent p-2 hover:bg-default",
        {
          "pointer-events-auto cursor-pointer": canFilter,
          "border-accent": isSelected,
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
        <Typography.Heading level={4}>{category}</Typography.Heading>
        <Typography.Paragraph color="muted" size="sm">
          {description}
        </Typography.Paragraph>
      </div>
    </div>
  );
}
