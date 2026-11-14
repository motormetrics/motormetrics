import { NumberValue } from "@heroui-pro/react";
import {
  loadEvMonth,
  type SelectionProps,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-report";
import {
  formatPoints,
  mixCaption,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-summary";
import { formatMonthName } from "@web/utils/dates/format-month";

/** "87.4%, +1.2 pts vs July", after "Electrified total" in the title. */
export async function MixTitle({ selection }: SelectionProps) {
  const { month } = await selection;
  const data = await loadEvMonth(month);
  if (!data) {
    return null;
  }

  const { electrifiedShare, previousElectrifiedShare, previousMonth } = data;

  return previousMonth && previousElectrifiedShare !== undefined
    ? `${electrifiedShare.toFixed(1)}%, ${formatPoints(electrifiedShare - previousElectrifiedShare)} vs ${formatMonthName(previousMonth)}`
    : `${electrifiedShare.toFixed(1)}%`;
}

export async function MixCaption({ selection }: SelectionProps) {
  const { month } = await selection;
  const data = await loadEvMonth(month);

  return data ? mixCaption(data.split, data.point.month, data.total) : null;
}

/**
 * The month's new cars split by powertrain: one bar, then a tile per
 * powertrain with its share and count.
 */
export async function ElectrifiedMix({ selection }: SelectionProps) {
  const { month } = await selection;
  const data = await loadEvMonth(month);
  if (!data) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3.5">
      <div
        aria-label="Share of new car registrations by powertrain"
        className="flex h-7 gap-0.5"
        role="img"
      >
        {data.split.map((segment) => (
          <span
            className="block h-full min-w-0.5 rounded-xs"
            key={segment.label}
            style={{
              background: segment.colour,
              width: `${segment.share.toFixed(2)}%`,
            }}
          />
        ))}
      </div>
      <dl className="grid @3xl:grid-cols-4 grid-cols-2 border-separator border-t">
        {data.split.map((segment) => (
          <div
            className="flex flex-col gap-1 border-separator border-b py-3.5 pr-4"
            key={segment.label}
          >
            <dt className="flex items-center gap-1.5 font-semibold text-muted text-xs">
              <span
                aria-hidden
                className="size-2.5 shrink-0 rounded-xs"
                style={{ background: segment.colour }}
              />
              {segment.label}
            </dt>
            <dd className="font-semibold text-xl tabular-nums">
              {segment.share.toFixed(1)}%
            </dd>
            <dd className="text-muted text-xs tabular-nums">
              <NumberValue
                locale="en-SG"
                maximumFractionDigits={0}
                value={segment.value}
              />{" "}
              cars
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
