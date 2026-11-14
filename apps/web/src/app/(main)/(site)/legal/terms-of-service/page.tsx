import { Typography } from "@heroui/react";
import {
  Hairline,
  OverviewPage,
  SectionHead,
} from "@web/components/shared/overview";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import type { Metadata } from "next";

const title = "Terms of Service";
const description = `Terms and conditions for using ${SITE_TITLE}. Understand data usage rights, liability limits, and acceptable use of our Singapore car market platform.`;

/** Typography styles for the lists inside each section. */
const BODY_CLASS = "prose prose-neutral max-w-prose";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    ...baseOpenGraph,
    title,
    description,
    url: `${SITE_URL}/legal/terms-of-service`,
  },
  twitter: {
    ...baseTwitter,
    title,
    description,
  },
  alternates: {
    canonical: "/legal/terms-of-service",
  },
};

export default function TermsPage() {
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
            Legal
          </Typography.Paragraph>
          <Typography.Heading level={1}>Terms of Service</Typography.Heading>
        </div>
        <Typography.Paragraph color="muted" size="sm">
          Last updated: December 2024
        </Typography.Paragraph>
      </div>

      <section className="flex flex-col gap-4">
        <SectionHead title="Using Our Website" />
        <div className={BODY_CLASS}>
          <p>
            By using {SITE_TITLE}, you agree to these terms. Pretty
            straightforward!
          </p>
        </div>
      </section>

      <Hairline />

      <section className="flex flex-col gap-4">
        <SectionHead title="What We Do" />
        <div className={BODY_CLASS}>
          <p>We provide Singapore car market data and analytics, including:</p>
          <ul>
            <li>Car registration stats by make, model, and fuel type</li>
            <li>COE bidding results and historical data</li>
            <li>Vehicle type trends</li>
            <li>Market insights and analysis</li>
          </ul>
        </div>
      </section>

      <Hairline />

      <section className="flex flex-col gap-4">
        <SectionHead title="About Our Data" />
        <div className={BODY_CLASS}>
          <p>
            We get our data from the LTA DataMall and other official government
            sources. While we do our best to keep everything accurate and
            current, we can&apos;t guarantee that every single piece of
            information is perfect.
          </p>
          <p>
            If you&apos;re making important decisions, please double-check with
            official sources first.
          </p>
        </div>
      </section>

      <Hairline />

      <section className="flex flex-col gap-4">
        <SectionHead title="What You Can (and Can't) Do" />
        <div className={BODY_CLASS}>
          <p>
            You can use our website for personal, non-commercial purposes.
            However, please don&apos;t:
          </p>
          <ul>
            <li>Copy or modify our content</li>
            <li>Use our data for commercial purposes</li>
            <li>Try to reverse engineer our website</li>
            <li>Remove our copyright notices</li>
          </ul>
        </div>
      </section>

      <Hairline />

      <section className="flex flex-col gap-4">
        <SectionHead title="Liability Limits" />
        <div className={BODY_CLASS}>
          <p>
            We won&apos;t be responsible for any damages that might arise from
            using (or not being able to use) our website. This includes things
            like lost data, business interruption, or any other issues.
          </p>
        </div>
      </section>

      <Hairline />

      <section className="flex flex-col gap-4">
        <SectionHead title="Privacy" />
        <div className={BODY_CLASS}>
          <p>
            Your privacy matters to us. Check out our Privacy Policy to see how
            we handle your information.
          </p>
        </div>
      </section>

      <Hairline />

      <section className="flex flex-col gap-4">
        <SectionHead title="Changes to These Terms" />
        <div className={BODY_CLASS}>
          <p>
            We might update these terms from time to time. When we do,
            we&apos;ll post the changes here. If you keep using the website
            after we make changes, that means you&apos;re okay with the new
            terms.
          </p>
        </div>
      </section>

      <Hairline />

      <section className="flex flex-col gap-4">
        <SectionHead title="Questions?" />
        <div className={BODY_CLASS}>
          <p>
            If you have any questions about these terms, feel free to reach out
            to us on social media or through our GitHub repository.
          </p>
        </div>
      </section>
    </OverviewPage>
  );
}
