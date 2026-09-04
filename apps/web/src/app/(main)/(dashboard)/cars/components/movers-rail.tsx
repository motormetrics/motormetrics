import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { slugify } from "@motormetrics/utils";
import { buildLogoMap } from "@web/app/(main)/(dashboard)/cars/makes/components/make-rows";
import { resolveCarsMonth } from "@web/app/(main)/(dashboard)/cars/search-params";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import { SectionHead } from "@web/components/shared/overview";
import { getDimensionStats } from "@web/queries/cars";
import { getAllCarLogos } from "@web/queries/logos";
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
  const [makeStats, logoResult] = await Promise.all([
    getDimensionStats("make", month),
    getAllCarLogos(),
  ]);
  const previousYear = Number(month.slice(0, 4)) - 1;
  const logoUrlBySlug = buildLogoMap(
    "logos" in logoResult ? logoResult.logos : [],
  );

  const movers = makeStats
    .slice(0, CANDIDATE_POOL)
    .filter((stat) => stat.yoyChange !== null)
    .sort((first, second) => (second.yoyChange ?? 0) - (first.yoyChange ?? 0))
    .slice(0, MOVERS_SHOWN);

  return (
    <div className="flex flex-col gap-6">
      <SectionHead
        caption={`Against the same period in ${previousYear}`}
        eyebrow="Movers · year on year"
        link={{ href: "/cars/makes", label: "All makes" }}
        title="Fastest growing"
      />

      {movers.length === 0 ? (
        <Typography.Paragraph color="muted" size="sm">
          No make has a comparable period in {previousYear} to measure against.
        </Typography.Paragraph>
      ) : (
        <ul className="flex flex-col">
          {movers.map((mover) => {
            const slug = slugify(mover.name);

            return (
              <li key={mover.name}>
                <Link
                  className="flex items-center gap-3.5 border-separator border-b py-3.5 text-foreground no-underline transition-colors hover:bg-default"
                  href={`/cars/makes/${slug}`}
                >
                  <MakeAvatar
                    logoUrl={logoUrlBySlug[slug] ?? null}
                    make={mover.name}
                    size={40}
                  />
                  <span className="flex min-w-0 flex-col gap-px">
                    <span className="truncate font-bold text-[17px]">
                      {mover.name}
                    </span>
                    <span className="font-medium text-muted text-sm tabular-nums">
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
            );
          })}
        </ul>
      )}
    </div>
  );
}
