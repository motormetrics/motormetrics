import { SITE_TITLE } from "@web/config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE_TITLE} collects, uses, and protects your data. Learn about our analytics, third-party services, and your privacy rights.`,
  alternates: {
    canonical: "/legal/privacy-policy",
  },
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-neutral mx-auto max-w-4xl">
      <header className="mb-8">
        <h1>Privacy Policy</h1>
        <p className="text-default-600">Last updated: December 2024</p>
      </header>

      <section>
        <h2>Privacy? We&apos;ve Got You Covered</h2>
        <p>
          We care about your privacy. This policy explains how we collect and
          use your information when you visit {SITE_TITLE}. We&apos;ll keep it
          simple and straightforward.
        </p>
      </section>

      <section>
        <h2>What Information We Collect</h2>

        <h3>Stuff We Automatically Collect</h3>
        <p>
          When you visit our website, we automatically collect some basic info:
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
          We collect anonymous data to understand how people use our website and
          make it better. This includes page views, user sessions, and where our
          visitors are from.
        </p>
      </section>

      <section>
        <h2>How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Keep our website running smoothly</li>
          <li>Make your experience better</li>
          <li>Understand how people use our site</li>
          <li>Build new features and improvements</li>
          <li>Spot trends and patterns</li>
          <li>Keep everything secure</li>
        </ul>
      </section>

      <section>
        <h2>Keeping Your Data Safe</h2>
        <p>
          We take security seriously and use appropriate measures to protect
          your information from unauthorized access, changes, or disclosure.
          Only authorized people can access our analytics data.
        </p>
        <p>
          We only keep your information as long as we need it for the purposes
          described here, or as required by law.
        </p>
      </section>

      <section>
        <h2>Third-Party Services</h2>
        <p>
          Our website might link to other sites, but we&apos;re not responsible
          for their privacy practices. Make sure to check their privacy policies
          if you visit them.
        </p>
        <p>
          We use some third-party services for analytics and website features.
          These services collect information according to their own privacy
          policies.
        </p>
      </section>

      <section>
        <h2>Your Rights</h2>
        <p>
          Depending on where you live, you might have certain rights about your
          personal information:
        </p>
        <ul>
          <li>Access your personal information</li>
          <li>Correct any mistakes</li>
          <li>Delete your personal information</li>
          <li>Object to how we process your information</li>
          <li>Take your data elsewhere</li>
        </ul>
      </section>

      <section>
        <h2>Changes to This Policy</h2>
        <p>
          We might update this privacy policy occasionally. When we do,
          we&apos;ll post the changes here and update the &quot;last
          updated&quot; date.
        </p>
      </section>

      <section>
        <h2>Questions?</h2>
        <p>
          If you have any questions about this privacy policy, feel free to
          reach out to us on social media or through our GitHub repository.
          We&apos;ll get back to you as soon as we can.
        </p>
      </section>
    </article>
  );
}
