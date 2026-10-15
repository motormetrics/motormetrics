import { Typography } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { Mail } from "lucide-react";
import Link from "next/link";

const ADVERTISE_EMAIL = "advertise@motormetrics.app";

const rules = [
  {
    note: "No creative inside or overlapping a chart, table or metric card.",
    number: "01",
  },
  {
    note: "No units that resemble a figure, chip or trend badge we publish.",
    number: "02",
  },
  {
    note: "No autoplay video, audio, interstitials or expanding units.",
    number: "03",
  },
  {
    note: "Sponsored content is labelled as such and never framed as our analysis.",
    number: "04",
  },
];

/**
 * The comp closes on the creative rules as a numbered ruled list beside the
 * booking form. There is no form endpoint, so the right-hand card carries the
 * same copy and hands off to email instead.
 */
export function CtaSection() {
  return (
    <section
      className="grid scroll-mt-24 grid-cols-1 items-start gap-10 lg:grid-cols-3"
      id="contact"
    >
      <div className="flex min-w-0 flex-col gap-3.5 lg:col-span-2">
        <SectionHead
          eyebrow="What we will not run"
          title="Rules that protect the data"
        />
        <Typography.Paragraph className="max-w-xl text-muted-strong leading-relaxed">
          Advertising sits around the charts, never inside them. We decline
          anything that could be mistaken for a figure we publish.
        </Typography.Paragraph>
        <div className="flex flex-col border-border border-t">
          {rules.map(({ note, number }) => (
            <div
              className="flex items-start gap-3 border-separator border-b py-3"
              key={number}
            >
              <span className="w-8 shrink-0 font-semibold text-accent-strong tabular-nums">
                {number}
              </span>
              <Typography.Paragraph className="text-muted-strong leading-normal">
                {note}
              </Typography.Paragraph>
            </div>
          ))}
        </div>
        <SourceNote>House rules for every placement.</SourceNote>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-separator bg-surface px-4 py-5 md:p-5">
        <Typography.Heading className="text-xl" level={3} weight="bold">
          Book a placement
        </Typography.Heading>
        <Typography.Paragraph
          className="text-muted-strong leading-normal"
          size="sm"
        >
          Tell us the pages and the months you have in mind. We reply with
          availability, the rate and the creative spec.
        </Typography.Paragraph>
        <a
          className={buttonVariants({ fullWidth: true, variant: "primary" })}
          href={`mailto:${ADVERTISE_EMAIL}`}
        >
          <Mail aria-hidden className="size-4" />
          Send an enquiry
        </a>
        <SourceNote>
          Or write to {ADVERTISE_EMAIL}, or use the{" "}
          <Link className="text-accent-strong" href="/contact">
            contact page
          </Link>
          .
        </SourceNote>
      </div>
    </section>
  );
}
