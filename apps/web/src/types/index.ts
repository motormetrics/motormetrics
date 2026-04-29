import type { COECategory, VehicleType } from "@motormetrics/types";
import type { LucideIcon } from "lucide-react";

export type { COECategory, VehicleType };

export type Dataset = {
  name: string;
  data: number[];
};

export interface ChartDataset extends Dataset {
  checked: boolean;
}

export interface TabItem {
  title: string;
  href: string;
}

export type COECategoryFilter = Record<COECategory, boolean>;

export interface COEResult {
  month: string;
  biddingNo: number;
  vehicleClass: COECategory;
  quota: number;
  bidsSuccess: number;
  bidsReceived: number;
  premium: number;
}

export interface COEBiddingResult {
  month: string;
  biddingNo: number;
  "Category A": number;
  "Category B": number;
  "Category C": number;
  "Category D": number;
  "Category E": number;
}

export enum RevalidateTags {
  // Core data types
  Cars = "cars",
  COE = "coe",

  // Time-based tags
  Latest = "latest",
  Monthly = "monthly",

  // Feature-based tags
  Analysis = "analysis",
  Blog = "blog",
  Comparison = "comparison",
  MarketShare = "market-share",
  TopPerformers = "top-performers",
  Reference = "reference",

  // Legacy compatibility
  API = "api",
}

export type Make = string;

export interface MakeStats {
  count: number;
  share: number;
  trend: { value: number }[];
  yoyChange: number | null;
}

export interface MakesSummary {
  totalMakes: number;
  totalRegistrations: number;
  marketLeader: string;
}

export type Month = string;

export interface LinkItem {
  label: string;
  href: string;
  description?: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
}

export * from "./blog";

export interface TypeItem {
  name: string;
  count: number;
}

export interface CategoryData {
  month: string;
  total: number;
  fuelType: TypeItem[];
  vehicleType: TypeItem[];
}

export interface Announcement {
  content: string;
  paths?: string[];
}

export type { Pqp } from "./coe";
