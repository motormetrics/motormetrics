import { Typography } from "@heroui/react";
import {
  CATEGORY_DESCRIPTIONS,
  toCategoryKey,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { PqpRateRow } from "@web/app/(main)/(dashboard)/coe/components/pqp-rate-row";
import {
  type CoeCategorySeries,
  CoePremiums,
} from "@web/app/(main)/(dashboard)/components/coe-premiums";
import {
  pqpMonthsFor,
  windowEndingAt,
} from "@web/app/(main)/(dashboard)/components/overview-series";
import { SectionHead } from "@web/components/shared/overview";
import { getAllCoeCategoryTrends, getPqpRates } from "@web/queries/coe";
import type { COECategory } from "@web/types";
import { changeRatio } from "@web/utils/change-ratio";
import {
  formatMonthLabel,
  formatMonthName,
} from "@web/utils/dates/format-month";
import { getLatestMonth } from "@web/utils/dates/months";

/** Bidding months drawn in the premium trend, the selected one last. */
const TREND_MONTHS = 12;

/**
 * COE premiums for the selected month with the PQP renewal rates beside them.
 *
 * The trend query is scoped to a calendar year, so the selected year and the
 * one before are merged to give a full 12-exercise run-up to any month.
 */
export async function CoeSection() {
  const month = await getLatestMonth("cars");
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
        label: toCategoryKey(category as COECategory),
        name: CATEGORY_DESCRIPTIONS[category as COECategory] ?? category,
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
      letter: toCategoryKey(category as COECategory),
      name: CATEGORY_DESCRIPTIONS[category as COECategory] ?? category,
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
                <PqpRateRow
                  changeRatio={row.changeRatio}
                  description={row.name}
                  key={row.category}
                  letter={row.letter}
                  value={row.value}
                />
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
