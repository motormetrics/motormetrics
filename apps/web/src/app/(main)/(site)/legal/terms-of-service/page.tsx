import { SITE_TITLE } from "@web/config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms and conditions for using ${SITE_TITLE}. Understand data usage rights, liability limits, and acceptable use of our Singapore car market platform.`,
  alternates: {
    canonical: "/legal/terms-of-service",
  },
};

export default function TermsPage() {
  return (
    <article className="prose prose-neutral mx-auto max-w-4xl">
      <header className="mb-8">
        <h1>Terms of Service</h1>
        <p className="text-default-600">Last updated: December 2024</p>
      </header>

      <section>
        <h2>Using Our Website</h2>
        <p>
          By using {SITE_TITLE}, you agree to these terms. Pretty
          straightforward!
        </p>
      </section>

      <section>
        <h2>What We Do</h2>
        <p>We provide Singapore car market data and analytics, including:</p>
        <ul>
          <li>Car registration stats by make, model, and fuel type</li>
          <li>COE bidding results and historical data</li>
          <li>Vehicle type trends</li>
          <li>Market insights and analysis</li>
        </ul>
      </section>

      <section>
        <h2>About Our Data</h2>
        <p>
          We get our data from the LTA DataMall and other official government
          sources. While we do our best to keep everything accurate and current,
          we can&apos;t guarantee that every single piece of information is
          perfect.
        </p>
        <p>
          If you&apos;re making important decisions, please double-check with
          official sources first.
        </p>
      </section>

      <section>
        <h2>What You Can (and Can&apos;t) Do</h2>
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
      </section>

      <section>
        <h2>Liability Limits</h2>
        <p>
          We won&apos;t be responsible for any damages that might arise from
          using (or not being able to use) our website. This includes things
          like lost data, business interruption, or any other issues.
        </p>
      </section>

      <section>
        <h2>Privacy</h2>
        <p>
          Your privacy matters to us. Check out our Privacy Policy to see how we
          handle your information.
        </p>
      </section>

      <section>
        <h2>Changes to These Terms</h2>
        <p>
          We might update these terms from time to time. When we do, we&apos;ll
          post the changes here. If you keep using the website after we make
          changes, that means you&apos;re okay with the new terms.
        </p>
      </section>

      <section>
        <h2>Questions?</h2>
        <p>
          If you have any questions about these terms, feel free to reach out to
          us on social media or through our GitHub repository.
        </p>
      </section>
    </article>
  );
}
