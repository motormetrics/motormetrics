"use client";

import { Accordion } from "@heroui/react";
import { FAQS } from "@web/app/(main)/(site)/about/components/faq-data";
import Typography from "@web/components/typography";
import { ChevronDown } from "lucide-react";

/**
 * The comp opens the first question and leaves the rest closed, one at a time —
 * which is the Accordion default, so only `defaultExpandedKeys` is set here.
 */
export function FaqSection() {
  return (
    <section className="grid items-start gap-8 lg:grid-cols-[300px_1fr] lg:gap-14">
      <Typography.H2 className="text-4xl">Common questions</Typography.H2>
      <Accordion
        className="w-full"
        defaultExpandedKeys={[FAQS[0].question]}
        variant="surface"
      >
        {FAQS.map(({ answer, question }) => (
          <Accordion.Item id={question} key={question}>
            <Accordion.Heading>
              <Accordion.Trigger className="font-bold text-lg tracking-tight">
                {question}
                <Accordion.Indicator>
                  <ChevronDown />
                </Accordion.Indicator>
              </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel>
              <Accordion.Body className="max-w-prose text-base text-muted leading-relaxed">
                {answer}
              </Accordion.Body>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </section>
  );
}
