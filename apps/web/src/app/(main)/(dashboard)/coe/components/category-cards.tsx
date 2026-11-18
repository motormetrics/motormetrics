"use client";

import { Description, Label } from "@heroui/react";
import { NumberValue, RadioButtonGroup } from "@heroui-pro/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import { useCoeOverview } from "@web/app/(main)/(dashboard)/coe/components/coe-controls";
import {
  CATEGORY_DESCRIPTIONS,
  COE_CATEGORIES,
  changeRatio,
  premiumRangeStats,
  toCategoryKey,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  type CoeOverviewData,
  categoryHistory,
  formatPercentChange,
} from "@web/app/(main)/(dashboard)/coe/components/overview-figures";
import type {
  CategoryKey,
  ExerciseRange,
} from "@web/app/(main)/(dashboard)/coe/components/search-params";
import { RangeBar } from "@web/components/shared/range-bar";

/**
 * The latest premium for every category as selectable cards: the name, what
 * the category covers, the premium, its change on the last exercise and where
 * it sits between the low and high of the exercises shown. Pressing a card
 * selects the category for the whole page, the same as the Category filter.
 *
 * On phones each card folds to one row with the premium on the right, and the
 * range bar is left out.
 */
export function CategoryCardsView({
  categoryKey,
  data,
  onSelect,
  range,
}: {
  categoryKey: CategoryKey;
  data: CoeOverviewData;
  onSelect?: (category: CategoryKey) => void;
  range: ExerciseRange;
}) {
  const history = data.history.slice(-Number(range));

  return (
    <RadioButtonGroup
      aria-label="COE category"
      className="grid-cols-1 gap-x-8 max-md:gap-y-0 md:grid-cols-2 lg:grid-cols-4"
      layout="grid"
      onChange={(value) => onSelect?.(value as CategoryKey)}
      value={categoryKey}
    >
      {COE_CATEGORIES.map((category) => {
        const premium = data.latest.results[category]?.premium ?? 0;
        const previousPremium = data.previous?.results[category]?.premium;
        const series = categoryHistory(history, category);
        const stats = premiumRangeStats(series);

        return (
          <RadioButtonGroup.Item
            // Flat cells, as on the artboard: no card, and an accent rule
            // above the selected category in place of HeroUI's ring.
            className="rounded-none border-0 border-t-2 border-t-transparent bg-transparent px-0 data-[selected=true]:border-t-accent data-[selected=true]:ring-0 max-md:border-b max-md:border-b-separator"
            key={category}
            value={toCategoryKey(category)}
          >
            <RadioButtonGroup.ItemContent className="flex w-full flex-row items-start justify-between gap-4 md:flex-col md:justify-start md:gap-2">
              <div className="flex min-w-0 flex-col gap-1">
                <Label>{category}</Label>
                <Description>{CATEGORY_DESCRIPTIONS[category]}</Description>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1 md:items-start">
                <NumberValue
                  className="font-bold text-xl tabular-nums"
                  currency="SGD"
                  locale="en-SG"
                  maximumFractionDigits={0}
                  style="currency"
                  value={premium}
                />
                <span className="text-xs tabular-nums">
                  {previousPremium
                    ? formatPercentChange(changeRatio(premium, previousPremium))
                    : "—"}
                  <span className="max-md:hidden"> on the last exercise</span>
                </span>
              </div>
              {stats ? (
                <RangeBar
                  ariaLabel={`${category} against the last ${series.length} exercises: low ${formatCurrency(stats.low.premium)}, high ${formatCurrency(stats.high.premium)}, now ${formatCurrency(premium)}.`}
                  className="w-full max-md:hidden"
                  high={stats.high.premium}
                  highLabel={formatCurrency(stats.high.premium)}
                  low={stats.low.premium}
                  lowLabel={formatCurrency(stats.low.premium)}
                  value={premium}
                  where={null}
                />
              ) : null}
            </RadioButtonGroup.ItemContent>
          </RadioButtonGroup.Item>
        );
      })}
    </RadioButtonGroup>
  );
}

/** The cards on the category and range in the URL; render inside `<Suspense>`. */
export function CategoryCardsSelected({ data }: { data: CoeOverviewData }) {
  const { category, range, selectCategory } = useCoeOverview();

  return (
    <CategoryCardsView
      categoryKey={category}
      data={data}
      onSelect={selectCategory}
      range={range}
    />
  );
}
