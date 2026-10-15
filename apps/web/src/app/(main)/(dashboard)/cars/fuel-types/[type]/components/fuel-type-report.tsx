import { Skeleton } from "@heroui/react";
import { FuelTypeContent } from "@web/app/(main)/(dashboard)/cars/fuel-types/[type]/components/fuel-type-content";
import { FuelTypeHead } from "@web/app/(main)/(dashboard)/cars/fuel-types/[type]/components/fuel-type-head";
import type { FuelTypeReportProps } from "@web/app/(main)/(dashboard)/cars/fuel-types/[type]/components/fuel-type-shared";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { OverviewPage } from "@web/components/shared/overview";
import { Suspense } from "react";

export function FuelTypeReport({ params, searchParams }: FuelTypeReportProps) {
  return (
    <OverviewPage className="gap-10 max-md:gap-7">
      <Suspense fallback={<FuelTypeHeadSkeleton />}>
        <FuelTypeHead params={params} searchParams={searchParams} />
      </Suspense>

      <SectionErrorBoundary title="Registration data unavailable">
        <Suspense
          fallback={
            <div className="flex flex-col gap-4">
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
          }
        >
          <FuelTypeContent params={params} searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>
    </OverviewPage>
  );
}

/** Stands in for `PageHead` while the fuel type resolves. */
function FuelTypeHeadSkeleton() {
  return (
    <div className="flex flex-wrap items-end gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-5 w-80 max-w-full" />
      </div>
      <Skeleton className="h-10 w-40 sm:ml-auto" />
    </div>
  );
}
