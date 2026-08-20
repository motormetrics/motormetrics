import { CategoryTabs } from "@web/app/(main)/(dashboard)/cars/registrations/category-tabs";
import { BonesCapture } from "@web/components/shared/bones-skeleton";
import { SkeletonCard } from "@web/components/shared/skeleton";
import { getCarsData } from "@web/queries/cars/monthly-registrations";
import { Suspense } from "react";

interface CategoryTabsSectionProps {
  month: string;
}

async function CategoryTabsContent({ month }: CategoryTabsSectionProps) {
  const cars = await getCarsData(month);

  if (!cars) {
    return null;
  }

  return (
    <BonesCapture name="category-tabs">
      <CategoryTabs cars={cars} />
    </BonesCapture>
  );
}

function CategoryTabsSkeleton() {
  return <SkeletonCard className="h-[420px] w-full" />;
}

export function CategoryTabsSection({ month }: CategoryTabsSectionProps) {
  return (
    <Suspense fallback={<CategoryTabsSkeleton />}>
      <CategoryTabsContent month={month} />
    </Suspense>
  );
}
