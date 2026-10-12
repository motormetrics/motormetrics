"use client";

import { Accordion } from "@heroui/react";
import { FAQS } from "@web/app/(main)/(site)/about/components/faq-data";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { Text } from "@web/components/shared/text";
import { ChevronDown } from "lucide-react";

/**
 * The comp opens the first question and leaves the rest closed, one at a time —
 * which is the Accordion default, so only `defaultExpandedKeys` is set here.
 */
export function FaqSection() {
  return (
    <section className="grid grid-cols-1 items-start gap-4 lg:grid-cols-4 lg:gap-14">
      <SectionHead eyebrow="FAQ" title="Common questions" />
      <div className="flex min-w-0 flex-col gap-2.5 lg:col-span-3">
        <Accordion
          className="border-border border-t"
          defaultExpandedKeys={[FAQS[0].question]}
        >
          {FAQS.map(({ answer, question }) => (
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
                <Accordion.Body>
                  <Text.Paragraph className="max-w-2xl" tone="strong">
                    {answer}
                  </Text.Paragraph>
                </Accordion.Body>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
        <SourceNote>Select a question to read the answer.</SourceNote>
      </div>
    </section>
  );
}
