"use client";

import { Accordion } from "@heroui/react";
import { FAQ_SECTIONS } from "@web/app/(main)/(site)/learn/components/faq-data";
import { ReportEyebrow } from "@web/components/shared/report";
import Typography from "@web/components/typography";

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
        <Typography.H2 className="text-4xl">Frequently asked</Typography.H2>
        <Typography.Text className="text-muted leading-normal">
          The questions that come up most often about bidding, rebates and where
          the figures on this site come from.
        </Typography.Text>
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
                      <Typography.Text className="text-muted">
                        {answer}
                      </Typography.Text>
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
