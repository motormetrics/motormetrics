import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { slugify } from "@motormetrics/utils/slugify";
import { resolveCarsMonth } from "@web/app/(main)/(dashboard)/cars/search-params";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import { SectionHead } from "@web/components/shared/overview";
import { getDimensionStats } from "@web/queries/cars";
import { getCarLogoMap } from "@web/queries/logos";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";

/**
 * Makes considered for the movers list, by volume. Ranking every make by
 * percentage change would hand the list to whichever marque went from two
 * registrations to six.
 */
const CANDIDATE_POOL = 20;

/** Rows shown. */
const MOVERS_SHOWN = 5;

export async function MoversRail({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const month = await resolveCarsMonth(searchParams);
  const [makeStats, logoUrlBySlug] = await Promise.all([
    getDimensionStats("make", month),
    getCarLogoMap(),
  ]);
  const previousYear = Number(month.slice(0, 4)) - 1;

  const movers = makeStats
    .slice(0, CANDIDATE_POOL)
    .filter(
      (stat): stat is typeof stat & { yoyChange: number } =>
        stat.yoyChange !== null,
    )
    .sort((first, second) => second.yoyChange - first.yoyChange)
    .slice(0, MOVERS_SHOWN);

  return (
    <div className="flex flex-col gap-4">
      <SectionHead
        caption={`Against the same period in ${previousYear}`}
        eyebrow="Movers · year on year"
        link={{ href: "/cars/makes", label: "All makes" }}
        title="Fastest growing makes"
      />

      {movers.length === 0 ? (
        <Typography.Paragraph color="muted" size="sm">
          No make has a comparable period in {previousYear} to measure against.
        </Typography.Paragraph>
      ) : (
        <div className="flex flex-col">
          <div className="flex items-end gap-3 border-border border-b pb-2 font-semibold text-muted text-xs">
            <span className="min-w-0 flex-1">Make</span>
            <span className="w-24 shrink-0 text-right">Cars</span>
            <span className="w-20 shrink-0 text-right">Change</span>
          </div>
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
                    <span className="w-20 shrink-0 text-right text-muted-strong text-sm tabular-nums">
                      {mover.yoyChange < 0 ? "−" : "+"}
                      {Math.abs(mover.yoyChange).toFixed(1)}%
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
