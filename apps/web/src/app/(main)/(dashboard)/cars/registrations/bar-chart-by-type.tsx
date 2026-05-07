import { BarChart, NumberValue } from "@heroui-pro/react";
import type { RegistrationStat } from "@web/types/cars";
import { formatVehicleType } from "@web/utils/formatting/format-vehicle-type";

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

  return (
    <div className="flex flex-col gap-4">
      <BarChart
        data={chartData}
        height={250}
        layout="vertical"
        aria-label={`Vehicle registrations by type, showing ${chartData[0]?.label || "top category"} with ${chartData[0]?.count || 0} registrations`}
      >
        <BarChart.XAxis type="number" dataKey="count" hide />
        <BarChart.YAxis
          dataKey="label"
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          width={120}
        />
        <BarChart.Tooltip
          content={<BarChart.TooltipContent indicator="line" />}
        />
        <BarChart.Bar
          dataKey="count"
          fill="var(--chart-1)"
          label={{
            dataKey: "count",
            fill: "var(--foreground)",
            fontSize: 12,
            offset: 8,
            position: "right",
          }}
          radius={4}
        />
      </BarChart>
      <div className="flex flex-col gap-4">
        <div className="text-muted text-sm">
          <h4 className="mb-2 font-semibold text-foreground">
            Vehicle Type Distribution
          </h4>
          <p>
            This chart displays vehicle registrations categorised by type.
            {topType ? (
              <>
                {topType.label} vehicles account for{" "}
                <NumberValue
                  locale="en-SG"
                  maximumFractionDigits={0}
                  value={topType.count}
                />{" "}
                registrations
              </>
            ) : null}
            , showing consumer preferences across different vehicle categories
            in Singapore.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 rounded-lg bg-surface/30 p-4 sm:grid-cols-3">
          <div className="text-center">
            <div className="font-semibold text-foreground text-lg">
              {topType?.label || "N/A"}
            </div>
            <div className="text-muted text-xs">Most Popular</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-foreground text-lg">
              <NumberValue
                locale="en-SG"
                maximumFractionDigits={0}
                value={totalRegistrations}
              />
            </div>
            <div className="text-muted text-xs">Total Registrations</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-foreground text-lg">
              <NumberValue
                locale="en-SG"
                maximumFractionDigits={0}
                value={chartData.length}
              />
            </div>
            <div className="text-muted text-xs">Vehicle Types</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarChartByType;
