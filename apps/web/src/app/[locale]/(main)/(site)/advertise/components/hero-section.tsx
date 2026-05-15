"use client";

import { Button, Chip, Link } from "@heroui/react";

import { SITE_TITLE } from "@web/config";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3 } from "lucide-react";

export function HeroSection() {
  const entranceTransition = (delay: number) => ({
    duration: 1,
    delay,
    ease: [0.16, 1, 0.3, 1] as const,
  });

  return (
    <section className="py-32 lg:py-40">
      <div className="container mx-auto">
        <div className="flex max-w-4xl flex-col items-center gap-8 text-center lg:items-start lg:text-left">
          {/* Decorative line */}
          <motion.div
            className="h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent lg:hidden"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "6rem", opacity: 1 }}
            transition={entranceTransition(0)}
            aria-hidden="true"
          />

          {/* Eyebrow chip */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={entranceTransition(0.1)}
          >
            <Chip
              color="accent"
              variant="primary"
              className="border-accent/20 bg-accent/5 font-medium text-foreground text-sm tracking-wide backdrop-blur-sm"
            >
              Advertising Opportunities
            </Chip>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            className="font-bold text-5xl text-foreground tracking-tighter lg:text-7xl"
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={entranceTransition(0.15)}
          >
            Put Your Product in Front of{" "}
            <span className="bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
              Car Enthusiasts
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="max-w-2xl text-lg text-muted leading-relaxed lg:text-xl lg:leading-relaxed"
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={entranceTransition(0.3)}
          >
            {SITE_TITLE} reaches an engaged, technical audience of car buyers,
            owners, and enthusiasts actively researching Singapore&apos;s
            automotive market.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            className="flex flex-col items-center gap-4 pt-4 sm:flex-row sm:gap-6"
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={entranceTransition(0.45)}
          >
            <Link href="#pricing" className="no-underline">
              <Button
                variant="primary"
                size="lg"
                className="gap-2 rounded-full px-8"
              >
                See Plans
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="#stats" className="no-underline">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 rounded-full px-8 text-foreground"
              >
                <BarChart3 className="size-4" />
                View Traffic
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
