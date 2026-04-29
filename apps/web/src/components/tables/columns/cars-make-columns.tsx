"use client";

import { Button } from "@heroui/button";
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
          variant="light"
          onPress={() => column.toggleSorting(column.getIsSorted() === "asc")}
          endContent={<ArrowUpDown className="size-4" />}
        >
          Month
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
