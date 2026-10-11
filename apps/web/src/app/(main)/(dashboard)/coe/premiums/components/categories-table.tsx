"use client";

import { cn } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import { useCoeCategory } from "@web/app/(main)/(dashboard)/coe/components/coe-controls";
import type { CategoryKey } from "@web/app/(main)/(dashboard)/coe/components/search-params";
import { CostTrendChip } from "@web/components/shared/cost-trend-chip";

export interface PremiumsCategoryRow {
  bidsReceived: number;
  /** Change on the previous exercise; null without one. */
  changeRatio: number | null;
  description: string;
  key: CategoryKey;
  premium: number;
  quota: number;
}

/** Shared by the header and every row, so the columns line up. */
const ROW = "flex items-center gap-4 px-3";
const CATEGORY_CELL = "flex min-w-0 flex-1 items-baseline gap-3";
const PREMIUM_CELL = "w-32 shrink-0 text-right";
const CHANGE_CELL = "w-28 shrink-0 text-right max-lg:w-24";
const FIGURE_CELL = "w-20 shrink-0 text-right max-md:hidden";

/** "1.34×"; a dash when the quota is missing rather than dividing by zero. */
const bidsPerQuota = (row: PremiumsCategoryRow): string =>
  row.quota > 0 ? `${(row.bidsReceived / row.quota).toFixed(2)}×` : "—";

/**
 * Every category's result in the selected exercise. Selecting a row selects
 * its category for the headline, the chart and the history, the same as the
 * switch at the top of the page.
 *
 * On phones each row folds into the category, its premium and change, with
 * the quota, bids and ratio on a line beneath.
 */
export function PremiumsCategoryTable({
  rows,
  selected,
}: {
  rows: PremiumsCategoryRow[];
  selected: CategoryKey;
}) {
  const { isPending, selectCategory } = useCoeCategory();

  return (
    <div className={cn("flex flex-col", isPending && "opacity-70")}>
      <div
        className={cn(
          ROW,
          "items-end border-border border-b pb-2.5 font-semibold text-muted text-xs max-md:hidden",
        )}
      >
        <span className={CATEGORY_CELL}>Category</span>
        <span className={PREMIUM_CELL}>Premium</span>
        <span className={CHANGE_CELL}>vs previous</span>
        <span className={FIGURE_CELL}>Quota</span>
        <span className={FIGURE_CELL}>Bids</span>
        <span className={cn(FIGURE_CELL, "w-24")}>Bids/quota</span>
      </div>
      <span className="border-border border-b pb-2 font-semibold text-muted text-xs uppercase tracking-wide md:hidden">
        Category · premium
      </span>

      {rows.map((row) => {
        const isActive = row.key === selected;
        return (
          <button
            aria-label={`Select Category ${row.key}`}
            aria-pressed={isActive}
            className={cn(
              ROW,
              "w-full cursor-pointer border-separator border-b border-l-2 py-3 text-left transition-colors hover:bg-surface-secondary max-md:flex-wrap max-md:gap-y-1",
              isActive
                ? "border-l-accent bg-accent-soft"
                : "border-l-transparent",
            )}
            key={row.key}
            onClick={() => selectCategory(row.key)}
            type="button"
          >
            <span
              className={cn(
                CATEGORY_CELL,
                "max-md:flex-col max-md:items-start max-md:gap-0.5",
              )}
            >
              <span
                className={cn(
                  "whitespace-nowrap text-base",
                  isActive
                    ? "font-bold text-accent-strong"
                    : "font-semibold text-foreground",
                )}
              >
                Category {row.key}
              </span>
              <span className="min-w-0 truncate text-muted text-sm max-md:whitespace-normal">
                {row.description}
              </span>
            </span>
            <span className="flex shrink-0 flex-col items-end gap-0.5 md:contents">
              <span
                className={cn(
                  PREMIUM_CELL,
                  "font-semibold text-lg tabular-nums max-md:w-auto",
                )}
              >
                {formatCurrency(row.premium)}
              </span>
              <span
                className={cn(
                  CHANGE_CELL,
                  "text-sm tabular-nums max-md:w-auto",
                )}
              >
                {row.changeRatio === null || row.changeRatio === 0 ? (
                  <span className="text-muted">—</span>
                ) : (
                  <CostTrendChip changeRatio={row.changeRatio} />
                )}
              </span>
            </span>
            <span
              className={cn(
                FIGURE_CELL,
                "text-muted-strong text-sm tabular-nums",
              )}
            >
              {row.quota.toLocaleString("en-SG")}
            </span>
            <span
              className={cn(
                FIGURE_CELL,
                "text-muted-strong text-sm tabular-nums",
              )}
            >
              {row.bidsReceived.toLocaleString("en-SG")}
            </span>
            <span
              className={cn(
                FIGURE_CELL,
                "w-24 text-muted-strong text-sm tabular-nums",
              )}
            >
              {bidsPerQuota(row)}
            </span>
            <span className="w-full text-muted text-sm tabular-nums md:hidden">
              {row.quota.toLocaleString("en-SG")} quota ·{" "}
              {row.bidsReceived.toLocaleString("en-SG")} bids ·{" "}
              {bidsPerQuota(row)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
