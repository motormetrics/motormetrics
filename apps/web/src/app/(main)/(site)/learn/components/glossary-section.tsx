"use client";

import { Card, Link, Text } from "@heroui/react";

import {
  fadeInUpVariants,
  staggerContainerVariants,
  staggerItemVariants,
} from "@web/config/animations";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { getAllGuideSlugs } from "../lib/guides";
import { GLOSSARY_CATEGORIES } from "./glossary-data";

const guideSlugs = getAllGuideSlugs();

export function GlossarySection() {
  return (
    <section
      id="glossary"
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
        {/* Section header */}
        <motion.div
          className="flex flex-col items-center gap-4 pb-12 text-center"
          variants={fadeInUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <Text type="body-sm" weight="medium">
            Terminology
          </Text>
          <Text type="h2">Glossary of Key Terms</Text>
          <Text type="body">
            Understanding Singapore&apos;s automotive terminology is essential
            for navigating the car market.
          </Text>
        </motion.div>

        {/* Categories */}
        <div className="flex flex-col gap-12">
          {GLOSSARY_CATEGORIES.map((category) => (
            <motion.div
              key={category.title}
              className="flex flex-col gap-6"
              variants={staggerContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              <div className="flex items-center gap-3">
                <category.icon className={`size-5 ${category.iconColor}`} />
                <Text type="h3">{category.title}</Text>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {category.terms.map(({ term, definition }) => {
                  const slug = term.toLowerCase();
                  const hasGuide = guideSlugs.includes(slug);

                  const card = (
                    <Card className="h-full border-border/80 transition-all duration-500 hover:border-accent/30 hover:shadow-accent/5 hover:shadow-lg">
                      <Card.Header className="pb-0">
                        <div className="flex w-full items-center justify-between">
                          <Text type="h4">{term}</Text>
                          {hasGuide && (
                            <ArrowRight className="size-4 text-accent" />
                          )}
                        </div>
                      </Card.Header>
                      <Card.Content>
                        <Text type="body-sm" color="muted">
                          {definition}
                        </Text>
                      </Card.Content>
                    </Card>
                  );

                  return (
                    <motion.div key={term} variants={staggerItemVariants}>
                      {hasGuide ? (
                        <Link href={`/learn/${slug}`} className="block h-full">
                          {card}
                        </Link>
                      ) : (
                        card
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
