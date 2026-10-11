import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { Text } from "@web/components/shared/text";
import Link from "next/link";

const provenance = [
  {
    detail: "Official government release, no third-party aggregation",
    heading: "LTA DataMall",
    label: "The single upstream source",
  },
  {
    detail:
      "Registrations land within days of each release; COE results after every bidding exercise",
    heading: "Every release",
    label: "Checked and published",
  },
  {
    detail: "Gaps are shown as gaps, never filled in",
    heading: "No estimates",
    label: "Numbers only",
  },
];

/**
 * Where the figures come from: the section head in the left rail, and beside
 * it the paragraph over the three provenance facts on one bordered surface,
 * ruled apart rather than carded.
 */
export function DataSection() {
  return (
    <section className="grid grid-cols-1 items-start gap-4 lg:grid-cols-4 lg:gap-14">
      <SectionHead
        eyebrow="Where the data comes from"
        title="One source, checked at every release"
      />
      <div className="flex min-w-0 flex-col gap-4 lg:col-span-3">
        <Text.Paragraph
          className="max-w-2xl leading-relaxed md:text-lg"
          tone="strong"
        >
          Every figure on this site comes from Singapore&apos;s Land Transport
          Authority via{" "}
          <Link
            className="font-medium text-accent-strong"
            href="https://datamall.lta.gov.sg"
            rel="noreferrer"
            target="_blank"
          >
            DataMall
          </Link>
          . We do not estimate, model or fill gaps. When LTA revises a release,
          we revise with it.
        </Text.Paragraph>
        <div className="grid grid-cols-1 rounded-lg border border-separator bg-surface md:grid-cols-3">
          {provenance.map(({ detail, heading, label }) => (
            <div
              className="flex flex-col gap-1 border-separator p-4 max-md:not-first:border-t md:not-first:border-l md:p-5"
              key={heading}
            >
              <span className="font-bold text-accent-strong text-xl">
                {heading}
              </span>
              <span className="font-semibold text-sm">{label}</span>
              <Text.Paragraph
                className="leading-normal"
                size="sm"
                tone="strong"
              >
                {detail}
              </Text.Paragraph>
            </div>
          ))}
        </div>
        <SourceNote>Source: LTA via DataMall.</SourceNote>
      </div>
    </section>
  );
}
