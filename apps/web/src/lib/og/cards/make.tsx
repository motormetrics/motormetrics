import { OG_COLOURS } from "@web/lib/og/colours";
import { Frame } from "@web/lib/og/templates/frame";
import { Pill } from "@web/lib/og/templates/pill";

export interface MakeBar {
  make: string;
  total: number;
}

export interface MakeProps {
  height: number;
  monthLabel: string;
  /** Make as stored, e.g. "Toyota" */
  make: string;
  /** Rank within the month, or null when outside the top ten */
  rank: number | null;
  /** Make's registrations for the month, already formatted */
  total: string;
  /** Make's share of the month, already formatted */
  share: string;
  /** Top makes for the month, highest first */
  bars: MakeBar[];
}

/** 05 · Make page: name, rank and volume swap per page */
export function Make({
  height,
  monthLabel,
  make,
  rank,
  total,
  share,
  bars,
}: MakeProps) {
  const maxTotal = Math.max(...bars.map((bar) => bar.total), 1);
  const nameSize = make.length > 9 ? 60 : 82;

  return (
    <Frame height={height}>
      <div style={{ flex: 1, display: "flex", gap: 44, minHeight: 0 }}>
        <div
          style={{
            width: 460,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Pill>{`${rank === 1 ? "Top make" : "Make"} · ${monthLabel}`}</Pill>
          <div
            style={{
              marginTop: 20,
              display: "flex",
              alignItems: "center",
              gap: 18,
            }}
          >
            <span
              style={{
                fontSize: nameSize,
                lineHeight: 1,
                fontWeight: 800,
                letterSpacing: "-0.04em",
                color: OG_COLOURS.ink,
              }}
            >
              {make}
            </span>
            {rank !== null && (
              <span
                style={{
                  backgroundColor: OG_COLOURS.accent,
                  color: OG_COLOURS.surface,
                  borderRadius: 999,
                  padding: "8px 20px",
                  fontSize: 28,
                  fontWeight: 800,
                }}
              >
                {`#${rank}`}
              </span>
            )}
          </div>
          <div
            style={{
              marginTop: 28,
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
              <span
                style={{
                  fontSize: 54,
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: OG_COLOURS.ink,
                }}
              >
                {total}
              </span>
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: OG_COLOURS.muted,
                }}
              >
                cars registered
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
              <span
                style={{
                  fontSize: 54,
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: OG_COLOURS.accent,
                }}
              >
                {share}
              </span>
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: OG_COLOURS.muted,
                }}
              >
                of the month
              </span>
            </div>
          </div>
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 16,
            minWidth: 0,
          }}
        >
          {bars.map((bar) => {
            const highlight = bar.make === make;

            return (
              <div
                key={bar.make}
                style={{ display: "flex", alignItems: "center", gap: 16 }}
              >
                <span
                  style={{
                    width: 230,
                    fontSize: 24,
                    fontWeight: highlight ? 800 : 600,
                    color: highlight ? OG_COLOURS.ink : OG_COLOURS.muted,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {bar.make}
                </span>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    height: 26,
                    borderRadius: 999,
                    backgroundColor: OG_COLOURS.rule,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${((bar.total / maxTotal) * 100).toFixed(1)}%`,
                      borderRadius: 999,
                      backgroundColor: highlight
                        ? OG_COLOURS.accent
                        : OG_COLOURS.accentMuted,
                    }}
                  />
                </div>
                <span
                  style={{
                    width: 110,
                    textAlign: "right",
                    fontSize: 24,
                    fontWeight: 800,
                    color: highlight ? OG_COLOURS.ink : OG_COLOURS.muted,
                  }}
                >
                  {bar.total.toLocaleString("en-SG")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Frame>
  );
}
