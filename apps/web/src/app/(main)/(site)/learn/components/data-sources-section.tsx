import { ReportEyebrow } from "@web/components/shared/report";
import Typography from "@web/components/typography";
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
 * Where the figures come from, in the same narrow-heading layout as the
 * glossary and the FAQ. Cards would overstate four short paragraphs, so the
 * facts are hairline-ruled rows.
 */
export function DataSourcesSection() {
  return (
    <section
      className="grid scroll-mt-24 grid-cols-1 gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-14"
      id="data-sources"
    >
      <div className="flex flex-col gap-3">
        <Typography.H2 className="text-4xl">
          Where the data comes from
        </Typography.H2>
        <a
          className="font-bold text-accent-strong text-base no-underline transition-colors hover:text-accent-deep"
          href="https://datamall.lta.gov.sg"
          rel="noreferrer"
          target="_blank"
        >
          LTA DataMall →
        </a>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {FACTS.map(({ detail, title }) => (
          <div
            className="flex flex-col gap-2 border-border border-t pt-4"
            key={title}
          >
            <ReportEyebrow>{title}</ReportEyebrow>
            <Typography.Text className="text-muted">{detail}</Typography.Text>
          </div>
        ))}
      </div>
    </section>
  );
}
