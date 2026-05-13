"use client";

import { Card, Text } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";

import {
  staggerContainerVariants,
  staggerItemVariants,
} from "@web/config/animations";
import { motion } from "framer-motion";
import { useState } from "react";

interface StatItemProps {
  value: number;
  suffix?: string;
  label: string;
}

const StatItem = ({ value, suffix = "", label }: StatItemProps) => {
  const [isInView, setIsInView] = useState(false);

  return (
    <motion.div
      variants={staggerItemVariants}
      onViewportEnter={() => setIsInView(true)}
      viewport={{ once: true }}
    >
      <Card className="group border-border bg-surface shadow-sm transition-all duration-500 hover:border-accent/30 hover:shadow-accent/5 hover:shadow-lg">
        <Card.Content className="flex flex-col gap-2">
          <div className="font-semibold text-4xl text-foreground tracking-tight lg:text-5xl">
            {isInView ? (
              <NumberValue
                locale="en-SG"
                maximumFractionDigits={0}
                value={value}
              >
                {suffix ? (
                  <NumberValue.Suffix>{suffix}</NumberValue.Suffix>
                ) : null}
              </NumberValue>
            ) : (
              <NumberValue locale="en-SG" maximumFractionDigits={0} value={0}>
                {suffix ? (
                  <NumberValue.Suffix>{suffix}</NumberValue.Suffix>
                ) : null}
              </NumberValue>
            )}
          </div>
          <div className="text-muted text-sm">{label}</div>
        </Card.Content>
        {/* Subtle accent line */}
        <div
          className="absolute right-6 bottom-0 left-6 h-0.5 scale-x-0 bg-gradient-to-r from-accent to-accent/60 transition-transform duration-300 group-hover:scale-x-100"
          aria-hidden="true"
        />
      </Card>
    </motion.div>
  );
};

export function StatsSection() {
  const stats = [
    { value: 10, suffix: "+", label: "Years of historical data" },
    { value: 50, suffix: "+", label: "Car makes tracked" },
    { value: 120, suffix: "+", label: "COE bidding rounds analysed" },
    { value: 10000, suffix: "+", label: "Monthly data points" },
  ];

  return (
    <section className="py-20 lg:py-28">
      <div className="flex flex-col gap-12">
        {/* Section header */}
        <div className="flex flex-col gap-4">
          <Text type="body-sm" weight="medium">
            By the Numbers
          </Text>
          <Text type="h2">Singapore car market data at a glance</Text>
        </div>

        {/* Stats grid - asymmetric */}
        <motion.div
          className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6"
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {stats.map((stat) => (
            <StatItem
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
