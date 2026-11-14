import { Typography } from "@heroui/react";
import {
  Hairline,
  OverviewPage,
  SectionHead,
} from "@web/components/shared/overview";
import {
  GITHUB_REPO_URL,
  SITE_TITLE,
  SITE_URL,
  SUPPORT_EMAIL,
} from "@web/config";
import { advertisePage } from "@web/flags";
import { baseOpenGraph, siteCardImages } from "@web/lib/metadata/social";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

const title = `Contact ${SITE_TITLE}`;
const description = `How to reach ${SITE_TITLE} about Singapore car registration data, COE results, corrections, partnerships and press enquiries.`;

const LINK_CLASS = "font-medium text-accent-strong";
const BODY_CLASS = "max-w-prose text-muted-strong leading-relaxed";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  openGraph: {
    ...baseOpenGraph,
    images: siteCardImages,
    title,
    description,
    url: `${SITE_URL}/contact`,
  },
  alternates: {
    canonical: "/contact",
  },
};

/** Read per request from the flag, so it streams in after the static shell. */
async function AdvertisingSection() {
  const showAdvertisePage = await advertisePage();
  if (!showAdvertisePage) {
    return null;
  }

  return (
    <>
      <section className="flex flex-col gap-4">
        <SectionHead title="Advertising" />
        <Typography.Paragraph className={BODY_CLASS}>
          Sponsorship and placement enquiries have their own page. See{" "}
          <Link className={LINK_CLASS} href="/advertise">
            Advertise
          </Link>{" "}
          for the rules and rates.
        </Typography.Paragraph>
      </section>
      <Hairline />
    </>
  );
}

export default function ContactPage() {
  return (
    <OverviewPage className="gap-10 max-md:gap-7">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Typography.Paragraph
            className="uppercase"
            color="muted"
            size="xs"
            weight="semibold"
          >
            Get in touch
          </Typography.Paragraph>
          <Typography.Heading level={1}>Contact</Typography.Heading>
        </div>
        <Typography.Paragraph className="max-w-prose">
          {SITE_TITLE} is an independent, open-source project that publishes
          Singapore car registration statistics and COE bidding results.
        </Typography.Paragraph>
      </div>

      <section className="flex flex-col gap-4">
        <SectionHead title="Email" />
        <Typography.Paragraph className={BODY_CLASS}>
          For questions about the data, corrections, partnerships or press
          enquiries, write to{" "}
          <a className={LINK_CLASS} href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
          . We read every message and usually reply within a few working days.
          Please include the page URL and the month or bidding exercise you are
          asking about so we can look it up quickly.
        </Typography.Paragraph>
      </section>

      <Hairline />

      <section className="flex flex-col gap-4">
        <SectionHead title="Bugs and feature requests" />
        <Typography.Paragraph className={BODY_CLASS}>
          The codebase is public. If a chart is wrong, a page fails to load or
          you would like to see a new breakdown, open an issue on the{" "}
          <a
            className={LINK_CLASS}
            href={GITHUB_REPO_URL}
            rel="noopener noreferrer nofollow"
            target="_blank"
          >
            GitHub repository
          </a>
          . Pull requests are welcome.
        </Typography.Paragraph>
      </section>

      <Hairline />

      {/* No fallback: the section is absent whenever the flag is off, so
          there is nothing to reserve space for. */}
      <Suspense>
        <AdvertisingSection />
      </Suspense>

      <section className="flex flex-col gap-4">
        <SectionHead title="About the data" />
        <Typography.Paragraph className={BODY_CLASS}>
          All figures come from the Land Transport Authority and are refreshed
          as new monthly and bidding data is published. {SITE_TITLE} is not
          affiliated with the Land Transport Authority or any car dealer, and
          cannot help with individual COE bids, vehicle registration or
          licensing matters. For those, contact the Land Transport Authority
          directly.
        </Typography.Paragraph>
      </section>
    </OverviewPage>
  );
}
