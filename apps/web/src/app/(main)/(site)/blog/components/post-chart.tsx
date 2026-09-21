"use client";

import { Card, Typography } from "@heroui/react";
import { AreaChart } from "@heroui-pro/react/area-chart";
import { BarChart } from "@heroui-pro/react/bar-chart";
import { LineChart } from "@heroui-pro/react/line-chart";
import { PieChart } from "@heroui-pro/react/pie-chart";

/**
 * The chart palette caps at six series (see the note in `globals.css`), and the
 * same note is why every chart here also labels its series in text: colour is
 * associative, never load-bearing.
 */
const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

export type PostChartType = "area" | "bar" | "donut" | "hbar" | "line";
export type PostChartUnit = "count" | "currency" | "percent";

/**
 * A chart spec as it arrives from a ```chart fence in a post body, after
 * `parseChartSpec` in `mdx-components.tsx` has normalised it — by the time it
 * reaches here the type and unit are valid and every row has every series.
 *
 * The data is inlined by the generator rather than fetched: the post body
 * renders inside a `"use cache"` boundary pinned to `cacheLife("max")`, the
 * generator computes every figure via code execution, and a monthly post should
 * keep quoting the month it was written about. A chart that re-fetched could
 * silently disagree with the prose beside it.
 */
export interface PostChartSpec {
  caption?: string;
  /** One row per category; `label` is the tick, the rest are numeric series. */
  data: Record<string, number | string>[];
  /** Numeric keys drawn from each row, in palette order. */
  series: string[];
  /** Carries the denominator or scope, e.g. "Of 4,368 cars registered in June
   * 2026" — it is how a reader checks a percentage, so it is not decoration. */
  subtitle?: string;
  title?: string;
  type: PostChartType;
  unit: PostChartUnit;
  /** Names the quantity in tooltips and the legend, e.g. "Registrations". */
  valueLabel?: string;
}

const FORMATS: Record<PostChartUnit, Intl.NumberFormatOptions> = {
  count: { maximumFractionDigits: 0 },
  currency: {
    currency: "SGD",
    maximumFractionDigits: 0,
    style: "currency",
  },
  percent: { maximumFractionDigits: 1, minimumFractionDigits: 0 },
};

function formatValue(value: number | string, unit: PostChartUnit) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return String(value);
  }

  const formatted = new Intl.NumberFormat("en-SG", FORMATS[unit]).format(
    numeric,
  );

  return unit === "percent" ? `${formatted}%` : formatted;
}

/**
 * What a series is called in the tooltip and legend. `value` is the generator's
 * default key and says nothing to a reader, so `valueLabel` replaces it where
 * the spec supplies one.
 */
function seriesLabel(key: string, valueLabel?: string) {
  if (key === "value") {
    return valueLabel ?? "Value";
  }

  return key;
}

function ChartLegend({
  entries,
}: {
  entries: { color: string; label: string; value?: string }[];
}) {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
      {entries.map((entry) => (
        <div className="flex items-center gap-1.5" key={entry.label}>
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted text-xs">
            {entry.label}
            {entry.value ? ` (${entry.value})` : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

function ChartBody({ spec }: { spec: PostChartSpec }) {
  const { data, series, type, unit, valueLabel } = spec;
  const format = (value: number | string) => formatValue(value, unit);
  const height = 280;

  if (type === "donut") {
    const key = series[0];
    const slices = data.map((row, index) => ({
      fill: CHART_COLORS[index % CHART_COLORS.length],
      name: String(row.label),
      value: Number(row[key]),
    }));

    return (
      <div className="flex flex-col gap-4">
        <PieChart height={220}>
          <PieChart.Pie
            cornerRadius={8}
            cx="50%"
            cy="50%"
            data={slices}
            dataKey="value"
            innerRadius="64%"
            nameKey="name"
            strokeWidth={0}
          >
            {slices.map((slice) => (
              <PieChart.Cell fill={slice.fill} key={slice.name} />
            ))}
          </PieChart.Pie>
          <PieChart.Tooltip content={<PieChart.TooltipContent />} />
        </PieChart>
        <ChartLegend
          entries={slices.map((slice) => ({
            color: slice.fill,
            label: slice.name,
            value: format(slice.value),
          }))}
        />
      </div>
    );
  }

  if (type === "hbar") {
    return (
      <BarChart data={data} height={height} layout="vertical" width="100%">
        <BarChart.Grid horizontal={false} strokeDasharray="3 3" />
        <BarChart.XAxis hide type="number" />
        <BarChart.YAxis
          dataKey="label"
          tickMargin={8}
          type="category"
          width={96}
        />
        <BarChart.Tooltip
          content={<BarChart.TooltipContent indicator="line" />}
          cursor={{ fill: "var(--muted)", opacity: 0.2 }}
        />
        {series.map((key, index) => (
          <BarChart.Bar
            dataKey={key}
            fill={CHART_COLORS[index % CHART_COLORS.length]}
            key={key}
            name={seriesLabel(key, valueLabel)}
            radius={4}
          />
        ))}
      </BarChart>
    );
  }

  if (type === "line") {
    return (
      <LineChart data={data} height={height} width="100%">
        <LineChart.Grid strokeDasharray="3 3" vertical={false} />
        <LineChart.XAxis
          dataKey="label"
          interval="preserveStartEnd"
          minTickGap={16}
          tickMargin={8}
        />
        <LineChart.YAxis tickFormatter={format} width={56} />
        <LineChart.Tooltip
          content={<LineChart.TooltipContent valueFormatter={format} />}
        />
        {series.map((key, index) => (
          <LineChart.Line
            dataKey={key}
            dot={false}
            key={key}
            name={seriesLabel(key, valueLabel)}
            stroke={CHART_COLORS[index % CHART_COLORS.length]}
            strokeWidth={2}
            type="monotone"
          />
        ))}
      </LineChart>
    );
  }

  if (type === "area") {
    return (
      <AreaChart data={data} height={height} width="100%">
        <AreaChart.Grid strokeDasharray="3 3" vertical={false} />
        <AreaChart.XAxis
          dataKey="label"
          interval="preserveStartEnd"
          minTickGap={16}
          tickMargin={8}
        />
        <AreaChart.YAxis tickFormatter={format} width={56} />
        <AreaChart.Tooltip
          content={<AreaChart.TooltipContent valueFormatter={format} />}
        />
        {series.map((key, index) => (
          <AreaChart.Area
            dataKey={key}
            dot={false}
            fill={CHART_COLORS[index % CHART_COLORS.length]}
            fillOpacity={0.12}
            key={key}
            name={seriesLabel(key, valueLabel)}
            stroke={CHART_COLORS[index % CHART_COLORS.length]}
            strokeWidth={2}
            type="monotone"
          />
        ))}
      </AreaChart>
    );
  }

  return (
    <BarChart data={data} height={height} width="100%">
      <BarChart.Grid strokeDasharray="3 3" vertical={false} />
      <BarChart.XAxis
        dataKey="label"
        interval="preserveStartEnd"
        minTickGap={8}
        tickMargin={8}
      />
      <BarChart.YAxis
        tickFormatter={(value: number | string) => format(value)}
        width={56}
      />
      <BarChart.Tooltip
        content={<BarChart.TooltipContent indicator="line" />}
        cursor={{ fill: "var(--muted)", opacity: 0.2 }}
      />
      {series.map((key, index) => (
        <BarChart.Bar
          dataKey={key}
          fill={CHART_COLORS[index % CHART_COLORS.length]}
          key={key}
          name={seriesLabel(key, valueLabel)}
          radius={4}
        />
      ))}
    </BarChart>
  );
}

/**
 * Renders one ```chart fence from a post body.
 *
 * `not-prose` because the article wrapper applies `prose`, which would
 * otherwise restyle the legend and caption text. The card is `min-w-0` and the
 * charts are all `width="100%"` so nothing pushes the article into a horizontal
 * scroll at ~400px.
 */
export function PostChart({ spec }: { spec: PostChartSpec }) {
  const multiSeries = spec.series.length > 1;

  return (
    <figure className="not-prose my-8 w-full min-w-0">
      <Card className="w-full min-w-0">
        {spec.title || spec.subtitle ? (
          <Card.Header className="flex flex-col items-start gap-1">
            {spec.title ? (
              <Typography.Heading level={4}>{spec.title}</Typography.Heading>
            ) : null}
            {spec.subtitle ? (
              // Not decoration: the subtitle names the denominator or the
              // scope, and is how a reader checks a percentage. It gets the
              // body colour and a rule, rather than the muted grey that would
              // read as a caption.
              <p className="border-accent border-l-2 pl-2.5 text-foreground text-sm">
                {spec.subtitle}
              </p>
            ) : null}
          </Card.Header>
        ) : null}
        <Card.Content className="flex flex-col gap-4 pt-2">
          <ChartBody spec={spec} />
          {multiSeries && spec.type !== "donut" ? (
            <ChartLegend
              entries={spec.series.map((key, index) => ({
                color: CHART_COLORS[index % CHART_COLORS.length],
                label: seriesLabel(key, spec.valueLabel),
              }))}
            />
          ) : null}
        </Card.Content>
      </Card>
      {spec.caption ? (
        <figcaption className="mt-2 text-muted text-xs">
          {spec.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
