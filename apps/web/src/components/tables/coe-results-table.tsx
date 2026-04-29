"use client";

import { DataTable } from "@motormetrics/ui/components/data-table";
import { columns } from "@web/components/tables/columns/coe-results-columns";
import type { COEResult } from "@web/types";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { useCallback, useMemo } from "react";

interface TrendTableProps {
  coeResults: COEResult[];
}

const defaultCategories = ["Category A", "Category B", "Category E"];

export function TrendTable({ coeResults }: TrendTableProps) {
  const [categories] = useQueryState(
    "categories",
    parseAsArrayOf(parseAsString).withDefault(defaultCategories),
  );

  const sortCOEResults = useCallback((a: COEResult, b: COEResult) => {
    if (a.month !== b.month) {
      return b.month.localeCompare(a.month);
    }

    if (a.biddingNo !== b.biddingNo) {
      return b.biddingNo - a.biddingNo;
    }

    return a.vehicleClass.localeCompare(b.vehicleClass);
  }, []);

  const sortedData = useMemo(
    () =>
      coeResults
        .filter(({ vehicleClass }) => categories.includes(vehicleClass))
        .sort(sortCOEResults),
    [categories, coeResults, sortCOEResults],
  );

  return <DataTable columns={columns} data={sortedData} />;
}
