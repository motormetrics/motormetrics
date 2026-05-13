"use client";

import { Card, Text } from "@heroui/react";

import {
  fadeInUpVariants,
  staggerContainerVariants,
  staggerItemVariants,
} from "@web/config/animations";
import { motion } from "framer-motion";

interface GuideSection {
  title: string;
  content: string[];
}

const GUIDES: GuideSection[] = [
  {
    title: "How COE Bidding Works",
    content: [
      "The Certificate of Entitlement (COE) bidding system uses a uniform-price auction format. All successful bidders pay the same price \u2014 the lowest successful bid (known as the Quota Premium).",
      "Bidding exercises are held twice a month, typically on the first and third Wednesday, and run for three days. You can submit, modify, or withdraw your bid during this period.",
      "To bid, you must place a deposit through an authorised dealer or via the OneMotoring portal. The deposit is typically $10,000 for Category A/B/E, or $200 for Category D (motorcycles).",
      "If your bid is successful, you have six months to register a vehicle using the COE. Unused COEs are forfeited, and the deposit is not refunded.",
    ],
  },
  {
    title: "Understanding PARF Rebates",
    content: [
      "When you deregister a vehicle before its 10-year COE expires, you receive a PARF rebate \u2014 a percentage of the Additional Registration Fee (ARF) you paid at registration.",
      "The rebate percentage decreases as your vehicle ages. Under the new Budget 2026 rates: 30% for 5 years and younger, 25% for >5-6 years, 20% for >6-7 years, 15% for >7-8 years, 10% for >8-9 years, and 5% for >9-10 years.",
      "If your vehicle is over 10 years old, you receive no PARF rebate. The maximum PARF rebate is capped at $30,000 (reduced from $60,000 under Budget 2026).",
      "The PARF rebate is separate from the COE rebate, which refunds a pro-rated portion of the COE premium based on remaining validity.",
    ],
  },
  {
    title: "Reading the Charts and Data",
    content: [
      "Registration charts show the number of new vehicles registered each month, broken down by make, fuel type, or vehicle type. A rising trend suggests increased demand, while dips may indicate higher COE prices or seasonal effects.",
      "COE premium charts track the winning bid price over time for each category. Comparing Category A (smaller cars) and Category B (larger cars) can reveal shifting buyer preferences.",
      "Deregistration data shows vehicles leaving the road \u2014 whether scrapped, exported, or reaching the end of their COE. High deregistration months typically lead to more COE quotas in future exercises.",
      "Use the month selector on each page to navigate through historical data. You can compare month-on-month and year-on-year trends to identify patterns in Singapore\u2019s car market.",
    ],
  },
];

export function GuidesSection() {
  return (
    <section
      id="guides"
      className="relative -mx-6 scroll-mt-24 overflow-hidden bg-default px-6 py-20 lg:py-28"
    >
      {/* Dot pattern background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--muted) 15%, transparent) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden="true"
      />

      <div className="container relative mx-auto">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left column - Sticky header */}
          <div className="lg:col-span-4">
            <motion.div
              className="sticky top-24 flex flex-col gap-6"
              variants={fadeInUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <Text type="body-sm" weight="medium">
                Learn
              </Text>
              <Text type="h2">Guides &amp; Tutorials</Text>
              <Text type="body">
                Step-by-step guides to help you understand Singapore&apos;s
                vehicle market and make the most of our platform.
              </Text>
            </motion.div>
          </div>

          {/* Right column - Guide cards */}
          <div className="lg:col-span-8">
            <motion.div
              className="flex flex-col gap-6"
              variants={staggerContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              {GUIDES.map((guide, index) => (
                <motion.div key={guide.title} variants={staggerItemVariants}>
                  <Card className="group border-border/80 transition-all duration-500 hover:border-accent/30 hover:shadow-accent/5 hover:shadow-lg">
                    <Card.Content className="flex flex-row gap-6">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent font-semibold text-accent-foreground text-sm">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className="flex flex-col gap-4">
                        <Text type="h3">{guide.title}</Text>
                        {guide.content.map((paragraph) => (
                          <Text type="body" key={paragraph.slice(0, 40)}>
                            {paragraph}
                          </Text>
                        ))}
                      </div>
                    </Card.Content>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
