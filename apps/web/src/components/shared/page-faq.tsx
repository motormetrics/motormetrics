"use client";

import { Accordion, Typography } from "@heroui/react";
import { ChevronDown } from "lucide-react";

export interface Faq {
  answer: string;
  question: string;
}

interface PageFaqProps {
  faqs: Faq[];
  /** Opens the first question on load; every other page keeps them all closed. */
  expandFirst?: boolean;
}

/**
 * The common questions at the foot of a page. Client-side only for the expand
 * and collapse; the questions come from each page's `faq-data`, which the page
 * also reads to build the FAQPage schema so the two always match.
 */
export function PageFaq({ faqs, expandFirst = false }: PageFaqProps) {
  const defaultExpandedKeys = expandFirst && faqs[0] ? [faqs[0].question] : [];

  return (
    <section
      className="grid scroll-mt-24 grid-cols-1 items-start gap-8 lg:grid-cols-4 lg:gap-14"
      id="faq"
    >
      <Typography.Heading level={2}>Common questions</Typography.Heading>
      <Accordion
        className="lg:col-span-3"
        defaultExpandedKeys={defaultExpandedKeys}
        variant="surface"
      >
        {faqs.map(({ answer, question }) => (
          <Accordion.Item id={question} key={question}>
            <Accordion.Heading>
              <Accordion.Trigger>
                {question}
                <Accordion.Indicator>
                  <ChevronDown />
                </Accordion.Indicator>
              </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel>
              <Accordion.Body className="max-w-prose">{answer}</Accordion.Body>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </section>
  );
}
