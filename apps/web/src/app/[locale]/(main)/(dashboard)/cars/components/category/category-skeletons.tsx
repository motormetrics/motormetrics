import { Skeleton } from "@heroui/react";
export function CategorySummaryCardSkeleton() {
  return (
    <div className="col-span-12 flex flex-col gap-4 rounded-3xl border-2 border-accent bg-white p-6 lg:col-span-4">
      <div className="flex items-center justify-between">
        <Skeleton className="size-12 rounded-2xl" />
        <Skeleton className="size-10 rounded-full" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="h-10 w-28 rounded" />
      </div>
      <Skeleton className="h-6 w-40 rounded-full" />
    </div>
  );
}

export function CategoryInsightsCardSkeleton() {
  return (
    <div className="col-span-12 flex flex-col gap-6 rounded-3xl border border-border bg-white p-6 lg:col-span-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-36 rounded" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col gap-4 rounded-2xl bg-default p-4"
          >
            <Skeleton className="size-10 rounded-xl" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-8 w-16 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CategoryTabsPanelSkeleton() {
  return (
    <div className="col-span-12">
      <div className="flex gap-4 border-border border-b pb-4">
        <Skeleton className="h-8 w-24 rounded" />
        <Skeleton className="h-8 w-20 rounded" />
        <Skeleton className="h-8 w-20 rounded" />
      </div>
      <div className="grid grid-cols-1 gap-6 pt-6 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-lg" />
        <Skeleton className="h-80 rounded-lg" />
      </div>
    </div>
  );
}
