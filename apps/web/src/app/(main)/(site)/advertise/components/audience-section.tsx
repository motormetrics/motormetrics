import Typography from "@web/components/typography";

export function AudienceSection() {
  return (
    <section className="grid items-start gap-8 lg:grid-cols-[300px_1fr] lg:gap-14">
      <Typography.H2 className="font-bold text-[2.125rem] tracking-[-0.02em]">
        Who reads this
      </Typography.H2>
      <div className="flex flex-col gap-5">
        <Typography.Text className="text-[1.1875rem] leading-[1.65]">
          Readers arrive mid-decision: buyers comparing COE categories, owners
          weighing a renewal against deregistration, and the dealers, brokers
          and analysts who advise them. Traffic follows the release calendar —
          bidding days and the monthly registration release.
        </Typography.Text>
        <Typography.Text className="text-[1.1875rem] leading-[1.65]">
          Targeting is contextual: you choose the pages, not the people. There
          is no audience segment to buy, and creative is static — nothing that
          follows a reader from one page to the next.
        </Typography.Text>
      </div>
    </section>
  );
}
