import {
  GITHUB_REPO_URL,
  SITE_TITLE,
  SITE_URL,
  SUPPORT_EMAIL,
} from "@web/config";
import { advertisePage } from "@web/flags";
import type { Metadata } from "next";
import { Suspense } from "react";

const title = `Contact ${SITE_TITLE}`;
const description = `How to reach ${SITE_TITLE} about Singapore car registration data, COE results, corrections, partnerships and press enquiries.`;

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  openGraph: {
    title,
    description,
    url: `${SITE_URL}/contact`,
    siteName: SITE_TITLE,
    locale: "en_SG",
    type: "website",
  },
  alternates: {
    canonical: "/contact",
  },
};

async function AdvertisingSection() {
  const showAdvertisePage = await advertisePage();
  if (!showAdvertisePage) {
    return null;
  }

  return (
    <section>
      <h2>Advertising</h2>
      <p>
        Sponsorship and placement enquiries have their own page. See{" "}
        <a href="/advertise">Advertise</a> for the rules and rates.
      </p>
    </section>
  );
}

export default function ContactPage() {
  return (
    <article className="prose prose-neutral max-w-none">
      <header className="mb-8">
        <h1>Contact</h1>
        <p className="text-muted">
          {SITE_TITLE} is an independent, open-source project that publishes
          Singapore car registration statistics and COE bidding results.
        </p>
      </header>

      <section>
        <h2>Email</h2>
        <p>
          For questions about the data, corrections, partnerships or press
          enquiries, write to{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. We read every
          message and usually reply within a few working days. Please include
          the page URL and the month or bidding exercise you are asking about so
          we can look it up quickly.
        </p>
      </section>

      <section>
        <h2>Bugs and feature requests</h2>
        <p>
          The codebase is public. If a chart is wrong, a page fails to load or
          you would like to see a new breakdown, open an issue on the{" "}
          <a href={GITHUB_REPO_URL} rel="noopener noreferrer" target="_blank">
            GitHub repository
          </a>
          . Pull requests are welcome.
        </p>
      </section>

      <Suspense>
        <AdvertisingSection />
      </Suspense>

      <section>
        <h2>About the data</h2>
        <p>
          All figures come from the Land Transport Authority and are refreshed
          as new monthly and bidding data is published. {SITE_TITLE} is not
          affiliated with the Land Transport Authority or any car dealer, and
          cannot help with individual COE bids, vehicle registration or
          licensing matters. For those, contact the Land Transport Authority
          directly.
        </p>
      </section>
    </article>
  );
}
