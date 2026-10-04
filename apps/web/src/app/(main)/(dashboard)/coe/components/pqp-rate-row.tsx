import { cn } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { CostTrendChip } from "@web/components/shared/cost-trend-chip";

/** The three columns shared by the PQP rows and the header above them. */
export const PQP_ROW_GRID =
  "grid grid-cols-[minmax(0,1fr)_120px_90px] items-baseline gap-3 max-[720px]:grid-cols-[minmax(0,1fr)_96px_56px]";

/**
 * One hairline PQP row: "Cat X" with its note, the renewal rate and the grey
 * change against the previous month. The note drops out on phones. Render
 * inside a `<ul>`.
 */
export function PqpRateRow({
  changeRatio,
  description,
  descriptionClassName,
  letter,
  value,
}: {
  changeRatio: number;
  description: string;
  descriptionClassName?: string;
  letter: string;
  value: number;
}) {
  return (
    <li className={cn(PQP_ROW_GRID, "border-separator border-b py-[11px]")}>
      <span className="min-w-0 truncate text-sm">
        <b className="font-semibold">Cat {letter}</b>{" "}
        <span
          className={cn("text-muted max-[720px]:hidden", descriptionClassName)}
        >
          {description}
        </span>
      </span>
      <span className="text-right font-semibold text-base tabular-nums">
        <NumberValue
          currency="SGD"
          locale="en-SG"
          maximumFractionDigits={0}
          style="currency"
          value={value}
        />
      </span>
      <CostTrendChip changeRatio={changeRatio} className="text-right text-sm" />
    </li>
  );
}
