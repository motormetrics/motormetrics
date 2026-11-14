import { Typography } from "@heroui/react";
import {
  Hairline,
  OverviewPage,
  SectionHead,
} from "@web/components/shared/overview";
import { SITE_TITLE, SITE_URL } from "@web/config";
import {
  baseOpenGraph,
  baseTwitter,
  siteCardImages,
} from "@web/lib/metadata/social";
import type { Metadata } from "next";

const title = "Privacy Policy";
const description = `How ${SITE_TITLE} collects, uses, and protects your data. Learn about our analytics, third-party services, and your privacy rights.`;

/** Typography styles for the lists and sub-headings inside each section. */
const BODY_CLASS = "prose prose-neutral max-w-prose";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    ...baseOpenGraph,
    images: siteCardImages,
    title,
    description,
    url: `${SITE_URL}/legal/privacy-policy`,
  },
  twitter: {
    ...baseTwitter,
    title,
    description,
  },
  alternates: {
    canonical: "/legal/privacy-policy",
  },
};

export default function PrivacyPage() {
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
          <Typography.Heading level={1}>Privacy Policy</Typography.Heading>
        </div>
        <Typography.Paragraph color="muted" size="sm">
          Last updated: December 2024
        </Typography.Paragraph>
      </div>

      <section className="flex flex-col gap-4">
        <SectionHead title="Privacy? We've Got You Covered" />
        <div className={BODY_CLASS}>
          <p>
            We care about your privacy. This policy explains how we collect and
            use your information when you visit {SITE_TITLE}. We&apos;ll keep it
            simple and straightforward.
          </p>
        </div>
      </section>

      <Hairline />

      <section className="flex flex-col gap-4">
        <SectionHead title="What Information We Collect" />
        <div className={BODY_CLASS}>
          <h3>Stuff We Automatically Collect</h3>
          <p>
            When you visit our website, we automatically collect some basic
            info:
          </p>
          <ul>
            <li>Your IP address and general location</li>
            <li>What browser you&apos;re using</li>
            <li>Your operating system</li>
            <li>Which pages you visit and how long you stay</li>
            <li>What website sent you to us</li>
            <li>When you visited</li>
          </ul>

          <h3>Analytics Data</h3>
          <p>
            We collect anonymous data to understand how people use our website
            and make it better. This includes page views, user sessions, and
            where our visitors are from.
          </p>
        </div>
      </section>

      <Hairline />

      <section className="flex flex-col gap-4">
        <SectionHead title="How We Use Your Information" />
        <div className={BODY_CLASS}>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Keep our website running smoothly</li>
            <li>Make your experience better</li>
            <li>Understand how people use our site</li>
            <li>Build new features and improvements</li>
            <li>Spot trends and patterns</li>
            <li>Keep everything secure</li>
          </ul>
        </div>
      </section>

      <Hairline />

      <section className="flex flex-col gap-4">
        <SectionHead title="Keeping Your Data Safe" />
        <div className={BODY_CLASS}>
          <p>
            We take security seriously and use appropriate measures to protect
            your information from unauthorized access, changes, or disclosure.
            Only authorized people can access our analytics data.
          </p>
          <p>
            We only keep your information as long as we need it for the purposes
            described here, or as required by law.
          </p>
        </div>
      </section>

      <Hairline />

      <section className="flex flex-col gap-4">
        <SectionHead title="Third-Party Services" />
        <div className={BODY_CLASS}>
          <p>
            Our website might link to other sites, but we&apos;re not
            responsible for their privacy practices. Make sure to check their
            privacy policies if you visit them.
          </p>
          <p>
            We use some third-party services for analytics and website features.
            These services collect information according to their own privacy
            policies.
          </p>
        </div>
      </section>

      <Hairline />

      <section className="flex flex-col gap-4">
        <SectionHead title="Your Rights" />
        <div className={BODY_CLASS}>
          <p>
            Depending on where you live, you might have certain rights about
            your personal information:
          </p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct any mistakes</li>
            <li>Delete your personal information</li>
            <li>Object to how we process your information</li>
            <li>Take your data elsewhere</li>
          </ul>
        </div>
      </section>

      <Hairline />

      <section className="flex flex-col gap-4">
        <SectionHead title="Changes to This Policy" />
        <div className={BODY_CLASS}>
          <p>
            We might update this privacy policy occasionally. When we do,
            we&apos;ll post the changes here and update the &quot;last
            updated&quot; date.
          </p>
        </div>
      </section>

      <Hairline />

      <section className="flex flex-col gap-4">
        <SectionHead title="Questions?" />
        <div className={BODY_CLASS}>
          <p>
            If you have any questions about this privacy policy, feel free to
            reach out to us on social media or through our GitHub repository.
            We&apos;ll get back to you as soon as we can.
          </p>
        </div>
      </section>
    </OverviewPage>
  );
}
