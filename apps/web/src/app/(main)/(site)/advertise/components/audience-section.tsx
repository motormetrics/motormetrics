import { Typography } from "@heroui/react";
import { SectionHead } from "@web/components/shared/overview";

/**
 * The section head in a narrow rail on the left and the prose beside it,
 * collapsing to one column below `lg`.
 */
export function AudienceSection() {
  return (
    <section className="grid grid-cols-1 items-start gap-4 lg:grid-cols-4 lg:gap-14">
      <SectionHead eyebrow="Audience" title="Who reads this" />
      <div className="flex min-w-0 max-w-2xl flex-col gap-4 lg:col-span-3">
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
