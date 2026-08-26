import { NumberValue } from "@heroui-pro/react";
import { HeroCard } from "@web/components/shared/bento";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { sparkline } from "@web/components/shared/sparkline";
import Typography from "@web/components/typography";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";
import { loadSearchParams, RANGE_LABELS } from "../search-params";
import { MakeAvatar } from "./make-avatar";
import { loadMakeRows } from "./make-rows";

export async function LeadingMakeCard({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { fuel, range } = await loadSearchParams(searchParams);
  const { rows } = await loadMakeRows(range, fuel);
  const leader = rows[0];

  if (!leader) {
    return null;
  }

  const spark = sparkline(leader.trend, 380, 90);

  return (
    <HeroCard>
      <span className="w-fit rounded-full bg-[var(--accent-foreground)]/20 px-4 py-2 font-bold text-sm">
        Leading make · {RANGE_LABELS[range]}
      </span>

      <div className="mt-2 flex items-center gap-3.5">
        <MakeAvatar logoUrl={leader.logoUrl} make={leader.make} size={56} />
        <span className="font-bold text-[1.6875rem] text-[var(--accent-foreground)]/90 tracking-[-0.02em]">
          {leader.make}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <span className="font-extrabold text-6xl tabular-nums tracking-[-0.03em]">
          <NumberValue
            locale="en-SG"
            maximumFractionDigits={0}
            value={leader.count}
          />
        </span>
        {leader.yoyChange === null ? null : (
          <DeltaChip ratio={leader.yoyChange / 100} tone="inverse" />
        )}
      </div>

      <Typography.TextSm className="font-semibold text-[var(--accent-foreground)]/85 text-lg">
        registrations · {leader.share.toFixed(1)}% of the market
      </Typography.TextSm>

      {spark ? (
        <svg
          className="mt-1.5 h-[90px] w-full overflow-visible"
          role="img"
          viewBox="0 0 380 90"
        >
          <title>{`${leader.make} registrations over the last ${leader.trend.length} months`}</title>
          <path d={spark.area} fill="currentColor" opacity={0.16} />
          <path
            d={spark.line}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3.5}
          />
          <circle
            cx={spark.lastX}
            cy={spark.lastY}
            fill="var(--accent)"
            r={6}
            stroke="currentColor"
            strokeWidth={3.5}
          />
        </svg>
      ) : null}

      <Link
        className="mt-3 flex items-center gap-3.5 rounded-[var(--radius)] bg-[var(--ink-surface)]/70 px-5 py-4 no-underline transition-[filter] hover:brightness-110"
        href={`/cars/makes/${leader.slug}`}
      >
        <span className="flex flex-col gap-0.5">
          <span className="font-bold text-[var(--accent-foreground)] text-xl">
            Open {leader.make}
          </span>
          <span className="font-medium text-[var(--accent-foreground)]/70 text-sm">
            Models, fuel mix and monthly trend
          </span>
        </span>
        <span className="ml-auto flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-deep)]">
          <ArrowUpRight className="size-5" />
        </span>
      </Link>
    </HeroCard>
  );
}
