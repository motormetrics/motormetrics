"use client";

import { ChartTooltip } from "@heroui-pro/react";
import { BarChart } from "@heroui-pro/react/bar-chart";
import { compactCount } from "@web/utils/formatting/chart-axis";

/** One calendar month; a year with no data for the month leaves its key out. */
export interface YearOnYearPoint {
  [key: string]: number | string | undefined;
  current?: number;
  /** "Aug". */
  label: string;
  prior?: number;
}

const CURRENT_COLOUR = "var(--chart-1)";
const PRIOR_COLOUR = "var(--chart-5)";

/**
 * New cars per calendar month, the selected year beside the year before it,
 * as zero-based grouped columns.
 */
export function YearOnYearChart({
  currentLabel,
  data,
  priorLabel,
  ticks,
}: {
  /** "2026". */
  currentLabel: string;
  data: YearOnYearPoint[];
  /** "2025". */
  priorLabel: string;
  /** Zero-based ticks from `axisTicks`. */
  ticks: number[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-wrap gap-x-4 gap-y-2 text-foreground text-xs">
        {[
          { colour: CURRENT_COLOUR, label: currentLabel },
          { colour: PRIOR_COLOUR, label: priorLabel },
        ].map(({ colour, label }) => (
          <li className="inline-flex items-center gap-2" key={label}>
            <span
              aria-hidden
              className="block size-2.5 rounded-xs"
              style={{ backgroundColor: colour }}
            />
            {label}
          </li>
        ))}
      </ul>
      <BarChart
        data={data as Record<string, number | string>[]}
        height={280}
        margin={{ bottom: 0, left: 0, right: 0, top: 8 }}
      >
        <BarChart.Grid vertical={false} />
        <BarChart.XAxis
          dataKey="label"
          interval="preserveStartEnd"
          minTickGap={4}
          tickMargin={8}
        />
        <BarChart.YAxis
          domain={[0, ticks.at(-1) ?? "auto"]}
          orientation="left"
          tickFormatter={compactCount}
          ticks={ticks}
          width={44}
        />
        <BarChart.Bar
          dataKey="prior"
          fill={PRIOR_COLOUR}
          maxBarSize={20}
          name={priorLabel}
          radius={[2, 2, 0, 0]}
        />
        <BarChart.Bar
          dataKey="current"
          fill={CURRENT_COLOUR}
          maxBarSize={20}
          name={currentLabel}
          radius={[2, 2, 0, 0]}
        />
        <BarChart.Tooltip
          content={({ active, label, payload }) => {
            if (!active || !payload?.length) {
              return null;
            }
            return (
              <ChartTooltip>
                <ChartTooltip.Header>{label}</ChartTooltip.Header>
                {[...payload].reverse().map((entry) => (
                  <ChartTooltip.Item key={String(entry.dataKey)}>
                    <ChartTooltip.Indicator color={entry.color ?? entry.fill} />
                    <ChartTooltip.Label>{entry.name}</ChartTooltip.Label>
                    <ChartTooltip.Value>
                      {Number(entry.value).toLocaleString("en-SG")}
                    </ChartTooltip.Value>
                  </ChartTooltip.Item>
                ))}
              </ChartTooltip>
            );
          }}
        />
      </BarChart>
    </div>
  );
}
