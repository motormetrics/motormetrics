import { OG_COLOURS } from "@web/lib/og/colours";
import { Frame } from "@web/lib/og/templates/frame";
import { Pill } from "@web/lib/og/templates/pill";

const DONUT_SIZE = 300;
const RING_WIDTH = 62;
const RADIUS = (DONUT_SIZE - RING_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export interface FuelSlice {
  label: string;
  /** Share of the month, in percent */
  share: number;
  colour: string;
}

export interface FuelMixProps {
  height: number;
  monthLabel: string;
  /** Battery-electric share, in percent */
  electricShare: number;
  /** Slices in drawing order from twelve o'clock */
  slices: FuelSlice[];
}

/** 06 · EV and fuel-type share for the latest month */
export function FuelMix({
  height,
  monthLabel,
  electricShare,
  slices,
}: FuelMixProps) {
  const headline =
    electricShare >= 30
      ? "Electric crosses 30% of new registrations"
      : `Electric reaches ${electricShare.toFixed(1)}% of new registrations`;

  let drawn = 0;
  const arcs = slices.map((slice) => {
    const length = (slice.share / 100) * CIRCUMFERENCE;
    // A positive dash offset shifts the dash anticlockwise, so a quarter turn
    // moves the start from three o'clock to twelve.
    const offset = CIRCUMFERENCE / 4 - (drawn / 100) * CIRCUMFERENCE;
    drawn += slice.share;

    return { ...slice, length, offset };
  });

  return (
    <Frame height={height}>
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: 52,
          minHeight: 0,
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            width: DONUT_SIZE,
            height: DONUT_SIZE,
            flexShrink: 0,
          }}
        >
          <svg
            role="img"
            aria-label="Fuel mix"
            width={DONUT_SIZE}
            height={DONUT_SIZE}
            viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
          >
            {arcs.map((arc) => (
              <circle
                key={arc.label}
                cx={DONUT_SIZE / 2}
                cy={DONUT_SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={arc.colour}
                strokeWidth={RING_WIDTH}
                strokeDasharray={`${arc.length} ${CIRCUMFERENCE - arc.length}`}
                strokeDashoffset={arc.offset}
              />
            ))}
          </svg>
          <div
            style={{
              position: "absolute",
              top: RING_WIDTH,
              left: RING_WIDTH,
              width: DONUT_SIZE - RING_WIDTH * 2,
              height: DONUT_SIZE - RING_WIDTH * 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: 54,
                fontWeight: 800,
                letterSpacing: "-0.035em",
                lineHeight: 1,
                color: OG_COLOURS.accent,
              }}
            >
              {`${electricShare.toFixed(1)}%`}
            </span>
            <span
              style={{
                marginTop: 4,
                fontSize: 20,
                fontWeight: 700,
                color: OG_COLOURS.subtle,
              }}
            >
              electric
            </span>
          </div>
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          <Pill>{`Fuel mix · ${monthLabel}`}</Pill>
          <h2
            style={{
              margin: "20px 0 0 0",
              fontSize: 56,
              lineHeight: 1.05,
              fontWeight: 800,
              letterSpacing: "-0.035em",
              color: OG_COLOURS.ink,
            }}
          >
            {headline}
          </h2>
          <div
            style={{
              marginTop: 24,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {slices.map((slice) => (
              <div
                key={slice.label}
                style={{ display: "flex", alignItems: "center", gap: 14 }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 7,
                    backgroundColor: slice.colour,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 25,
                    fontWeight: 600,
                    color: OG_COLOURS.label,
                  }}
                >
                  {slice.label}
                </span>
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 25,
                    fontWeight: 800,
                    color: OG_COLOURS.ink,
                  }}
                >
                  {`${slice.share.toFixed(1)}%`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}
