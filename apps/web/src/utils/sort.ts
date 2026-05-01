import type { SortDescriptor } from "@heroui/react";
import { SortDirection, sortByName, sortByValue } from "@motormetrics/utils";

export function sortByDescriptor<T extends Record<string, unknown>>(
  data: T[],
  descriptor: SortDescriptor,
): T[] {
  const sortKey = descriptor.column as keyof T;
  const direction =
    descriptor.direction === "ascending"
      ? SortDirection.ASC
      : SortDirection.DESC;

  const sample = data[0]?.[sortKey];
  if (typeof sample === "number") {
    return sortByValue(data, { sortKey, direction });
  }
  return sortByName(data, { sortKey, direction });
}
