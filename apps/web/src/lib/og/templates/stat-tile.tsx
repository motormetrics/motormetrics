import { OG_COLOURS } from "@web/lib/og/colours";
import type { ReactNode } from "react";

interface StatTileProps {
  value: string;
  label: string;
  /** Optional row rendered under the value, e.g. a delta chip */
  children?: ReactNode;
  /** Put the label above the value (COE category tiles) */
  labelFirst?: boolean;
  valueSize?: number;
}

/** White rounded tile carrying one headline figure */
export function StatTile({
  value,
  label,
  children,
  labelFirst = false,
  valueSize = 40,
}: StatTileProps) {
  const labelNode = (
    <span
      style={{
        fontSize: labelFirst ? 21 : 19,
        fontWeight: labelFirst ? 700 : 600,
        color: OG_COLOURS.muted,
      }}
    >
      {label}
    </span>
  );

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: labelFirst ? 8 : 2,
        padding: labelFirst ? "22px 22px 20px 22px" : "18px 24px",
        borderRadius: labelFirst ? 26 : 24,
        backgroundColor: OG_COLOURS.surface,
        boxShadow: OG_COLOURS.tileShadow,
      }}
    >
      {labelFirst && labelNode}
      <span
        style={{
          fontSize: valueSize,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: OG_COLOURS.ink,
        }}
      >
        {value}
      </span>
      {!labelFirst && labelNode}
      {children}
    </div>
  );
}
