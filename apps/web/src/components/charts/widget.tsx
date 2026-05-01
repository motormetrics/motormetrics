"use client";

import { Card, cn } from "@heroui/react";

import { CHART_HEIGHTS, type ChartHeight } from "@motormetrics/theme/charts";
import Typography from "@web/components/typography";
import { fadeInUpVariants } from "@web/config/animations";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type ChartWidgetVariant = "default" | "hero" | "metric";

interface ChartWidgetProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
  /** Card styling variant */
  variant?: ChartWidgetVariant;
  /** Chart height preset (only affects empty state) */
  height?: ChartHeight;
  /** Additional className for the card */
  className?: string;
}

export function ChartWidget({
  title,
  subtitle,
  children,
  isEmpty = false,
  emptyMessage = "No data available",
  variant = "default",
  height = "standard",
  className,
}: ChartWidgetProps) {
  const prefersReducedMotion = useReducedMotion();

  const cardContent = (
    <Card
      className={cn(
        variant === "hero" && "shadow-md",
        variant === "metric" && "transition-shadow hover:shadow-sm",
        className,
      )}
    >
      <Card.Header>
        <div className="flex flex-col gap-1">
          <Typography.H4>{title}</Typography.H4>
          {subtitle && (
            <Typography.TextSm className="text-muted">
              {subtitle}
            </Typography.TextSm>
          )}
        </div>
      </Card.Header>
      <Card.Content>
        {isEmpty ? (
          <div
            className={cn(
              "flex items-center justify-center rounded-xl bg-default",
              CHART_HEIGHTS[height],
            )}
          >
            <Typography.TextSm className="text-muted">
              {emptyMessage}
            </Typography.TextSm>
          </div>
        ) : (
          children
        )}
      </Card.Content>
    </Card>
  );

  // Respect reduced motion preference
  if (prefersReducedMotion) {
    return cardContent;
  }

  return (
    <motion.div variants={fadeInUpVariants} initial="hidden" animate="visible">
      {cardContent}
    </motion.div>
  );
}
