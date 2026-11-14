import { Typography } from "@heroui/react";
import { SectionHead } from "@web/components/shared/overview";
import { SITE_TITLE } from "@web/config";
import Link from "next/link";

/** The section head over the prose, kept to a readable measure. */
export function MissionSection() {
  return (
    <section className="flex scroll-mt-24 flex-col gap-4" id="what-we-do">
      <SectionHead eyebrow="The project" title="What we do" />
      <div className="flex min-w-0 max-w-prose flex-col gap-4">
        <Typography.Paragraph className="text-muted-strong leading-relaxed md:text-lg">
          Each time LTA publishes, we pull the latest figures from DataMall,
          check them against the previous release, and turn them into charts you
          can read in a few seconds. Registrations, deregistrations, COE
          premiums, PQP rates, fuel type mix and the vehicle population all sit
          on one platform.
        </Typography.Paragraph>
        <Typography.Paragraph className="text-muted-strong leading-relaxed md:text-lg">
          The raw data is public, but it arrives as spreadsheets with column
          headers like{" "}
          <code className="font-mono text-foreground text-sm">
            MonthOfRegistration
          </code>{" "}
          and no context. We do the joining, the naming and the arithmetic, then
          show the trend beside the number so you can tell whether this
          month&apos;s premium is high or low.
        </Typography.Paragraph>
        <Typography.Paragraph className="text-muted-strong leading-relaxed md:text-lg">
          {SITE_TITLE} is free and open. There is no account to create and
          nothing behind a paywall. It is an independent project, built and
          maintained by{" "}
          <Link
            className="font-medium text-accent-strong"
            href="https://ruchern.dev"
            rel="noreferrer nofollow"
            target="_blank"
          >
            Ru Chern
          </Link>
          , a software engineer, alongside a full-time job.
        </Typography.Paragraph>
      </div>
    </section>
  );
}
