import { NumberValue } from "@heroui-pro/react";
import {
  loadEvMonth,
  type SelectionProps,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-report";
import { mixCaption } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-summary";

export async function MixCaption({ selection }: SelectionProps) {
  const { month } = await selection;
  const data = await loadEvMonth(month);

  return data ? mixCaption(data.split, data.point.month, data.total) : null;
}

/**
 * The month's new cars by fuel type as a ruled list, each with its count and
 * share, the bars on one scale set by the largest group.
 */
export async function ElectrifiedMix({ selection }: SelectionProps) {
  const { month } = await selection;
  const data = await loadEvMonth(month);
  if (!data) {
    return null;
  }

  const largest = Math.max(...data.split.map((segment) => segment.value), 1);

  return (
    <div className="flex flex-col">
      <div className="flex items-end gap-4 pb-2 font-semibold text-muted text-xs">
        <span className="w-32 md:w-40">Fuel type</span>
        <span className="min-w-0 flex-1" />
        <span className="w-16 text-right">Cars</span>
        <span className="w-14 text-right">Share</span>
      </div>
      <ul className="flex flex-col">
        {data.split.map((segment) => (
          <li
            className="flex items-center gap-4 border-separator border-t py-2"
            key={segment.label}
          >
            <span className="w-32 font-semibold text-sm md:w-40">
              {segment.label}
            </span>
            <span
              aria-hidden
              className="block h-2.5 min-w-0 flex-1 rounded-r-sm bg-default"
            >
              <span
                className="block h-full rounded-r-sm"
                style={{
                  background: segment.colour,
                  width: `${((segment.value / largest) * 100).toFixed(1)}%`,
                }}
              />
            </span>
            <span className="w-16 text-right font-semibold text-sm tabular-nums">
              <NumberValue
                locale="en-SG"
                maximumFractionDigits={0}
                value={segment.value}
              />
            </span>
            <span className="w-14 text-right text-sm tabular-nums">
              {segment.share.toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
