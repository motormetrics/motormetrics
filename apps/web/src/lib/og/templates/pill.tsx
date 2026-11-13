import { OG_COLOURS } from "@web/lib/og/colours";

interface PillProps {
  children: string;
  /** Filled accent pill (blog tag) rather than the soft default */
  tone?: "soft" | "solid";
}

/** Rounded eyebrow label that opens most cards */
export function Pill({ children, tone = "soft" }: PillProps) {
  const solid = tone === "solid";

  return (
    <span
      style={{
        alignSelf: "flex-start",
        backgroundColor: solid ? OG_COLOURS.accent : OG_COLOURS.accentSoft,
        color: solid ? OG_COLOURS.surface : OG_COLOURS.ink,
        borderRadius: 999,
        padding: "11px 24px",
        fontSize: 24,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
