import { Typography } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  batteryElectricShares,
  resolveMonthIndex,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-series";
import {
  changeRatio,
  premiumAxisTicks,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  type PremiumPoint,
  PremiumTrendChart,
} from "@web/app/(main)/(dashboard)/coe/premiums/components/premium-trend-chart";
import { exerciseStamp } from "@web/app/(main)/(dashboard)/coe/premiums/components/premiums-shared";
import {
  EvShareChart,
  type EvSharePoint,
} from "@web/app/(main)/(dashboard)/components/ev-share-chart";
import {
  MarketTrendTabs,
  type TrendTab,
} from "@web/app/(main)/(dashboard)/components/market-trend-tabs";
import {
  axisTicks,
  type MonthTotal,
  windowEndingAt,
} from "@web/app/(main)/(dashboard)/components/overview-series";
import {
  VolumeChart,
  type VolumePoint,
} from "@web/app/(main)/(dashboard)/components/volume-chart";
import { SectionLink, SourceNote } from "@web/components/shared/overview";
import {
  getEvMarketShare,
  getEvMonthlyTrend,
  getMonthlyRegistrationTotals,
} from "@web/queries/cars";
import { getCategoryExercises } from "@web/queries/coe";
import {
  formatChartMonth,
  formatMonthLabel,
  formatMonthShortName,
} from "@web/utils/dates/format-month";
import { getLatestMonth } from "@web/utils/dates/months";
import type { ReactNode } from "react";

const CHART_MONTHS = 12;
/** Two exercises a month, so twelve months of COE results. */
const COE_EXERCISES = CHART_MONTHS * 2;
/** Matches the lead band's query, so both read one cache entry. */
const HISTORY_LIMIT = 24;

/** Chart points, with the year under the first month and every January. */
function toPoints(series: MonthTotal[]): VolumePoint[] {
  return series.map((row, index) => ({
    label: formatChartMonth(row.month),
    title: formatMonthLabel(row.month),
    value: row.total,
    year: index === 0 || row.month.endsWith("-01") ? row.month.slice(0, 4) : "",
  }));
}

/**
 * The homepage's one chart panel: COE premiums, new cars and EV share over
 * the last 12 months, one tab each. Every tab reuses the chart its own page
 * draws; this only fetches the series and shapes them.
 */
export async function MarketTrend() {
  const [month, categoryA, categoryB, monthlyTotals, evTrend, evMarketShare] =
    await Promise.all([
      getLatestMonth("cars"),
      getCategoryExercises("Category A"),
      getCategoryExercises("Category B"),
      getMonthlyRegistrationTotals(HISTORY_LIMIT),
      getEvMonthlyTrend(),
      getEvMarketShare(),
    ]);

  const tabs: TrendTab[] = [];

  // One extra exercise so the first point still has a change to show.
  const premiums = categoryA.slice(-(COE_EXERCISES + 1));
  if (premiums.length > 1) {
    const categoryBPremiums = new Map(
      categoryB.map((exercise) => [
        `${exercise.month}-${exercise.biddingNo}`,
        exercise.premium,
      ]),
    );
    const data: PremiumPoint[] = premiums.slice(1).map((exercise, index) => {
      const [year, monthNumber] = exercise.month.split("-").map(Number);
      return {
        biddingNo: exercise.biddingNo,
        change: changeRatio(exercise.premium, premiums[index].premium),
        label: formatMonthShortName(exercise.month),
        monthIndex: year * 12 + monthNumber - 1,
        pairedPremium: categoryBPremiums.get(
          `${exercise.month}-${exercise.biddingNo}`,
        ),
        premium: exercise.premium,
        title: exerciseStamp(exercise),
      };
    });
    const ticks = premiumAxisTicks(
      data.flatMap((point) =>
        point.pairedPremium === undefined
          ? [point.premium]
          : [point.premium, point.pairedPremium],
      ),
    );
    const step = ticks.length > 1 ? ticks[1] - ticks[0] : undefined;
    tabs.push({
      content: (
        <TrendPanel
          caption={`Quota premium at the close of each exercise · ${ticks[0] === 0 ? "Starts at $0" : "Y-axis does not start at zero"}${step ? `; gridlines every ${formatCurrency(step)}` : ""}`}
          link={{ href: "/coe", label: "All COE results" }}
        >
          <div className="flex gap-4 text-muted-strong text-xs">
            <LegendKey className="bg-chart-1" name="Category A" />
            <LegendKey className="bg-chart-2" name="Category B" />
          </div>
          <PremiumTrendChart
            data={data}
            label="Category A"
            pairedLabel="Category B"
            tickMonths={2}
            ticks={ticks}
          />
        </TrendPanel>
      ),
      id: "coe",
      label: "COE premiums",
    });
  }

  const registrations = windowEndingAt(monthlyTotals, month, CHART_MONTHS);
  if (registrations.length > 0) {
    tabs.push({
      content: (
        <TrendPanel
          caption="New car registrations, all makes and fuel types"
          link={{ href: "/cars", label: "All registrations" }}
        >
          <VolumeChart
            data={toPoints(registrations)}
            ticks={axisTicks(
              registrations.map((row) => row.total),
              { zero: true },
            )}
            unit="new cars"
          />
        </TrendPanel>
      ),
      id: "registrations",
      label: "New cars",
    });
  }

  const evIndex = resolveMonthIndex(
    evTrend.map((point) => point.month),
    month,
  );
  if (evIndex >= 0) {
    // Hybrids are left out, the same framing as the EV page this links to.
    const shares = batteryElectricShares(evTrend, evMarketShare);
    const start = Math.max(0, evIndex - CHART_MONTHS + 1);
    const data: EvSharePoint[] = evTrend
      .slice(start, evIndex + 1)
      .map((point, offset) => {
        const position = start + offset;
        const share = Number((shares[position] ?? 0).toFixed(1));
        const previous = Number((shares[position - 1] ?? 0).toFixed(1));
        return {
          change:
            offset > 0 ? Number((share - previous).toFixed(1)) : undefined,
          label: formatChartMonth(point.month),
          share,
          title: formatMonthLabel(point.month),
          year:
            offset === 0 || point.month.endsWith("-01")
              ? point.month.slice(0, 4)
              : "",
        };
      });
    const ticks = axisTicks(
      data.map((point) => point.share),
      { zero: false },
    );
    const step = ticks.length > 1 ? ticks[1] - ticks[0] : undefined;
    tabs.push({
      content: (
        <TrendPanel
          caption={`Battery-electric share of monthly registrations · Y-axis does not start at zero${step ? `; gridlines every ${step} pts` : ""}`}
          link={{ href: "/cars/electric-vehicles", label: "All electric data" }}
        >
          <EvShareChart data={data} ticks={ticks} />
        </TrendPanel>
      ),
      id: "ev-share",
      label: "EV share",
    });
  }

  if (tabs.length === 0) {
    return null;
  }

  return (
    <section className="flex min-w-0 flex-col gap-5 rounded-4xl bg-surface p-6 md:p-8">
      <MarketTrendTabs
        heading={
          <Typography.Heading
            className="text-xl md:text-2xl"
            level={2}
            weight="bold"
          >
            Last 12 months
          </Typography.Heading>
        }
        tabs={tabs}
      />
      <SourceNote>Source: LTA via DataMall</SourceNote>
    </section>
  );
}

/** One tab's body: what the chart measures, a link to its page, the chart. */
function TrendPanel({
  caption,
  children,
  link,
}: {
  caption: string;
  children: ReactNode;
  link: { href: string; label: string };
}) {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-baseline gap-4">
        <Typography.Paragraph className="min-w-0" color="muted" size="sm">
          {caption}
        </Typography.Paragraph>
        <SectionLink href={link.href}>{link.label}</SectionLink>
      </div>
      {children}
    </div>
  );
}

/** A swatch and name, since the chart's lines carry only their values. */
function LegendKey({ className, name }: { className: string; name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden className={`h-2.5 w-3 rounded-xs ${className}`} />
      {name}
    </span>
  );
}
