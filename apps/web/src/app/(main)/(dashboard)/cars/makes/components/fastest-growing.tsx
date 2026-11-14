import { Skeleton, Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { loadMakeRows } from "@web/app/(main)/(dashboard)/cars/makes/components/make-rows";
import {
  loadSearchParams,
  RANGE_LABELS,
} from "@web/app/(main)/(dashboard)/cars/makes/search-params";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import { SourceNote } from "@web/components/shared/overview";
import { getCarsLatestMonth } from "@web/queries/cars";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";

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

interface MoversProps {
  searchParams: Promise<SearchParams>;
}

/** "Year to date of electric cars, against the same period in 2025". */
async function MoversPeriod({ searchParams }: MoversProps) {
  const [{ fuel, range }, latestMonth] = await Promise.all([
    loadSearchParams(searchParams),
    getCarsLatestMonth(),
  ]);
  if (!latestMonth) {
    return null;
  }

  return `${RANGE_LABELS[range]}${fuel ? ` of ${fuel.toLowerCase()} cars` : ""}, against the same period in ${Number(latestMonth.slice(0, 4)) - 1}`;
}

async function MoverRows({ searchParams }: MoversProps) {
  const { fuel, range } = await loadSearchParams(searchParams);
  const { rows } = await loadMakeRows(range, fuel);

  const movers = rows
    .slice(0, CANDIDATE_POOL)
    .filter((row) => row.yoyChange !== null)
    .sort((a, b) => (b.yoyChange ?? 0) - (a.yoyChange ?? 0))
    .slice(0, MOVERS);

  if (movers.length === 0) {
    return (
      <Typography.Paragraph className="py-2.5" color="muted" size="sm">
        No make has a year-earlier figure to compare for this selection.
      </Typography.Paragraph>
    );
  }

  return movers.map((row) => (
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
  ));
}

/**
 * The five makes that grew most on a year earlier. The heading, the column
 * heads and the note are in the static shell; the period line and the rows
 * follow the period and powertrain, so each waits behind its own boundary.
 */
export function FastestGrowing({ searchParams }: MoversProps) {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Typography.Heading className="text-lg" level={3} weight="bold">
          Fastest growing
        </Typography.Heading>
        <Typography.Paragraph color="muted" size="sm">
          {/* A non-breaking space holds the line until the period arrives. */}
          <Suspense fallback={"\u00a0"}>
            <MoversPeriod searchParams={searchParams} />
          </Suspense>
        </Typography.Paragraph>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-3 border-border border-b pb-2 font-semibold text-muted text-xs">
          <span className="min-w-0 flex-1">Make</span>
          <span className="w-20 text-right md:w-24">Registered</span>
          <span className="w-20 text-right md:w-24">Change</span>
        </div>
        <Suspense
          fallback={Array.from({ length: MOVERS }, (_, index) => (
            <div
              className="border-separator border-b py-2.5"
              // biome-ignore lint/suspicious/noArrayIndexKey: identical placeholders
              key={index}
            >
              <Skeleton className="h-6 w-full" />
            </div>
          ))}
        >
          <MoverRows searchParams={searchParams} />
        </Suspense>
      </div>

      <SourceNote>
        Large percentages often sit on small bases a year earlier.
      </SourceNote>
    </div>
  );
}
