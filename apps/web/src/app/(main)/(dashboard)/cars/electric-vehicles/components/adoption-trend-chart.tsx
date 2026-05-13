"use client";

import { Card, Text } from "@heroui/react";
import { AreaChart } from "@heroui-pro/react";
import { EV_COLORS } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/constants";
import type { EvMonthlyTrend } from "@web/queries/cars/electric-vehicles";

interface AdoptionTrendChartProps {
  data: EvMonthlyTrend[];
}

export function AdoptionTrendChart({ data }: AdoptionTrendChartProps) {
  const numberFormatter = new Intl.NumberFormat("en-SG");
  const chartData = data.map((item) => ({ ...item }));

  return (
    <Card>
      <Card.Header className="flex flex-col items-start gap-2">
        <Text type="h4">EV Adoption Trend</Text>
        <Text type="body-sm" color="muted">
          Monthly BEV, PHEV, and Hybrid registrations over time
        </Text>
      </Card.Header>
      <Card.Content>
        <div className="flex flex-col gap-4">
          <AreaChart data={chartData} height={400}>
            <AreaChart.Grid strokeDasharray="3 3" strokeOpacity={0.15} />
            <AreaChart.XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: string) => {
                const [year, month] = value.split("-");
                return `${month}/${year.slice(2)}`;
              }}
              interval="preserveStartEnd"
              minTickGap={40}
            />
            <AreaChart.YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => numberFormatter.format(value)}
              width={60}
            />
            <AreaChart.Tooltip
              cursor={{ fill: "var(--muted)", opacity: 0.2 }}
              content={
                <AreaChart.TooltipContent
                  valueFormatter={(value) =>
                    numberFormatter.format(value as number)
                  }
                />
              }
            />
            <AreaChart.Area
              type="monotone"
              dataKey="Hybrid"
              stackId="ev"
              fill={EV_COLORS.Hybrid}
              stroke={EV_COLORS.Hybrid}
              fillOpacity={0.4}
            />
            <AreaChart.Area
              type="monotone"
              dataKey="PHEV"
              stackId="ev"
              fill={EV_COLORS.PHEV}
              stroke={EV_COLORS.PHEV}
              fillOpacity={0.4}
            />
            <AreaChart.Area
              type="monotone"
              dataKey="BEV"
              stackId="ev"
              fill={EV_COLORS.BEV}
              stroke={EV_COLORS.BEV}
              fillOpacity={0.4}
            />
          </AreaChart>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            {[
              ["BEV", "BEV (Battery Electric)"],
              ["PHEV", "PHEV (Plug-In Hybrid)"],
              ["Hybrid", "Hybrid (HEV)"],
            ].map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{
                    backgroundColor: EV_COLORS[key as keyof typeof EV_COLORS],
                  }}
                />
                <span className="text-muted text-xs">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </Card.Content>
      <Card.Footer>
        <Text type="body-sm" color="muted">
          Stacked area chart showing combined electrified vehicle registrations.
          BEV = Battery Electric, PHEV = Plug-In Hybrid, Hybrid = Conventional
          Hybrid.
        </Text>
      </Card.Footer>
    </Card>
  );
}
