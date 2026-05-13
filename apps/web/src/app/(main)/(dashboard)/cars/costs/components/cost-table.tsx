"use client";

import {
  Chip,
  cn,
  Input,
  Label,
  ListBox,
  Pagination,
  Select,
  type SortDescriptor,
  Table,
  Text,
} from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";

import type { SelectCarCost } from "@motormetrics/database";
import { CostLegend } from "@web/app/(main)/(dashboard)/cars/costs/components/cost-legend";
import { FUEL_TYPE_LABELS } from "@web/app/(main)/(dashboard)/cars/costs/constants";
import { sortByDescriptor } from "@web/utils/sort";
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
  "success" | "accent" | "warning" | "default"
> = {
  E: "success",
  H: "accent",
  R: "default",
  P: "warning",
};

const VES_BAND_COLORS: Record<
  string,
  "success" | "accent" | "warning" | "danger" | "default"
> = {
  A: "success",
  B: "accent",
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
            variant="primary"
            color={FUEL_TYPE_COLORS[item.fuelType ?? ""] ?? "default"}
          >
            {FUEL_TYPE_LABELS[item.fuelType ?? ""] ?? item.fuelType}
          </Chip>
        );
      case "vesBanding":
        return (
          <Chip
            size="sm"
            variant="primary"
            color={VES_BAND_COLORS[item.vesBanding] ?? "default"}
          >
            {item.vesBanding}
          </Chip>
        );
      case "omv":
        return (
          <NumberValue
            currency="SGD"
            locale="en-SG"
            maximumFractionDigits={0}
            style="currency"
            value={item.omv}
          />
        );
      case "arf":
        return (
          <NumberValue
            currency="SGD"
            locale="en-SG"
            maximumFractionDigits={0}
            style="currency"
            value={item.arf}
          />
        );
      case "vesSurchargeRebate":
        return (
          <span
            className={cn(
              "font-medium",
              item.vesSurchargeRebate < 0 ? "text-success" : "text-danger",
            )}
          >
            <NumberValue
              currency="SGD"
              locale="en-SG"
              maximumFractionDigits={0}
              style="currency"
              value={item.vesSurchargeRebate}
            />
          </span>
        );
      case "coePremium":
        return (
          <NumberValue
            currency="SGD"
            locale="en-SG"
            maximumFractionDigits={0}
            style="currency"
            value={item.coePremium}
          />
        );
      case "totalBasicCostWithoutCoe":
        return (
          <NumberValue
            currency="SGD"
            locale="en-SG"
            maximumFractionDigits={0}
            style="currency"
            value={item.totalBasicCostWithoutCoe}
          />
        );
      case "totalBasicCostWithCoe":
        return (
          <span className="font-semibold">
            <NumberValue
              currency="SGD"
              locale="en-SG"
              maximumFractionDigits={0}
              style="currency"
              value={item.totalBasicCostWithCoe}
            />
          </span>
        );
      case "sellingPriceWithoutCoe":
        return item.sellingPriceWithoutCoe ? (
          <NumberValue
            currency="SGD"
            locale="en-SG"
            maximumFractionDigits={0}
            style="currency"
            value={item.sellingPriceWithoutCoe}
          />
        ) : (
          "-"
        );
      case "sellingPriceWithCoe":
        return item.sellingPriceWithCoe ? (
          <span className="font-semibold">
            <NumberValue
              currency="SGD"
              locale="en-SG"
              maximumFractionDigits={0}
              style="currency"
              value={item.sellingPriceWithCoe}
            />
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
        <Text type="h4">All Models</Text>
        <Text type="body-sm" color="muted">
          {filteredData.length} models found
        </Text>
      </div>
      <CostLegend />
      <div className="flex w-full flex-col gap-4 sm:flex-row">
        <Input
          type="search"
          placeholder="Search make or model..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          className="sm:max-w-xs"
        />
        <Select
          placeholder="All Makes"
          value={makeFilter || "all"}
          onChange={(selected) => {
            setMakeFilter(selected === "all" ? "" : String(selected));
            setPage(1);
          }}
          className="sm:max-w-[200px]"
        >
          <Label className="sr-only">Filter by make</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="all" textValue="All Makes">
                All Makes
                <ListBox.ItemIndicator />
              </ListBox.Item>
              {makes.map((make) => (
                <ListBox.Item key={make} id={make} textValue={make}>
                  {make}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
        <Select
          placeholder="All Fuel Types"
          value={fuelFilter || "all"}
          onChange={(selected) => {
            setFuelFilter(selected === "all" ? "" : String(selected));
            setPage(1);
          }}
          className="sm:max-w-[240px]"
        >
          <Label className="sr-only">Filter by fuel type</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="all" textValue="All Fuel Types">
                All Fuel Types
                <ListBox.ItemIndicator />
              </ListBox.Item>
              {fuelTypes.map((fuelType) => {
                const label = FUEL_TYPE_LABELS[fuelType] ?? fuelType;
                return (
                  <ListBox.Item key={fuelType} id={fuelType} textValue={label}>
                    {label}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                );
              })}
            </ListBox>
          </Select.Popover>
        </Select>
      </div>
      <Table>
        <Table.ScrollContainer>
          <Table.Content
            aria-label="Car cost breakdown table"
            sortDescriptor={sortDescriptor}
            onSortChange={setSortDescriptor}
          >
            <Table.Header>
              {columns.map((column, index) => (
                <Table.Column
                  key={column.key}
                  id={column.key}
                  isRowHeader={index === 0}
                  allowsSorting={
                    !["fuelType", "vesBanding"].includes(column.key)
                  }
                >
                  {column.label}
                </Table.Column>
              ))}
            </Table.Header>
            <Table.Body>
              {paginatedData.map((item) => (
                <Table.Row
                  key={`${item.make}-${item.model}`}
                  id={`${item.make}-${item.model}`}
                >
                  {columns.map((column) => (
                    <Table.Cell key={column.key}>
                      {renderCell(item, column.key)}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
        <Table.Footer>
          {pages > 1 ? (
            <div className="flex w-full justify-center">
              <Pagination size="sm">
                <Pagination.Content>
                  <Pagination.Item>
                    <Pagination.Previous
                      isDisabled={effectivePage === 1}
                      onPress={() =>
                        setPage((current) => Math.max(current - 1, 1))
                      }
                    >
                      <Pagination.PreviousIcon />
                      Prev
                    </Pagination.Previous>
                  </Pagination.Item>
                  {Array.from({ length: pages }, (_, index) => index + 1).map(
                    (pageNumber) => (
                      <Pagination.Item key={pageNumber}>
                        <Pagination.Link
                          isActive={pageNumber === effectivePage}
                          onPress={() => setPage(pageNumber)}
                        >
                          {pageNumber}
                        </Pagination.Link>
                      </Pagination.Item>
                    ),
                  )}
                  <Pagination.Item>
                    <Pagination.Next
                      isDisabled={effectivePage === pages}
                      onPress={() =>
                        setPage((current) => Math.min(current + 1, pages))
                      }
                    >
                      Next
                      <Pagination.NextIcon />
                    </Pagination.Next>
                  </Pagination.Item>
                </Pagination.Content>
              </Pagination>
            </div>
          ) : null}
        </Table.Footer>
      </Table>
    </div>
  );
}
