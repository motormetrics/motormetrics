import { SectionHead, SourceNote } from "@web/components/shared/overview";

/**
 * Vehicular Emissions Scheme bands, as published by NEA.
 *
 * Static reference content: the bands and their rebates are policy rather than
 * anything the ingestion pipeline tracks, so they change only when the scheme
 * itself does.
 */
const VES_BANDS = [
  { band: "A1", note: "Rebate", value: "$25,000" },
  { band: "A2", note: "Rebate", value: "$15,000" },
  { band: "B", note: "Neutral band", value: "$0" },
];

export function VesBands() {
  return (
    <section className="flex min-w-0 flex-col gap-4">
      <SectionHead
        caption="Vehicular Emissions Scheme bands most EVs qualify for"
        eyebrow="Incentives"
        link={{ href: "/learn", label: "EV ownership guide" }}
        title="VES bands"
      />

      <div className="flex flex-col">
        <div className="flex items-center gap-3 border-border border-b pb-2 font-semibold text-muted text-xs">
          <span className="min-w-0 flex-1">Band</span>
          <span className="w-24 text-right">Amount</span>
        </div>
        <ul className="flex flex-col">
          {VES_BANDS.map((row) => (
            <li
              className="flex items-center gap-3 border-separator border-b py-2.5"
              key={row.band}
            >
              <span className="w-9 font-semibold text-sm">{row.band}</span>
              <span className="min-w-0 flex-1 text-muted-strong text-sm">
                {row.note}
              </span>
              <span className="w-24 text-right font-semibold tabular-nums">
                {row.value}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <SourceNote>
        Rebate amount for each Vehicular Emissions Scheme band.
      </SourceNote>
    </section>
  );
}
