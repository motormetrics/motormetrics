import { Typography } from "@heroui/react";
import { ChargingFaq } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/charging-faq";
import { buildChargingFaqs } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/faq-data";
import {
  formatPerKwh,
  getChargingStats,
  ZERO_RATE_DISCLAIMER,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/price-stats";
import { StructuredData } from "@web/components/structured-data";
import { generateFAQPageSchema } from "@web/lib/metadata";

const formatObservedAt = (iso: string) =>
  new Date(iso).toLocaleString("en-SG", {
    timeZone: "Asia/Singapore",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

/**
 * The plain-prose summary of the page for readers and crawlers: a direct
 * answer up top with the current figures and their source, then the FAQ,
 * whose answers are also emitted as FAQPage structured data.
 */
export async function ChargingIntro() {
  const { observedAt, stats } = await getChargingStats();
  if (!stats) {
    return null;
  }

  return (
    <div className="flex max-w-prose flex-col gap-3">
      <Typography.Paragraph className="leading-relaxed">
        Singapore has {stats.connectors.toLocaleString("en-SG")} public EV
        charging connectors across {stats.locations.toLocaleString("en-SG")}{" "}
        locations. The median advertised rate is{" "}
        {formatPerKwh(stats.medianPerKwh)}, with AC charging from{" "}
        {formatPerKwh(stats.cheapestAc)} and DC fast charging from{" "}
        {formatPerKwh(stats.cheapestDc)}. Availability and prices below come
        from the Land Transport Authority's DataMall feed and refresh hourly.
      </Typography.Paragraph>
      {stats.cheapestAc === 0 || stats.cheapestDc === 0 ? (
        <Typography.Paragraph color="muted" size="sm">
          {ZERO_RATE_DISCLAIMER}
        </Typography.Paragraph>
      ) : null}
      {observedAt ? (
        <Typography.Paragraph color="muted" size="sm">
          Last updated {formatObservedAt(observedAt)} SGT · Source: LTA DataMall
          EV Charging Points
        </Typography.Paragraph>
      ) : null}
    </div>
  );
}

/** The as-of line under the page title: when the snapshot was taken, and where from. */
export async function ChargingSource() {
  const { observedAt } = await getChargingStats();
  if (!observedAt) {
    return null;
  }

  return (
    <>
      Updated {formatObservedAt(observedAt)} SGT · Advertised rates from LTA
      DataMall, refreshed hourly
    </>
  );
}

export async function ChargingQuestions() {
  const { stats } = await getChargingStats();
  if (!stats) {
    return null;
  }
  const faqs = buildChargingFaqs(stats);

  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateFAQPageSchema([{ items: faqs }]),
        }}
      />
      <ChargingFaq faqs={faqs} />
    </>
  );
}
