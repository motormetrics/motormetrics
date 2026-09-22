import { OG_COLOURS } from "@web/lib/og/colours";
import { OG_CONFIG } from "@web/lib/og/config";
import type { ReactNode } from "react";

interface FrameProps {
  /** 630 for og:image, 600 for twitter:image */
  height: number;
  /** Right-hand footer label; defaults to the site domain */
  footerLabel?: string;
  children: ReactNode;
}

/**
 * Cream full-bleed card with the shared MotorMetrics footer.
 *
 * Every share card in the design comp ends with the same row: the mark in
 * its cream tile, the wordmark, and a right-aligned label. The tile keeps
 * the house geometry — 23% radius and arches at 69% of the frame — and
 * carries an edge because the card ground is cream too.
 */
export function Frame({
  height,
  footerLabel = OG_CONFIG.siteUrl,
  children,
}: FrameProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: OG_CONFIG.width,
        height,
        padding: "54px 60px",
        backgroundColor: OG_COLOURS.background,
        color: OG_COLOURS.ink,
        fontFamily: OG_CONFIG.fontFamily,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {children}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 15,
          marginTop: 28,
          paddingTop: 24,
          borderTop: `2px solid ${OG_COLOURS.rule}`,
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 64,
            height: 64,
            borderRadius: 15,
            backgroundColor: OG_COLOURS.background,
            border: `2px solid ${OG_COLOURS.rule}`,
            boxSizing: "border-box",
          }}
        >
          <svg
            role="img"
            aria-label="MotorMetrics"
            width="44"
            height="44"
            viewBox="0 0 64 64"
            fill="none"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M8 50 V30 a12 12 0 0 1 24 0 V50"
              stroke={OG_COLOURS.inkDeep}
            />
            <path
              d="M32 50 V30 a12 12 0 0 1 24 0 V50"
              stroke={OG_COLOURS.accent}
            />
          </svg>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 29,
            fontWeight: 800,
            letterSpacing: "-0.03em",
          }}
        >
          <span style={{ color: OG_COLOURS.inkDeep }}>motor</span>
          <span style={{ color: OG_COLOURS.accent }}>metrics</span>
        </div>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 23,
            fontWeight: 600,
            color: OG_COLOURS.subtle,
          }}
        >
          {footerLabel}
        </span>
      </div>
    </div>
  );
}
