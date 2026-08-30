import { Button } from "@heroui/react";
import Typography from "@web/components/typography";
import { Mail } from "lucide-react";
import { cacheLife } from "next/cache";

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
 * The comp closes on an ink panel pairing the creative rules with the booking
 * form. There is no form endpoint, so the right-hand card carries the same copy
 * and hands off to email instead.
 */
export async function CtaSection() {
  "use cache";
  cacheLife("days");

  return (
    <section
      className="grid scroll-mt-24 items-start gap-10 rounded-4xl bg-ink-surface p-8 text-ink-surface-foreground lg:grid-cols-[1fr_360px] lg:p-14"
      id="contact"
    >
      <div className="flex flex-col gap-4">
        <span className="self-start rounded-full bg-accent-on-dark/20 px-4 py-2 font-bold text-accent-on-dark text-sm">
          What we will not run
        </span>
        <Typography.H2 className="font-bold text-[2rem] text-ink-surface-foreground tracking-[-0.02em] lg:text-[2.25rem]">
          Rules that protect the data
        </Typography.H2>
        <Typography.Text className="max-w-[33rem] text-[1.09375rem] text-ink-surface-foreground/70 leading-[1.6]">
          Advertising sits around the charts, never inside them. We decline
          anything that could be mistaken for a figure we publish.
        </Typography.Text>
        <div className="flex flex-col gap-3 pt-1">
          {rules.map(({ note, number }) => (
            <div
              className="flex items-start gap-3 border-ink-surface-foreground/10 border-t pt-3"
              key={number}
            >
              <span className="shrink-0 font-extrabold text-accent-on-dark text-sm tabular-nums">
                {number}
              </span>
              <span className="font-medium text-[0.96875rem] text-ink-surface-foreground/75 leading-[1.5]">
                {note}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl bg-ink-surface-foreground/[0.06] p-8">
        <Typography.H3 className="font-bold text-[1.3125rem] text-ink-surface-foreground">
          Book a placement
        </Typography.H3>
        <Typography.Text className="font-medium text-[0.9375rem] text-ink-surface-foreground/60 leading-[1.55]">
          Tell us the pages and the months you have in mind. We reply with
          availability, the rate and the creative spec.
        </Typography.Text>
        <a
          className="self-start no-underline"
          href={`mailto:${ADVERTISE_EMAIL}`}
        >
          <Button className="rounded-full" variant="primary">
            <Mail className="size-4" />
            Send an enquiry
          </Button>
        </a>
        <Typography.Caption className="font-medium text-ink-surface-foreground/40">
          Or write to {ADVERTISE_EMAIL}
        </Typography.Caption>
      </div>
    </section>
  );
}
