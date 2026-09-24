import { getCarsMonths } from "@web/queries/cars";
import { getCarsLatestMonth } from "@web/queries/cars/latest-month";
import { getCoeMonths } from "@web/queries/coe";
import { getCOELatestMonth } from "@web/queries/coe/latest-month";
import {
  getDeregistrationsLatestMonth,
  getDeregistrationsMonths,
} from "@web/queries/deregistrations";
import type { Month } from "@web/types";

type DataType = "cars" | "coe" | "deregistrations";

export interface MonthResult {
  month: string;
  wasAdjusted: boolean;
}

export async function fetchMonthsForCars(): Promise<Month[]> {
  const results = await getCarsMonths();
  return results.map((result) => result.month);
}

async function fetchMonthsForCOE(): Promise<Month[]> {
  const results = await getCoeMonths();
  return results.map((result) => result.month);
}

export async function fetchMonthsForDeregistrations(): Promise<Month[]> {
  const results = await getDeregistrationsMonths();
  return results.map((result) => result.month);
}

export async function getLatestMonth(type: DataType = "cars"): Promise<string> {
  let latestMonth: string | null = null;

  if (type === "cars") {
    latestMonth = await getCarsLatestMonth();
  } else if (type === "coe") {
    latestMonth = await getCOELatestMonth();
  } else if (type === "deregistrations") {
    const result = await getDeregistrationsLatestMonth();
    latestMonth = result?.month ?? null;
  }

  if (!latestMonth) {
    throw new Error(`No ${type} data available`);
  }

  return latestMonth;
}

async function getMonthsForType(type: DataType): Promise<string[]> {
  if (type === "cars") return fetchMonthsForCars();
  if (type === "coe") return fetchMonthsForCOE();
  return fetchMonthsForDeregistrations();
}

export async function getMonthOrLatest(
  month: string | null,
  type: DataType = "cars",
): Promise<MonthResult> {
  if (!month) {
    const latestMonth = await getLatestMonth(type);
    return { month: latestMonth, wasAdjusted: false };
  }

  // Validate month exists in available list
  const [latestMonth, months] = await Promise.all([
    getLatestMonth(type),
    getMonthsForType(type),
  ]);
  if (months.includes(month)) {
    return { month, wasAdjusted: false };
  }

  // Month not available for this data source
  return { month: latestMonth, wasAdjusted: true };
}
