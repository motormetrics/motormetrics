import { OG_COLOURS } from "@web/lib/og/colours";
import { OG_CONFIG } from "@web/lib/og/config";
import { Frame } from "@web/lib/og/templates/frame";
import { Pill } from "@web/lib/og/templates/pill";
import { StatTile } from "@web/lib/og/templates/stat-tile";

export interface SiteDefaultProps {
  height: number;
  /** Latest Category A premium, already formatted */
  coePremiumA: string;
  /** Latest Category B premium, already formatted */
  coePremiumB: string;
  /** Latest month's registrations, already formatted */
  registrations: string;
  /** Battery-electric share of the latest month, already formatted */
  electricShare: string;
  /** e.g. "October 2025" */
  monthLabel: string;
}

/** 01 · Site default: home and any page without its own card */
export function SiteDefault({
  height,
  coePremiumA,
  coePremiumB,
  registrations,
  electricShare,
  monthLabel,
}: SiteDefaultProps) {
  return (
    <Frame height={height} footerLabel={monthLabel}>
      <Pill>{OG_CONFIG.siteUrl}</Pill>
      <h2
        style={{
          margin: "22px 0 0 0",
          fontSize: 60,
          lineHeight: 1.05,
          fontWeight: 800,
          letterSpacing: "-0.035em",
          color: OG_COLOURS.ink,
          maxWidth: 840,
        }}
      >
        Singapore's car market, in numbers
      </h2>
      <p
        style={{
          margin: "16px 0 0 0",
          fontSize: 25,
          fontWeight: 600,
          lineHeight: 1.35,
          color: OG_COLOURS.muted,
          maxWidth: 780,
        }}
      >
        COE premiums, registrations, PARF and EV share — from LTA data,
        refreshed daily.
      </p>
      <div style={{ flex: 1, minHeight: 36 }} />
      <div style={{ display: "flex", gap: 18 }}>
        <StatTile value={coePremiumA} label="Cat A COE premium" />
        <StatTile value={coePremiumB} label="Cat B COE premium" />
        <StatTile value={registrations} label="cars registered" />
        <StatTile value={electricShare} label="electric share" />
      </div>
    </Frame>
  );
}
