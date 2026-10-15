import { cn } from "@heroui/react";
import {
  type Period,
  periodRange,
} from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/period";
import { share } from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/vehicle-type-shared";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import type { TypeCount } from "@web/queries/cars/type-detail";
import { formatVehicleType } from "@web/utils/formatting/format-vehicle-type";

/** Every vehicle type's registrations in the period, the current one marked. */
export function VehicleTypePeers({
  distribution,
  month,
  period,
  value,
}: {
  distribution: TypeCount[];
  month: string;
  period: Period;
  value: string;
}) {
  const peerLeader = distribution[0]?.count ?? 0;

  return (
    <section className="flex min-w-0 flex-col gap-4">
      <SectionHead
        caption={periodRange(period, month)}
        eyebrow="Peers"
        link={{ href: "/cars/vehicle-types", label: "All vehicle types" }}
        title="Against other vehicle types"
      />
      <ul className="flex flex-col">
        {distribution.map((peer) => {
          const isSelected = peer.name === value;

          return (
            <li
              aria-current={isSelected ? "page" : undefined}
              className="flex items-center gap-3 border-separator border-b py-2.5"
              key={peer.name}
            >
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-sm md:w-36 md:flex-none",
                  isSelected && "font-semibold text-accent-strong",
                )}
              >
                {formatVehicleType(peer.name)}
              </span>
              <span className="block h-2.5 min-w-0 flex-1 bg-surface-secondary max-md:hidden">
                <span
                  className="block h-full rounded-r-xs"
                  style={{
                    background: isSelected
                      ? "var(--chart-1)"
                      : "var(--chart-5)",
                    width: `${share(peer.count, peerLeader).toFixed(1)}%`,
                  }}
                />
              </span>
              <span className="w-16 shrink-0 text-right font-semibold text-sm tabular-nums">
                {peer.count.toLocaleString("en-SG")}
              </span>
            </li>
          );
        })}
      </ul>
      <SourceNote>
        New car registrations by vehicle type in the period.
      </SourceNote>
    </section>
  );
}
