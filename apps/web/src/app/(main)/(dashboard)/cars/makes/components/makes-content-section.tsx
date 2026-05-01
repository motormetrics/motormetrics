import type { CarLogo } from "@logos/types";
import { redis, slugify } from "@motormetrics/utils";
import { MakesDashboard } from "@web/app/(main)/(dashboard)/cars/components/makes/makes-dashboard";
import { SkeletonCard } from "@web/components/shared/skeleton";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { generateItemListSchema } from "@web/lib/metadata";
import { getPopularMakes } from "@web/queries/cars/makes/current-year-popular-makes";
import { getGroupedMakes } from "@web/queries/cars/makes/grouped-makes";
import { getMakeRegistrationStats } from "@web/queries/cars/makes/registration-stats";
import type { MakeStats, MakesSummary } from "@web/types";
import { Suspense } from "react";
import type { WebPage, WithContext } from "schema-dts";

const title = "Makes";
const description =
  "Comprehensive overview of car makes in Singapore. Explore popular brands, discover all available manufacturers, and view registration trends and market statistics.";

async function CarMakesContent() {
  const logos = await redis.get<CarLogo[]>("logos:all");
  const [{ sortedMakes, groupedMakes, letters }, popularMakes, statsArray] =
    await Promise.all([
      getGroupedMakes(),
      getPopularMakes(),
      getMakeRegistrationStats(),
    ]);

  const popular = popularMakes.map((item) => item.make);

  const makeStatsMap = statsArray.reduce<Record<string, MakeStats>>(
    (acc, { make, count, share, trend, yoyChange }) => {
      acc[make] = { count, share, trend, yoyChange };
      return acc;
    },
    {},
  );

  const totalRegistrations = statsArray.reduce(
    (sum, { count }) => sum + count,
    0,
  );
  const marketLeader = statsArray.reduce(
    (top, row) => (row.count > top.count ? row : top),
    statsArray[0] ?? { make: "", count: 0 },
  );
  const makesSummary: MakesSummary = {
    totalMakes: statsArray.length,
    totalRegistrations,
    marketLeader: marketLeader.make,
  };

  const structuredData: WithContext<WebPage> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: `${SITE_URL}/cars/makes`,
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
          ...generateItemListSchema(
            "Car Makes in Singapore",
            sortedMakes.map((make) => ({
              name: make,
              url: `${SITE_URL}/cars/makes/${slugify(make)}`,
            })),
          ),
        }}
      />
      <MakesDashboard
        sortedMakes={sortedMakes}
        groupedMakes={groupedMakes}
        letters={letters}
        popularMakes={popular}
        logos={logos}
        makeStatsMap={makeStatsMap}
        makesSummary={makesSummary}
      />
    </>
  );
}

export function MakesContentSection() {
  return (
    <Suspense fallback={<SkeletonCard className="h-[560px] w-full" />}>
      <CarMakesContent />
    </Suspense>
  );
}
