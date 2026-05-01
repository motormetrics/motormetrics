import Typography from "@web/components/typography";
import type { MakesSummary as MakesSummaryType } from "@web/types";

interface MakesSummaryProps {
  summary: MakesSummaryType;
}

export function MakesSummary({ summary }: MakesSummaryProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="flex flex-col gap-2 rounded-2xl bg-default p-4">
        <Typography.Caption>Total Makes</Typography.Caption>
        <span className="font-bold text-2xl text-accent tabular-nums">
          {summary.totalMakes.toLocaleString()}
        </span>
      </div>
      <div className="flex flex-col gap-2 rounded-2xl bg-default p-4">
        <Typography.Caption>Total Registrations</Typography.Caption>
        <span className="font-bold text-2xl text-accent tabular-nums">
          {summary.totalRegistrations.toLocaleString()}
        </span>
      </div>
      <div className="flex flex-col gap-2 rounded-2xl bg-default p-4">
        <Typography.Caption>Market Leader</Typography.Caption>
        <span className="font-bold text-2xl text-accent">
          {summary.marketLeader}
        </span>
      </div>
    </div>
  );
}
