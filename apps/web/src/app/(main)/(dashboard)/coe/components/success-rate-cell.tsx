import { ShareBar } from "@web/components/shared/report-table";

/** A success-rate bar with its percentage, for the COE report tables. */
export function SuccessRateCell({ rate }: { rate: number }) {
  return (
    <div className="flex items-center gap-3">
      {/* `isLeader` is the bar's darker fill — every row here
          carries it, since the rows are not ranked. */}
      <span className="flex-1">
        <ShareBar isLeader share={rate} />
      </span>
      <span className="w-10 text-right font-bold text-muted-strong text-sm tabular-nums">
        {rate.toFixed(0)}%
      </span>
    </div>
  );
}
