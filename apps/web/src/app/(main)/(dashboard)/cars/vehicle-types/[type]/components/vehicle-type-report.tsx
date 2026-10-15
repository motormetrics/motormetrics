import { Skeleton } from "@heroui/react";
import { VehicleTypeContent } from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/vehicle-type-content";
import { VehicleTypeHead } from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/vehicle-type-head";
import type { VehicleTypeReportProps } from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/vehicle-type-shared";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { OverviewPage } from "@web/components/shared/overview";
import { Suspense } from "react";

export function VehicleTypeReport({
  params,
  searchParams,
}: VehicleTypeReportProps) {
  return (
    <OverviewPage className="gap-10 max-md:gap-7">
      <Suspense fallback={<VehicleTypeHeadSkeleton />}>
        <VehicleTypeHead params={params} searchParams={searchParams} />
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
          <VehicleTypeContent params={params} searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>
    </OverviewPage>
  );
}

/** Stands in for `PageHead` while the vehicle type resolves. */
function VehicleTypeHeadSkeleton() {
  return (
    <div className="flex flex-wrap items-end gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-5 w-80 max-w-full" />
      </div>
      <Skeleton className="h-10 w-96 max-w-full sm:ml-auto" />
    </div>
  );
}
