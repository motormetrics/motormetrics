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
 * Every share card in the design comp ends with the same row: the bars mark,
 * the wordmark, and a right-aligned label.
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
            width: 46,
            height: 46,
            borderRadius: 11,
            border: `2px solid ${OG_COLOURS.rule}`,
            backgroundColor: OG_COLOURS.surface,
          }}
        >
          <svg
            role="img"
            aria-label="MotorMetrics"
            width="30"
            height="30"
            viewBox="0 0 64 64"
          >
            <rect
              x="4"
              y="10"
              width="8"
              height="44"
              rx="4"
              fill={OG_COLOURS.inkDeep}
            />
            <rect
              x="16"
              y="24"
              width="8"
              height="30"
              rx="4"
              fill={OG_COLOURS.accent}
            />
            <rect
              x="28"
              y="36"
              width="8"
              height="18"
              rx="4"
              fill={OG_COLOURS.accent}
            />
            <rect
              x="40"
              y="24"
              width="8"
              height="30"
              rx="4"
              fill={OG_COLOURS.accent}
            />
            <rect
              x="52"
              y="10"
              width="8"
              height="44"
              rx="4"
              fill={OG_COLOURS.inkDeep}
            />
          </svg>
        </div>
        <span
          style={{
            fontSize: 29,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: OG_COLOURS.inkDeep,
          }}
        >
          MotorMetrics
        </span>
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
