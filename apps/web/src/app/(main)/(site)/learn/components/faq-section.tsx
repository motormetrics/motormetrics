"use client";

import { Accordion, Typography } from "@heroui/react";
import { FAQ_SECTIONS } from "@web/app/(main)/(site)/learn/components/faq-data";
import { SectionHead, SourceNote } from "@web/components/shared/overview";

const questionCount = FAQ_SECTIONS.reduce(
  (total, section) => total + section.items.length,
  0,
);

/**
 * The questions, laid out like the glossary: the head above the groups, which
 * sit two up once the column allows, each under a small ruled label. Every
 * question starts collapsed.
 *
 * Client-side for the accordion alone; the questions themselves come from
 * `faq-data`, which the page also reads to build the FAQPage schema.
 */
export function FAQSection() {
  return (
    <section className="@container flex scroll-mt-24 flex-col gap-5" id="faq">
      <SectionHead
        caption="The questions that come up most often about bidding, rebates and where the figures on this site come from."
        eyebrow="FAQ"
        title="Frequently asked"
      />

      <div className="grid @4xl:grid-cols-2 grid-cols-1 items-start gap-x-12 gap-y-7">
        {FAQ_SECTIONS.map((section) => (
          <div className="flex min-w-0 flex-col" key={section.title}>
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
      </div>
      <SourceNote>
        {questionCount} questions. Select a question to read the answer.
      </SourceNote>
    </section>
  );
}
