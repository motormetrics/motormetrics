import { Typography } from "@heroui/react";
import { typeDetailMeta } from "@web/app/(main)/(dashboard)/cars/components/type-meta";
import { buildVehicleTypeFaqs } from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/faq-data";
import {
  PERIOD_LABELS,
  periodWindow,
  SERIES_MONTHS,
} from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/period";
import { VehicleTypeFuelMix } from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/vehicle-type-fuel-mix";
import { VehicleTypeHeadline } from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/vehicle-type-headline";
import { VehicleTypeMakes } from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/vehicle-type-makes";
import { VehicleTypeMonthly } from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/vehicle-type-monthly";
import { VehicleTypePeers } from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/vehicle-type-peers";
import {
  loadVehicleTypeSearchParams,
  resolveVehicleType,
  type VehicleTypeReportProps,
} from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/vehicle-type-shared";
import { VehicleTypeTrend } from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/vehicle-type-trend";
import { Hairline } from "@web/components/shared/overview";
import { PageFaq } from "@web/components/shared/page-faq";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import {
  generateBreadcrumbSchema,
  generateFAQPageSchema,
} from "@web/lib/metadata";
import {
  getTypeCrossMixInWindow,
  getTypeDistributionInWindow,
  getTypeMakesInWindow,
  getTypeMonthlySeries,
} from "@web/queries/cars/type-detail";
import { getCarLogoMap } from "@web/queries/logos";
import { shiftMonth } from "@web/utils/dates/month-arithmetic";
import { getMonthOrLatest } from "@web/utils/dates/months";
import { formatVehicleType } from "@web/utils/formatting/format-vehicle-type";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { WebPage, WithContext } from "schema-dts";

/**
 * Loads the period's figures once and hands each section its slice, with the
 * page's structured data and FAQ.
 */
export async function VehicleTypeContent({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: VehicleTypeReportProps) {
  const [{ type }, { month: parsedMonth, period }] = await Promise.all([
    paramsPromise,
    loadVehicleTypeSearchParams(searchParamsPromise),
  ]);
  const [{ month }, value, logoUrlBySlug] = await Promise.all([
    getMonthOrLatest(parsedMonth, "cars"),
    resolveVehicleType(type),
    getCarLogoMap(),
  ]);
  if (!value) {
    notFound();
  }

  const displayName = formatVehicleType(value);
  const periodLabel = PERIOD_LABELS[period];

  const { from, to } = periodWindow(period, month);
  const previousFrom = shiftMonth(from, -12);
  const previousTo = shiftMonth(to, -12);

  const [
    series,
    distribution,
    previousDistribution,
    makes,
    previousMakes,
    crossMix,
  ] = await Promise.all([
    getTypeMonthlySeries("vehicleType", value, month, SERIES_MONTHS),
    getTypeDistributionInWindow("vehicleType", from, to),
    getTypeDistributionInWindow("vehicleType", previousFrom, previousTo),
    getTypeMakesInWindow("vehicleType", value, from, to),
    getTypeMakesInWindow("vehicleType", value, previousFrom, previousTo),
    getTypeCrossMixInWindow("vehicleType", value, from, to),
  ]);

  const marketTotal = distribution.reduce((sum, row) => sum + row.count, 0);
  const typeTotal = distribution.find((row) => row.name === value)?.count ?? 0;

  const { title, description, canonical } = typeDetailMeta(
    "vehicle-types",
    type,
    value,
  );
  const faqs = buildVehicleTypeFaqs(displayName);
  const structuredData: WithContext<WebPage> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: `${SITE_URL}${canonical}`,
    publisher: {
      "@type": "Organization",
      name: SITE_TITLE,
      url: SITE_URL,
    },
    isPartOf: {
      "@type": "WebSite",
      name: SITE_TITLE,
      url: SITE_URL,
    },
  };

  return (
    <>
      <StructuredData data={structuredData} />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Cars", path: "/cars" },
            { name: "Vehicle types", path: "/cars/vehicle-types" },
            { name: displayName, path: `/cars/vehicle-types/${type}` },
          ]),
        }}
      />

      <VehicleTypeHeadline
        crossMix={crossMix}
        displayName={displayName}
        distribution={distribution}
        makeCount={makes.length}
        marketTotal={marketTotal}
        month={month}
        period={period}
        periodLabel={periodLabel}
        previousDistribution={previousDistribution}
        series={series}
        typeTotal={typeTotal}
        value={value}
      />

      <VehicleTypeTrend
        displayName={displayName}
        month={month}
        series={series}
      />

      <Hairline />

      <VehicleTypeMakes
        displayName={displayName}
        logoUrlBySlug={logoUrlBySlug}
        makes={makes}
        periodLabel={periodLabel}
        previousMakes={previousMakes}
        typeTotal={typeTotal}
      />

      <Hairline />

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-11 lg:gap-14">
        <VehicleTypeMonthly
          displayName={displayName}
          month={month}
          series={series}
        />

        <div className="flex min-w-0 flex-col gap-10 lg:col-span-5">
          <VehicleTypePeers
            distribution={distribution}
            month={month}
            period={period}
            value={value}
          />

          <VehicleTypeFuelMix
            crossMix={crossMix}
            displayName={displayName}
            periodLabel={periodLabel}
            typeTotal={typeTotal}
          />
        </div>
      </div>

      <Hairline />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-14">
        <section className="flex flex-col gap-2.5">
          <Typography.Paragraph
            className="uppercase"
            color="muted"
            size="xs"
            weight="semibold"
          >
            How this is counted
          </Typography.Paragraph>
          <Typography.Paragraph size="sm">
            A car counts in the month it is registered, under the vehicle type
            LTA records against it.
          </Typography.Paragraph>
          <Typography.Paragraph size="sm">
            Vehicle types are LTA's own values, shortened only for display. The
            underlying figures are unchanged.
          </Typography.Paragraph>
        </section>
        <nav
          aria-label="Related pages"
          className="flex flex-col gap-2.5 lg:self-end"
        >
          {[
            { href: "/cars/vehicle-types", label: "All vehicle types" },
            {
              href: "/cars/registrations",
              label: "Every registration this month",
            },
          ].map(({ href, label }) => (
            <Link
              className="whitespace-nowrap font-semibold text-accent-strong text-sm hover:text-accent-deep"
              href={href}
              key={href}
            >
              {label} →
            </Link>
          ))}
        </nav>
      </div>

      <Hairline />

      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateFAQPageSchema([{ items: faqs }]),
        }}
      />
      <PageFaq faqs={faqs} />
    </>
  );
}
