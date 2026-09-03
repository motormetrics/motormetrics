import { Typography } from "@heroui/react";
import { StructuredData } from "@web/components/structured-data";
import { generateFAQPageSchema } from "@web/lib/metadata";
import { getEvChargingSnapshot } from "@web/queries/ev-charging";
import { ChargingFaq } from "./charging-faq";
import { buildChargingFaqs } from "./faq-data";
import { deriveChargingStats, formatPerKwh } from "./price-stats";

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
  const { observedAt, records } = await getEvChargingSnapshot();
  if (records.length === 0) {
    return null;
  }
  const stats = deriveChargingStats(records);

  return (
    <div className="flex max-w-prose flex-col gap-3">
      <Typography.Paragraph className="leading-relaxed">
        Singapore has {stats.connectors.toLocaleString("en-SG")} public EV
        charging connectors across {stats.locations.toLocaleString("en-SG")}{" "}
        locations. The median advertised rate is{" "}
        {formatPerKwh(stats.medianPerKwh)}, with AC charging from{" "}
        {formatPerKwh(stats.cheapestAc)} and DC fast charging from{" "}
        {formatPerKwh(stats.cheapestDc)}. Availability and prices below come
        from the Land Transport Authority's DataMall feed and refresh every five
        minutes.
      </Typography.Paragraph>
      {observedAt ? (
        <Typography.Paragraph color="muted" size="sm">
          Last updated {formatObservedAt(observedAt)} SGT · Source: LTA DataMall
          EV Charging Points
        </Typography.Paragraph>
      ) : null}
    </div>
  );
}

export async function ChargingQuestions() {
  const { records } = await getEvChargingSnapshot();
  if (records.length === 0) {
    return null;
  }
  const faqs = buildChargingFaqs(deriveChargingStats(records));

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
