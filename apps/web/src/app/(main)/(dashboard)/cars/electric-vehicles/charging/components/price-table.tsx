"use client";

import { Button, Typography } from "@heroui/react";
import { DataGrid, type DataGridColumn } from "@heroui-pro/react";
import {
  MAP_ANCHOR_ID,
  siteParam,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/search-params";
import { MapPin } from "lucide-react";
import { useQueryState } from "nuqs";

export interface PriceRow {
  /** "Tampines · 2× DC 120 kW". */
  detail: string;
  locationId: string;
  pricePerKwh: number;
  rank: number;
  title: string;
}

/**
 * The ranked per-kWh rates. "Map" selects the site in the URL, which the map
 * picks up to fly there and open its popup.
 */
export function PriceTable({
  label,
  rows,
}: {
  label: string;
  rows: PriceRow[];
}) {
  const [, setSite] = useQueryState("site", siteParam);

  const columns: DataGridColumn<PriceRow>[] = [
    {
      cell: (row) => (
        <span className="flex min-w-0 items-center gap-2">
          <Typography.Paragraph
            className="w-6 shrink-0 tabular-nums"
            color="muted"
            size="sm"
          >
            {row.rank}
          </Typography.Paragraph>
          {/* Wraps rather than truncates, so a phone keeps the price column
              in view without scrolling the table sideways. */}
          <span className="flex min-w-0 flex-col whitespace-normal break-words">
            <Typography.Paragraph size="sm" weight="medium">
              {row.title}
            </Typography.Paragraph>
            <Typography.Paragraph color="muted" size="xs">
              {row.detail}
            </Typography.Paragraph>
          </span>
        </span>
      ),
      header: "Site",
      id: "site",
      isRowHeader: true,
      minWidth: 160,
    },
    {
      align: "end",
      cell: (row) => (
        <Typography.Paragraph className="text-end tabular-nums" size="sm">
          ${row.pricePerKwh.toFixed(2)}
        </Typography.Paragraph>
      ),
      header: "Per kWh",
      id: "price",
      width: 80,
    },
    {
      align: "end",
      cell: (row) => (
        <Button
          aria-label={`Show ${row.title} on the map`}
          isIconOnly
          onPress={() => {
            setSite(row.locationId);
            document
              .getElementById(MAP_ANCHOR_ID)
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          size="sm"
          variant="ghost"
        >
          <MapPin aria-hidden className="size-4" />
        </Button>
      ),
      header: <span className="sr-only">Map</span>,
      id: "map",
      width: 48,
    },
  ];

  return (
    <DataGrid
      aria-label={label}
      columns={columns}
      data={rows}
      getRowId={(row) => row.locationId}
      renderEmptyState={() => "No chargers with a per-kWh price here yet."}
      variant="secondary"
    />
  );
}
