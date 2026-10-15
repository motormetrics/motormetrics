import { share } from "@web/app/(main)/(dashboard)/cars/fuel-types/[type]/components/fuel-type-shared";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import type { TypeCount } from "@web/queries/cars/type-detail";
import { formatVehicleType } from "@web/utils/formatting/format-vehicle-type";

/** The fuel type's registrations split by vehicle type. */
export function FuelTypeBodyTypes({
  crossMix,
  periodLabel,
  typeTotal,
  value,
}: {
  crossMix: TypeCount[];
  periodLabel: string;
  typeTotal: number;
  value: string;
}) {
  return (
    <section className="flex min-w-0 flex-col gap-4">
      <SectionHead
        caption={`${value} · ${periodLabel}`}
        eyebrow="Body types"
        title="By vehicle type"
      />
      <div className="flex flex-col">
        <div className="flex items-end gap-3 border-border border-b pb-2 font-semibold text-muted text-xs">
          <span className="min-w-0 flex-1">Vehicle type</span>
          <span className="w-16 shrink-0 text-right md:w-20">Cars</span>
          <span className="w-14 shrink-0 text-right md:w-36">Share</span>
        </div>
        <ul className="flex flex-col">
          {crossMix.map(({ count, name }, index) => (
            <li
              className="flex items-center gap-3 border-separator border-b py-2.5"
              key={name}
            >
              <span className="min-w-0 flex-1 truncate text-sm">
                {formatVehicleType(name)}
              </span>
              <span className="w-16 shrink-0 text-right font-semibold text-sm tabular-nums md:w-20">
                {count.toLocaleString("en-SG")}
              </span>
              <span className="flex w-14 shrink-0 items-center justify-end gap-2.5 md:w-36">
                <span className="block h-2.5 min-w-0 flex-1 bg-surface-secondary max-md:hidden">
                  <span
                    className="block h-full rounded-r-xs"
                    style={{
                      background:
                        index === 0 ? "var(--chart-1)" : "var(--chart-3)",
                      width: `${share(count, crossMix[0]?.count ?? 0).toFixed(1)}%`,
                    }}
                  />
                </span>
                <span className="w-12 shrink-0 text-right text-muted-strong text-sm tabular-nums">
                  {share(count, typeTotal).toFixed(1)}%
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <SourceNote>
        A car counts in the month it is registered, under the fuel type LTA
        records against it.
      </SourceNote>
    </section>
  );
}
