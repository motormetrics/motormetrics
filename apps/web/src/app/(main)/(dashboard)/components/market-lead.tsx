import { ProgressBar, Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  batteryElectricShares,
  resolveMonthIndex,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-series";
import {
  biddingOrdinal,
  formatExercise,
  premiumRangeStats,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  summariseMonth,
  windowEndingAt,
} from "@web/app/(main)/(dashboard)/components/overview-series";
import { DeltaChip } from "@web/components/shared/delta-chip";
import {
  getEvMarketShare,
  getEvMonthlyTrend,
  getMonthlyRegistrationTotals,
} from "@web/queries/cars";
import { getCategoryExercises, getExercisePair } from "@web/queries/coe";
import type { COECategory } from "@web/types";
import { changeRatio } from "@web/utils/change-ratio";
import {
  formatMonthLabel,
  formatMonthName,
} from "@web/utils/dates/format-month";
import { getLatestMonth } from "@web/utils/dates/months";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

/** Deep enough for the summary's "the fewest since" look-back. */
const HISTORY_LIMIT = 24;
const SUMMARY_MONTHS = 12;
/** The window the Category A range bar spans, matching /coe's default. */
const RANGE_EXERCISES = 12;

const CAR_CATEGORIES: { category: COECategory; label: string }[] = [
  { category: "Category A", label: "Category A" },
  { category: "Category B", label: "Category B" },
];

/** The muted tone on the dark band; `text-muted` is tuned for light grounds. */
const ON_DARK_MUTED = "text-ink-surface-foreground/70";
const CHANGE_CLASS = "font-semibold text-ink-surface-foreground";

/** Track and fill for a bar on the dark band. */
const BAR_TRACK = "bg-ink-surface-foreground/15";
const BAR_FILL = "bg-accent-on-dark";

/**
 * The homepage's opening band: the latest COE result for cars on the left and
 * the latest month of new cars on the right, each half a link to its page.
 *
 * COE and registrations run on different clocks — two exercises a month
 * against one release — so each half names its own period instead of sharing
 * one month that would be stale for the other.
 */
export async function MarketLead() {
  const month = await getLatestMonth("cars");
  const [exercises, categoryA, monthlyTotals, evTrend, evMarketShare] =
    await Promise.all([
      getExercisePair(),
      getCategoryExercises("Category A"),
      getMonthlyRegistrationTotals(HISTORY_LIMIT),
      getEvMonthlyTrend(),
      getEvMarketShare(),
    ]);

  const { current, previous } = exercises;
  const premiums = CAR_CATEGORIES.flatMap(({ category, label }) => {
    const latest = current?.rows.find((row) => row.vehicleClass === category);
    if (!latest) {
      return [];
    }
    const before = previous?.rows.find((row) => row.vehicleClass === category);
    return [
      {
        change: changeRatio(latest.premium, before?.premium) * 100,
        label,
        premium: latest.premium,
      },
    ];
  });
  const range = premiumRangeStats(categoryA.slice(-RANGE_EXERCISES));

  const registrations = windowEndingAt(monthlyTotals, month, SUMMARY_MONTHS);
  const registration = registrations.at(-1);
  const previousRegistration = registrations.at(-2);

  const evIndex = resolveMonthIndex(
    evTrend.map((point) => point.month),
    month,
  );
  const shares = batteryElectricShares(evTrend, evMarketShare);
  const evShare = evIndex >= 0 ? shares[evIndex] : undefined;
  const previousEvShare = evIndex > 0 ? shares[evIndex - 1] : undefined;

  if (premiums.length === 0 && !registration) {
    return null;
  }

  const summary = summariseMonth(
    registrations,
    month,
    "new cars registered",
    current && premiums[0]
      ? `Category A COE closed at ${formatCurrency(premiums[0].premium)} in the ${biddingOrdinal(current.biddingNo)} bidding of ${formatMonthName(current.month)}`
      : undefined,
  );

  return (
    <div className="flex flex-col gap-2.5">
      <section
        aria-label="Latest figures"
        className="grid gap-8 rounded-4xl bg-ink-surface p-6 text-ink-surface-foreground md:p-10 lg:grid-cols-12 lg:gap-10"
      >
        {current && premiums.length > 0 ? (
          <LeadLink
            className="lg:col-span-7"
            href="/coe"
            title={`COE premiums · ${formatExercise(current)}`}
          >
            <div className="grid grid-cols-2 gap-4 md:gap-8">
              {premiums.map((item) => (
                <div className="flex min-w-0 flex-col gap-2" key={item.label}>
                  <span className={`text-sm ${ON_DARK_MUTED}`}>
                    {item.label}
                  </span>
                  <span className="font-extrabold text-3xl tabular-nums leading-none tracking-tight md:text-6xl">
                    <NumberValue
                      currency="SGD"
                      locale="en-SG"
                      maximumFractionDigits={0}
                      style="currency"
                      value={item.premium}
                    />
                  </span>
                  <span className={`text-sm tabular-nums ${ON_DARK_MUTED}`}>
                    <DeltaChip className={CHANGE_CLASS} value={item.change} />{" "}
                    on the previous exercise
                  </span>
                </div>
              ))}
            </div>
            {range ? (
              <ProgressBar
                aria-label={`Category A against its range over the last ${RANGE_EXERCISES} exercises`}
                className="gap-2"
                maxValue={range.high.premium}
                minValue={range.low.premium}
                size="sm"
                value={range.latest.premium}
              >
                <ProgressBar.Track className={`col-span-full ${BAR_TRACK}`}>
                  <ProgressBar.Fill className={BAR_FILL} />
                </ProgressBar.Track>
                <span
                  className={`col-span-full flex justify-between gap-4 text-xs tabular-nums ${ON_DARK_MUTED}`}
                >
                  <span>
                    Category A, {RANGE_EXERCISES}-exercise low{" "}
                    {formatCurrency(range.low.premium)}
                  </span>
                  <span>high {formatCurrency(range.high.premium)}</span>
                </span>
              </ProgressBar>
            ) : null}
          </LeadLink>
        ) : null}

        {registration ? (
          <LeadLink
            className="border-ink-surface-foreground/15 max-lg:border-t max-lg:pt-8 lg:col-span-5 lg:border-l lg:pl-10"
            href="/cars/registrations"
            title={`New cars · ${formatMonthLabel(registration.month)}`}
          >
            <div className="flex flex-col gap-2">
              <span className="font-extrabold text-5xl tabular-nums leading-none tracking-tight md:text-6xl">
                <NumberValue
                  locale="en-SG"
                  maximumFractionDigits={0}
                  value={registration.total}
                />
              </span>
              <span className={`text-sm tabular-nums ${ON_DARK_MUTED}`}>
                <DeltaChip
                  className={CHANGE_CLASS}
                  value={
                    changeRatio(
                      registration.total,
                      previousRegistration?.total,
                    ) * 100
                  }
                />{" "}
                {previousRegistration
                  ? `vs ${formatMonthName(previousRegistration.month)}`
                  : "vs the previous month"}
              </span>
            </div>
            {evShare !== undefined ? (
              <ProgressBar
                aria-label="Battery-electric share of new cars"
                className="gap-2"
                size="sm"
                value={evShare}
              >
                <span className="flex justify-between gap-4 text-sm">
                  <span>Battery-electric</span>
                  <span className="font-semibold tabular-nums">
                    {evShare.toFixed(1)}%
                  </span>
                </span>
                <ProgressBar.Track className={`col-span-full ${BAR_TRACK}`}>
                  <ProgressBar.Fill className={BAR_FILL} />
                </ProgressBar.Track>
                {previousEvShare !== undefined ? (
                  <span
                    className={`col-span-full text-xs tabular-nums ${ON_DARK_MUTED}`}
                  >
                    <DeltaChip
                      className={CHANGE_CLASS}
                      unit="pp"
                      value={evShare - previousEvShare}
                    />{" "}
                    on the previous month
                  </span>
                ) : null}
              </ProgressBar>
            ) : null}
          </LeadLink>
        ) : null}
      </section>
      {summary ? (
        <Typography.Paragraph className="tabular-nums" color="muted" size="sm">
          {summary}
        </Typography.Paragraph>
      ) : null}
    </div>
  );
}

/**
 * One half of the band: a whole-area link with its period as the title, so
 * the figures and the way into the detail are one target.
 */
function LeadLink({
  children,
  className,
  href,
  title,
}: {
  children: ReactNode;
  className?: string;
  href: string;
  title: string;
}) {
  return (
    <Link
      className={`group flex min-w-0 flex-col gap-6 text-ink-surface-foreground no-underline ${className ?? ""}`}
      href={href}
    >
      <span className="flex items-center justify-between gap-4 font-semibold text-accent-on-dark text-sm">
        {title}
        <ArrowRight
          aria-hidden
          className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
          strokeWidth={2.25}
        />
      </span>
      {children}
    </Link>
  );
}
