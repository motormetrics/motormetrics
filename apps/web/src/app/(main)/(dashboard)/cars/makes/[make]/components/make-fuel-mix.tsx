import { percentage } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/percentage";
import { SectionHead, SourceNote } from "@web/components/shared/overview";

/** Every fuel type the make registered in the period, as one stacked bar and a legend. */
export function MakeFuelMix({
  fuelMix,
  make,
  makeTotal,
  periodCaption,
}: {
  fuelMix: { color: string; count: number; name: string; note: string }[];
  make: string;
  makeTotal: number;
  periodCaption: string;
}) {
  return (
    <section className="flex min-w-0 flex-col gap-4">
      <SectionHead
        caption={`Share of every ${make} registered · ${periodCaption}`}
        eyebrow="Mix"
        title="Fuel type mix"
      />
      <div
        aria-label={`Share of ${make} registrations by fuel type`}
        className="flex h-4 gap-0.5"
        role="img"
      >
        {fuelMix.map(({ color, count, name }) => (
          <span
            className="block h-full"
            key={name}
            style={{
              background: color,
              width: `${((count / (makeTotal || 1)) * 100).toFixed(2)}%`,
            }}
          />
        ))}
      </div>
      <ul className="flex flex-col">
        {fuelMix.map(({ color, count, name, note }) => (
          <li
            className="flex items-center gap-2.5 border-separator border-b py-2"
            key={name}
          >
            <span
              aria-hidden
              className="size-3 shrink-0 rounded-xs"
              style={{ background: color }}
            />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm">{name}</span>
              <span className="truncate text-muted text-xs">{note}</span>
            </span>
            <span className="font-semibold text-sm tabular-nums">
              {percentage(count, makeTotal)}
            </span>
          </li>
        ))}
      </ul>
      <SourceNote>
        All fuel types, whatever the fuel type switch is set to.
      </SourceNote>
    </section>
  );
}
