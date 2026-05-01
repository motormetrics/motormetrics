"use client";

import { Button } from "@heroui/react";

import type { SelectCar } from "@motormetrics/database";
import { slugify } from "@motormetrics/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { formatVehicleType } from "@web/utils/formatting/format-vehicle-type";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";

export const columns: ColumnDef<Partial<SelectCar>>[] = [
  {
    accessorKey: "month",
    header: ({ column }) => {
      return (
        <Button
          variant="tertiary"
          onPress={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Month
          <ArrowUpDown className="size-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "fuelType",
    header: "Fuel Type",
    cell: ({ row }) => {
      const fuelType: string = row.getValue("fuelType");
      return (
        <Link href={`/cars/fuel-types/${slugify(fuelType)}`}>{fuelType}</Link>
      );
    },
  },
  {
    accessorKey: "vehicleType",
    header: "Vehicle Type",
    cell: ({ row }) => {
      const vehicleType: string = row.getValue("vehicleType");
      return (
        <Link href={`/cars/vehicle-types/${slugify(vehicleType)}`}>
          {formatVehicleType(vehicleType)}
        </Link>
      );
    },
  },
  {
    accessorKey: "count",
    header: "Count",
  },
];
