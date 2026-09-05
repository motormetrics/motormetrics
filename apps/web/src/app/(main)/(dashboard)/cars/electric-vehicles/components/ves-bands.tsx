import { cn, Typography } from "@heroui/react";
import { SectionHead } from "@web/components/shared/overview";

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
    <div className="flex flex-col gap-6">
      <SectionHead
        caption="Vehicular Emissions Scheme bands most EVs qualify for"
        eyebrow="Incentives"
        link={{ href: "/learn", label: "EV ownership guide" }}
        title="VES bands"
      />

      <ul className="flex flex-col">
        {VES_BANDS.map((row) => (
          <li
            className="flex items-center gap-3.5 border-separator border-b py-3.5"
            key={row.band}
          >
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-full font-extrabold text-sm",
                row.value === "$0"
                  ? "bg-default text-muted-strong"
                  : "bg-accent-soft text-accent-strong",
              )}
            >
              {row.band}
            </span>
            <Typography.Paragraph className="font-semibold text-foreground/85">
              {row.note}
            </Typography.Paragraph>
            <span className="ml-auto font-extrabold text-lg tabular-nums">
              {row.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
