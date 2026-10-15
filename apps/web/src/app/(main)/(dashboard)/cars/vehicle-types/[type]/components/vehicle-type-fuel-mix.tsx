import { share } from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/vehicle-type-shared";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import type { TypeCount } from "@web/queries/cars/type-detail";

/**
 * The comp's fuel colours: slate for electric and hybrid, sand for petrol.
 * Any other LTA fuel type takes the palest slate step.
 */
const FUEL_COLOURS: Record<string, string> = {
  Electric: "var(--chart-1)",
  Petrol: "var(--chart-sand)",
  "Petrol-Electric": "var(--chart-3)",
  "Petrol-Electric (Plug-In)": "var(--chart-4)",
};

function fuelColour(fuelType: string): string {
  return FUEL_COLOURS[fuelType] ?? "var(--chart-6)";
}

/** The vehicle type's registrations split by fuel type. */
export function VehicleTypeFuelMix({
  crossMix,
  displayName,
  periodLabel,
  typeTotal,
}: {
  crossMix: TypeCount[];
  displayName: string;
  periodLabel: string;
  typeTotal: number;
}) {
  return (
    <section className="flex min-w-0 flex-col gap-4">
      <SectionHead
        caption={`${displayName} · ${periodLabel.toLowerCase()}`}
        eyebrow="Mix"
        title="By fuel type"
      />
      {/* One segment per fuel type, sized by its share of the type. */}
      <div aria-hidden="true" className="flex h-4 gap-0.5">
        {crossMix.map(({ count, name }) => (
          <span
            className="block h-full"
            key={name}
            style={{
              background: fuelColour(name),
              width: `${share(count, typeTotal).toFixed(1)}%`,
            }}
          />
        ))}
      </div>
      <div className="flex flex-col">
        <div className="flex items-end gap-2.5 border-border border-b pb-2 font-semibold text-muted text-xs">
          <span className="w-3 shrink-0" />
          <span className="min-w-0 flex-1">Fuel type</span>
          <span className="w-16 shrink-0 text-right">Cars</span>
          <span className="w-14 shrink-0 text-right">Share</span>
        </div>
        <ul className="flex flex-col">
          {crossMix.map(({ count, name }) => (
            <li
              className="flex items-center gap-2.5 border-separator border-b py-2.5"
              key={name}
            >
              <span
                className="block size-3 shrink-0 rounded-xs"
                style={{ background: fuelColour(name) }}
              />
              <span className="min-w-0 flex-1 truncate text-sm">{name}</span>
              <span className="w-16 shrink-0 text-right text-sm tabular-nums">
                {count.toLocaleString("en-SG")}
              </span>
              <span className="w-14 shrink-0 text-right font-semibold text-sm tabular-nums">
                {share(count, typeTotal).toFixed(1)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
      <SourceNote>
        Share of {displayName} registrations in the period.
      </SourceNote>
    </section>
  );
}
