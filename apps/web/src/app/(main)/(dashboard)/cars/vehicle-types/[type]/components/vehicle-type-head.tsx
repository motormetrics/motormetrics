import { Skeleton } from "@heroui/react";
import {
  DEFAULT_PERIOD,
  PERIOD_LABELS,
  PERIODS,
} from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/period";
import { PeriodSegment } from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/period-segment";
import { VehicleTypeMonthPicker } from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/vehicle-type-month-picker";
import { VehicleTypePeriodSub } from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/vehicle-type-period-sub";
import {
  resolveVehicleType,
  type VehicleTypeReportProps,
} from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/vehicle-type-shared";
import { PageHead } from "@web/components/shared/page-head";
import { formatVehicleType } from "@web/utils/formatting/format-vehicle-type";
import { Suspense } from "react";

const PERIOD_OPTIONS = PERIODS.map((key) => ({
  key,
  label: PERIOD_LABELS[key],
}));

/** The page title, its period switch and month menu, and the line under it. */
export async function VehicleTypeHead({
  params,
  searchParams,
}: VehicleTypeReportProps) {
  const { type } = await params;
  const value = await resolveVehicleType(type);

  return (
    <PageHead
      controls={
        <>
          {/* nuqs reads the URL on the client, so the segment needs its own
              boundary to keep the static shell. */}
          <Suspense fallback={<Skeleton className="h-8 w-72" />}>
            <PeriodSegment
              defaultKey={DEFAULT_PERIOD}
              options={PERIOD_OPTIONS}
            />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-8 w-36" />}>
            <VehicleTypeMonthPicker searchParams={searchParams} />
          </Suspense>
        </>
      }
      eyebrow="Cars · Vehicle types"
      sub={
        <Suspense fallback={<Skeleton className="h-5 w-72" />}>
          <VehicleTypePeriodSub searchParams={searchParams} />
        </Suspense>
      }
      title={value ? formatVehicleType(value) : "Vehicle type"}
    />
  );
}
