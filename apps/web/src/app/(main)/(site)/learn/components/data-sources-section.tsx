"use client";

import { Card, Chip, Link } from "@heroui/react";

import Typography from "@web/components/typography";
import {
  fadeInUpVariants,
  staggerContainerVariants,
  staggerItemVariants,
} from "@web/config/animations";
import { motion } from "framer-motion";
import { AlertTriangle, Calendar, Database, RefreshCw } from "lucide-react";

const features = [
  {
    icon: Database,
    iconColor: "text-primary",
    containerBg: "bg-primary/10",
    title: "Primary Data Source",
    description: (
      <>
        All vehicle registration and COE data is sourced directly from
        Singapore&apos;s{" "}
        <strong>Land Transport Authority (LTA) DataMall</strong>, the official
        government open data platform for transport-related datasets.
      </>
    ),
    chip: (
      <Chip size="sm" color="accent" variant="soft">
        Official Government Data
      </Chip>
    ),
  },
  {
    icon: RefreshCw,
    iconColor: "text-success",
    containerBg: "bg-success/10",
    title: "Update Frequency",
    description: (
      <>
        Data is updated <strong>monthly</strong> following LTA&apos;s official
        release schedule. New data typically becomes available 2-3 weeks after
        the end of each month.
      </>
    ),
    extra: (
      <Typography.TextSm>
        COE bidding results are updated after each exercise (twice monthly).
      </Typography.TextSm>
    ),
  },
  {
    icon: Calendar,
    iconColor: "text-secondary",
    containerBg: "bg-secondary/10",
    title: "Data Coverage",
    description: (
      <>
        Our dataset covers Singapore vehicle registration and COE data from{" "}
        <strong>January 2015 to present</strong>, with monthly granularity.
      </>
    ),
    chips: (
      <div className="flex flex-wrap gap-2">
        <Chip size="sm" variant="soft">
          Car Registrations
        </Chip>
        <Chip size="sm" variant="soft">
          COE Bidding Results
        </Chip>
        <Chip size="sm" variant="soft">
          Vehicle Deregistrations
        </Chip>
        <Chip size="sm" variant="soft">
          Vehicle Population
        </Chip>
        <Chip size="sm" variant="soft">
          PQP Rates
        </Chip>
      </div>
    ),
  },
  {
    icon: AlertTriangle,
    iconColor: "text-warning",
    containerBg: "bg-warning/10",
    title: "Accuracy Disclaimer",
    description:
      "While we strive for accuracy, this platform is not affiliated with the Singapore government. Data is provided for informational purposes only. For official records and legal matters, please refer directly to LTA's official channels. Minor discrepancies may occur due to data processing and formatting.",
  },
];

export function DataSourcesSection() {
  return (
    <section id="data-sources" className="scroll-mt-24 py-20 lg:py-28">
      <div className="container mx-auto">
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
              <Typography.Label className="text-primary uppercase tracking-widest">
                Data Transparency
              </Typography.Label>
              <Typography.H2 className="lg:text-4xl">
                Where Our Data Comes From
              </Typography.H2>
              <Typography.Text className="text-default-600">
                All data is sourced from official government channels and
                updated regularly.
              </Typography.Text>

              {/* LTA Badge */}
              <Card className="border-default-200 p-3">
                <Card.Content className="flex flex-row items-center gap-4 p-4">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-default-200">
                    <Database className="size-6 text-default-600" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground text-sm">
                      Data Provider
                    </div>
                    <Link
                      href="https://datamall.lta.gov.sg"
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary text-sm underline"
                    >
                      LTA DataMall
                    </Link>
                  </div>
                </Card.Content>
              </Card>
            </motion.div>
          </div>

          {/* Right column - Feature cards */}
          <div className="lg:col-span-8">
            <motion.div
              className="grid gap-6 sm:grid-cols-2"
              variants={staggerContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {features.map((feature) => (
                <motion.div key={feature.title} variants={staggerItemVariants}>
                  <Card className="group h-full border-default-200/80 p-3 transition-all duration-500 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                    <Card.Content className="flex flex-col gap-4 p-6">
                      <div
                        className={`flex size-12 items-center justify-center rounded-xl ${feature.containerBg} transition-colors`}
                      >
                        <feature.icon
                          className={`size-6 ${feature.iconColor}`}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Typography.H4>{feature.title}</Typography.H4>
                        <Typography.TextSm>
                          {feature.description}
                        </Typography.TextSm>
                      </div>
                      {feature.extra}
                      {feature.chip}
                      {feature.chips}
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
