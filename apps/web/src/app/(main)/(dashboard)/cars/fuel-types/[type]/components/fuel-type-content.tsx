import { typeDetailMeta } from "@web/app/(main)/(dashboard)/cars/components/type-meta";
import { buildFuelTypeFaqs } from "@web/app/(main)/(dashboard)/cars/fuel-types/[type]/components/faq-data";
import { FuelTypeBodyTypes } from "@web/app/(main)/(dashboard)/cars/fuel-types/[type]/components/fuel-type-body-types";
import { FuelTypeHeadline } from "@web/app/(main)/(dashboard)/cars/fuel-types/[type]/components/fuel-type-headline";
import { FuelTypeMakes } from "@web/app/(main)/(dashboard)/cars/fuel-types/[type]/components/fuel-type-makes";
import { FuelTypeMonthly } from "@web/app/(main)/(dashboard)/cars/fuel-types/[type]/components/fuel-type-monthly";
import { FuelTypePeers } from "@web/app/(main)/(dashboard)/cars/fuel-types/[type]/components/fuel-type-peers";
import {
  type FuelTypeReportProps,
  loadFuelTypeSearchParams,
  PERIOD_LABELS,
  type Period,
  resolveFuelType,
} from "@web/app/(main)/(dashboard)/cars/fuel-types/[type]/components/fuel-type-shared";
import { FuelTypeTrend } from "@web/app/(main)/(dashboard)/cars/fuel-types/[type]/components/fuel-type-trend";
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
import { formatMonthLabel } from "@web/utils/dates/format-month";
import { shiftMonth } from "@web/utils/dates/month-arithmetic";
import { getMonthOrLatest } from "@web/utils/dates/months";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { WebPage, WithContext } from "schema-dts";

/** How many months the chart and the month-by-month table frame. */
const SERIES_MONTHS = 12;

/** Inclusive `YYYY-MM` bounds for a period, anchored on `month`. */
function periodWindow(
  period: Period,
  month: string,
): { from: string; to: string } {
  if (period === "month") {
    return { from: month, to: month };
  }

  if (period === "ytd") {
    return { from: `${month.slice(0, 4)}-01`, to: month };
  }

  return { from: shiftMonth(month, -(SERIES_MONTHS - 1)), to: month };
}

/** "August 2026", "2026 year to date" or "Last 12 months", as the comp words each window. */
function periodCaption(period: Period, month: string): string {
  if (period === "month") {
    return formatMonthLabel(month);
  }

  if (period === "ytd") {
    return `${month.slice(0, 4)} year to date`;
  }

  return PERIOD_LABELS["12m"];
}

/**
 * Loads the period's figures once and hands each section its slice, with the
 * page's structured data and FAQ.
 */
export async function FuelTypeContent({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: FuelTypeReportProps) {
  const [{ type }, { month: parsedMonth, period }] = await Promise.all([
    paramsPromise,
    loadFuelTypeSearchParams(searchParamsPromise),
  ]);
  const [{ month }, value, logoUrlBySlug] = await Promise.all([
    getMonthOrLatest(parsedMonth, "cars"),
    resolveFuelType(type),
    getCarLogoMap(),
  ]);
  if (!value) {
    notFound();
  }

  const periodLabel = periodCaption(period, month);

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
    getTypeMonthlySeries("fuelType", value, month, SERIES_MONTHS),
    getTypeDistributionInWindow("fuelType", from, to),
    getTypeDistributionInWindow("fuelType", previousFrom, previousTo),
    getTypeMakesInWindow("fuelType", value, from, to),
    getTypeMakesInWindow("fuelType", value, previousFrom, previousTo),
    getTypeCrossMixInWindow("fuelType", value, from, to),
  ]);

  const marketTotal = distribution.reduce((sum, row) => sum + row.count, 0);
  const typeTotal = distribution.find((row) => row.name === value)?.count ?? 0;

  const isElectric = value === "Electric";

  const { title, description, canonical } = typeDetailMeta(
    "fuel-types",
    type,
    value,
  );
  const faqs = buildFuelTypeFaqs(value);
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
            { name: "Fuel types", path: "/cars/fuel-types" },
            { name: value, path: `/cars/fuel-types/${type}` },
          ]),
        }}
      />

      <FuelTypeHeadline
        distribution={distribution}
        isElectric={isElectric}
        makeCount={makes.length}
        marketTotal={marketTotal}
        periodLabel={periodLabel}
        previousDistribution={previousDistribution}
        series={series}
        typeTotal={typeTotal}
        value={value}
      />

      <FuelTypeTrend month={month} series={series} value={value} />

      <Hairline />

      <FuelTypeMakes
        logoUrlBySlug={logoUrlBySlug}
        makes={makes}
        periodLabel={periodLabel}
        previousMakes={previousMakes}
        typeTotal={typeTotal}
        value={value}
      />

      <Hairline />

      <FuelTypeMonthly month={month} series={series} value={value} />

      <Hairline />

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-14">
        <FuelTypePeers
          distribution={distribution}
          periodLabel={periodLabel}
          value={value}
        />

        <FuelTypeBodyTypes
          crossMix={crossMix}
          periodLabel={periodLabel}
          typeTotal={typeTotal}
          value={value}
        />
      </div>

      <nav
        aria-label="Related pages"
        className="flex flex-wrap gap-x-5 gap-y-2"
      >
        {[
          { href: "/cars/fuel-types", label: "All fuel types" },
          {
            href: "/cars/registrations",
            label: "Every registration this month",
          },
          ...(isElectric
            ? [
                {
                  href: "/cars/electric-vehicles",
                  label: "Electric vehicles in depth",
                },
              ]
            : []),
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
