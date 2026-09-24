import type { COECategory, VehicleType } from "@motormetrics/types";
import type { LucideIcon } from "lucide-react";

export type { COECategory, VehicleType };

export interface COEResult {
  month: string;
  biddingNo: number;
  vehicleClass: COECategory;
  quota: number;
  bidsSuccess: number;
  bidsReceived: number;
  premium: number;
}

export type Make = string;

export type Month = string;

export interface LinkItem {
  label: string;
  href: string;
  description?: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
}

export interface Announcement {
  content: string;
  paths?: string[];
}

export type { Pqp } from "@web/types/coe";
