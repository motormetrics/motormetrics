"use client";

import { Button } from "@heroui/button";
import Typography from "@web/components/typography";
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
            className="h-px w-48 bg-gradient-to-r from-transparent via-primary/50 to-transparent"
            variants={staggerItemVariants}
            aria-hidden="true"
          />

          {/* Header */}
          <motion.div
            className="flex flex-col items-center gap-4 text-center"
            variants={staggerItemVariants}
          >
            <Typography.Label className="text-primary uppercase tracking-widest">
              Ready to Explore?
            </Typography.Label>
            <Typography.H2>Dive Into the Data</Typography.H2>
            <Typography.TextLg className="max-w-xl text-default-600">
              Explore Singapore&apos;s car registration trends, COE bidding
              results, and market insights — all in one place.
            </Typography.TextLg>
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6"
            variants={staggerItemVariants}
          >
            <Button
              as={Link}
              href="/"
              color="primary"
              radius="full"
              size="lg"
              className="gap-2 px-8"
            >
              Explore the Dashboard
              <ArrowRight className="size-4" />
            </Button>
            <Button
              as={Link}
              href="/blog"
              variant="bordered"
              radius="full"
              size="lg"
              className="gap-2 px-8 text-foreground"
            >
              Read Our Blog
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
