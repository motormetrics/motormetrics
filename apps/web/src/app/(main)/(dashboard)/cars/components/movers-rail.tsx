import { Skeleton, Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { slugify } from "@motormetrics/utils/slugify";
import { resolveCarsMonth } from "@web/app/(main)/(dashboard)/cars/search-params";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import { SourceNote } from "@web/components/shared/overview";
import { getDimensionStats } from "@web/queries/cars";
import { getCarLogoMap } from "@web/queries/logos";
import { formatMonthName } from "@web/utils/dates/format-month";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";

/**
 * Makes considered for the movers list, by volume. Ranking every make by
 * percentage change would hand the list to whichever marque went from two
 * registrations to six.
 */
const CANDIDATE_POOL = 20;

/** Rows shown. */
const MOVERS_SHOWN = 5;

interface MoversProps {
  searchParams: Promise<SearchParams>;
}

/** "January to August, 2026 against 2025". */
async function MoversPeriod({ searchParams }: MoversProps) {
  const month = await resolveCarsMonth(searchParams);
  const year = Number(month.slice(0, 4));

  return `January to ${formatMonthName(month)}, ${year} against ${year - 1}`;
}

async function MoverRows({ searchParams }: MoversProps) {
  const month = await resolveCarsMonth(searchParams);
  const [makeStats, logoUrlBySlug] = await Promise.all([
    getDimensionStats("make", month),
    getCarLogoMap(),
  ]);

  const movers = makeStats
    .slice(0, CANDIDATE_POOL)
    .filter(
      (stat): stat is typeof stat & { yoyChange: number } =>
        stat.yoyChange !== null,
    )
    .sort((first, second) => second.yoyChange - first.yoyChange)
    .slice(0, MOVERS_SHOWN);

  if (movers.length === 0) {
    return (
      <Typography.Paragraph className="py-2.5" color="muted" size="sm">
        No make has a comparable period a year earlier to measure against.
      </Typography.Paragraph>
    );
  }

  return (
    <ul className="flex flex-col">
      {movers.map((mover) => {
        const slug = slugify(mover.name);

        return (
          <li key={mover.name}>
            <Link
              className="flex items-center gap-3 border-separator border-b py-2.5 text-foreground no-underline transition-colors hover:bg-surface-secondary"
              href={`/cars/makes/${slug}`}
            >
              <span className="flex min-w-0 flex-1 items-center gap-2.5">
                <MakeAvatar
                  logoUrl={logoUrlBySlug[slug] ?? null}
                  make={mover.name}
                />
                <span className="truncate font-medium text-sm">
                  {mover.name}
                </span>
              </span>
              <span className="w-24 shrink-0 text-right font-semibold text-sm tabular-nums">
                <NumberValue
                  locale="en-SG"
                  maximumFractionDigits={0}
                  value={mover.count}
                />
              </span>
              <DeltaChip
                className="w-20 shrink-0 text-right text-sm"
                value={mover.yoyChange}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * The five makes that grew most on a year earlier. The heading, column heads
 * and note are in the static shell; the period and rows follow `?month=`, so
 * each waits behind its own boundary.
 */
export function MoversRail({ searchParams }: MoversProps) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-col gap-1">
        <Typography.Heading className="text-lg" level={3} weight="bold">
          Fastest growing makes
        </Typography.Heading>
        <Typography.Paragraph color="muted" size="sm">
          <Suspense fallback={"\u00a0"}>
            <MoversPeriod searchParams={searchParams} />
          </Suspense>
        </Typography.Paragraph>
      </div>
      <div className="flex flex-col">
        <div className="flex items-end gap-3 border-border border-b pb-2 font-semibold text-muted text-xs">
          <span className="min-w-0 flex-1">Make</span>
          <span className="w-24 shrink-0 text-right">Cars</span>
          <span className="w-20 shrink-0 text-right">Change</span>
        </div>
        <Suspense
          fallback={Array.from({ length: MOVERS_SHOWN }, (_, index) => (
            <div
              className="border-separator border-b py-2.5"
              // biome-ignore lint/suspicious/noArrayIndexKey: identical placeholders
              key={index}
            >
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        >
          <MoverRows searchParams={searchParams} />
        </Suspense>
      </div>
      <SourceNote>
        Large percentages often sit on small bases a year earlier.{" "}
        <Link className="text-accent-strong" href="/cars/makes">
          All makes →
        </Link>
      </SourceNote>
    </div>
  );
}
