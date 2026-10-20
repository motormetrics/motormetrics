import { Table, Typography } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import { PARF_FAQS } from "@web/app/(main)/(dashboard)/cars/parf/components/faq-data";
import { PARFCalculator } from "@web/app/(main)/(dashboard)/cars/parf/components/parf-calculator";
import {
  AGE_BRACKETS,
  NEW_CAP,
  OLD_CAP,
} from "@web/app/(main)/(dashboard)/cars/parf/components/parf-rates";
import {
  Hairline,
  OverviewPage,
  SectionHead,
  SectionLink,
  SourceNote,
} from "@web/components/shared/overview";
import { PageFaq } from "@web/components/shared/page-faq";
import { PageHead } from "@web/components/shared/page-head";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import {
  generateBreadcrumbSchema,
  generateFAQPageSchema,
} from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import type { Metadata } from "next";
import Link from "next/link";
import type { WebPage, WithContext } from "schema-dts";

const title = "PARF Rebate Calculator 2026: Rates by Car Age";
const description =
  "PARF rebate by car age: 75% to 50% of ARF for older COEs ($60,000 cap from Feb 2023), or 30% to 5% for COEs from Feb 2026, capped at $30,000.";
export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    ...baseOpenGraph,
    title,
    description,
    url: `${SITE_URL}/cars/parf`,
  },
  twitter: {
    ...baseTwitter,
    title,
    description,
  },
  alternates: {
    canonical: "/cars/parf",
  },
};

const structuredData: WithContext<WebPage> = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: title,
  description,
  url: `${SITE_URL}/cars/parf`,
  publisher: {
    "@type": "Organization",
    name: SITE_TITLE,
    url: SITE_URL,
  },
};

/** When a car qualifies, as LTA sets it out. */
const ELIGIBILITY: { label: string; note: string }[] = [
  {
    label: "How it was registered",
    note: "Brand new, or as a used import no more than 3 years old after 1 September 2007.",
  },
  {
    label: "Age",
    note: "No more than 10 years old when deregistered.",
  },
  {
    label: "History",
    note: "Never laid up, and its COE never renewed.",
  },
];

const formatRate = (rate: number) =>
  rate === 0 ? "No rebate" : `${(rate * 100).toFixed(0)}%`;

export default function PARFCalculatorPage() {
  return (
    <OverviewPage className="gap-10 max-md:gap-7">
      <StructuredData data={structuredData} />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Cars", path: "/cars" },
            { name: "PARF", path: "/cars/parf" },
          ]),
        }}
      />

      <PageHead
        eyebrow="Calculator"
        sub={
          <>
            Budget 2026 rebate schedule, effective from the{" "}
            <span className="font-semibold text-foreground">
              Second bidding, February 2026
            </span>{" "}
            · Source: LTA
          </>
        }
        title="PARF rebate calculator"
      />

      <PARFCalculator />

      <Hairline />

      <section className="flex min-w-0 flex-col gap-4">
        <SectionHead
          eyebrow="By COE bidding exercise"
          title="PARF rebate rates by car age"
        />
        <Table variant="secondary">
          <Table.ScrollContainer>
            <Table.Content aria-label="PARF rebate as a percentage of ARF, by car age and COE bidding exercise">
              <Table.Header>
                <Table.Column isRowHeader>Car age</Table.Column>
                <Table.Column>COE before 2nd Feb 2023</Table.Column>
                <Table.Column>2nd Feb 2023 to 1st Feb 2026</Table.Column>
                <Table.Column>From 2nd Feb 2026</Table.Column>
              </Table.Header>
              <Table.Body>
                {AGE_BRACKETS.map(({ key, label, newRate, oldRate }) => (
                  <Table.Row id={key} key={key}>
                    <Table.Cell>{label}</Table.Cell>
                    <Table.Cell>{formatRate(oldRate)}</Table.Cell>
                    <Table.Cell>{formatRate(oldRate)}</Table.Cell>
                    <Table.Cell>{formatRate(newRate)}</Table.Cell>
                  </Table.Row>
                ))}
                <Table.Row id="cap">
                  <Table.Cell>Rebate cap</Table.Cell>
                  <Table.Cell>No cap</Table.Cell>
                  <Table.Cell>{formatCurrency(OLD_CAP)}</Table.Cell>
                  <Table.Cell>{formatCurrency(NEW_CAP)}</Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
        <SourceNote>
          Percentage of ARF paid. Source: LTA, OneMotoring PARF schedule updated
          12 February 2026.
        </SourceNote>
      </section>

      <Hairline />

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <section className="flex min-w-0 flex-col gap-4 lg:col-span-7">
          <SectionHead eyebrow="Eligibility" title="Who gets a PARF rebate" />
          <dl className="flex flex-col border-border border-t">
            {ELIGIBILITY.map(({ label, note }) => (
              <div
                className="flex items-baseline gap-5 border-separator border-b py-3 max-md:flex-col max-md:gap-1"
                key={label}
              >
                <dt className="w-40 shrink-0 font-semibold text-sm">{label}</dt>
                <dd className="text-muted-strong text-sm">{note}</dd>
              </div>
            ))}
          </dl>
          <Typography.Paragraph className="text-muted-strong">
            Your deregistration value is the PARF rebate plus a COE rebate for
            the months left on the COE.{" "}
            <Link
              className="font-semibold text-accent-strong"
              href="/learn/check-parf-rebate"
            >
              How to check your PARF rebate on OneMotoring
            </Link>{" "}
            covers both, and the{" "}
            <Link
              className="font-semibold text-accent-strong"
              href="/learn/parf"
            >
              PARF guide
            </Link>{" "}
            explains when deregistering early pays off.
          </Typography.Paragraph>
        </section>

        <section className="flex min-w-0 flex-col gap-4 lg:col-span-5">
          <SectionHead
            eyebrow="Before you rely on it"
            title="What the figures assume"
          />
          <Typography.Paragraph className="text-muted-strong">
            Figures are for illustration only. The PARF rebate is subject to the
            vehicle&apos;s actual ARF paid and its age at deregistration. The
            new rates apply to vehicles registered with COEs obtained from the
            2nd bidding exercise in February 2026 onwards.
          </Typography.Paragraph>
          <div className="flex flex-col items-start gap-2">
            <SectionLink
              className="ml-0"
              href="https://www.lta.gov.sg/content/ltagov/en/newsroom/2026/2/news-releases/revision-parf-rebate-schedule-cap.html"
              rel="noopener noreferrer nofollow"
            >
              LTA announcement
            </SectionLink>
            <SectionLink className="ml-0" href="/coe/pqp">
              PQP renewal rates
            </SectionLink>
            <SectionLink className="ml-0" href="/coe/premiums">
              COE premiums
            </SectionLink>
          </div>
        </section>
      </div>

      <Hairline />

      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateFAQPageSchema([{ items: PARF_FAQS }]),
        }}
      />
      <PageFaq faqs={PARF_FAQS} />
    </OverviewPage>
  );
}
