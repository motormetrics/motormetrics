"use client";

import { Card, Chip } from "@heroui/react";

import { AnimatedNumber } from "@web/components/animated-number";
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

        return (
          <motion.div key={item.category} variants={staggerItemVariants}>
            <Card>
              <Card.Header>
                <div className="font-bold text-lg">{item.category}</div>
              </Card.Header>
              <Card.Content>
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="text-muted text-sm">Latest Premium</div>
                    <div className="font-bold text-2xl text-accent">
                      <AnimatedNumber
                        value={item.latestPremium}
                        format="currency"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="text-muted text-sm">PQP Rate</div>
                    <div className="font-bold text-2xl">
                      <AnimatedNumber value={item.pqpRate} format="currency" />
                    </div>
                  </div>
                </div>
              </Card.Content>
              <Card.Footer>
                <div className="flex items-center gap-2">
                  <Chip
                    variant="soft"
                    color={
                      isPQPLower
                        ? "success"
                        : isPQPHigher
                          ? "danger"
                          : "default"
                    }
                  >
                    {isPQPLower ? (
                      <ArrowDownRight className="size-4" />
                    ) : isPQPHigher ? (
                      <ArrowUpRight className="size-4" />
                    ) : null}
                    <AnimatedNumber value={Math.abs(item.differencePercent)} />%
                  </Chip>
                  <span className="text-muted text-sm">
                    PQP{" "}
                    {isPQPLower ? "below" : isPQPHigher ? "above" : "equals"}{" "}
                    premium
                  </span>
                </div>
              </Card.Footer>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
