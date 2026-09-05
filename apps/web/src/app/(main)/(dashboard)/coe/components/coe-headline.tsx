import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { CategoryTabs } from "@web/app/(main)/(dashboard)/coe/components/coe-controls";
import {
  biddingOrdinal,
  CATEGORY_DESCRIPTIONS,
  changeRatio,
  formatMonth,
  groupByExercise,
  toCategory,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { loadCoeOverviewSearchParams } from "@web/app/(main)/(dashboard)/coe/components/search-params";
import { CostTrendChip } from "@web/app/(main)/(dashboard)/components/cost-trend-chip";
import { Headline } from "@web/components/shared/overview";
import { SparklineChart } from "@web/components/shared/sparkline-chart";
import { getCoeResults } from "@web/queries/coe";
import type { SearchParams } from "nuqs/server";

/**
 * The left half of the opening grid: the category circles, the selected
 * category's latest premium and its sparkline over the selected range.
 */
export async function CoeHeadline({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [{ category: categoryKey, range }, results] = await Promise.all([
    loadCoeOverviewSearchParams(searchParams),
    getCoeResults(),
  ]);

  const exercises = groupByExercise(results);
  const latest = exercises.at(-1);
  const previous = exercises.at(-2);

  if (!latest) {
    return null;
  }

  const category = toCategory(categoryKey);
  const premium = latest.results[category]?.premium ?? 0;
  const previousPremium = previous?.results[category]?.premium ?? 0;

  const visible = exercises.slice(-Number(range));
  const premiums = visible.map(
    (exercise) => exercise.results[category]?.premium ?? 0,
  );

  const comparison = previous
    ? `vs ${biddingOrdinal(previous.biddingNo)} bidding${
        previous.month === latest.month
          ? ""
          : `, ${formatMonth(previous.month, "short")}`
      }`
    : "no earlier exercise";

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center gap-2">
        <CategoryTabs selected={categoryKey} />
        <Typography.Paragraph
          className="font-semibold text-[15px] sm:pl-2"
          color="muted"
          size="sm"
        >
          {category} · {CATEGORY_DESCRIPTIONS[category]}
        </Typography.Paragraph>
      </div>

      <Headline
        caption={`${category} quota premium · ${comparison}`}
        delta={
          <CostTrendChip changeRatio={changeRatio(premium, previousPremium)} />
        }
        value={
          <NumberValue
            currency="SGD"
            locale="en-SG"
            maximumFractionDigits={0}
            style="currency"
            value={premium}
          />
        }
      />

      <SparklineChart
        title={`${category} premiums over the last ${visible.length} bidding exercises`}
        values={premiums}
      />
    </div>
  );
}
