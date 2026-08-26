import { NumberValue } from "@heroui-pro/react";
import { HeroCard } from "@web/components/shared/bento";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { sparkline } from "@web/components/shared/sparkline";
import Typography from "@web/components/typography";
import { getCoeResults } from "@web/queries/coe";
import type { SearchParams } from "nuqs/server";
import { CategoryTabs } from "./coe-controls";
import {
  biddingOrdinal,
  CATEGORY_DESCRIPTIONS,
  changeRatio,
  formatMonth,
  groupByExercise,
  toCategory,
} from "./coe-exercise-utils";
import { loadCoeOverviewSearchParams } from "./search-params";

const SPARK_WIDTH = 380;
const SPARK_HEIGHT = 100;

function InsetFigure({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <Typography.Caption className="font-semibold text-[var(--accent-foreground)]/70">
        {label}
      </Typography.Caption>
      <span className="font-extrabold text-[var(--accent-foreground)] text-xl tabular-nums">
        {value}
      </span>
    </div>
  );
}

export async function CoeHeroCard({
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
  const figures = latest.results[category];
  const previousPremium = previous?.results[category]?.premium ?? 0;
  const premium = figures?.premium ?? 0;

  const visible = exercises.slice(-Number(range));
  const spark = sparkline(
    visible.map((exercise) => exercise.results[category]?.premium ?? 0),
    SPARK_WIDTH,
    SPARK_HEIGHT,
    12,
  );

  const bidsPerCoe = figures?.quota ? figures.bidsReceived / figures.quota : 0;
  const comparison = previous
    ? `vs ${biddingOrdinal(previous.biddingNo)} bidding${
        previous.month === latest.month
          ? ""
          : `, ${formatMonth(previous.month, "short")}`
      }`
    : "no earlier exercise";

  return (
    <HeroCard>
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="rounded-full bg-[var(--accent-foreground)]/20 px-4 py-2 font-bold text-sm">
          {category}
        </span>
        <div className="ml-auto">
          <CategoryTabs selected={categoryKey} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <span className="font-extrabold text-6xl tabular-nums tracking-[-0.03em]">
          <NumberValue
            currency="SGD"
            locale="en-SG"
            maximumFractionDigits={0}
            style="currency"
            value={premium}
          />
        </span>
        {/* `inverse` carries no sentiment colour, so the "a rise is bad news"
            inversion the light cards need through CostTrendChip does not apply
            — and a status colour would be unreadable on the gradient anyway. */}
        <DeltaChip
          ratio={changeRatio(premium, previousPremium)}
          tone="inverse"
        />
      </div>

      <Typography.TextLg className="font-semibold text-[var(--accent-foreground)]/85">
        {CATEGORY_DESCRIPTIONS[category]} · {comparison}
      </Typography.TextLg>

      {spark ? (
        <svg
          className="h-[100px] w-full overflow-visible"
          role="img"
          viewBox={`0 0 ${SPARK_WIDTH} ${SPARK_HEIGHT}`}
        >
          <title>{`${category} premiums over the last ${visible.length} bidding exercises`}</title>
          <path d={spark.area} fill="currentColor" opacity={0.16} />
          <path
            d={spark.line}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3.5}
          />
          <circle
            cx={spark.lastX}
            cy={spark.lastY}
            fill="var(--accent)"
            r={6}
            stroke="currentColor"
            strokeWidth={3.5}
          />
        </svg>
      ) : null}

      <div className="flex flex-wrap items-center gap-5 rounded-[var(--radius)] bg-[var(--ink-surface)]/70 px-[22px] py-[18px]">
        <InsetFigure
          label="Quota"
          value={(figures?.quota ?? 0).toLocaleString("en-SG")}
        />
        <InsetFigure
          label="Bids"
          value={(figures?.bidsReceived ?? 0).toLocaleString("en-SG")}
        />
        <InsetFigure label="Bids per COE" value={`${bidsPerCoe.toFixed(2)}x`} />
      </div>
    </HeroCard>
  );
}
