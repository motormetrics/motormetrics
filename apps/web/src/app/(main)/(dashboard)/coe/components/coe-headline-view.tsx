"use client";

import { cn, Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import {
  CategorySegment,
  useCoeOverview,
} from "@web/app/(main)/(dashboard)/coe/components/coe-controls";
import {
  biddingOrdinal,
  CATEGORY_DESCRIPTIONS,
  type CoeExercise,
  changeRatio,
  formatPremiumChange,
  nextExercise,
  pairedCategories,
  toCategory,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import type { CategoryKey } from "@web/app/(main)/(dashboard)/coe/components/search-params";
import { CostTrendChip } from "@web/components/shared/cost-trend-chip";
import { StatCell } from "@web/components/shared/overview";
import type { COECategory, Pqp } from "@web/types";
import { formatMonthName } from "@web/utils/dates/format-month";

/** The figures behind every tab of the headline, shaped on the server. */
export interface CoeHeadlineData {
  latest: CoeExercise;
  previous?: CoeExercise;
  /** Rates by month: only the latest two, which is all the headline reads. */
  pqpRates: Record<string, Pqp.Rates>;
}

/**
 * Each category's latest premium with its change on the previous exercise:
 * side by side for a pair from md up, stacked below it.
 */
function PremiumBlocks({
  categories,
  latest,
  previous,
  selected,
}: {
  categories: COECategory[];
  latest: CoeExercise;
  previous?: CoeExercise;
  selected?: COECategory;
}) {
  const isPaired = categories.length > 1;

  return (
    <div className={cn("grid gap-5", isPaired && "md:grid-cols-2 md:gap-6")}>
      {categories.map((shownCategory) => {
        const premium = latest.results[shownCategory]?.premium ?? 0;
        const previousPremium = previous?.results[shownCategory]?.premium;

        return (
          <div className="flex min-w-0 flex-col gap-3" key={shownCategory}>
            <Typography.Paragraph className="text-muted-strong">
              <span
                className={cn(
                  "font-semibold",
                  shownCategory === selected
                    ? "text-accent-strong"
                    : "text-foreground",
                )}
              >
                {shownCategory}
              </span>
              {` · ${CATEGORY_DESCRIPTIONS[shownCategory]}`}
            </Typography.Paragraph>
            <span
              className={cn(
                "font-extrabold text-5xl tabular-nums leading-none tracking-tight",
                !isPaired && "md:text-6xl",
              )}
            >
              <NumberValue
                currency="SGD"
                locale="en-SG"
                maximumFractionDigits={0}
                style="currency"
                value={premium}
              />
            </span>
            <Typography.Paragraph className="tabular-nums" color="muted">
              {formatPremiumChange(
                premium,
                previous && previousPremium !== undefined
                  ? { ...previous, premium: previousPremium }
                  : undefined,
              )}
            </Typography.Paragraph>
          </div>
        );
      })}
    </div>
  );
}

/**
 * The opening block of /coe: the category switch, the selected category's
 * latest premium with its change on the previous exercise (A and B together,
 * see `pairedCategories`), and a ruled grid of that exercise's figures.
 * Stacks into one column at 900px and below.
 *
 * Drawn from props alone, so the server can prerender it with the default
 * category as the fallback of `CoeHeadlineSelected`.
 */
export function CoeHeadlineView({
  categoryKey,
  latest,
  onSelectCategory,
  pqpRates,
  previous,
}: CoeHeadlineData & {
  categoryKey: CategoryKey;
  onSelectCategory?: (category: CategoryKey) => void;
}) {
  const category = toCategory(categoryKey);
  const shown = pairedCategories(category);
  const isPaired = shown.length > 1;
  const figures = latest.results[category];
  const bidsPerCoe = figures?.quota
    ? `${(figures.bidsReceived / figures.quota).toFixed(2)} bids per COE`
    : "—";

  // The `pqp` table only publishes A–D: an Open category COE cannot be
  // renewed, so Category E has no rate.
  const [pqpMonth, previousPqpMonth] = Object.keys(pqpRates).sort().reverse();
  const pqpKey = category as keyof Pqp.Rates;
  const pqpRate = pqpMonth ? pqpRates[pqpMonth]?.[pqpKey] : undefined;
  const previousPqpRate = previousPqpMonth
    ? pqpRates[previousPqpMonth]?.[pqpKey]
    : undefined;
  const pqpChange = changeRatio(pqpRate ?? 0, previousPqpRate);
  const upcoming = nextExercise(latest);
  const upcomingOrdinal = biddingOrdinal(upcoming.biddingNo);

  return (
    <div className="grid gap-5 min-[901px]:grid-cols-[1.15fr_1fr] min-[901px]:items-end min-[901px]:gap-14">
      <div className="flex min-w-0 flex-col gap-3">
        <CategorySegment onSelect={onSelectCategory} selected={categoryKey} />
        {/*
          The A and B pair is the tallest headline, so on the other tabs an
          invisible copy of it shares the grid cell and holds the height:
          switching category never moves the page below.
        */}
        <div className="grid">
          {isPaired ? null : (
            <div aria-hidden className="invisible col-start-1 row-start-1">
              <PremiumBlocks
                categories={pairedCategories("Category A")}
                latest={latest}
                previous={previous}
              />
            </div>
          )}
          <div className="col-start-1 row-start-1">
            <PremiumBlocks
              categories={shown}
              latest={latest}
              previous={previous}
              selected={category}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 border-separator border-t">
        <StatCell
          label="Quota"
          note="COEs available"
          value={
            <NumberValue
              locale="en-SG"
              maximumFractionDigits={0}
              value={figures?.quota ?? 0}
            />
          }
        />
        <StatCell
          label="Bids received"
          note={bidsPerCoe}
          value={
            <NumberValue
              locale="en-SG"
              maximumFractionDigits={0}
              value={figures?.bidsReceived ?? 0}
            />
          }
        />
        <StatCell
          label={pqpMonth ? `PQP, ${formatMonthName(pqpMonth)}` : "PQP"}
          note={
            pqpRate === undefined ? (
              `Not set for ${category}`
            ) : previousPqpMonth && pqpChange !== 0 ? (
              <>
                <CostTrendChip changeRatio={pqpChange} />
                {` vs ${formatMonthName(previousPqpMonth)}`}
              </>
            ) : (
              "Three-month moving average"
            )
          }
          value={
            pqpRate === undefined ? (
              "—"
            ) : (
              <NumberValue
                currency="SGD"
                locale="en-SG"
                maximumFractionDigits={0}
                style="currency"
                value={pqpRate}
              />
            )
          }
        />
        <StatCell
          label="Next exercise"
          note={`${upcomingOrdinal.charAt(0).toUpperCase()}${upcomingOrdinal.slice(1)} exercise · closes 16:00`}
          value={formatMonthName(upcoming.month)}
        />
      </div>
    </div>
  );
}

/** The headline for the category in the URL; render inside `<Suspense>`. */
export function CoeHeadlineSelected(props: CoeHeadlineData) {
  const { category, selectCategory } = useCoeOverview();

  return (
    <CoeHeadlineView
      {...props}
      categoryKey={category}
      onSelectCategory={selectCategory}
    />
  );
}
