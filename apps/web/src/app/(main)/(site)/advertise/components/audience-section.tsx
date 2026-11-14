import { Typography } from "@heroui/react";
import { SectionHead } from "@web/components/shared/overview";

/** The section head over the prose, kept to a readable measure. */
export function AudienceSection() {
  return (
    <section className="flex scroll-mt-24 flex-col gap-4" id="audience">
      <SectionHead eyebrow="Audience" title="Who reads this" />
      <div className="flex min-w-0 max-w-prose flex-col gap-4">
        <Typography.Paragraph className="text-muted-strong leading-relaxed md:text-lg">
          Readers arrive mid-decision: buyers comparing COE categories, owners
          weighing a renewal against deregistration, and the dealers, brokers
          and analysts who advise them. Traffic follows the release calendar —
          bidding days and the monthly registration release.
        </Typography.Paragraph>
        <Typography.Paragraph className="text-muted-strong leading-relaxed md:text-lg">
          Targeting is contextual: you choose the pages, not the people. There
          is no audience segment to buy, and creative is static — nothing that
          follows a reader from one page to the next.
        </Typography.Paragraph>
      </div>
    </section>
  );
}
