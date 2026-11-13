import { Typography } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { TwoShadeTrendChart } from "@web/app/(main)/(dashboard)/cars/components/two-shade-trend-chart";
import {
  loadMakeRows,
  type MakeRow,
  MIN_BASE,
  matchesFuelFilter,
  periodLabel,
  priorWindow,
  rangeWindow,
} from "@web/app/(main)/(dashboard)/cars/makes/components/make-rows";
import {
  type MakesSearchParams,
  serialize,
} from "@web/app/(main)/(dashboard)/cars/makes/search-params";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import { SourceNote } from "@web/components/shared/overview";
import { getMakeCrossTab } from "@web/queries/cars/makes/period-totals";
import {
  formatChartMonth,
  formatMonthLabel,
} from "@web/utils/dates/format-month";
import { shiftMonth } from "@web/utils/dates/month-arithmetic";
import { ArrowRight, ChevronLeft } from "lucide-react";
import Link from "next/link";

/** How many months the detail chart draws, ending at the latest month. */
const CHART_MONTHS = 24;

const formatCount = (value: number) => value.toLocaleString("en-SG");

function formatShare(share: number): string {
  return share < 0.1 ? "under 0.1%" : `${share.toFixed(1)}%`;
}

/** The change on a year earlier, or `null` when the base is too small to read. */
function readableChange(row: Pick<MakeRow, "count" | "yoyChange">) {
  if (row.yoyChange === null) {
    return null;
  }
  const base = row.count / (1 + row.yoyChange / 100);
  return base < MIN_BASE ? null : row.yoyChange;
}

/**
 * The sentence under the make's name, e.g. "BMW registered 412 cars in
 * October 2026, 9.8% of the market, and 3,980 from January to October 2026,
 * 4.1% more than a year earlier."
 */
export function detailCaption({
  fuel,
  latestMonth,
  month,
  range,
  row,
}: {
  fuel: MakesSearchParams["fuel"];
  latestMonth: string;
  /** The make's row for the latest month alone, if it registered any. */
  month: Pick<MakeRow, "count" | "share"> | undefined;
  range: MakesSearchParams["range"];
  row: Pick<MakeRow, "count" | "make" | "yoyChange">;
}): string {
  const kind = fuel ? `${fuel.toLowerCase()} ` : "";
  const market = fuel ? `new ${kind}cars` : "the market";
  const monthLabel = formatMonthLabel(latestMonth);

  let caption = month
    ? `${row.make} registered ${formatCount(month.count)} ${kind}${month.count === 1 ? "car" : "cars"} in ${monthLabel}, ${formatShare(month.share)} of ${market}`
    : `${row.make} registered no new ${kind}cars in ${monthLabel}`;

  if (range !== "month") {
    caption += `, and ${formatCount(row.count)} from ${periodLabel(latestMonth, range)}`;
  }

  const change = readableChange(row);
  if (change !== null) {
    caption += `, ${Math.abs(change).toFixed(1)}% ${change < 0 ? "fewer" : "more"} than a year earlier`;
  }

  return `${caption}.`;
}

/** The make's registrations for each of the `CHART_MONTHS` months to `latestMonth`. */
export function monthSeries(
  rows: { count: number; fuelType: string; month: string }[],
  latestMonth: string,
  fuel: MakesSearchParams["fuel"],
): { count: number; month: string }[] {
  const byMonth = new Map<string, number>();
  for (const row of rows) {
    if (fuel && !matchesFuelFilter(fuel, row.fuelType)) {
      continue;
    }
    byMonth.set(row.month, (byMonth.get(row.month) ?? 0) + row.count);
  }

  const start = shiftMonth(latestMonth, -(CHART_MONTHS - 1));
  return Array.from({ length: CHART_MONTHS }, (_, index) => {
    const month = shiftMonth(start, index);
    return { count: byMonth.get(month) ?? 0, month };
  });
}

/** How many parts a mix bar shows before the rest fold into "Other". */
const MIX_PARTS = 4;

/** How many fuel and body combinations the table lists. */
const COMBOS = 5;

/** The bar colours, darkest first, then the lightest for "Other". */
const MIX_COLOURS = ["bg-chart-1", "bg-chart-3", "bg-chart-4", "bg-chart-sand"];
const OTHER_COLOUR = "bg-chart-6";

export interface MixPart {
  count: number;
  label: string;
  /** Percentage of the make's registrations in the period. */
  share: number;
}

export interface Combination {
  /** Percentage change on a year earlier, or `null` under `MIN_BASE`. */
  change: number | null;
  count: number;
  fuelType: string;
  vehicleType: string;
}

/** Counts by label, largest first, with the tail past `MIX_PARTS` as "Other". */
function mixParts(counts: Map<string, number>, total: number): MixPart[] {
  const sorted = [...counts].sort((a, b) => b[1] - a[1]);
  const shown = sorted.length > MIX_PARTS ? MIX_PARTS - 1 : MIX_PARTS;
  const parts = sorted
    .slice(0, shown)
    .map(([label, count]) => ({ count, label, share: (count / total) * 100 }));
  const rest = sorted.slice(shown).reduce((sum, [, count]) => sum + count, 0);
  if (rest > 0) {
    parts.push({ count: rest, label: "Other", share: (rest / total) * 100 });
  }
  return parts;
}

/**
 * The make's fuel and body mix over the selected period, and its largest fuel
 * and body combinations with their change on the same months a year earlier.
 */
export function mixBreakdown(
  rows: {
    count: number;
    fuelType: string;
    month: string;
    vehicleType: string;
  }[],
  latestMonth: string,
  range: MakesSearchParams["range"],
  fuel: MakesSearchParams["fuel"],
): { body: MixPart[]; combos: Combination[]; fuel: MixPart[] } {
  const current = rangeWindow(latestMonth, range);
  const prior = priorWindow(latestMonth, range);
  const byFuel = new Map<string, number>();
  const byBody = new Map<string, number>();
  const combos = new Map<string, Combination>();
  const priorCombos = new Map<string, number>();
  let total = 0;

  for (const row of rows) {
    if (fuel && !matchesFuelFilter(fuel, row.fuelType)) {
      continue;
    }
    const key = `${row.fuelType}|${row.vehicleType}`;
    if (row.month >= prior.start && row.month <= prior.end) {
      priorCombos.set(key, (priorCombos.get(key) ?? 0) + row.count);
    }
    if (row.month < current.start || row.month > current.end) {
      continue;
    }
    total += row.count;
    byFuel.set(row.fuelType, (byFuel.get(row.fuelType) ?? 0) + row.count);
    byBody.set(row.vehicleType, (byBody.get(row.vehicleType) ?? 0) + row.count);
    const combo = combos.get(key) ?? {
      change: null,
      count: 0,
      fuelType: row.fuelType,
      vehicleType: row.vehicleType,
    };
    combo.count += row.count;
    combos.set(key, combo);
  }

  if (total === 0) {
    return { body: [], combos: [], fuel: [] };
  }

  const top = [...combos]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, COMBOS)
    .map(([key, combo]) => {
      const base = priorCombos.get(key) ?? 0;
      return {
        ...combo,
        change: base < MIN_BASE ? null : ((combo.count - base) / base) * 100,
      };
    });

  return {
    body: mixParts(byBody, total),
    combos: top,
    fuel: mixParts(byFuel, total),
  };
}

function MixBar({
  parts,
  period,
  title,
}: {
  parts: MixPart[];
  period: string;
  title: string;
}) {
  const colourOf = (part: MixPart, index: number) =>
    part.label === "Other" ? OTHER_COLOUR : MIX_COLOURS[index];

  return (
    <section className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <Typography.Heading level={3}>{title}</Typography.Heading>
        <span className="text-muted text-sm">{period}</span>
      </div>
      <div aria-hidden className="flex h-3 gap-0.5 overflow-hidden rounded-xs">
        {parts.map((part, index) => (
          <span
            className={colourOf(part, index)}
            key={part.label}
            style={{ width: `${part.share}%` }}
          />
        ))}
      </div>
      <ul className="flex flex-col">
        {parts.map((part, index) => (
          <li
            className="flex items-center gap-2.5 border-separator border-b py-2 text-sm"
            key={part.label}
          >
            <span
              aria-hidden
              className={`size-3 shrink-0 rounded-xs ${colourOf(part, index)}`}
            />
            <span className="min-w-0 flex-1 truncate">{part.label}</span>
            <span className="tabular-nums">{formatCount(part.count)}</span>
            <span className="w-14 text-right font-semibold tabular-nums">
              {formatShare(part.share)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CombinationsTable({
  combos,
  period,
}: {
  combos: Combination[];
  period: string;
}) {
  return (
    <section className="@md:col-span-2 flex min-w-0 flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <Typography.Heading level={3}>
          Top fuel and body combinations
        </Typography.Heading>
        <span className="text-muted text-sm">
          {period} · change on a year earlier
        </span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-separator border-b text-muted text-xs">
            <th className="py-2 text-left font-semibold">Combination</th>
            <th className="w-24 py-2 text-right font-semibold">Cars</th>
            <th className="w-24 py-2 text-right font-semibold">Change</th>
          </tr>
        </thead>
        <tbody>
          {combos.map((combo) => (
            <tr
              className="border-separator border-b"
              key={`${combo.fuelType}|${combo.vehicleType}`}
            >
              <td className="py-2">
                {combo.fuelType} {combo.vehicleType.toLowerCase()}
              </td>
              <td className="w-24 py-2 text-right font-semibold tabular-nums">
                {formatCount(combo.count)}
              </td>
              <td className="w-24 py-2 text-right tabular-nums">
                {combo.change === null
                  ? "–"
                  : `${combo.change < 0 ? "−" : "+"}${Math.abs(combo.change).toFixed(1)}%`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

/**
 * Direction D's make detail beside the index list: the make's figures for the
 * selected period and powertrain, and its registrations by month. "All makes"
 * clears `?make=`; the make's own page stays one link away.
 */
export async function MakeDetail({
  latestMonth,
  makesCount,
  params,
  row,
  total,
}: {
  latestMonth: string;
  /** How many makes registered cars in the period, for "Rank 6 of 63". */
  makesCount: number;
  params: MakesSearchParams;
  row: MakeRow;
  /** All registrations in the period, for the share note. */
  total: number;
}) {
  const [monthRows, crossTab] = await Promise.all([
    loadMakeRows("month", params.fuel),
    getMakeCrossTab(row.make),
  ]);
  const month = monthRows.rows.find((entry) => entry.slug === row.slug);
  const series = monthSeries(crossTab, latestMonth, params.fuel);
  const mix = mixBreakdown(crossTab, latestMonth, params.range, params.fuel);
  const previousMonth = series.at(-2)?.count ?? 0;
  const change = readableChange(row);
  const period = periodLabel(latestMonth, params.range);
  const monthLabel = formatMonthLabel(latestMonth);

  const stats = [
    {
      label: period,
      note: `Rank ${row.rank} of ${makesCount}`,
      value: formatCount(row.count),
    },
    {
      label: monthLabel,
      note:
        previousMonth > 0
          ? `${formatCount(previousMonth)} the month before`
          : "none the month before",
      value: formatCount(month?.count ?? 0),
    },
    {
      label: "Share",
      note: `of ${formatCount(total)} new ${params.fuel ? `${params.fuel.toLowerCase()} ` : ""}cars`,
      value: `${row.share < 0.1 ? "<0.1" : row.share.toFixed(1)}%`,
    },
    {
      label: "Change on a year earlier",
      note: change === null ? `Base under ${MIN_BASE} cars` : period,
      value:
        change === null
          ? "–"
          : `${change < 0 ? "−" : "+"}${Math.abs(change).toFixed(1)}%`,
    },
  ];

  return (
    <article
      aria-label={`${row.make} detail`}
      className="flex min-w-0 flex-col gap-6"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <MakeAvatar logoUrl={row.logoUrl} make={row.make} size="lg" />
        <div className="flex min-w-0 flex-col gap-0.5">
          <Typography.Heading level={2}>{row.make}</Typography.Heading>
          <span className="text-muted text-sm tabular-nums">
            Rank {row.rank} of {makesCount} · {period}
          </span>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <Link
            className={buttonVariants({ size: "sm", variant: "tertiary" })}
            href={serialize("/cars/makes", { ...params, make: null })}
          >
            <ChevronLeft className="size-4" />
            All makes
          </Link>
          <Link
            className={buttonVariants({ size: "sm", variant: "secondary" })}
            href={`/cars/makes/${row.slug}`}
          >
            {row.make} page
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      <Typography.Paragraph className="tabular-nums">
        {detailCaption({
          fuel: params.fuel,
          latestMonth,
          month,
          range: params.range,
          row,
        })}
      </Typography.Paragraph>

      <dl className="grid @3xl:grid-cols-4 grid-cols-2 gap-x-6">
        {stats.map(({ label, note, value }) => (
          <div
            className="flex flex-col gap-0.5 border-separator border-b py-3"
            key={label}
          >
            <dt className="font-semibold text-muted text-xs">{label}</dt>
            <dd className="font-semibold text-xl tabular-nums">{value}</dd>
            <dd className="text-muted text-xs tabular-nums">{note}</dd>
          </div>
        ))}
      </dl>

      <section className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <Typography.Heading level={3}>
            Registrations by month
          </Typography.Heading>
          <span className="text-muted text-sm tabular-nums">
            {formatMonthLabel(series[0].month)} to {monthLabel} · hover or tap a
            bar for its value
          </span>
        </div>
        <TwoShadeTrendChart
          data={series.map(({ count, month: seriesMonth }, index) => {
            const isLatest = seriesMonth === latestMonth;
            return {
              count,
              earlier: isLatest ? 0 : count,
              label: formatChartMonth(seriesMonth),
              latest: isLatest ? count : 0,
              title: formatMonthLabel(seriesMonth),
              year:
                index === 0 || seriesMonth.endsWith("-01")
                  ? seriesMonth.slice(0, 4)
                  : "",
            };
          })}
          height={220}
          maxBarSize={32}
          thinTicks
          ticks={axisTicks(
            series.map(({ count }) => count),
            { zero: true },
          )}
          tooltipLabel="Registrations"
        />
      </section>

      {mix.combos.length > 0 ? (
        <div className="grid @md:grid-cols-2 grid-cols-1 gap-8">
          {/* With a powertrain selected the fuel mix is that one fuel, so
              only the body mix is worth a bar. */}
          {params.fuel ? null : (
            <MixBar parts={mix.fuel} period={period} title="Fuel mix" />
          )}
          <MixBar parts={mix.body} period={period} title="Body type" />
          <CombinationsTable combos={mix.combos} period={period} />
        </div>
      ) : null}

      <SourceNote>
        Source: LTA via DataMall · New car registrations
        {params.fuel ? `, ${params.fuel} only` : ""}. Change is against the same
        period a year earlier and is not shown when that base was under{" "}
        {MIN_BASE} cars.
      </SourceNote>
    </article>
  );
}
