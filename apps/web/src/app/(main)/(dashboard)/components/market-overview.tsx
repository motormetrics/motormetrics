import { Chip, Text } from "@heroui/react";
import { KPI, KPIGroup } from "@heroui-pro/react";
import { getCategorySummaryByYear } from "@web/queries/cars";

export async function MarketOverview() {
  const summary = await getCategorySummaryByYear();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Text type="h3">Market Overview</Text>
        <Chip color="accent" size="sm">
          {summary.year}
        </Chip>
      </div>
      <KPIGroup>
        <KPI>
          <KPI.Header>
            <KPI.Title>Total Cars</KPI.Title>
          </KPI.Header>
          <KPI.Content>
            <KPI.Value
              className="text-2xl text-accent"
              locale="en-SG"
              maximumFractionDigits={0}
              value={summary.total}
            />
          </KPI.Content>
        </KPI>
        <KPIGroup.Separator />
        <KPI>
          <KPI.Header>
            <KPI.Title>Electric</KPI.Title>
          </KPI.Header>
          <KPI.Content>
            <KPI.Value
              className="text-2xl text-accent"
              locale="en-SG"
              maximumFractionDigits={0}
              value={summary.electric}
            />
          </KPI.Content>
        </KPI>
        <KPIGroup.Separator />
        <KPI>
          <KPI.Header>
            <KPI.Title>Hybrid</KPI.Title>
          </KPI.Header>
          <KPI.Content>
            <KPI.Value
              className="text-2xl text-accent"
              locale="en-SG"
              maximumFractionDigits={0}
              value={summary.hybrid}
            />
          </KPI.Content>
        </KPI>
      </KPIGroup>
    </div>
  );
}
