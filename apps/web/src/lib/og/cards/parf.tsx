import { OG_COLOURS } from "@web/lib/og/colours";
import { Frame } from "@web/lib/og/templates/frame";
import { Pill } from "@web/lib/og/templates/pill";

interface ParfProps {
  height: number;
}

/** 08 · PARF calculator: evergreen tool card */
export function Parf({ height }: ParfProps) {
  return (
    <Frame height={height}>
      <Pill>Free tool</Pill>
      <h2
        style={{
          margin: "22px 0 0 0",
          fontSize: 62,
          lineHeight: 1.05,
          fontWeight: 800,
          letterSpacing: "-0.035em",
          color: OG_COLOURS.ink,
          maxWidth: 860,
        }}
      >
        What is your car worth at deregistration?
      </h2>
      <p
        style={{
          margin: "16px 0 0 0",
          fontSize: 26,
          fontWeight: 600,
          color: OG_COLOURS.muted,
        }}
      >
        PARF and COE rebate, worked out in seconds.
      </p>
      <div style={{ flex: 1, minHeight: 36 }} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 32,
          padding: "22px 30px",
          borderRadius: 28,
          backgroundColor: OG_COLOURS.surface,
          boxShadow: OG_COLOURS.tileShadow,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span
            style={{ fontSize: 20, fontWeight: 600, color: OG_COLOURS.muted }}
          >
            OMV
          </span>
          <span
            style={{
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: OG_COLOURS.ink,
            }}
          >
            $25,000
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span
            style={{ fontSize: 20, fontWeight: 600, color: OG_COLOURS.muted }}
          >
            Age at dereg
          </span>
          <span
            style={{
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: OG_COLOURS.ink,
            }}
          >
            4 years
          </span>
        </div>
        <svg
          role="img"
          aria-label="gives"
          width="38"
          height="38"
          viewBox="0 0 24 24"
          fill="none"
          stroke={OG_COLOURS.muted}
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 2,
          }}
        >
          <span
            style={{ fontSize: 20, fontWeight: 700, color: OG_COLOURS.accent }}
          >
            PARF rebate
          </span>
          <span
            style={{
              fontSize: 46,
              fontWeight: 800,
              letterSpacing: "-0.035em",
              color: OG_COLOURS.ink,
            }}
          >
            $18,750
          </span>
        </div>
      </div>
    </Frame>
  );
}
