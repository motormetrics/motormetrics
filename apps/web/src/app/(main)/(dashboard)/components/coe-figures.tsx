import { Typography } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  CATEGORY_DESCRIPTIONS,
  COE_CATEGORIES,
  changeRatio,
  toCategoryKey,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { coeOverviewSearchParams } from "@web/app/(main)/(dashboard)/coe/components/search-params";
import {
  type CategoryMove,
  coeCaption,
  type PqpMove,
  pqpCaption,
  signed,
} from "@web/app/(main)/(dashboard)/components/market-copy";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { getCategoryExercises, getPqpRates } from "@web/queries/coe";
import {
  formatMonthLabel,
  formatMonthName,
} from "@web/utils/dates/format-month";
import Link from "next/link";
import { createSerializer } from "nuqs/server";

/** A year of exercises: two a month. */
const EXERCISES = 24;

/** Plot box of the sparklines, stretched to the tile's width. */
const SPARK_HEIGHT = 40;
const SPARK_PAD = 4;

/** LTA publishes PQP for these; Category E has none. */
const PQP_CATEGORIES = [
  "Category A",
  "Category B",
  "Category C",
  "Category D",
] as const;

/** The 5-year renewal is half the PQP, and only cars (A and B) may take it. */
const FIVE_YEAR_CATEGORIES = new Set(["Category A", "Category B"]);

const serializeCoe = createSerializer(coeOverviewSearchParams);

/**
 * A sparkline path on a 100 × 40 box, each series on its own scale. Drawn on
 * the server: the tile's figure and low/high carry the values, so there is no
 * tooltip to hydrate.
 */
export function sparkPath(values: number[]): string {
  const low = Math.min(...values);
  const spread = Math.max(...values) - low || 1;
  const last = values.length - 1 || 1;
  return values
    .map((value, index) => {
      const x = (index / last) * 100;
      const y =
        SPARK_PAD +
        (1 - (value - low) / spread) * (SPARK_HEIGHT - SPARK_PAD * 2);
      return `${index ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

/**
 * Figure 1: every category's latest premium with its last 24 exercises as a
 * sparkline. Each tile opens that category on the COE page.
 */
export async function CoePremiumsFigure() {
  const series = await Promise.all(
    COE_CATEGORIES.map((category) => getCategoryExercises(category)),
  );

  const tiles = COE_CATEGORIES.flatMap((category, index) => {
    const window = series[index].slice(-EXERCISES);
    const latest = window.at(-1);
    if (!latest) {
      return [];
    }
    const premiums = window.map((exercise) => exercise.premium);
    const high = Math.max(...premiums);
    const low = Math.min(...premiums);
    return [
      {
        category,
        change: changeRatio(latest.premium, window.at(-2)?.premium) * 100,
        high,
        key: toCategoryKey(category),
        low,
        path: sparkPath(premiums),
        premium: latest.premium,
        start: window[0],
        latest,
      },
    ];
  });

  if (tiles.length === 0) {
    return null;
  }

  const moves: CategoryMove[] = tiles.map((tile) => ({
    change: tile.change,
    isHigh: tile.premium >= tile.high,
    isLow: tile.premium <= tile.low,
    key: tile.key,
    premium: tile.premium,
  }));
  const first = tiles[0];

  return (
    <section
      aria-labelledby="coe-premiums-heading"
      className="@container flex scroll-mt-24 flex-col gap-6"
      id="coe-premiums"
    >
      <SectionHead
        caption={coeCaption(moves, EXERCISES)}
        eyebrow="Figure 1 · Certificate of Entitlement"
        link={{ href: "/coe", label: "All COE results" }}
        title={
          <span id="coe-premiums-heading">
            COE premiums, all five categories
          </span>
        }
      />
      <ul className="grid @3xl:grid-cols-3 @5xl:grid-cols-5 @md:grid-cols-2 grid-cols-1 gap-2.5">
        {tiles.map((tile) => (
          <li key={tile.key}>
            <Link
              aria-label={`Category ${tile.key}, ${formatCurrency(tile.premium)}, open COE results`}
              className="flex h-full min-w-0 flex-col gap-1.5 rounded-lg border border-separator bg-surface p-3.5 text-foreground no-underline transition-colors hover:border-border hover:bg-surface-secondary"
              href={serializeCoe("/coe", { category: tile.key })}
            >
              <span className="flex items-baseline justify-between gap-2">
                <span className="font-semibold">Category {tile.key}</span>
                <span className="text-muted-strong text-sm tabular-nums">
                  {signed(tile.change)}
                </span>
              </span>
              <span className="text-muted text-xs">
                {CATEGORY_DESCRIPTIONS[tile.category]}
              </span>
              <span className="font-semibold text-2xl tabular-nums">
                {formatCurrency(tile.premium)}
              </span>
              <svg
                aria-label={`Category ${tile.key} premium over the last ${EXERCISES} exercises`}
                className="h-10 w-full overflow-visible"
                preserveAspectRatio="none"
                role="img"
                viewBox={`0 0 100 ${SPARK_HEIGHT}`}
              >
                <path
                  d={tile.path}
                  fill="none"
                  stroke="var(--chart-1)"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <span className="flex justify-between gap-2 text-muted text-xs tabular-nums">
                <span>Low {formatCurrency(tile.low)}</span>
                <span>High {formatCurrency(tile.high)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <SourceNote>
        Source: LTA via DataMall · Quota premium at the close of each of the
        last {EXERCISES} exercises, {formatMonthLabel(first.start.month)} to{" "}
        {formatMonthLabel(first.latest.month)}. Each category has its own scale.
        Select a category to open its results.
      </SourceNote>
    </section>
  );
}

/**
 * The prevailing quota premium for Categories A to D, with the 5-year
 * renewal for the two car categories. Leads the car figures because
 * /coe/pqp is the site's top page by search impressions.
 */
export async function PqpFigure() {
  const rates = await getPqpRates();
  const [month, previousMonth] = Object.keys(rates).sort().reverse();
  if (!month) {
    return null;
  }

  const tiles = PQP_CATEGORIES.flatMap((category) => {
    const rate = rates[month]?.[category];
    if (rate === undefined) {
      return [];
    }
    const before = previousMonth ? rates[previousMonth]?.[category] : undefined;
    return [
      {
        category,
        change: before === undefined ? null : changeRatio(rate, before) * 100,
        key: toCategoryKey(category),
        rate,
      },
    ];
  });

  const moves: PqpMove[] = tiles.map(({ change, key, rate }) => ({
    change,
    key,
    rate,
  }));

  return (
    <section
      aria-labelledby="pqp-heading"
      className="@container flex scroll-mt-24 flex-col gap-6"
      id="pqp"
    >
      <SectionHead
        caption={pqpCaption(moves, month, previousMonth ?? null)}
        eyebrow="COE renewal"
        link={{ href: "/coe/pqp", label: "PQP rates" }}
        title={
          <span id="pqp-heading">
            Prevailing quota premium, {formatMonthLabel(month)}
          </span>
        }
      />
      <dl className="grid @3xl:grid-cols-4 grid-cols-2 gap-x-6 border-separator border-t">
        {tiles.map((tile) => (
          <div
            className="flex min-w-0 flex-col gap-0.5 border-separator border-b py-3"
            key={tile.key}
          >
            <dt className="font-semibold text-muted text-xs">
              Category {tile.key} · {CATEGORY_DESCRIPTIONS[tile.category]}
            </dt>
            <dd className="font-semibold text-xl tabular-nums">
              {formatCurrency(tile.rate)}
            </dd>
            <dd className="text-muted text-xs tabular-nums">
              {[
                tile.change !== null && previousMonth
                  ? `${signed(tile.change)} vs ${formatMonthName(previousMonth)}`
                  : null,
                FIVE_YEAR_CATEGORIES.has(tile.category)
                  ? `5-year ${formatCurrency(tile.rate / 2)}`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </dd>
          </div>
        ))}
      </dl>
      <Typography.Paragraph color="muted" size="xs">
        Source: LTA · Three-month moving average of quota premiums, set by LTA.
        The 5-year renewal is half the PQP and applies to Categories A and B.
      </Typography.Paragraph>
    </section>
  );
}
