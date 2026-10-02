import { Tooltip } from "@heroui/react";
import {
  bidsAgainstQuota,
  formatExercise,
  groupByExercise,
  toCategory,
  toCategoryKey,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { loadCoeOverviewSearchParams } from "@web/app/(main)/(dashboard)/coe/components/search-params";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { getCoeResults } from "@web/queries/coe";
import type { SearchParams } from "nuqs/server";

const count = new Intl.NumberFormat("en-SG", { maximumFractionDigits: 0 });

function LegendKey({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className="h-2.5 w-3 rounded-[2px]"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}

/**
 * Bids against quota for the latest exercise: one zero-based scale for every
 * category, the quota span laid over the bids, so the overflow is the demand
 * the quota could not meet. The selected category takes the accent.
 */
export async function QuotaAllocation({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [{ category: categoryKey }, results] = await Promise.all([
    loadCoeOverviewSearchParams(searchParams),
    getCoeResults(),
  ]);

  const latest = groupByExercise(results).at(-1);

  if (!latest) {
    return null;
  }

  const selected = toCategory(categoryKey);
  const rows = bidsAgainstQuota(latest);

  return (
    <div className="flex flex-col gap-[18px]">
      <SectionHead
        caption={`${formatExercise(latest)} · same scale for every category`}
        eyebrow="Demand"
        title="Bids against quota"
      />

      <div className="flex gap-[18px] text-[12.5px] text-muted-strong">
        <LegendKey color="var(--chart-1)" label="Quota" />
        <LegendKey color="var(--chart-5)" label="Bids above quota" />
      </div>

      <div className="grid grid-cols-[auto_1fr_auto] gap-x-2.5 gap-y-3.5 md:gap-x-3">
        {rows.map((row) => {
          const label = `${count.format(row.bids)} / ${count.format(row.quota)}`;
          return (
            <Tooltip closeDelay={0} delay={0} key={row.category}>
              <Tooltip.Trigger
                aria-label={`${row.category}: ${label}, ${row.ratio}× bids per COE`}
                className="col-span-3 grid grid-cols-subgrid items-center rounded-[2px] outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                <span className="font-semibold text-sm">
                  {toCategoryKey(row.category)}
                </span>
                <span className="relative block h-[18px] border-separator border-l">
                  <span
                    className="absolute inset-y-0 left-0 rounded-r-[2px]"
                    style={{
                      background: "var(--chart-5)",
                      width: `${row.bidWidth}%`,
                    }}
                  />
                  <span
                    className="absolute inset-y-0 left-0 rounded-r-[2px]"
                    style={{
                      background:
                        row.category === selected
                          ? "var(--chart-1)"
                          : "var(--chart-3)",
                      width: `${row.quotaWidth}%`,
                    }}
                  />
                </span>
                <span className="whitespace-nowrap text-right text-[13px] text-muted-strong tabular-nums">
                  {label}{" "}
                  <b className="font-semibold text-foreground">{row.ratio}×</b>
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content>
                <div className="flex flex-col gap-0.5 py-0.5 text-xs tabular-nums">
                  <span className="font-semibold">{row.category}</span>
                  <span>Bids received: {count.format(row.bids)}</span>
                  <span>Quota: {count.format(row.quota)}</span>
                  <span>Above quota: {count.format(row.overflow)}</span>
                  <span>Bids per COE: {row.ratio}×</span>
                </div>
              </Tooltip.Content>
            </Tooltip>
          );
        })}
      </div>

      <SourceNote>
        Bids received / quota available, with bids per COE. Category D is
        motorcycles.
      </SourceNote>
    </div>
  );
}
