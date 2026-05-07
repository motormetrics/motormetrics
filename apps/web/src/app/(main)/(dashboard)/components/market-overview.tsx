import { Card, Chip } from "@heroui/react";
import { KPI, KPIGroup } from "@heroui-pro/react";
import Typography from "@web/components/typography";
import { getCategorySummaryByYear } from "@web/queries/cars";

export async function MarketOverview() {
  const summary = await getCategorySummaryByYear();

  return (
    <Card>
      <Card.Content>
        <div className="mb-4 flex items-center justify-between">
          <Typography.H3>Market Overview</Typography.H3>
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
      </Card.Content>
    </Card>
  );
}
