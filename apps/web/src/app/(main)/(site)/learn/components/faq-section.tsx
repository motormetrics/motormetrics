"use client";

import { Accordion, Typography } from "@heroui/react";
import { FAQ_SECTIONS } from "@web/app/(main)/(site)/learn/components/faq-data";
import { ReportEyebrow } from "@web/components/shared/report";

/**
 * The questions, laid out the way the comp lays out the glossary: a heading in
 * a narrow left column, the content in the wide one, hairlines rather than
 * cards.
 *
 * Client-side for the accordion alone; the questions themselves come from
 * `faq-data`, which the page also reads to build the FAQPage schema.
 */
export function FAQSection() {
  return (
    <section
      className="grid scroll-mt-24 grid-cols-1 gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-14"
      id="faq"
    >
      <div className="flex flex-col gap-3 lg:sticky lg:top-9 lg:self-start">
        <Typography.Heading level={2} className="text-4xl">
          Frequently asked
        </Typography.Heading>
        <Typography.Paragraph className="text-muted leading-normal">
          The questions that come up most often about bidding, rebates and where
          the figures on this site come from.
        </Typography.Paragraph>
      </div>

      <div className="flex flex-col gap-9">
        {FAQ_SECTIONS.map((section) => (
          <div className="flex flex-col gap-4" key={section.title}>
            <ReportEyebrow>{section.title}</ReportEyebrow>
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
                      <Typography.Paragraph className="text-muted">
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
    </section>
  );
}
