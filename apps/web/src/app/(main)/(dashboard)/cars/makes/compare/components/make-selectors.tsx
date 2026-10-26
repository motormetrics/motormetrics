import { Skeleton } from "@heroui/react";
import { MakePicker } from "@web/app/(main)/(dashboard)/cars/makes/compare/components/make-picker";
import { makeOptions } from "@web/app/(main)/(dashboard)/cars/makes/compare/components/selection";
import { getDistinctMakes } from "@web/queries/cars/filter-options";
import { Suspense } from "react";

async function MakeSelectorsContent({
  selected,
}: {
  selected: Promise<readonly string[]>;
}) {
  const [slugs, rows] = await Promise.all([selected, getDistinctMakes()]);

  return <MakePicker makes={makeOptions(rows)} selected={slugs} />;
}

/** Stands in for `MakePicker`: two labelled selects and the Compare button. */
export function MakePickerSkeleton() {
  return (
    <div className="flex flex-wrap items-end gap-3">
      {["first", "second"].map((position) => (
        <div className="flex w-full flex-col gap-1 sm:w-56" key={position}>
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-11 w-full" />
        </div>
      ))}
      <Skeleton className="h-11 w-24" />
    </div>
  );
}

/**
 * The two make selectors, in their own Suspense so the H1 never waits on the
 * full make list.
 */
export function MakeSelectors({
  selected,
}: {
  selected: Promise<readonly string[]>;
}) {
  return (
    <Suspense fallback={<MakePickerSkeleton />}>
      <MakeSelectorsContent selected={selected} />
    </Suspense>
  );
}
