import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import {
  formatMonthLabel,
  formatMonthName,
} from "@web/app/(main)/(dashboard)/cars/components/format-month";
import { resolveCarsMonth } from "@web/app/(main)/(dashboard)/cars/search-params";
import {
  type CoeCategorySeries,
  CoePremiums,
} from "@web/app/(main)/(dashboard)/components/coe-premiums";
import { CostTrendChip } from "@web/app/(main)/(dashboard)/components/cost-trend-chip";
import {
  changeRatio,
  pqpMonthsFor,
  windowEndingAt,
} from "@web/app/(main)/(dashboard)/components/overview-series";
import { SectionHead } from "@web/components/shared/overview";
import { getAllCoeCategoryTrends, getPqpRates } from "@web/queries/coe";
import type { SearchParams } from "nuqs/server";

/** Bidding months drawn in the premium trend, the selected one last. */
const TREND_MONTHS = 12;

const CATEGORY_NAMES: Record<string, string> = {
  "Category A": "Cars up to 1600cc & 130bhp",
  "Category B": "Cars above 1600cc or 130bhp",
  "Category C": "Goods vehicles & buses",
  "Category D": "Motorcycles",
  "Category E": "Open category",
};

/**
 * COE premiums for the selected month with the PQP renewal rates beside them.
 *
 * The trend query is scoped to a calendar year, so the selected year and the
 * one before are merged to give a full 12-exercise run-up to any month.
 */
export async function CoeSection({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const month = await resolveCarsMonth(searchParams);
  const year = Number(month.slice(0, 4));
  const [previousYearTrends, currentYearTrends, pqpRates] = await Promise.all([
    getAllCoeCategoryTrends(year - 1),
    getAllCoeCategoryTrends(year),
    getPqpRates(),
  ]);

  const series: CoeCategorySeries[] = Object.entries(currentYearTrends)
    .map(([category, points]) => {
      const merged = [
        ...(previousYearTrends[category as keyof typeof previousYearTrends] ??
          []),
        ...points,
      ].sort((left, right) => left.month.localeCompare(right.month));

      return {
        category,
        label: category.replace("Category ", ""),
        name: CATEGORY_NAMES[category] ?? category,
        points: windowEndingAt(merged, month, TREND_MONTHS).map(
          ({ month: pointMonth, premium }) => ({ month: pointMonth, premium }),
        ),
      };
    })
    .filter((item) => item.points.length > 0);

  if (series.length === 0) {
    return null;
  }

  const latestExercise =
    series
      .map((item) => item.points.at(-1)?.month ?? "")
      .sort()
      .at(-1) ?? month;

  const pqpMonths = pqpMonthsFor(Object.keys(pqpRates), month);
  const pqpCurrent = pqpMonths ? pqpRates[pqpMonths.current] : undefined;
  const pqpPrevious = pqpMonths?.previous
    ? pqpRates[pqpMonths.previous]
    : undefined;
  const pqpRows = Object.entries(pqpCurrent ?? {})
    .filter(([, value]) => value > 0)
    .map(([category, value]) => ({
      category,
      changeRatio: changeRatio(
        value,
        pqpPrevious?.[category as keyof typeof pqpPrevious],
      ),
      letter: category.replace("Category ", ""),
      name: CATEGORY_NAMES[category] ?? category,
      value,
    }));

  return (
    <section className="flex flex-col gap-7">
      <SectionHead
        caption={`${formatMonthLabel(latestExercise)} · latest bidding exercise`}
        eyebrow="Certificate of Entitlement"
        link={{ href: "/coe/results", label: "All COE results" }}
        size="lg"
        title="COE premiums"
      />

      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1fr_360px]">
        <CoePremiums series={series} />

        {pqpMonths && pqpRows.length > 0 ? (
          <div className="flex flex-col gap-3">
            <Typography.Paragraph
              className="font-semibold text-[15px]"
              color="muted"
              size="sm"
            >
              PQP · {formatMonthName(pqpMonths.current)} renewal rates
            </Typography.Paragraph>
            <ul className="flex flex-col">
              {pqpRows.map((row) => (
                <li
                  className="flex items-center gap-3.5 border-separator border-b py-3.5"
                  key={row.category}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft font-extrabold text-[17px] text-accent-strong">
                    {row.letter}
                  </span>
                  <div className="flex min-w-0 flex-col gap-px">
                    <span className="font-extrabold text-lg tabular-nums">
                      <NumberValue
                        currency="SGD"
                        locale="en-SG"
                        maximumFractionDigits={0}
                        style="currency"
                        value={row.value}
                      />
                    </span>
                    <Typography.Paragraph
                      className="font-medium"
                      color="muted"
                      size="sm"
                      truncate
                    >
                      {row.name}
                    </Typography.Paragraph>
                  </div>
                  <div className="ml-auto shrink-0">
                    <CostTrendChip changeRatio={row.changeRatio} />
                  </div>
                </li>
              ))}
            </ul>
            <Typography.Paragraph
              className="font-medium"
              color="muted"
              size="sm"
            >
              3-month moving average of premiums · renew 5 or 10 years
            </Typography.Paragraph>
          </div>
        ) : null}
      </div>
    </section>
  );
}
