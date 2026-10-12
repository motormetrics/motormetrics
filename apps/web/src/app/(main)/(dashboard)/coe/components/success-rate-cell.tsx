import { Meter } from "@heroui/react";

/** A success-rate bar with its percentage, for the COE report tables. */
export function SuccessRateCell({ rate }: { rate: number }) {
  return (
    // Track and figure on one line rather than Meter's stacked grid, so the
    // bar fits a table row.
    <Meter
      aria-label="Success rate"
      className="flex items-center gap-3"
      formatOptions={{ maximumFractionDigits: 0, style: "percent" }}
      maxValue={1}
      size="sm"
      value={Math.min(rate, 100) / 100}
    >
      <Meter.Track className="flex-1">
        <Meter.Fill />
      </Meter.Track>
      <Meter.Output className="w-10 text-right font-bold text-muted-strong text-sm tabular-nums" />
    </Meter>
  );
}
