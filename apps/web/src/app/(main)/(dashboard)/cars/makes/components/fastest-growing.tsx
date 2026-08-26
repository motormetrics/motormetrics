import { NumberValue } from "@heroui-pro/react";
import Typography from "@web/components/typography";
import { DeltaChip } from "@web/components/v2/delta-chip";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";
import { loadSearchParams } from "../search-params";
import { MakeAvatar } from "./make-avatar";
import { loadMakeRows } from "./make-rows";

/**
 * Makes considered for the rail, by volume. The rows arrive sorted by
 * registrations, so this takes the busiest marques and ranks only those.
 *
 * Ranking all 53 on percentage alone hands the rail to whichever make went
 * from one registration to nine — a true +800%, and the loudest number on a
 * page whose table withholds that very figure one column over. Matches the
 * pool the Cars overview movers rail uses.
 */
const CANDIDATE_POOL = 20;

/** Pills the comp fits in the rail before the dark panel. */
const MOVERS = 5;

export async function FastestGrowing({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { fuel, range } = await loadSearchParams(searchParams);
  const { rows } = await loadMakeRows(range, fuel);

  const movers = rows
    .slice(0, CANDIDATE_POOL)
    .filter((row) => row.yoyChange !== null)
    .sort((a, b) => (b.yoyChange ?? 0) - (a.yoyChange ?? 0))
    .slice(0, MOVERS);

  if (movers.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <Typography.TextSm className="font-semibold text-[var(--muted)] text-base">
          Movers · year on year
        </Typography.TextSm>
        <Typography.H3 className="font-bold tracking-[-0.02em]">
          Fastest growing
        </Typography.H3>
      </div>

      <div className="flex flex-col gap-2">
        {movers.map((row) => (
          <Link
            className="flex items-center gap-3.5 rounded-[var(--radius)] bg-surface px-4 py-3.5 no-underline transition-shadow hover:shadow-surface"
            href={`/cars/makes/${row.slug}`}
            key={row.make}
          >
            <MakeAvatar logoUrl={row.logoUrl} make={row.make} size={46} />
            <span className="flex min-w-0 flex-col gap-px">
              <span className="truncate font-bold text-[17px] text-foreground">
                {row.make}
              </span>
              <span className="font-medium text-[13.5px] text-[var(--muted)] tabular-nums">
                <NumberValue
                  locale="en-SG"
                  maximumFractionDigits={0}
                  value={row.count}
                />{" "}
                registered
              </span>
            </span>
            <DeltaChip className="ml-auto" ratio={(row.yoyChange ?? 0) / 100} />
          </Link>
        ))}
      </div>
    </div>
  );
}
