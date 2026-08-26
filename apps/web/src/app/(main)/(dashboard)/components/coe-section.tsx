import { Skeleton } from "@heroui/react";
import { getAllCoeCategoryTrends } from "@web/queries/coe";
import { Suspense } from "react";
import { type CoeCategorySeries, CoePremiumsCard } from "./coe-premiums-card";

async function CoeSectionContent() {
  const trends = await getAllCoeCategoryTrends();

  const series: CoeCategorySeries[] = Object.entries(trends)
    .map(([category, points]) => ({
      category,
      label: category.replace("Category ", ""),
      points: points
        .slice()
        .sort((a, b) => a.month.localeCompare(b.month))
        .map(({ month, premium }) => ({ month, premium })),
    }))
    .filter((item) => item.points.length > 0);

  if (series.length === 0) {
    return null;
  }

  return <CoePremiumsCard series={series} />;
}

function CoeSectionSkeleton() {
  return (
    <div className="flex flex-col gap-6 rounded-4xl bg-surface p-8 shadow-surface">
      <div className="flex items-center gap-4">
        <Skeleton className="size-12 rounded-full" />
        <Skeleton className="h-8 w-48 rounded-lg" />
        <div className="ml-auto flex gap-2">
          {[0, 1, 2, 3, 4].map((num) => (
            <Skeleton className="size-11 rounded-full" key={num} />
          ))}
        </div>
      </div>
      <Skeleton className="h-14 w-64 rounded-lg" />
      <Skeleton className="h-[170px] w-full rounded-xl" />
    </div>
  );
}

export function CoeSection() {
  return (
    <Suspense fallback={<CoeSectionSkeleton />}>
      <CoeSectionContent />
    </Suspense>
  );
}
