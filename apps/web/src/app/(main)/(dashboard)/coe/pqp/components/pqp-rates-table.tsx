"use client";

import { cn } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import { usePQPCategory } from "@web/app/(main)/(dashboard)/coe/pqp/components/pqp-filters";
import type { PQPCategoryKey } from "@web/app/(main)/(dashboard)/coe/pqp/search-params";
import { CostTrendChip } from "@web/components/shared/cost-trend-chip";

export interface PQPRateRow {
  key: PQPCategoryKey;
  description: string;
  /** The published PQP: the full ten-year renewal cost. */
  tenYear: number;
  latestPremium: number;
  /** Premium minus PQP, as a share of the premium; null without a premium. */
  gapRatio: number | null;
  /** Change on the previous month's rate; null for the first month. */
  changeRatio: number | null;
}

/** Shared by the header and every row, so the columns line up. */
const ROW = "flex items-center gap-3.5 px-3";
const CATEGORY_CELL = "w-28 shrink-0 max-md:min-w-0 max-md:flex-1";
const DESCRIPTION_CELL = "min-w-0 flex-1 truncate max-md:hidden";
const MONEY_CELL = "w-28 shrink-0 text-right";
const SECONDARY_CELL = "w-24 shrink-0 text-right max-md:hidden";
const GAP_CELL = "w-24 shrink-0 text-right max-xl:hidden max-md:hidden";

/** Grey signed change, or a dash where there is nothing to compare. */
function Change({ ratio }: { ratio: number | null }) {
  return ratio === null || ratio === 0 ? (
    <span className="text-muted">—</span>
  ) : (
    <CostTrendChip changeRatio={ratio} />
  );
}

/**
 * The published rate for every category, with the figures a renewal is
 * weighed against. Selecting a row selects its category for the headline and
 * the chart, the same as the switch at the top of the page.
 *
 * The columns are fixed at 10-year then 5-year cost whichever term is
 * selected, so the table reads the same way every time. On phones each row
 * folds into the category, its 10-year cost and change, with the other figures
 * on a line beneath.
 */
export function PQPRatesTable({
  categories,
  previousMonthLabel,
  rows,
}: {
  categories: readonly PQPCategoryKey[];
  /** "August", for the change column's header. */
  previousMonthLabel: string;
  rows: PQPRateRow[];
}) {
  const { category, isPending, selectCategory } = usePQPCategory(categories);

  return (
    <div className={cn("flex flex-col", isPending && "opacity-70")}>
      <div
        className={cn(
          ROW,
          "items-end border-border border-b pb-2.5 font-semibold text-muted text-xs max-md:hidden",
        )}
      >
        <span className={CATEGORY_CELL}>Category</span>
        <span className={DESCRIPTION_CELL}>Description</span>
        <span className={MONEY_CELL}>10-year cost</span>
        <span className={SECONDARY_CELL}>5-year cost</span>
        <span className={SECONDARY_CELL}>Latest premium</span>
        <span className={GAP_CELL}>Gap to premium</span>
        <span className={MONEY_CELL}>vs {previousMonthLabel}</span>
      </div>
      <span className="border-border border-b pb-2 font-semibold text-muted text-xs uppercase tracking-wide md:hidden">
        Category · 10-year cost
      </span>

      {rows.map((row) => {
        const isActive = row.key === category;
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
            <span className={cn(CATEGORY_CELL, "flex flex-col gap-0.5")}>
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
              <span className="truncate text-muted text-sm md:hidden">
                {row.description}
              </span>
            </span>
            <span className={cn(DESCRIPTION_CELL, "text-muted text-sm")}>
              {row.description}
            </span>
            <span className="flex shrink-0 flex-col items-end gap-0.5 md:contents">
              <span
                className={cn(
                  MONEY_CELL,
                  "font-semibold text-lg tabular-nums max-md:w-auto",
                )}
              >
                {formatCurrency(row.tenYear)}
              </span>
              <span
                className={cn(
                  SECONDARY_CELL,
                  "text-muted-strong text-sm tabular-nums",
                )}
              >
                {formatCurrency(row.tenYear / 2)}
              </span>
              <span
                className={cn(
                  SECONDARY_CELL,
                  "text-muted-strong text-sm tabular-nums",
                )}
              >
                {formatCurrency(row.latestPremium)}
              </span>
              <span className={cn(GAP_CELL, "text-sm tabular-nums")}>
                <Change ratio={row.gapRatio} />
              </span>
              <span
                className={cn(MONEY_CELL, "text-sm tabular-nums max-md:w-auto")}
              >
                <Change ratio={row.changeRatio} />
              </span>
            </span>
            <span className="w-full text-muted text-sm tabular-nums md:hidden">
              5-year {formatCurrency(row.tenYear / 2)} · latest premium{" "}
              {formatCurrency(row.latestPremium)}
              {row.gapRatio === null
                ? ""
                : ` · gap ${row.gapRatio < 0 ? "−" : "+"}${Math.abs(row.gapRatio * 100).toFixed(1)}%`}
            </span>
          </button>
        );
      })}
    </div>
  );
}
