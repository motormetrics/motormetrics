import { Skeleton, Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { loadMakeRows } from "@web/app/(main)/(dashboard)/cars/makes/components/make-rows";
import {
  comparableChange,
  IndexPeriod,
} from "@web/app/(main)/(dashboard)/cars/makes/components/makes-index";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/makes/search-params";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { FigureCard } from "@web/components/shared/figure-card";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";

/**
 * Makes considered for the list, by volume. The rows arrive sorted by
 * registrations, so this takes the busiest marques and ranks only those.
 *
 * Ranking every make on percentage alone hands the list to whichever make
 * went from one registration to nine. Matches the pool the Cars overview
 * movers rail uses.
 */
const CANDIDATE_POOL = 20;

const MOVERS = 5;

interface MoversProps {
  searchParams: Promise<SearchParams>;
}

async function MoverRows({ searchParams }: MoversProps) {
  const { fuel, range } = await loadSearchParams(searchParams);
  const { rows } = await loadMakeRows(range, fuel);

  const movers = rows
    .slice(0, CANDIDATE_POOL)
    .map((row) => ({ ...row, change: comparableChange(row) }))
    .filter((row) => row.change !== null)
    .sort((a, b) => (b.change ?? 0) - (a.change ?? 0))
    .slice(0, MOVERS);

  if (movers.length === 0) {
    return (
      <Typography.Paragraph color="muted" size="sm">
        No make has a year-earlier figure to compare for this selection.
      </Typography.Paragraph>
    );
  }

  return (
    <ul className="flex flex-col">
      {movers.map((row) => (
        <li
          className="border-separator border-t first:border-t-0"
          key={row.slug}
        >
          <Link
            className="flex items-center gap-4 py-2 text-foreground no-underline hover:underline"
            href={`/cars/makes/${row.slug}`}
          >
            <span className="flex min-w-0 flex-1 items-center gap-2">
              <MakeAvatar logoUrl={row.logoUrl} make={row.make} size="sm" />
              <span className="truncate font-medium text-sm">{row.make}</span>
            </span>
            <span className="text-muted text-sm tabular-nums">
              <NumberValue
                locale="en-SG"
                maximumFractionDigits={0}
                value={row.count}
              />
            </span>
            <DeltaChip className="w-20 text-right" value={row.change ?? 0} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** The five makes that grew most on the same period a year earlier. */
export function FastestGrowing({ searchParams }: MoversProps) {
  return (
    <FigureCard
      description={
        <>
          <Suspense fallback={null}>
            <IndexPeriod searchParams={searchParams} />
          </Suspense>
          , against a year earlier
        </>
      }
      title="Fastest growing"
    >
      <Suspense fallback={<Skeleton className="h-56 w-full" />}>
        <MoverRows searchParams={searchParams} />
      </Suspense>
    </FigureCard>
  );
}
