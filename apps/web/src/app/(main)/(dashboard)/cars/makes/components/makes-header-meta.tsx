import { redis } from "@motormetrics/utils";
import { DashboardPageMeta } from "@web/components/dashboard-page-meta";
import { BonesFallback } from "@web/components/shared/bones-fallback";
import { BonesCapture } from "@web/components/shared/bones-skeleton";
import { MonthSelector } from "@web/components/shared/month-selector";
import { LAST_UPDATED_CARS_KEY } from "@web/config";
import { fetchMonthsForCars, getMonthOrLatest } from "@web/utils/dates/months";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { loadSearchParams } from "../search-params";

async function CarMakesHeaderMeta({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [{ month: parsedMonth }, months, lastUpdated] = await Promise.all([
    loadSearchParams(searchParamsPromise),
    fetchMonthsForCars(),
    redis.get<number>(LAST_UPDATED_CARS_KEY),
  ]);
  const { wasAdjusted } = await getMonthOrLatest(parsedMonth, "cars");

  return (
    <BonesCapture name="page-header-meta">
      <DashboardPageMeta lastUpdated={lastUpdated}>
        <MonthSelector
          months={months}
          latestMonth={months[0]}
          wasAdjusted={wasAdjusted}
        />
      </DashboardPageMeta>
    </BonesCapture>
  );
}

export function MakesHeaderMeta({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <Suspense fallback={<BonesFallback name="page-header-meta" />}>
      <CarMakesHeaderMeta searchParams={searchParams} />
    </Suspense>
  );
}
