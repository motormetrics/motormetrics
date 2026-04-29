"use client";

import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { Pagination } from "@heroui/pagination";
import { Select, SelectItem } from "@heroui/select";
import {
  type SortDescriptor,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { cn } from "@heroui/theme";
import type { SelectCarCost } from "@motormetrics/database";
import { formatCurrency } from "@motormetrics/utils";
import { CostLegend } from "@web/app/(main)/(explore)/cars/costs/components/cost-legend";
import { FUEL_TYPE_LABELS } from "@web/app/(main)/(explore)/cars/costs/constants";
import Typography from "@web/components/typography";
import { sortByDescriptor } from "@web/utils/sort";
import { Search } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { type Key, useCallback, useMemo, useState } from "react";

interface CostTableProps {
  data: SelectCarCost[];
}

const columns = [
  { key: "make", label: "Make" },
  { key: "model", label: "Model" },
  { key: "fuelType", label: "Fuel Type" },
  { key: "vesBanding", label: "VES Band" },
  { key: "omv", label: "OMV" },
  { key: "arf", label: "ARF" },
  { key: "vesSurchargeRebate", label: "VES" },
  { key: "coePremium", label: "COE" },
  { key: "totalBasicCostWithoutCoe", label: "Basic Cost (w/o COE)" },
  { key: "totalBasicCostWithCoe", label: "Basic Cost (w/ COE)" },
  { key: "sellingPriceWithoutCoe", label: "Selling Price (w/o COE)" },
  { key: "sellingPriceWithCoe", label: "Selling Price (w/ COE)" },
];

const ROWS_PER_PAGE = 20;

const FUEL_TYPE_COLORS: Record<
  string,
  "success" | "primary" | "secondary" | "warning" | "default"
> = {
  E: "success",
  H: "primary",
  R: "secondary",
  P: "warning",
};

const VES_BAND_COLORS: Record<
  string,
  "success" | "primary" | "warning" | "danger" | "default"
> = {
  A: "success",
  B: "primary",
  C1: "warning",
  C2: "warning",
  C3: "danger",
};

export function CostTable({ data }: CostTableProps) {
  const [search, setSearch] = useQueryState(
    "q",
    parseAsString
      .withDefault("")
      .withOptions({ shallow: true, throttleMs: 300 }),
  );
  const [makeFilter, setMakeFilter] = useQueryState(
    "make",
    parseAsString.withDefault("").withOptions({ shallow: true }),
  );
  const [fuelFilter, setFuelFilter] = useQueryState(
    "fuel",
    parseAsString.withDefault("").withOptions({ shallow: true }),
  );
  const [page, setPage] = useState(1);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "sellingPriceWithCoe",
    direction: "ascending",
  });

  const makes = useMemo(
    () =>
      [...new Set(data.map((item) => item.make))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [data],
  );
  const fuelTypes = useMemo(
    () =>
      [...new Set(data.map((item) => item.fuelType).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b),
      ),
    [data],
  );

  const filteredData = useMemo(() => {
    let result = data;

    if (search) {
      const query = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.make.toLowerCase().includes(query) ||
          item.model.toLowerCase().includes(query),
      );
    }

    if (makeFilter) {
      result = result.filter((item) => item.make === makeFilter);
    }

    if (fuelFilter) {
      result = result.filter((item) => item.fuelType === fuelFilter);
    }

    return result;
  }, [data, search, makeFilter, fuelFilter]);

  const sortedData = useMemo(
    () => sortByDescriptor(filteredData, sortDescriptor),
    [filteredData, sortDescriptor],
  );

  const pages = Math.ceil(sortedData.length / ROWS_PER_PAGE);
  const effectivePage = Math.min(page, Math.max(pages, 1));
  const paginatedData = useMemo(() => {
    const start = (effectivePage - 1) * ROWS_PER_PAGE;
    return sortedData.slice(start, start + ROWS_PER_PAGE);
  }, [sortedData, effectivePage]);

  const renderCell = useCallback((item: SelectCarCost, columnKey: Key) => {
    switch (columnKey) {
      case "make":
        return item.make;
      case "model":
        return item.model;
      case "fuelType":
        return (
          <Chip
            size="sm"
            variant="flat"
            color={FUEL_TYPE_COLORS[item.fuelType ?? ""] ?? "default"}
          >
            {FUEL_TYPE_LABELS[item.fuelType ?? ""] ?? item.fuelType}
          </Chip>
        );
      case "vesBanding":
        return (
          <Chip
            size="sm"
            variant="flat"
            color={VES_BAND_COLORS[item.vesBanding] ?? "default"}
          >
            {item.vesBanding}
          </Chip>
        );
      case "omv":
        return formatCurrency(item.omv);
      case "arf":
        return formatCurrency(item.arf);
      case "vesSurchargeRebate":
        return (
          <span
            className={cn(
              "font-medium",
              item.vesSurchargeRebate < 0 ? "text-success" : "text-danger",
            )}
          >
            {formatCurrency(item.vesSurchargeRebate)}
          </span>
        );
      case "coePremium":
        return formatCurrency(item.coePremium);
      case "totalBasicCostWithoutCoe":
        return formatCurrency(item.totalBasicCostWithoutCoe);
      case "totalBasicCostWithCoe":
        return (
          <span className="font-semibold">
            {formatCurrency(item.totalBasicCostWithCoe)}
          </span>
        );
      case "sellingPriceWithoutCoe":
        return item.sellingPriceWithoutCoe
          ? formatCurrency(item.sellingPriceWithoutCoe)
          : "-";
      case "sellingPriceWithCoe":
        return item.sellingPriceWithCoe ? (
          <span className="font-semibold">
            {formatCurrency(item.sellingPriceWithCoe)}
          </span>
        ) : (
          "-"
        );
      default:
        return null;
    }
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Typography.H4>All Models</Typography.H4>
        <Typography.TextSm className="text-default-500">
          {filteredData.length} models found
        </Typography.TextSm>
      </div>
      <CostLegend />
      <div className="flex w-full flex-col gap-4 sm:flex-row">
        <Input
          type="search"
          placeholder="Search make or model..."
          value={search}
          onValueChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          startContent={<Search className="size-4 text-default-400" />}
          className="sm:max-w-xs"
        />
        <Select
          placeholder="All Makes"
          selectedKeys={makeFilter ? [makeFilter] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string | undefined;
            setMakeFilter(selected ?? "");
            setPage(1);
          }}
          className="sm:max-w-[200px]"
          aria-label="Filter by make"
        >
          {makes.map((make) => (
            <SelectItem key={make}>{make}</SelectItem>
          ))}
        </Select>
        <Select
          placeholder="All Fuel Types"
          selectedKeys={fuelFilter ? [fuelFilter] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string | undefined;
            setFuelFilter(selected ?? "");
            setPage(1);
          }}
          className="sm:max-w-[240px]"
          aria-label="Filter by fuel type"
        >
          {fuelTypes.map((fuelType) => (
            <SelectItem key={fuelType}>
              {FUEL_TYPE_LABELS[fuelType] ?? fuelType}
            </SelectItem>
          ))}
        </Select>
      </div>
      <Table
        aria-label="Car cost breakdown table"
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
        bottomContent={
          pages > 1 ? (
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                page={effectivePage}
                total={pages}
                onChange={setPage}
              />
            </div>
          ) : null
        }
        bottomContentPlacement="outside"
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.key}
              allowsSorting={!["fuelType", "vesBanding"].includes(column.key)}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={paginatedData}>
          {(item) => (
            <TableRow key={`${item.make}-${item.model}`}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
