"use client";

import { Card } from "@heroui/react";

import { AnimatedNumber } from "@web/components/animated-number";
import Typography from "@web/components/typography";
import {
  staggerContainerVariants,
  staggerItemVariants,
} from "@web/config/animations";
import { motion } from "framer-motion";
import { useState } from "react";

interface TrafficStats {
  uniqueVisitors: number;
  pageViews: number;
  pagesPerVisitor: number;
}

interface StatItemProps {
  value: number;
  suffix?: string;
  label: string;
  description: string;
}

function StatItem({ value, suffix = "", label, description }: StatItemProps) {
  const [isInView, setIsInView] = useState(false);

  return (
    <motion.div
      variants={staggerItemVariants}
      onViewportEnter={() => setIsInView(true)}
      viewport={{ once: true }}
    >
      <Card className="group border-default-200 bg-card p-3 shadow-sm transition-all duration-500 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
        <Card.Content className="flex flex-col gap-2 p-6">
          <div className="font-semibold text-4xl text-foreground tracking-tight lg:text-5xl">
            {isInView ? (
              <>
                <AnimatedNumber value={value} />
                {suffix}
              </>
            ) : (
              <span className="tabular-nums">0{suffix}</span>
            )}
          </div>
          <Typography.Text className="font-medium text-foreground">
            {label}
          </Typography.Text>
          <Typography.TextSm className="text-default-500">
            {description}
          </Typography.TextSm>
        </Card.Content>
        {/* Subtle accent line */}
        <div
          className="absolute right-6 bottom-0 left-6 h-0.5 scale-x-0 bg-gradient-to-r from-primary to-primary/60 transition-transform duration-300 group-hover:scale-x-100"
          aria-hidden="true"
        />
      </Card>
    </motion.div>
  );
}

export function StatsSection({ stats }: { stats: TrafficStats }) {
  const statItems = [
    {
      value: stats.uniqueVisitors,
      label: "Unique Visitors",
      description: "Monthly unique visitors across the platform",
    },
    {
      value: stats.pageViews,
      label: "Page Views",
      description: "Total pages viewed in the last 30 days",
    },
    {
      value: stats.pagesPerVisitor,
      label: "Pages per Visitor",
      description: "Average engagement depth per session",
    },
  ];

  return (
    <section id="stats" className="scroll-mt-20 py-20 lg:py-28">
      <div className="flex flex-col gap-12">
        {/* Section header */}
        <div className="flex flex-col gap-4">
          <Typography.Label className="text-primary uppercase tracking-widest">
            Audience Metrics
          </Typography.Label>
          <Typography.H2 className="max-w-lg lg:text-4xl">
            Transparent, public analytics
          </Typography.H2>
          <Typography.TextLg className="max-w-2xl text-default-600">
            Real traffic data from the last 30 days. Our audience comprises car
            buyers, owners, and enthusiasts actively evaluating the Singapore
            market.
          </Typography.TextLg>
        </div>

        {/* Stats grid */}
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-6"
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {statItems.map((stat) => (
            <StatItem key={stat.label} {...stat} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
