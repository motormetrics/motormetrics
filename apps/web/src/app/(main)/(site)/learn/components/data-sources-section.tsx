import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { Text } from "@web/components/shared/text";
import { SITE_TITLE } from "@web/config";
import type { ReactNode } from "react";

const FACTS: { detail: ReactNode; title: string }[] = [
  {
    detail: (
      <>
        Every registration, deregistration and COE figure on this site comes
        from <strong className="font-bold">LTA DataMall</strong>, the Land
        Transport Authority&apos;s open data platform. Nothing is modelled or
        estimated.
      </>
    ),
    title: "Primary source",
  },
  {
    detail: (
      <>
        Registration data is published{" "}
        <strong className="font-bold">monthly</strong>, and usually lands two to
        three weeks after the month it covers. COE results follow each bidding
        exercise, twice a month.
      </>
    ),
    title: "Update frequency",
  },
  {
    detail: (
      <>
        Car registrations, COE bidding results, deregistrations, vehicle
        population and PQP rates, from{" "}
        <strong className="font-bold">January 2015</strong> to the present, at
        monthly granularity.
      </>
    ),
    title: "Coverage",
  },
  {
    detail:
      "This site is not affiliated with the Singapore government and is published for information only. For official records, refer to LTA directly. Minor discrepancies can arise from processing and formatting, and LTA revises past releases from time to time.",
    title: "Accuracy",
  },
];

/**
 * Where the figures come from: the four facts as a two-up ruled grid under a
 * section head, with the link out to DataMall hard right.
 */
export function DataSourcesSection() {
  return (
    <section className="flex scroll-mt-24 flex-col gap-4" id="data-sources">
      <SectionHead
        eyebrow="Provenance"
        title="Where the data comes from"
        trailing={
          <a
            className="whitespace-nowrap font-semibold text-accent-strong text-sm no-underline transition-colors hover:text-accent-deep"
            href="https://datamall.lta.gov.sg"
            rel="noreferrer"
            target="_blank"
          >
            LTA DataMall →
          </a>
        }
      />

      <div className="grid grid-cols-1 border-border border-t md:grid-cols-2">
        {FACTS.map(({ detail, title }) => (
          <div
            className="flex flex-col gap-1.5 border-separator border-b py-3.5 md:py-4 md:even:border-l md:even:pl-6 md:odd:pr-6"
            key={title}
          >
            <span className="font-semibold text-muted text-xs">{title}</span>
            <Text.Paragraph className="leading-relaxed" size="sm" tone="strong">
              {detail}
            </Text.Paragraph>
          </div>
        ))}
      </div>

      <SourceNote>
        Source: LTA via DataMall. {SITE_TITLE} is not affiliated with the
        Singapore government.
      </SourceNote>
    </section>
  );
}
