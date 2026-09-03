"use client";

import { Accordion, Typography } from "@heroui/react";
import { ChevronDown } from "lucide-react";
import type { Faq } from "./faq-data";

/** The FAQ accordion; the questions arrive from the server with live figures. */
export function ChargingFaq({ faqs }: { faqs: Faq[] }) {
  return (
    <section
      className="grid scroll-mt-24 items-start gap-8 lg:grid-cols-[300px_1fr] lg:gap-14"
      id="faq"
    >
      <Typography.Heading level={2}>Common questions</Typography.Heading>
      <Accordion
        className="w-full"
        defaultExpandedKeys={[faqs[0]?.question ?? ""]}
        variant="surface"
      >
        {faqs.map(({ answer, question }) => (
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
