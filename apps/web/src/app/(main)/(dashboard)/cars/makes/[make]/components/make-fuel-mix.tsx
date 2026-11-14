import { Skeleton } from "@heroui/react";
import type { MakeSectionProps } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/make-report";
import { percentage } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/percentage";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { Suspense } from "react";

async function FuelMixCaption({ make, report }: MakeSectionProps) {
  const { periodCaption } = await report;

  return `Share of every ${make} registered · ${periodCaption}`;
}

/** One stacked bar of every fuel type, and a legend row for each. */
async function FuelMixFigure({ make, report }: MakeSectionProps) {
  const { fuelMix, makeTotal } = await report;

  return (
    <>
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
    </>
  );
}

/**
 * Every fuel type the make registered in the period. The heading and the note
 * are in the static shell; the caption and the figure wait behind their own
 * boundaries.
 */
export function MakeFuelMix({ make, report }: MakeSectionProps) {
  return (
    <section className="flex min-w-0 flex-col gap-4">
      <SectionHead
        caption={
          // A non-breaking space holds the caption's line until it arrives.
          <Suspense fallback={"\u00a0"}>
            <FuelMixCaption make={make} report={report} />
          </Suspense>
        }
        eyebrow="Mix"
        title="Fuel type mix"
      />
      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <FuelMixFigure make={make} report={report} />
      </Suspense>
      <SourceNote>
        All fuel types, whatever the fuel type switch is set to.
      </SourceNote>
    </section>
  );
}
