import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@web/components/charts/chart";
import type { RegistrationStat } from "@web/types/cars";
import { formatVehicleType } from "@web/utils/formatting/format-vehicle-type";
import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from "recharts";

interface BarChartByTypeProps {
  data: RegistrationStat[];
}

export const BarChartByType = ({ data }: BarChartByTypeProps) => {
  const chartData = data.map(({ name, count }) => ({
    label: formatVehicleType(name),
    count,
  }));
  const totalRegistrations = chartData.reduce(
    (sum, item) => sum + item.count,
    0,
  );
  const topType = chartData[0];

  const chartConfig = {
    count: { label: "Count" },
    label: { color: "var(--background)" },
  } satisfies ChartConfig;

  return (
    <div className="flex flex-col gap-4">
      <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <BarChart
          accessibilityLayer
          data={chartData}
          layout="vertical"
          aria-label={`Vehicle registrations by type, showing ${chartData[0]?.label || "top category"} with ${chartData[0]?.count || 0} registrations`}
        >
          <XAxis type="number" dataKey="count" hide />
          <YAxis
            dataKey="label"
            type="category"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            hide
          />
          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
          <Bar dataKey="count" radius={4}>
            {chartData.map((_, index) => (
              <Cell
                key={
                  // biome-ignore lint/suspicious/noArrayIndexKey: Recharts Cell requires index-based keys
                  `cell-${index}`
                }
                fill={`var(--chart-${index + 1})`}
              />
            ))}
            <LabelList
              dataKey="label"
              position="insideLeft"
              offset={8}
              className="fill-(--color-label)"
              fontSize={12}
            />
            <LabelList
              dataKey="count"
              position="right"
              offset={8}
              className="fill-foreground"
              fontSize={12}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
      <div className="flex flex-col gap-4">
        <div className="text-muted text-sm">
          <h4 className="mb-2 font-semibold text-foreground">
            Vehicle Type Distribution
          </h4>
          <p>
            This chart displays vehicle registrations categorised by type.
            {topType &&
              `${topType.label} vehicles account for ${topType.count.toLocaleString()} registrations`}
            , showing consumer preferences across different vehicle categories
            in Singapore.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 rounded-lg bg-surface-secondary/30 p-4 sm:grid-cols-3">
          <div className="text-center">
            <div className="font-semibold text-foreground text-lg">
              {topType?.label || "N/A"}
            </div>
            <div className="text-muted text-xs">Most Popular</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-foreground text-lg">
              {totalRegistrations.toLocaleString()}
            </div>
            <div className="text-muted text-xs">Total Registrations</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-foreground text-lg">
              {chartData.length}
            </div>
            <div className="text-muted text-xs">Vehicle Types</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarChartByType;
