"use client";

import { KPI, NumberValue, TrendChip } from "@heroui-pro/react";

import {
  staggerContainerVariants,
  staggerItemVariants,
} from "@web/config/animations";
import type { Pqp } from "@web/types/coe";
import { motion } from "framer-motion";

interface ComparisonSummaryCardProps {
  data: Pqp.Comparison[];
}

const getDecision = (difference: number) => {
  if (difference > 0) {
    return {
      label: "Renewal cheaper",
      tone: "text-success",
      trend: "up" as const,
    };
  }

  if (difference < 0) {
    return {
      label: "Bidding cheaper",
      tone: "text-danger",
      trend: "down" as const,
    };
  }

  return {
    label: "No clear gap",
    tone: "text-muted",
    trend: "neutral" as const,
  };
};

export function ComparisonSummaryCard({ data }: ComparisonSummaryCardProps) {
  const primaryData = data.filter(
    (item) => item.category === "Category A" || item.category === "Category B",
  );

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {primaryData.map((item) => {
          const isPQPLower = item.difference > 0;
          const isPQPHigher = item.difference < 0;
          const decision = getDecision(item.difference);

          return (
            <motion.div key={item.category} variants={staggerItemVariants}>
              <KPI>
                <KPI.Header>
                  <KPI.Title>{item.category}</KPI.Title>
                  <KPI.Trend className="ml-auto" trend={decision.trend}>
                    {decision.label}
                  </KPI.Trend>
                </KPI.Header>
                <KPI.Content>
                  <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-surface-secondary p-4">
                      <div className="text-muted text-sm">Latest Premium</div>
                      <KPI.Value
                        className="text-2xl text-accent tabular-nums"
                        currency="SGD"
                        locale="en-SG"
                        maximumFractionDigits={0}
                        style="currency"
                        value={item.latestPremium}
                      />
                    </div>
                    <div className="rounded-2xl bg-surface-secondary p-4">
                      <div className="text-muted text-sm">PQP Rate</div>
                      <KPI.Value
                        className="text-2xl tabular-nums"
                        currency="SGD"
                        locale="en-SG"
                        maximumFractionDigits={0}
                        style="currency"
                        value={item.pqpRate}
                      />
                    </div>
                  </div>
                </KPI.Content>
                <KPI.Footer>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-muted text-sm">Gap</span>
                      <NumberValue
                        className={`font-medium text-sm tabular-nums ${decision.tone}`}
                        currency="SGD"
                        locale="en-SG"
                        maximumFractionDigits={0}
                        style="currency"
                        value={Math.abs(item.difference)}
                      />
                    </div>
                    <TrendChip trend={decision.trend} variant="primary">
                      <NumberValue
                        maximumFractionDigits={1}
                        style="percent"
                        value={Math.abs(item.differencePercent) / 100}
                      />
                    </TrendChip>
                  </div>
                  <span className="text-muted text-xs">
                    PQP{" "}
                    {isPQPLower ? "below" : isPQPHigher ? "above" : "equals"}{" "}
                    latest premium.
                  </span>
                </KPI.Footer>
              </KPI>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
