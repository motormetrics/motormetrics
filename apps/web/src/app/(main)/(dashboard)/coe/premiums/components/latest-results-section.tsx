import { Text } from "@heroui/react";
import { LatestCoePremium } from "@web/components/coe/latest-coe-premium";
import { GridSkeleton, SectionSkeleton } from "@web/components/shared/skeleton";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import {
  generateBreadcrumbSchema,
  generateDatasetSchema,
} from "@web/lib/metadata";
import {
  getAllCoeCategoryTrends,
  getLatestAndPreviousCoeResults,
} from "@web/queries/coe";
import { Suspense } from "react";
import type { WebPage, WithContext } from "schema-dts";

const title = "COE Overview";
const description =
  "Certificate of Entitlement (COE) analysis hub for Singapore vehicle registration. View latest premiums, trends, and category-specific insights.";

async function LatestResultsContent() {
  const [{ latest: latestResults }, coeTrends] = await Promise.all([
    getLatestAndPreviousCoeResults(),
    getAllCoeCategoryTrends(),
  ]);

  const structuredData: WithContext<WebPage> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: `${SITE_URL}/coe/premiums`,
    publisher: {
      "@type": "Organization",
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
          ...generateDatasetSchema("coe-premiums"),
        }}
      />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "COE", path: "/coe" },
            { name: "Premiums", path: "/coe/premiums" },
          ]),
        }}
      />
      <div className="flex flex-col gap-4">
        <Text type="h2">Latest COE Results</Text>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <LatestCoePremium results={latestResults} trends={coeTrends} />
        </div>
      </div>
    </>
  );
}

function LatestResultsSkeleton() {
  return (
    <SectionSkeleton>
      <GridSkeleton
        count={5}
        columns="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      />
    </SectionSkeleton>
  );
}

export function LatestResultsSection() {
  return (
    <Suspense fallback={<LatestResultsSkeleton />}>
      <LatestResultsContent />
    </Suspense>
  );
}
