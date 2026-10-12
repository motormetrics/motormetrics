import { SectionHead } from "@web/components/shared/overview";
import { Text } from "@web/components/shared/text";
import { SITE_TITLE } from "@web/config";
import Link from "next/link";

/**
 * The comp runs the prose blocks as a two-column split: the section head in a
 * narrow rail on the left and the paragraphs in the rest. It collapses to a
 * single column below `lg`, where the rail would leave the text too narrow.
 */
export function MissionSection() {
  return (
    <section className="grid grid-cols-1 items-start gap-4 lg:grid-cols-4 lg:gap-14">
      <SectionHead eyebrow="The project" title="What we do" />
      <div className="flex min-w-0 max-w-2xl flex-col gap-4 lg:col-span-3">
        <Text.Paragraph className="leading-relaxed md:text-lg" tone="strong">
          Each time LTA publishes, we pull the latest figures from DataMall,
          check them against the previous release, and turn them into charts you
          can read in a few seconds. Registrations, deregistrations, COE
          premiums, PQP rates, fuel type mix and the vehicle population all sit
          on one platform.
        </Text.Paragraph>
        <Text.Paragraph className="leading-relaxed md:text-lg" tone="strong">
          The raw data is public, but it arrives as spreadsheets with column
          headers like{" "}
          <code className="rounded bg-surface-secondary px-1 font-mono text-foreground text-sm">
            MonthOfRegistration
          </code>{" "}
          and no context. We do the joining, the naming and the arithmetic, then
          show the trend beside the number so you can tell whether this
          month&apos;s premium is high or low.
        </Text.Paragraph>
        <Text.Paragraph className="leading-relaxed md:text-lg" tone="strong">
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
        </Text.Paragraph>
      </div>
    </section>
  );
}
