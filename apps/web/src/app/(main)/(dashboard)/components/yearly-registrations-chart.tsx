"use client";

import { BarChart } from "@heroui-pro/react";

interface YearlyRegistrationsChartProps {
  data: {
    registrations: number;
    year: string;
  }[];
}

export function YearlyRegistrationsChart({
  data,
}: Readonly<YearlyRegistrationsChartProps>) {
  return (
    <BarChart data={data} height={200}>
      <BarChart.Grid vertical={false} />
      <BarChart.XAxis dataKey="year" tickMargin={8} />
      <BarChart.YAxis width={42} />
      <BarChart.Bar
        barSize={20}
        dataKey="registrations"
        fill="var(--accent)"
        radius={[4, 4, 0, 0]}
      />
      <BarChart.Tooltip content={<BarChart.TooltipContent />} />
    </BarChart>
  );
}
