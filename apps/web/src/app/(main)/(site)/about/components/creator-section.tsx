"use client";

import { Link } from "@heroui/react";

import Typography from "@web/components/typography";
import { SITE_TITLE } from "@web/config";
import {
  staggerContainerVariants,
  staggerItemVariants,
} from "@web/config/animations";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export function CreatorSection() {
  return (
    <section className="relative -mx-6 overflow-hidden px-6 py-20 lg:py-28">
      {/* Subtle decorative elements */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute top-20 left-10 h-px w-32 bg-gradient-to-r from-transparent via-muted to-transparent opacity-50" />
        <div className="absolute top-40 right-20 h-px w-24 bg-gradient-to-r from-transparent via-muted to-transparent opacity-40" />
        <div className="absolute bottom-32 left-1/4 h-px w-40 bg-gradient-to-r from-transparent via-muted to-transparent opacity-30" />
      </div>

      <div className="container relative mx-auto">
        <motion.div
          className="flex flex-col items-center"
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div
            className="mx-auto flex max-w-2xl flex-col items-center gap-8 text-center"
            variants={staggerItemVariants}
          >
            <Typography.Label className="text-accent uppercase tracking-widest">
              Behind the Data
            </Typography.Label>

            <div className="flex flex-col gap-6">
              <Typography.H2 className="text-foreground">
                Built with{" "}
                <Heart className="inline size-6 fill-red-500 text-red-500" /> in
                Singapore
              </Typography.H2>
              <Typography.TextLg className="text-muted">
                {SITE_TITLE} is an independent project created by{" "}
                <Link
                  href="https://ruchern.dev"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-accent transition-colors hover:text-accent/80"
                >
                  Ru Chern
                </Link>
                , a software engineer who wanted to make this data easier to
                explore.
              </Typography.TextLg>
            </div>

            <Typography.TextSm className="max-w-lg text-muted">
              This platform is maintained in spare time alongside a full-time
              job. If you find it useful, consider sharing it with others who
              might benefit.
            </Typography.TextSm>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
