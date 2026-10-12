import { cn } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import {
  CATEGORY_DESCRIPTIONS,
  formatExercise,
  toCategoryKey,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { CoePremiumSparkline } from "@web/app/(main)/(dashboard)/components/coe-premium-sparkline";
import { windowEndingAt } from "@web/app/(main)/(dashboard)/components/overview-series";
import { CostTrendChip } from "@web/components/shared/cost-trend-chip";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { getAllCoeCategoryTrends } from "@web/queries/coe";
import type { COECategory } from "@web/types";
import { changeRatio } from "@web/utils/change-ratio";
import {
  formatMonthLabel,
  formatMonthShortName,
} from "@web/utils/dates/format-month";
import { getLatestMonth } from "@web/utils/dates/months";

const TREND_MONTHS = 12;

/**
 * Category, premium, change and trend, shared by the header and every row so
 * the columns line up. The trend drops out below xl.
 */
const ROW = "flex items-center gap-4 max-md:gap-2.5";
const CATEGORY_CELL = "min-w-0 flex-1";
const PREMIUM_CELL = "w-28 shrink-0 text-right max-md:w-24";
const CHANGE_CELL = "w-20 shrink-0 text-right max-md:w-14";
const TREND_CELL = "w-36 shrink-0 max-xl:hidden";

/**
 * Every COE category at a glance: the latest premium, its change on the
 * previous month and a 12-month trend. Change is grey, never coloured.
 */
export async function CoePremiumTable() {
  const [month, trends] = await Promise.all([
    getLatestMonth("cars"),
    getAllCoeCategoryTrends(),
  ]);

  const rows = Object.entries(trends).flatMap(([category, points]) => {
    const series = windowEndingAt(points, month, TREND_MONTHS);
    const latest = series.at(-1);
    if (!latest) {
      return [];
    }
    const previous = series.at(-2);
    return [
      {
        category: category as COECategory,
        changeRatio: changeRatio(latest.premium, previous?.premium),
        latest,
        previous,
        series,
      },
    ];
  });

  const exercise = rows[0]?.latest;
  if (!exercise) {
    return null;
  }
  const previousMonth = rows[0]?.previous?.month;

  return (
    <section className="flex min-w-0 flex-col gap-4">
      <SectionHead
        caption={formatExercise(exercise)}
        eyebrow="Certificate of Entitlement"
        link={{ href: "/coe", label: "All COE results" }}
        title="COE premiums"
      />

      <div className="flex flex-col">
        <div
          className={cn(
            ROW,
            "border-border border-b pb-2 font-semibold text-muted text-xs",
          )}
        >
          <span className={CATEGORY_CELL}>Category</span>
          <span className={PREMIUM_CELL}>Premium</span>
          <span className={CHANGE_CELL}>
            {previousMonth ? `vs ${formatMonthShortName(previousMonth)}` : ""}
          </span>
          <span className={cn(TREND_CELL, "text-right")}>
            Last {TREND_MONTHS} months
          </span>
        </div>
        <ul className="flex flex-col">
          {rows.map((row) => (
            <li
              className={cn(ROW, "border-separator border-b py-3")}
              key={row.category}
            >
              <span
                className={cn(CATEGORY_CELL, "flex items-baseline gap-2.5")}
              >
                <b className="whitespace-nowrap font-semibold text-sm">
                  Cat {toCategoryKey(row.category)}
                </b>
                <span className="truncate text-muted text-sm">
                  {CATEGORY_DESCRIPTIONS[row.category]}
                </span>
              </span>
              <span
                className={cn(
                  PREMIUM_CELL,
                  "font-semibold text-base tabular-nums",
                )}
              >
                <NumberValue
                  currency="SGD"
                  locale="en-SG"
                  maximumFractionDigits={0}
                  style="currency"
                  value={row.latest.premium}
                />
              </span>
              {/* Wrapped: the chip renders nothing for no change, which would
                  pull the trend into this column. */}
              <span className={cn(CHANGE_CELL, "text-sm")}>
                <CostTrendChip changeRatio={row.changeRatio} />
              </span>
              <CoePremiumSparkline
                category={row.category}
                className={TREND_CELL}
                data={row.series.map((point) => ({
                  label: formatMonthLabel(point.month),
                  value: point.premium,
                }))}
              />
            </li>
          ))}
        </ul>
      </div>

      <SourceNote>
        Quota premium at the close of each month&apos;s latest exercise.
      </SourceNote>
    </section>
  );
}
