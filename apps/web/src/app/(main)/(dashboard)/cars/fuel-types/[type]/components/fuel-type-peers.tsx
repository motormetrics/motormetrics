import { cn } from "@heroui/react";
import { share } from "@web/app/(main)/(dashboard)/cars/fuel-types/[type]/components/fuel-type-shared";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import type { TypeCount } from "@web/queries/cars/type-detail";

/** Every fuel type's registrations in the period, the current one marked. */
export function FuelTypePeers({
  distribution,
  periodLabel,
  value,
}: {
  distribution: TypeCount[];
  periodLabel: string;
  value: string;
}) {
  const peerLeader = distribution[0]?.count ?? 0;

  return (
    <section className="flex min-w-0 flex-col gap-4">
      <SectionHead
        caption={`${periodLabel} · new registrations`}
        eyebrow="Comparison"
        link={{ href: "/cars/fuel-types", label: "All fuel types" }}
        title="Against other fuel types"
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
                  "min-w-0 flex-1 truncate text-sm md:w-44 md:flex-none",
                  isSelected && "font-semibold text-accent-strong",
                )}
              >
                {peer.name}
              </span>
              <span className="block h-2.5 w-24 shrink-0 bg-surface-secondary md:w-auto md:flex-1">
                <span
                  className="block h-full rounded-r-xs"
                  style={{
                    background: isSelected
                      ? "var(--chart-1)"
                      : "var(--chart-3)",
                    width: `${share(peer.count, peerLeader).toFixed(1)}%`,
                  }}
                />
              </span>
              <span className="w-16 shrink-0 text-right font-semibold text-sm tabular-nums md:w-20">
                {peer.count.toLocaleString("en-SG")}
              </span>
            </li>
          );
        })}
      </ul>
      <SourceNote>
        LTA's own fuel types, kept unmerged: Petrol-Electric and Petrol-Electric
        (Plug-In) are counted separately.
      </SourceNote>
    </section>
  );
}
