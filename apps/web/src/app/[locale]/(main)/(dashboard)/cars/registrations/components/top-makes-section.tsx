import { TopMakes } from "@web/app/[locale]/(main)/(dashboard)/cars/registrations/components/top-makes";
import { SkeletonCard } from "@web/components/shared/skeleton";
import { getTopMakesByFuelType } from "@web/queries/cars/market-insights";
import { Suspense } from "react";

interface TopMakesFuelSectionProps {
  month: string;
}

async function TopMakesFuelContent({ month }: TopMakesFuelSectionProps) {
  const topMakes = await getTopMakesByFuelType(month);

  return <TopMakes data={topMakes} />;
}

function TopMakesFuelSkeleton() {
  return <SkeletonCard className="h-[320px] w-full" />;
}

export function TopMakesFuelSection({ month }: TopMakesFuelSectionProps) {
  return (
    <Suspense fallback={<TopMakesFuelSkeleton />}>
      <TopMakesFuelContent month={month} />
    </Suspense>
  );
}
