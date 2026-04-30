"use client";

import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
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
            <Card className="p-3">
              <CardHeader>
                <div className="font-bold text-lg">{item.category}</div>
              </CardHeader>
              <CardBody>
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="text-default-500 text-sm">
                      Latest Premium
                    </div>
                    <div className="font-bold text-2xl text-primary">
                      <AnimatedNumber
                        value={item.latestPremium}
                        format="currency"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="text-default-500 text-sm">PQP Rate</div>
                    <div className="font-bold text-2xl">
                      <AnimatedNumber value={item.pqpRate} format="currency" />
                    </div>
                  </div>
                </div>
              </CardBody>
              <CardFooter>
                <div className="flex items-center gap-2">
                  <Chip
                    variant="flat"
                    color={
                      isPQPLower
                        ? "success"
                        : isPQPHigher
                          ? "danger"
                          : "default"
                    }
                    startContent={
                      isPQPLower ? (
                        <ArrowDownRight className="size-4" />
                      ) : isPQPHigher ? (
                        <ArrowUpRight className="size-4" />
                      ) : null
                    }
                  >
                    <AnimatedNumber value={Math.abs(item.differencePercent)} />%
                  </Chip>
                  <span className="text-muted-foreground text-sm">
                    PQP{" "}
                    {isPQPLower ? "below" : isPQPHigher ? "above" : "equals"}{" "}
                    premium
                  </span>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
