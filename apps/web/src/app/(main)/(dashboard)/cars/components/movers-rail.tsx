import { NumberValue } from "@heroui-pro/react";
import { slugify } from "@motormetrics/utils";
import { resolveCarsMonth } from "@web/app/(main)/(dashboard)/cars/search-params";
import { DeltaChip } from "@web/components/shared/delta-chip";
import Typography from "@web/components/typography";
import { getDimensionStats } from "@web/queries/cars";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";

/**
 * Makes considered for the movers list, by volume. Ranking every make by
 * percentage change would hand the rail to whichever marque went from two
 * registrations to six.
 */
const CANDIDATE_POOL = 20;

/** Pills shown in the rail. */
const MOVERS_SHOWN = 5;

export async function MoversRail({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const month = await resolveCarsMonth(searchParams);
  const makeStats = await getDimensionStats("make", month);
  const previousYear = Number(month.slice(0, 4)) - 1;

  const movers = makeStats
    .slice(0, CANDIDATE_POOL)
    .filter((stat) => stat.yoyChange !== null)
    .sort((first, second) => (second.yoyChange ?? 0) - (first.yoyChange ?? 0))
    .slice(0, MOVERS_SHOWN);

  /* The list is sorted descending, so amber only appears in the rare month
   * where fewer than five makes grew at all. Explaining it otherwise is a
   * legend for a colour that is not on screen. */
  const hasDecline = movers.some((mover) => (mover.yoyChange ?? 0) < 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <Typography.TextSm className="font-semibold text-muted">
          Movers · year on year
        </Typography.TextSm>
        <Typography.H3 className="font-bold tracking-[-0.02em]">
          Fastest growing
        </Typography.H3>
      </div>

      {movers.length === 0 ? (
        <Typography.TextSm className="text-muted">
          No make has a comparable period in {previousYear} to measure against.
        </Typography.TextSm>
      ) : (
        <>
          <ul className="flex flex-col gap-2">
            {movers.map((mover) => (
              <li key={mover.name}>
                <Link
                  className="flex items-center gap-3.5 rounded-field bg-surface px-4 py-3.5 no-underline transition-shadow hover:shadow-surface"
                  href={`/cars/makes/${slugify(mover.name)}`}
                >
                  <span
                    aria-hidden
                    className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent/15 font-extrabold text-accent-strong text-lg"
                  >
                    {mover.name.charAt(0)}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-bold text-foreground text-lg">
                      {mover.name}
                    </span>
                    <span className="font-medium text-[13.5px] text-muted tabular-nums">
                      <NumberValue
                        locale="en-SG"
                        maximumFractionDigits={0}
                        value={mover.count}
                      />{" "}
                      registered
                    </span>
                  </span>
                  <DeltaChip className="ml-auto" value={mover.yoyChange ?? 0} />
                </Link>
              </li>
            ))}
          </ul>

          <Typography.Caption className="text-muted">
            Change against the same period in {previousYear}
            {hasDecline ? " · amber marks a decline in volume" : ""}
          </Typography.Caption>
        </>
      )}
    </div>
  );
}
