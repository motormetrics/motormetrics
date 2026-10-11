import { NumberValue } from "@heroui-pro/react";
import { loadMakeRows } from "@web/app/(main)/(dashboard)/cars/makes/components/make-rows";
import {
  isFuelFilter,
  loadSearchParams,
  RANGE_LABELS,
} from "@web/app/(main)/(dashboard)/cars/makes/search-params";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";

/**
 * Makes considered for the list, by volume. The rows arrive sorted by
 * registrations, so this takes the busiest marques and ranks only those.
 *
 * Ranking all 53 on percentage alone hands the list to whichever make went
 * from one registration to nine — a true +800%, and the loudest number on a
 * page whose table withholds that very figure one column over. Matches the
 * pool the Cars overview movers rail uses.
 */
const CANDIDATE_POOL = 20;

/** Rows the comp draws. */
const MOVERS = 5;

export async function FastestGrowing({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { fuel, range } = await loadSearchParams(searchParams);
  const { latestMonth, rows } = await loadMakeRows(range, fuel);

  const movers = rows
    .slice(0, CANDIDATE_POOL)
    .filter((row) => row.yoyChange !== null)
    .sort((a, b) => (b.yoyChange ?? 0) - (a.yoyChange ?? 0))
    .slice(0, MOVERS);

  if (movers.length === 0 || !latestMonth) {
    return null;
  }

  const previousYear = Number(latestMonth.slice(0, 4)) - 1;
  const fuelSuffix = isFuelFilter(fuel) ? ` of ${fuel.toLowerCase()} cars` : "";

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <SectionHead
        caption={`${RANGE_LABELS[range]}${fuelSuffix}, against the same period in ${previousYear}`}
        eyebrow="Movers · year on year"
        title="Fastest growing"
      />

      <div className="flex flex-col">
        <div className="flex items-center gap-3 border-border border-b pb-2 font-semibold text-muted text-xs">
          <span className="min-w-0 flex-1">Make</span>
          <span className="w-20 text-right md:w-24">Registered</span>
          <span className="w-20 text-right md:w-24">Change</span>
        </div>
        {movers.map((row) => (
          <Link
            className="flex items-center gap-3 border-separator border-b py-2.5 text-foreground no-underline transition-colors hover:bg-surface-secondary"
            href={`/cars/makes/${row.slug}`}
            key={row.make}
          >
            <span className="flex min-w-0 flex-1 items-center gap-2.5">
              <MakeAvatar logoUrl={row.logoUrl} make={row.make} size="sm" />
              <span className="truncate font-medium text-sm">{row.make}</span>
            </span>
            <span className="w-20 text-right font-semibold text-sm tabular-nums md:w-24">
              <NumberValue
                locale="en-SG"
                maximumFractionDigits={0}
                value={row.count}
              />
            </span>
            <DeltaChip
              className="w-20 text-right text-sm md:w-24"
              value={row.yoyChange ?? 0}
            />
          </Link>
        ))}
      </div>

      <SourceNote>
        Large percentages often sit on small bases a year earlier.
      </SourceNote>
    </div>
  );
}
