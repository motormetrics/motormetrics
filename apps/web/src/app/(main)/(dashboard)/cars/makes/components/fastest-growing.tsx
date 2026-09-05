import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import { SectionHead } from "@web/components/shared/overview";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";
import { loadSearchParams } from "../search-params";
import { loadMakeRows } from "./make-rows";

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

  return (
    <div className="flex flex-col gap-6">
      <SectionHead
        caption={`Against the same period in ${previousYear}`}
        eyebrow="Movers · year on year"
        title="Fastest growing"
      />

      <ul className="flex flex-col">
        {movers.map((row) => (
          <li key={row.make}>
            <Link
              className="flex items-center gap-3.5 border-separator border-b py-3.5 text-foreground no-underline transition-colors hover:bg-default"
              href={`/cars/makes/${row.slug}`}
            >
              <MakeAvatar logoUrl={row.logoUrl} make={row.make} size={40} />
              <div className="flex min-w-0 flex-col gap-px">
                <Typography.Paragraph
                  className="font-bold text-[17px]"
                  truncate
                >
                  {row.make}
                </Typography.Paragraph>
                <Typography.Paragraph
                  className="font-medium text-[13.5px] tabular-nums"
                  color="muted"
                  size="sm"
                >
                  <NumberValue
                    locale="en-SG"
                    maximumFractionDigits={0}
                    value={row.count}
                  />{" "}
                  registered
                </Typography.Paragraph>
              </div>
              <DeltaChip className="ml-auto" value={row.yoyChange ?? 0} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
