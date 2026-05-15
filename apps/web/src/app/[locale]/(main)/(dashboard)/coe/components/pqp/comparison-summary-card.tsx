"use client";

import { KPI, NumberValue, TrendChip } from "@heroui-pro/react";

import {
  staggerContainerVariants,
  staggerItemVariants,
} from "@web/config/animations";
import type { Pqp } from "@web/types/coe";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface ComparisonSummaryCardProps {
  data: Pqp.Comparison[];
}

export function ComparisonSummaryCard({ data }: ComparisonSummaryCardProps) {
  return (
    <motion.div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
    >
      {data.map((item) => {
        const isPQPLower = item.differencePercent > 0;
        const isPQPHigher = item.differencePercent < 0;
        const trend = isPQPLower ? "up" : isPQPHigher ? "down" : "neutral";

        return (
          <motion.div key={item.category} variants={staggerItemVariants}>
            <KPI>
              <KPI.Header>
                <div className="font-bold text-lg">{item.category}</div>
              </KPI.Header>
              <KPI.Content>
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="text-muted text-sm">Latest Premium</div>
                    <KPI.Value
                      className="text-2xl text-accent"
                      currency="SGD"
                      locale="en-SG"
                      maximumFractionDigits={0}
                      style="currency"
                      value={item.latestPremium}
                    />
                  </div>
                  <div>
                    <div className="text-muted text-sm">PQP Rate</div>
                    <KPI.Value
                      className="text-2xl"
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
                <div className="flex items-center gap-2">
                  <TrendChip trend={trend} variant="primary">
                    {isPQPLower ? (
                      <TrendChip.Indicator>
                        <ArrowDownRight />
                      </TrendChip.Indicator>
                    ) : isPQPHigher ? (
                      <TrendChip.Indicator>
                        <ArrowUpRight />
                      </TrendChip.Indicator>
                    ) : null}
                    <NumberValue
                      maximumFractionDigits={1}
                      style="percent"
                      value={Math.abs(item.differencePercent) / 100}
                    />
                  </TrendChip>
                  <span className="text-muted text-sm">
                    PQP{" "}
                    {isPQPLower ? "below" : isPQPHigher ? "above" : "equals"}{" "}
                    premium
                  </span>
                </div>
              </KPI.Footer>
            </KPI>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
