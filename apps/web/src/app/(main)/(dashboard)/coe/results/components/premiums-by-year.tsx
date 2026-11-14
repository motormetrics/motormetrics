import { cn } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  COE_CATEGORIES,
  groupByExercise,
  summariseByYear,
  summariseYears,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { CategoryHeader } from "@web/app/(main)/(dashboard)/coe/results/components/category-header";
import {
  EXERCISE_CELL,
  EXERCISE_ROW,
  PHONE_HIDDEN,
  YEAR_CELL,
  YEAR_LABEL,
} from "@web/app/(main)/(dashboard)/coe/results/components/results-shared";
import { ShowMoreRows } from "@web/app/(main)/(dashboard)/coe/results/components/show-more-rows";
import { SectionHead } from "@web/components/shared/overview";
import { getCoeResults } from "@web/queries/coe";

/**
 * One row per calendar year across the whole dataset, newest first: the mean
 * closing premium and the year's high, captioned with a recap of Cat A and B
 * against the year before. It reads every result rather than the
 * selected period and takes no search params, so it prerenders into the
 * static shell.
 */
export async function PremiumsByYear() {
  const years = summariseByYear(groupByExercise(await getCoeResults()));
  const newest = years[0]?.year;
  const oldest = years.at(-1)?.year;
  const shown = 6;
  const summary = summariseYears(years);

  const rows = years.map(({ year, categories }) => (
    <li className={EXERCISE_ROW} key={year}>
      <span
        className={cn(
          "min-w-0 flex-1 font-semibold text-sm tabular-nums",
          YEAR_LABEL,
        )}
      >
        {year}
      </span>
      {COE_CATEGORIES.map((category) => {
        const figures = categories[category];
        return (
          <span
            className={cn(
              EXERCISE_CELL,
              YEAR_CELL,
              PHONE_HIDDEN.includes(category) && "max-md:hidden",
            )}
            key={category}
          >
            <span className="font-semibold text-base tabular-nums max-md:text-sm">
              {figures ? formatCurrency(figures.average) : "—"}
            </span>
            <span className="whitespace-nowrap text-muted text-xs tabular-nums">
              {figures ? `high ${formatCurrency(figures.high)}` : "—"}
            </span>
          </span>
        );
      })}
    </li>
  ));

  return (
    <>
      <SectionHead
        caption={summary}
        eyebrow="Figure 3 · By year"
        title="Average closing premium"
      />
      <ShowMoreRows
        header={<CategoryHeader isYear label="Year" />}
        initial={shown}
        lessLabel={`Show ${years[shown - 1]?.year} to ${newest}`}
        moreLabel={`Show every year since ${oldest}`}
        noun="years"
        rows={rows}
      >
        Mean of each year's exercises, with the year's high; {newest} is year to
        date. No exercises were held from April to June 2020, so 2020 averages
        18 exercises.
      </ShowMoreRows>
    </>
  );
}
