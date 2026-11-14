import { slugify } from "@motormetrics/utils/slugify";
import { ConcentrationCard } from "@web/app/(main)/(dashboard)/cars/makes/components/concentration-card";
import { ElectricOnlyMakes } from "@web/app/(main)/(dashboard)/cars/makes/components/electric-only-makes";
import { FastestGrowing } from "@web/app/(main)/(dashboard)/cars/makes/components/fastest-growing";
import { MakesIndex } from "@web/app/(main)/(dashboard)/cars/makes/components/makes-index";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import {
  Hairline,
  OverviewGrid,
  SectionHead,
} from "@web/components/shared/overview";
import { StructuredData } from "@web/components/structured-data";
import { SITE_URL } from "@web/config";
import { generateItemListSchema } from "@web/lib/metadata";
import { getDistinctMakes } from "@web/queries/cars/filter-options";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";

async function MakesItemList() {
  const makes = await getDistinctMakes();

  return (
    <StructuredData
      data={{
        "@context": "https://schema.org",
        ...generateItemListSchema(
          "Car Makes in Singapore",
          makes.map(({ make }) => ({
            name: make,
            url: `${SITE_URL}/cars/makes/${slugify(make)}`,
          })),
        ),
      }}
    />
  );
}

/**
 * Every make as a plain link. The index above only shows makes with
 * registrations in the selected period, so this keeps a link in the HTML to
 * the pages of makes no longer sold.
 */
async function MakesDirectory() {
  const makes = await getDistinctMakes();

  return (
    <section className="flex flex-col gap-4">
      <SectionHead
        caption={`${makes.length} makes`}
        eyebrow="Directory"
        title="Every make, A to Z"
      />
      <ul className="flex flex-wrap gap-x-5 gap-y-2">
        {makes.map(({ make }) => (
          <li key={make}>
            <Link
              className="font-medium text-muted text-sm transition-colors hover:text-accent"
              href={`/cars/makes/${slugify(make)}`}
            >
              {make}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Everything under the page head. No section is wrapped whole in a Suspense
 * boundary: the ones that read only cached data are part of the static shell,
 * and the ones that follow the search params keep their headings in the shell
 * and hold their own boundaries around the parts that wait.
 */
export function MakesContentSection({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <>
      <MakesItemList />

      <SectionErrorBoundary title="Makes index unavailable">
        <MakesIndex searchParams={searchParams} />
      </SectionErrorBoundary>

      <Hairline />

      <SectionErrorBoundary title="Market concentration unavailable">
        <ConcentrationCard searchParams={searchParams} />
      </SectionErrorBoundary>

      <Hairline />

      <section className="flex flex-col gap-6">
        <SectionHead
          eyebrow="Movers and electric vehicles"
          title="Fastest growing, and electric-only makes"
        />
        <OverviewGrid>
          <SectionErrorBoundary title="Movers unavailable">
            <FastestGrowing searchParams={searchParams} />
          </SectionErrorBoundary>
          <SectionErrorBoundary title="Electric-only makes unavailable">
            <ElectricOnlyMakes />
          </SectionErrorBoundary>
        </OverviewGrid>
      </section>

      <Hairline />

      <SectionErrorBoundary title="Makes directory unavailable">
        <MakesDirectory />
      </SectionErrorBoundary>
    </>
  );
}
