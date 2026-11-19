import { OG_COLOURS } from "@web/lib/og/colours";
import { sparkline } from "@web/lib/og/sparkline";
import { Frame } from "@web/lib/og/templates/frame";
import { Pill } from "@web/lib/og/templates/pill";

const CHART_WIDTH = 500;
const CHART_HEIGHT = 250;
const CHART_PAD = 16;

export interface CoePremiumSeries {
  /** e.g. "Cat A" */
  label: string;
  /** The month's first bidding premium, already formatted */
  first: string;
  /** The month's second bidding premium; absent until that exercise is held */
  second?: string;
  /** Monthly premiums, oldest first */
  trend: number[];
}

export interface CoePremiumsProps {
  height: number;
  /** Cat A first, Cat B second */
  categories: [CoePremiumSeries, CoePremiumSeries];
  /** Label under the first trend point, e.g. "Jan 2026" */
  fromLabel: string;
  /** Label under the last trend point, e.g. "Aug 2026" */
  monthLabel: string;
}

const LINE_COLOURS = [OG_COLOURS.accent, OG_COLOURS.ink] as const;

/** 03 · Cat A and Cat B premiums side by side, with both trends on one chart */
export function CoePremiums({
  height,
  categories,
  fromLabel,
  monthLabel,
}: CoePremiumsProps) {
  const allPoints = categories.flatMap((category) => category.trend);
  const domain = {
    min: Math.min(...allPoints),
    max: Math.max(...allPoints),
  };
  const sparks = categories.map((category) =>
    sparkline(category.trend, CHART_WIDTH, CHART_HEIGHT, CHART_PAD, domain),
  );

  return (
    <Frame height={height}>
      <div style={{ flex: 1, display: "flex", gap: 44, minHeight: 0 }}>
        <div
          style={{
            width: 520,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Pill>{`COE premiums · ${monthLabel}`}</Pill>
          <div
            style={{
              marginTop: 22,
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {categories.map((category, index) => (
              <div
                key={category.label}
                style={{ display: "flex", flexDirection: "column", gap: 8 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 5,
                      backgroundColor: LINE_COLOURS[index],
                    }}
                  />
                  <span
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: OG_COLOURS.subtle,
                    }}
                  >
                    {category.label}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 24 }}>
                  {[
                    { label: "1st bidding", value: category.first },
                    { label: "2nd bidding", value: category.second },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      style={{
                        width: 248,
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 20,
                          fontWeight: 600,
                          color: OG_COLOURS.subtle,
                        }}
                      >
                        {label}
                      </span>
                      <span
                        style={{
                          height: 48,
                          display: "flex",
                          alignItems: "center",
                          fontSize: value ? 48 : 26,
                          lineHeight: 1,
                          fontWeight: value ? 800 : 600,
                          letterSpacing: value ? "-0.04em" : "0",
                          color: value ? OG_COLOURS.ink : OG_COLOURS.faint,
                        }}
                      >
                        {value ?? "Not held yet"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            minWidth: 0,
          }}
        >
          <svg
            role="img"
            aria-label="Cat A and Cat B premium trends"
            width="516"
            height={CHART_HEIGHT}
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            preserveAspectRatio="none"
            style={{ overflow: "visible" }}
          >
            <path
              d={sparks[0].area}
              fill={OG_COLOURS.accent}
              fillOpacity="0.12"
            />
            {sparks.map((spark, index) => (
              <path
                key={categories[index].label}
                d={spark.line}
                fill="none"
                stroke={LINE_COLOURS[index]}
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            {sparks.map((spark, index) => (
              <circle
                key={categories[index].label}
                cx={spark.cx}
                cy={spark.cy}
                r="10"
                fill={OG_COLOURS.background}
                stroke={LINE_COLOURS[index]}
                strokeWidth="6"
              />
            ))}
          </svg>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 14,
            }}
          >
            <span
              style={{ fontSize: 21, fontWeight: 600, color: OG_COLOURS.faint }}
            >
              {fromLabel}
            </span>
            <span
              style={{ fontSize: 21, fontWeight: 600, color: OG_COLOURS.faint }}
            >
              {monthLabel}
            </span>
          </div>
        </div>
      </div>
    </Frame>
  );
}
