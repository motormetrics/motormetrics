import { Skeleton } from "@heroui/react";
import { FuelTypeMonthPicker } from "@web/app/(main)/(dashboard)/cars/fuel-types/[type]/components/fuel-type-month-picker";
import { FuelTypeMonthSub } from "@web/app/(main)/(dashboard)/cars/fuel-types/[type]/components/fuel-type-month-sub";
import {
  type FuelTypeReportProps,
  resolveFuelType,
} from "@web/app/(main)/(dashboard)/cars/fuel-types/[type]/components/fuel-type-shared";
import { PageHead } from "@web/components/shared/page-head";
import { Suspense } from "react";

/** The page title, its month menu and the line under it. */
export async function FuelTypeHead({
  params,
  searchParams,
}: FuelTypeReportProps) {
  const { type } = await params;
  const value = await resolveFuelType(type);
  const name = value ?? "Fuel type";

  return (
    <PageHead
      controls={
        <Suspense fallback={<Skeleton className="h-8 w-36" />}>
          <FuelTypeMonthPicker searchParams={searchParams} />
        </Suspense>
      }
      eyebrow="Fuel types"
      sub={
        <Suspense fallback={<Skeleton className="h-5 w-72" />}>
          <FuelTypeMonthSub name={name} searchParams={searchParams} />
        </Suspense>
      }
      title={name}
    />
  );
}
