"use client";

import { Accordion, Typography } from "@heroui/react";
import { FAQ_SECTIONS } from "@web/app/(main)/(site)/learn/components/faq-data";
import { SectionHead, SourceNote } from "@web/components/shared/overview";

const questionCount = FAQ_SECTIONS.reduce(
  (total, section) => total + section.items.length,
  0,
);

/**
 * The questions, laid out like the glossary: a heading in a narrow left
 * column, and in the wide one each group under a small ruled label.
 *
 * Client-side for the accordion alone; the questions themselves come from
 * `faq-data`, which the page also reads to build the FAQPage schema.
 */
export function FAQSection() {
  return (
    <section
      className="grid scroll-mt-24 grid-cols-1 items-start gap-4 lg:grid-cols-4 lg:gap-14"
      id="faq"
    >
      <SectionHead
        caption="The questions that come up most often about bidding, rebates and where the figures on this site come from."
        className="lg:sticky lg:top-9"
        eyebrow="FAQ"
        title="Frequently asked"
      />

      <div className="flex min-w-0 flex-col gap-7 lg:col-span-3">
        {FAQ_SECTIONS.map((section) => (
          <div className="flex flex-col" key={section.title}>
            <span className="border-border border-b pb-2 font-semibold text-muted text-xs">
              {section.title}
            </span>
            <Accordion>
              {section.items.map(({ answer, question }) => (
                <Accordion.Item key={question}>
                  <Accordion.Heading>
                    <Accordion.Trigger>
                      {question}
                      <Accordion.Indicator />
                    </Accordion.Trigger>
                  </Accordion.Heading>
                  <Accordion.Panel>
                    <Accordion.Body>
                      <Typography.Paragraph className="max-w-2xl text-muted-strong">
                        {answer}
                      </Typography.Paragraph>
                    </Accordion.Body>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </div>
        ))}
        <SourceNote>
          {questionCount} questions. Select a question to read the answer.
        </SourceNote>
      </div>
    </section>
  );
}
