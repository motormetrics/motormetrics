import { NumberValue } from "@heroui-pro/react";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import { Headline } from "@web/components/shared/overview";
import { SparklineChart } from "@web/components/shared/sparkline-chart";
import type { SearchParams } from "nuqs/server";
import { loadSearchParams, RANGE_LABELS } from "../search-params";
import { loadMakeRows } from "./make-rows";

/** The page headline: the leading make's count, share and 12-month trend. */
export async function LeadingMakeCard({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { fuel, range } = await loadSearchParams(searchParams);
  const { rows } = await loadMakeRows(range, fuel);
  const leader = rows[0];

  if (!leader) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <Headline
        caption={`registrations · ${leader.share.toFixed(1)}% of the market · ${RANGE_LABELS[range]}`}
        delta={
          leader.yoyChange === null ? null : (
            <DeltaChip value={leader.yoyChange} />
          )
        }
        label={
          <span className="flex items-center gap-3">
            <MakeAvatar logoUrl={leader.logoUrl} make={leader.make} size={36} />
            {leader.make} leads the market
          </span>
        }
        value={
          <NumberValue
            locale="en-SG"
            maximumFractionDigits={0}
            value={leader.count}
          />
        }
      />
      <SparklineChart
        title={`${leader.make} registrations over the last ${leader.trend.length} months`}
        values={leader.trend}
      />
    </div>
  );
}
