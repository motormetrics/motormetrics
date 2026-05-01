"use client";

import { Card, Link } from "@heroui/react";

import Typography from "@web/components/typography";
import {
  fadeInUpVariants,
  staggerContainerVariants,
  staggerItemVariants,
} from "@web/config/animations";
import { motion } from "framer-motion";
import { Database, RefreshCw, Shield } from "lucide-react";

const features = [
  {
    icon: Database,
    title: "Official Government Source",
    description:
      "All data is sourced directly from the Land Transport Authority (LTA) DataMall, Singapore's official open data portal for transport statistics.",
  },
  {
    icon: RefreshCw,
    title: "Monthly Updates",
    description:
      "Registration data is updated within days of each LTA release. COE results are refreshed after every bidding round—twice monthly.",
  },
  {
    icon: Shield,
    title: "Data Integrity",
    description:
      "Data is validated to match the source. Historical records are preserved without modification.",
  },
];

export function DataSection() {
  return (
    <section className="relative -mx-6 overflow-hidden bg-default px-6 py-20 lg:py-28">
      {/* Subtle background pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--muted) 15%, transparent) 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
        aria-hidden="true"
      />

      <div className="container relative mx-auto">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left column - Header */}
          <div className="lg:col-span-4">
            <motion.div
              className="sticky top-24 flex flex-col gap-6"
              variants={fadeInUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <Typography.Label className="text-accent uppercase tracking-widest">
                Data Transparency
              </Typography.Label>
              <Typography.H2 className="lg:text-4xl">
                Where the data comes from
              </Typography.H2>
              <Typography.Text className="text-muted">
                Here&apos;s where the data comes from and how it&apos;s
                processed.
              </Typography.Text>

              {/* LTA Badge */}
              <Card className="border-border">
                <Card.Content className="flex flex-row items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-default">
                    <Database className="h-6 w-6 text-muted" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground text-sm">
                      Data Provider
                    </div>
                    <Link
                      href="https://datamall.lta.gov.sg"
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent text-sm underline"
                    >
                      LTA DataMall
                    </Link>
                  </div>
                </Card.Content>
              </Card>
            </motion.div>
          </div>

          {/* Right column - Features grid */}
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
                  <Card className="group h-full border-border/80 transition-all duration-500 hover:border-accent/30 hover:shadow-accent/5 hover:shadow-lg">
                    <Card.Content className="flex flex-col gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-default transition-colors group-hover:bg-accent/10">
                        <feature.icon className="h-6 w-6 text-muted transition-colors group-hover:text-accent" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Typography.H4>{feature.title}</Typography.H4>
                        <Typography.TextSm>
                          {feature.description}
                        </Typography.TextSm>
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
