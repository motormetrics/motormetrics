import { Typography } from "@heroui/react";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
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
 * Where the figures come from: the section head and its paragraph over the
 * three provenance facts as a ruled strip, three across from md.
 */
export function DataSection() {
  return (
    <section className="flex scroll-mt-24 flex-col gap-4" id="data-source">
      <SectionHead
        eyebrow="Where the data comes from"
        title="One source, checked at every release"
      />
      <Typography.Paragraph className="max-w-prose text-muted-strong leading-relaxed">
        Every figure on this site comes from Singapore&apos;s Land Transport
        Authority via{" "}
        <Link
          className="font-medium text-accent-strong"
          href="https://datamall.lta.gov.sg"
          rel="noreferrer nofollow"
          target="_blank"
        >
          DataMall
        </Link>
        . We do not estimate, model or fill gaps. When LTA revises a release, we
        revise with it.
      </Typography.Paragraph>
      <div className="grid grid-cols-1 border-border border-t md:grid-cols-3">
        {provenance.map(({ detail, heading, label }) => (
          <div
            className="flex flex-col gap-1 border-separator border-b py-3.5 pr-4"
            key={heading}
          >
            <span className="font-semibold text-muted text-xs">{label}</span>
            <span className="font-bold text-accent-strong text-xl">
              {heading}
            </span>
            <Typography.Paragraph
              className="text-muted-strong leading-normal"
              size="xs"
            >
              {detail}
            </Typography.Paragraph>
          </div>
        ))}
      </div>
      <SourceNote>Source: LTA via DataMall.</SourceNote>
    </section>
  );
}
