import { Typography } from "@heroui/react";

export function AudienceSection() {
  return (
    <section className="grid items-start gap-8 lg:grid-cols-[300px_1fr] lg:gap-14">
      <Typography.Heading level={2} className="text-4xl">
        Who reads this
      </Typography.Heading>
      <div className="flex flex-col gap-5">
        <Typography.Paragraph className="text-lg">
          Readers arrive mid-decision: buyers comparing COE categories, owners
          weighing a renewal against deregistration, and the dealers, brokers
          and analysts who advise them. Traffic follows the release calendar —
          bidding days and the monthly registration release.
        </Typography.Paragraph>
        <Typography.Paragraph className="text-lg">
          Targeting is contextual: you choose the pages, not the people. There
          is no audience segment to buy, and creative is static — nothing that
          follows a reader from one page to the next.
        </Typography.Paragraph>
      </div>
    </section>
  );
}
