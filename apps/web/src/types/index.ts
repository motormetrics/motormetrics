import type { COECategory, VehicleType } from "@motormetrics/types";

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

export interface Announcement {
  title: string;
  description?: string;
  paths?: string[];
}

export type { Pqp } from "@web/types/coe";
