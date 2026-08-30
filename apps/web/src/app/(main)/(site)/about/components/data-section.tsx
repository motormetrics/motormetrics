import Typography from "@web/components/typography";
import Link from "next/link";

/**
 * The comp's ink panel — the one place on the page that inverts. It uses
 * `--ink-surface` rather than `--foreground` so it stays dark in dark mode
 * instead of flipping to cream.
 */
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

export function DataSection() {
  return (
    <section className="flex flex-col gap-8 rounded-4xl bg-ink-surface p-8 text-ink-surface-foreground lg:p-14">
      <div className="flex max-w-[40rem] flex-col gap-3.5">
        <span className="self-start rounded-full bg-accent-on-dark/20 px-4 py-2 font-bold text-accent-on-dark text-sm">
          Where the data comes from
        </span>
        <Typography.H2 className="font-bold text-[2rem] text-ink-surface-foreground tracking-[-0.02em] lg:text-[2.375rem]">
          One source, checked at every release
        </Typography.H2>
        <Typography.Text className="text-[1.125rem] text-ink-surface-foreground/70 leading-[1.6]">
          Every figure on this site comes from Singapore&apos;s Land Transport
          Authority via{" "}
          <Link
            className="font-medium text-accent-on-dark"
            href="https://datamall.lta.gov.sg"
            rel="noreferrer"
            target="_blank"
          >
            DataMall
          </Link>
          . We do not estimate, model or fill gaps. When LTA revises a release,
          we revise with it.
        </Typography.Text>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {provenance.map(({ detail, heading, label }) => (
          <div
            className="flex flex-col gap-2 rounded-2xl bg-ink-surface-foreground/[0.06] p-6"
            key={heading}
          >
            <span className="font-extrabold text-[1.75rem] text-accent-on-dark tracking-[-0.02em]">
              {heading}
            </span>
            <span className="font-semibold text-[0.9375rem] text-ink-surface-foreground/75">
              {label}
            </span>
            <span className="font-medium text-ink-surface-foreground/45 text-sm leading-[1.45]">
              {detail}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
