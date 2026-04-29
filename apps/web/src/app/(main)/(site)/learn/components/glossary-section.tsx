"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Link } from "@heroui/link";
import Typography from "@web/components/typography";
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
      className="relative -mx-6 scroll-mt-24 overflow-hidden bg-default-100 px-6 py-20 lg:py-28"
    >
      {/* Dot pattern background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--muted-foreground) 15%, transparent) 1px, transparent 0)",
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
          <Typography.Label className="text-primary uppercase tracking-widest">
            Terminology
          </Typography.Label>
          <Typography.H2 className="lg:text-4xl">
            Glossary of Key Terms
          </Typography.H2>
          <Typography.Text className="max-w-2xl text-default-600">
            Understanding Singapore&apos;s automotive terminology is essential
            for navigating the car market.
          </Typography.Text>
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
                <Typography.H3>{category.title}</Typography.H3>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {category.terms.map(({ term, definition }) => {
                  const slug = term.toLowerCase();
                  const hasGuide = guideSlugs.includes(slug);

                  const card = (
                    <Card className="h-full border-default-200/80 transition-all duration-500 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                      <CardHeader className="pb-0">
                        <div className="flex w-full items-center justify-between">
                          <Typography.H4>{term}</Typography.H4>
                          {hasGuide && (
                            <ArrowRight className="size-4 text-primary" />
                          )}
                        </div>
                      </CardHeader>
                      <CardBody>
                        <Typography.TextSm>{definition}</Typography.TextSm>
                      </CardBody>
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
