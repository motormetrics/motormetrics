"use client";

import { Button, Text } from "@heroui/react";

import {
  staggerContainerVariants,
  staggerItemVariants,
} from "@web/config/animations";
import { navLinks } from "@web/config/navigation";
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
          {/* Header */}
          <motion.div
            className="flex flex-col items-center gap-4 text-center"
            variants={staggerItemVariants}
          >
            <Text type="body-sm" weight="medium">
              Stay Updated
            </Text>
            <Text type="h2">Follow for the Latest Updates</Text>
            <Text type="body">
              Get notified when new COE results, car registration data, and
              market insights are published.
            </Text>
          </motion.div>

          {/* Social links */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-4"
            variants={staggerItemVariants}
          >
            {navLinks.socialMedia.map(({ title, url, icon: Icon }) => (
              <a
                key={title}
                href={url}
                rel="me noreferrer"
                target="_blank"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-5 font-medium text-foreground text-sm transition-all hover:border-accent hover:bg-accent/5"
              >
                <Icon className="size-4" />
                <span>{title}</span>
              </a>
            ))}
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            className="flex flex-col items-center gap-4 pt-4 sm:flex-row sm:gap-6"
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
            <Link href="/blog" className="no-underline">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 rounded-full px-8 text-foreground"
              >
                Read Market Insights
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
