"use client";

import { Button, Typography } from "@heroui/react";
import { ReportEyebrow } from "@web/components/shared/report";

import {
  staggerContainerVariants,
  staggerItemVariants,
} from "@web/config/animations";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function CtaSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto">
        <motion.div
          className="flex flex-col items-center gap-10"
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Gradient line separator */}
          <motion.div
            className="h-px w-48 bg-gradient-to-r from-transparent via-accent/50 to-transparent"
            variants={staggerItemVariants}
            aria-hidden="true"
          />

          {/* Header */}
          <motion.div
            className="flex flex-col items-center gap-4 text-center"
            variants={staggerItemVariants}
          >
            <ReportEyebrow className="text-accent-strong">
              Ready to Explore?
            </ReportEyebrow>
            <Typography.Heading level={2}>
              Dive Into the Data
            </Typography.Heading>
            <Typography.Paragraph color="muted" className="max-w-xl">
              Explore Singapore&apos;s car registration trends, COE bidding
              results, and market insights — all in one place.
            </Typography.Paragraph>
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6"
            variants={staggerItemVariants}
          >
            <Link href="/" className="no-underline">
              <Button
                variant="primary"
                size="lg"
                className="gap-2 rounded-full px-8"
              >
                Explore the Dashboard
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            {/* TODO: Blog CTA hidden pending a decision on the blog's future.
                Commented out rather than deleted so it can be restored.
            <Link href="/blog" className="no-underline">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 rounded-full px-8 text-foreground"
              >
                Read Our Blog
              </Button>
            </Link>
            */}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
