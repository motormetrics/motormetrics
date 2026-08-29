import { formatCurrency } from "@motormetrics/utils";
import {
  biddingOrdinal,
  CATEGORY_DESCRIPTIONS,
  COE_CATEGORIES,
  type CoeExercise,
  changeRatio,
  formatExerciseTick,
  formatMonth,
  groupByExercise,
  toCategoryKey,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { CategoryBadge } from "@web/app/(main)/(dashboard)/coe/premiums/components/category-badge";
import { PremiumDelta } from "@web/app/(main)/(dashboard)/coe/premiums/components/premium-delta";
import { ResultsChart } from "@web/app/(main)/(dashboard)/coe/results/components/results-chart";
import { SeriesFilter } from "@web/app/(main)/(dashboard)/coe/results/components/series-filter";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/coe/search-params";
import {
  ReportFilterBar,
  ReportHeadline,
  ReportSection,
  ReportStat,
} from "@web/components/shared/report";
import {
  Count,
  ReportCell,
  ReportRow,
  ReportTable,
  ShareBar,
} from "@web/components/shared/report-table";
import Typography from "@web/components/typography";
import { getCoeResultsByPeriod } from "@web/queries/coe";
import type { COECategory } from "@web/types";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";

/** The three categories the comp calls out beside the headline. */
const HIGHLIGHT_CATEGORIES: COECategory[] = [
  "Category A",
  "Category B",
  "Category E",
];

const premiumOf = (exercise: CoeExercise, category: COECategory) =>
  exercise.results[category]?.premium;

/** "−1.2% on the previous exercise", or a note that there is no baseline. */
function movementNote(current: number, previous?: number): string {
  if (!previous) {
    return "no earlier exercise";
  }

  const percent = changeRatio(current, previous) * 100;
  const sign = percent > 0 ? "+" : percent < 0 ? "−" : "";

  return `${sign}${Math.abs(percent).toFixed(1)}% on the previous exercise`;
}

function successRate(bidsSuccess: number, bidsReceived: number): number {
  return bidsReceived > 0 ? (bidsSuccess / bidsReceived) * 100 : 0;
}

/** Sum one figure across every category in an exercise. */
function totalFor(
  exercise: CoeExercise,
  figure: "bidsReceived" | "bidsSuccess" | "quota",
): number {
  return COE_CATEGORIES.reduce(
    (total, category) => total + (exercise.results[category]?.[figure] ?? 0),
    0,
  );
}

export async function ResultsReport({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { categories: selected, period } = await loadSearchParams(searchParams);
  const exercises = groupByExercise(await getCoeResultsByPeriod(period));

  const latest = exercises.at(-1);
  const previous = exercises.at(-2);

  if (!latest) {
    return null;
  }

  const plotted = COE_CATEGORIES.filter((category) =>
    selected.includes(category),
  );

  const chartData = exercises.map((exercise) => {
    const point: Record<string, number | string> = {
      label: formatExerciseTick(exercise),
    };

    for (const category of plotted) {
      point[category] = premiumOf(exercise, category) ?? 0;
    }

    return point;
  });

  const totalQuota = totalFor(latest, "quota");
  const totalBids = totalFor(latest, "bidsReceived");
  const bidsPerQuota = totalQuota > 0 ? totalBids / totalQuota : 0;

  const tableRows = exercises
    .map((exercise, index) => ({ exercise, previous: exercises[index - 1] }))
    .reverse();

  return (
    <>
      <ReportFilterBar
        label="Series"
        trailing={
          <Typography.TextSm>
            Tap a category to add or remove it from the chart
          </Typography.TextSm>
        }
      >
        <SeriesFilter />
      </ReportFilterBar>

      <ReportHeadline
        delta={
          <span className="inline-flex items-center whitespace-nowrap rounded-full bg-accent-soft-2 px-4 py-2 font-bold text-accent-strong text-sm">
            bids per quota
          </span>
        }
        label={`Latest exercise · ${formatMonth(latest.month)} · ${biddingOrdinal(latest.biddingNo)} bidding`}
        stats={
          <>
            {HIGHLIGHT_CATEGORIES.map((category) => {
              const premium = premiumOf(latest, category) ?? 0;
              return (
                <ReportStat
                  key={category}
                  label={`${category} premium`}
                  note={movementNote(
                    premium,
                    previous && premiumOf(previous, category),
                  )}
                  value={formatCurrency(premium)}
                />
              );
            })}
            <ReportStat
              label="Quota"
              note="this exercise"
              value={<Count value={totalQuota} />}
            />
          </>
        }
        sub={`${totalBids.toLocaleString("en-SG")} bids against a quota of ${totalQuota.toLocaleString("en-SG")} across all five categories`}
        value={`${bidsPerQuota.toFixed(2)}×`}
      />

      <div className="flex flex-col gap-3.5">
        <ResultsChart categories={plotted} data={chartData} />
        <Typography.TextSm>
          Category D premiums sit an order of magnitude below the car categories
          — add it to the chart and the other lines flatten.
        </Typography.TextSm>
      </div>

      <ReportSection
        caption="Closing premium per category · most recent first"
        title="Results by exercise"
      >
        <ReportTable
          columns={[
            { label: "Exercise" },
            ...COE_CATEGORIES.map((category) => ({
              align: "end" as const,
              label: `Cat ${toCategoryKey(category)}`,
            })),
            { align: "end" as const, label: "Total bids" },
          ]}
        >
          {tableRows.map(({ exercise, previous: earlier }) => (
            <ReportRow
              isActive={exercise.key === latest.key}
              key={exercise.key}
            >
              <ReportCell>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-base">
                    {formatMonth(exercise.month)}
                  </span>
                  <span className="font-medium text-muted text-xs">
                    {biddingOrdinal(exercise.biddingNo)} bidding exercise
                  </span>
                </div>
              </ReportCell>
              {COE_CATEGORIES.map((category) => {
                const premium = premiumOf(exercise, category);
                const earlierPremium = earlier && premiumOf(earlier, category);

                return (
                  <ReportCell align="end" key={category}>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="font-extrabold text-base">
                        {premium === undefined ? "—" : formatCurrency(premium)}
                      </span>
                      <PremiumDelta
                        className="text-xs"
                        ratio={
                          premium !== undefined && earlierPremium
                            ? changeRatio(premium, earlierPremium)
                            : null
                        }
                      />
                    </div>
                  </ReportCell>
                );
              })}
              <ReportCell align="end" className="font-semibold text-muted">
                <Count value={totalFor(exercise, "bidsReceived")} />
              </ReportCell>
            </ReportRow>
          ))}
        </ReportTable>
      </ReportSection>

      <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_380px]">
        <ReportSection
          caption={`${formatMonth(latest.month)} · ${biddingOrdinal(latest.biddingNo)} bidding exercise`}
          title="Quota and demand"
        >
          <ReportTable
            columns={[
              { label: "Cat", width: "64px" },
              { label: "Description" },
              { align: "end", label: "Quota" },
              { align: "end", label: "Bids" },
              { label: "Success rate", width: "200px" },
            ]}
          >
            {COE_CATEGORIES.map((category) => {
              const figures = latest.results[category];
              const rate = successRate(
                figures?.bidsSuccess ?? 0,
                figures?.bidsReceived ?? 0,
              );

              return (
                <ReportRow key={category}>
                  <ReportCell>
                    <CategoryBadge categoryKey={toCategoryKey(category)} />
                  </ReportCell>
                  <ReportCell className="font-semibold text-base">
                    {CATEGORY_DESCRIPTIONS[category]}
                  </ReportCell>
                  <ReportCell align="end" className="font-extrabold text-base">
                    <Count value={figures?.quota ?? 0} />
                  </ReportCell>
                  <ReportCell align="end" className="font-semibold text-muted">
                    <Count value={figures?.bidsReceived ?? 0} />
                  </ReportCell>
                  <ReportCell>
                    <div className="flex items-center gap-3">
                      {/* `isLeader` is the bar's darker fill — every row here
                          carries it, since the rows are not ranked. */}
                      <span className="flex-1">
                        <ShareBar isLeader share={rate} />
                      </span>
                      <span className="w-10 text-right font-bold text-muted-strong text-sm tabular-nums">
                        {rate.toFixed(0)}%
                      </span>
                    </div>
                  </ReportCell>
                </ReportRow>
              );
            })}
          </ReportTable>
        </ReportSection>

        <aside className="flex flex-col gap-3.5 border-border lg:border-l lg:pl-10">
          <Typography.H3 className="text-lg">
            How an exercise runs
          </Typography.H3>
          <Typography.Text>
            Bidding opens at 12pm on the first Monday and third Monday of each
            month and closes at 4pm on the third day. The premium is the lowest
            successful bid, so everyone who wins pays the same price.
          </Typography.Text>
          <Typography.Text>
            Quotas are set quarterly from deregistrations and the allowed growth
            in the vehicle population.
          </Typography.Text>
          <Link
            className="font-bold text-accent-strong text-base"
            href="/coe/premiums"
          >
            Premium trends by category →
          </Link>
          <Link
            className="font-bold text-accent-strong text-base"
            href="/coe/pqp"
          >
            PQP renewal rates →
          </Link>
        </aside>
      </div>
    </>
  );
}
