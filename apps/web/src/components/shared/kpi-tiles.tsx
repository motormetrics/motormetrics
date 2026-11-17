import { KPI } from "@heroui-pro/react/kpi";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

/** One headline number on a dashboard page. */
export interface KpiTile {
  /**
   * The change on the previous period, in percent, or in points for a
   * `percent` tile. `label` names what it is against, when `note` does not.
   */
  change?: { label?: string; value: number };
  format: "currency" | "count" | "percent";
  /** The page holding the full series; the tile links there when set. */
  href?: Route;
  /** The period or exercise the value is for. */
  note: string;
  title: string;
  /** Oldest first. Drawn as a sparkline when there are two or more points. */
  trend?: number[];
  value: number;
}

const direction = (change: number) =>
  change > 0 ? "up" : change < 0 ? "down" : "neutral";

/** "+2.4%", "−0.8 pts", with a true minus for a fall. */
const signedChange = (value: number, unit: string) =>
  `${value < 0 ? "−" : "+"}${Math.abs(value).toFixed(1)}${unit}`;

/**
 * KPI.Chart's y-axis starts at zero, which flattens a series moving in a
 * narrow band, so each series is plotted above its own low.
 */
const sparkline = (values: number[]) => {
  const low = Math.min(...values);
  return values.map((value) => ({ value: value - low }));
};

function KpiCard({ tile }: { tile: KpiTile }) {
  return (
    <KPI
      className={
        tile.href
          ? "h-full transition-colors hover:bg-surface-secondary"
          : "h-full"
      }
    >
      <KPI.Header>
        <KPI.Title>{tile.title}</KPI.Title>
      </KPI.Header>
      <KPI.Content>
        <KPI.Value
          currency={tile.format === "currency" ? "SGD" : undefined}
          locale="en-SG"
          maximumFractionDigits={tile.format === "percent" ? 1 : 0}
          style={tile.format === "count" ? "decimal" : tile.format}
          value={tile.format === "percent" ? tile.value / 100 : tile.value}
        />
        {tile.change ? (
          <KPI.Trend trend={direction(tile.change.value)}>
            {signedChange(
              tile.change.value,
              tile.format === "percent" ? " pts" : "%",
            )}
          </KPI.Trend>
        ) : null}
      </KPI.Content>
      {tile.trend && tile.trend.length > 1 ? (
        <KPI.Chart
          aria-label={`${tile.title}, recent trend`}
          color="var(--chart-1)"
          data={sparkline(tile.trend)}
          height={40}
          role="img"
          strokeWidth={1.75}
        />
      ) : (
        // Holds the sparkline's height, so values line up across the row.
        <div aria-hidden className="h-10" />
      )}
      <KPI.Footer className="text-muted text-xs tabular-nums">
        {tile.change?.label ? `${tile.note} · ${tile.change.label}` : tile.note}
      </KPI.Footer>
    </KPI>
  );
}

/**
 * Grid classes by the number of tiles, so a short row fills its width instead
 * of leaving empty columns. Columns follow the row's own width, not the
 * viewport's, because the sidebar takes a varying share of it and a tile
 * under about 200px pushes its change chip past the edge.
 */
const GRIDS: Record<number, string> = {
  1: "grid grid-cols-1 gap-4",
  2: "grid grid-cols-1 gap-4 @md:grid-cols-2",
  3: "grid grid-cols-1 gap-4 @2xl:grid-cols-3",
  4: "grid grid-cols-1 gap-4 @md:grid-cols-2 @5xl:grid-cols-4",
  5: "grid grid-cols-1 gap-4 @md:grid-cols-2 @2xl:grid-cols-3 @5xl:grid-cols-5",
};

/** One figure across a full set (the five COE categories) is the most a row holds. */
const MAX_TILES = 5;

/**
 * The row of headline numbers under a dashboard page's title. A page shows
 * only the figures that answer its question, so the row holds one to five
 * tiles and spreads them across the full width.
 */
export function KpiTiles({ tiles }: { tiles: KpiTile[] }): ReactNode {
  const shown = tiles.slice(0, MAX_TILES);
  if (shown.length === 0) {
    return null;
  }

  return (
    <div className="@container">
      <ul className={GRIDS[shown.length]}>
        {shown.map((tile) => (
          <li key={tile.title}>
            {tile.href ? (
              <Link
                aria-label={`${tile.title}, open the full figures`}
                className="block h-full no-underline"
                href={tile.href}
              >
                <KpiCard tile={tile} />
              </Link>
            ) : (
              <KpiCard tile={tile} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
