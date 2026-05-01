"use client";

import { Card } from "@heroui/react";

import Typography from "@web/components/typography";
import { SITE_TITLE } from "@web/config";
import { fadeInUpVariants } from "@web/config/animations";
import { motion } from "framer-motion";

export function MissionSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Left column - Pull quote */}
        <div className="lg:col-span-5">
          <motion.div
            className="sticky top-24"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <blockquote className="border-accent border-l-4 pl-6">
              <p className="font-medium text-2xl text-foreground leading-relaxed lg:text-3xl">
                Car buying in Singapore shouldn&apos;t feel like navigating a
                maze blindfolded.
              </p>
            </blockquote>
          </motion.div>
        </div>

        {/* Right column - Mission text */}
        <div className="flex flex-col gap-8 lg:col-span-7">
          <motion.div
            className="flex flex-col gap-6"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Typography.H2 className="lg:text-4xl">Our Mission</Typography.H2>
            <div className="flex flex-col gap-4">
              <Typography.TextLg className="text-muted">
                Singapore&apos;s car market is uniquely complex. Between COE
                premiums that swing wildly, registration quotas that change
                monthly, and a maze of vehicle categories, making informed
                decisions feels nearly impossible.
              </Typography.TextLg>
              <Typography.TextLg className="text-muted">
                We built {SITE_TITLE} to change that. By aggregating official
                data from the Land Transport Authority and presenting it through
                intuitive visualisations, we hope to make this data easier to
                find and explore, rather than scattered across government
                portals and industry reports.
              </Typography.TextLg>
              <Typography.TextLg className="text-muted">
                Whether you&apos;re a first-time buyer trying to time your
                purchase, a dealer analysing market trends, or simply curious
                about Singapore&apos;s automotive landscape—this site might
                help.
              </Typography.TextLg>
            </div>
          </motion.div>

          {/* Key points */}
          <motion.div
            className="grid gap-6 border-border border-t pt-8 sm:grid-cols-2"
            variants={fadeInUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-none bg-transparent shadow-none">
              <Card.Content className="flex flex-col gap-2 p-0">
                <Typography.H4>Data-Driven Decisions</Typography.H4>
                <Typography.TextSm>
                  Historical trends to help inform your decisions.
                </Typography.TextSm>
              </Card.Content>
            </Card>
            <Card className="border-none bg-transparent shadow-none">
              <Card.Content className="flex flex-col gap-2 p-0">
                <Typography.H4>Always Up-to-Date</Typography.H4>
                <Typography.TextSm>
                  Fresh data after every COE bidding round and monthly
                  registration release.
                </Typography.TextSm>
              </Card.Content>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
