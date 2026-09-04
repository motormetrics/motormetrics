import { KPIGroup } from "@heroui-pro/react";
import { KPI } from "@heroui-pro/react/kpi";
import type { MakesSummary as MakesSummaryType } from "@web/types";

interface MakesSummaryProps {
  summary: MakesSummaryType;
}

export function MakesSummary({ summary }: MakesSummaryProps) {
  return (
    <KPIGroup>
      <KPI>
        <KPI.Header>
          <KPI.Title>Total Makes</KPI.Title>
        </KPI.Header>
        <KPI.Content>
          <KPI.Value
            className="text-2xl text-accent-strong"
            locale="en-SG"
            maximumFractionDigits={0}
            value={summary.totalMakes}
          />
        </KPI.Content>
      </KPI>
      <KPIGroup.Separator />
      <KPI>
        <KPI.Header>
          <KPI.Title>Total Registrations</KPI.Title>
        </KPI.Header>
        <KPI.Content>
          <KPI.Value
            className="text-2xl text-accent-strong"
            locale="en-SG"
            maximumFractionDigits={0}
            value={summary.totalRegistrations}
          />
        </KPI.Content>
      </KPI>
      <KPIGroup.Separator />
      <KPI>
        <KPI.Header>
          <KPI.Title>Market Leader</KPI.Title>
        </KPI.Header>
        <KPI.Content>
          <span className="font-bold text-2xl text-accent-strong">
            {summary.marketLeader}
          </span>
        </KPI.Content>
      </KPI>
    </KPIGroup>
  );
}
