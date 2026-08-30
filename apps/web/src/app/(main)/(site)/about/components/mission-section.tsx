import Typography from "@web/components/typography";
import { SITE_TITLE } from "@web/config";
import Link from "next/link";

/**
 * The comp runs the prose blocks as a two-column split: the heading holds a
 * fixed 300px rail on the left and the paragraphs take the rest. It collapses
 * to a single column below `lg`, where 300px would leave the text too narrow.
 */
export function MissionSection() {
  return (
    <section className="grid items-start gap-8 lg:grid-cols-[300px_1fr] lg:gap-14">
      <Typography.H2 className="font-bold text-[2.125rem] tracking-[-0.02em]">
        What we do
      </Typography.H2>
      <div className="flex flex-col gap-5">
        <Typography.Text className="text-[1.1875rem] leading-[1.65]">
          Each time LTA publishes, we pull the latest figures from DataMall,
          check them against the previous release, and turn them into charts you
          can read in a few seconds. Registrations, deregistrations, COE
          premiums, PQP rates, fuel type mix and the vehicle population all sit
          on one platform.
        </Typography.Text>
        <Typography.Text className="text-[1.1875rem] leading-[1.65]">
          The raw data is public, but it arrives as spreadsheets with column
          headers like <em>MonthOfRegistration</em> and no context. We do the
          joining, the naming and the arithmetic, then show the trend beside the
          number so you can tell whether this month&apos;s premium is high or
          low.
        </Typography.Text>
        <Typography.Text className="text-[1.1875rem] leading-[1.65]">
          {SITE_TITLE} is free and open. There is no account to create and
          nothing behind a paywall. It is an independent project, built and
          maintained by{" "}
          <Link
            className="font-medium text-accent-strong"
            href="https://ruchern.dev"
            rel="noreferrer"
            target="_blank"
          >
            Ru Chern
          </Link>
          , a software engineer, alongside a full-time job.
        </Typography.Text>
      </div>
    </section>
  );
}
