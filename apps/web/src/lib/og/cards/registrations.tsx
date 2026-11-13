import { OG_COLOURS } from "@web/lib/og/colours";
import { DeltaChip } from "@web/lib/og/templates/delta-chip";
import { Frame } from "@web/lib/og/templates/frame";
import { Pill } from "@web/lib/og/templates/pill";

/** Frame padding, footer and bar labels leave this much for the tallest bar */
const CHROME_HEIGHT = 108 + 100 + 48;

export interface RegistrationsColumn {
  /** Short month, e.g. "Oct" */
  label: string;
  total: number;
}

export interface RegistrationsProps {
  height: number;
  monthLabel: string;
  /** Latest month's total, already formatted */
  total: string;
  /** Change against the previous month, in percent */
  delta: number;
  /** Previous month's short name, e.g. "Sep" */
  previousMonthLabel: string;
  /** Year-to-date total, already formatted */
  yearToDate: string;
  /** Recent monthly totals, oldest first, latest last */
  columns: RegistrationsColumn[];
}

/** 04 · New car registrations for the latest month */
export function Registrations({
  height,
  monthLabel,
  total,
  delta,
  previousMonthLabel,
  yearToDate,
  columns,
}: RegistrationsProps) {
  const maxBar = height - CHROME_HEIGHT;
  const maxTotal = Math.max(...columns.map((column) => column.total), 1);

  return (
    <Frame height={height}>
      <div style={{ flex: 1, display: "flex", gap: 44, minHeight: 0 }}>
        <div
          style={{
            width: 470,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Pill>{`New registrations · ${monthLabel}`}</Pill>
          <span
            style={{
              marginTop: 22,
              fontSize: 130,
              lineHeight: 1,
              fontWeight: 800,
              letterSpacing: "-0.045em",
              color: OG_COLOURS.ink,
            }}
          >
            {total}
          </span>
          <div
            style={{
              marginTop: 18,
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <DeltaChip delta={delta} size="lg" />
            <span
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: OG_COLOURS.muted,
              }}
            >
              {`vs ${previousMonthLabel}`}
            </span>
          </div>
          <span
            style={{
              marginTop: 20,
              fontSize: 27,
              fontWeight: 600,
              lineHeight: 1.3,
              color: OG_COLOURS.muted,
            }}
          >
            {`cars registered · ${yearToDate} year to date`}
          </span>
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "flex-end",
            gap: 12,
            minWidth: 0,
          }}
        >
          {columns.map((column, index) => {
            const last = index === columns.length - 1;

            return (
              <div
                key={column.label}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    maxWidth: 58,
                    height: Math.max(
                      6,
                      Math.round((column.total / maxTotal) * maxBar),
                    ),
                    borderRadius: "14px 14px 5px 5px",
                    backgroundColor: last
                      ? OG_COLOURS.accent
                      : OG_COLOURS.accentSoft,
                  }}
                />
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 600,
                    color: OG_COLOURS.muted,
                  }}
                >
                  {column.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Frame>
  );
}
