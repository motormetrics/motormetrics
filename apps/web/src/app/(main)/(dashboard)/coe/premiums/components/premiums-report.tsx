import { formatCurrency } from "@motormetrics/utils";
import {
  biddingOrdinal,
  CATEGORY_DESCRIPTIONS,
  COE_CATEGORIES,
  changeRatio,
  formatExerciseTick,
  formatMonth,
  toCategory,
  toCategoryKey,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { CategoryBadge } from "@web/app/(main)/(dashboard)/coe/premiums/components/category-badge";
import {
  CategoryTabs,
  RangeTabs,
} from "@web/app/(main)/(dashboard)/coe/premiums/components/filters";
import { PremiumDelta } from "@web/app/(main)/(dashboard)/coe/premiums/components/premium-delta";
import { PremiumTrendChart } from "@web/app/(main)/(dashboard)/coe/premiums/components/premium-trend-chart";
import {
  loadSearchParams,
  RANGE_EXERCISES,
} from "@web/app/(main)/(dashboard)/coe/premiums/search-params";
import { CostTrendChip } from "@web/app/(main)/(dashboard)/components/cost-trend-chip";
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
import { getCategoryExercises, getExercisePair } from "@web/queries/coe";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";

/** The comp lists a year of exercises under the chart. */
const HISTORY_ROWS = 12;

/** "Oct 2", or "Oct 2 '24" once the window spans more than a year. */
function exerciseTick(
  exercise: { biddingNo: number; month: string },
  showYear: boolean,
): string {
  const tick = formatExerciseTick(exercise);

  return showYear ? `${tick} '${exercise.month.slice(2, 4)}` : tick;
}

/** Bids received against the quota, e.g. `1.35×`. */
function bidsPerQuota(bidsReceived: number, quota: number): string {
  return `${(quota > 0 ? bidsReceived / quota : 0).toFixed(2)}×`;
}

function successRate(bidsSuccess: number, bidsReceived: number): number {
  return bidsReceived > 0 ? (bidsSuccess / bidsReceived) * 100 : 0;
}

/**
 * One band of the premium-range block: where a window's low and high sit on a
 * track scaled to the category's all-time high.
 */
function PremiumRangeBar({
  high,
  label,
  low,
  scale,
}: {
  high: number;
  label: string;
  low: number;
  scale: number;
}) {
  const ceiling = scale || 1;
  const left = Math.min((low / ceiling) * 100, 100);
  const width = Math.max(((high - low) / ceiling) * 100, 2);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-baseline gap-4">
        <span className="font-bold text-[0.96875rem] text-foreground">
          {label}
        </span>
        <span className="ml-auto whitespace-nowrap font-semibold text-[0.84375rem] text-muted">
          spread {formatCurrency(high - low)}
        </span>
      </div>
      <div className="relative h-3 rounded-full bg-surface-secondary">
        <span
          className="absolute inset-y-0 rounded-full bg-chart-1"
          style={{ left: `${left.toFixed(1)}%`, width: `${width.toFixed(1)}%` }}
        />
      </div>
      <div className="flex font-bold text-[0.9375rem] text-muted-strong tabular-nums">
        <span>{formatCurrency(low)}</span>
        <span className="ml-auto">{formatCurrency(high)}</span>
      </div>
    </div>
  );
}

export async function PremiumsReport({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const {
    category: categoryKey,
    month: parsedMonth,
    range,
  } = await loadSearchParams(searchParams);
  const category = toCategory(categoryKey);

  const [{ current, previous }, allExercises] = await Promise.all([
    getExercisePair(parsedMonth ?? undefined),
    getCategoryExercises(category),
  ]);

  if (!current) {
    return null;
  }

  // The selected exercise can sit mid-history when a month is picked, so the
  // series is truncated to it before anything is derived.
  const currentIndex = allExercises.findIndex(
    ({ biddingNo, month }) =>
      month === current.month && biddingNo === current.biddingNo,
  );
  const history =
    currentIndex >= 0 ? allExercises.slice(0, currentIndex + 1) : allExercises;
  const latest = history.at(-1);

  if (!latest) {
    return null;
  }

  const prior = history.at(-2) ?? null;
  const series = history.slice(-RANGE_EXERCISES[range]);
  const showYear = range !== "1Y";

  const year = Number(latest.month.slice(0, 4));
  const yearPremiums = history
    .filter(({ month }) => month.startsWith(`${year}-`))
    .map(({ premium }) => premium);
  const yearAverage = yearPremiums.length
    ? Math.round(
        yearPremiums.reduce((sum, premium) => sum + premium, 0) /
          yearPremiums.length,
      )
    : 0;
  const yearHigh = yearPremiums.length ? Math.max(...yearPremiums) : 0;
  const yearLow = yearPremiums.length ? Math.min(...yearPremiums) : 0;

  const allPremiums = allExercises.map(({ premium }) => premium);
  const allTimeHigh = allPremiums.length ? Math.max(...allPremiums) : 0;
  const allTimeLow = allPremiums.length ? Math.min(...allPremiums) : 0;

  const currentRows = new Map(
    current.rows.map((row) => [row.vehicleClass, row]),
  );
  const previousRows = new Map(
    (previous?.rows ?? []).map((row) => [row.vehicleClass, row]),
  );

  const historyRows = history
    .map((exercise, index) => ({
      exercise,
      ratio:
        index > 0
          ? changeRatio(exercise.premium, history[index - 1].premium)
          : null,
    }))
    .slice(-HISTORY_ROWS)
    .reverse();

  return (
    <>
      <ReportFilterBar
        label="Category"
        trailing={<RangeTabs />}
        trailingLabel="Range"
      >
        <CategoryTabs />
      </ReportFilterBar>

      <ReportHeadline
        delta={
          <CostTrendChip
            changeRatio={changeRatio(latest.premium, prior?.premium ?? 0)}
          />
        }
        label={`${category} · ${CATEGORY_DESCRIPTIONS[category]}`}
        stats={
          <>
            {prior ? (
              <ReportStat
                label="Previous exercise"
                note={`${formatMonth(prior.month, "short")} · ${biddingOrdinal(prior.biddingNo)}`}
                value={formatCurrency(prior.premium)}
              />
            ) : null}
            <ReportStat
              label={`${year} average`}
              note={`${yearPremiums.length} exercises`}
              value={formatCurrency(yearAverage)}
            />
            <ReportStat
              label={`${year} high`}
              note="year to date"
              value={formatCurrency(yearHigh)}
            />
            <ReportStat
              label={`${year} low`}
              note="year to date"
              value={formatCurrency(yearLow)}
            />
          </>
        }
        sub={`${formatMonth(current.month)} · ${biddingOrdinal(current.biddingNo)} bidding exercise · quota premium at close`}
        value={formatCurrency(latest.premium)}
      />

      <PremiumTrendChart
        data={series.map((exercise) => ({
          label: exerciseTick(exercise, showYear),
          premium: exercise.premium,
        }))}
      />

      <ReportSection
        caption={`${formatMonth(current.month)} · ${biddingOrdinal(current.biddingNo)} bidding exercise`}
        title="All categories"
      >
        <ReportTable
          columns={[
            { label: "Cat", width: "74px" },
            { label: "Description" },
            { align: "end", label: "Quota" },
            { align: "end", label: "Bids" },
            { align: "end", label: "Bids / quota" },
            { align: "end", label: "Premium" },
            { align: "end", label: "Vs previous", width: "120px" },
          ]}
        >
          {COE_CATEGORIES.map((entry) => {
            const row = currentRows.get(entry);
            const previousRow = previousRows.get(entry);
            const isActive = entry === category;

            return (
              <ReportRow isActive={isActive} key={entry}>
                <ReportCell>
                  <CategoryBadge
                    categoryKey={toCategoryKey(entry)}
                    isActive={isActive}
                  />
                </ReportCell>
                <ReportCell className="font-semibold text-base">
                  {CATEGORY_DESCRIPTIONS[entry]}
                </ReportCell>
                <ReportCell align="end" className="font-semibold text-muted">
                  <Count value={row?.quota ?? 0} />
                </ReportCell>
                <ReportCell align="end" className="font-semibold text-muted">
                  <Count value={row?.bidsReceived ?? 0} />
                </ReportCell>
                <ReportCell align="end" className="font-semibold text-muted">
                  {bidsPerQuota(row?.bidsReceived ?? 0, row?.quota ?? 0)}
                </ReportCell>
                <ReportCell align="end" className="font-extrabold text-lg">
                  {formatCurrency(row?.premium ?? 0)}
                </ReportCell>
                <ReportCell align="end">
                  <PremiumDelta
                    ratio={
                      row && previousRow
                        ? changeRatio(row.premium, previousRow.premium)
                        : null
                    }
                  />
                </ReportCell>
              </ReportRow>
            );
          })}
        </ReportTable>
      </ReportSection>

      <ReportSection
        caption={`${category} · last ${historyRows.length} exercises`}
        title="Bidding history"
      >
        <ReportTable
          columns={[
            { label: "Exercise" },
            { align: "end", label: "Premium" },
            { align: "end", label: "Change" },
            { align: "end", label: "Quota" },
            { align: "end", label: "Bids" },
            { label: "Success rate", width: "240px" },
          ]}
        >
          {historyRows.map(({ exercise, ratio }) => {
            const rate = successRate(
              exercise.bidsSuccess,
              exercise.bidsReceived,
            );

            return (
              <ReportRow key={`${exercise.month}:${exercise.biddingNo}`}>
                <ReportCell className="font-semibold text-base">
                  {formatMonth(exercise.month, "short")} ·{" "}
                  {biddingOrdinal(exercise.biddingNo)}
                </ReportCell>
                <ReportCell align="end" className="font-extrabold text-lg">
                  {formatCurrency(exercise.premium)}
                </ReportCell>
                <ReportCell align="end">
                  <PremiumDelta ratio={ratio} />
                </ReportCell>
                <ReportCell align="end" className="font-semibold text-muted">
                  <Count value={exercise.quota} />
                </ReportCell>
                <ReportCell align="end" className="font-semibold text-muted">
                  <Count value={exercise.bidsReceived} />
                </ReportCell>
                <ReportCell>
                  <div className="flex items-center gap-3">
                    {/* `isLeader` is the bar's darker fill — every row here
                        carries it, since the rows are not ranked. */}
                    <span className="flex-1">
                      <ShareBar isLeader share={rate} />
                    </span>
                    <span className="w-10 text-right font-bold text-[0.84375rem] text-muted-strong tabular-nums">
                      {rate.toFixed(0)}%
                    </span>
                  </div>
                </ReportCell>
              </ReportRow>
            );
          })}
        </ReportTable>
      </ReportSection>

      <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_380px]">
        <ReportSection title="Premium range">
          <div className="flex flex-col gap-6">
            <PremiumRangeBar
              high={yearHigh}
              label={`${year} year to date`}
              low={yearLow}
              scale={allTimeHigh}
            />
            <PremiumRangeBar
              high={allTimeHigh}
              label="All-time"
              low={allTimeLow}
              scale={allTimeHigh}
            />
          </div>
        </ReportSection>

        <aside className="flex flex-col gap-3.5 border-border lg:border-l lg:pl-10">
          <Typography.H3 className="font-bold text-[1.0625rem]">
            How to read this
          </Typography.H3>
          <Typography.TextSm className="font-medium text-base leading-relaxed">
            A premium is the price of the last successful bid in an exercise, so
            it is set by demand rather than announced in advance. A decrease is
            shown in green.
          </Typography.TextSm>
          <Typography.TextSm className="font-medium text-base leading-relaxed">
            Renewing an existing COE uses the PQP instead — the three-month
            moving average of premiums in that category.
          </Typography.TextSm>
          <Link
            className="font-bold text-accent-strong text-base"
            href="/coe/pqp"
          >
            PQP rates in full →
          </Link>
          <Link
            className="font-bold text-accent-strong text-base"
            href="/coe/results"
          >
            Bidding results by exercise →
          </Link>
        </aside>
      </div>
    </>
  );
}
