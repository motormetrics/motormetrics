import { cn, Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { CostTrendChip } from "@web/components/shared/cost-trend-chip";

/**
 * One hairline PQP row: the category letter, the renewal rate and its trend
 * against the previous month. Render inside a `<ul>`.
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
    <li className="flex items-center gap-3.5 border-separator border-b py-3.5">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft font-extrabold text-[17px] text-accent-strong">
        {letter}
      </span>
      <div className="flex min-w-0 flex-col gap-px">
        <span className="font-extrabold text-lg tabular-nums">
          <NumberValue
            currency="SGD"
            locale="en-SG"
            maximumFractionDigits={0}
            style="currency"
            value={value}
          />
        </span>
        <Typography.Paragraph
          className={cn("font-medium", descriptionClassName)}
          color="muted"
          size="sm"
          truncate
        >
          {description}
        </Typography.Paragraph>
      </div>
      <div className="ml-auto shrink-0">
        <CostTrendChip changeRatio={changeRatio} />
      </div>
    </li>
  );
}
