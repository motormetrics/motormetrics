import { formatCurrency } from "@motormetrics/utils/format-currency";
import type { ExercisePremium } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { exerciseStamp } from "@web/app/(main)/(dashboard)/coe/premiums/components/premiums-shared";
import { SourceNote } from "@web/components/shared/overview";

/**
 * One band of the premium-range block: where a window's low and high sit on a
 * track from $0 to the category's all-time high, with the exercise each was
 * set in.
 */
export function PremiumRangeBar({
  high,
  label,
  low,
  scale,
}: {
  high: ExercisePremium;
  label: string;
  low: ExercisePremium;
  scale: number;
}) {
  const ceiling = scale || 1;
  const left = Math.min((low.premium / ceiling) * 100, 100);
  const width = Math.max(((high.premium - low.premium) / ceiling) * 100, 1);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline gap-3">
        <span className="font-semibold text-sm">{label}</span>
        <SourceNote className="ml-auto whitespace-nowrap tabular-nums">
          spread {formatCurrency(high.premium - low.premium)}
        </SourceNote>
      </div>
      <div className="relative h-3 border-border border-l bg-surface-secondary">
        <span
          className="absolute inset-y-0 bg-chart-1"
          style={{ left: `${left.toFixed(1)}%`, width: `${width.toFixed(1)}%` }}
        />
      </div>
      <div className="flex flex-wrap gap-3 text-muted-strong text-sm tabular-nums">
        <span>
          Low{" "}
          <span className="font-semibold text-foreground">
            {formatCurrency(low.premium)}
          </span>{" "}
          <span className="text-muted text-xs">{exerciseStamp(low)}</span>
        </span>
        <span className="ml-auto text-right">
          High{" "}
          <span className="font-semibold text-foreground">
            {formatCurrency(high.premium)}
          </span>{" "}
          <span className="text-muted text-xs">{exerciseStamp(high)}</span>
        </span>
      </div>
    </div>
  );
}
